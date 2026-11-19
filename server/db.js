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

// Semilla inicial LIMPIA (sin datos inventados) para Chevrolet Aveo 2011 1.6L
const INITIAL_DB = {
  carProfile: {
    id: "aveo-2011",
    make: "Chevrolet",
    model: "Aveo Sedán 4 Puertas",
    year: 2011,
    engine: "1.6L DOHC 16V (F16D3)",
    currentOdometer: 0,
    plates: "",
    vin: "",
    insuranceCompany: "",
    insurancePolicy: "",
    insurancePhone: "",
    verificationMonth: "",
    updatedAt: new Date().toISOString()
  },
  fuelLogs: [],
  maintenanceLogs: [],
  chatMessages: [
    {
      id: "c_1",
      role: "model",
      content: "¡Hola! Soy tu Copiloto Mecánico de AveoLog AI para tu Chevrolet Aveo 2011 Sedán 1.6L DOHC. Tu bitácora está limpia y lista para tus datos reales. También puedes escanear una foto de tu tablero para extraer el kilometraje o analizar testigos. ¿En qué te ayudo hoy?",
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
  const cleanCopy = JSON.parse(JSON.stringify(INITIAL_DB));
  fs.writeFileSync(STORE_FILE, JSON.stringify(cleanCopy, null, 2));
  return cleanCopy;
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

  async deleteFuelLog(id) {
    if (prismaClient) {
      try {
        await prismaClient.fuelLog.delete({ where: { id } });
      } catch (e) {
        console.warn("Prisma error, fallback local:", e.message);
      }
    }
    const store = readStore();
    store.fuelLogs = store.fuelLogs.filter(f => f.id !== id);
    writeStore(store);
    return { deleted: id };
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

  async deleteMaintenanceLog(id) {
    if (prismaClient) {
      try {
        await prismaClient.maintenanceLog.delete({ where: { id } });
      } catch (e) {
        console.warn("Prisma error, fallback local:", e.message);
      }
    }
    const store = readStore();
    store.maintenanceLogs = store.maintenanceLogs.filter(m => m.id !== id);
    writeStore(store);
    return { deleted: id };
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

  // Resetear todos los datos a estado limpio
  async resetAllData() {
    if (prismaClient) {
      try {
        await prismaClient.fuelLog.deleteMany({});
        await prismaClient.maintenanceLog.deleteMany({});
        await prismaClient.chatMessage.deleteMany({});
        await prismaClient.carProfile.upsert({
          where: { id: "aveo-2011" },
          update: INITIAL_DB.carProfile,
          create: INITIAL_DB.carProfile
        });
      } catch (e) {
        console.warn("Prisma reset error:", e.message);
      }
    }
    const cleanCopy = JSON.parse(JSON.stringify(INITIAL_DB));
    writeStore(cleanCopy);
    return cleanCopy;
  },

  // Exportar todo el estado para Backup
  async getFullBackup() {
    const carProfile = await this.getCarProfile();
    const fuelLogs = await this.getFuelLogs();
    const maintenanceLogs = await this.getMaintenanceLogs();
    const chatMessages = await this.getChatMessages();

    return {
      version: "2.5.0",
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
