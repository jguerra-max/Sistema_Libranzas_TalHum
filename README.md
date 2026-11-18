# 🏛️ Sistema de Registro y Control de Libranzas — Gestión del Talento Humano

> **Solución portátil, autónoma y de alta fidelidad técnica para la expedición de certificaciones laborales, control de capacidad de pago (Ley 1527 de 2012) y consolidación digital de libranzas institucionales (Directriz 2.2 INPEC / Formato PA-DO-G01-F02).**

---

## 📌 Descripción General

El **Sistema de Registro y Control de Libranzas** es una plataforma diseñada para las áreas de **Gestión del Talento Humano** en instituciones públicas (especialmente Establecimientos de Reclusión y Orden Penitenciario). Su objetivo primordial es:

1. **Garantizar el cumplimiento de la Ley 1527 de 2012:** Control técnico automático del límite legal del 50% de los devengos netos del servidor público y la protección estricta del Salario Mínimo Legal Mensual Vigente (SMLMV).
2. **Prevenir el Sobreendeudamiento y Duplicidad (Directriz 2.2):** Monitoreo activo de solicitudes simultáneas en trámite (máximo 2 por servidor sin paz y salvo previo).
3. **Expedición Digital de Certificaciones Oficiales (PA-DO-G01-F02 v3):** Generación instantánea en PDF e impresión con membrete institucional, constancia de hoja de vida y totalización en letras según exigencias notariales y administrativas.
4. **Planilla Digital y Exportación a Excel:** Consolidado histórico con filtros avanzados por rangos de fechas (semestres, meses, anual), servidores y entidades acreedoras.

---

## 🚀 Portabilidad Total (Cero Instalación)

Diseñado bajo la premisa de **portabilidad absoluta**:
* ❌ **No requiere instalar Python, NodeJS, Docker ni bases de datos complejas.**
* ❌ **No requiere conexión constante a internet ni servidores externos.**
* ✅ **100% Autónomo:** Se ejecuta con un simple doble clic en `Iniciar_Sistema.bat` o abriendo `index.html` en cualquier computador (Windows, macOS o Linux) a través de cualquier navegador web moderno (Edge, Chrome, Firefox, Brave, Safari).
* ✅ **Portable por USB:** Se puede llevar en una memoria USB y ejecutar directamente en cualquier estación de trabajo sin privilegios de administrador.

---

## 🛠️ Tecnologías Utilizadas

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend Core** | HTML5 Semántico + CSS3 Moderno | Interfaz limpia, responsiva y adaptable con diseño institucional sobrio. |
| **Lógica y Cálculos** | JavaScript Puro (Vanilla JS ES6+) | Algoritmos de conversión de números a letras en español, cálculos de capacidad de endeudamiento y validación en tiempo real. |
| **Persistencia Local** | Web Storage API (LocalStorage) | Almacenamiento seguro en el equipo del usuario sin requerir bases de datos remotas. |
| **Exportación a Excel** | SheetJS (`xlsx.full.min.js` empaquetado offline) | Generación nativa de hojas de cálculo `.xlsx` estructuradas con ancho de columnas y cabeceras oficiales. |
| **Generación de PDF** | CSS Paged Media (`@media print`) | Formato de impresión idéntico al documento físico institucional ajustado a 1 página tamaño carta. |
| **Intercambio y Backup** | Formato JSON estructurado | Copias de seguridad completas de la base de datos para transferir entre equipos con un solo clic. |

---

## ⚖️ Marco Legal y Reglas de Negocio Implementadas

### 1. Ley 1527 de 2012 (Marco Legal de Libranzas en Colombia)
* **Devengos Netos Base:** Devengos Totales menos deducciones obligatorias de ley (Aportes a Salud y Pensión).
* **Capacidad Máxima Legal:** No puede superar el **50% de los devengos netos** del trabajador.
* **Protección del Salario Mínimo:** El salario neto resultante tras descontar la cuota de la libranza no puede ser inferior al **Salario Mínimo Legal Mensual Vigente (SMLMV)**.

### 2. Control Institucional de Límite Coexistente (Directriz 2.2)
* Ningún servidor público puede tener más de **dos (2) solicitudes de libranza en trámite simultáneo** ante operadores financieros, salvo que se aporte el respectivo Paz y Salvo expedido por el Grupo de Nómina.

---

## 📁 Estructura del Repositorio

```text
Sistema_Libranzas_TalHum/
│
├── Iniciar_Sistema.bat        # Lanzador rápido en 1 clic para Windows
├── index.html                 # Aplicación web completa y autónoma
├── LEEME_MANUAL_DE_USO.md     # Guía detallada de uso para el usuario final
├── README.md                  # Documentación técnica del proyecto
├── .gitignore                 # Exclusiones de control de versiones
│
├── css/
│   └── styles.css             # Estilos de diseño institucional y motor de impresión
│
├── js/
│   ├── app.js                 # Lógica técnica, validaciones Ley 1527 y manejo de eventos
│   └── xlsx.full.min.js       # Librería offline para exportación a Excel (.xlsx)
│
└── assets/                    # Recursos visuales y logotipos
```

---

## 💻 Instrucciones de Uso

1. **Ejecución:**
   * Haz doble clic en el archivo `Iniciar_Sistema.bat` (o abre `index.html` en el navegador).
2. **Configuración de Sede (Primera vez):**
   * Presiona el botón `⚙️ Sede y Parámetros` para configurar el nombre del Establecimiento, la ciudad, el nombre del funcionario firmante de Gestión Humana y el valor vigente del SMLMV.
3. **Registro de una Certificación:**
   * Haz clic en `➕ Crear Certificación`.
   * Ingresa los datos del servidor y desglosa los conceptos de ingresos (utiliza `➕ Agregar Devengo` para conceptos dinámicos adicionales) y deducciones.
   * El sistema calculará en vivo si el funcionario es **APTO** o **NO APTO**.
4. **Impresión / PDF Oficial:**
   * Presiona el botón `📄 PDF` en cualquier fila de la biblioteca para abrir el documento oficial con membrete y presiona `🖨️ Imprimir / Guardar como PDF`.
5. **Exportación Consolidada:**
   * Filtra por el rango deseado (por ejemplo, *1er Semestre: Enero - Junio*) y haz clic en `📊 Exportar a Excel`.

---

## 🔒 Confidencialidad y Privacidad

El sistema opera bajo una arquitectura **local-first**: toda la información registrada reside de manera exclusiva en el almacenamiento local del equipo donde se utiliza. Ningún dato sensible o personal sale a servidores externos, garantizando el cumplimiento del principio de confidencialidad y la Ley Estatutaria 1581 de 2012 de Protección de Datos Personales.
