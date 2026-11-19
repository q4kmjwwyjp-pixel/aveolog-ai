/**
 * Servicio de Inteligencia Artificial con Google Gemini API
 * Modelo: gemini-2.5-flash
 * Soporta Structured Outputs (JSON Schema) para evaluación de bitácora
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar la ficha técnica oficial fija del Aveo 2011
const specsPath = path.join(__dirname, '../src/data/aveo2011-specs.json');
let aveoSpecs = {};
try {
  aveoSpecs = JSON.parse(fs.readFileSync(specsPath, 'utf8'));
} catch (e) {
  console.warn("No se pudo cargar aveo2011-specs.json:", e);
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Función base para invocar Gemini con Fetch nativo (compatible con Node 18+, Vercel, Render)
 */
async function callGeminiRaw(payload) {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY no configurada. Usando respuesta heurística del Aveo.");
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Error en Gemini API (${res.status}):`, errText);
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  return await res.json();
}

/**
 * 1. Evaluación Estructurada de Mantenimiento con JSON Schema
 */
export async function evaluateMaintenanceWithAI(entry, last10Entries = [], currentOdo = 128450) {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;

  // Si no hay API key, retornar evaluación experta offline de respaldo para Aveo 1.6L
  if (!apiKey) {
    return generateLocalMaintenanceEvaluation(entry, currentOdo);
  }

  const prompt = `
Eres el Ingeniero Jefe y Mecánico Experto de Chevrolet, especialista en el Chevrolet Aveo 2011 Sedán 1.6L 16V DOHC (Motor F16D3 / E-TEC II).
Odómetro actual del auto: ${currentOdo} km.

FICHA TÉCNICA OFICIAL DEL VEHÍCULO:
${JSON.stringify(aveoSpecs, null, 2)}

ÚLTIMOS SERVICIOS REGISTRADOS EN LA BITÁCORA:
${JSON.stringify(last10Entries.slice(0, 10), null, 2)}

NUEVA ENTRADA A EVALUAR:
- Categoría: ${entry.category}
- Título: ${entry.title}
- Descripción: ${entry.description}
- Piezas/Fluidos usados: ${entry.partsUsed || 'No especificado'}
- Costo: $${entry.cost} MXN
- Kilometraje del servicio: ${entry.odometer} km

INSTRUCCIONES CRÍTICAS PARA ESTE MOTOR 1.6L DOHC:
1. Recuerda que este motor tiene INTERFERENCIA MECÁNICA: si la banda de distribución falla, se doblan las 16 válvulas.
2. La carcasa del termostato es de plástico y se cristaliza; conviene sugerir cambio a carcasa de aluminio.
3. El aceite correcto es SAE 5W-30 (o 10W-30 en clima cálido) con 3.75 Litros con filtro.
4. Las bujías son NGK BKR6E-11 calibradas a 1.0 - 1.1 mm (fuga frecuente de aceite a los pozos por junta de punterías).
5. Evalúa si el costo en pesos mexicanos ($ MXN) fue Justo, Alto o Bajo para talleres en México.

Responde ÚNICAMENTE en el JSON Schema solicitado.
`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          impacto: {
            type: "STRING",
            enum: ["BUENO", "NORMAL", "MALO", "CRITICO"]
          },
          calificacion_precio: {
            type: "STRING",
            enum: ["Justo", "Alto", "Bajo"]
          },
          analisis_tecnico: {
            type: "STRING",
            description: "Explicación técnica detallada de qué tan bueno o malo es lo realizado o el síntoma reportado para el motor 1.6 DOHC del Aveo."
          },
          piezas_relacionadas: {
            type: "STRING",
            description: "Piezas o componentes que se recomienda inspeccionar aprovechando esta intervención."
          },
          proximo_servicio_km: {
            type: "INTEGER",
            description: "Kilometraje sugerido para volver a revisar o cambiar esta pieza."
          }
        },
        required: ["impacto", "calificacion_precio", "analisis_tecnico", "piezas_relacionadas", "proximo_servicio_km"]
      }
    }
  };

  try {
    const response = await callGeminiRaw(payload);
    const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      return JSON.parse(rawText);
    }
  } catch (e) {
    console.error("Falla procesando Structured Output con Gemini, usando fallback local:", e);
  }

  return generateLocalMaintenanceEvaluation(entry, currentOdo);
}

/**
 * 2. Detección y Análisis de Anomalía en Rendimiento de Gasolina (>15% de caída)
 */
export async function analyzeFuelDropAnomaly(currentKml, avgKml, currentFillup) {
  const dropPercent = Math.round(((avgKml - currentKml) / avgKml) * 100);
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;

  if (!apiKey) {
    return `⚠️ Caída del ${dropPercent}% en rendimiento (${currentKml} km/L vs promedio de ${avgKml} km/L). En el Aveo 2011 1.6L DOHC, las causas más comunes son: 1) Presión de llantas por debajo de 33 PSI, 2) Bujías BKR6E-11 carbonizadas o con aceite en pozos, 3) Filtro de aire obstruido, 4) Sensor de oxígeno Banco 1 lento, o 5) Uso intensivo de A/C en tráfico pesado.`;
  }

  const prompt = `
Se detectó una anomalía en el consumo de gasolina de mi Chevrolet Aveo 2011 1.6L DOHC:
- Rendimiento de esta carga: ${currentKml} km/L
- Promedio histórico del auto: ${avgKml} km/L
- Caída de eficiencia: ${dropPercent}% (Supera el umbral de alerta del 15%)
- Notas del conductor: ${currentFillup.notes || 'Ninguna'}
- Tipo de combustible: ${currentFillup.fuelType}

DATOS DEL VEHÍCULO:
- Motor 1.6L 16V DOHC F16D3 multipunto.
- Presión requerida de llantas en frío: 33 PSI (230 kPa) adelante y atrás.
- Bujías oficiales: NGK BKR6E-11 (1.0 - 1.1 mm).
- Capacidad tanque: 45L.

Genera un diagnóstico técnico concreto en 3 a 4 párrafos cortos para el conductor indicando:
1. Diagnóstico de la anomalía y gravedad.
2. Causas puntuales a verificar en el Aveo (presión a 33 PSI, bujías BKR6E-11, filtro de aire, sensor O2, válvula IAC, fuga de vacío, uso de aire acondicionado).
3. Prueba casera de 5 minutos antes de llevarlo al taller.
`;

  try {
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3 }
    };
    const response = await callGeminiRaw(payload);
    return response?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (e) {
    console.error("Error analizando caída de gasolina con Gemini:", e);
    return `Alerta: Rendimiento ${currentKml} km/L inferior en ${dropPercent}% al promedio. Revisar presión de llantas a 33 PSI, bujías y filtro de aire.`;
  }
}

/**
 * 3. Copiloto Mecánico "Pregúntale al Aveo"
 */
export async function chatCopilotMecanico(userMessage, chatHistory = [], allMaintenance = [], allFuel = [], carProfile = {}) {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;

  if (!apiKey) {
    return generateOfflineCopilotReply(userMessage, allMaintenance, allFuel, carProfile);
  }

  const systemPrompt = `
Eres "Copiloto Aveo AI", el copiloto mecánico y asistente personal oficial del Chevrolet Aveo 2011 Sedán 4 puertas motor 1.6L 16V DOHC (F16D3 / E-TEC II).
Tu dueño te habla desde una PWA en su iPhone. Responde en español de México, con tono profesional, empático, directo y altamente especializado.

FICHA TÉCNICA Y ESPECIFICACIONES EXACTAS DEL MANUAL:
${JSON.stringify(aveoSpecs, null, 2)}

ESTADO ACTUAL DE MI AVEO:
- Odómetro actual: ${carProfile.currentOdometer || 128450} km
- Placas: ${carProfile.plates || 'NL-742-B'}
- Póliza de seguro: ${carProfile.insuranceCompany} (${carProfile.insurancePolicy})
- Teléfono asistencia: ${carProfile.insurancePhone}

HISTORIAL DE LOS ÚLTIMOS MANTENIMIENTOS HECHOS A MI AUTO:
${JSON.stringify(allMaintenance.slice(-8), null, 2)}

ÚLTIMAS CARGAS DE COMBUSTIBLE:
${JSON.stringify(allFuel.slice(-5), null, 2)}

REGLAS DE RESPUESTA:
- Conoce al dedillo la ubicación y amperajes de los fusibles (OBD 10A, Bomba 15A, ECU 10A, Fan 20A/30A, Claxon 15A, Encendedor 15A).
- Conoce los testigos (si HOLD parpadea es falla de transmisión automática o sensor, si Check Engine parpadea es misfire destructivo).
- Si te preguntan cuándo fue el último cambio de aceite o banda, consulta las listas de mantenimiento que te proporcioné arriba.
- Si sugieres piezas o fluidos, di la especificación exacta (ej. SAE 5W-30 API SM 3.75L, bujías BKR6E-11 a 1.1mm, DEX-COOL 6.3L, 33 PSI en frío).
- Mantén tus respuestas claras y con viñetas cuando des pasos de emergencia.
`;

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "Entendido. Soy tu Copiloto Mecánico para el Chevrolet Aveo 2011 1.6L DOHC. Tengo acceso a tu manual oficial y a toda tu bitácora de servicios y combustible. ¿En qué te ayudo hoy con tu Aveo?" }] }
  ];

  // Agregar historial previo
  chatHistory.slice(-8).forEach(msg => {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    });
  });

  // Mensaje actual
  contents.push({
    role: "user",
    parts: [{ text: userMessage }]
  });

  try {
    const payload = {
      contents,
      generationConfig: { temperature: 0.4 }
    };
    const response = await callGeminiRaw(payload);
    return response?.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta en este momento.";
  } catch (e) {
    console.error("Error en Copiloto Gemini:", e);
    return generateOfflineCopilotReply(userMessage, allMaintenance, allFuel, carProfile);
  }
}

/**
 * 4. Semáforo de Salud General Generado por IA
 */
export async function generateOverallHealthStatus(maintenanceList, fuelList, currentOdo) {
  if (!currentOdo || currentOdo <= 0) {
    return {
      score: 100,
      status: "OPTIMO",
      summary: "Bitácora lista. Registra tu kilometraje actual o escanea tu tablero con la cámara para comenzar.",
      timingKmSinceLast: 0,
      oilKmSinceLast: 0
    };
  }

  // Encontrar estado de banda de tiempo
  const timingEntry = maintenanceList.find(m => m.title.toLowerCase().includes("banda") || m.title.toLowerCase().includes("distribuci"));
  const oilEntry = maintenanceList.find(m => m.title.toLowerCase().includes("aceite"));

  let timingKm = timingEntry ? currentOdo - timingEntry.odometer : null;
  let oilKm = oilEntry ? currentOdo - oilEntry.odometer : null;

  let score = 95;
  let status = "OPTIMO";
  let summary = "Motor 1.6L registrado. Agrega tus últimos cambios de aceite y banda de distribución para calcular alertas exactas.";

  if (timingKm !== null && timingKm >= 50000) {
    score = 45;
    status = "CRITICO";
    summary = "¡Urgente! Banda de distribución superó los 50,000 km recomendados. Motor con interferencia.";
  } else if (oilKm !== null && oilKm >= 7500) {
    score = 65;
    status = "ATENCION";
    summary = "Cambio de aceite SAE 5W-30 vencido o próximo a vencer.";
  } else if (timingKm !== null && timingKm >= 42000) {
    score = 75;
    status = "PREVENTIVO";
    summary = "Próximo a cambio preventivo de kit de distribución (banda + bomba + poleas).";
  } else if (timingKm !== null || oilKm !== null) {
    score = 92;
    status = "OPTIMO";
    summary = "Motor 1.6L en buen estado operativo según tus registros reales.";
  }

  return {
    score,
    status, // OPTIMO | PREVENTIVO | ATENCION | CRITICO
    summary,
    timingKmSinceLast: timingKm,
    oilKmSinceLast: oilKm
  };
}

/**
 * 5. Escáner Multimodal Efímero de Tablero (Odómetro, Testigos, Temperatura, Combustible, RPM)
 * Recibe la imagen en memoria (base64), extrae la información estructurada con Gemini 2.5 Flash
 * y descarta inmediatamente la imagen sin guardarla en disco ni en base de datos.
 */
export async function analyzeDashboardImageWithAI(imageBase64, mimeType = "image/jpeg", currentOdo = 0, customApiKey = "") {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta tu GEMINI_API_KEY. Configúrala en el servidor (.env) o en la app para analizar fotos del tablero con IA.");
  }

  // Limpiar prefijo data:image/...;base64, si viene incluido
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

  const prompt = `
Eres el Ingeniero Jefe y Especialista en Telemetría del Chevrolet Aveo 2011 Sedán 1.6L 16V DOHC (Motor F16D3).
Analiza esta fotografía tomada al tablero de instrumentos (cluster) o indicador del vehículo.
Odómetro previo registrado: ${currentOdo} km.

INSTRUCCIONES DE EXTRACCIÓN:
1. Lee con máxima precisión el número del odómetro (kilometraje total en km). Si aparece un odómetro parcial (TRIP) con decimales y el total, extrae el kilometraje total como entero en "odometro_detectado" (o null si no es visible/legible).
2. Identifica TODOS los testigos luminosos encendidos en el tablero (ej. Check Engine / MIL, HOLD parpadeando o fijo, Presión de Aceite, Temperatura, Batería/Alternador, ABS, Airbag, Freno de mano, Puerta abierta, Bajo combustible, etc.).
3. Observa las agujas si son visibles: nivel de gasolina (Vacío, 1/4, 1/2, 3/4, Lleno), aguja de temperatura (Frío, Normal al centro, Caliente/Peligro) y RPM aproximadas.
4. Determina el nivel de alerta global: "OPTIMO", "PREVENTIVO", "ATENCION" o "CRITICO".
5. Da un diagnóstico técnico directo y una recomendación accionable específica para el Chevrolet Aveo 2011 1.6L DOHC.

Responde ÚNICAMENTE en el JSON Schema solicitado.
`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: cleanBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          odometro_detectado: {
            type: "INTEGER",
            nullable: true,
            description: "Kilometraje total leído en el odómetro digital o analógico, o null si no se distingue."
          },
          nivel_combustible_aprox: {
            type: "STRING",
            description: "Nivel aproximado de combustible observado (ej. 'No visible', 'Reserva', '1/4', '1/2', '3/4', 'Lleno')."
          },
          temperatura_motor: {
            type: "STRING",
            description: "Estado de la aguja o indicador de temperatura (ej. 'No visible', 'Frío', 'Normal (Centro)', 'Elevada / Peligro')."
          },
          rpm_aprox: {
            type: "INTEGER",
            nullable: true,
            description: "RPM aproximadas si el tacómetro es visible, o null."
          },
          testigos_encendidos: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Lista de testigos o luces de advertencia encendidos."
          },
          nivel_alerta: {
            type: "STRING",
            enum: ["OPTIMO", "PREVENTIVO", "ATENCION", "CRITICO"]
          },
          diagnostico_tablero: {
            type: "STRING",
            description: "Explicación clara de lo que muestra el tablero y qué significan los testigos o lecturas para el Aveo 2011 1.6L."
          },
          accion_recomendada: {
            type: "STRING",
            description: "Pasos concretos que debe seguir el conductor."
          }
        },
        required: [
          "nivel_combustible_aprox",
          "temperatura_motor",
          "testigos_encendidos",
          "nivel_alerta",
          "diagnostico_tablero",
          "accion_recomendada"
        ]
      }
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error de Gemini Vision (${res.status}): ${errText}`);
  }

  const response = await res.json();
  const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("No se pudo extraer información de la imagen.");
  }

  return JSON.parse(rawText);
}

/**
 * Fallbacks Locales Expertos para Aveo 2011 1.6L (cuando no hay internet o sin API key)
 */
function generateLocalMaintenanceEvaluation(entry, currentOdo) {
  const text = `${entry.title} ${entry.description} ${entry.category}`.toLowerCase();
  
  if (text.includes("banda") || text.includes("distribuc")) {
    return {
      impacto: "BUENO",
      calificacion_precio: entry.cost > 4500 ? "Alto" : (entry.cost < 2500 ? "Bajo" : "Justo"),
      analisis_tecnico: "Intervención de máxima prioridad en el motor F16D3 1.6L DOHC. Al ser un motor de interferencia mecánica, cambiar el kit de banda dentada, bomba de agua y tensores evita roturas de válvulas que costarían más de $15,000 MXN.",
      piezas_relacionadas: "Bomba de agua, retén de árbol de levas y cigüeñal, y banda de accesorios poly-V.",
      proximo_servicio_km: entry.odometer + 50000
    };
  }

  if (text.includes("aceite")) {
    return {
      impacto: "BUENO",
      calificacion_precio: entry.cost > 1600 ? "Alto" : (entry.cost < 700 ? "Bajo" : "Justo"),
      analisis_tecnico: "Esencial para la lubricación de los 16 buzos hidráulicos y árboles de levas del Aveo 1.6L. Utilizar 3.75L de SAE 5W-30 (o 10W-30 en climas extremos) previene el cascabeleo de punterías en frío.",
      piezas_relacionadas: "Filtro de aire, filtro de cabina y verificación de fugas en junta de punterías.",
      proximo_servicio_km: entry.odometer + 6000
    };
  }

  if (text.includes("bujia") || text.includes("chispa") || text.includes("cable")) {
    return {
      impacto: "BUENO",
      calificacion_precio: entry.cost > 1200 ? "Alto" : "Justo",
      analisis_tecnico: "Las bujías NGK BKR6E-11 calibradas exactamente a 1.0 - 1.1 mm previenen códigos P0300 (misfire aleatorio) y jaloneos en subidas.",
      piezas_relacionadas: "Inspeccionar si hay aceite en los tubos de bujías (empaque de punterías) y bobina DIS.",
      proximo_servicio_km: entry.odometer + 20000
    };
  }

  if (text.includes("freno") || text.includes("balata")) {
    return {
      impacto: "BUENO",
      calificacion_precio: entry.cost > 2200 ? "Alto" : "Justo",
      analisis_tecnico: "El sistema de frenos en X del Aveo requiere balatas cerámicas o semimetálicas con rectificado y purgado con líquido DOT 3/4 para evitar pedal esponjoso.",
      piezas_relacionadas: "Líquido de frenos, cilindros de rueda traseros y zapatas de tambor.",
      proximo_servicio_km: entry.odometer + 25000
    };
  }

  return {
    impacto: entry.category === "Falla/Síntoma" ? "MALO" : "NORMAL",
    calificacion_precio: "Justo",
    analisis_tecnico: `Servicio registrado para Chevrolet Aveo 2011 1.6L. Se recomienda registrar marca de refacciones y verificar comportamiento en los próximos 1,000 km.`,
    piezas_relacionadas: "Revisar niveles generales de fluidos (DEX-COOL, 75W-90 / JWS 3309 y líquido de frenos).",
    proximo_servicio_km: entry.odometer + 15000
  };
}

function generateOfflineCopilotReply(msg, allMaintenance, allFuel, carProfile) {
  const m = msg.toLowerCase();
  
  if (m.includes("fusible") && (m.includes("encendedor") || m.includes("cigar") || m.includes("toma"))) {
    return "🔌 El fusible del encendedor / toma corriente de 12V es de **15 Amperios (CIGAR)** y se encuentra en la **caja de fusibles de la cabina interior** (al lado izquierdo del tablero, junto a la puerta del conductor).";
  }

  if (m.includes("fusible") && (m.includes("bomba") || m.includes("gasolina"))) {
    return "⛽ El fusible de la bomba de gasolina es de **15A (F/PUMP)** y se encuentra en la **caja de fusibles del compartimento del motor** (cerca de la batería).";
  }

  if (m.includes("fusible") && (m.includes("obd") || m.includes("escaner"))) {
    return "🔍 El fusible del conector de diagnóstico OBD2 es de **10A** y se ubica en la **caja de fusibles interior de la cabina**.";
  }

  if (m.includes("hold") || m.includes("parpadea")) {
    return "⚠️ **Testigo HOLD parpadeando en Aveo 2011 (Automático):**\nIndica una falla en la transmisión automática de 4 velocidades o en el sensor de rango de transmisión. Pasos inmediatos:\n1. Revisa el nivel de fluido con motor en marcha a temperatura de trabajo (lleva fluido **ESSO JWS 3309 o TOTAL FLUID III G**, capacidad total 5.6 L).\n2. Escanea el módulo TCM para leer códigos de caja.\n3. Evita aceleraciones bruscas para proteger los embragues de la caja.";
  }

  if (m.includes("presion") && m.includes("llanta")) {
    return "🛞 La presión oficial en frío para el Aveo 2011 (tanto para llantas 185/60 R14 como 185/55 R15) es de **33 PSI (230 kPa)** tanto en las ruedas delanteras como traseras.";
  }

  if (m.includes("aceite") && (m.includes("cual") || m.includes("viscosidad") || m.includes("lleva"))) {
    return "🛢️ El Aveo 2011 1.6L DOHC lleva aceite **SAE 5W-30** (clasificación API SM / ILSAC GF-IV o superior). En climas cálidos como Monterrey también se aprueba **10W-30**. La capacidad exacta es de **3.75 Litros con cambio de filtro**.";
  }

  if (m.includes("banda") || m.includes("distribucion")) {
    return "⚠️ **¡Banda de Distribución del Aveo 1.6L!**\nEste motor F16D3 tiene **interferencia mecánica**. Si la banda se rompe o brinca dientes, los pistones doblan las válvulas en la cabeza. El cambio preventivo debe hacerse cada **50,000 km o 3 años**, cambiando siempre el kit completo: banda dentada, bomba de agua, polea tensora y polea loca.";
  }

  return `Hola. Como copiloto del Chevrolet Aveo 2011 1.6L DOHC, te confirmo que tu odómetro actual es de ${carProfile.currentOdometer || 128450} km. Puedes consultarme capacidades de fluidos, fusibles, testigos de alerta o detalles de tu bitácora. (Tip: Si configuras GEMINI_API_KEY podrás hacerme consultas abiertas aún más avanzadas).`;
}
