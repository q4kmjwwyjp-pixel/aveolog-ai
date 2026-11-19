/**
 * AVEOLOG AI — Motor Lógico & Controlador PWA
 * Especializado para Chevrolet Aveo 2011 Sedán 1.6L DOHC (Motor F16D3)
 */

// =============================================================================
// 1. ESTADO INICIAL Y MODELO DE DATOS
// =============================================================================

const DEFAULT_STATE = {
  car: {
    make: "Chevrolet",
    model: "Aveo Sedán 4P",
    year: 2011,
    engine: "1.6L DOHC 16V (F16D3)",
    power: "103 HP @ 6,000 RPM",
    tankCapacity: 45, // Litros
    currentOdo: 128450,
    plates: "NL-742-B",
    vin: "3G1JA5264BL129840",
    insuranceCompany: "Quálitas Seguros",
    insurancePolicy: "POL-04829104",
    insurancePhone: "800 800 2880",
    verificationMonth: "Mayo - Junio",
    geminiApiKey: ""
  },
  
  // Servicios Preventivos Oficiales Calibrados para Aveo 2011 1.6L
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
      name: "Cambio de Aceite y Filtro (5W-30)",
      intervalKm: 6000,
      intervalMonths: 6,
      lastDoneOdo: 124000,
      lastDoneDate: "2026-08-15",
      critical: false,
      description: "Capacidad: 3.75 L con filtro. Usar sintético o semisintético 5W-30 o 10W-30 API SN/SP."
    },
    {
      id: "spark_plugs",
      name: "Bujías (1.1 mm) y Cables",
      intervalKm: 20000,
      intervalMonths: 12,
      lastDoneOdo: 115000,
      lastDoneDate: "2025-11-20",
      critical: false,
      description: "Bujías NGK BKR6E-11 calibradas a 1.1 mm (0.043\"). Revisar pozos por fugas de aceite de la junta de punterías."
    },
    {
      id: "air_filter",
      name: "Filtro de Aire de Motor",
      intervalKm: 12000,
      intervalMonths: 12,
      lastDoneOdo: 124000,
      lastDoneDate: "2026-08-15",
      critical: false,
      description: "Mantiene la mezcla aire/combustible óptima y evita ensuciar el sensor MAP."
    },
    {
      id: "fuel_filter",
      name: "Filtro de Gasolina (Chasis)",
      intervalKm: 15000,
      intervalMonths: 12,
      lastDoneOdo: 115000,
      lastDoneDate: "2025-11-20",
      critical: false,
      description: "Ubicado abajo junto al tanque. Protege los inyectores y la bomba de gasolina."
    },
    {
      id: "coolant_thermostat",
      name: "Anticongelante Dex-Cool y Termostato",
      intervalKm: 40000,
      intervalMonths: 24,
      lastDoneOdo: 100000,
      lastDoneDate: "2024-09-05",
      critical: true,
      description: "Refrigerante 7.0 Litros 50/50. Inspeccionar carcasa de termostato (reemplazo recomendado a carcasa de aluminio si frena)."
    },
    {
      id: "brakes_front",
      name: "Balatas Delanteras y Líquido DOT 3/4",
      intervalKm: 25000,
      intervalMonths: 18,
      lastDoneOdo: 118000,
      lastDoneDate: "2026-02-12",
      critical: true,
      description: "Revisar espesor de pastillas, rectificado de discos y purgado de líquido."
    },
    {
      id: "throttle_iac",
      name: "Limpieza Cuerpo de Aceleración y Válvula IAC",
      intervalKm: 20000,
      intervalMonths: 12,
      lastDoneOdo: 110000,
      lastDoneDate: "2025-06-18",
      critical: false,
      description: "Elimina carbonilla para evitar ralentí inestable y que el auto se apague con el A/C."
    },
    {
      id: "suspension_front",
      name: "Suspensión: Bujes de Horquilla y Bieletas",
      intervalKm: 30000,
      intervalMonths: 18,
      lastDoneOdo: 105000,
      lastDoneDate: "2025-01-10",
      critical: false,
      description: "Falla clásica de golpeteo en caminos irregulares en Aveo 2011."
    }
  ],

  // Cargas de Gasolina Iniciales de Ejemplo
  fuelLogs: [
    {
      id: "f_1",
      date: "2026-10-15",
      odo: 127200,
      liters: 34.5,
      cost: 828.00,
      pricePerLiter: 24.00,
      fullTank: true,
      fuelType: "Magna",
      station: "Pemex Carretera Nacional",
      notes: "Carga normal tanque lleno"
    },
    {
      id: "f_2",
      date: "2026-10-28",
      odo: 127610,
      liters: 35.0,
      cost: 840.00,
      pricePerLiter: 24.00,
      fullTank: true,
      fuelType: "Magna",
      station: "Oxxo Gas Gonzalitos",
      notes: "410 km recorridos (11.71 km/L)"
    },
    {
      id: "f_3",
      date: "2026-11-10",
      odo: 128035,
      liters: 35.8,
      cost: 866.36,
      pricePerLiter: 24.20,
      fullTank: true,
      fuelType: "Magna",
      station: "Mobil Constitución",
      notes: "425 km recorridos (11.87 km/L)"
    },
    {
      id: "f_4",
      date: "2026-11-18",
      odo: 128450,
      liters: 34.9,
      cost: 844.58,
      pricePerLiter: 24.20,
      fullTank: true,
      fuelType: "Magna",
      station: "Pemex San Jerónimo",
      notes: "415 km recorridos (11.89 km/L)"
    }
  ],

  // Servicios Mecánicos Realizados
  serviceLogs: [
    {
      id: "s_1",
      date: "2026-08-15",
      odo: 124000,
      type: "Cambio de Aceite y Filtro",
      title: "Aceite Mobil 5W-30 + Filtro Gonher + Filtro de Aire",
      cost: 1150.00,
      who: "Hecho por mí (DIY)",
      parts: "Garrafa 5W-30 Mobil Super Sintético, Filtro GP-47",
      notes: "Nivel exacto a 3.75 Litros con filtro. Punterías limpias."
    },
    {
      id: "s_2",
      date: "2026-02-12",
      odo: 118000,
      type: "Frenos Delanteros / Balatas",
      title: "Cambio de Balatas Delanteras Cerámicas y Rectificado",
      cost: 1450.00,
      who: "Taller Mecánico",
      parts: "Balatas Wagner Cerámica, Rectificado de discos",
      notes: "Líquido purgado con DOT 4."
    },
    {
      id: "s_3",
      date: "2024-03-10",
      odo: 90000,
      type: "Banda de Distribución (Kit Completo)",
      title: "Cambio Preventivo Kit de Distribución + Bomba de Agua",
      cost: 3850.00,
      who: "Taller Mecánico",
      parts: "Kit Gates (Banda + Tensor + Polea Loca) + Bomba de agua AC Delco",
      notes: "Puesto a punto en marcas exactas. Próximo cambio a los 140,000 km."
    }
  ]
};

// =============================================================================
// 2. BASE DE CONOCIMIENTO DE DIAGNÓSTICO (OBD2 Y MECÁNICA AVEO 1.6L)
// =============================================================================

const AVEO_DIAG_DB = {
  dtc: [
    {
      code: "P0300",
      title: "Fallo de encendido en cilindros aleatorios / múltiples",
      severity: "alta",
      system: "Encendido y Combustión",
      symptoms: "El motor tiembla fuertemente en ralentí, parpadea el foco de Check Engine (falla destructiva de catalizador), falta de potencia al acelerar.",
      causes: [
        "Cables de bujía cruzados, quemados o con fuga de chispa (falla #1 en Aveo).",
        "Aceite en los pozos de las bujías debido al desgaste del empaque de la tapa de punterías.",
        "Bujías desgastadas, calibración fuera de 1.1 mm o carbonizadas.",
        "Bobina de encendido DIS agrietada por calor.",
        "Baja compresión en válvulas o inyectores sucios."
      ],
      solution: "1. Retirar los cables de bujía y verificar si hay aceite en los tubos. Si hay aceite, cambiar empaque de tapa de punterías.\n2. Medir resistencia de cables (no más de 10k ohms).\n3. Cambiar bujías por NGK BKR6E-11 calibradas a 1.1 mm.\n4. Si la falla persiste en pares de cilindros (1-4 o 2-3), sustituir bobina de encendido."
    },
    {
      code: "P0420",
      title: "Eficiencia del sistema catalítico por debajo del umbral",
      severity: "media",
      system: "Escape y Emisiones",
      symptoms: "Testigo Check Engine encendido fijo, olor a azufre en el escape, puede no pasar la verificación vehicular.",
      causes: [
        "Fisura o fuga en el múltiple de escape de acero (común en Aveo cerca de la unión).",
        "Sensor de oxígeno post-catalizador (Banco 1 Sensor 2) defectuoso o lento.",
        "Convertidor catalítico tapado o degradado por fallas previas de encendido (P0300)."
      ],
      solution: "1. Inspeccionar físicamente el múltiple de escape en busca de grietas o fugas de aire antes del sensor 1.\n2. Revisar con escáner la gráfica de voltaje del sensor 2: debe mantenerse estable (~0.45V - 0.7V). Si oscila como el sensor 1, el catalizador está agotado."
    },
    {
      code: "P0171",
      title: "Sistema de combustible demasiado pobre (Banco 1)",
      severity: "media",
      system: "Inyección y Admisión",
      symptoms: "El auto se siente sonso, tironea en subidas, ralentí ligeramente errático.",
      causes: [
        "Fuga de vacío en mangueras del cuerpo de aceleración, válvula PCV o múltiple de admisión.",
        "Sensor MAP sucio, desconectado o con lecturas erróneas.",
        "Baja presión de la bomba de gasolina (menos de 45-50 PSI) o filtro de gasolina tapado.",
        "Inyectores obstruidos con sedimentos."
      ],
      solution: "1. Rociar spray limpiador de carburador suavemente alrededor de las mangueras de vacío para detectar si se altera el ralentí (fuga de aire).\n2. Medir presión de riel de inyectores.\n3. Reemplazar filtro de gasolina ubicado bajo el chasis."
    },
    {
      code: "P0117",
      title: "Sensor de temperatura de refrigerante (ECT) - Señal baja / Corto",
      severity: "alta",
      system: "Refrigeración y Mezcla",
      symptoms: "El electroventilador se queda prendido al máximo todo el tiempo, arranque difícil en frío o en caliente, alto consumo de combustible y humo negro.",
      causes: [
        "Sensor ECT de 2 cables defectuoso o con sarro.",
        "Arnés del sensor quebrado por vibración o calor cerca de la cabeza del motor.",
        "Fuga de refrigerante que dejó sin líquido el sensor."
      ],
      solution: "1. Ubicar el sensor ECT en la parte trasera de la cabeza del motor debajo de la bobina.\n2. Medir resistencia en frío (~2.5k ohms a 20°C). Si marca corto o circuito abierto, reemplazar sensor original AC Delco."
    },
    {
      code: "P0340",
      title: "Fallo en circuito del sensor de posición de árbol de levas (CMP)",
      severity: "media",
      system: "Sincronización Electrónica",
      symptoms: "Marcha larga al intentar encender, jaloneo súbito al rebasar las 3,000 RPM, pérdida de potencia.",
      causes: [
        "Sensor CMP desgastado o sucio de aceite.",
        "Banda de distribución destensada o fuera de punto por 1 diente.",
        "Falso contacto en el conector de 3 pines."
      ],
      solution: "1. Verificar la tensión de la banda de distribución inmediatamente.\n2. Limpiar el conector del sensor CMP en el lateral superior de la tapa de punterías.\n3. Sustituir el sensor CMP si tiene daño interno."
    },
    {
      code: "P0335",
      title: "Sensor de posición de cigüeñal (CKP) - Circuito defectuoso",
      severity: "critica",
      system: "Encendido y Giro de Motor",
      symptoms: "El motor se apaga repentinamente en marcha (especialmente cuando se calienta) y no arranca hasta que se enfría; no hay chispa en bujías.",
      causes: [
        "Bobinado interno del sensor CKP degradado por temperatura cerca de la polea del cigüeñal.",
        "Cable rozando con banda de accesorios o escape.",
        "Suciedad o rebaba metálica en la punta magnética del sensor."
      ],
      solution: "1. Reemplazar sensor de cigüeñal CKP por pieza de equipo original.\n2. Asegurar el cableado lejos de piezas móviles o calientes."
    },
    {
      code: "P0505",
      title: "Fallo en el control de aire de marcha mínima (Válvula IAC)",
      severity: "media",
      system: "Admisión y Ralentí",
      symptoms: "El motor se apaga al frenar o al llegar a un semáforo, el ralentí sube y baja entre 600 y 1400 RPM (ralentí oscilante), se apaga al encender el aire acondicionado.",
      causes: [
        "Punta cónica de la válvula IAC atascada de carbón y aceite negro.",
        "Conducto de bypass del cuerpo de aceleración obstruido.",
        "Falla en el motor a pasos interno de la válvula IAC."
      ],
      solution: "1. Desmontar la válvula IAC (dos tornillos Torx) y el cuerpo de aceleración.\n2. Limpiar meticulosamente con solvente Carbuclean sin forzar el vástago.\n3. Si tras calibrar (abrir switch 10s, cerrar 10s x 3 veces) sigue oscilando, cambiar la válvula IAC."
    },
    {
      code: "P0463",
      title: "Sensor de nivel de combustible - Señal alta",
      severity: "baja",
      system: "Instrumentos y Tanque",
      symptoms: "La aguja del marcador de gasolina en el tablero marca lleno siempre, o se cae a vacío con luz de reserva prendida.",
      causes: [
        "Pistas de resistencia de la resistencia del flotador desgastadas en el módulo de la bomba de gasolina.",
        "Cable a tierra suelto bajo el asiento trasero."
      ],
      solution: "Levantar el asiento trasero, abrir la tapa de registro de la bomba de gasolina y cambiar la tableta de flotador de nivel (resistencia variable)."
    }
  ],

  symptoms: [
    {
      trigger: ["tiembla", "vibracion", "ralenti", "inestable", "baja"],
      title: "Temblor / Ralentí Inestable en Semáforos",
      summary: "El motor 1.6L del Aveo es muy sensible a tres puntos críticos: 1) Aceite en pozos de bujías por empaque de punterías cuarteado, 2) Cables de bujías con fuga de chispa, 3) Válvula IAC y cuerpo de aceleración sucios.",
      urgency: "Media",
      steps: [
        "Retira los 4 cables de bujía uno a uno: fíjate si la bota de hule sale con aceite de motor. Si tiene aceite, la chispa se fuga y hay que cambiar la junta de punterías.",
        "Limpia la válvula IAC con limpiador de cuerpo de aceleración.",
        "Revisa la manguera de la válvula PCV; si está floja o rota, entra aire no medido."
      ],
      estimatedCost: "$350 - $900 MXN en refacciones"
    },
    {
      trigger: ["cascabelea", "cascabeleo", "subida", "pistoneo"],
      title: "Cascabeleo / Pistoneo en Subidas o Aceleración",
      summary: "Se produce por detonación prematura de la mezcla en las cámaras de combustión.",
      urgency: "Media / Alta",
      steps: [
        "Prueba cargando gasolina Premium de 91 octanos en la próxima carga para comprobar si se mitiga.",
        "Verifica que las bujías sean del grado térmico correcto (NGK BKR6E-11) y tengan la calibración de 1.1 mm.",
        "Revisa el sensor de detonación (Knock Sensor) atornillado al monoblock debajo del múltiple de admisión."
      ],
      estimatedCost: "$250 - $800 MXN"
    },
    {
      trigger: ["gasolina", "olor", "huele", "combustible"],
      title: "Olor a Gasolina Cruda en Cabina o Exterior",
      summary: "Muy común en el Aveo por el empaque de la tapa de la bomba de combustible o el cánister de gases.",
      urgency: "Alta (Riesgo de seguridad)",
      steps: [
        "Levanta el asiento trasero y huele la tapa plástica de registro de la bomba de gasolina. Si huele fuerte o hay humedad, la tuerca roscada o la liga O-ring del tanque se vencieron.",
        "Inspecciona las mangueras de alimentación de riel de inyectores en el compartimento del motor.",
        "Revisa la válvula de purga del cánister (EVAP) ubicada detrás del motor."
      ],
      estimatedCost: "$150 - $500 MXN (Sello O-Ring)"
    },
    {
      trigger: ["temperatura", "calienta", "calentamiento", "anticongelante", "hierve"],
      title: "Sube la Temperatura / Pérdida de Refrigerante",
      summary: "Punto débil conocido del Aveo 1.6L: La carcasa plástica del termostato se cristaliza y se quiebra, o el termostato se queda pegado cerrado.",
      urgency: "Crítica (Riesgo de soplar junta de cabeza)",
      steps: [
        "NO abras el tapón del depósito con motor caliente.",
        "Revisa con una linterna el lado derecho del motor (junto a la banda de tiempo): inspecciona si hay escurrimiento rosado en la carcasa del termostato.",
        "Si la carcasa de plástico fuga, sustitúyela por una carcasa de ALUMINIO (muy popular y durable para Aveo).",
        "Verifica que el ventilador encienda cuando la aguja llega a la mitad."
      ],
      estimatedCost: "$450 - $1,100 MXN (Termostato de aluminio + Dex-Cool)"
    },
    {
      trigger: ["frio", "chirrido", "banda", "ruido", "chilla"],
      title: "Chirrido Agudo al Encender en Frío",
      summary: "Proviene casi siempre de la banda de accesorios (alternador, bomba de dirección y compresor de aire).",
      urgency: "Baja / Media",
      steps: [
        "Verifica la tensión de la banda poly-V de accesorios.",
        "Si la banda tiene grietas o brillo vidriado en los canales, reemplázala (Medida típica: 6PK1875 o similar según si tiene A/C).",
        "Si el ruido persiste con banda nueva, la polea loca o polea tensora tiene baleros secos."
      ],
      estimatedCost: "$250 - $600 MXN"
    },
    {
      trigger: ["freno", "frenos", "pedal", "esponjoso", "rechina"],
      title: "Frenos Esponjosos o Chillido Metálico",
      summary: "El Aveo usa frenos de disco ventilados adelante y tambor atrás.",
      urgency: "Alta",
      steps: [
        "Chillido continuo al frenar: el avisador acústico de lámina está tocando el disco; las balatas están gastadas (menos de 2 mm).",
        "Pedal esponjoso que se hunde: hay aire en las líneas de frenado o el líquido absorbió humedad. Requiere purgado con líquido DOT 3 o DOT 4 nuevo.",
        "Vibración en el volante al frenar a alta velocidad: discos delanteros deformados/alabeados por calentamiento."
      ],
      estimatedCost: "$500 - $1,600 MXN"
    }
  ]
};

// =============================================================================
// 3. CONTROLADOR PRINCIPAL DE LA APLICACIÓN
// =============================================================================

class AveoLogApp {
  constructor() {
    this.state = this.loadState();
    this.currentView = "view-dashboard";
    this.initAudioHaptics();
    this.initDOM();
    this.bindEvents();
    this.renderAll();
    this.checkSafariPwaBanner();
    this.registerServiceWorker();
  }

  // Carga o Inicialización con LocalStorage
  loadState() {
    try {
      const saved = localStorage.getItem("aveolog_ai_state_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Mezclar con default para asegurar llaves nuevas
        return {
          car: { ...DEFAULT_STATE.car, ...parsed.car },
          maintenanceSchedule: parsed.maintenanceSchedule || DEFAULT_STATE.maintenanceSchedule,
          fuelLogs: parsed.fuelLogs || DEFAULT_STATE.fuelLogs,
          serviceLogs: parsed.serviceLogs || DEFAULT_STATE.serviceLogs
        };
      }
    } catch (e) {
      console.warn("Error leyendo state, restaurando default:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      localStorage.setItem("aveolog_ai_state_v1", JSON.stringify(this.state));
    } catch (e) {
      console.error("Error guardando state:", e);
    }
  }

  // Audio háptico sintético para iPhone (imita Taptic Engine)
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
    // 1. Vibración estándar si el dispositivo lo soporta
    if (navigator.vibrate) {
      if (type === "light") navigator.vibrate(10);
      else if (type === "medium") navigator.vibrate(25);
      else if (type === "heavy") navigator.vibrate([40, 30, 40]);
    }

    // 2. Micro-pulso acústico de audio háptico para iPhone
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

  // Conectar con el DOM
  initDOM() {
    // Tabbar
    this.tabButtons = document.querySelectorAll(".tabbar-item");
    this.views = document.querySelectorAll(".app-view");

    // Inputs y Formularios
    this.formFuel = document.getElementById("form-fuel");
    this.formService = document.getElementById("form-service");
    this.formOdo = document.getElementById("form-odo");
    this.formCarDocs = document.getElementById("form-car-docs");
    
    // Modales
    this.modalFuel = document.getElementById("modal-fuel");
    this.modalService = document.getElementById("modal-service");
    this.modalOdo = document.getElementById("modal-odo");
    this.modalDiagDetail = document.getElementById("modal-diag-detail");
    this.modalCarDocs = document.getElementById("modal-car-docs");

    // Chat
    this.chatMessages = document.getElementById("chat-messages");
    this.chatInput = document.getElementById("chat-input-text");
    this.btnChatSend = document.getElementById("btn-chat-send");
  }

  // Event Listeners
  bindEvents() {
    // Desbloquear AudioContext en primer toque del usuario
    document.addEventListener("touchstart", () => {
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
    }, { once: true });

    // Navegación por Pestañas iOS
    this.tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const viewId = btn.dataset.view;
        this.switchView(viewId);
        this.haptic("light");
      });
    });

    // Botones de Acción Rápida en Dashboard
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

    // Botones de Abrir Modales
    document.getElementById("btn-quick-odo")?.addEventListener("click", () => this.openOdoModal());
    document.getElementById("btn-edit-odo-widget")?.addEventListener("click", () => this.openOdoModal());
    document.getElementById("btn-open-fuel-modal")?.addEventListener("click", () => this.openModal("modal-fuel"));
    document.getElementById("btn-open-service-modal")?.addEventListener("click", () => this.openModal("modal-service"));
    document.getElementById("btn-edit-car-docs")?.addEventListener("click", () => this.openCarDocsModal());
    document.getElementById("btn-quick-backup")?.addEventListener("click", () => {
      this.switchView("view-garage");
      this.showToast("Gestión de Respaldos", "💾");
    });

    // Cerrar Modales
    document.querySelectorAll("[data-close-modal]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.dataset.closeModal;
        this.closeModal(modalId);
        this.haptic("light");
      });
    });

    // Cerrar modal al tocar overlay fuera de la hoja
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
          this.haptic("light");
        }
      });
    });

    // Segmented Buttons (Magna / Premium)
    document.querySelectorAll(".seg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const group = btn.dataset.seg;
        document.querySelectorAll(`.seg-btn[data-seg="${group}"]`).forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.haptic("light");
      });
    });

    // Envíos de Formularios
    this.formFuel.addEventListener("submit", (e) => this.handleFuelSubmit(e));
    this.formService.addEventListener("submit", (e) => this.handleServiceSubmit(e));
    this.formOdo.addEventListener("submit", (e) => this.handleOdoSubmit(e));
    this.formCarDocs.addEventListener("submit", (e) => this.handleCarDocsSubmit(e));

    // Chat AI y Buscador de Diagnóstico
    this.btnChatSend.addEventListener("click", () => this.handleChatSubmit());
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleChatSubmit();
    });

    // Tags de Síntomas
    document.querySelectorAll(".symptom-tag").forEach(tag => {
      tag.addEventListener("click", () => {
        const query = tag.dataset.query;
        this.runDiagnosticQuery(query);
        this.haptic("light");
      });
    });

    // Buscador general de diagnóstico en tiempo real
    const searchInput = document.getElementById("diag-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        if (val.length >= 3) {
          this.filterDiagnosticList(val);
        } else {
          this.renderPopularDtcList();
        }
      });
    }

    // Exportar e Importar Respaldo
    document.getElementById("btn-export-backup")?.addEventListener("click", () => this.exportBackupJSON());
    document.getElementById("file-import-backup")?.addEventListener("change", (e) => this.importBackupJSON(e));
    document.getElementById("btn-load-demo-data")?.addEventListener("click", () => this.loadDemoData());

    // Guardar Gemini API Key
    document.getElementById("btn-save-gemini-key")?.addEventListener("click", () => {
      const keyInput = document.getElementById("cfg-gemini-key");
      this.state.car.geminiApiKey = (keyInput.value || "").trim();
      this.saveState();
      this.showToast("Clave API guardada", "🔑");
      this.haptic("medium");
    });

    // Cerrar banner de instalación Safari
    document.getElementById("btn-close-install-banner")?.addEventListener("click", () => {
      document.getElementById("ios-install-banner").style.display = "none";
      sessionStorage.setItem("aveolog_hide_ios_banner", "1");
    });
  }

  // =============================================================================
  // 4. CAMBIO DE VISTA (TABS IOS)
  // =============================================================================
  switchView(viewId) {
    this.currentView = viewId;
    this.tabButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === viewId);
    });
    this.views.forEach(v => {
      v.classList.toggle("active", v.id === viewId);
    });

    // Resetear scroll al inicio de la vista
    const scrollElem = document.getElementById("main-scroll");
    if (scrollElem) scrollElem.scrollTop = 0;

    // Renderizar gráfico o componentes específicos al entrar
    if (viewId === "view-fuel") {
      this.renderFuelView();
    } else if (viewId === "view-service") {
      this.renderServiceView();
    } else if (viewId === "view-diag") {
      this.renderDiagnosticView();
    } else if (viewId === "view-garage") {
      this.renderGarageView();
    } else {
      this.renderDashboard();
    }
  }

  // Modales
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Auto rellenar fechas y odómetros en formularios
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
  // 5. CÁLCULOS MATEMÁTICOS Y TELEMETRÍA (KM/L, AUTONOMÍA, COSTO/KM)
  // =============================================================================

  calculateFuelTelemetry() {
    const sorted = [...this.state.fuelLogs].sort((a, b) => a.odo - b.odo);
    if (sorted.length < 2) {
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

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const dist = curr.odo - prev.odo;
      
      if (dist > 0 && curr.liters > 0) {
        const kml = parseFloat((dist / curr.liters).toFixed(2));
        historyKml.push({ date: curr.date, kml, odo: curr.odo });

        if (kml > bestKml) bestKml = kml;
        if (kml < worstKml) worstKml = kml;

        totalDist += dist;
        totalLiters += curr.liters;
        totalCost += curr.cost;
      }
    }

    const avgKml = totalLiters > 0 ? parseFloat((totalDist / totalLiters).toFixed(2)) : 11.5;
    const avgCostPerKm = totalDist > 0 ? parseFloat((totalCost / totalDist).toFixed(2)) : 2.10;
    const lastKml = historyKml.length > 0 ? historyKml[historyKml.length - 1].kml : avgKml;

    // Calcular gasto del mes actual
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthExpense = sorted
      .filter(l => (l.date || "").startsWith(currentMonth))
      .reduce((acc, curr) => acc + (parseFloat(curr.cost) || 0), 0);

    // Autonomía estimada considerando ~80% de tanque promedio o último llenado
    const estimatedRange = Math.round(this.state.car.tankCapacity * 0.7 * avgKml);

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
  // 6. RENDERIZADO DE LAS VISTAS
  // =============================================================================

  renderAll() {
    this.renderDashboard();
    this.renderFuelView();
    this.renderServiceView();
    this.renderDiagnosticView();
    this.renderGarageView();
  }

  renderDashboard() {
    const tele = this.calculateFuelTelemetry();
    const currentOdo = this.state.car.currentOdo;

    // Odómetro principal
    document.getElementById("dash-odo-val").textContent = Number(currentOdo).toLocaleString();
    
    // Métricas
    document.getElementById("dash-kml-val").textContent = tele.avgKml;
    document.getElementById("dash-range-val").textContent = tele.estimatedRange;
    document.getElementById("dash-costkm-val").textContent = `$${tele.avgCostPerKm}`;

    // Semáforo de servicios para calcular el próximo servicio
    const servicesStatus = this.getServicesCalculatedStatus();
    const nextService = servicesStatus[0]; // El más urgente

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
        bannerDesc.innerHTML = `<strong style="color:#ef4444;">¡URGENTE!</strong> Banda de distribución vencida por <strong>${Math.abs(remaining).toLocaleString()} km</strong>. Si se revienta el motor doblará válvulas.`;
      } else if (remaining < 5000) {
        banner.style.borderColor = "#f59e0b";
        bannerDesc.innerHTML = `Quedan <strong>${remaining.toLocaleString()} km</strong> para el cambio preventivo del kit de distribución.`;
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
      healthText.textContent = "Atención Requerida";
    } else if (hasSoon) {
      healthBadge.style.background = "rgba(245, 158, 11, 0.18)";
      healthBadge.style.borderColor = "rgba(245, 158, 11, 0.4)";
      healthBadge.style.color = "#fbbf24";
      healthText.textContent = "Servicio Próximo";
    } else {
      healthBadge.style.background = "rgba(16, 185, 129, 0.15)";
      healthBadge.style.borderColor = "rgba(16, 185, 129, 0.3)";
      healthBadge.style.color = "#34d399";
      healthText.textContent = "En Óptimo Estado";
    }

    // Lista de Actividad Reciente (últimos 3 eventos)
    this.renderDashboardRecentList();
  }

  renderDashboardRecentList() {
    const listEl = document.getElementById("dash-recent-list");
    if (!listEl) return;

    // Combinar últimos combustibles y servicios
    const events = [];
    this.state.fuelLogs.forEach(f => {
      events.push({
        type: "fuel",
        title: `Carga Gasolina ${f.fuelType}`,
        subtitle: `${f.liters} L • ${f.station || "Estación"}`,
        date: f.date,
        odo: f.odo,
        cost: f.cost
      });
    });

    this.state.serviceLogs.forEach(s => {
      events.push({
        type: "service",
        title: s.type,
        subtitle: s.title || s.parts || "Mantenimiento",
        date: s.date,
        odo: s.odo,
        cost: s.cost
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
          <div class="sub-val">${item.type === 'fuel' ? 'Combustible' : 'Servicio'}</div>
        </div>
      </div>
    `).join("");
  }

  // =============================================================================
  // 7. VISTA DE COMBUSTIBLE & GRÁFICO SVG
  // =============================================================================

  renderFuelView() {
    const tele = this.calculateFuelTelemetry();
    document.getElementById("fuel-avg-kml").textContent = tele.avgKml;
    document.getElementById("fuel-month-expense").textContent = `$${tele.monthExpense.toLocaleString()}`;
    document.getElementById("fuel-stat-badge-kml").textContent = `${tele.avgKml} km/L`;
    document.getElementById("fuel-best-kml").textContent = tele.bestKml;
    document.getElementById("fuel-worst-kml").textContent = tele.worstKml;
    document.getElementById("fuel-count-label").textContent = `${this.state.fuelLogs.length} cargas registradas`;

    // Renderizar gráfico SVG
    this.renderFuelChart(tele.historyKml);

    // Renderizar historial de cargas
    const listEl = document.getElementById("fuel-history-list");
    if (!listEl) return;

    const sortedLogs = [...this.state.fuelLogs].sort((a, b) => b.odo - a.odo);

    if (sortedLogs.length === 0) {
      listEl.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.8rem;">No hay cargas registradas. Pulsa '+ Cargar Gas' para agregar tu primera carga.</div>`;
      return;
    }

    listEl.innerHTML = sortedLogs.map((log, idx) => {
      // Calcular rendimiento individual respecto al registro anterior
      let kmlText = "";
      const olderLog = sortedLogs[idx + 1];
      if (olderLog && log.odo > olderLog.odo && log.liters > 0) {
        const kml = ((log.odo - olderLog.odo) / log.liters).toFixed(2);
        kmlText = `<span style="color:var(--telemetry-cyan); font-weight:700;">${kml} km/L</span> • `;
      }

      return `
        <div class="item-row">
          <div class="item-left">
            <div class="item-icon-box" style="color: ${log.fuelType === 'Premium' ? '#ef4444' : '#10b981'};">
              ⛽
            </div>
            <div class="item-title-col">
              <h4>${log.liters} Litros ${log.fuelType}</h4>
              <p>${log.date} • ${log.odo.toLocaleString()} km • ${log.station || 'Gasolinera'}</p>
            </div>
          </div>
          <div class="item-right">
            <div class="main-val">$${Number(log.cost).toFixed(2)}</div>
            <div class="sub-val">${kmlText}$${(log.cost / log.liters).toFixed(2)}/L</div>
          </div>
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

    // Área bajo la curva
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
        
        <!-- Líneas guía -->
        <line x1="${paddingX}" y1="${getY(minVal)}" x2="${width - paddingX}" y2="${getY(minVal)}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3"/>
        <line x1="${paddingX}" y1="${getY(maxVal)}" x2="${width - paddingX}" y2="${getY(maxVal)}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3"/>

        <!-- Curva y Área -->
        <path d="${areaD}" fill="url(#chartGrad)"/>
        <path d="${pathD}" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- Puntos -->
        ${dots}
      </svg>
    `;
  }

  // =============================================================================
  // 8. VISTA DE SERVICIOS Y SEMÁFORO PREVENTIVO
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
    
    // Badge de advertencia en pestaña
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
      `;
    }).join("");

    // Historial de servicios realizados
    this.renderServiceHistoryList();
  }

  renderServiceHistoryList() {
    const histEl = document.getElementById("service-history-list");
    const countEl = document.getElementById("service-count-label");
    if (!histEl) return;

    const sorted = [...this.state.serviceLogs].sort((a, b) => b.odo - a.odo);
    if (countEl) countEl.textContent = `${sorted.length} servicios registrados`;

    if (sorted.length === 0) {
      histEl.innerHTML = `<div style="text-align:center; padding:18px; color:var(--text-muted); font-size:0.8rem;">Aún no hay servicios registrados en la bitácora.</div>`;
      return;
    }

    histEl.innerHTML = sorted.map(item => `
      <div class="item-row">
        <div class="item-left">
          <div class="item-icon-box" style="color:var(--telemetry-cyan);">
            🛠️
          </div>
          <div class="item-title-col">
            <h4>${item.type}</h4>
            <p>${item.date} • ${item.odo.toLocaleString()} km • ${item.who || 'Mecánico'}</p>
            ${item.parts ? `<div style="font-size:0.68rem; color:var(--chevy-gold-light); margin-top:2px;">Refacciones: ${item.parts}</div>` : ''}
          </div>
        </div>
        <div class="item-right">
          <div class="main-val">$${Number(item.cost || 0).toFixed(0)}</div>
          <div class="sub-val">${item.who === 'Hecho por mí (DIY)' ? 'DIY' : 'Taller'}</div>
        </div>
      </div>
    `).join("");
  }

  quickRegisterService(serviceName) {
    this.openModal("modal-service");
    const select = document.getElementById("service-input-type");
    if (select) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text.includes(serviceName) || serviceName.includes(select.options[i].value)) {
          select.selectedIndex = i;
          break;
        }
      }
    }
    this.haptic("light");
  }

  // =============================================================================
  // 9. VISTA DE DIAGNÓSTICO AI & DTC CODES
  // =============================================================================

  renderDiagnosticView() {
    this.renderPopularDtcList();
  }

  renderPopularDtcList(filteredItems = null) {
    const listEl = document.getElementById("diag-popular-dtc-list");
    if (!listEl) return;

    const items = filteredItems || AVEO_DIAG_DB.dtc;

    if (items.length === 0) {
      listEl.innerHTML = `<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:0.8rem;">No se encontraron códigos o síntomas coincidentes. Escribe tu duda en el chat de AveoBot AI.</div>`;
      return;
    }

    listEl.innerHTML = items.map(dtc => `
      <div class="item-row" style="cursor:pointer;" onclick="app.showDtcDetail('${dtc.code}')">
        <div class="item-left">
          <div class="item-icon-box" style="color:${dtc.severity === 'critica' || dtc.severity === 'alta' ? '#ef4444' : '#fbbf24'}; font-weight:800; font-size:0.75rem;">
            ${dtc.code}
          </div>
          <div class="item-title-col">
            <h4>${dtc.title}</h4>
            <p>${dtc.system} • Severidad ${dtc.severity.toUpperCase()}</p>
          </div>
        </div>
        <div class="item-right">
          <span style="font-size:0.75rem; color:var(--telemetry-cyan);">Ver Ficha ›</span>
        </div>
      </div>
    `).join("");
  }

  filterDiagnosticList(query) {
    const q = query.toLowerCase();
    const filtered = AVEO_DIAG_DB.dtc.filter(d => 
      d.code.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.symptoms.toLowerCase().includes(q) ||
      d.causes.some(c => c.toLowerCase().includes(q))
    );
    this.renderPopularDtcList(filtered);
  }

  showDtcDetail(code) {
    const dtc = AVEO_DIAG_DB.dtc.find(d => d.code === code);
    if (!dtc) return;

    document.getElementById("diag-detail-title").textContent = `Código ${dtc.code}: ${dtc.title}`;
    const content = document.getElementById("diag-detail-content");

    content.innerHTML = `
      <div style="background: rgba(0,0,0,0.3); padding:10px; border-radius:10px; margin-bottom:12px; border:1px solid var(--border-subtle);">
        <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase;">Sistema Afectado</div>
        <div style="font-weight:700; color:#fff;">${dtc.system}</div>
        <div style="font-size:0.72rem; color:${dtc.severity === 'critica' || dtc.severity === 'alta' ? '#ef4444' : '#fbbf24'}; margin-top:4px;">
          Severidad: ${dtc.severity.toUpperCase()}
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <h4 style="font-size:0.85rem; color:var(--chevy-gold-light); margin-bottom:4px;">⚠️ Síntomas en el Aveo:</h4>
        <p style="color:var(--text-secondary);">${dtc.symptoms}</p>
      </div>

      <div style="margin-bottom:12px;">
        <h4 style="font-size:0.85rem; color:#f87171; margin-bottom:4px;">🔍 Causas Frecuentes en Motor 1.6L:</h4>
        <ul style="padding-left:18px; color:var(--text-secondary);">
          ${dtc.causes.map(c => `<li style="margin-bottom:4px;">${c}</li>`).join("")}
        </ul>
      </div>

      <div>
        <h4 style="font-size:0.85rem; color:var(--telemetry-cyan); margin-bottom:4px;">🔧 Procedimiento de Solución:</h4>
        <div style="background:rgba(6,182,212,0.08); padding:10px; border-radius:8px; border:1px solid rgba(6,182,212,0.2); white-space:pre-line; color:#e2e8f0;">
          ${dtc.solution}
        </div>
      </div>
    `;

    this.openModal("modal-diag-detail");
    this.haptic("medium");
  }

  runDiagnosticQuery(query) {
    this.addChatMessage(query, "user");
    this.chatInput.value = "";
    this.processDiagnosticResponse(query);
  }

  handleChatSubmit() {
    const text = (this.chatInput.value || "").trim();
    if (!text) return;
    this.runDiagnosticQuery(text);
  }

  addChatMessage(text, sender = "bot") {
    const msgEl = document.createElement("div");
    msgEl.className = `chat-bubble ${sender}`;
    msgEl.innerHTML = text;
    this.chatMessages.appendChild(msgEl);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  async processDiagnosticResponse(query) {
    this.haptic("light");
    const q = query.toLowerCase();

    // 1. Si el usuario tiene API Key de Gemini configurada, intentar llamada en la nube
    if (this.state.car.geminiApiKey) {
      try {
        const geminiAnswer = await this.callGeminiAPI(query);
        if (geminiAnswer) {
          this.addChatMessage(geminiAnswer, "bot");
          return;
        }
      } catch (err) {
        console.warn("Falla en Gemini API, recurriendo a motor local AveoBot:", err);
      }
    }

    // 2. Motor Heurístico Embebido AveoBot (100% Offline)
    // Verificar si es un código OBD2 directo
    const obdMatch = q.match(/p0\d{3}/i);
    if (obdMatch) {
      const code = obdMatch[0].toUpperCase();
      const foundDtc = AVEO_DIAG_DB.dtc.find(d => d.code === code);
      if (foundDtc) {
        const reply = `
          <strong>Código ${foundDtc.code}: ${foundDtc.title}</strong><br><br>
          <strong>Causas principales en Aveo 1.6L:</strong><br>
          • ${foundDtc.causes.slice(0, 3).join("<br>• ")}<br><br>
          <strong>¿Qué hacer?</strong><br>
          ${foundDtc.solution.split("\n")[0]}<br><br>
          <a href="javascript:void(0)" onclick="app.showDtcDetail('${foundDtc.code}')" style="color:var(--chevy-gold-light); font-weight:700;">Ver procedimiento completo y pruebas ›</a>
        `;
        this.addChatMessage(reply, "bot");
        return;
      }
    }

    // Buscar en síntomas
    let matchedSymptom = null;
    for (const sym of AVEO_DIAG_DB.symptoms) {
      if (sym.trigger.some(t => q.includes(t))) {
        matchedSymptom = sym;
        break;
      }
    }

    if (matchedSymptom) {
      const reply = `
        <strong>🔍 Diagnóstico Aveo 1.6L: ${matchedSymptom.title}</strong><br><br>
        ${matchedSymptom.summary}<br><br>
        <strong>⚠️ Urgencia:</strong> ${matchedSymptom.urgency}<br>
        <strong>💰 Costo Estimado:</strong> ${matchedSymptom.estimatedCost}<br><br>
        <strong>Pasos recomendados para revisar:</strong><br>
        1. ${matchedSymptom.steps.join("<br>2. ")}
      `;
      this.addChatMessage(reply, "bot");
      return;
    }

    // Respuesta genérica inteligente calibrada para Aveo 2011 1.6L
    const generic = `
      He analizado tu consulta para el <strong>Chevrolet Aveo 2011 1.6L DOHC</strong>.<br><br>
      Para este modelo, los puntos clave a inspeccionar ante este comportamiento son:<br>
      • <strong>Sistema eléctrico:</strong> Estado de bujías (calibración 1.1mm) y verificar que no haya aceite en los pozos por la junta de punterías.<br>
      • <strong>Admisión y vacío:</strong> Limpieza del cuerpo de aceleración y mangueras de vacío del sensor MAP.<br>
      • <strong>Presión de combustible:</strong> El Aveo requiere 45-50 PSI constantes en el riel de inyectores.<br><br>
      <em>Tip: Si tienes un escáner OBD2 básico ELM327, escribe aquí el código DTC (ej. P0300) para darte la solución exacta.</em>
    `;
    this.addChatMessage(generic, "bot");
  }

  async callGeminiAPI(userPrompt) {
    const apiKey = this.state.car.geminiApiKey;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `Eres AveoLog AI, un mecánico experto automotriz especializado EXCLUSIVAMENTE en el Chevrolet Aveo 2011 Sedán motor 1.6L DOHC 16 Válvulas (F16D3 / E-TEC II). Responde en español de México, de forma concisa, práctica y estructurada (Causa probable, pruebas que puede hacer el dueño con herramientas caseras, y refacciones recomendadas con costo aproximado en pesos mexicanos). El odómetro actual del auto es ${this.state.car.currentOdo} km.`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nConsulta del dueño: ${userPrompt}` }]
        }
      ]
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error("Error en respuesta de Gemini API");
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.replace(/\n/g, "<br>");
  }

  // =============================================================================
  // 10. VISTA DE GARAJE & DOCUMENTACIÓN
  // =============================================================================

  renderGarageView() {
    const car = this.state.car;
    document.getElementById("garage-plates-val").textContent = car.plates || "Sin registrar";
    document.getElementById("garage-vin-val").textContent = car.vin || "Sin registrar";
    document.getElementById("garage-insurance-val").textContent = `${car.insuranceCompany || 'Aseguradora'} • ${car.insurancePolicy || 'Póliza'}`;
    
    const phoneEl = document.getElementById("garage-phone-val");
    if (car.insurancePhone) {
      phoneEl.innerHTML = `<a href="tel:${car.insurancePhone}" style="color:var(--telemetry-cyan); text-decoration:none;">📞 ${car.insurancePhone}</a>`;
    } else {
      phoneEl.textContent = "Sin registrar";
    }

    document.getElementById("garage-verif-val").textContent = car.verificationMonth || "Sin registrar";
    
    // API key
    const keyInput = document.getElementById("cfg-gemini-key");
    if (keyInput) keyInput.value = car.geminiApiKey || "";
  }

  // =============================================================================
  // 11. MANEJO DE ENVÍO DE FORMULARIOS (SUBMITS)
  // =============================================================================

  handleFuelSubmit(e) {
    e.preventDefault();
    const date = document.getElementById("fuel-input-date").value;
    const odo = parseInt(document.getElementById("fuel-input-odo").value, 10);
    const liters = parseFloat(document.getElementById("fuel-input-liters").value);
    const cost = parseFloat(document.getElementById("fuel-input-total").value);
    const fullTank = document.getElementById("fuel-input-full").checked;
    const station = document.getElementById("fuel-input-station").value.trim();
    
    // Tipo de combustible activo
    const activeSeg = document.querySelector('.seg-btn[data-seg="fuel-type"].active');
    const fuelType = activeSeg ? activeSeg.dataset.val : "Magna";

    if (!odo || !liters || !cost) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    const newLog = {
      id: "f_" + Date.now(),
      date,
      odo,
      liters,
      cost,
      pricePerLiter: parseFloat((cost / liters).toFixed(2)),
      fullTank,
      fuelType,
      station: station || "Estación de servicio",
      notes: "Carga registrada"
    };

    this.state.fuelLogs.push(newLog);

    // Actualizar odómetro si el ingresado es mayor
    if (odo > this.state.car.currentOdo) {
      this.state.car.currentOdo = odo;
    }

    this.saveState();
    this.closeModal("modal-fuel");
    this.renderAll();
    this.showToast("Carga de gasolina registrada", "⛽");
    this.haptic("heavy");
  }

  handleServiceSubmit(e) {
    e.preventDefault();
    const type = document.getElementById("service-input-type").value;
    const date = document.getElementById("service-input-date").value;
    const odo = parseInt(document.getElementById("service-input-odo").value, 10);
    const cost = parseFloat(document.getElementById("service-input-cost").value) || 0;
    const who = document.getElementById("service-input-who").value;
    const parts = document.getElementById("service-input-parts").value.trim();
    const notes = document.getElementById("service-input-notes").value.trim();

    if (!odo || !date) {
      alert("Completa fecha y kilometraje.");
      return;
    }

    const newService = {
      id: "s_" + Date.now(),
      date,
      odo,
      type,
      title: `${type} • ${who}`,
      cost,
      who,
      parts,
      notes
    };

    this.state.serviceLogs.push(newService);

    // Actualizar el último servicio en la tabla de frecuencias si coincide
    const matchedSched = this.state.maintenanceSchedule.find(s => s.name.includes(type) || type.includes(s.name));
    if (matchedSched) {
      matchedSched.lastDoneOdo = odo;
      matchedSched.lastDoneDate = date;
    }

    // Actualizar odómetro si es mayor
    if (odo > this.state.car.currentOdo) {
      this.state.car.currentOdo = odo;
    }

    this.saveState();
    this.closeModal("modal-service");
    this.renderAll();
    this.showToast("Servicio guardado en bitácora", "🔧");
    this.haptic("heavy");
  }

  handleOdoSubmit(e) {
    e.preventDefault();
    const newOdo = parseInt(document.getElementById("input-quick-odo-val").value, 10);
    if (newOdo && newOdo > 0) {
      this.state.car.currentOdo = newOdo;
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

    this.saveState();
    this.closeModal("modal-car-docs");
    this.renderGarageView();
    this.showToast("Documentación guardada", "📋");
    this.haptic("medium");
  }

  // =============================================================================
  // 12. GESTIÓN DE RESPALDOS (EXPORT / IMPORT JSON)
  // =============================================================================

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
        if (parsed.car && parsed.maintenanceSchedule) {
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

  loadDemoData() {
    if (confirm("¿Cargar datos de prueba de ejemplo para el Aveo 2011?")) {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.saveState();
      this.renderAll();
      this.showToast("Datos de demostración cargados", "🚗");
      this.haptic("heavy");
    }
  }

  // =============================================================================
  // 13. EXPERIENCIA PWA SAFARI IPHONE
  // =============================================================================

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
          console.log("AveoLog ServiceWorker registrado con éxito:", reg.scope);
        }).catch((err) => {
          console.warn("Falla al registrar ServiceWorker:", err);
        });
      });
    }
  }
}

// Inicializar la aplicación cuando el DOM esté listo
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new AveoLogApp();
});
