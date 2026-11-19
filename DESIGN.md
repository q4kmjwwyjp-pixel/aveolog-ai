# AveoLog — Design System (Cupertino Olympic White)

## Visual World
- **Concepto:** Cupertino Olympic White — diseñado específicamente para acompañar un Chevrolet Aveo 2011 Sedán color blanco en iPhone.
- **Modo:** `Operate` (claridad máxima bajo luz solar en cabina, jerarquía tipográfica SF Pro y navegación nativa iOS).

## Tokens
- **Superficies:**
  - `--bg-app`: `#F5F5F7` (Alabastro agrupado iOS)
  - `--bg-surface`: `#FFFFFF` (Blanco puro predominante)
  - `--bg-surface-secondary`: `#F2F2F7`
  - `--bg-translucent`: `rgba(255, 255, 255, 0.84)` con `backdrop-filter: saturate(180%) blur(20px)`
- **Tipografía y Tinta:**
  - `--text-main`: `#1D1D1F`
  - `--text-secondary`: `#6E6E73`
  - `--text-muted`: `#86868B`
  - Numerales tabulares (`font-variant-numeric: tabular-nums`) en odómetro, km/L, costos y kilometrajes.
- **Semántica y Acentos:**
  - `--accent-primary`: `#1D1D1F`
  - `--accent-blue`: `#0071E3`
  - `--status-good`: `#248A3D` / `--status-good-bg`: `rgba(52, 199, 89, 0.12)`
  - `--status-warn`: `#B25000` / `--status-warn-bg`: `rgba(255, 149, 0, 0.14)`
  - `--status-danger`: `#D70015` / `--status-danger-bg`: `rgba(255, 59, 48, 0.11)`
- **Elevación y Movimiento:**
  - Elevación declarada una sola vez por tarjeta (`--shadow-card: 0 2px 12px rgba(0, 0, 0, 0.04)`, sin bordes fantasma).
  - Transiciones direccionales entre vistas con `document.startViewTransition` y curva `--ease-spring: cubic-bezier(0.22, 1, 0.36, 1)`.
  - Iconografía 100% vectorial SVG (`stroke-width: 1.75px`).
