# AveoLog AI 🏎️ — Full-Stack PWA para Chevrolet Aveo 2011 1.6L DOHC

> **AveoLog AI** es una Progressive Web App (PWA) de nivel producción diseñada exclusivamente para **iPhone en Safari** (y desplegable en Render / Vercel / Raspberry Pi) para gestionar la bitácora inteligente, telemetría de combustible y copiloto mecánico asistido por **Google Gemini 2.5 Flash** para el **Chevrolet Aveo 2011 Sedán 4 puertas (Motor 1.6L 16V DOHC F16D3 / E-TEC II)**.

---

## 🌟 Arquitectura y Stack Tecnológico (100% Gratuito)

- **Frontend:**
  - Progressive Web App (PWA) Mobile-First con diseño *Dark Cockpit Telemetry*.
  - Navegación nativa tipo iOS TabBar (Inicio, Gasolina, Bitácora, Copiloto IA, Manual).
  - Audio háptico sintético que imita el **Taptic Engine de Apple**.
  - Gráficos interactivos SVG para curvas de rendimiento de combustible (km/L) y gastos mensuales.
  - Soporte completo para **Safe Areas** (`env(safe-area-inset-top)` / `bottom`), Dynamic Island y Notch.
- **Backend & Base de Datos:**
  - Servidor ligero en **Node.js + Express** con API RESTful modular.
  - **Prisma ORM** configurado para **PostgreSQL (Neon DB gratuito)** en [`prisma/schema.prisma`](file:///data/data/com.termux/files/home/aveolog-ai/prisma/schema.prisma).
  - Capa de datos híbrida: Si no se provee `DATABASE_URL`, el sistema conmuta automáticamente a persistencia local duradera (`store.json`), evitando caídas del servidor.
- **Inteligencia Artificial:**
  - **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) mediante `GEMINI_API_KEY`.
  - **Structured Outputs (JSON Schema)** para evaluación automática de entradas de mantenimiento (`impacto`, `calificacion_precio`, `analisis_tecnico`, `piezas_relacionadas`, `proximo_servicio_km`).
  - Detección automática de anomalías en consumo de combustible si el rendimiento cae **más de un 15%** respecto al promedio histórico.
  - **Copiloto Mecánico "Pregúntale al Aveo":** Chat contextual con toda la ficha técnica oficial y tu bitácora viva.
- **Ficha Técnica Oficial del Vehículo:**
  - Archivo JSON estático e inmutable en [`src/data/aveo2011-specs.json`](file:///data/data/com.termux/files/home/aveolog-ai/src/data/aveo2011-specs.json).

---

## 📱 Módulos y Funcionalidades

### 1. Dashboard de Salud ("Estado del Aveo")
- Odómetro actual actualizable en un toque con recálculo dinámico en vivo.
- Rendimiento promedio reciente (`km/L`), costo por kilómetro (`$ MXN/km`) y autonomía estimada calculada sobre la capacidad real del tanque (**45.0 Litros**).
- Semáforo y puntuación de salud general generado por Gemini con base en mantenimientos y combustible.
- Alerta roja prioritaria para el **Kit de Banda de Distribución** (¡motor de interferencia mecánica!).

### 2. Módulo de Gasolina (Carga Rápida en 10 Segundos)
- Formulario optimizado para una sola mano: Kilometraje, Litros, Monto pagado ($ MXN), tipo (Magna / Premium), checkbox ¿Tanque lleno? y notas de tráfico / uso de A/C.
- Cálculo automático de rendimiento entre cargas consecutivas.
- **Alerta de Anomalía >15%:** Si el rendimiento cae más del 15%, dispara automáticamente un análisis con Gemini indicando causas específicas del motor 1.6L:
  - Presión de llantas inferior a **33 PSI (230 kPa)**.
  - Bujías **NGK BKR6E-11** (1.0 - 1.1 mm) carbonizadas o con aceite en pozos por fuga en junta de punterías.
  - Filtro de aire obstruido o sensor de oxígeno post-catalizador lento.

### 3. Bitácora Inteligente de Mantenimiento con Evaluación IA
- Categorías: **Preventivo**, **Correctivo**, **Falla/Síntoma**, **Modificación/Accesorio**.
- Al guardar cualquier entrada, el backend consulta a Gemini 2.5 Flash con Structured Outputs y genera:
  - `impacto`: **BUENO** | **NORMAL** | **MALO** | **CRITICO**
  - `calificacion_precio`: **Justo** | **Alto** | **Bajo** (calibrado a precios de refacciones en México).
  - `analisis_tecnico`: Diagnóstico detallado para el motor F16D3 1.6L 16V.
  - `piezas_relacionadas`: Qué componentes revisar aprovechando el servicio.
  - `proximo_servicio_km`: Odómetro sugerido para la siguiente revisión.

### 4. Copiloto Mecánico ("Pregúntale al Aveo")
Chat interactivo con acceso a toda la ficha técnica y bitácora:
- *"¿Qué fusible controla el encendedor?"* → Informa: Fusible **15A (CIGAR)** en la caja interior de la cabina.
- *"¿Qué fusible controla la bomba de gasolina?"* → Fusible **15A (F/PUMP)** en la caja del motor.
- *"Se encendió el testigo HOLD parpadeando, ¿qué hago?"* → Protocolo de transmisión automática y fluido **ESSO JWS 3309 (5.6 L)**.
- *"¿Cuál es la presión de las llantas?"* → **33 PSI (230 kPa)** en las 4 ruedas en frío.

### 5. Guantera Digital & Manual Interactivo
- Tabla de capacidades de fluidos (Aceite 3.75 L SAE 5W-30, DEX-COOL 6.3 L, 75W-90 1.8 L, DEXRON VI 1.1 L).
- Directorio de fusibles clave con ubicación y amperaje.
- Guía rápida de testigos del tablero.
- Protocolos de emergencia paso a paso (Paso de corriente seguro evitando dañar la ECU, Sobrecalentamiento).
- Exportación e importación de respaldo completo en JSON.

---

## 🚀 Guía de Ejecución Rápida

### A. Ejecución Local (Node.js o Raspberry Pi)

1. **Clonar o entrar al directorio:**
   ```bash
   cd aveolog-ai
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Edita .env y coloca tu GEMINI_API_KEY
   ```

3. **Instalar dependencias y arrancar:**
   ```bash
   npm install
   npm start
   ```

4. **Abrir en tu navegador:**
   - En tu equipo: `http://localhost:3000`
   - En tu iPhone conectado a la misma red Wi-Fi: `http://<IP-DE-TU-PC>:3000`

---

### B. Despliegue 100% Gratuito en la Nube

#### Opción 1: Render.com (Web Service Gratuito)
1. Conecta tu repositorio de GitHub `q4kmjwwyjp-pixel/aveolog-ai` en [dashboard.render.com](https://dashboard.render.com).
2. Selecciona **Web Service** (Node).
3. Configuración del servicio:
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
4. En la pestaña **Environment**, agrega las variables:
   - `GEMINI_API_KEY` = Tu clave de Google AI Studio.
   - `DATABASE_URL` = La URL de conexión de tu base de datos PostgreSQL gratuita en [Neon.tech](https://neon.tech) (opcional; si no la agregas, guarda localmente).
5. Pulsa **Deploy Web Service** y obtendrás una URL HTTPS gratuita para tu iPhone.

#### Opción 2: Base de Datos Gratuita con Neon DB (PostgreSQL)
1. Crea una cuenta gratuita en [Neon.tech](https://neon.tech).
2. Crea un proyecto llamado `aveolog-db`.
3. Copia el string de conexión `DATABASE_URL` y pégalo en tu `.env` o en las variables de Render.
4. Para sincronizar las tablas con Prisma:
   ```bash
   npx prisma db push
   ```

---

## 📲 Cómo Instalar en Safari en iPhone

1. Abre la URL en **Safari** en tu iPhone:  
   `https://q4kmjwwyjp-pixel.github.io/aveolog-ai/` (o tu dominio de Render con HTTPS).
2. Toca el botón **Compartir** de Safari (`⎋`).
3. Selecciona **"Agregar a pantalla de inicio"** (`➕`).
4. Pulsa **"Agregar"**. ¡Listo! Se abrirá como app nativa con icono de alta resolución y soporte offline.
