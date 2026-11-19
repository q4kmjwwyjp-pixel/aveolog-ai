/**
 * Capa de Datos Híbrida: Prisma ORM (PostgreSQL / Neon DB) + Persistencia Local
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Semilla inicial basada en el Chevrolet Aveo 2011 1.6L
const INITIAL_DB = {
  carProfile: {
    id: "aveo-2011",
    make: "Chevrolet",
    model: "Aveo Sedán 4 Puertas",
    year: 2011,
    engine: "1.6L DOHC 16V (F16D3)",
    currentOdometer: 128450,
    plates: "NL-742-B",
    vin: "3G1JA5264BL129840",
    insuranceCompany: "Quálitas Seguros",
    insurancePolicy: "POL-04829104",
    insurancePhone: "800 800 2880",
    verificationMonth: "Mayo - Junio",
    updatedAt: new Date().toISOString()
  },
  fuelLogs: [
    {
      id: "f_1",
      date: new Date(Date.now() - 34 * 86400000).toISOString(),
      odometer: 127200,
      liters: 34.5,
      totalCost: 828.00,
      pricePerLiter: 24.00,
      fuelType: "Magna",
      isFullTank: true,
      calculatedKml: 11.5,
      costPerKm: 2.08,
      station: "Pemex Carretera Nacional",
      notes: "Carga inicial normal",
      aiAnomalyNote: null
    },
    {
      id: "f_2",
      date: new Date(Date.now() - 21 * 86400000).toISOString(),
      odometer: 127610,
      liters: 35.0,
      totalCost: 840.00,
      pricePerLiter: 24.00,
      fuelType: "Magna",
      isFullTank: true,
      calculatedKml: 11.71,
      costPerKm: 2.05,
      station: "Oxxo Gas Gonzalitos",
      notes: "Tráfico regular en Monterrey",
      aiAnomalyNote: null
    },
    {
      id: "f_3",
      date: new Date(Date.now() - 8 * 86400000).toISOString(),
      odometer: 128035,
      liters: 35.8,
      totalCost: 866.36,
      pricePerLiter: 24.20,
      fuelType: "Magna",
      isFullTank: true,
      calculatedKml: 11.87,
      costPerKm: 2.04,
      station: "Mobil Constitución",
      notes: "Uso moderado de A/C",
      aiAnomalyNote: null
    },
    {
      id: "f_4",
      date: new Date().toISOString(),
      odometer: 128450,
      liters: 34.9,
      totalCost: 844.58,
      pricePerLiter: 24.20,
      fuelType: "Magna",
      isFullTank: true,
      calculatedKml: 11.89,
      costPerKm: 2.03,
      station: "Pemex San Jerónimo",
      notes: "Tanque lleno reciente",
      aiAnomalyNote: null
    }
  ],
  maintenanceLogs: [
    {
      id: "m_1",
      date: new Date(Date.now() - 90 * 86400000).toISOString(),
      odometer: 124000,
      category: "Preventivo",
      title: "Cambio de Aceite SAE 5W-30 + Filtro de Aceite y Aire",
      description: "Servicio de lubricación con garrafa Mobil Super 5W-30 (3.75 L) y reemplazo de filtros de aceite y aire.",
      partsUsed: "Garrafa Mobil 5W-30, Filtro Gonher GP-47, Filtro Aire GA-187",
      cost: 1150.00,
      provider: "Hecho por mí (DIY)",
      aiImpact: "BUENO",
      aiPriceRating: "Justo",
      aiTechnicalAnalysis: "Servicio esencial para la lubricación de los 16 buzos hidráulicos y evitar ruidos al encender en frío.",
      aiRelatedParts: "Revisar empaque de tapa de punterías en el próximo servicio.",
      aiNextServiceKm: 130000
    },
    {
      id: "m_2",
      date: new Date(Date.now() - 280 * 86400000).toISOString(),
      odometer: 118000,
      category: "Preventivo",
      title: "Balatas Delanteras Cerámicas y Purgado",
      description: "Cambio de pastillas delanteras, rectificado de discos ventilados y purga con líquido DOT 4.",
      partsUsed: "Balatas Wagner Cerámica, Líquido DOT 4",
      cost: 1450.00,
      provider: "Taller Mecánico",
      aiImpact: "BUENO",
      aiPriceRating: "Justo",
      aiTechnicalAnalysis: "El circuito en X del Aveo 2011 recuperó tacto firme en el pedal.",
      aiRelatedParts: "Zapatas traseras y cilindros de rueda.",
      aiNextServiceKm: 143000
    },
    {
      id: "m_3",
      date: new Date(Date.now() - 950 * 86400000).toISOString(),
      odometer: 90000,
      category: "Preventivo",
      title: "Kit Completo de Banda de Distribución y Bomba de Agua",
      description: "Cambio preventivo de banda dentada, polea loca, polea tensora mecánica y bomba de agua AC Delco con anticongelante DEX-COOL.",
      partsUsed: "Kit Gates Distribución + Bomba de agua AC Delco + DEX-COOL 50/50",
      cost: 3850.00,
      provider: "Taller Especializado",
      aiImpact: "BUENO",
      aiPriceRating: "Justo",
      aiTechnicalAnalysis: "Mantenimiento crítico ejecutado a tiempo. Previene que el motor doble válvulas por interferencia.",
      aiRelatedParts: "Retenes de árbol de levas y cigüeñal.",
      aiNextServiceKm: 140000
    }
  ],
  chatMessages: [
    {
      id: "c_1",
      role: "model",
      content: "¡Hola! Soy tu Copiloto Mecánico de AveoLog AI para tu Chevrolet Aveo 2011 Sedán 1.6L DOHC. Tengo cargada toda la ficha técnica de fábrica y tu historial de servicios. ¿En qué te ayudo hoy?",
      createdAt: new Date().toISOString()
    }
  ]
};

// Cargar o inicializar almacenamiento local
function readStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Error leyendo store.json, usando valores iniciales:", e);
  }
  fs.writeFileSync(STORE_FILE, JSON.stringify(INITIAL_DB, null, 2));
  return INITIAL_DB;
}

function writeStore(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error guardando store.json:", e);
  }
}

// Intentar Prisma si DATABASE_URL está presente
let prismaClient = null;
if (process.env.DATABASE_URL) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    prismaClient = new PrismaClient();
    console.log("Conectado a base de datos PostgreSQL mediante Prisma ORM.");
  } catch (e) {
    console.log("Prisma Client no disponible en este entorno, usando motor de persistencia local optimizado.");
  }
}

export const db = {
  // Car Profile
  async getCarProfile() {
    if (prismaClient) {
      try {
        let p = await prismaClient.carProfile.findUnique({ where: { id: "aveo-2011" } });
        if (!p) {
          p = await prismaClient.carProfile.create({ data: INITIAL_DB.carProfile });
        }
        return p;
      } catch (e) {
        console.warn("Prisma error, fallback local:", e.message);
      }
    }
    const store = readStore();
    return store.carProfile;
  },

  async updateCarProfile(data) {
    if (prismaClient) {
      try {
        return await prismaClient.carProfile.upsert({
          where: { id: "aveo-2011" },
          update: data,
          create: { id: "aveo-2011", ...data }
        });
      } catch (e) {
        console.warn("Prisma error, fallback local:", e.message);
      }
    }
    const store = readStore();
    store.carProfile = { ...store.carProfile, ...data, updatedAt: new Date().toISOString() };
    writeStore(store);
    return store.carProfile;
  },

  // Fuel Logs
  async getFuelLogs() {
    if (prismaClient) {
      try {
        return await prismaClient.fuelLog.findMany({ orderBy: { odometer: 'desc' } });
      } catch (e) {
        console.warn("Prisma error, fallback local:", e.message);
      }
    }
    const store = readStore();
    return [...store.fuelLogs].sort((a, b) => b.odometer - a.odometer);
  },

  async addFuelLog(log) {
    if (prismaClient) {
      try {
        const created = await prismaClient.fuelLog.create({ data: log });
        // Actualizar odómetro si es mayor
        const car = await this.getCarProfile();
        if (log.odometer > car.currentOdometer) {
          await this.updateCarProfile({ currentOdometer: log.odometer });
        }
        return created;
      } catch (e) {
        console.warn("Prisma error, fallback local:", e.message);
      }
    }
    const store = readStore();
    const newLog = { id: "f_" + Date.now(), createdAt: new Date().toISOString(), ...log };
    store.fuelLogs.push(newLog);
    if (log.odometer > store.carProfile.currentOdometer) {
      store.carProfile.currentOdometer = log.odometer;
    }
    writeStore(store);
    return newLog;
  },

  // Maintenance Logs
  async getMaintenanceLogs() {
    if (prismaClient) {
      try {
        return await prismaClient.maintenanceLog.findMany({ orderBy: { odometer: 'desc' } });
      } catch (e) {
        console.warn("Prisma error, fallback local:", e.message);
      }
    }
    const store = readStore();
    return [...store.maintenanceLogs].sort((a, b) => b.odometer - a.odometer);
  },

  async addMaintenanceLog(log) {
    if (prismaClient) {
      try {
        const created = await prismaClient.maintenanceLog.create({ data: log });
        const car = await this.getCarProfile();
        if (log.odometer > car.currentOdometer) {
          await this.updateCarProfile({ currentOdometer: log.odometer });
        }
        return created;
      } catch (e) {
        console.warn("Prisma error, fallback local:", e.message);
      }
    }
    const store = readStore();
    const newLog = { id: "m_" + Date.now(), createdAt: new Date().toISOString(), ...log };
    store.maintenanceLogs.push(newLog);
    if (log.odometer > store.carProfile.currentOdometer) {
      store.carProfile.currentOdometer = log.odometer;
    }
    writeStore(store);
    return newLog;
  },

  // Chat History
  async getChatMessages() {
    if (prismaClient) {
      try {
        return await prismaClient.chatMessage.findMany({ orderBy: { createdAt: 'asc' }, take: 30 });
      } catch (e) {}
    }
    const store = readStore();
    return store.chatMessages || [];
  },

  async addChatMessage(msg) {
    if (prismaClient) {
      try {
        return await prismaClient.chatMessage.create({ data: msg });
      } catch (e) {}
    }
    const store = readStore();
    if (!store.chatMessages) store.chatMessages = [];
    const newMsg = { id: "c_" + Date.now(), createdAt: new Date().toISOString(), ...msg };
    store.chatMessages.push(newMsg);
    writeStore(store);
    return newMsg;
  },

  // Exportar todo el estado para Backup
  async getFullBackup() {
    const carProfile = await this.getCarProfile();
    const fuelLogs = await this.getFuelLogs();
    const maintenanceLogs = await this.getMaintenanceLogs();
    const chatMessages = await this.getChatMessages();

    return {
      version: "2.0.0",
      exportDate: new Date().toISOString(),
      carProfile,
      fuelLogs,
      maintenanceLogs,
      chatMessages
    };
  },

  async restoreBackup(backup) {
    if (!backup || !backup.carProfile) {
      throw new Error("Formato de backup inválido");
    }
    const store = {
      carProfile: backup.carProfile,
      fuelLogs: backup.fuelLogs || [],
      maintenanceLogs: backup.maintenanceLogs || [],
      chatMessages: backup.chatMessages || []
    };
    writeStore(store);
    return store;
  }
};
