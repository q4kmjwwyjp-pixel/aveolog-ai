/**
 * Rutas de la API REST para AveoLog AI
 */

import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import {
  evaluateMaintenanceWithAI,
  analyzeFuelDropAnomaly,
  chatCopilotMecanico,
  generateOverallHealthStatus,
  analyzeDashboardImageWithAI
} from './geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Cargar la ficha técnica
const specsPath = path.join(__dirname, '../src/data/aveo2011-specs.json');
let aveoSpecs = {};
try {
  aveoSpecs = JSON.parse(fs.readFileSync(specsPath, 'utf8'));
} catch (e) {
  console.error("Error leyendo specs en routes:", e);
}

// 1. Ficha Técnica Oficial del Aveo 2011
router.get('/specs', (req, res) => {
  res.json({ success: true, data: aveoSpecs });
});

// 2. Perfil y Odómetro del Carro
router.get('/car', async (req, res) => {
  try {
    const profile = await db.getCarProfile();
    res.json({ success: true, data: profile });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/car', async (req, res) => {
  try {
    const updated = await db.updateCarProfile(req.body);
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 3. Módulo de Combustible
router.get('/fuel', async (req, res) => {
  try {
    const logs = await db.getFuelLogs();
    
    // Calcular estadísticas
    let totalKm = 0;
    let totalLiters = 0;
    let totalCost = 0;
    const historyKml = [];

    const sortedAsc = [...logs].sort((a, b) => a.odometer - b.odometer);
    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = sortedAsc[i - 1];
      const curr = sortedAsc[i];
      const dist = curr.odometer - prev.odometer;
      if (dist > 0 && curr.liters > 0) {
        const kml = parseFloat((dist / curr.liters).toFixed(2));
        historyKml.push({ date: curr.date, kml, odo: curr.odometer });
        totalKm += dist;
        totalLiters += curr.liters;
        totalCost += curr.totalCost;
      }
    }

    const avgKml = totalLiters > 0 ? parseFloat((totalKm / totalLiters).toFixed(2)) : 11.5;
    const costPerKm = totalKm > 0 ? parseFloat((totalCost / totalKm).toFixed(2)) : 2.10;
    const estimatedRange = Math.round(45.0 * 0.75 * avgKml);

    res.json({
      success: true,
      data: {
        logs,
        stats: {
          avgKml,
          costPerKm,
          estimatedRange,
          totalFillups: logs.length,
          historyKml
        }
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/fuel', async (req, res) => {
  try {
    const { odometer, liters, totalCost, pricePerLiter, fuelType, isFullTank, station, notes } = req.body;

    const odoNum = parseInt(odometer, 10);
    const litNum = parseFloat(liters);
    const costNum = parseFloat(totalCost);
    const priceNum = pricePerLiter ? parseFloat(pricePerLiter) : (costNum / litNum);

    // Obtener cargas previas para calcular km/L
    const previousLogs = await db.getFuelLogs();
    const sortedAsc = [...previousLogs].sort((a, b) => a.odometer - b.odometer);
    
    let calculatedKml = null;
    let costPerKm = null;
    let aiAnomalyNote = null;

    if (sortedAsc.length > 0) {
      const last = sortedAsc[sortedAsc.length - 1];
      const dist = odoNum - last.odometer;
      if (dist > 0 && litNum > 0) {
        calculatedKml = parseFloat((dist / litNum).toFixed(2));
        costPerKm = parseFloat((costNum / dist).toFixed(2));

        // Calcular promedio previo
        let pKm = 0, pLit = 0;
        for (let i = 1; i < sortedAsc.length; i++) {
          pKm += sortedAsc[i].odometer - sortedAsc[i-1].odometer;
          pLit += sortedAsc[i].liters;
        }
        const historicalAvg = pLit > 0 ? (pKm / pLit) : 11.8;

        // ALERTA >15% DE CAÍDA EN RENDIMIENTO
        if (calculatedKml < historicalAvg * 0.85) {
          console.log(`Detectada anomalía de combustible: ${calculatedKml} vs promedio ${historicalAvg.toFixed(2)} (-15%)`);
          aiAnomalyNote = await analyzeFuelDropAnomaly(calculatedKml, parseFloat(historicalAvg.toFixed(2)), {
            fuelType: fuelType || "Magna",
            notes: notes || ""
          });
        }
      }
    }

    const newLog = await db.addFuelLog({
      odometer: odoNum,
      liters: litNum,
      totalCost: costNum,
      pricePerLiter: parseFloat(priceNum.toFixed(2)),
      fuelType: fuelType || "Magna",
      isFullTank: isFullTank !== undefined ? isFullTank : true,
      calculatedKml,
      costPerKm,
      station: station || "Estación de servicio",
      notes: notes || "",
      aiAnomalyNote,
      date: req.body.date ? new Date(req.body.date) : new Date()
    });

    res.json({ success: true, data: newLog, anomalyAlert: !!aiAnomalyNote });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 4. Módulo de Bitácora de Mantenimiento con Evaluación Gemini AI
router.get('/maintenance', async (req, res) => {
  try {
    const logs = await db.getMaintenanceLogs();
    res.json({ success: true, data: logs });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/maintenance', async (req, res) => {
  try {
    const { odometer, category, title, description, partsUsed, cost, provider } = req.body;
    const odoNum = parseInt(odometer, 10);
    const costNum = parseFloat(cost) || 0;

    const previousLogs = await db.getMaintenanceLogs();
    const carProfile = await db.getCarProfile();

    // Invocar Evaluación con Gemini 2.5 Flash con Structured Outputs (JSON Schema)
    const aiEvaluation = await evaluateMaintenanceWithAI({
      odometer: odoNum,
      category,
      title,
      description,
      partsUsed,
      cost: costNum
    }, previousLogs, carProfile.currentOdometer);

    const newLog = await db.addMaintenanceLog({
      odometer: odoNum,
      category: category || "Preventivo",
      title,
      description,
      partsUsed: partsUsed || "",
      cost: costNum,
      provider: provider || "Taller Mecánico",
      aiImpact: aiEvaluation.impacto,
      aiPriceRating: aiEvaluation.calificacion_precio,
      aiTechnicalAnalysis: aiEvaluation.analisis_tecnico,
      aiRelatedParts: aiEvaluation.piezas_relacionadas,
      aiNextServiceKm: aiEvaluation.proximo_servicio_km,
      aiEvaluatedAt: new Date(),
      date: req.body.date ? new Date(req.body.date) : new Date()
    });

    res.json({ success: true, data: newLog, evaluation: aiEvaluation });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 5. Copiloto Mecánico "Pregúntale al Aveo"
router.get('/ai/chat-history', async (req, res) => {
  try {
    const messages = await db.getChatMessages();
    res.json({ success: true, data: messages });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Mensaje vacío" });
    }

    // Guardar mensaje del usuario
    await db.addChatMessage({ role: "user", content: message });

    const chatHistory = await db.getChatMessages();
    const allMaintenance = await db.getMaintenanceLogs();
    const allFuel = await db.getFuelLogs();
    const carProfile = await db.getCarProfile();

    // Obtener respuesta del Copiloto
    const replyText = await chatCopilotMecanico(message, chatHistory, allMaintenance, allFuel, carProfile);

    // Guardar respuesta del modelo
    const modelMsg = await db.addChatMessage({ role: "model", content: replyText });

    res.json({ success: true, data: modelMsg });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 6. Semáforo de Salud General
router.get('/ai/health', async (req, res) => {
  try {
    const carProfile = await db.getCarProfile();
    const maintenance = await db.getMaintenanceLogs();
    const fuel = await db.getFuelLogs();

    const health = await generateOverallHealthStatus(maintenance, fuel, carProfile.currentOdometer);
    res.json({ success: true, data: health });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 6.5 Escáner Multimodal Efímero de Tablero (NO guarda la foto, solo extrae los datos y la descarta)
router.post('/ai/analyze-dashboard', async (req, res) => {
  try {
    let { imageBase64, mimeType, apiKey } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "No se recibió imagen para analizar." });
    }

    const carProfile = await db.getCarProfile();
    const result = await analyzeDashboardImageWithAI(
      imageBase64,
      mimeType || "image/jpeg",
      carProfile.currentOdometer || 0,
      apiKey || ""
    );

    // Liberar explícitamente la referencia a la imagen en memoria (procesamiento 100% efímero)
    imageBase64 = null;
    req.body.imageBase64 = null;

    res.json({
      success: true,
      imageDiscarded: true,
      message: "Información extraída con éxito. La fotografía fue descartada inmediatamente para ahorrar espacio.",
      data: result
    });
  } catch (e) {
    if (req.body) req.body.imageBase64 = null;
    res.status(500).json({ success: false, error: e.message });
  }
});

// Eliminar registros individuales o resetear base de datos
router.delete('/fuel/:id', async (req, res) => {
  try {
    const out = await db.deleteFuelLog(req.params.id);
    res.json({ success: true, data: out });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.delete('/maintenance/:id', async (req, res) => {
  try {
    const out = await db.deleteMaintenanceLog(req.params.id);
    res.json({ success: true, data: out });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/reset', async (req, res) => {
  try {
    const clean = await db.resetAllData();
    res.json({ success: true, message: "Todos los datos de prueba fueron borrados.", data: clean });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 7. Respaldo (Backup Export & Restore)
router.get('/backup', async (req, res) => {
  try {
    const backup = await db.getFullBackup();
    res.setHeader('Content-Disposition', `attachment; filename=AveoLog_Backup_${Date.now()}.json`);
    res.json(backup);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/backup', async (req, res) => {
  try {
    const restored = await db.restoreBackup(req.body);
    res.json({ success: true, message: "Respaldo restaurado con éxito", data: restored });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
