/**
 * Script para la Evaluación Geriátrica Integral - Versión Narrativa
 *
 * Este script maneja la lógica completa para un formulario de evaluación geriátrica interactivo.
 * Responsabilidades:
 * 1.  Gestión de la interfaz de usuario: paneles, secciones colapsables, tema.
 * 2.  Cálculo en tiempo real de todas las escalas geriátricas (MMSE, Barthel, GDS, etc.).
 * 3.  Actualización de un panel de control superior con métricas clave.
 * 4.  Generación de un informe clínico detallado y en formato narrativo a medida que el usuario completa el formulario.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Adjuntar todos los listeners a los inputs para la actualización en tiempo real.
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', generateGeriatricReport);
        el.addEventListener('input', generateGeriatricReport);
    });

    // Configurar la UI inicial (tema, secciones, etc.)
    initializeUI();
    
    // Generar el estado inicial del informe y los cálculos.
    generateGeriatricReport();
});

/**
 * Configura los componentes iniciales de la interfaz de usuario.
 */
function initializeUI() {
    // Cargar tema guardado.
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }

    // Expandir la primera sección por defecto.
    const firstSection = document.querySelector('.section-container');
    if (firstSection && !firstSection.classList.contains('expanded')) {
        _internalToggleSection(firstSection);
    }
}

/**
 * Función principal que orquesta la generación del informe y la actualización de la UI.
 */
function generateGeriatricReport() {
    // 1. Realizar todos los cálculos de las escalas.
    calculateAllScales();

    // 2. Generar el texto del informe narrativo.
    let report = "EVALUACIÓN GERIÁTRICA INTEGRAL\n";
    report += "================================\n\n";

    report += getSectionText('DATOS DEMOGRÁFICOS Y SOCIALES', getDemographicsAndSocialData());
    report += getSectionText('MOTIVO DE CONSULTA Y ANTECEDENTES', getAnamnesisAndHistoryData());
    report += getSectionText('EXAMEN FÍSICO', getPhysicalExamData());
    report += getSectionText('EVALUACIÓN COGNITIVA Y AFECTIVA', getCognitiveAndAffectiveData());
    report += getSectionText('EVALUACIÓN FUNCIONAL', getFunctionalData());
    report += getSectionText('EVALUACIÓN NUTRICIONAL', getNutritionalData());
    report += getSectionText('EVALUACIÓN DE RIESGOS Y FRAGILIDAD', getRiskAndFrailtyData());
    
    // 3. Añadir un resumen final y plan.
    const filledInputs = document.querySelectorAll('input:checked, input[type="text"][value]:not([value=""]), input[type="number"][value]:not([value=""])');
    if (filledInputs.length < 2) { // Si el informe está casi vacío
         report = 'Seleccione los parámetros de la evaluación para generar la conclusión geriátrica integral...';
    } else {
        report += getFinalSummary();
    }
    
    // 4. Actualizar el panel de informe y el dashboard.
    const reportPanel = document.getElementById('stickyContent');
    if (reportPanel) {
        reportPanel.textContent = report.trim();
    }
    updateDashboard();
}

/**
 * Llama a todas las funciones de cálculo de escalas.
 */
function calculateAllScales() {
    evaluatePolypharmacy();
    calculateBMI();
    evaluateCalfCircumference();
    evaluateBloodPressure();
    calculateMMSE();
    evaluateClockTest();
    calculateGDS();
    calculateBarthel();
    calculateLawton();
    calculateMNA();
    calculateGijon();
    calculateFried();
    evaluateTUG();
    updateFallRiskCount();
    updateInappropriateMedsCount();
}


// ===================================================================
// FUNCIONES DE RECOPILACIÓN DE DATOS PARA EL INFORME NARRATIVO
// ===================================================================

function getDemographicsAndSocialData() {
    let sentences = [];
    const edad = getInputValue('edad-paciente');
    const sexo = getSelectedRadioLabel('sexo');
    
    if (edad || sexo) {
        let intro = `Paciente de ${edad || 'edad no especificada'} años`;
        if (sexo) intro += `, de sexo ${sexo}`;
        sentences.push(intro + ".");
    }

    const vivienda = getCheckedLabelsFromContainer('#anamnesis .sub-section-card:nth-of-type(1) .form-grid:nth-of-type(2)');
    if (vivienda.length > 0) {
        sentences.push(`En cuanto a su situación de vivienda, ${listToSentence(vivienda)}.`);
    }

    // Gijón Scale Data
    const gijonScore = document.getElementById('gijon-score').textContent;
    const gijonRisk = document.getElementById('gijon-risk').textContent;
    if (gijonScore !== '0') {
        sentences.push(`La escala de valoración sociofamiliar de Gijón arroja una puntuación de ${gijonScore}/25, lo que indica una situación de ${gijonRisk.toLowerCase()}.`);
    }
    
    return sentences.join(' ');
}

function getAnamnesisAndHistoryData() {
    let sentences = [];
    if (isChecked('sin-quejas-geriatricas')) {
        sentences.push("El paciente acude para un control de rutina, sin referir quejas específicas en el momento actual.");
    } else {
        const quejas = getCheckedLabelsFromContainer('#anamnesis .sub-section-card:nth-of-type(2)');
        if (quejas.length > 0) {
            sentences.push(`El motivo de consulta principal es ${listToSentence(quejas)}.`);
        }
    }

    const comorbilidades = getCheckedLabelsFromContainer('#anamnesis .sub-section-card:nth-of-type(3) .form-grid:nth-of-type(1)');
    if (comorbilidades.length > 0) {
        sentences.push(`Entre sus antecedentes patológicos destacan ${listToSentence(comorbilidades)}.`);
    }

    const numMeds = getInputValue('numero-medicamentos');
    const polypharmacy = document.getElementById('polypharmacy-assessment').textContent;
    if (numMeds && numMeds > 0) {
        sentences.push(`Actualmente consume ${numMeds} medicamentos, lo que se clasifica como ${polypharmacy.toLowerCase()}.`);
        const medRisks = getCheckedLabelsFromContainer('#anamnesis .sub-section-card:nth-of-type(3) .form-grid:nth-of-type(2)');
        if (medRisks.length > 0) {
            sentences.push(`Se identifican riesgos farmacológicos asociados, como ${listToSentence(medRisks)}.`);
        }
    }
    
    return sentences.join(' ');
}

function getPhysicalExamData() {
    let sentences = [];
    let physicalFindings = [];

    const imc = document.getElementById('imc-value').textContent;
    const imcClass = document.getElementById('imc-classification').textContent;
    if (imc !== '--') {
        physicalFindings.push(`un IMC de ${imc} kg/m² (${imcClass.toLowerCase()})`);
    }

    const calfCirc = getInputValue('circunferencia-pantorrilla');
    const calfAssess = document.getElementById('calf-assessment').textContent;
    if (calfCirc) {
        physicalFindings.push(`una circunferencia de pantorrilla de ${calfCirc} cm, sugiriendo un estado nutricional ${calfAssess.toLowerCase()}`);
    }

    const bp = document.getElementById('bp-classification').textContent;
    if (bp !== '--') {
        const pas = getInputValue('pas');
        const pad = getInputValue('pad');
        physicalFindings.push(`una presión arterial de ${pas}/${pad} mmHg (${bp.toLowerCase()})`);
    }
    const fc = getInputValue('frecuencia-cardiaca');
    if (fc) {
        physicalFindings.push(`una frecuencia cardíaca de ${fc} lpm`);
    }

    if (physicalFindings.length > 0) {
        sentences.push(`Al examen físico, se objetivan los siguientes hallazgos: ${listToSentence(physicalFindings)}.`);
    }

    const vision = getCheckedLabelsFromContainer('#physical-exam .side-container:nth-of-type(1)');
    if (vision.length > 0) {
        sentences.push(`En la evaluación visual, se reporta ${listToSentence(vision)}.`);
    }
    const audicion = getCheckedLabelsFromContainer('#physical-exam .side-container:nth-of-type(2)');
    if (audicion.length > 0) {
        sentences.push(`En la esfera auditiva, presenta ${listToSentence(audicion)}.`);
    }
    const marcha = getCheckedLabelsFromContainer('#physical-exam .sub-section-card:last-child');
    if (marcha.length > 0) {
        sentences.push(`La evaluación de la marcha y equilibrio revela ${listToSentence(marcha)}.`);
    }

    return sentences.join(' ');
}

function getCognitiveAndAffectiveData() {
    let sentences = [];
    const mmseScore = document.getElementById('mmse-total').textContent;
    const mmseInterp = document.getElementById('mmse-interpretation').textContent;
    if (mmseScore !== '0') {
        sentences.push(`En la esfera cognitiva, la puntuación del Mini-Mental State Examination (MMSE) es de ${mmseScore}/30, lo que es compatible con un ${mmseInterp.toLowerCase()}.`);
    }

    const clockScore = getInputValue('clock-test-score');
    const clockInterp = document.getElementById('clock-interpretation').textContent;
    if (clockScore && clockScore !== '0') {
        sentences.push(`El Test del Reloj obtiene una puntuación de ${clockScore}/10, indicativo de ${clockInterp.toLowerCase()}.`);
    }

    const gdsScore = document.getElementById('gds-score').textContent;
    const gdsRisk = document.getElementById('gds-risk').textContent;
    if (gdsScore !== '0') {
        sentences.push(`En la esfera afectiva, la Escala de Depresión Geriátrica (GDS-15) es de ${gdsScore}/15, sugiriendo ${gdsRisk.toLowerCase()}.`);
    }
    return sentences.join(' ');
}

function getFunctionalData() {
    let sentences = [];
    const barthelScore = document.getElementById('barthel-score').textContent;
    const barthelDep = document.getElementById('barthel-dependency').textContent;
    if (barthelScore !== '0') {
        sentences.push(`Para las actividades básicas de la vida diaria (ABVD), el Índice de Barthel es de ${barthelScore}/100, indicando un nivel de ${barthelDep.toLowerCase()}.`);
    }

    const lawtonScore = document.getElementById('lawton-score').textContent;
    const lawtonDep = document.getElementById('lawton-dependency').textContent;
    if (lawtonScore !== '0') {
        sentences.push(`Para las actividades instrumentales (AIVD), la escala de Lawton y Brody es de ${lawtonScore}/8, lo que corresponde a ${lawtonDep.toLowerCase()}.`);
    }
    return sentences.join(' ');
}

function getNutritionalData() {
    const mnaScore = document.getElementById('mna-score').textContent;
    const mnaStatus = document.getElementById('mna-status').textContent;
    if (mnaScore !== '0') {
        return `La evaluación nutricional mediante el Mini Nutritional Assessment (MNA) muestra una puntuación de ${mnaScore}/14, clasificando al paciente con ${mnaStatus.toLowerCase()}.`;
    }
    return "";
}

function getRiskAndFrailtyData() {
    let sentences = [];
    const friedScore = document.getElementById('fried-score').textContent;
    const friedStatus = document.getElementById('fried-status').textContent;
    if (friedScore !== '0') {
        sentences.push(`Según los criterios de fragilidad de Fried, el paciente cumple ${friedScore}/5 criterios, siendo clasificado como ${friedStatus.toLowerCase()}.`);
    }

    const tugTime = getInputValue('tug-time');
    const tugAssess = document.getElementById('tug-assessment').textContent;
    if (tugTime) {
        sentences.push(`El test "Timed Up and Go" (TUG) se completó en ${tugTime} segundos, lo que indica un ${tugAssess.toLowerCase()}.`);
    }

    const fallRiskCount = document.getElementById('fall-risk-count').textContent;
    const fallRiskLevel = document.getElementById('fall-risk-level').textContent;
    if (fallRiskCount !== '0') {
        sentences.push(`Se identificaron ${fallRiskCount} factores de riesgo de caídas, confiriendo un ${fallRiskLevel.toLowerCase()}.`);
    }

    const inappropriateMeds = document.getElementById('inappropriate-meds-count').textContent;
    if (inappropriateMeds !== '0') {
        sentences.push(`Se detectó el uso de ${inappropriateMeds} medicamentos potencialmente inapropiados para personas mayores.`);
    }
    return sentences.join(' ');
}

function getFinalSummary() {
    let summary = "\n\n**SÍNTESIS Y PLAN DE MANEJO**\n";
    summary += "--------------------------------\n";
    summary += "Basado en la evaluación integral, se identifican los siguientes síndromes geriátricos y problemas activos: [Integrar aquí los diagnósticos principales como fragilidad, deterioro cognitivo, riesgo de caídas, etc.].\n\n";
    summary += "Se propone el siguiente plan de manejo:\n";
    summary += "1.  **Farmacológico:** [Revisar y optimizar tratamiento. Considerar deprescripción de fármacos inapropiados].\n";
    summary += "2.  **Funcional y Rehabilitador:** [Recomendaciones de fisioterapia, terapia ocupacional, adaptaciones en el hogar].\n";
    summary += "3.  **Cognitivo y Afectivo:** [Plan de estimulación cognitiva, manejo de síntomas anímicos, seguimiento por psicología/psiquiatría si procede].\n";
    summary += "4.  **Nutricional:** [Intervención dietética, suplementos si son necesarios, seguimiento de peso].\n";
    summary += "5.  **Social:** [Movilización de recursos de apoyo, coordinación con trabajo social, consejo familiar].\n\n";
    summary += "Se programará una reevaluación para monitorizar la evolución y ajustar el plan según sea necesario.\n";
    return summary;
}


// ===================================================================
// FUNCIONES DE CÁLCULO DE ESCALAS
// ===================================================================
function evaluatePolypharmacy() {
    const numMeds = parseInt(getInputValue('numero-medicamentos')) || 0;
    const assessmentEl = document.getElementById('polypharmacy-assessment');
    if (!assessmentEl) return;
    let text = '--', color = '';
    if (numMeds >= 10) { text = 'Polifarmacia severa'; color = 'var(--alert-color)'; }
    else if (numMeds >= 5) { text = 'Polifarmacia'; color = 'var(--warning-color)'; }
    else if (numMeds > 0) { text = 'Normal'; color = 'var(--normal-color)'; }
    assessmentEl.textContent = text;
    assessmentEl.style.color = color;
}

function calculateBMI() {
    const peso = parseFloat(getInputValue('peso'));
    const talla = parseFloat(getInputValue('talla'));
    const imcValueEl = document.getElementById('imc-value');
    const imcClassificationEl = document.getElementById('imc-classification');
    if (!imcValueEl || !imcClassificationEl) return;

    if (!peso || !talla) {
        imcValueEl.textContent = '--';
        imcClassificationEl.textContent = '--';
        imcClassificationEl.style.color = '';
        return;
    }
    
    const imc = peso / Math.pow(talla / 100, 2);
    imcValueEl.textContent = imc.toFixed(1);
    
    let classification = '', color = '';
    if (imc < 22) { classification = 'Bajo peso'; color = 'var(--warning-color)'; }
    else if (imc < 27) { classification = 'Normal'; color = 'var(--normal-color)'; }
    else if (imc < 30) { classification = 'Sobrepeso'; color = 'var(--warning-color)'; }
    else { classification = 'Obesidad'; color = 'var(--alert-color)'; }
    
    imcClassificationEl.textContent = classification;
    imcClassificationEl.style.color = color;
}

function evaluateCalfCircumference() {
    const calf = parseFloat(getInputValue('circunferencia-pantorrilla'));
    const assessmentEl = document.getElementById('calf-assessment');
    if (!assessmentEl) return;

    if (!calf) {
        assessmentEl.textContent = '--';
        assessmentEl.style.color = '';
        return;
    }
    
    let assessment = '', color = '';
    if (calf < 31) { assessment = 'Riesgo de sarcopenia'; color = 'var(--alert-color)'; }
    else { assessment = 'Normal'; color = 'var(--normal-color)'; }
    
    assessmentEl.textContent = assessment;
    assessmentEl.style.color = color;
}

function evaluateBloodPressure() {
    const pas = parseFloat(getInputValue('pas'));
    const pad = parseFloat(getInputValue('pad'));
    const classificationEl = document.getElementById('bp-classification');
    if (!classificationEl) return;

    if (!pas || !pad) {
        classificationEl.textContent = '--';
        classificationEl.style.color = '';
        return;
    }
    
    let classification = '', color = '';
    if (pas >= 180 || pad >= 110) { classification = 'HTA III (crisis)'; color = 'var(--alert-color)'; }
    else if (pas >= 160 || pad >= 100) { classification = 'HTA II (moderada)'; color = 'var(--alert-color)'; }
    else if (pas >= 140 || pad >= 90) { classification = 'HTA I (leve)'; color = 'var(--warning-color)'; }
    else if (pas >= 130 || pad >= 85) { classification = 'Prehipertensión'; color = 'var(--warning-color)'; }
    else { classification = 'Normal'; color = 'var(--normal-color)'; }
    
    classificationEl.textContent = classification;
    classificationEl.style.color = color;
}

function calculateMMSE() {
    let total = 0;
    ['mmse-temporal', 'mmse-espacial', 'mmse-registro', 'mmse-atencion', 'mmse-recuerdo', 'mmse-lenguaje'].forEach(id => {
        total += parseInt(getInputValue(id)) || 0;
    });
    
    document.getElementById('mmse-total').textContent = total;
    
    let interpretation = '--', color = '';
    if (total > 0) {
        if (total >= 27) { interpretation = 'Normal'; color = 'var(--normal-color)'; }
        else if (total >= 24) { interpretation = 'Deterioro cognitivo leve'; color = 'var(--warning-color)'; }
        else if (total >= 18) { interpretation = 'Deterioro cognitivo moderado'; color = 'var(--alert-color)'; }
        else { interpretation = 'Deterioro cognitivo severo'; color = 'var(--alert-color)'; }
    }
    const interpEl = document.getElementById('mmse-interpretation');
    interpEl.textContent = interpretation;
    interpEl.style.color = color;
}

function evaluateClockTest() {
    const score = parseInt(getInputValue('clock-test-score')) || 0;
    const interpretationEl = document.getElementById('clock-interpretation');
    if (!score) {
        interpretationEl.textContent = '--';
        interpretationEl.style.color = '';
        return;
    }
    
    let interpretation = '', color = '';
    if (score >= 7) { interpretation = 'Normal'; color = 'var(--normal-color)'; }
    else if (score >= 4) { interpretation = 'Deterioro leve-moderado'; color = 'var(--warning-color)'; }
    else { interpretation = 'Deterioro severo'; color = 'var(--alert-color)'; }
    
    interpretationEl.textContent = interpretation;
    interpretationEl.style.color = color;
}

function calculateGDS() {
    let score = 0;
    const gdsItems = [
        'gds-satisfecho', 'gds-actividades', 'gds-vacia', 'gds-aburrido', 'gds-animo',
        'gds-miedo', 'gds-feliz', 'gds-desvalido', 'gds-quedarse', 'gds-memoria',
        'gds-vivir', 'gds-inutil', 'gds-energia', 'gds-esperanza', 'gds-mejor'
    ];
    gdsItems.forEach(id => { if (isChecked(id)) score++; });
    
    document.getElementById('gds-score').textContent = score;
    
    let risk = '--', color = '';
    if (score > 0) {
        if (score >= 10) { risk = 'Depresión severa'; color = 'var(--alert-color)'; }
        else if (score >= 5) { risk = 'Depresión probable'; color = 'var(--warning-color)'; }
        else { risk = 'Sin depresión'; color = 'var(--normal-color)'; }
    }
    const riskEl = document.getElementById('gds-risk');
    riskEl.textContent = risk;
    riskEl.style.color = color;
}

function calculateBarthel() {
    let total = 0;
    const categories = [
        'barthel-alimentacion', 'barthel-bano', 'barthel-vestido', 'barthel-arreglo',
        'barthel-deposicion', 'barthel-miccion', 'barthel-retrete', 'barthel-traslado',
        'barthel-deambulacion', 'barthel-escaleras'
    ];
    categories.forEach(category => {
        const selected = document.querySelector(`input[name="${category}"]:checked`);
        if (selected) total += parseInt(selected.value);
    });
    
    document.getElementById('barthel-score').textContent = total;
    
    let dependency = '--', color = '';
    if (total > 0 || document.querySelector(`input[name="barthel-alimentacion"]:checked`)) { // Check if at least one is selected
        if (total >= 90) { dependency = 'Independencia'; color = 'var(--normal-color)'; }
        else if (total >= 60) { dependency = 'Dependencia leve'; color = 'var(--warning-color)'; }
        else if (total >= 40) { dependency = 'Dependencia moderada'; color = 'var(--warning-color)'; }
        else if (total >= 20) { dependency = 'Dependencia severa'; color = 'var(--alert-color)'; }
        else { dependency = 'Dependencia total'; color = 'var(--alert-color)'; }
    }
    const depEl = document.getElementById('barthel-dependency');
    depEl.textContent = dependency;
    depEl.style.color = color;
}

function calculateLawton() {
    let total = 0;
    const categories = [
        'lawton-telefono', 'lawton-compras', 'lawton-comida', 'lawton-casa',
        'lawton-ropa', 'lawton-transporte', 'lawton-medicacion', 'lawton-economia'
    ];
    categories.forEach(category => {
        const selected = document.querySelector(`input[name="${category}"]:checked`);
        if (selected) total += parseInt(selected.value);
    });
    
    document.getElementById('lawton-score').textContent = total;
    
    let dependency = '--', color = '';
    if (total > 0 || document.querySelector(`input[name="lawton-telefono"]:checked`)) {
        if (total === 8) { dependency = 'Independencia total'; color = 'var(--normal-color)'; }
        else if (total >= 6) { dependency = 'Dependencia leve'; color = 'var(--warning-color)'; }
        else if (total >= 4) { dependency = 'Dependencia moderada'; color = 'var(--warning-color)'; }
        else { dependency = 'Dependencia severa'; color = 'var(--alert-color)'; }
    }
    const depEl = document.getElementById('lawton-dependency');
    depEl.textContent = dependency;
    depEl.style.color = color;
}

function calculateMNA() {
    let total = 0;
    const categories = ['mna-apetito', 'mna-peso', 'mna-movilidad', 'mna-estres', 'mna-neuro', 'mna-imc'];
    categories.forEach(category => {
        const selected = document.querySelector(`input[name="${category}"]:checked`);
        if (selected) total += parseInt(selected.value);
    });
    
    document.getElementById('mna-score').textContent = total;
    
    let status = '--', color = '';
    if (total > 0 || document.querySelector(`input[name="mna-apetito"]:checked`)) {
        if (total >= 12) { status = 'Estado nutricional normal'; color = 'var(--normal-color)'; }
        else if (total >= 8) { status = 'Riesgo de malnutrición'; color = 'var(--warning-color)'; }
        else { status = 'Malnutrición'; color = 'var(--alert-color)'; }
    }
    const statusEl = document.getElementById('mna-status');
    statusEl.textContent = status;
    statusEl.style.color = color;
}

function calculateGijon() {
    let total = 0;
    const categories = ['gijon-familia', 'gijon-economia', 'gijon-vivienda', 'gijon-social', 'gijon-apoyo'];
    categories.forEach(category => {
        const selected = document.querySelector(`input[name="${category}"]:checked`);
        if (selected) total += parseInt(selected.value);
    });
    
    document.getElementById('gijon-score').textContent = total;
    
    let risk = '--', color = '';
    if (total > 0 || document.querySelector(`input[name="gijon-familia"]:checked`)) {
        if (total <= 9) { risk = 'Sin riesgo social'; color = 'var(--normal-color)'; }
        else if (total <= 14) { risk = 'Riesgo social'; color = 'var(--warning-color)'; }
        else { risk = 'Problema social'; color = 'var(--alert-color)'; }
    }
    const riskEl = document.getElementById('gijon-risk');
    riskEl.textContent = risk;
    riskEl.style.color = color;
}

function calculateFried() {
    let score = 0;
    ['fried-peso', 'fried-agotamiento', 'fried-debilidad', 'fried-lentitud', 'fried-actividad'].forEach(id => {
        if (isChecked(id)) score++;
    });
    
    document.getElementById('fried-score').textContent = score;
    
    let status = '--', color = '';
    if (score > 0 || isChecked('fried-peso')) { // Check if any interaction happened
        if (score === 0) { status = 'Robusto'; color = 'var(--normal-color)'; }
        else if (score <= 2) { status = 'Pre-frágil'; color = 'var(--warning-color)'; }
        else { status = 'Frágil'; color = 'var(--alert-color)'; }
    }
    const statusEl = document.getElementById('fried-status');
    statusEl.textContent = status;
    statusEl.style.color = color;
}

function evaluateTUG() {
    const time = parseFloat(getInputValue('tug-time'));
    const assessmentEl = document.getElementById('tug-assessment');
    if (!time) {
        assessmentEl.textContent = '--';
        assessmentEl.style.color = '';
        return;
    }
    
    let assessment = '', color = '';
    if (time <= 10) { assessment = 'Normal'; color = 'var(--normal-color)'; }
    else if (time <= 20) { assessment = 'Riesgo leve de caídas'; color = 'var(--warning-color)'; }
    else { assessment = 'Alto riesgo de caídas'; color = 'var(--alert-color)'; }
    
    assessmentEl.textContent = assessment;
    assessmentEl.style.color = color;
}

function updateFallRiskCount() {
    let count = 0;
    ['caidas-previas', 'miedo-caer', 'mareos-vertigo', 'hipotension-ortostatica', 'alteraciones-equilibrio', 'medicamentos-sedantes', 'deficit-cognitivo', 'barreras-arquitectonicas', 'calzado-inadecuado', 'problemas-pies'].forEach(id => {
        if (isChecked(id)) count++;
    });
    
    document.getElementById('fall-risk-count').textContent = count;
    
    let level = '--', color = '';
    if (count > 0 || isChecked('caidas-previas')) {
        if (count === 0) { level = 'Bajo riesgo'; color = 'var(--normal-color)'; }
        else if (count <= 2) { level = 'Riesgo moderado'; color = 'var(--warning-color)'; }
        else { level = 'Alto riesgo'; color = 'var(--alert-color)'; }
    }
    const levelEl = document.getElementById('fall-risk-level');
    levelEl.textContent = level;
    levelEl.style.color = color;
}

function updateInappropriateMedsCount() {
    let count = 0;
    ['benzodiacepinas', 'anticolinergicos', 'antipsicotcos', 'aines', 'antidepresivos-triciclicos', 'digoxina', 'antihistaminicos', 'relajantes-musculares'].forEach(id => {
        if (isChecked(id)) count++;
    });
    document.getElementById('inappropriate-meds-count').textContent = count;
}


// ===================================================================
// FUNCIONES DE ACTUALIZACIÓN DE DASHBOARD Y UI
// ===================================================================

function updateDashboard() {
    const sections = document.querySelectorAll('.section-container');
    let completedSections = 0;
    let findingsCount = 0;
    let alertCount = 0;
    let warningCount = 0;

    sections.forEach(section => {
        const inputs = section.querySelectorAll('input:not([type="number"]), select');
        const numberInputs = section.querySelectorAll('input[type="number"]');
        let sectionHasContent = false;

        inputs.forEach(input => {
            if ((input.type === 'checkbox' || input.type === 'radio') && input.checked) {
                sectionHasContent = true;
                findingsCount++;
            }
        });
        numberInputs.forEach(input => {
            if (input.value && input.value !== '0') {
                sectionHasContent = true;
                findingsCount++;
            }
        });

        if (sectionHasContent) completedSections++;
    });
    
    // Contar alertas y avisos
    if ((parseInt(document.getElementById('mmse-total')?.textContent) || 30) < 18) alertCount++;
    if ((parseInt(document.getElementById('gds-score')?.textContent) || 0) >= 10) alertCount++;
    if ((parseInt(document.getElementById('barthel-score')?.textContent) || 101) < 40) alertCount++;
    if ((parseInt(document.getElementById('mna-score')?.textContent) || 15) < 8) alertCount++;
    if ((parseInt(document.getElementById('fried-score')?.textContent) || 0) >= 3) alertCount++;
    if ((parseInt(document.getElementById('fall-risk-count')?.textContent) || 0) >= 3) alertCount++;
    if ((parseInt(document.getElementById('numero-medicamentos')?.value) || 0) >= 10) alertCount++;

    if ((parseInt(document.getElementById('mmse-total')?.textContent) || 30) < 24) warningCount++;
    if ((parseInt(document.getElementById('gds-score')?.textContent) || 0) >= 5) warningCount++;
    if ((parseInt(document.getElementById('barthel-score')?.textContent) || 101) < 60) warningCount++;
    if ((parseInt(document.getElementById('mna-score')?.textContent) || 15) < 12) warningCount++;
    if ((parseInt(document.getElementById('fried-score')?.textContent) || 0) >= 1) warningCount++;
    if ((parseInt(document.getElementById('fall-risk-count')?.textContent) || 0) >= 1) warningCount++;
    if ((parseInt(document.getElementById('numero-medicamentos')?.value) || 0) >= 5) warningCount++;

    const progress = sections.length > 0 ? Math.round((completedSections / sections.length) * 100) : 0;
    
    document.getElementById('exam-progress').textContent = `${progress}%`;
    document.getElementById('sections-completed').textContent = `${completedSections}/${sections.length}`;
    document.getElementById('alert-count').textContent = alertCount;
    document.getElementById('warning-count').textContent = warningCount;
    document.getElementById('findings-count').textContent = findingsCount;
    
    // Actualizar estado cognitivo y funcional en el dashboard
    document.getElementById('cognitive-status').textContent = document.getElementById('mmse-interpretation').textContent;
    document.getElementById('functional-status').textContent = document.getElementById('barthel-dependency').textContent;
}

// ===================================================================
// FUNCIONES AUXILIARES Y DE UI
// ===================================================================

function getInputValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function isChecked(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
}

function getSelectedRadioLabel(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    if (!selected) return null;
    const label = document.querySelector(`label[for="${selected.id}"]`);
    return label ? label.textContent.trim().toLowerCase() : null;
}

function getCheckedLabelsFromContainer(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return [];
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => document.querySelector(`label[for="${cb.id}"]`)?.textContent.trim().toLowerCase())
        .filter(Boolean);
}

function listToSentence(array) {
    if (!array || array.length === 0) return "";
    if (array.length === 1) return array[0];
    if (array.length === 2) return array.join(' y ');
    return array.slice(0, -1).join(', ') + ' y ' + array.slice(-1);
}

function getSectionText(title, content) {
    if (content && content.trim() !== "") {
        return `**${title}**\n${content.trim()}\n\n`;
    }
    return "";
}

/**
 * Muestra una notificación temporal en la pantalla.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} [type='success'] - El tipo de notificación ('success' o 'error').
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('copyNotification');
    if (!notification) return;

    const icon = notification.querySelector('i');
    const textSpan = notification.querySelector('span');
    
    if(!icon || !textSpan) return;

    textSpan.textContent = message;
    
    notification.classList.remove('bg-green-500', 'bg-red-500');
    icon.classList.remove('fa-check-circle', 'fa-times-circle');

    if (type === 'success') {
        notification.classList.add('bg-green-500');
        icon.classList.add('fa-check-circle');
    } else { // error
        notification.classList.add('bg-red-500');
        icon.classList.add('fa-times-circle');
    }

    notification.classList.remove('opacity-0');
    notification.classList.add('opacity-100');

    setTimeout(() => {
        notification.classList.remove('opacity-100');
        notification.classList.add('opacity-0');
    }, 3000);
}

// CORRECCIÓN: Esta es la función interna que contiene la lógica. No es global.
function _internalToggleSection(sectionElement) {
    if (!sectionElement) return;
    const content = sectionElement.querySelector('.section-content-main');
    const arrow = sectionElement.querySelector('.section-arrow');
    if (!content || !arrow) return;

    sectionElement.classList.toggle('expanded');
    if (sectionElement.classList.contains('expanded')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        arrow.classList.add('fa-chevron-up');
        arrow.classList.remove('fa-chevron-down');
    } else {
        content.style.maxHeight = '0px';
        arrow.classList.add('fa-chevron-down');
        arrow.classList.remove('fa-chevron-up');
    }
}

function toggleStickyPanel() {
    document.getElementById('stickyConclusion').classList.toggle('active');
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    if (body.hasAttribute('data-theme')) {
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

function clearForm() {
    const form = document.querySelector('.main-content');
    if(form) {
        form.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(el => el.checked = false);
        form.querySelectorAll('input[type="number"], input[type="text"], textarea').forEach(el => el.value = '');
        form.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
    }
    generateGeriatricReport();
    showNotification('Formulario limpiado.');
}

function expandAllSections() {
    document.querySelectorAll('.section-container:not(.expanded)').forEach(container => _internalToggleSection(container));
}

function collapseAllSections() {
    document.querySelectorAll('.section-container.expanded').forEach(container => _internalToggleSection(container));
}

function copyStickyToClipboard() {
    const text = document.getElementById('stickyContent').textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Informe copiado al portapapeles.');
    }).catch(err => {
        console.error("Error al copiar:", err);
        showNotification('No se pudo copiar el informe.', 'error');
    });
}

function printStickyConclusion() {
    const content = document.getElementById('stickyContent').textContent;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Informe Geriátrico</title><style>body{font-family:monospace;white-space:pre-wrap;padding:20px;line-height:1.6;} strong{font-weight:bold;display:block;margin-top:1em;border-bottom:1px solid #000;}</style></head><body>${content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</body></html>`);
    printWindow.document.close();
    printWindow.print();
}

// ===================================================================
// ASIGNACIÓN DE FUNCIONES GLOBALES PARA EL HTML
// ===================================================================

// CORRECCIÓN: Esta función global es la que llama el `onclick="toggleSection(this)"` del HTML.
// Recibe el elemento 'header' y llama a la función interna con el 'parentElement'.
window.toggleSection = (headerElement) => {
    _internalToggleSection(headerElement.parentElement);
};

window.toggleStickyPanel = toggleStickyPanel;
window.toggleTheme = toggleTheme;
window.clearForm = clearForm;
window.expandAllSections = expandAllSections;
window.collapseAllSections = collapseAllSections;
window.generateConclusion = generateGeriatricReport;
window.copyStickyToClipboard = copyStickyToClipboard;
window.printStickyConclusion = printStickyConclusion;
window.generateStickyConclusion = generateGeriatricReport;
window.handleNoComplaints = () => {
    const noComplaints = isChecked('sin-quejas-geriatricas');
    document.querySelectorAll('#anamnesis .sub-section-card:nth-of-type(2) input').forEach(el => {
        if(el.id !== 'sin-quejas-geriatricas') el.disabled = noComplaints;
        if(noComplaints) el.checked = false;
    });
    generateGeriatricReport();
};
