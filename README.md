# AveoLog AI 🏎️ — PWA para Chevrolet Aveo 2011 1.6L DOHC

**AveoLog AI** es una Progressive Web App (PWA) de telemetría, bitácora de mantenimiento y diagnóstico inteligente diseñada específicamente para uso personal en iPhone (Safari -> Agregar a pantalla de inicio) para el **Chevrolet Aveo 2011 Sedán 4 puertas (Motor 1.6L 16V DOHC F16D3 / E-TEC II)**.

---

## 🌟 Características Principales

### 1. Telemetría de Combustible & Rendimiento Real
- **Cálculo de km/L:** Cálculo automático entre tanques llenos consecutivos y promedio ponderado.
- **Costo por Kilómetro:** Seguimiento exacto de pesos por kilómetro recorrido (`$/km`).
- **Autonomía Restante Estimada:** Proyección en kilómetros según la capacidad del tanque de 45 litros.
- **Comparador de Fábrica:** Evalúa tu rendimiento contra los estándares de fábrica del Aveo 1.6L:
  - Ciudad: `10.5 - 11.5 km/L`
  - Mixto: `12.5 - 13.5 km/L`
  - Carretera: `14.5 - 16.0 km/L`
- **Gráfica de Tendencia:** Curva interactiva SVG de evolución de rendimiento.

### 2. Semáforo Preventivo Aveo 1.6L
Calibrado con los intervalos críticos del motor E-TEC II / F16D3:
- ⚠️ **Kit de Banda de Distribución + Bomba de Agua + Tensores:** Prioridad alta (¡motor con interferencia mecánica, si la banda se rompe se doblan válvulas!).
- 🛢️ **Aceite y Filtro de Motor (5W-30 / 10W-30):** Capacidad 3.75 L con filtro.
- ⚡ **Bujías (1.1 mm / NGK BKR6E-11) y Cables:** Detección de aceite en pozos por empaque de punterías.
- 🌡️ **Anticongelante Dex-Cool y Carcasa de Termostato:** Inspección de fisuras en la carcasa plástica.
- 🛑 **Frenos Delanteros y Líquido DOT 3/4.**
- 🌬️ **Filtros de Aire y Gasolina de chasis.**
- 🧼 **Limpieza de Cuerpo de Aceleración y Válvula IAC.**
- 🔩 **Suspensión Delantera:** Bujes de horquilla y bieletas.

### 3. Diagnóstico Inteligente & AveoBot AI
- **Biblioteca OBD2 Especializada:** Más de 20 códigos DTC frecuentes de Aveo (P0300, P0420, P0171, P0117, P0340, P0335, P0505, P0463) con síntomas, causas y solución paso a paso.
- **Asistente Experto Embebido (100% Offline):** Diagnostica síntomas como *"tiembla en ralentí"*, *"olor a gasolina"*, *"cascabelea en subida"*, *"sube temperatura"*, *"chirrido al encender en frío"* o *"se apaga con A/C"*.
- **Modo Gemini AI Opcional:** Posibilidad de vincular API Key de Google Gemini para consultas avanzadas en la nube.

### 4. Experiencia Nativa para iPhone (Safari)
- Cumple con todas las especificaciones de diseño **Apple Human Interface Guidelines**:
  - `apple-mobile-web-app-capable: yes` (sin barra de direcciones ni controles de Safari).
  - `apple-mobile-web-app-status-bar-style: black-translucent`.
  - Iconos de alta resolución en `icons/apple-touch-icon.png` (180x180) y `icons/icon-512.png`.
  - Soporte completo para **Safe Areas**, Dynamic Island y Notch (`env(safe-area-inset-top)` / `bottom`).
  - **Audio Háptico Sintético:** Imita el Taptic Engine de Apple al pulsar botones y registrar datos.
  - Almacenamiento local persistente (`localStorage`) con respaldo descargable en JSON para guardar en iCloud Drive o Archivos.

---

## 📲 Cómo instalar en tu iPhone

1. Abre el enlace en **Safari**: `https://q4kmjwwyjp-pixel.github.io/aveolog-ai/`
2. Toca el botón **Compartir** (el icono del cuadrado con la flecha hacia arriba `⎋`) en la barra inferior de Safari.
3. Desplázate hacia abajo y selecciona **"Agregar a pantalla de inicio"** (`[+]`).
4. Pulsa **"Agregar"** en la esquina superior derecha.
5. ¡Listo! Se abrirá a pantalla completa como una app nativa de iOS, sin barras de navegación y con funcionamiento offline garantizado.
