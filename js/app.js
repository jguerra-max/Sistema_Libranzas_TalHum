/**
 * SISTEMA DE REGISTRO Y CONTROL DE LIBRANZAS - INPEC
 * Lógica Integral, Cálculos Ley 1527 de 2012 y Exportación
 */

// ==========================================
// CONFIGURACIÓN POR DEFECTO
// ==========================================
const LOGO_INPEC_SRC = "assets/logo_inpec.png";

const DEFAULT_CONFIG = {
  establecimiento: "CÁRCEL Y PENITENCIARIA DE MEDIA SEGURIDAD DE TUNJA",
  siglaSede: "CPMS Tunja",
  ciudad: "Tunja-Boyacá",
  responsableNombre: "GLADYS ALBA GUIO",
  responsableCargo: "Profesional Universitario Código 2044 Grado 09",
  responsableArea: "Gestión Humana CPMS Tunja",
  direccion: "Calle 31 No. 2-15 Este Tunja",
  conmutador: "6012347474 Ext. 14916",
  email: "ghumana.ectunja@inpec.gov.co",
  codigoFormato: "PA-DO-G01-F02 v3",
  smlmv: 1423500, // SMLMV de referencia editable
  auxilioTransporte: 162000
};

// ==========================================
// ESTADO GLOBAL
// ==========================================
let appConfig = { ...DEFAULT_CONFIG };
let records = [];
let editingRecordId = null;

// ==========================================
// UTILIDADES: CONVERSIÓN DE NÚMEROS A LETRAS (ESPAÑOL)
// ==========================================
function Unidades(num) {
  switch (num) {
    case 1: return "Un";
    case 2: return "Dos";
    case 3: return "Tres";
    case 4: return "Cuatro";
    case 5: return "Cinco";
    case 6: return "Seis";
    case 7: return "Siete";
    case 8: return "Ocho";
    case 9: return "Nueve";
  }
  return "";
}

function DecenasY(strSin, numUnidades) {
  if (numUnidades > 0) return strSin + " y " + Unidades(numUnidades);
  return strSin;
}

function Decenas(num) {
  let decena = Math.floor(num / 10);
  let unidad = num - (decena * 10);
  switch (decena) {
    case 1:
      switch (unidad) {
        case 0: return "Diez";
        case 1: return "Once";
        case 2: return "Doce";
        case 3: return "Trece";
        case 4: return "Catorce";
        case 5: return "Quince";
        default: return "Dieci" + Unidades(unidad).toLowerCase();
      }
    case 2:
      switch (unidad) {
        case 0: return "Veinte";
        default: return "Veinti" + Unidades(unidad).toLowerCase();
      }
    case 3: return DecenasY("Treinta", unidad);
    case 4: return DecenasY("Cuarenta", unidad);
    case 5: return DecenasY("Cincuenta", unidad);
    case 6: return DecenasY("Sesenta", unidad);
    case 7: return DecenasY("Setenta", unidad);
    case 8: return DecenasY("Ochenta", unidad);
    case 9: return DecenasY("Noventa", unidad);
    case 0: return Unidades(unidad);
  }
  return "";
}

function Centenas(num) {
  let centenas = Math.floor(num / 100);
  let decenas = num - (centenas * 100);
  switch (centenas) {
    case 1:
      if (decenas > 0) return "Ciento " + Decenas(decenas);
      return "Cien";
    case 2: return "Doscientos " + Decenas(decenas);
    case 3: return "Trescientos " + Decenas(decenas);
    case 4: return "Cuatrocientos " + Decenas(decenas);
    case 5: return "Quinientos " + Decenas(decenas);
    case 6: return "Seiscientos " + Decenas(decenas);
    case 7: return "Setecientos " + Decenas(decenas);
    case 8: return "Ochocientos " + Decenas(decenas);
    case 9: return "Novecientos " + Decenas(decenas);
  }
  return Decenas(decenas);
}

function Seccion(num, divisor, strSingular, strPlural) {
  let cientos = Math.floor(num / divisor);
  let resto = num - (cientos * divisor);
  let letras = "";
  if (cientos > 0) {
    if (cientos > 1) {
      letras = Centenas(cientos) + " " + strPlural;
    } else {
      letras = strSingular;
    }
  }
  if (resto > 0) {
    letras += "";
  }
  return { letras: letras.trim(), resto: resto };
}

function Miles(num) {
  let divisor = 1000;
  let cientos = Math.floor(num / divisor);
  let resto = num - (cientos * divisor);
  let strMiles = Seccion(num, divisor, "Mil", "Mil");
  let strCentenas = Centenas(resto);
  if (strMiles.letras === "") return strCentenas;
  return (strMiles.letras + " " + strCentenas).trim();
}

function Millones(num) {
  let divisor = 1000000;
  let cientos = Math.floor(num / divisor);
  let resto = num - (cientos * divisor);
  let strMillones = Seccion(num, divisor, "Un Millón", "Millones");
  let strMiles = Miles(resto);
  if (strMillones.letras === "") return strMiles;
  return (strMillones.letras + " " + strMiles).trim();
}

function numeroALetras(num) {
  num = Math.round(Math.abs(num));
  if (num === 0) return "Cero";
  let resultado = Millones(num).trim();
  // Capitalizar correctamente
  return resultado.charAt(0).toUpperCase() + resultado.slice(1);
}

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(valor || 0);
}

function formatoNumero(valor) {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0
  }).format(valor || 0);
}

// ==========================================
// MANEJO DE FECHAS A TEXTO OFICIAL
// ==========================================
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

function fechaATextoFormal(fechaStr, ciudad) {
  if (!fechaStr) {
    let hoy = new Date();
    fechaStr = hoy.toISOString().split('T')[0];
  }
  const partes = fechaStr.split('-');
  const ano = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const dia = parseInt(partes[2], 10);

  const diaLetras = numeroALetras(dia);
  const nombreMes = MESES[mes] || "enero";
  const anoLetras = numeroALetras(ano);

  return `Se expide en ${ciudad || appConfig.ciudad} a los ${diaLetras} (${dia}) días del mes de ${nombreMes} de ${anoLetras} (${ano}).`;
}

// ==========================================
// INICIALIZACIÓN Y PERSISTENCIA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  cargarConfiguracion();
  cargarRegistros();
  renderizarEstadisticas();
  renderizarTabla();
  configurarEventListeners();
});

function cargarConfiguracion() {
  const guardada = localStorage.getItem("libranzas_inpec_config");
  if (guardada) {
    try {
      appConfig = { ...DEFAULT_CONFIG, ...JSON.parse(guardada) };
    } catch (e) {
      console.error("Error cargando config", e);
    }
  }
}

function guardarConfiguracion() {
  localStorage.setItem("libranzas_inpec_config", JSON.stringify(appConfig));
}

function cargarRegistros() {
  const guardados = localStorage.getItem("libranzas_inpec_records");
  if (guardados) {
    try {
      records = JSON.parse(guardados);
    } catch (e) {
      console.error("Error cargando registros", e);
      records = [];
    }
  } else {
    // Si es la primera vez, cargar 2 registros de ejemplo realistas pero con datos limpios
    records = getRegistrosDemo();
    guardarRegistros();
  }
}

function guardarRegistros() {
  localStorage.setItem("libranzas_inpec_records", JSON.stringify(records));
  renderizarEstadisticas();
  renderizarTabla();
}

function getRegistrosDemo() {
  return [
    {
      id: "REC-2024-001",
      folio: "001-2024",
      fecha: "2024-02-22",
      servidor: {
        nombres: "EDISON RAMIREZ GOMEZ",
        cedula: "79.845.120",
        fechaIngreso: "2008-05-15",
        tipoVinculacion: "CARRERA ADMINISTRATIVA",
        cargo: "Dragoneante",
        codigo: "4114",
        grado: "11",
        establecimiento: "Cárcel y Penitenciaría de Media Seguridad de Tunja"
      },
      devengos: [
        { concepto: "SUELDO BASICO", valor: 1721749 },
        { concepto: "SOBRESUELDO", valor: 952804 },
        { concepto: "AUXILIO DE TRANSPORTE", valor: 162000 },
        { concepto: "PRIMA DE RIESGO", valor: 516525 },
        { concepto: "SUBSIDIO DE ALIMENTACIÓN", valor: 83385 }
      ],
      descuentos: [
        { concepto: "Aporte Salud (4%)", valor: 106982 },
        { concepto: "Aporte Pensión (4%)", valor: 106982 },
        { concepto: "Sindicato Custodia", valor: 35000 }
      ],
      libranza: {
        entidadAcreedora: "COOPERATIVA COOPCENTRAL",
        montoCuota: 450000,
        plazoMeses: 48,
        estado: "Autorizada",
        observaciones: "Cumple capacidad técnica y protección de SMLMV."
      },
      calculos: {
        totalDevengos: 3436463,
        totalDescuentos: 248964,
        devengosNetos: 3222499,
        capacidadMaxima50: 1611249,
        cuotaLibranza: 450000,
        capacidadDisponible: 1161249,
        netoFinalResultante: 2737499,
        cumpleSMLMV: true,
        cumple50Porciento: true,
        aprobado: true
      }
    },
    {
      id: "REC-2024-002",
      folio: "002-2024",
      fecha: "2024-03-10",
      servidor: {
        nombres: "CARLOS ALBERTO PATIÑO SILVA",
        cedula: "11.458.960",
        fechaIngreso: "2012-09-01",
        tipoVinculacion: "CARRERA ADMINISTRATIVA",
        cargo: "Teniente de Prisiones",
        codigo: "4222",
        grado: "16",
        establecimiento: "Cárcel y Penitenciaría de Media Seguridad de Tunja"
      },
      devengos: [
        { concepto: "ASIGNACIÓN BÁSICA", valor: 2666265 },
        { concepto: "SOBRESUELDO", valor: 1249047 },
        { concepto: "PRIMA DE RIESGO", valor: 799880 },
        { concepto: "PRIMA CAPACITACIÓN PROFESIONAL", valor: 533253 },
        { concepto: "SUBSIDIO UNIDAD FAMILIAR", valor: 249095 },
        { concepto: "SUBSIDIO DE ALIMENTACIÓN", valor: 186639 },
        { concepto: "AUXILIO DE TRANSPORTE", valor: 105857 }
      ],
      descuentos: [
        { concepto: "Aporte Salud (4%)", valor: 156700 },
        { concepto: "Aporte Pensión (4%)", valor: 156700 },
        { concepto: "Sindicato Utp Custodia", valor: 26663 },
        { concepto: "Seguros Liberty", valor: 65000 },
        { concepto: "Libranza Banco Popular (Previa)", valor: 620000 }
      ],
      libranza: {
        entidadAcreedora: "BANCO AGRARIO DE COLOMBIA",
        montoCuota: 680000,
        plazoMeses: 60,
        estado: "En trámite",
        observaciones: "Segunda libranza en curso. Capacidad restante verificada."
      },
      calculos: {
        totalDevengos: 5790036,
        totalDescuentos: 1025063,
        devengosNetos: 5476636,
        capacidadMaxima50: 2738318,
        cuotaLibranza: 680000,
        capacidadDisponible: 1438318,
        netoFinalResultante: 4084973,
        cumpleSMLMV: true,
        cumple50Porciento: true,
        aprobado: true
      }
    }
  ];
}

// ==========================================
// CÁLCULO TÉCNICO SEGÚN LEY 1527 DE 2012 Y DIRECTRIZ INPEC
// ==========================================
function calcularCapacidadTecnica(devengos, descuentos, cuotaSolicitada, servidorCedula = null, registroIdActual = null) {
  const totalDevengos = devengos.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
  
  // Separar descuentos de ley (salud/pensión ~8% o los especificados)
  let descuentosDeLey = 0;
  let otrosDescuentos = 0;

  descuentos.forEach(d => {
    const nom = (d.concepto || "").toLowerCase();
    const val = Number(d.valor) || 0;
    if (nom.includes("salud") || nom.includes("pensión") || nom.includes("pension") || nom.includes("ley")) {
      descuentosDeLey += val;
    } else {
      otrosDescuentos += val;
    }
  });

  const totalDescuentos = descuentosDeLey + otrosDescuentos;
  
  // Devengos netos de ley (Base para el límite del 50%)
  const devengosNetos = Math.max(0, totalDevengos - descuentosDeLey);
  
  // Límite legal máximo del 50% de devengos netos (Ley 1527 Art. 3)
  const capacidadMaxima50 = Math.round(devengosNetos * 0.50);
  
  // Capacidad disponible tras restar otros descuentos y libranzas preexistentes
  const capacidadDisponible = Math.max(0, capacidadMaxima50 - otrosDescuentos);
  
  // Cuota solicitada
  const cuota = Number(cuotaSolicitada) || 0;
  
  // Neto resultante tras aplicar todos los descuentos y la nueva cuota
  const netoFinalResultante = totalDevengos - totalDescuentos - cuota;
  
  // Verificación 1: El salario neto no debe ser menor al SMLMV
  const cumpleSMLMV = netoFinalResultante >= appConfig.smlmv;
  
  // Verificación 2: La cuota + otros descuentos no debe superar el 50% de los devengos netos
  const cumple50Porciento = (otrosDescuentos + cuota) <= capacidadMaxima50;

  // Verificación 3: Regla de duplicidad INPEC (Directriz 2.2 - Máximo 2 solicitudes en trámite simultáneo)
  let libranzasEnTramitePrevias = 0;
  if (servidorCedula) {
    libranzasEnTramitePrevias = records.filter(r => 
      r.servidor.cedula.trim() === servidorCedula.trim() &&
      r.libranza.estado === "En trámite" &&
      r.id !== registroIdActual
    ).length;
  }
  const excedeLimiteSimultaneo = libranzasEnTramitePrevias >= 2;

  const aprobado = cumpleSMLMV && cumple50Porciento && !excedeLimiteSimultaneo;

  return {
    totalDevengos,
    totalDescuentos,
    devengosNetos,
    capacidadMaxima50,
    capacidadDisponible,
    cuotaLibranza: cuota,
    netoFinalResultante,
    cumpleSMLMV,
    cumple50Porciento,
    libranzasEnTramitePrevias,
    excedeLimiteSimultaneo,
    aprobado
  };
}

// ==========================================
// RENDERIZADO DE ESTADÍSTICAS
// ==========================================
function renderizarEstadisticas() {
  const totalCert = records.length;
  const enTramite = records.filter(r => r.libranza.estado === "En trámite").length;
  const autorizadas = records.filter(r => r.libranza.estado === "Autorizada").length;
  const totalMontoCuotas = records.reduce((acc, r) => acc + (Number(r.libranza.montoCuota) || 0), 0);

  document.getElementById("statTotalCert").innerText = totalCert;
  document.getElementById("statEnTramite").innerText = enTramite;
  document.getElementById("statAutorizadas").innerText = autorizadas;
  document.getElementById("statMontoLibranzas").innerText = formatoMoneda(totalMontoCuotas);
}

// ==========================================
// RENDERIZADO DE TABLA Y FILTROS
// ==========================================
function getRegistrosFiltrados() {
  const fInicio = document.getElementById("filterFechaInicio").value;
  const fFin = document.getElementById("filterFechaFin").value;
  const query = document.getElementById("filterBusqueda").value.toLowerCase().trim();
  const estado = document.getElementById("filterEstado").value;

  return records.filter(r => {
    // Filtro por fecha
    if (fInicio && r.fecha < fInicio) return false;
    if (fFin && r.fecha > fFin) return false;

    // Filtro por estado
    if (estado && r.libranza.estado !== estado) return false;

    // Filtro de texto (nombre, cedula, entidad, cargo)
    if (query) {
      const match = 
        (r.folio && r.folio.toLowerCase().includes(query)) ||
        (r.servidor.nombres && r.servidor.nombres.toLowerCase().includes(query)) ||
        (r.servidor.cedula && r.servidor.cedula.toLowerCase().includes(query)) ||
        (r.servidor.cargo && r.servidor.cargo.toLowerCase().includes(query)) ||
        (r.libranza.entidadAcreedora && r.libranza.entidadAcreedora.toLowerCase().includes(query));
      if (!match) return false;
    }

    return true;
  });
}

function renderizarTabla() {
  const tbody = document.getElementById("recordsTableBody");
  const lista = getRegistrosFiltrados();

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <div style="font-size: 1.8rem; margin-bottom: 6px;">📂</div>
          <strong>No se encontraron certificaciones ni registros</strong><br>
          <small>Prueba ajustando los filtros o crea una nueva certificación.</small>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = lista.map((r, idx) => {
    let badgeClass = "badge-tramite";
    if (r.libranza.estado === "Autorizada") badgeClass = "badge-autorizada";
    else if (r.libranza.estado === "Rechazada") badgeClass = "badge-rechazada";
    else if (r.libranza.estado === "Finalizada") badgeClass = "badge-finalizada";

    return `
      <tr>
        <td style="font-weight: 700; color: var(--primary);">${r.folio || ("#" + (idx + 1))}</td>
        <td style="white-space: nowrap;">${r.fecha}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${r.servidor.nombres}</div>
          <small style="color: var(--text-muted);">C.C. ${r.servidor.cedula}</small>
        </td>
        <td>
          <div>${r.servidor.cargo}</div>
          <small style="color: var(--text-muted);">Grado ${r.servidor.grado} - Cód. ${r.servidor.codigo}</small>
        </td>
        <td style="font-weight: 600;">${r.libranza.entidadAcreedora}</td>
        <td style="text-align: right; font-weight: 600;">${formatoMoneda(r.calculos.totalDevengos)}</td>
        <td style="text-align: right; color: var(--danger);">${formatoMoneda(r.calculos.totalDescuentos)}</td>
        <td style="text-align: right; font-weight: 700; color: #1e3a8a;">${formatoMoneda(r.libranza.montoCuota)}</td>
        <td style="text-align: right; font-weight: 700; color: ${r.calculos.cumpleSMLMV ? 'var(--success)' : 'var(--danger)'};">
          ${formatoMoneda(r.calculos.capacidadDisponible)}
        </td>
        <td><span class="badge ${badgeClass}">${r.libranza.estado}</span></td>
        <td style="white-space: nowrap; text-align: center;">
          <button class="btn btn-primary btn-sm" onclick="verDocumentoPDF('${r.id}')" title="Ver / Imprimir Certificación PDF">
            📄 PDF
          </button>
          <button class="btn btn-outline btn-sm" onclick="editarRegistro('${r.id}')" title="Editar">
            ✏️
          </button>
          <button class="btn btn-outline btn-sm" onclick="eliminarRegistro('${r.id}')" title="Eliminar" style="color: var(--danger);">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// ==========================================
// PREAJUSTES RÁPIDOS DE FECHA
// ==========================================
function aplicarFiltroFechaRapido(tipo) {
  const hoy = new Date();
  const ano = hoy.getFullYear();
  let inicio = "";
  let fin = "";

  document.querySelectorAll(".quick-filter-btns .btn-tag").forEach(b => b.classList.remove("active"));

  if (tipo === "mes") {
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    inicio = `${ano}-${mes}-01`;
    const ultimoDia = new Date(ano, hoy.getMonth() + 1, 0).getDate();
    fin = `${ano}-${mes}-${ultimoDia}`;
  } else if (tipo === "sem1") {
    inicio = `${ano}-01-01`;
    fin = `${ano}-06-30`;
  } else if (tipo === "sem2") {
    inicio = `${ano}-07-01`;
    fin = `${ano}-12-31`;
  } else if (tipo === "ano") {
    inicio = `${ano}-01-01`;
    fin = `${ano}-12-31`;
  } else if (tipo === "todos") {
    inicio = "";
    fin = "";
  }

  document.getElementById("filterFechaInicio").value = inicio;
  document.getElementById("filterFechaFin").value = fin;
  renderizarTabla();
}

// ==========================================
// GENERACIÓN Y EDICIÓN DE TEXTOS OFICIALES PARA PDF
// ==========================================
function generarTextosPredeterminados() {
  const nombres = (document.getElementById("formNombres") ? document.getElementById("formNombres").value.trim().toUpperCase() : "") || "EL SERVIDOR PÚBLICO";
  const cedula = (document.getElementById("formCedula") ? document.getElementById("formCedula").value.trim() : "") || "0.000.000";
  const fechaIngreso = document.getElementById("formFechaIngreso") ? document.getElementById("formFechaIngreso").value : "";
  const tipoVinculacion = (document.getElementById("formTipoVinculacion") ? document.getElementById("formTipoVinculacion").value.trim() : "") || "CARRERA ADMINISTRATIVA";
  const cargo = (document.getElementById("formCargo") ? document.getElementById("formCargo").value.trim() : "") || "Dragoneante";
  const codigo = (document.getElementById("formCodigo") ? document.getElementById("formCodigo").value.trim() : "") || "4114";
  const grado = (document.getElementById("formGrado") ? document.getElementById("formGrado").value.trim() : "") || "11";
  const establecimiento = (document.getElementById("formEstablecimiento") ? document.getElementById("formEstablecimiento").value.trim() : "") || appConfig.establecimiento;
  const fechaExp = document.getElementById("formFecha") ? document.getElementById("formFecha").value : "";

  // Formato formal fecha de ingreso
  let fechaIngresoTexto = fechaIngreso || "fecha de posesión";
  if (fechaIngreso && fechaIngreso.includes("-")) {
    const p = fechaIngreso.split('-');
    const a = parseInt(p[0], 10);
    const m = parseInt(p[1], 10) - 1;
    const d = parseInt(p[2], 10);
    fechaIngresoTexto = `${d} de ${MESES[m] || ''} de ${a}`;
  }

  // Calcular total de devengos actuales
  const devengos = obtenerConceptosDeTabla("devengosTableBody");
  const totalDev = devengos.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
  const devengosEnLetras = numeroALetras(totalDev);

  return {
    textoConstancia: "Que la información inscrita en esta certificación se encuentra soportada por la documentación existente en la Hoja de Vida.",
    textoServidor: `El señor ${nombres}, quien se identifica con la cédula de ciudadanía No. ${cedula}, labora en el Instituto Nacional Penitenciario y Carcelario INPEC, desde el ${fechaIngresoTexto}, con vinculación en ${tipoVinculacion}.`,
    textoCargoIngresos: `Actualmente desempeña el cargo de ${cargo} de la ${establecimiento} Código ${codigo} Grado ${grado}, devengando un total de ingresos de ${devengosEnLetras} pesos M/L ($${formatoNumero(totalDev)}), discriminados así:`,
    textoFechaExpedicion: fechaATextoFormal(fechaExp, appConfig.ciudad)
  };
}

function regenerarTextosPDF(forzar = false) {
  const defaults = generarTextosPredeterminados();
  const elConst = document.getElementById("formTextoConstancia");
  const elServ = document.getElementById("formTextoServidor");
  const elCargo = document.getElementById("formTextoCargoIngresos");
  const elFecha = document.getElementById("formTextoFechaExpedicion");

  if (forzar) {
    if (elConst) { elConst.value = defaults.textoConstancia; delete elConst.dataset.editadoManualmente; }
    if (elServ) { elServ.value = defaults.textoServidor; delete elServ.dataset.editadoManualmente; }
    if (elCargo) { elCargo.value = defaults.textoCargoIngresos; delete elCargo.dataset.editadoManualmente; }
    if (elFecha) { elFecha.value = defaults.textoFechaExpedicion; delete elFecha.dataset.editadoManualmente; }
    return;
  }

  if (elConst && (!elConst.value.trim() || !elConst.dataset.editadoManualmente)) elConst.value = defaults.textoConstancia;
  if (elServ && (!elServ.value.trim() || !elServ.dataset.editadoManualmente)) elServ.value = defaults.textoServidor;
  if (elCargo && (!elCargo.value.trim() || !elCargo.dataset.editadoManualmente)) elCargo.value = defaults.textoCargoIngresos;
  if (elFecha && (!elFecha.value.trim() || !elFecha.dataset.editadoManualmente)) elFecha.value = defaults.textoFechaExpedicion;
}

// ==========================================
// GESTIÓN DEL FORMULARIO DE CERTIFICACIÓN
// ==========================================
function abrirModalCertificacion(id = null) {
  editingRecordId = id;
  const modalTitle = document.getElementById("modalCertificacionTitle");
  
  if (id) {
    modalTitle.innerHTML = "✏️ Modificar Certificación y Registro de Libranza";
    const rec = records.find(r => r.id === id);
    if (rec) cargarFormularioConRegistro(rec);
  } else {
    modalTitle.innerHTML = "📝 Nueva Certificación y Registro de Libranza";
    limpiarFormularioNuevo();
  }

  recalcularFormularioEnVivo();
  abrirModal("modalCertificacion");
}

function limpiarFormularioNuevo() {
  const hoyStr = new Date().toISOString().split('T')[0];
  const nuevoFolio = String(records.length + 1).padStart(3, '0') + "-" + new Date().getFullYear();

  document.getElementById("formFolio").value = nuevoFolio;
  document.getElementById("formFecha").value = hoyStr;
  document.getElementById("formNombres").value = "";
  document.getElementById("formCedula").value = "";
  document.getElementById("formFechaIngreso").value = "";
  document.getElementById("formTipoVinculacion").value = "CARRERA ADMINISTRATIVA";
  document.getElementById("formCargo").value = "Dragoneante";
  document.getElementById("formCodigo").value = "4114";
  document.getElementById("formGrado").value = "11";
  document.getElementById("formEstablecimiento").value = appConfig.establecimiento;

  // Cargar devengos base
  const devengosBase = [
    { concepto: "SUELDO BASICO", valor: 1721749 },
    { concepto: "SOBRESUELDO", valor: 952804 },
    { concepto: "AUXILIO DE TRANSPORTE", valor: 162000 },
    { concepto: "PRIMA DE RIESGO", valor: 516525 },
    { concepto: "SUBSIDIO DE ALIMENTACIÓN", valor: 83385 }
  ];
  renderizarFilasConceptos("devengosTableBody", devengosBase, "devengo");

  // Cargar descuentos base
  const descuentosBase = [
    { concepto: "Aporte Salud (4%)", valor: 106982 },
    { concepto: "Aporte Pensión (4%)", valor: 106982 }
  ];
  renderizarFilasConceptos("descuentosTableBody", descuentosBase, "descuento");

  document.getElementById("formEntidadAcreedora").value = "";
  document.getElementById("formMontoCuota").value = 450000;
  document.getElementById("formPlazoMeses").value = 36;
  document.getElementById("formEstado").value = "En trámite";
  document.getElementById("formObservaciones").value = "";

  // Cargar textos por defecto para la certificación PDF
  regenerarTextosPDF(true);
}

function cargarFormularioConRegistro(rec) {
  document.getElementById("formFolio").value = rec.folio || "";
  document.getElementById("formFecha").value = rec.fecha || "";
  document.getElementById("formNombres").value = rec.servidor.nombres || "";
  document.getElementById("formCedula").value = rec.servidor.cedula || "";
  document.getElementById("formFechaIngreso").value = rec.servidor.fechaIngreso || "";
  document.getElementById("formTipoVinculacion").value = rec.servidor.tipoVinculacion || "CARRERA ADMINISTRATIVA";
  document.getElementById("formCargo").value = rec.servidor.cargo || "";
  document.getElementById("formCodigo").value = rec.servidor.codigo || "";
  document.getElementById("formGrado").value = rec.servidor.grado || "";
  document.getElementById("formEstablecimiento").value = rec.servidor.establecimiento || appConfig.establecimiento;

  renderizarFilasConceptos("devengosTableBody", rec.devengos || [], "devengo");
  renderizarFilasConceptos("descuentosTableBody", rec.descuentos || [], "descuento");

  document.getElementById("formEntidadAcreedora").value = rec.libranza.entidadAcreedora || "";
  document.getElementById("formMontoCuota").value = rec.libranza.montoCuota || 0;
  document.getElementById("formPlazoMeses").value = rec.libranza.plazoMeses || 12;
  document.getElementById("formEstado").value = rec.libranza.estado || "En trámite";
  document.getElementById("formObservaciones").value = rec.libranza.observaciones || "";

  // Cargar textos personalizados si existen, o generarlos
  if (rec.textosPersonalizados) {
    document.getElementById("formTextoConstancia").value = rec.textosPersonalizados.textoConstancia || "";
    document.getElementById("formTextoServidor").value = rec.textosPersonalizados.textoServidor || "";
    document.getElementById("formTextoCargoIngresos").value = rec.textosPersonalizados.textoCargoIngresos || "";
    document.getElementById("formTextoFechaExpedicion").value = rec.textosPersonalizados.textoFechaExpedicion || "";
  } else {
    regenerarTextosPDF(true);
  }
}

function renderizarFilasConceptos(tbodyId, lista, tipo) {
  const tbody = document.getElementById(tbodyId);
  tbody.innerHTML = lista.map((item, index) => `
    <tr data-index="${index}">
      <td>
        <input type="text" class="form-control input-concepto" value="${item.concepto || ''}" placeholder="Nombre del concepto" oninput="recalcularFormularioEnVivo()">
      </td>
      <td style="width: 160px;">
        <input type="number" class="form-control input-valor" value="${item.valor || 0}" min="0" step="100" style="text-align: right;" oninput="recalcularFormularioEnVivo()">
      </td>
      <td style="width: 40px; text-align: center;">
        <button type="button" class="btn btn-outline btn-sm" onclick="eliminarFilaConcepto(this)" style="color: var(--danger); padding: 2px 6px;">✕</button>
      </td>
    </tr>
  `).join("");
}

function agregarFilaConcepto(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>
      <input type="text" class="form-control input-concepto" value="" placeholder="Nuevo concepto" oninput="recalcularFormularioEnVivo()">
    </td>
    <td style="width: 160px;">
      <input type="number" class="form-control input-valor" value="0" min="0" step="100" style="text-align: right;" oninput="recalcularFormularioEnVivo()">
    </td>
    <td style="width: 40px; text-align: center;">
      <button type="button" class="btn btn-outline btn-sm" onclick="eliminarFilaConcepto(this)" style="color: var(--danger); padding: 2px 6px;">✕</button>
    </td>
  `;
  tbody.appendChild(tr);
  tr.querySelector("input").focus();
  recalcularFormularioEnVivo();
}

function eliminarFilaConcepto(btn) {
  const row = btn.closest("tr");
  row.remove();
  recalcularFormularioEnVivo();
}

function obtenerConceptosDeTabla(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  const filas = tbody.querySelectorAll("tr");
  const lista = [];
  filas.forEach(f => {
    const concepto = f.querySelector(".input-concepto") ? f.querySelector(".input-concepto").value.trim() : "";
    const valor = f.querySelector(".input-valor") ? Number(f.querySelector(".input-valor").value) || 0 : 0;
    if (concepto) {
      lista.push({ concepto, valor });
    }
  });
  return lista;
}

// ==========================================
// CÁLCULO EN TIEMPO REAL DENTRO DEL FORMULARIO
// ==========================================
function recalcularFormularioEnVivo() {
  const devengos = obtenerConceptosDeTabla("devengosTableBody");
  const descuentos = obtenerConceptosDeTabla("descuentosTableBody");
  const cuota = Number(document.getElementById("formMontoCuota").value) || 0;
  const cedula = document.getElementById("formCedula").value;

  const resultado = calcularCapacidadTecnica(devengos, descuentos, cuota, cedula, editingRecordId);

  // Actualizar totales en la interfaz
  document.getElementById("formTotalDevengosText").innerText = formatoMoneda(resultado.totalDevengos);
  document.getElementById("formTotalDescuentosText").innerText = formatoMoneda(resultado.totalDescuentos);
  
  // Total en letras en vivo
  document.getElementById("formDevengosLetras").innerText = `${numeroALetras(resultado.totalDevengos)} pesos M/L`;

  // Indicadores del panel técnico Ley 1527
  document.getElementById("calcDevengosNetos").innerText = formatoMoneda(resultado.devengosNetos);
  document.getElementById("calcCapacidad50").innerText = formatoMoneda(resultado.capacidadMaxima50);
  document.getElementById("calcCapacidadDisponible").innerText = formatoMoneda(resultado.capacidadDisponible);
  document.getElementById("calcNetoResultante").innerText = formatoMoneda(resultado.netoFinalResultante);
  document.getElementById("calcSMLMVRef").innerText = formatoMoneda(appConfig.smlmv);

  const cardCap = document.getElementById("capacityAnalysisCard");
  const verdictBox = document.getElementById("capacityVerdictBox");
  const alertDuplicidad = document.getElementById("alertDuplicidad");

  if (resultado.excedeLimiteSimultaneo) {
    alertDuplicidad.style.display = "flex";
    alertDuplicidad.innerHTML = `⚠️ <strong>ALERTA DE DUPLICIDAD (Directriz 2.2):</strong> El servidor ya cuenta con ${resultado.libranzasEnTramitePrevias} libranzas en trámite simultáneo. No se puede avalar una adicional sin paz y salvo de nómina.`;
  } else {
    alertDuplicidad.style.display = "none";
  }

  // Actualizar textos automáticos del PDF si no han sido editados a mano
  regenerarTextosPDF(false);

  if (resultado.aprobado) {
    cardCap.className = "capacity-card passed";
    verdictBox.className = "cap-verdict success";
    verdictBox.innerHTML = `✅ <strong>DICTAMEN TÉCNICO: APTO PARA AUTORIZACIÓN.</strong> Cumple con el límite del 50% de devengos netos ($${formatoNumero(resultado.cuotaLibranza)} <= $${formatoNumero(resultado.capacidadDisponible)}) y respeta el Salario Mínimo Legal Vigente ($${formatoNumero(resultado.netoFinalResultante)} >= $${formatoNumero(appConfig.smlmv)}).`;
  } else {
    cardCap.className = "capacity-card failed";
    verdictBox.className = "cap-verdict danger";
    let motivos = [];
    if (!resultado.cumple50Porciento) motivos.push("Supera el 50% de los devengos netos");
    if (!resultado.cumpleSMLMV) motivos.push("El neto resultante es inferior al SMLMV de ley");
    if (resultado.excedeLimiteSimultaneo) motivos.push("Excede el límite de 2 libranzas simultáneas");
    
    verdictBox.innerHTML = `❌ <strong>DICTAMEN TÉCNICO: NO CUMPLE REQUISITOS DE LEY.</strong> Causas: ${motivos.join(", ")}.`;
  }

  return resultado;
}

// ==========================================
// GUARDAR FORMULARIO
// ==========================================
function guardarFormularioCertificacion(generarPdfInmediato = false) {
  const folio = document.getElementById("formFolio").value.trim();
  const fecha = document.getElementById("formFecha").value;
  const nombres = document.getElementById("formNombres").value.trim().toUpperCase();
  const cedula = document.getElementById("formCedula").value.trim();
  const fechaIngreso = document.getElementById("formFechaIngreso").value;
  const tipoVinculacion = document.getElementById("formTipoVinculacion").value.trim();
  const cargo = document.getElementById("formCargo").value.trim();
  const codigo = document.getElementById("formCodigo").value.trim();
  const grado = document.getElementById("formGrado").value.trim();
  const establecimiento = document.getElementById("formEstablecimiento").value.trim();

  if (!nombres || !cedula) {
    alert("Por favor ingrese al menos el nombre completo y la cédula del servidor público.");
    return;
  }

  const devengos = obtenerConceptosDeTabla("devengosTableBody");
  const descuentos = obtenerConceptosDeTabla("descuentosTableBody");
  const entidadAcreedora = document.getElementById("formEntidadAcreedora").value.trim() || "ENTIDAD FINANCIERA";
  const montoCuota = Number(document.getElementById("formMontoCuota").value) || 0;
  const plazoMeses = Number(document.getElementById("formPlazoMeses").value) || 12;
  const estado = document.getElementById("formEstado").value;
  const observaciones = document.getElementById("formObservaciones").value.trim();

  const calculos = calcularCapacidadTecnica(devengos, descuentos, montoCuota, cedula, editingRecordId);

  // Capturar textos personalizados para el documento PDF
  const textosPersonalizados = {
    textoConstancia: document.getElementById("formTextoConstancia") ? document.getElementById("formTextoConstancia").value.trim() : "",
    textoServidor: document.getElementById("formTextoServidor") ? document.getElementById("formTextoServidor").value.trim() : "",
    textoCargoIngresos: document.getElementById("formTextoCargoIngresos") ? document.getElementById("formTextoCargoIngresos").value.trim() : "",
    textoFechaExpedicion: document.getElementById("formTextoFechaExpedicion") ? document.getElementById("formTextoFechaExpedicion").value.trim() : ""
  };

  const nuevoRegistro = {
    id: editingRecordId || ("REC-" + Date.now()),
    folio: folio || ("FOL-" + Date.now().toString().slice(-4)),
    fecha: fecha || new Date().toISOString().split('T')[0],
    servidor: {
      nombres,
      cedula,
      fechaIngreso,
      tipoVinculacion,
      cargo,
      codigo,
      grado,
      establecimiento
    },
    devengos,
    descuentos,
    libranza: {
      entidadAcreedora,
      montoCuota,
      plazoMeses,
      estado,
      observaciones
    },
    calculos,
    textosPersonalizados
  };

  if (editingRecordId) {
    const idx = records.findIndex(r => r.id === editingRecordId);
    if (idx !== -1) records[idx] = nuevoRegistro;
  } else {
    records.unshift(nuevoRegistro);
  }

  guardarRegistros();
  cerrarModal("modalCertificacion");

  if (generarPdfInmediato) {
    verDocumentoPDF(nuevoRegistro.id);
  }
}

function eliminarRegistro(id) {
  const rec = records.find(r => r.id === id);
  if (!rec) return;
  if (confirm(`¿Está seguro de eliminar el registro de ${rec.servidor.nombres} (Folio ${rec.folio})?`)) {
    records = records.filter(r => r.id !== id);
    guardarRegistros();
  }
}

function editarRegistro(id) {
  abrirModalCertificacion(id);
}

// ==========================================
// VISTA PREVIA Y FORMATO DE IMPRESIÓN (PDF)
// EXACTO A LA IMAGEN 2 (PA-DO-G01-F02)
// ==========================================
function guardarEdicionEnVivoDoc(id, campo, nuevoTexto) {
  const rec = records.find(r => r.id === id);
  if (!rec) return;
  if (!rec.textosPersonalizados) rec.textosPersonalizados = {};
  rec.textosPersonalizados[campo] = nuevoTexto.trim();
  localStorage.setItem("libranzas_inpec_records", JSON.stringify(records));
}

function verDocumentoPDF(id) {
  const rec = records.find(r => r.id === id);
  if (!rec) return;

  const totalDevengos = rec.calculos.totalDevengos;
  const devengosEnLetras = numeroALetras(totalDevengos);
  const textoFechaExpedicionDefecto = fechaATextoFormal(rec.fecha, appConfig.ciudad);

  // Formato de fecha de ingreso formal
  let fechaIngresoTexto = rec.servidor.fechaIngreso || "";
  if (fechaIngresoTexto.includes("-")) {
    const p = fechaIngresoTexto.split('-');
    const a = parseInt(p[0], 10);
    const m = parseInt(p[1], 10) - 1;
    const d = parseInt(p[2], 10);
    fechaIngresoTexto = `${d} de ${MESES[m] || ''} de ${a}`;
  }

  // Textos finales: personalizados si existen, o por defecto
  const pConstancia = (rec.textosPersonalizados && rec.textosPersonalizados.textoConstancia)
    ? rec.textosPersonalizados.textoConstancia
    : "Que la información inscrita en esta certificación se encuentra soportada por la documentación existente en la Hoja de Vida.";

  const pServidor = (rec.textosPersonalizados && rec.textosPersonalizados.textoServidor)
    ? rec.textosPersonalizados.textoServidor
    : `El señor <strong>${rec.servidor.nombres}</strong>, quien se identifica con la cédula de ciudadanía No. <strong>${rec.servidor.cedula}</strong>, labora en el Instituto Nacional Penitenciario y Carcelario INPEC, desde el <strong>${fechaIngresoTexto}</strong>, con vinculación en <strong>${rec.servidor.tipoVinculacion}</strong>.`;

  const pCargoIngresos = (rec.textosPersonalizados && rec.textosPersonalizados.textoCargoIngresos)
    ? rec.textosPersonalizados.textoCargoIngresos
    : `Actualmente desempeña el cargo de <strong>${rec.servidor.cargo}</strong> Código <strong>${rec.servidor.codigo}</strong> Grado <strong>${rec.servidor.grado}</strong>, devengando un total de ingresos de <strong>${devengosEnLetras} pesos M/L ($${formatoNumero(totalDevengos)})</strong>, discriminados así:`;

  const pFecha = (rec.textosPersonalizados && rec.textosPersonalizados.textoFechaExpedicion)
    ? rec.textosPersonalizados.textoFechaExpedicion
    : textoFechaExpedicionDefecto;

  // Generar filas de ingresos para el documento
  const filasDevengosHtml = rec.devengos.map(item => `
    <tr>
      <td class="doc-label">${item.concepto}</td>
      <td class="doc-val">${formatoNumero(item.valor)}</td>
    </tr>
  `).join("");

  const docHtml = `
    <div class="doc-sheet">
      <!-- ENCABEZADO OFICIAL -->
      <div>
        <div class="doc-header-logo">
          <img src="${LOGO_INPEC_SRC}" alt="Logo Oficial INPEC" style="max-height: 80px; width: auto; object-fit: contain; margin-bottom: 5px;">
        </div>

        <div class="doc-authority-title">
          LA SUSCRITA RESPONSABLE DE GESTIÓN HUMANA DE LA ${appConfig.establecimiento}
        </div>

        <div class="doc-constar">
          HACE CONSTAR
        </div>

        <p class="doc-p doc-editable" contenteditable="true" title="Clic para editar este párrafo" onblur="guardarEdicionEnVivoDoc('${rec.id}', 'textoConstancia', this.innerText)">
          ${pConstancia}
        </p>

        <p class="doc-p doc-editable" contenteditable="true" title="Clic para editar este párrafo" onblur="guardarEdicionEnVivoDoc('${rec.id}', 'textoServidor', this.innerHTML)">
          ${pServidor}
        </p>

        <p class="doc-p doc-editable" contenteditable="true" title="Clic para editar este párrafo" onblur="guardarEdicionEnVivoDoc('${rec.id}', 'textoCargoIngresos', this.innerHTML)">
          ${pCargoIngresos}
        </p>

        <table class="doc-income-table">
          <tbody>
            ${filasDevengosHtml}
            <tr class="doc-total-row">
              <td class="doc-label">TOTAL</td>
              <td class="doc-val">$ ${formatoNumero(totalDevengos)}</td>
            </tr>
          </tbody>
        </table>

        <p class="doc-date-exp doc-editable" contenteditable="true" title="Clic para editar fecha o destino" onblur="guardarEdicionEnVivoDoc('${rec.id}', 'textoFechaExpedicion', this.innerText)">
          ${pFecha}
        </p>
      </div>

      <!-- BLOQUE DE FIRMA Y PIE DE PÁGINA -->
      <div>
        <div class="doc-sign-block">
          <div class="doc-sign-name">${appConfig.responsableNombre}</div>
          <div class="doc-sign-role">${appConfig.responsableCargo}</div>
          <div class="doc-sign-unit">${appConfig.responsableArea}</div>
        </div>

        <div class="doc-footer-legal">
          <div class="doc-footer-left">
            <strong>INSTITUTO NACIONAL PENITENCIARIO Y CARCELARIO - INPEC</strong><br>
            ${appConfig.establecimiento}<br>
            Dirección: ${appConfig.direccion}<br>
            Conmutador: ${appConfig.conmutador}<br>
            ${appConfig.email}
          </div>
          <div class="doc-footer-right">
            Página 1 de 1<br>
            <strong>Código: ${appConfig.codigoFormato}</strong>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("pdfDocContainer").innerHTML = docHtml;
  abrirModal("modalPDF");
}

function imprimirDocumentoPDF() {
  window.print();
}

// ==========================================
// EXPORTACIÓN A EXCEL (.XLSX)
// ==========================================
function exportarAExcel() {
  const lista = getRegistrosFiltrados();

  if (lista.length === 0) {
    alert("No hay registros que coincidan con los filtros seleccionados para exportar.");
    return;
  }

  // Verificar si SheetJS está cargado
  if (typeof XLSX === "undefined") {
    alert("La librería de exportación XLSX no se pudo inicializar. Usando respaldo CSV.");
    exportarACSV(lista);
    return;
  }

  const filasExcel = lista.map((r, i) => ({
    "N° Folio": r.folio || (i + 1),
    "Fecha Expedición": r.fecha,
    "Servidor Público": r.servidor.nombres,
    "Cédula": r.servidor.cedula,
    "Fecha Ingreso": r.servidor.fechaIngreso,
    "Tipo Vinculación": r.servidor.tipoVinculacion,
    "Cargo": r.servidor.cargo,
    "Código": r.servidor.codigo,
    "Grado": r.servidor.grado,
    "Establecimiento": r.servidor.establecimiento,
    "Entidad Acreedora (Libranza)": r.libranza.entidadAcreedora,
    "Monto Cuota Solicitada": r.libranza.montoCuota,
    "Plazo (Meses)": r.libranza.plazoMeses,
    "Estado Trámite": r.libranza.estado,
    "Total Devengos (Ingresos)": r.calculos.totalDevengos,
    "Total Descuentos": r.calculos.totalDescuentos,
    "Devengos Netos (Base 50%)": r.calculos.devengosNetos,
    "Capacidad Máx 50% Ley 1527": r.calculos.capacidadMaxima50,
    "Capacidad Disponible Resultante": r.calculos.capacidadDisponible,
    "Neto Resultante tras Descuento": r.calculos.netoFinalResultante,
    "Cumple Salario Mínimo Legal": r.calculos.cumpleSMLMV ? "SÍ" : "NO",
    "Cumple Regla 50%": r.calculos.cumple50Porciento ? "SÍ" : "NO",
    "Dictamen Técnico": r.calculos.aprobado ? "APTO" : "NO APTO",
    "Observaciones": r.libranza.observaciones || ""
  }));

  const worksheet = XLSX.utils.json_to_sheet(filasExcel);

  // Ajustar anchos de columnas automáticamente
  const colWidths = [
    { wch: 12 }, // Folio
    { wch: 15 }, // Fecha
    { wch: 32 }, // Servidor
    { wch: 15 }, // Cédula
    { wch: 14 }, // Fecha Ingreso
    { wch: 25 }, // Vinculación
    { wch: 22 }, // Cargo
    { wch: 10 }, // Código
    { wch: 8 },  // Grado
    { wch: 35 }, // Establecimiento
    { wch: 28 }, // Entidad
    { wch: 18 }, // Cuota
    { wch: 12 }, // Plazo
    { wch: 14 }, // Estado
    { wch: 20 }, // Devengos
    { wch: 18 }, // Descuentos
    { wch: 20 }, // Devengos Netos
    { wch: 22 }, // Capacidad 50%
    { wch: 24 }, // Capacidad Disponible
    { wch: 24 }, // Neto Resultante
    { wch: 16 }, // SMLMV
    { wch: 16 }, // Regla 50
    { wch: 16 }, // Dictamen
    { wch: 30 }  // Observaciones
  ];
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Planilla_Libranzas");

  // Nombre de archivo con marca de tiempo
  const fechaHoy = new Date().toISOString().split('T')[0];
  const nombreArchivo = `Consolidado_Libranzas_INPEC_${fechaHoy}.xlsx`;

  XLSX.writeFile(workbook, nombreArchivo);
}

function exportarACSV(lista) {
  const headers = [
    "Folio", "Fecha", "Servidor", "Cedula", "Cargo", "Entidad",
    "Monto_Cuota", "Total_Devengos", "Total_Descuentos", "Capacidad_Disponible", "Estado"
  ];
  const rows = lista.map(r => [
    `"${r.folio}"`,
    `"${r.fecha}"`,
    `"${r.servidor.nombres}"`,
    `"${r.servidor.cedula}"`,
    `"${r.servidor.cargo}"`,
    `"${r.libranza.entidadAcreedora}"`,
    r.libranza.montoCuota,
    r.calculos.totalDevengos,
    r.calculos.totalDescuentos,
    r.calculos.capacidadDisponible,
    `"${r.libranza.estado}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Libranzas_INPEC_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}

// ==========================================
// CONFIGURACIÓN / AJUSTES DE SEDE
// ==========================================
function abrirModalConfiguracion() {
  document.getElementById("cfgEstablecimiento").value = appConfig.establecimiento;
  document.getElementById("cfgSiglaSede").value = appConfig.siglaSede;
  document.getElementById("cfgCiudad").value = appConfig.ciudad;
  document.getElementById("cfgResponsableNombre").value = appConfig.responsableNombre;
  document.getElementById("cfgResponsableCargo").value = appConfig.responsableCargo;
  document.getElementById("cfgResponsableArea").value = appConfig.responsableArea;
  document.getElementById("cfgDireccion").value = appConfig.direccion;
  document.getElementById("cfgConmutador").value = appConfig.conmutador;
  document.getElementById("cfgEmail").value = appConfig.email;
  document.getElementById("cfgCodigoFormato").value = appConfig.codigoFormato;
  document.getElementById("cfgSMLMV").value = appConfig.smlmv;

  abrirModal("modalConfiguracion");
}

function guardarModalConfiguracion() {
  appConfig.establecimiento = document.getElementById("cfgEstablecimiento").value.trim() || DEFAULT_CONFIG.establecimiento;
  appConfig.siglaSede = document.getElementById("cfgSiglaSede").value.trim() || DEFAULT_CONFIG.siglaSede;
  appConfig.ciudad = document.getElementById("cfgCiudad").value.trim() || DEFAULT_CONFIG.ciudad;
  appConfig.responsableNombre = document.getElementById("cfgResponsableNombre").value.trim() || DEFAULT_CONFIG.responsableNombre;
  appConfig.responsableCargo = document.getElementById("cfgResponsableCargo").value.trim() || DEFAULT_CONFIG.responsableCargo;
  appConfig.responsableArea = document.getElementById("cfgResponsableArea").value.trim() || DEFAULT_CONFIG.responsableArea;
  appConfig.direccion = document.getElementById("cfgDireccion").value.trim() || DEFAULT_CONFIG.direccion;
  appConfig.conmutador = document.getElementById("cfgConmutador").value.trim() || DEFAULT_CONFIG.conmutador;
  appConfig.email = document.getElementById("cfgEmail").value.trim() || DEFAULT_CONFIG.email;
  appConfig.codigoFormato = document.getElementById("cfgCodigoFormato").value.trim() || DEFAULT_CONFIG.codigoFormato;
  appConfig.smlmv = Number(document.getElementById("cfgSMLMV").value) || DEFAULT_CONFIG.smlmv;

  guardarConfiguracion();
  cerrarModal("modalConfiguracion");
  alert("Configuración de Sede y Parámetros actualizada correctamente.");
}

// ==========================================
// RESPALDO Y RESTAURACIÓN (BACKUP JSON)
// ==========================================
function abrirModalRespaldo() {
  abrirModal("modalRespaldo");
}

function descargarBackupJSON() {
  const data = {
    version: "1.0",
    fechaBackup: new Date().toISOString(),
    config: appConfig,
    records: records
  };

  const str = JSON.stringify(data, null, 2);
  const blob = new Blob([str], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Backup_Libranzas_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

function importarBackupJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.records && Array.isArray(data.records)) {
        if (confirm(`Se han detectado ${data.records.length} registros en el archivo. ¿Desea restaurarlos y reemplazar los actuales?`)) {
          records = data.records;
          if (data.config) appConfig = { ...DEFAULT_CONFIG, ...data.config };
          guardarConfiguracion();
          guardarRegistros();
          cerrarModal("modalRespaldo");
          alert("Datos restaurados satisfactoriamente.");
        }
      } else {
        alert("El archivo no tiene la estructura de respaldo válida.");
      }
    } catch (err) {
      alert("Error al leer el archivo de respaldo: " + err.message);
    }
  };
  reader.readAsText(file);
}

function restablecerDatosDemo() {
  if (confirm("¿Desea recargar los registros de ejemplo para pruebas?")) {
    records = getRegistrosDemo();
    guardarRegistros();
    cerrarModal("modalRespaldo");
  }
}

// ==========================================
// MANEJO DE MODALES
// ==========================================
function abrirModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function cerrarModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
}

function configurarEventListeners() {
  // Filtros
  document.getElementById("filterFechaInicio").addEventListener("change", renderizarTabla);
  document.getElementById("filterFechaFin").addEventListener("change", renderizarTabla);
  document.getElementById("filterBusqueda").addEventListener("input", renderizarTabla);
  document.getElementById("filterEstado").addEventListener("change", renderizarTabla);

  // Cerrar modales con clic fuera
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });

  // Tecla ESC para cerrar modales
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
    }
  });
}
