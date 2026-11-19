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
    currentOdo: 0,
    plates: "",
    vin: "",
    insuranceCompany: "",
    insurancePolicy: "",
    insurancePhone: "",
    verificationMonth: "",
    geminiApiKey: ""
  },
  
  // Servicios Preventivos Oficiales Calibrados para Aveo 2011 1.6L DOHC (Limpios para datos reales)
  maintenanceSchedule: [
    {
      id: "timing_belt",
      name: "Banda de Distribución (Kit Completo)",
      intervalKm: 50000,
      intervalMonths: 36,
      lastDoneOdo: 0,
      lastDoneDate: null,
      critical: true,
      description: "¡CRÍTICO! Motor con interferencia: si la banda se rompe, se doblan las 16 válvulas. Cambiar banda, bomba de agua, tensor y polea loca."
    },
    {
      id: "engine_oil",
      name: "Aceite SAE 5W-30 y Filtro",
      intervalKm: 6000,
      intervalMonths: 6,
      lastDoneOdo: 0,
      lastDoneDate: null,
      critical: false,
      description: "Capacidad: 3.75 L con filtro. Usar sintético o semisintético SAE 5W-30 (o 10W-30) API SM/SN."
    },
    {
      id: "spark_plugs",
      name: "Bujías NGK BKR6E-11 (1.0-1.1 mm) y Cables",
      intervalKm: 20000,
      intervalMonths: 12,
      lastDoneOdo: 0,
      lastDoneDate: null,
      critical: false,
      description: "Bujías calibradas a 1.0 - 1.1 mm. Inspeccionar pozos por fugas de aceite de junta de punterías."
    },
    {
      id: "air_filter",
      name: "Filtro de Aire de Motor",
      intervalKm: 12000,
      intervalMonths: 12,
      lastDoneOdo: 0,
      lastDoneDate: null,
      critical: false,
      description: "Mantiene la mezcla aire/combustible óptima y protege el sensor MAP."
    },
    {
      id: "fuel_filter",
      name: "Filtro de Gasolina (Línea de Chasis)",
      intervalKm: 15000,
      intervalMonths: 12,
      lastDoneOdo: 0,
      lastDoneDate: null,
      critical: false,
      description: "Ubicado abajo junto al tanque. Protege inyectores y bomba de combustible."
    },
    {
      id: "coolant_thermostat",
      name: "Anticongelante DEX-COOL y Termostato",
      intervalKm: 40000,
      intervalMonths: 24,
      lastDoneOdo: 0,
      lastDoneDate: null,
      critical: true,
      description: "6.3 Litros mezcla 50/50. Inspeccionar carcasa plástica del termostato (reemplazo sugerido a aluminio)."
    },
    {
      id: "brakes_front",
      name: "Balatas Delanteras y Líquido DOT 3/4",
      intervalKm: 25000,
      intervalMonths: 18,
      lastDoneOdo: 0,
      lastDoneDate: null,
      critical: true,
      description: "Sistema en X: revisar balatas cerámicas, discos ventilados y purgado."
    },
    {
      id: "throttle_iac",
      name: "Limpieza Cuerpo de Aceleración e IAC",
      intervalKm: 20000,
      intervalMonths: 12,
      lastDoneOdo: 0,
      lastDoneDate: null,
      critical: false,
      description: "Elimina carbonilla para evitar ralentí inestable y que el auto se apague con el A/C."
    },
    {
      id: "suspension_front",
      name: "Bujes de Horquilla y Bieletas Delanteras",
      intervalKm: 30000,
      intervalMonths: 18,
      lastDoneOdo: 0,
      lastDoneDate: null,
      critical: false,
      description: "Evita golpeteos metálicos al pasar baches o topes en Aveo."
    }
  ],

  // Cargas de Gasolina Iniciales (Vacío para datos reales)
  fuelLogs: [],

  // Bitácora de Mantenimiento (Vacío para datos reales)
  maintenanceLogs: []
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
      // Borrar cache antigua v2 con datos inventados
      localStorage.removeItem("aveolog_ai_v2_state");
      const saved = localStorage.getItem("aveolog_ai_v3_clean_state");
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
      localStorage.setItem("aveolog_ai_v3_clean_state", JSON.stringify(this.state));
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
    document.getElementById("dash-btn-scan-cluster")?.addEventListener("click", () => {
      this.openScanClusterModal();
      this.haptic("light");
    });
    document.getElementById("btn-quick-scan")?.addEventListener("click", () => {
      this.openScanClusterModal();
      this.haptic("light");
    });
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

    // Eventos del Escáner Efímero de Tablero (Cámara y Galería de Fotos)
    document.getElementById("input-scan-camera-file")?.addEventListener("change", (e) => this.handleDashboardImageSelected(e));
    document.getElementById("input-scan-gallery-file")?.addEventListener("change", (e) => this.handleDashboardImageSelected(e));
    document.getElementById("btn-scan-apply-odo")?.addEventListener("click", () => this.applyScannedOdometer());
    document.getElementById("btn-scan-save-symptom")?.addEventListener("click", () => this.saveScannedSymptomToLog());

    // Guardar API Key y Resetear Datos
    document.getElementById("btn-save-gemini-key")?.addEventListener("click", () => this.saveGeminiKeyFromUI());
    document.getElementById("btn-reset-all-data")?.addEventListener("click", () => this.resetAllDataConfirm());

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
    if (this.currentView === viewId) return;

    const viewOrder = ["view-dashboard", "view-fuel", "view-service", "view-diag", "view-garage"];
    const prevIdx = viewOrder.indexOf(this.currentView);
    const nextIdx = viewOrder.indexOf(viewId);
    const slideClass = nextIdx >= prevIdx ? "slide-from-right" : "slide-from-left";

    const performSwitch = () => {
      this.currentView = viewId;
      this.tabButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.view === viewId);
      });
      this.views.forEach(v => {
        v.classList.remove("active", "slide-from-right", "slide-from-left");
        if (v.id === viewId) {
          v.classList.add("active", slideClass);
        }
      });

      const scrollElem = document.getElementById("main-scroll");
      if (scrollElem) scrollElem.scrollTop = 0;

      if (viewId === "view-fuel") {
        this.renderFuelView();
      } else if (viewId === "view-service") {
        this.renderServiceView();
      } else if (viewId === "view-garage") {
        this.renderGarageView();
      } else if (viewId === "view-dashboard") {
        this.renderDashboard();
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(() => performSwitch());
    } else {
      performSwitch();
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

    if (!currentOdo || currentOdo <= 0) {
      document.getElementById("dash-next-service-km").textContent = "---";
      document.getElementById("dash-next-service-name").textContent = "Ingresa tu km real";
    } else if (nextService) {
      if (!nextService.lastDoneOdo || nextService.lastDoneOdo <= 0) {
        document.getElementById("dash-next-service-km").textContent = "Pendiente";
        document.getElementById("dash-next-service-name").textContent = nextService.name;
      } else {
        const remainingKm = nextService.nextDueOdo - currentOdo;
        const kmLabel = remainingKm > 0 ? `${remainingKm.toLocaleString()}` : `Vencido (${Math.abs(remainingKm)})`;
        document.getElementById("dash-next-service-km").textContent = kmLabel;
        document.getElementById("dash-next-service-name").textContent = nextService.name;
      }
    }

    // Alerta Banda de Distribución Aveo
    const timingBelt = servicesStatus.find(s => s.id === "timing_belt");
    const banner = document.getElementById("dash-timing-belt-banner");
    const bannerDesc = document.getElementById("dash-timing-belt-desc");
    
    if (timingBelt) {
      if (!timingBelt.lastDoneOdo || timingBelt.lastDoneOdo <= 0) {
        banner.style.background = "var(--bg-app)";
        bannerDesc.innerHTML = `Registra en Bitácora cuándo hiciste el último cambio de banda de distribución (se cambia cada <strong>50,000 km</strong>; motor con interferencia).`;
      } else {
        const remaining = timingBelt.nextDueOdo - currentOdo;
        if (remaining <= 0) {
          banner.style.background = "var(--status-danger-bg)";
          bannerDesc.innerHTML = `<strong style="color:var(--status-danger);">Urgente:</strong> Banda de distribución vencida por <strong>${Math.abs(remaining).toLocaleString()} km</strong>. Motor con interferencia: si se rompe dobla válvulas.`;
        } else if (remaining < 5000) {
          banner.style.background = "var(--status-warn-bg)";
          bannerDesc.innerHTML = `Quedan <strong>${remaining.toLocaleString()} km</strong> para el cambio preventivo del kit de distribución (banda + bomba + poleas).`;
        } else {
          banner.style.background = "var(--status-good-bg)";
          bannerDesc.innerHTML = `Kit de distribución al día. Próximo cambio en <strong>${remaining.toLocaleString()} km</strong> (${timingBelt.nextDueOdo.toLocaleString()} km).`;
        }
      }
    }

    // Badge de salud general
    const healthBadge = document.getElementById("dash-health-badge");
    const healthText = document.getElementById("dash-health-text");
    const hasDue = servicesStatus.some(s => s.status === "due");
    const hasSoon = servicesStatus.some(s => s.status === "soon");

    if (hasDue) {
      healthBadge.style.background = "var(--status-danger-bg)";
      healthBadge.style.color = "var(--status-danger)";
      healthText.textContent = "ATENCIÓN";
    } else if (hasSoon) {
      healthBadge.style.background = "var(--status-warn-bg)";
      healthBadge.style.color = "var(--status-warn)";
      healthText.textContent = "PREVENTIVO";
    } else {
      healthBadge.style.background = "var(--status-good-bg)";
      healthBadge.style.color = "var(--status-good)";
      healthText.textContent = "ÓPTIMO";
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
      listEl.innerHTML = `<div style="text-align:center; padding:18px; color:var(--text-muted); font-size:0.8rem;">Sin movimientos registrados aún.</div>`;
      return;
    }

    const fuelSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22L15 22"/><path d="M4 9L14 9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>`;
    const wrenchSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;

    listEl.innerHTML = recent.map(item => `
      <div class="item-row">
        <div class="item-row-top">
          <div class="item-left">
            <div class="item-icon-box">
              ${item.type === 'fuel' ? fuelSvg : wrenchSvg}
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
    document.getElementById("fuel-count-label").textContent = `${this.state.fuelLogs.length} registros`;

    this.renderFuelChart(tele.historyKml);

    const listEl = document.getElementById("fuel-history-list");
    if (!listEl) return;

    const sorted = [...this.state.fuelLogs].sort((a, b) => b.odometer - a.odometer);

    if (sorted.length === 0) {
      listEl.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.8rem;">No hay cargas registradas. Toca '+ Registrar Carga' para agregar tu primera carga.</div>`;
      return;
    }

    const fuelSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22L15 22"/><path d="M4 9L14 9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>`;

    listEl.innerHTML = sorted.map((log, idx) => {
      let kmlText = "";
      const olderLog = sorted[idx + 1];
      if (olderLog && log.odometer > olderLog.odometer && log.liters > 0) {
        const kml = ((log.odometer - olderLog.odometer) / log.liters).toFixed(2);
        kmlText = `<span style="color:var(--accent-blue); font-weight:600;">${kml} km/L</span> • `;
      }

      return `
        <div class="item-row">
          <div class="item-row-top">
            <div class="item-left">
              <div class="item-icon-box" style="color: ${log.fuelType === 'Premium' ? 'var(--status-danger)' : 'var(--status-good)'};">
                ${fuelSvg}
              </div>
              <div class="item-title-col">
                <h4>${log.liters} L ${log.fuelType}</h4>
                <p>${(log.date || '').slice(0, 10)} • ${log.odometer.toLocaleString()} km • ${log.station || 'Gasolinera'}</p>
                ${log.notes ? `<div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">"${log.notes}"</div>` : ''}
              </div>
            </div>
            <div class="item-right">
              <div class="main-val">$${Number(log.totalCost).toFixed(2)}</div>
              <div class="sub-val">${kmlText}$${(log.totalCost / log.liters).toFixed(2)}/L</div>
            </div>
          </div>
          ${log.aiAnomalyNote ? `
            <div class="fuel-anomaly-box">
              <strong>Diagnóstico de Anomalía Gemini:</strong><br>
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
        <div style="height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:0.76rem;">
          Registra al menos 2 cargas completas para trazar la curva de rendimiento.
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
      <circle cx="${getX(i)}" cy="${getY(h.kml)}" r="4" fill="#1D1D1F" stroke="#FFFFFF" stroke-width="2"/>
      <text x="${getX(i)}" y="${getY(h.kml) - 8}" fill="#1D1D1F" font-size="9.5" text-anchor="middle" font-weight="600">${h.kml}</text>
    `).join("");

    wrapper.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="overflow:visible;">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1D1D1F" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#1D1D1F" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        
        <line x1="${paddingX}" y1="${getY(minVal)}" x2="${width - paddingX}" y2="${getY(minVal)}" stroke="rgba(60,60,67,0.12)" stroke-dasharray="3,3"/>
        <line x1="${paddingX}" y1="${getY(maxVal)}" x2="${width - paddingX}" y2="${getY(maxVal)}" stroke="rgba(60,60,67,0.12)" stroke-dasharray="3,3"/>

        <path d="${areaD}" fill="url(#chartGrad)"/>
        <path d="${pathD}" fill="none" stroke="#1D1D1F" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
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
      // Buscar si ya hay un registro real en maintenanceLogs que corresponda a este servicio
      let lastDoneOdo = s.lastDoneOdo || 0;
      const keywords = s.name.toLowerCase().split(" ").filter(w => w.length > 3);
      this.state.maintenanceLogs.forEach(log => {
        const logText = `${log.title || ""} ${log.partsUsed || ""}`.toLowerCase();
        if (
          (s.id === "timing_belt" && (logText.includes("banda") || logText.includes("distribuc"))) ||
          (s.id === "engine_oil" && logText.includes("aceite")) ||
          (s.id === "spark_plugs" && (logText.includes("bujia") || logText.includes("bujía"))) ||
          (s.id === "air_filter" && logText.includes("filtro") && logText.includes("aire")) ||
          (s.id === "fuel_filter" && logText.includes("filtro") && logText.includes("gasolina")) ||
          (s.id === "coolant_thermostat" && (logText.includes("anticongelante") || logText.includes("termostato") || logText.includes("dex-cool"))) ||
          (s.id === "brakes_front" && (logText.includes("balata") || logText.includes("freno"))) ||
          (s.id === "throttle_iac" && (logText.includes("aceleracion") || logText.includes("iac"))) ||
          (s.id === "suspension_front" && (logText.includes("horquilla") || logText.includes("bieleta") || logText.includes("amortiguador")))
        ) {
          if (log.odometer > lastDoneOdo) {
            lastDoneOdo = log.odometer;
          }
        }
      });

      if (!lastDoneOdo || lastDoneOdo <= 0 || !currentOdo || currentOdo <= 0) {
        return {
          ...s,
          lastDoneOdo: 0,
          nextDueOdo: s.intervalKm,
          kmRemaining: s.intervalKm,
          status: "pending"
        };
      }

      const nextDueOdo = lastDoneOdo + s.intervalKm;
      const kmRemaining = nextDueOdo - currentOdo;
      
      let status = "ok";
      if (kmRemaining <= 0) {
        status = "due";
      } else if (kmRemaining <= 2500) {
        status = "soon";
      }

      return {
        ...s,
        lastDoneOdo,
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

    const alertSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    const wrenchSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;

    listEl.innerHTML = services.map(s => {
      let pillClass = "status-ok";
      let pillText = `En ${s.kmRemaining.toLocaleString()} km`;

      if (s.status === "pending") {
        pillClass = "status-soon";
        pillText = `Registrar último`;
      } else if (s.status === "due") {
        pillClass = "status-due";
        pillText = `Vencido por ${Math.abs(s.kmRemaining).toLocaleString()} km`;
      } else if (s.status === "soon") {
        pillClass = "status-soon";
        pillText = `Próximo: ${s.kmRemaining.toLocaleString()} km`;
      }

      const lastLabel = s.lastDoneOdo > 0 ? `Último: ${s.lastDoneOdo.toLocaleString()} km` : `Sin registro previo`;

      return `
        <div class="item-row" style="cursor:pointer;" onclick="app.quickRegisterService('${s.name}')">
          <div class="item-row-top">
            <div class="item-left">
              <div class="item-icon-box" style="${s.critical ? 'color: var(--status-danger);' : ''}">
                ${s.critical ? alertSvg : wrenchSvg}
              </div>
              <div class="item-title-col">
                <h4>${s.name}</h4>
                <p>${lastLabel} • Cada ${s.intervalKm.toLocaleString()} km</p>
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
    if (countEl) countEl.textContent = `${sorted.length} servicios`;

    if (sorted.length === 0) {
      histEl.innerHTML = `<div style="text-align:center; padding:18px; color:var(--text-muted); font-size:0.8rem;">Aún no hay servicios registrados en la bitácora.</div>`;
      return;
    }

    const wrenchSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;

    histEl.innerHTML = sorted.map(item => `
      <div class="item-row">
        <div class="item-row-top">
          <div class="item-left">
            <div class="item-icon-box">
              ${wrenchSvg}
            </div>
            <div class="item-title-col">
              <h4>${item.title}</h4>
              <p>${(item.date || '').slice(0, 10)} • ${item.odometer.toLocaleString()} km • ${item.provider || 'Mecánico'}</p>
              ${item.partsUsed ? `<div style="font-size:0.71rem; color:var(--text-secondary); margin-top:2px;">Refacciones: ${item.partsUsed}</div>` : ''}
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
                <strong>Revisar también:</strong> ${item.aiRelatedParts}
              </div>
            ` : ''}
            ${item.aiNextServiceKm ? `
              <div class="ai-eval-next">
                Próximo servicio sugerido: ${item.aiNextServiceKm.toLocaleString()} km
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
        console.warn("Falla en backend chat, intentando Gemini directo o fallback:", e);
      }
    }

    // 1.5 Si no hay backend (iPhone / GitHub Pages) pero hay API Key guardada en el dispositivo, llamar directo a Gemini
    if (this.state.car.geminiApiKey) {
      try {
        const directReply = await this.callGeminiChatDirectly(query, this.state.car.geminiApiKey);
        if (directReply) {
          this.addChatMessage(directReply, "bot");
          return;
        }
      } catch (e) {
        console.warn("Error en Gemini Chat directo, usando respuesta offline:", e);
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
    document.getElementById("garage-insurance-val").textContent =
      (car.insuranceCompany || car.insurancePolicy)
        ? `${car.insuranceCompany || ''} ${car.insurancePolicy ? '• ' + car.insurancePolicy : ''}`.trim()
        : "Sin registrar";
    
    const phoneEl = document.getElementById("garage-phone-val");
    if (car.insurancePhone) {
      phoneEl.innerHTML = `<a href="tel:${car.insurancePhone.replace(/\s/g, '')}" style="color:var(--telemetry-cyan); text-decoration:none;">📞 ${car.insurancePhone}</a>`;
    } else {
      phoneEl.textContent = "Sin registrar";
    }
    document.getElementById("garage-verif-val").textContent = car.verificationMonth || "Sin registrar";

    const keyInput = document.getElementById("garage-gemini-key-input");
    if (keyInput) {
      keyInput.value = car.geminiApiKey || "";
    }
  }

  saveGeminiKeyFromUI() {
    const keyInput = document.getElementById("garage-gemini-key-input");
    if (!keyInput) return;
    this.state.car.geminiApiKey = keyInput.value.trim();
    this.saveState();
    this.showToast(this.state.car.geminiApiKey ? "Clave Gemini AI guardada" : "Clave Gemini eliminada", "🔑");
    this.haptic("medium");
  }

  async resetAllDataConfirm() {
    const ok = confirm("¿Seguro que deseas borrar TODOS los registros y dejar la app limpia desde cero?");
    if (!ok) return;

    const existingKey = this.state.car?.geminiApiKey || "";
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.state.car.geminiApiKey = existingKey;
    this.saveState();

    if (this.apiBase) {
      try {
        await fetch(`${this.apiBase}/reset`, { method: "POST" });
      } catch (e) {}
    }

    this.renderAll();
    this.showToast("Base de datos limpia desde cero", "🗑️");
    this.haptic("heavy");
  }

  // =============================================================================
  // 8.5 ESCÁNER MULTIMODAL EFÍMERO DE TABLERO (CÁMARA -> IA -> BORRADO INMEDIATO)
  // =============================================================================

  openScanClusterModal() {
    this.lastScanResult = null;
    const loadingBox = document.getElementById("scan-loading-box");
    const resultBox = document.getElementById("scan-result-box");
    const camInput = document.getElementById("input-scan-camera-file");
    const galInput = document.getElementById("input-scan-gallery-file");
    if (loadingBox) loadingBox.style.display = "none";
    if (resultBox) resultBox.style.display = "none";
    if (camInput) camInput.value = "";
    if (galInput) galInput.value = "";
    this.openModal("modal-scan-cluster");
  }

  /**
   * Comprime la foto en un Canvas efímero en RAM (máx 1024px) para enviarla rápido a Gemini
   * y destruye inmediatamente el Canvas, el File y el Buffer después de extraer el base64.
   */
  compressImageToEphemeralBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1024;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.78);

          // Destruir el canvas y la imagen en memoria inmediatamente
          ctx.clearRect(0, 0, w, h);
          canvas.width = 0;
          canvas.height = 0;
          img.src = "";

          resolve(dataUrl.replace(/^data:image\/jpeg;base64,/, ""));
        };
        img.onerror = () => reject(new Error("No se pudo decodificar la imagen."));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Error leyendo la fotografía."));
      reader.readAsDataURL(file);
    });
  }

  async handleDashboardImageSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const loadingBox = document.getElementById("scan-loading-box");
    const resultBox = document.getElementById("scan-result-box");
    if (loadingBox) loadingBox.style.display = "block";
    if (resultBox) resultBox.style.display = "none";

    let ephemeralBase64 = null;
    try {
      ephemeralBase64 = await this.compressImageToEphemeralBase64(file);

      // Limpiar inmediatamente el input file del DOM para no retener el archivo en memoria del navegador
      event.target.value = "";

      let analysis = null;

      // 1. Intentar analizar vía Backend (/api/ai/analyze-dashboard)
      if (this.apiBase) {
        try {
          const res = await fetch(`${this.apiBase}/ai/analyze-dashboard`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: ephemeralBase64,
              mimeType: "image/jpeg",
              apiKey: this.state.car.geminiApiKey || ""
            })
          });
          const resJson = await res.json();
          if (res.ok && resJson.success && resJson.data) {
            analysis = resJson.data;
          } else if (resJson.error && !this.state.car.geminiApiKey) {
            throw new Error(resJson.error);
          }
        } catch (err) {
          if (!this.state.car.geminiApiKey) {
            throw err;
          }
        }
      }

      // 2. Si estamos en GitHub Pages (sin backend) o con API Key local en el iPhone, llamar directo a Gemini Vision
      if (!analysis) {
        const localKey = this.state.car.geminiApiKey;
        if (!localKey) {
          throw new Error("Para analizar fotos del tablero necesitas configurar tu GEMINI_API_KEY en la pestaña 'Manual' (o en el archivo .env de tu servidor).");
        }
        analysis = await this.callGeminiVisionDirectly(ephemeralBase64, localKey);
      }

      // 3. BORRADO TOTAL DE LA FOTO EN MEMORIA (Solo conservamos el JSON extraído)
      ephemeralBase64 = null;

      this.lastScanResult = analysis;
      this.renderScanClusterResult(analysis);
      this.showToast("Datos extraídos • Foto eliminada", "🗑️");
      this.haptic("heavy");
    } catch (err) {
      ephemeralBase64 = null;
      event.target.value = "";
      if (loadingBox) loadingBox.style.display = "none";
      alert("No se pudo analizar la foto: " + err.message);
    }
  }

  async invokeGeminiDirectWithFallback(payload, apiKey) {
    const models = ["gemini-3.8-flash", "gemini-2.5-flash"];
    let lastError = null;

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return await res.json();
      }

      const txt = await res.text();
      lastError = new Error(`Error Gemini (${res.status}): ${txt}`);
      if (res.status !== 404) {
        throw lastError;
      }
    }

    throw lastError;
  }

  async callGeminiVisionDirectly(cleanBase64, apiKey) {
    const prompt = `
Eres el Ingeniero Jefe del Chevrolet Aveo 2011 Sedán 1.6L 16V DOHC (F16D3).
Analiza esta foto del tablero. Extrae el kilometraje total (odometro_detectado como entero o null), testigos encendidos, nivel de gasolina, temperatura del motor, nivel de alerta (OPTIMO, PREVENTIVO, ATENCION, CRITICO), diagnóstico técnico y acción recomendada.
`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            odometro_detectado: { type: "INTEGER", nullable: true },
            nivel_combustible_aprox: { type: "STRING" },
            temperatura_motor: { type: "STRING" },
            rpm_aprox: { type: "INTEGER", nullable: true },
            testigos_encendidos: { type: "ARRAY", items: { type: "STRING" } },
            nivel_alerta: { type: "STRING", enum: ["OPTIMO", "PREVENTIVO", "ATENCION", "CRITICO"] },
            diagnostico_tablero: { type: "STRING" },
            accion_recomendada: { type: "STRING" }
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

    const data = await this.invokeGeminiDirectWithFallback(payload, apiKey);
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(raw);
  }

  async callGeminiChatDirectly(userMessage, apiKey) {
    const prompt = `
Eres "Copiloto Aveo AI", mecánico experto del Chevrolet Aveo 2011 Sedán 1.6L 16V DOHC (F16D3).
Odómetro actual: ${this.state.car.currentOdo || 0} km.
Datos técnicos oficiales: Banda de distribución con interferencia mecánica (cambio cada 50,000 km), Aceite SAE 5W-30 3.75L con filtro, Refrigerante DEX-COOL 6.3L, Bujías NGK BKR6E-11 (1.0-1.1mm), Llantas 33 PSI en frío, Fusibles: CIGAR 15A (cabina), OBD 10A (cabina), Bomba gasolina F/PUMP 15A (motor), ECU 10A (motor), Ventilador 20A/30A (motor).
Últimos mantenimientos del auto: ${JSON.stringify(this.state.maintenanceLogs.slice(-6))}
Últimas cargas de gasolina: ${JSON.stringify(this.state.fuelLogs.slice(-4))}

Pregunta del conductor: ${userMessage}
Responde breve, directo y preciso en español de México.
`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3 }
    };
    const data = await this.invokeGeminiDirectWithFallback(payload, apiKey);
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }

  async callGeminiMaintenanceEvalDirectly(entry, apiKey) {
    const prompt = `
Evalúa este mantenimiento o síntoma para un Chevrolet Aveo 2011 Sedán 1.6L 16V DOHC (Motor F16D3 con interferencia mecánica):
- Categoría: ${entry.category}
- Título: ${entry.title}
- Descripción: ${entry.description}
- Piezas: ${entry.partsUsed}
- Costo: $${entry.cost} MXN
- Odómetro: ${entry.odometer} km
`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            impacto: { type: "STRING", enum: ["BUENO", "NORMAL", "MALO", "CRITICO"] },
            calificacion_precio: { type: "STRING", enum: ["Justo", "Alto", "Bajo"] },
            analisis_tecnico: { type: "STRING" },
            piezas_relacionadas: { type: "STRING" },
            proximo_servicio_km: { type: "INTEGER" }
          },
          required: ["impacto", "calificacion_precio", "analisis_tecnico", "piezas_relacionadas", "proximo_servicio_km"]
        }
      }
    };
    const data = await this.invokeGeminiDirectWithFallback(payload, apiKey);
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return raw ? JSON.parse(raw) : null;
  }

  renderScanClusterResult(res) {
    const loadingBox = document.getElementById("scan-loading-box");
    const resultBox = document.getElementById("scan-result-box");
    if (loadingBox) loadingBox.style.display = "none";
    if (resultBox) resultBox.style.display = "block";

    const odoEl = document.getElementById("scan-res-odo");
    const gaugesEl = document.getElementById("scan-res-gauges");
    const lightsEl = document.getElementById("scan-res-lights");
    const diagEl = document.getElementById("scan-res-diag");
    const actionEl = document.getElementById("scan-res-action");
    const badgeEl = document.getElementById("scan-res-alert-badge");
    const btnApplyOdo = document.getElementById("btn-scan-apply-odo");

    if (res.odometro_detectado && res.odometro_detectado > 0) {
      odoEl.innerHTML = `${Number(res.odometro_detectado).toLocaleString()}<small>km</small>`;
      btnApplyOdo.style.display = "flex";
      btnApplyOdo.textContent = `Aplicar ${Number(res.odometro_detectado).toLocaleString()} km al Odómetro`;
    } else {
      odoEl.textContent = "No visible";
      btnApplyOdo.style.display = "none";
    }

    gaugesEl.textContent = `Gas: ${res.nivel_combustible_aprox || 'N/A'} • Temp: ${res.temperatura_motor || 'N/A'}`;

    if (Array.isArray(res.testigos_encendidos) && res.testigos_encendidos.length > 0) {
      lightsEl.innerHTML = res.testigos_encendidos
        .map(t => `<span style="display:inline-block; background:var(--status-danger-bg); color:var(--status-danger); padding:3px 9px; border-radius:999px; font-size:0.72rem; font-weight:600; margin:2px;">${t}</span>`)
        .join(" ");
    } else {
      lightsEl.innerHTML = `<span style="color:var(--status-good); font-weight:600;">Ningún testigo de falla encendido</span>`;
    }

    diagEl.textContent = res.diagnostico_tablero || "";
    actionEl.textContent = res.accion_recomendada || "";

    const alertMap = { OPTIMO: "BUENO", PREVENTIVO: "NORMAL", ATENCION: "MALO", CRITICO: "CRITICO" };
    badgeEl.className = `badge-impact ${alertMap[res.nivel_alerta] || "NORMAL"}`;
    badgeEl.textContent = res.nivel_alerta || "ANALIZADO";
  }

  applyScannedOdometer() {
    if (!this.lastScanResult || !this.lastScanResult.odometro_detectado) return;
    const newOdo = parseInt(this.lastScanResult.odometro_detectado, 10);
    if (!newOdo || newOdo <= 0) return;

    this.state.car.currentOdo = newOdo;
    if (this.apiBase) {
      fetch(`${this.apiBase}/car`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentOdometer: newOdo })
      }).catch(() => {});
    }
    this.saveState();
    this.renderAll();
    this.showToast(`Odómetro actualizado: ${newOdo.toLocaleString()} km`, "🔢");
    this.haptic("heavy");
  }

  async saveScannedSymptomToLog() {
    if (!this.lastScanResult) return;
    const res = this.lastScanResult;
    const odo = res.odometro_detectado || this.state.car.currentOdo || 0;
    const lights = Array.isArray(res.testigos_encendidos) && res.testigos_encendidos.length > 0
      ? res.testigos_encendidos.join(", ")
      : "Inspección de tablero sin testigos de alerta";

    const alertMap = { OPTIMO: "BUENO", PREVENTIVO: "NORMAL", ATENCION: "MALO", CRITICO: "CRITICO" };
    const newEntry = {
      id: "m_" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      odometer: odo,
      category: (res.testigos_encendidos && res.testigos_encendidos.length > 0) ? "Falla/Síntoma" : "Preventivo",
      title: `Escaneo de Tablero IA: ${lights}`,
      description: `${res.diagnostico_tablero} | Gasolina: ${res.nivel_combustible_aprox}, Temp: ${res.temperatura_motor}`,
      partsUsed: "Escáner Visual Efímero (Foto descartada)",
      cost: 0,
      provider: "Hecho por mí (DIY)",
      aiImpact: alertMap[res.nivel_alerta] || "NORMAL",
      aiPriceRating: "Justo",
      aiTechnicalAnalysis: res.diagnostico_tablero,
      aiRelatedParts: res.accion_recomendada,
      aiNextServiceKm: odo > 0 ? odo + 5000 : null
    };

    if (this.apiBase) {
      try {
        await fetch(`${this.apiBase}/maintenance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry)
        });
        await this.syncWithBackend();
      } catch (e) {
        this.state.maintenanceLogs.push(newEntry);
      }
    } else {
      this.state.maintenanceLogs.push(newEntry);
    }

    if (odo > this.state.car.currentOdo) {
      this.state.car.currentOdo = odo;
    }

    this.saveState();
    this.closeModal("modal-scan-cluster");
    this.renderAll();
    this.switchView("view-service");
    this.showToast("Diagnóstico guardado en Bitácora", "🔧");
    this.haptic("heavy");
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

    // 1.5 Si no hay backend (iPhone / GitHub Pages) pero hay API Key guardada en el dispositivo, evaluar con Gemini directo
    if (this.state.car.geminiApiKey) {
      try {
        const evalAI = await this.callGeminiMaintenanceEvalDirectly(
          { category, title, description, partsUsed, cost, odometer },
          this.state.car.geminiApiKey
        );
        if (evalAI) {
          const newServiceAI = {
            id: "m_" + Date.now(),
            date,
            odometer,
            category,
            title,
            description,
            partsUsed,
            cost,
            provider,
            aiImpact: evalAI.impacto,
            aiPriceRating: evalAI.calificacion_precio,
            aiTechnicalAnalysis: evalAI.analisis_tecnico,
            aiRelatedParts: evalAI.piezas_relacionadas,
            aiNextServiceKm: evalAI.proximo_servicio_km
          };
          this.state.maintenanceLogs.push(newServiceAI);
          if (odometer > this.state.car.currentOdo) {
            this.state.car.currentOdo = odometer;
          }
          this.saveState();
          btnSubmit.textContent = "Guardar y Evaluar con IA";
          btnSubmit.disabled = false;
          this.closeModal("modal-service");
          this.renderAll();
          this.showToast("Evaluado con Gemini AI en tu iPhone", "🤖");
          this.haptic("heavy");
          return;
        }
      } catch (err) {
        console.warn("Error evaluando servicio directo con Gemini, usando fallback local:", err);
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
        navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).then((reg) => {
          reg.update();
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
