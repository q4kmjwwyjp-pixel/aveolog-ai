/**
 * Servidor Principal de AveoLog AI
 * Express + API REST + Integración Gemini 2.5 Flash
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas de API
app.use('/api', apiRoutes);

// Servir estáticos de la aplicación (Frontend PWA y assets)
const publicDir = path.join(__dirname, '..');
app.use(express.static(publicDir));

// Fallback SPA para rutas cliente
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error no controlado en servidor:", err);
  res.status(500).json({ success: false, error: "Error interno del servidor", details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  🚗 AVEOLOG AI — SERVIDOR ACTIVO`);
  console.log(`  Puerto: ${PORT}`);
  console.log(`  Modelo IA: gemini-2.5-flash`);
  console.log(`  Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
