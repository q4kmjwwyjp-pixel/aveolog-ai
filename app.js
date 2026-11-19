/**
 * AVEOLOG AI — Controlador Frontend PWA Mobile-First
 * Especializado para Chevrolet Aveo 2011 Sedán 1.6L DOHC (Motor F16D3)
 * Integra API REST + Gemini 2.5 Flash Structured Outputs con Fallback Offline
 */

// =============================================================================
// 1. ESTADO POR DEFECTO & FALLBACK LOCAL
// =============================================================================

const DEFAULT_STATE = {
  car: {
    make: "Chevrolet",
    model: "Aveo Sedán 4 Puertas",
    year: 2011,
    engine: "1.6L DOHC 16V (F16D3)",
    power: "102 HP @ 5,800 RPM",
    torque: "145 Nm @ 3,600 RPM",
    tankCapacity: 45.0, // Litros
    currentOdo: 128450,
    plates: "NL-742-B",
    vin: "3G1JA5264BL129840",
    insuranceCompany: "Quálitas Seguros",
    insurancePolicy: "POL-04829104",
    insurancePhone: "800 800 2880",
    verificationMonth: "Mayo - Junio",
    geminiApiKey: ""
  },
  
  // Servicios Preventivos Oficiales Calibrados para Aveo 2011 1.6L DOHC
  maintenanceSchedule: [
    {
      id: "timing_belt",
      name: "Banda de Distribución (Kit Completo)",
      intervalKm: 50000,
      intervalMonths: 36,
      lastDoneOdo: 90000,
      lastDoneDate: "2024-03-10",
      critical: true,
      description: "¡CRÍTICO! Motor con interferencia: si la banda se rompe, se doblan las 16 válvulas. Cambiar banda, bomba de agua, tensor y polea loca."
    },
    {
      id: "engine_oil",
      name: "Aceite SAE 5W-30 y Filtro",
      intervalKm: 6000,
      intervalMonths: 6,
      lastDoneOdo: 124000,
      lastDoneDate: "2026-08-15",
      critical: false,
      description: "Capacidad: 3.75 L con filtro. Usar sintético o semisintético SAE 5W-30 (o 10W-30) API SM/SN."
    },
    {
      id: "spark_plugs",
      name: "Bujías NGK BKR6E-11 (1.0-1.1 mm) y Cables",
      intervalKm: 20000,
      intervalMonths: 12,
      lastDoneOdo: 115000,
      lastDoneDate: "2025-11-20",
      critical: false,
      description: "Bujías calibradas a 1.0 - 1.1 mm. Inspeccionar pozos por fugas de aceite de junta de punterías."
    },
    {
      id: "air_filter",
      name: "Filtro de Aire de Motor",
      intervalKm: 12000,
      intervalMonths: 12,
      lastDoneOdo: 124000,
      lastDoneDate: "2026-08-15",
      critical: false,
      description: "Mantiene la mezcla aire/combustible óptima y protege el sensor MAP."
    },
    {
      id: "fuel_filter",
      name: "Filtro de Gasolina (Línea de Chasis)",
      intervalKm: 15000,
      intervalMonths: 12,
      lastDoneOdo: 115000,
      lastDoneDate: "2025-11-20",
      critical: false,
      description: "Ubicado abajo junto al tanque. Protege inyectores y bomba de combustible."
    },
    {
      id: "coolant_thermostat",
      name: "Anticongelante DEX-COOL y Termostato",
      intervalKm: 40000,
      intervalMonths: 24,
      lastDoneOdo: 100000,
      lastDoneDate: "2024-09-05",
      critical: true,
      description: "6.3 Litros mezcla 50/50. Inspeccionar carcasa plástica del termostato (reemplazo sugerido a aluminio)."
    },
    {
      id: "brakes_front",
      name: "Balatas Delanteras y Líquido DOT 3/4",
      intervalKm: 25000,
      intervalMonths: 18,
      lastDoneOdo: 118000,
      lastDoneDate: "2026-02-12",
      critical: true,
      description: "Sistema en X: revisar balatas cerámicas, discos ventilados y purgado."
    },
    {
      id: "throttle_iac",
      name: "Limpieza Cuerpo de Aceleración e IAC",
      intervalKm: 20000,
      intervalMonths: 12,
      lastDoneOdo: 110000,
      lastDoneDate: "2025-06-18",
      critical: false,
      description: "Elimina carbonilla para evitar ralentí inestable y que el auto se apague con el A/C."
    },
    {
      id: "suspension_front",
      name: "Bujes de Horquilla y Bieletas Delanteras",
      intervalKm: 30000,
      intervalMonths: 18,
      lastDoneOdo: 105000,
      lastDoneDate: "2025-01-10",
      critical: false,
      description: "Evita golpeteos metálicos al pasar baches o topes en Aveo."
    }
  ],

  // Cargas de Gasolina Iniciales
  fuelLogs: [
    {
      id: "f_1",
      date: "2026-10-15",
      odometer: 127200,
      liters: 34.5,
      totalCost: 828.00,
      pricePerLiter: 24.00,
      fuelType: "Magna",
      isFullTank: true,
      calculatedKml: 11.5,
      costPerKm: 2.08,
      station: "Pemex Carretera Nacional",
      notes: "Carga normal",
      aiAnomalyNote: null
    },
    {
      id: "f_2",
      date: "2026-10-28",
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
      date: "2026-11-10",
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
      date: "2026-11-18",
      odometer: 128450,
      liters: 34.9,
      totalCost: 844.58,
      pricePerLiter: 24.20,
      fuelType: "Magna",
      isFullTank: true,
      calculatedKml: 11.89,
      costPerKm: 2.03,
      station: "Pemex San Jerónimo",
      notes: "415 km recorridos (11.89 km/L)",
      aiAnomalyNote: null
    }
  ],

  // Bitácora de Mantenimiento con Evaluación Estructurada
  maintenanceLogs: [
    {
      id: "m_1",
      date: "2026-08-15",
      odometer: 124000,
      category: "Preventivo",
      title: "Cambio de Aceite SAE 5W-30 + Filtro de Aceite y Aire",
      description: "Servicio de lubricación con garrafa Mobil Super 5W-30 (3.75 L) y reemplazo de filtros de aceite y aire.",
      partsUsed: "Mobil Super 5W-30, Filtro Gonher GP-47, Filtro GA-187",
      cost: 1150.00,
      provider: "Hecho por mí (DIY)",
      aiImpact: "BUENO",
      aiPriceRating: "Justo",
      aiTechnicalAnalysis: "Esencial para la lubricación de los 16 buzos hidráulicos del Aveo 1.6L DOHC. La viscosidad 5W-30 protege en el arranque matutino.",
      aiRelatedParts: "Revisar empaque de tapa de punterías en el próximo servicio por posible sudado de aceite.",
      aiNextServiceKm: 130000
    },
    {
      id: "m_2",
      date: "2026-02-12",
      odometer: 118000,
      category: "Preventivo",
      title: "Balatas Delanteras Cerámicas y Purgado",
      description: "Cambio de pastillas delanteras, rectificado de discos ventilados y purga con líquido DOT 4.",
      partsUsed: "Balatas Wagner Cerámica, Líquido DOT 4",
      cost: 1450.00,
      provider: "Taller Mecánico",
      aiImpact: "BUENO",
      aiPriceRating: "Justo",
      aiTechnicalAnalysis: "El circuito diagonal en X del Aveo 2011 recuperó tacto firme en el pedal evitando cristalización.",
      aiRelatedParts: "Revisar tambores traseros y zapatas en el próximo servicio.",
      aiNextServiceKm: 143000
    },
    {
      id: "m_3",
      date: "2024-03-10",
      odometer: 90000,
      category: "Preventivo",
      title: "Kit Completo de Banda de Distribución y Bomba de Agua",
      description: "Cambio preventivo de banda dentada, polea loca, polea tensora mecánica y bomba de agua con anticongelante DEX-COOL.",
      partsUsed: "Kit Gates Distribución + Bomba de agua AC Delco + DEX-COOL 50/50",
      cost: 3850.00,
      provider: "Taller Mecánico",
      aiImpact: "BUENO",
      aiPriceRating: "Justo",
      aiTechnicalAnalysis: "Intervención de máxima prioridad en el motor F16D3 1.6L DOHC. Al ser un motor de interferencia mecánica, cambiar el kit completo previene doblar las 16 válvulas.",
      aiRelatedParts: "Retenes de árbol de levas y cigüeñal, y banda de accesorios 6PK.",
      aiNextServiceKm: 140000
    }
  ]
};

// =============================================================================
// 2. CONTROLADOR PRINCIPAL AVEOLOG AI APP
// =============================================================================

class AveoLogApp {
  constructor() {
    this.apiBase = window.location.origin.includes('github.io') ? null : '/api';
    this.state = this.loadState();
    this.currentView = "view-dashboard";
    this.initAudioHaptics();
    this.initDOM();
    this.bindEvents();
    this.renderAll();
    this.syncWithBackend();
    this.checkSafariPwaBanner();
    this.registerServiceWorker();
  }

  loadState() {
    try {
      const saved = localStorage.getItem("aveolog_ai_v2_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          car: { ...DEFAULT_STATE.car, ...parsed.car },
          maintenanceSchedule: parsed.maintenanceSchedule || DEFAULT_STATE.maintenanceSchedule,
          fuelLogs: parsed.fuelLogs || DEFAULT_STATE.fuelLogs,
          maintenanceLogs: parsed.maintenanceLogs || DEFAULT_STATE.maintenanceLogs
        };
      }
    } catch (e) {
      console.warn("Error leyendo state local, usando inicial:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      localStorage.setItem("aveolog_ai_v2_state", JSON.stringify(this.state));
    } catch (e) {
      console.error("Error guardando state:", e);
    }
  }

  async syncWithBackend() {
    if (!this.apiBase) return;
    try {
      // Intentar obtener car profile
      const resCar = await fetch(`${this.apiBase}/car`);
      if (resCar.ok) {
        const carData = await resCar.json();
        if (carData.success && carData.data) {
          this.state.car.currentOdo = carData.data.currentOdometer || this.state.car.currentOdo;
          this.state.car.plates = carData.data.plates || this.state.car.plates;
          this.state.car.vin = carData.data.vin || this.state.car.vin;
          this.state.car.insuranceCompany = carData.data.insuranceCompany || this.state.car.insuranceCompany;
          this.state.car.insurancePolicy = carData.data.insurancePolicy || this.state.car.insurancePolicy;
          this.state.car.insurancePhone = carData.data.insurancePhone || this.state.car.insurancePhone;
          this.state.car.verificationMonth = carData.data.verificationMonth || this.state.car.verificationMonth;
        }
      }

      // Obtener fuel logs
      const resFuel = await fetch(`${this.apiBase}/fuel`);
      if (resFuel.ok) {
        const fuelData = await resFuel.json();
        if (fuelData.success && fuelData.data && fuelData.data.logs) {
          this.state.fuelLogs = fuelData.data.logs;
        }
      }

      // Obtener maintenance logs
      const resMaint = await fetch(`${this.apiBase}/maintenance`);
      if (resMaint.ok) {
        const maintData = await resMaint.json();
        if (maintData.success && maintData.data) {
          this.state.maintenanceLogs = maintData.data;
        }
      }

      this.saveState();
      this.renderAll();
      console.log("Sincronización con backend exitosa.");
    } catch (e) {
      console.log("Trabajando en modo offline / local (backend no disponible).");
    }
  }

  // Audio háptico sintético para iPhone
  initAudioHaptics() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      this.audioCtx = null;
    }
  }

  haptic(type = "light") {
    if (navigator.vibrate) {
      if (type === "light") navigator.vibrate(10);
      else if (type === "medium") navigator.vibrate(25);
      else if (type === "heavy") navigator.vibrate([40, 30, 40]);
    }

    if (this.audioCtx && this.audioCtx.state === "running") {
      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(type === "heavy" ? 90 : 160, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.04);
      } catch (e) {}
    }
  }

  initDOM() {
    this.tabButtons = document.querySelectorAll(".tabbar-item");
    this.views = document.querySelectorAll(".app-view");

    this.formFuel = document.getElementById("form-fuel");
    this.formService = document.getElementById("form-service");
    this.formOdo = document.getElementById("form-odo");
    this.formCarDocs = document.getElementById("form-car-docs");

    this.modalFuel = document.getElementById("modal-fuel");
    this.modalService = document.getElementById("modal-service");
    this.modalOdo = document.getElementById("modal-odo");
    this.modalCarDocs = document.getElementById("modal-car-docs");

    this.chatMessages = document.getElementById("chat-messages");
    this.chatInput = document.getElementById("chat-input-text");
    this.btnChatSend = document.getElementById("btn-chat-send");
  }

  bindEvents() {
    document.addEventListener("touchstart", () => {
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
    }, { once: true });

    // Navegación por pestañas
    this.tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const viewId = btn.dataset.view;
        this.switchView(viewId);
        this.haptic("light");
      });
    });

    // Botones de acción rápida
    document.getElementById("dash-btn-add-fuel")?.addEventListener("click", () => {
      this.openModal("modal-fuel");
      this.haptic("light");
    });
    document.getElementById("dash-btn-add-service")?.addEventListener("click", () => {
      this.openModal("modal-service");
      this.haptic("light");
    });
    document.getElementById("dash-btn-open-diag")?.addEventListener("click", () => {
      this.switchView("view-diag");
      this.haptic("light");
    });
    document.getElementById("dash-see-all-logs")?.addEventListener("click", () => {
      this.switchView("view-service");
      this.haptic("light");
    });

    // Modales
    document.getElementById("btn-quick-odo")?.addEventListener("click", () => this.openOdoModal());
    document.getElementById("btn-edit-odo-widget")?.addEventListener("click", () => this.openOdoModal());
    document.getElementById("btn-open-fuel-modal")?.addEventListener("click", () => this.openModal("modal-fuel"));
    document.getElementById("btn-open-service-modal")?.addEventListener("click", () => this.openModal("modal-service"));
    document.getElementById("btn-edit-car-docs")?.addEventListener("click", () => this.openCarDocsModal());
    document.getElementById("btn-quick-backup")?.addEventListener("click", () => {
      this.switchView("view-garage");
      this.showToast("Gestión de Respaldos", "💾");
    });

    // Cerrar modales
    document.querySelectorAll("[data-close-modal]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.dataset.closeModal;
        this.closeModal(modalId);
        this.haptic("light");
      });
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
          this.haptic("light");
        }
      });
    });

    // Botones segmentados
    document.querySelectorAll(".seg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const group = btn.dataset.seg;
        document.querySelectorAll(`.seg-btn[data-seg="${group}"]`).forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.haptic("light");
      });
    });

    // Envíos de formulario
    this.formFuel.addEventListener("submit", (e) => this.handleFuelSubmit(e));
    this.formService.addEventListener("submit", (e) => this.handleServiceSubmit(e));
    this.formOdo.addEventListener("submit", (e) => this.handleOdoSubmit(e));
    this.formCarDocs.addEventListener("submit", (e) => this.handleCarDocsSubmit(e));

    // Copiloto Chat
    this.btnChatSend.addEventListener("click", () => this.handleChatSubmit());
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleChatSubmit();
    });

    // Chips de preguntas frecuentes
    document.querySelectorAll(".symptom-tag").forEach(tag => {
      tag.addEventListener("click", () => {
        const query = tag.dataset.query;
        this.runCopilotQuery(query);
        this.haptic("light");
      });
    });

    // Exportar e Importar Respaldo
    document.getElementById("btn-export-backup")?.addEventListener("click", () => this.exportBackupJSON());
    document.getElementById("file-import-backup")?.addEventListener("change", (e) => this.importBackupJSON(e));

    // Cerrar banner iOS Safari
    document.getElementById("btn-close-install-banner")?.addEventListener("click", () => {
      document.getElementById("ios-install-banner").style.display = "none";
      sessionStorage.setItem("aveolog_hide_ios_banner", "1");
    });
  }

  switchView(viewId) {
    this.currentView = viewId;
    this.tabButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === viewId);
    });
    this.views.forEach(v => {
      v.classList.toggle("active", v.id === viewId);
    });

    const scrollElem = document.getElementById("main-scroll");
    if (scrollElem) scrollElem.scrollTop = 0;

    if (viewId === "view-fuel") {
      this.renderFuelView();
    } else if (viewId === "view-service") {
      this.renderServiceView();
    } else if (viewId === "view-diag") {
      // Vista Copiloto
    } else if (viewId === "view-garage") {
      this.renderGarageView();
    } else {
      this.renderDashboard();
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const todayStr = new Date().toISOString().split("T")[0];
    if (modalId === "modal-fuel") {
      document.getElementById("fuel-input-date").value = todayStr;
      document.getElementById("fuel-input-odo").value = this.state.car.currentOdo;
    } else if (modalId === "modal-service") {
      document.getElementById("service-input-date").value = todayStr;
      document.getElementById("service-input-odo").value = this.state.car.currentOdo;
    }

    modal.classList.add("active");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  }

  openOdoModal() {
    document.getElementById("input-quick-odo-val").value = this.state.car.currentOdo;
    this.openModal("modal-odo");
    this.haptic("light");
  }

  openCarDocsModal() {
    document.getElementById("doc-input-plates").value = this.state.car.plates || "";
    document.getElementById("doc-input-vin").value = this.state.car.vin || "";
    document.getElementById("doc-input-ins-name").value = this.state.car.insuranceCompany || "";
    document.getElementById("doc-input-ins-policy").value = this.state.car.insurancePolicy || "";
    document.getElementById("doc-input-ins-phone").value = this.state.car.insurancePhone || "";
    document.getElementById("doc-input-verif").value = this.state.car.verificationMonth || "";
    this.openModal("modal-car-docs");
    this.haptic("light");
  }

  showToast(msg, icon = "✅") {
    const toast = document.getElementById("ios-toast");
    const iconEl = document.getElementById("toast-icon");
    const msgEl = document.getElementById("toast-msg");
    iconEl.textContent = icon;
    msgEl.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  // =============================================================================
  // 3. CÁLCULO DE TELEMETRÍA (KM/L, COSTO/KM, AUTONOMÍA)
  // =============================================================================

  calculateFuelTelemetry() {
    const logs = [...this.state.fuelLogs].sort((a, b) => a.odometer - b.odometer);
    if (logs.length < 2) {
      return {
        avgKml: 11.5,
        bestKml: 11.5,
        worstKml: 11.5,
        lastKml: 11.5,
        avgCostPerKm: 2.10,
        monthExpense: 0,
        estimatedRange: Math.round(this.state.car.tankCapacity * 0.75 * 11.5),
        historyKml: []
      };
    }

    let totalDist = 0;
    let totalLiters = 0;
    let totalCost = 0;
    const historyKml = [];
    let bestKml = 0;
    let worstKml = 999;

    for (let i = 1; i < logs.length; i++) {
      const prev = logs[i - 1];
      const curr = logs[i];
      const dist = curr.odometer - prev.odometer;

      if (dist > 0 && curr.liters > 0) {
        const kml = parseFloat((dist / curr.liters).toFixed(2));
        historyKml.push({ date: curr.date ? curr.date.slice(0, 10) : "", kml, odo: curr.odometer });

        if (kml > bestKml) bestKml = kml;
        if (kml < worstKml) worstKml = kml;

        totalDist += dist;
        totalLiters += curr.liters;
        totalCost += curr.totalCost;
      }
    }

    const avgKml = totalLiters > 0 ? parseFloat((totalDist / totalLiters).toFixed(2)) : 11.5;
    const avgCostPerKm = totalDist > 0 ? parseFloat((totalCost / totalDist).toFixed(2)) : 2.05;
    const lastKml = historyKml.length > 0 ? historyKml[historyKml.length - 1].kml : avgKml;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthExpense = logs
      .filter(l => (l.date || "").slice(0, 7) === currentMonth)
      .reduce((acc, curr) => acc + (parseFloat(curr.totalCost) || 0), 0);

    const estimatedRange = Math.round(this.state.car.tankCapacity * 0.75 * avgKml);

    return {
      avgKml,
      bestKml: bestKml > 0 ? bestKml : avgKml,
      worstKml: worstKml < 900 ? worstKml : avgKml,
      lastKml,
      avgCostPerKm,
      monthExpense: Math.round(monthExpense),
      estimatedRange,
      historyKml
    };
  }

  // =============================================================================
  // 4. RENDERIZADO GENERAL Y VISTAS
  // =============================================================================

  renderAll() {
    this.renderDashboard();
    this.renderFuelView();
    this.renderServiceView();
    this.renderGarageView();
  }

  renderDashboard() {
    const tele = this.calculateFuelTelemetry();
    const currentOdo = this.state.car.currentOdo;

    document.getElementById("dash-odo-val").textContent = Number(currentOdo).toLocaleString();
    document.getElementById("dash-kml-val").textContent = tele.avgKml;
    document.getElementById("dash-range-val").textContent = tele.estimatedRange;
    document.getElementById("dash-costkm-val").textContent = `$${tele.avgCostPerKm}`;

    // Semáforo de servicios
    const servicesStatus = this.getServicesCalculatedStatus();
    const nextService = servicesStatus[0];

    if (nextService) {
      const remainingKm = nextService.nextDueOdo - currentOdo;
      const kmLabel = remainingKm > 0 ? `${remainingKm.toLocaleString()}` : `Vencido (${Math.abs(remainingKm)})`;
      document.getElementById("dash-next-service-km").textContent = kmLabel;
      document.getElementById("dash-next-service-name").textContent = nextService.name;
    }

    // Alerta Banda de Distribución Aveo
    const timingBelt = servicesStatus.find(s => s.id === "timing_belt");
    const banner = document.getElementById("dash-timing-belt-banner");
    const bannerDesc = document.getElementById("dash-timing-belt-desc");
    
    if (timingBelt) {
      const remaining = timingBelt.nextDueOdo - currentOdo;
      if (remaining <= 0) {
        banner.style.background = "linear-gradient(90deg, rgba(239,68,68,0.3) 0%, rgba(220,38,38,0.15) 100%)";
        banner.style.borderColor = "#ef4444";
        bannerDesc.innerHTML = `<strong style="color:#ef4444;">¡URGENTE!</strong> Banda de distribución vencida por <strong>${Math.abs(remaining).toLocaleString()} km</strong>. Motor con interferencia: si se rompe dobla válvulas.`;
      } else if (remaining < 5000) {
        banner.style.borderColor = "#f59e0b";
        bannerDesc.innerHTML = `Quedan <strong>${remaining.toLocaleString()} km</strong> para el cambio preventivo del kit de distribución (banda + bomba + poleas).`;
      } else {
        banner.style.borderColor = "rgba(16,185,129,0.3)";
        bannerDesc.innerHTML = `Kit de distribución en orden. Próximo cambio en <strong>${remaining.toLocaleString()} km</strong> (${timingBelt.nextDueOdo.toLocaleString()} km).`;
      }
    }

    // Badge de salud general
    const healthBadge = document.getElementById("dash-health-badge");
    const healthText = document.getElementById("dash-health-text");
    const hasDue = servicesStatus.some(s => s.status === "due");
    const hasSoon = servicesStatus.some(s => s.status === "soon");

    if (hasDue) {
      healthBadge.style.background = "rgba(239, 68, 68, 0.18)";
      healthBadge.style.borderColor = "rgba(239, 68, 68, 0.4)";
      healthBadge.style.color = "#f87171";
      healthText.textContent = "ATENCION";
    } else if (hasSoon) {
      healthBadge.style.background = "rgba(245, 158, 11, 0.18)";
      healthBadge.style.borderColor = "rgba(245, 158, 11, 0.4)";
      healthBadge.style.color = "#fbbf24";
      healthText.textContent = "PREVENTIVO";
    } else {
      healthBadge.style.background = "rgba(16, 185, 129, 0.15)";
      healthBadge.style.borderColor = "rgba(16, 185, 129, 0.3)";
      healthBadge.style.color = "#34d399";
      healthText.textContent = "OPTIMO";
    }

    this.renderDashboardRecentList();
  }

  renderDashboardRecentList() {
    const listEl = document.getElementById("dash-recent-list");
    if (!listEl) return;

    const events = [];
    this.state.fuelLogs.forEach(f => {
      events.push({
        type: "fuel",
        title: `Carga Gasolina ${f.fuelType}`,
        subtitle: `${f.liters} L • ${f.station || "Estación"}`,
        date: (f.date || "").slice(0, 10),
        odo: f.odometer,
        cost: f.totalCost
      });
    });

    this.state.maintenanceLogs.forEach(s => {
      events.push({
        type: "service",
        title: s.title,
        subtitle: s.partsUsed || s.category,
        date: (s.date || "").slice(0, 10),
        odo: s.odometer,
        cost: s.cost,
        impact: s.aiImpact
      });
    });

    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = events.slice(0, 4);

    if (recent.length === 0) {
      listEl.innerHTML = `<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:0.8rem;">Sin movimientos registrados aún.</div>`;
      return;
    }

    listEl.innerHTML = recent.map(item => `
      <div class="item-row">
        <div class="item-row-top">
          <div class="item-left">
            <div class="item-icon-box" style="${item.type === 'fuel' ? 'color:#f59e0b;' : 'color:#06b6d4;'}">
              ${item.type === 'fuel' ? '⛽' : '🔧'}
            </div>
            <div class="item-title-col">
              <h4>${item.title}</h4>
              <p>${item.date} • ${item.odo.toLocaleString()} km</p>
            </div>
          </div>
          <div class="item-right">
            <div class="main-val">$${Number(item.cost).toFixed(0)}</div>
            <div class="sub-val">${item.impact ? `<span class="badge-impact ${item.impact}">${item.impact}</span>` : (item.type === 'fuel' ? 'Gasolina' : 'Servicio')}</div>
          </div>
        </div>
      </div>
    `).join("");
  }

  // =============================================================================
  // 5. VISTA DE GASOLINA CON ALERTA DE CAÍDA >15%
  // =============================================================================

  renderFuelView() {
    const tele = this.calculateFuelTelemetry();
    document.getElementById("fuel-avg-kml").textContent = tele.avgKml;
    document.getElementById("fuel-month-expense").textContent = `$${tele.monthExpense.toLocaleString()}`;
    document.getElementById("fuel-stat-badge-kml").textContent = `${tele.avgKml} km/L`;
    document.getElementById("fuel-best-kml").textContent = tele.bestKml;
    document.getElementById("fuel-worst-kml").textContent = tele.worstKml;
    document.getElementById("fuel-count-label").textContent = `${this.state.fuelLogs.length} cargas registradas`;

    this.renderFuelChart(tele.historyKml);

    const listEl = document.getElementById("fuel-history-list");
    if (!listEl) return;

    const sorted = [...this.state.fuelLogs].sort((a, b) => b.odometer - a.odometer);

    if (sorted.length === 0) {
      listEl.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.8rem;">No hay cargas registradas. Pulsa '+ Cargar Gas' para agregar tu primera carga.</div>`;
      return;
    }

    listEl.innerHTML = sorted.map((log, idx) => {
      let kmlText = "";
      const olderLog = sorted[idx + 1];
      if (olderLog && log.odometer > olderLog.odometer && log.liters > 0) {
        const kml = ((log.odometer - olderLog.odometer) / log.liters).toFixed(2);
        kmlText = `<span style="color:var(--telemetry-cyan); font-weight:700;">${kml} km/L</span> • `;
      }

      return `
        <div class="item-row">
          <div class="item-row-top">
            <div class="item-left">
              <div class="item-icon-box" style="color: ${log.fuelType === 'Premium' ? '#ef4444' : '#10b981'};">
                ⛽
              </div>
              <div class="item-title-col">
                <h4>${log.liters} L ${log.fuelType}</h4>
                <p>${(log.date || '').slice(0, 10)} • ${log.odometer.toLocaleString()} km • ${log.station || 'Gasolinera'}</p>
                ${log.notes ? `<div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">"${log.notes}"</div>` : ''}
              </div>
            </div>
            <div class="item-right">
              <div class="main-val">$${Number(log.totalCost).toFixed(2)}</div>
              <div class="sub-val">${kmlText}$${(log.totalCost / log.liters).toFixed(2)}/L</div>
            </div>
          </div>
          ${log.aiAnomalyNote ? `
            <div class="fuel-anomaly-box">
              <strong>🤖 Análisis de Anomalía Gemini:</strong><br>
              ${log.aiAnomalyNote}
            </div>
          ` : ''}
        </div>
      `;
    }).join("");
  }

  renderFuelChart(history) {
    const wrapper = document.getElementById("fuel-chart-wrapper");
    if (!wrapper) return;

    if (!history || history.length < 2) {
      wrapper.innerHTML = `
        <div style="height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:0.75rem;">
          Registra al menos 2 cargas completas para generar la curva de rendimiento.
        </div>
      `;
      return;
    }

    const width = 320;
    const height = 120;
    const paddingX = 24;
    const paddingY = 20;

    const values = history.map(h => h.kml);
    const minVal = Math.floor(Math.min(...values) - 0.5);
    const maxVal = Math.ceil(Math.max(...values) + 0.5);

    const getX = (i) => paddingX + (i / (history.length - 1)) * (width - paddingX * 2);
    const getY = (v) => height - paddingY - ((v - minVal) / (maxVal - minVal)) * (height - paddingY * 2);

    let pathD = `M ${getX(0)} ${getY(values[0])}`;
    for (let i = 1; i < history.length; i++) {
      pathD += ` L ${getX(i)} ${getY(values[i])}`;
    }

    const areaD = `${pathD} L ${getX(history.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

    const dots = history.map((h, i) => `
      <circle cx="${getX(i)}" cy="${getY(h.kml)}" r="4.5" fill="#06b6d4" stroke="#080b12" stroke-width="2"/>
      <text x="${getX(i)}" y="${getY(h.kml) - 8}" fill="#94a3b8" font-size="9" text-anchor="middle" font-weight="700">${h.kml}</text>
    `).join("");

    wrapper.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="overflow:visible;">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        
        <line x1="${paddingX}" y1="${getY(minVal)}" x2="${width - paddingX}" y2="${getY(minVal)}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3"/>
        <line x1="${paddingX}" y1="${getY(maxVal)}" x2="${width - paddingX}" y2="${getY(maxVal)}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3"/>

        <path d="${areaD}" fill="url(#chartGrad)"/>
        <path d="${pathD}" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        ${dots}
      </svg>
    `;
  }

  // =============================================================================
  // 6. VISTA DE BITÁCORA Y EVALUACIÓN ESTRUCTURADA CON GEMINI
  // =============================================================================

  getServicesCalculatedStatus() {
    const currentOdo = this.state.car.currentOdo;

    return this.state.maintenanceSchedule.map(s => {
      const nextDueOdo = s.lastDoneOdo + s.intervalKm;
      const kmRemaining = nextDueOdo - currentOdo;
      
      let status = "ok";
      if (kmRemaining <= 0) {
        status = "due";
      } else if (kmRemaining <= 2500) {
        status = "soon";
      }

      return {
        ...s,
        nextDueOdo,
        kmRemaining,
        status
      };
    }).sort((a, b) => a.kmRemaining - b.kmRemaining);
  }

  renderServiceView() {
    const listEl = document.getElementById("service-semaphore-list");
    if (!listEl) return;

    const services = this.getServicesCalculatedStatus();
    const hasDue = services.some(s => s.status === "due");
    
    const tabBadge = document.getElementById("tab-service-badge");
    if (tabBadge) tabBadge.style.display = hasDue ? "block" : "none";

    listEl.innerHTML = services.map(s => {
      let pillClass = "status-ok";
      let pillText = `En ${s.kmRemaining.toLocaleString()} km`;

      if (s.status === "due") {
        pillClass = "status-due";
        pillText = `⚠️ Vencido por ${Math.abs(s.kmRemaining).toLocaleString()} km`;
      } else if (s.status === "soon") {
        pillClass = "status-soon";
        pillText = `Próximo: ${s.kmRemaining.toLocaleString()} km`;
      }

      return `
        <div class="item-row" style="cursor:pointer;" onclick="app.quickRegisterService('${s.name}')">
          <div class="item-row-top">
            <div class="item-left">
              <div class="item-icon-box" style="${s.critical ? 'border-color: rgba(239,68,68,0.4); color: #f87171;' : ''}">
                ${s.critical ? '⚠️' : '🔧'}
              </div>
              <div class="item-title-col">
                <h4>${s.name}</h4>
                <p>Último: ${s.lastDoneOdo.toLocaleString()} km • Cada ${s.intervalKm.toLocaleString()} km</p>
              </div>
            </div>
            <div class="item-right">
              <div class="service-pill-status ${pillClass}">
                ${pillText}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    this.renderServiceHistoryList();
  }

  renderServiceHistoryList() {
    const histEl = document.getElementById("service-history-list");
    const countEl = document.getElementById("service-count-label");
    if (!histEl) return;

    const sorted = [...this.state.maintenanceLogs].sort((a, b) => b.odometer - a.odometer);
    if (countEl) countEl.textContent = `${sorted.length} servicios registrados`;

    if (sorted.length === 0) {
      histEl.innerHTML = `<div style="text-align:center; padding:18px; color:var(--text-muted); font-size:0.8rem;">Aún no hay servicios registrados en la bitácora.</div>`;
      return;
    }

    histEl.innerHTML = sorted.map(item => `
      <div class="item-row">
        <div class="item-row-top">
          <div class="item-left">
            <div class="item-icon-box" style="color:var(--telemetry-cyan);">
              🛠️
            </div>
            <div class="item-title-col">
              <h4>${item.title}</h4>
              <p>${(item.date || '').slice(0, 10)} • ${item.odometer.toLocaleString()} km • ${item.provider || 'Mecánico'}</p>
              ${item.partsUsed ? `<div style="font-size:0.68rem; color:var(--chevy-gold-light); margin-top:2px;">Refacciones: ${item.partsUsed}</div>` : ''}
            </div>
          </div>
          <div class="item-right">
            <div class="main-val">$${Number(item.cost || 0).toFixed(0)}</div>
            <div class="sub-val">${item.category || 'Mantenimiento'}</div>
          </div>
        </div>

        <!-- Tarjeta de Evaluación Estructurada con Gemini AI -->
        ${item.aiImpact ? `
          <div class="ai-evaluation-card">
            <div class="ai-eval-header">
              <span class="badge-impact ${item.aiImpact}">Impacto: ${item.aiImpact}</span>
              <span class="badge-price">Precio: ${item.aiPriceRating || 'Justo'}</span>
            </div>
            <div class="ai-eval-analysis">
              ${item.aiTechnicalAnalysis}
            </div>
            ${item.aiRelatedParts ? `
              <div class="ai-eval-related">
                🔍 <strong>Aprovechar para revisar:</strong> ${item.aiRelatedParts}
              </div>
            ` : ''}
            ${item.aiNextServiceKm ? `
              <div class="ai-eval-next">
                ⏱️ Próximo servicio sugerido: ${item.aiNextServiceKm.toLocaleString()} km
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `).join("");
  }

  quickRegisterService(serviceName) {
    this.openModal("modal-service");
    document.getElementById("service-input-title").value = serviceName;
    this.haptic("light");
  }

  // =============================================================================
  // 7. COPILOTO MECÁNICO ("PREGÚNTALE AL AVEO")
  // =============================================================================

  runCopilotQuery(query) {
    this.addChatMessage(query, "user");
    this.chatInput.value = "";
    this.processCopilotResponse(query);
  }

  handleChatSubmit() {
    const text = (this.chatInput.value || "").trim();
    if (!text) return;
    this.runCopilotQuery(text);
  }

  addChatMessage(text, sender = "bot") {
    const msgEl = document.createElement("div");
    msgEl.className = `chat-bubble ${sender}`;
    msgEl.innerHTML = text.replace(/\n/g, "<br>");
    this.chatMessages.appendChild(msgEl);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  async processCopilotResponse(query) {
    this.haptic("light");

    // 1. Intentar llamar al backend si está disponible
    if (this.apiBase) {
      try {
        const res = await fetch(`${this.apiBase}/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: query })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            this.addChatMessage(data.data.content, "bot");
            return;
          }
        }
      } catch (e) {
        console.warn("Falla en backend chat, usando copiloto offline:", e);
      }
    }

    // 2. Respuesta Offline del Copiloto Aveo
    const m = query.toLowerCase();
    let reply = "";

    if (m.includes("fusible") && (m.includes("encendedor") || m.includes("cigar") || m.includes("toma"))) {
      reply = "🔌 El fusible del encendedor / toma corriente de 12V es de **15 Amperios (CIGAR)** y se encuentra en la **caja de fusibles de la cabina interior** (al lado izquierdo del tablero, junto a la puerta del conductor).";
    } else if (m.includes("fusible") && (m.includes("bomba") || m.includes("gasolina"))) {
      reply = "⛽ El fusible de la bomba de gasolina es de **15A (F/PUMP)** y se encuentra en la **caja de fusibles del compartimento del motor** (cerca de la batería).";
    } else if (m.includes("hold") || m.includes("parpadea")) {
      reply = "⚠️ **Testigo HOLD parpadeando en Aveo 2011 (Automático):**\nIndica una falla en la transmisión automática de 4 velocidades o en el sensor de rango (pare/neutro).\n1. Revisa el nivel de fluido con motor encendido en caliente (lleva **ESSO JWS 3309 o TOTAL FLUID III G**, capacidad 5.6 L).\n2. Escanea el módulo TCM.\n3. Evita aceleraciones bruscas para proteger los embragues.";
    } else if (m.includes("presion") && m.includes("llanta")) {
      reply = "🛞 La presión oficial en frío para el Aveo 2011 (tanto para llantas 185/60 R14 como 185/55 R15) es de **33 PSI (230 kPa)** en las cuatro ruedas.";
    } else if (m.includes("aceite") && (m.includes("cual") || m.includes("viscosidad") || m.includes("lleva"))) {
      reply = "🛢️ El Aveo 2011 1.6L DOHC lleva aceite **SAE 5W-30** (clasificación API SM / ILSAC GF-IV o superior). En climas cálidos como Monterrey también se aprueba **10W-30**. La capacidad exacta es de **3.75 Litros con filtro**.";
    } else if (m.includes("banda") || m.includes("distribucion")) {
      reply = "⚠️ **¡Banda de Distribución del Aveo 1.6L!**\nEste motor F16D3 tiene **interferencia mecánica**. Si la banda se rompe, los pistones doblan las válvulas. El cambio preventivo debe hacerse cada **50,000 km o 3 años**, cambiando siempre el kit completo: banda dentada, bomba de agua, polea tensora y polea loca.";
    } else if (m.includes("tiembla") || m.includes("ralenti")) {
      reply = "🛑 **Temblor en ralentí en Aveo 1.6L:**\n1. Revisa si hay aceite en los tubos de bujías (falla clásica por junta de punterías desgastada).\n2. Verifica bujías **NGK BKR6E-11 calibradas a 1.0 - 1.1 mm**.\n3. Limpia la válvula IAC y el cuerpo de aceleración.";
    } else {
      reply = `He registrado tu consulta sobre el Aveo 2011 1.6L DOHC. Tu odómetro actual es de ${this.state.car.currentOdo.toLocaleString()} km. Recuerda que la presión de llantas debe mantenerse en 33 PSI y el aceite en SAE 5W-30 (3.75 L).`;
    }

    this.addChatMessage(reply, "bot");
  }

  // =============================================================================
  // 8. VISTA DE GARAJE & DOCUMENTACIÓN
  // =============================================================================

  renderGarageView() {
    const car = this.state.car;
    document.getElementById("garage-plates-val").textContent = car.plates || "Sin registrar";
    document.getElementById("garage-vin-val").textContent = car.vin || "Sin registrar";
    document.getElementById("garage-insurance-val").textContent = `${car.insuranceCompany || 'Aseguradora'} • ${car.insurancePolicy || 'Póliza'}`;
    
    const phoneEl = document.getElementById("garage-phone-val");
    if (car.insurancePhone) {
      phoneEl.innerHTML = `<a href="tel:${car.insurancePhone.replace(/\s/g, '')}" style="color:var(--telemetry-cyan); text-decoration:none;">📞 ${car.insurancePhone}</a>`;
    }
    document.getElementById("garage-verif-val").textContent = car.verificationMonth || "Mayo - Junio";
  }

  // =============================================================================
  // 9. SUBMITS DE FORMULARIOS (GASOLINA Y BITÁCORA)
  // =============================================================================

  async handleFuelSubmit(e) {
    e.preventDefault();
    const date = document.getElementById("fuel-input-date").value;
    const odometer = parseInt(document.getElementById("fuel-input-odo").value, 10);
    const liters = parseFloat(document.getElementById("fuel-input-liters").value);
    const totalCost = parseFloat(document.getElementById("fuel-input-total").value);
    const isFullTank = document.getElementById("fuel-input-full").checked;
    const station = document.getElementById("fuel-input-station").value.trim();

    const activeSeg = document.querySelector('.seg-btn[data-seg="fuel-type"].active');
    const fuelType = activeSeg ? activeSeg.dataset.val : "Magna";

    if (!odometer || !liters || !totalCost) {
      alert("Por favor completa los campos requeridos.");
      return;
    }

    const pricePerLiter = parseFloat((totalCost / liters).toFixed(2));

    // Si hay backend, enviar al servidor
    if (this.apiBase) {
      try {
        const res = await fetch(`${this.apiBase}/fuel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            odometer,
            liters,
            totalCost,
            pricePerLiter,
            fuelType,
            isFullTank,
            station,
            notes: station,
            date
          })
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success) {
            await this.syncWithBackend();
            this.closeModal("modal-fuel");
            this.showToast("Carga guardada con éxito", "⛽");
            this.haptic("heavy");
            return;
          }
        }
      } catch (err) {
        console.warn("Falla en backend fuel, guardando localmente:", err);
      }
    }

    // Modo local / Fallback
    const sorted = [...this.state.fuelLogs].sort((a, b) => a.odometer - b.odometer);
    let calculatedKml = null;
    let costPerKm = null;
    let aiAnomalyNote = null;

    if (sorted.length > 0) {
      const last = sorted[sorted.length - 1];
      const dist = odometer - last.odometer;
      if (dist > 0 && liters > 0) {
        calculatedKml = parseFloat((dist / liters).toFixed(2));
        costPerKm = parseFloat((totalCost / dist).toFixed(2));

        // Calcular promedio previo
        const tele = this.calculateFuelTelemetry();
        if (calculatedKml < tele.avgKml * 0.85) {
          const drop = Math.round(((tele.avgKml - calculatedKml) / tele.avgKml) * 100);
          aiAnomalyNote = `⚠️ Caída del ${drop}% en rendimiento (${calculatedKml} km/L vs promedio ${tele.avgKml} km/L). Revisar: 1) Presión de llantas a 33 PSI en frío, 2) Bujías BKR6E-11, 3) Filtro de aire, 4) Sensor de oxígeno o uso intensivo de A/C.`;
        }
      }
    }

    const newLog = {
      id: "f_" + Date.now(),
      date,
      odometer,
      liters,
      totalCost,
      pricePerLiter,
      fuelType,
      isFullTank,
      calculatedKml,
      costPerKm,
      station: station || "Estación de servicio",
      notes: station,
      aiAnomalyNote
    };

    this.state.fuelLogs.push(newLog);
    if (odometer > this.state.car.currentOdo) {
      this.state.car.currentOdo = odometer;
    }

    this.saveState();
    this.closeModal("modal-fuel");
    this.renderAll();
    this.showToast("Carga guardada (10s)", "⛽");
    this.haptic("heavy");
  }

  async handleServiceSubmit(e) {
    e.preventDefault();
    const category = document.getElementById("service-input-category").value;
    const provider = document.getElementById("service-input-who").value;
    const title = document.getElementById("service-input-title").value.trim();
    const date = document.getElementById("service-input-date").value;
    const odometer = parseInt(document.getElementById("service-input-odo").value, 10);
    const partsUsed = document.getElementById("service-input-parts").value.trim();
    const description = document.getElementById("service-input-desc").value.trim();
    const cost = parseFloat(document.getElementById("service-input-cost").value) || 0;

    const btnSubmit = document.getElementById("btn-submit-service");
    btnSubmit.textContent = "Evaluando con Gemini AI...";
    btnSubmit.disabled = true;

    // Si hay backend disponible
    if (this.apiBase) {
      try {
        const res = await fetch(`${this.apiBase}/maintenance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            provider,
            title,
            date,
            odometer,
            partsUsed,
            description,
            cost
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            await this.syncWithBackend();
            btnSubmit.textContent = "Guardar y Evaluar con IA";
            btnSubmit.disabled = false;
            this.closeModal("modal-service");
            this.showToast("Servicio evaluado con Gemini AI", "🤖");
            this.haptic("heavy");
            return;
          }
        }
      } catch (err) {
        console.warn("Falla en backend maintenance, guardando local:", err);
      }
    }

    // Fallback local estructurado
    let aiImpact = "BUENO";
    let aiPriceRating = "Justo";
    let aiTechnicalAnalysis = `Intervención registrada para el Aveo 2011 1.6L DOHC. Se evaluó de forma positiva para el cuidado del motor F16D3.`;
    let aiRelatedParts = "Niveles generales de fluidos (DEX-COOL, líquido de frenos y aceite).";
    let aiNextServiceKm = odometer + 10000;

    const lower = `${title} ${description}`.toLowerCase();
    if (lower.includes("banda") || lower.includes("distribuc")) {
      aiImpact = "BUENO";
      aiTechnicalAnalysis = "Intervención de máxima prioridad. Al ser motor con interferencia, cambiar kit de distribución y bomba previene rotura de válvulas.";
      aiRelatedParts = "Bomba de agua, retén de árbol de levas y cigüeñal.";
      aiNextServiceKm = odometer + 50000;
    } else if (lower.includes("aceite")) {
      aiImpact = "BUENO";
      aiTechnicalAnalysis = "Lubricación adecuada con SAE 5W-30 (3.75 L con filtro) para proteger los 16 buzos hidráulicos.";
      aiRelatedParts = "Filtro de aire y revisión de junta de punterías.";
      aiNextServiceKm = odometer + 6000;
    } else if (category === "Falla/Síntoma") {
      aiImpact = "MALO";
      aiTechnicalAnalysis = "Síntoma reportado en motor 1.6L. Inspeccionar a la brevedad para evitar daños mayores.";
    }

    const newService = {
      id: "m_" + Date.now(),
      date,
      odometer,
      category,
      title,
      description,
      partsUsed,
      cost,
      provider,
      aiImpact,
      aiPriceRating,
      aiTechnicalAnalysis,
      aiRelatedParts,
      aiNextServiceKm
    };

    this.state.maintenanceLogs.push(newService);
    if (odometer > this.state.car.currentOdo) {
      this.state.car.currentOdo = odometer;
    }

    this.saveState();
    btnSubmit.textContent = "Guardar y Evaluar con IA";
    btnSubmit.disabled = false;
    this.closeModal("modal-service");
    this.renderAll();
    this.showToast("Servicio registrado y evaluado", "🔧");
    this.haptic("heavy");
  }

  async handleOdoSubmit(e) {
    e.preventDefault();
    const newOdo = parseInt(document.getElementById("input-quick-odo-val").value, 10);
    if (newOdo && newOdo > 0) {
      this.state.car.currentOdo = newOdo;
      
      if (this.apiBase) {
        fetch(`${this.apiBase}/car`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentOdometer: newOdo })
        }).catch(() => {});
      }

      this.saveState();
      this.closeModal("modal-odo");
      this.renderAll();
      this.showToast(`Odómetro: ${newOdo.toLocaleString()} km`, "🔢");
      this.haptic("medium");
    }
  }

  handleCarDocsSubmit(e) {
    e.preventDefault();
    this.state.car.plates = document.getElementById("doc-input-plates").value.trim();
    this.state.car.vin = document.getElementById("doc-input-vin").value.trim();
    this.state.car.insuranceCompany = document.getElementById("doc-input-ins-name").value.trim();
    this.state.car.insurancePolicy = document.getElementById("doc-input-ins-policy").value.trim();
    this.state.car.insurancePhone = document.getElementById("doc-input-ins-phone").value.trim();
    this.state.car.verificationMonth = document.getElementById("doc-input-verif").value.trim();

    if (this.apiBase) {
      fetch(`${this.apiBase}/car`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plates: this.state.car.plates,
          vin: this.state.car.vin,
          insuranceCompany: this.state.car.insuranceCompany,
          insurancePolicy: this.state.car.insurancePolicy,
          insurancePhone: this.state.car.insurancePhone,
          verificationMonth: this.state.car.verificationMonth
        })
      }).catch(() => {});
    }

    this.saveState();
    this.closeModal("modal-car-docs");
    this.renderGarageView();
    this.showToast("Documentación guardada", "📋");
    this.haptic("medium");
  }

  exportBackupJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const dlAnchorElem = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `AveoLog_Backup_${dateStr}.json`);
    dlAnchorElem.click();
    this.showToast("Respaldo descargado", "📤");
    this.haptic("medium");
  }

  importBackupJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.car && parsed.maintenanceLogs) {
          this.state = parsed;
          this.saveState();
          this.renderAll();
          this.showToast("Respaldo restaurado con éxito", "✅");
          this.haptic("heavy");
        } else {
          alert("El archivo no tiene el formato válido de AveoLog AI.");
        }
      } catch (err) {
        alert("Error al leer el archivo JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  checkSafariPwaBanner() {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    const hideBanner = sessionStorage.getItem("aveolog_hide_ios_banner");

    if (isIos && !isStandalone && !hideBanner) {
      const banner = document.getElementById("ios-install-banner");
      if (banner) {
        setTimeout(() => {
          banner.style.display = "block";
        }, 1200);
      }
    }
  }

  registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").then((reg) => {
          console.log("AveoLog ServiceWorker activo:", reg.scope);
        }).catch(() => {});
      });
    }
  }
}

// Inicializar la aplicación
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new AveoLogApp();
});
