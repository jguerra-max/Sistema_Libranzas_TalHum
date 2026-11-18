# Sistema de Registro y Control de Libranzas (INPEC)
**Gestión Humana • Planilla Digital y Control de Capacidad de Pago (Ley 1527 de 2012)**

---

## 🌟 Características Principales

1. **100% Portátil y Autónomo (Cero Instalaciones):**
   * No requiere instalar Python, NodeJS, bases de datos ni programas adicionales.
   * Funciona directamente abriendo `Iniciar_Sistema.bat` o el archivo `index.html` en cualquier computador (Windows, Mac o Linux) con cualquier navegador (Chrome, Edge, Firefox).
   * Puede ser transportado y ejecutado directamente desde una memoria USB.

2. **Cumplimiento Normativo (Directriz 2.2 INPEC y Ley 1527 de 2012):**
   * **Planilla Digital Consolidada:** Registro formal obligatorio con fecha, servidor solicitante, cargo, grado, entidad acreedora, ingresos, deducciones, cuota mensual y capacidad disponible.
   * **Control de Duplicidad:** Alerta inmediata si un funcionario ya cuenta con 2 libranzas en trámite simultáneo para prevenir sobreendeudamientos o trámites duplicados.
   * **Cálculo Técnico Automático de Capacidad:**
     * Verifica que la nueva cuota no supere el 50% de los devengos netos del servidor.
     * Certifica que el salario neto resultante proteja el Salario Mínimo Legal Mensual Vigente (SMLMV).

3. **Formato Oficial de Certificación en PDF (PA-DO-G01-F02):**
   * Réplica idéntica al documento oficial para imprimir o guardar en PDF con un solo clic.
   * Total de ingresos convertido automáticamente a letras en español de acuerdo con las normas notariales y legales.
   * Membrete institucional, escudo INPEC, datos de vinculación y bloque de firma de Gestión Humana.

4. **Exportación Consolidada a Excel (.xlsx):**
   * Exporta la base de datos completa o filtrada por rangos de fechas (ejemplo: enero a junio, primer semestre, segundo semestre o por años), por entidad o por cédula.
   * Genera un archivo `.xlsx` estructurado con columnas detalladas y anchos óptimos.

5. **Parámetros y Sede 100% Personalizables:**
   * Botón de **"Sede y Parámetros"** para editar el nombre del establecimiento, ciudad, funcionario que firma, cargo, correos y el SMLMV de referencia sin tocar código.

6. **Respaldo y Seguridad de Datos:**
   * Los registros se guardan automáticamente en la memoria local del navegador.
   * Incluye la opción de descargar una **Copia de Seguridad (Backup JSON)** para guardar o restaurar en otro equipo fácilmente.

---

## 🚀 Cómo Iniciar el Sistema

1. Haga doble clic en el archivo `Iniciar_Sistema.bat` (o abra directamente `index.html`).
2. El sistema se abrirá inmediatamente en su navegador web listo para usar.

---

## 📖 Flujo de Trabajo Recomendado

1. **Configurar la Sede (Primera vez):**
   * Haga clic en el botón superior `⚙️ Sede y Parámetros`.
   * Configure el nombre del establecimiento (ej. *Cárcel y Penitenciaría de Media Seguridad de Tunja*), el nombre del responsable de Gestión Humana y el cargo. Guarde los cambios.

2. **Crear una Certificación de Libranza:**
   * Haga clic en `➕ Crear Certificación`.
   * Digite los datos del servidor público (Cédula, Nombres, Cargo, Grado, Código, Fecha de ingreso).
   * Ingrese los conceptos de ingresos en la sección 2 (puede usar el botón `➕ Agregar Devengo` si hay conceptos adicionales como prima de capacitación, bonificaciones, etc.). El total en números y en letras se calcula en tiempo real.
   * Ingrese las deducciones en la sección 3 (salud, pensión, cooperativas, sindicatos, etc.).
   * Ingrese la entidad acreedora y la cuota solicitada.
   * Observe el panel técnico de la Ley 1527: el sistema le indicará si es **APTO** o **NO APTO**.
   * Haga clic en `💾 Guardar en Registro` o `📄 Guardar y Generar PDF Oficial`.

3. **Imprimir o Guardar en PDF:**
   * En la tabla de registros, presione el botón `📄 PDF` del funcionario.
   * Se abrirá la vista previa del formato oficial. Presione `🖨️ Imprimir / Guardar como PDF` para descargarlo o enviarlo a la impresora.

4. **Filtrar y Exportar a Excel:**
   * Use los filtros de fecha (ej. seleccione *1er Semestre* o elija rango entre enero y junio).
   * Haga clic en `📊 Exportar a Excel` para descargar el archivo `.xlsx` listo para auditorías o informes.
