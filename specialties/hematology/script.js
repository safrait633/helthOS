/**
 * Script para la Evaluación Hematológica Integral - Versión Narrativa
 *
 * Este script maneja la lógica completa para un formulario de evaluación hematológica interactivo.
 * Responsabilidades:
 * 1.  Gestión de la interfaz de usuario: paneles, secciones colapsables, tema.
 * 2.  Cálculo en tiempo real de todas las escalas hematológicas (ECOG, ISTH, Charlson, etc.).
 * 3.  Actualización de un panel de control superior con métricas clave.
 * 4.  Generación de un informe clínico detallado y en formato narrativo a medida que el usuario completa el formulario.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Adjuntar todos los listeners a los inputs para la actualización en tiempo real.
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', generateHematologyReport);
        el.addEventListener('input', generateHematologyReport);
    });

    // Configurar la UI inicial
    initializeUI();
    
    // Generar el estado inicial del informe y los cálculos.
    generateHematologyReport();
});

/**
 * Configura los componentes iniciales de la interfaz de usuario.
 */
function initializeUI() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }

    const firstSection = document.querySelector('.section-container');
    if (firstSection && !firstSection.classList.contains('active')) {
        _internalToggleSection(firstSection);
    }
}

/**
 * Función principal que orquesta la generación del informe y la actualización de la UI.
 */
function generateHematologyReport() {
    calculateAllScales();
    const report = buildNarrativeReport();
    
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
    evaluateAnemiaSeverity();
    evaluateVitalSigns();
    evaluateOrganomegaly();
    calculateLymphNodeStats();
    calculateECOGScore();
    calculateISThScore();
    calculateBSymptoms();
    calculateCharlson();
}

/**
 * Construye el texto completo del informe narrativo.
 * @returns {string} El informe completo.
 */
function buildNarrativeReport() {
    let report = "INFORME DE EVALUACIÓN HEMATOLÓGICA\n";
    report += "=====================================\n\n";

    report += getSectionText('ANAMNESIS Y QUEJAS PRINCIPALES', getAnamnesisData());
    report += getSectionText('EXAMEN FÍSICO GENERAL', getPhysicalExamData());
    report += getSectionText('EXAMEN DE GANGLIOS LINFÁTICOS', getLymphNodeData());
    report += getSectionText('EXAMEN ABDOMINAL Y ORGANOMEGALIAS', getAbdominalExamData());
    report += getSectionText('ESCALAS DE EVALUACIÓN HEMATOLÓGICA', getScalesData());

    const filledInputs = document.querySelectorAll('input:checked, input[type="text"][value]:not([value=""]), input[type="number"][value]:not([value=""]), select:not([value=""])');
    if (filledInputs.length < 2) {
        return 'Seleccione los parámetros del examen para generar la conclusión hematológica...';
    } else {
        report += getFinalSummary();
    }
    
    return report;
}

// ===================================================================
// FUNCIONES DE RECOPILACIÓN DE DATOS PARA EL INFORME NARRATIVO
// ===================================================================

// CORRECCIÓN: Función actualizada para incluir los tipos de sangrado.
function getAnamnesisData() {
    let sentences = [];
    const quejas = getCheckedLabelsFromContainer('#anamnesis .sub-section-card:nth-of-type(1)');
    if (isChecked('sin-quejas-hemato')) {
        sentences.push("Paciente acude a consulta de rutina, asintomático desde el punto de vista hematológico.");
    } else if (quejas.length > 0) {
        sentences.push(`Paciente consulta por un cuadro clínico caracterizado por ${listToSentence(quejas)}.`);
    }

    // Caracterización de síntomas de sangrado
    let sangradoDetails = [];
    const bleedingIntensity = getInputValue('bleeding-intensity');
    if (bleedingIntensity > 0) {
        sangradoDetails.push(`una intensidad de ${bleedingIntensity}/10 en la escala visual análoga`);
    }

    const tiposSangrado = getCheckedLabelsFromContainer('#anamnesis .bleeding-assessment');
    if (tiposSangrado.length > 0) {
        sangradoDetails.push(`con evidencia de ${listToSentence(tiposSangrado)}`);
    }

    if (sangradoDetails.length > 0) {
        sentences.push(`En cuanto a la sintomatología de sangrado, el paciente refiere ${listToSentence(sangradoDetails)}.`);
    }

    // Caracterización de síntomas de anemia
    const anemiaSeverity = document.getElementById('anemia-severity').textContent;
    if (anemiaSeverity !== '--' && anemiaSeverity !== 'Sin anemia clínica') {
        sentences.push(`La sintomatología de anemia se clasifica clínicamente como ${anemiaSeverity.toLowerCase()}.`);
    }

    // Antecedentes
    const antecedentesPersonales = getCheckedLabelsFromContainer('#anamnesis .sub-section-card:nth-of-type(3) .mb-4:nth-of-type(1)');
    if (antecedentesPersonales.length > 0) {
        sentences.push(`Como antecedentes personales patológicos de relevancia hematológica, refiere ${listToSentence(antecedentesPersonales)}.`);
    }
    const antecedentesFamiliares = getCheckedLabelsFromContainer('#anamnesis .sub-section-card:nth-of-type(3) .mb-4:nth-of-type(2)');
    if (antecedentesFamiliares.length > 0) {
        sentences.push(`Presenta antecedentes familiares de ${listToSentence(antecedentesFamiliares)}.`);
    }
    const medicamentos = getCheckedLabelsFromContainer('#anamnesis .sub-section-card:nth-of-type(3) div:last-child');
    if (medicamentos.length > 0) {
        sentences.push(`Actualmente se encuentra en tratamiento con ${listToSentence(medicamentos)}.`);
    }

    return sentences.join(' ');
}

function getPhysicalExamData() {
    let sentences = [];
    let hallazgosGenerales = [];
    
    const signosAnemia = getCheckedLabelsFromContainer('#physical-exam .anemia-assessment');
    if(signosAnemia.length > 0) hallazgosGenerales.push(`signos clínicos de anemia como ${listToSentence(signosAnemia)}`);

    const signosSangrado = getCheckedLabelsFromContainer('#physical-exam .bleeding-assessment');
    if(signosSangrado.length > 0) hallazgosGenerales.push(`signos de sangrado activo o reciente, incluyendo ${listToSentence(signosSangrado)}`);

    const otrosHallazgos = getCheckedLabelsFromContainer('#physical-exam .sub-section-card:nth-of-type(3)'); // Corrected selector
    if(otrosHallazgos.length > 0) hallazgosGenerales.push(`otros hallazgos relevantes como ${listToSentence(otrosHallazgos)}`);

    if (hallazgosGenerales.length > 0) {
        sentences.push(`A la inspección general, se objetivan ${listToSentence(hallazgosGenerales)}.`);
    }

    const cardiovascularAssessment = document.getElementById('cardiovascular-assessment').textContent;
    if (cardiovascularAssessment !== '--') {
        const pas = getInputValue('pas');
        const pad = getInputValue('pad');
        const fc = getInputValue('frecuencia-cardiaca');
        sentences.push(`Los signos vitales muestran una presión arterial de ${pas || 'N/A'}/${pad || 'N/A'} mmHg y una frecuencia cardíaca de ${fc || 'N/A'} lpm, con una evaluación cardiovascular de ${cardiovascularAssessment.toLowerCase()}.`);
    }
    
    return sentences.join(' ');
}

function getLymphNodeData() {
    let sentences = [];
    const affectedChains = parseInt(document.getElementById('affected-chains').textContent);
    if (affectedChains > 0) {
        let findings = [];
        const nodeGroups = {
            'cervical-ant': 'Cervicales anteriores',
            'cervical-post': 'Cervicales posteriores',
            'supraclavicular': 'Supraclaviculares',
            'axilar': 'Axilares',
            'inguinal': 'Inguinales'
        };

        Object.keys(nodeGroups).forEach(group => {
            ['der', 'izq'].forEach(side => {
                if (isChecked(`${group}-${side}-palpable`)) {
                    const size = getInputValue(`${group}-${side}-size`);
                    let characteristics = [];
                    if(isChecked(`${group}-${side}-doloroso`)) characteristics.push('dolorosa');
                    if(isChecked(`${group}-${side}-duro`)) characteristics.push('dura');
                    if(isChecked(`${group}-${side}-fijo`)) characteristics.push('fija');
                    
                    let description = `adenopatía ${nodeGroups[group].toLowerCase()} ${side.replace('der', 'derecha').replace('izq', 'izquierda')}`;
                    if (size) description += ` de ${size} cm`;
                    if (characteristics.length > 0) description += `, de consistencia ${listToSentence(characteristics)}`;
                    
                    findings.push(description);
                }
            });
        });
        sentences.push(`Se palpan las siguientes adenopatías: ${listToSentence(findings)}.`);
        const concerningFeatures = document.getElementById('concerning-features').textContent;
        if (concerningFeatures !== 'Ninguna') {
            sentences.push(`Presentan características de sospecha como: ${concerningFeatures}.`);
        }
    } else {
        return "No se palpan adenopatías en las cadenas ganglionares exploradas.";
    }
    return sentences.join(' ');
}

function getAbdominalExamData() {
    let sentences = [];
    const hepatomegalyGrade = document.getElementById('hepatomegaly-grade').textContent;
    const splenomegalyGrade = document.getElementById('splenomegaly-grade').textContent;

    if (hepatomegalyGrade !== '--') {
        sentences.push(`Se palpa una hepatomegalia ${hepatomegalyGrade.toLowerCase()}.`);
    }
    if (splenomegalyGrade !== '--') {
        sentences.push(`Se evidencia una esplenomegalia ${splenomegalyGrade.toLowerCase()}.`);
    }

    const otrosHallazgos = getCheckedLabelsFromContainer('#abdominal-exam .sub-section-card:last-child');
    if (otrosHallazgos.length > 0) {
        sentences.push(`Adicionalmente, se encuentran otros hallazgos abdominales como ${listToSentence(otrosHallazgos)}.`);
    }

    if (sentences.length === 0) {
        return "El examen abdominal no revela visceromegalias ni otros hallazgos patológicos.";
    }
    return sentences.join(' ');
}

function getScalesData() {
    let sentences = [];
    
    // ECOG
    const ecogScore = document.getElementById('ecog-score').textContent;
    if (ecogScore !== '--') {
        const ecogLabel = getSelectedRadioLabel('ecog-status');
        sentences.push(`El estado funcional del paciente según la escala ECOG es de ${ecogScore} (${ecogLabel}).`);
    }

    // ISTH
    const isthInterpretation = document.getElementById('isth-interpretation').textContent;
    const isthScore = document.getElementById('isth-total-score').textContent;
    if (isthScore > 0) {
        let isthDetails = [];
        const isthMenstrual = getSelectedRadioLabel('isth-menstrual');
        if(isthMenstrual && !isthMenstrual.includes("Normal")) isthDetails.push(`sangrado menstrual (${isthMenstrual})`);

        const isthPostparto = getSelectedRadioLabel('isth-postparto');
        if(isthPostparto && !isthPostparto.includes("Normal")) isthDetails.push(`sangrado post-parto (${isthPostparto})`);
        
        const isthCirugia = getSelectedRadioLabel('isth-cirugia');
        if(isthCirugia && !isthCirugia.includes("Normal")) isthDetails.push(`sangrado en cirugía (${isthCirugia})`);

        const isthDental = getSelectedRadioLabel('isth-dental');
        if(isthDental && !isthDental.includes("Normal")) isthDetails.push(`sangrado dental (${isthDental})`);

        if(isthDetails.length > 0) {
            sentences.push(`La escala de sangrado ISTH (puntuación: ${isthScore}) ${isthInterpretation.toLowerCase()}, destacando ${listToSentence(isthDetails)}.`);
        }
    }

    // B Symptoms
    const bSymptomsCount = document.getElementById('b-symptoms-count').textContent;
    if (bSymptomsCount > 0) {
        const bSymptomsDetails = getCheckedLabelsFromContainer('#hematologic-scales .score-calculation:first-of-type'); // Selector for B-symptoms container
        sentences.push(`Se constata la presencia de ${bSymptomsCount} síntoma(s) B, incluyendo ${listToSentence(bSymptomsDetails)}.`);
    }
    
    // Charlson
    const charlsonScore = document.getElementById('charlson-score').textContent;
    if (charlsonScore > 0) {
        const charlsonSurvival = document.getElementById('charlson-survival').textContent;
        const comorbidities = getCheckedLabelsFromContainer('#hematologic-scales .sub-section-card:last-child');
        sentences.push(`Se registran las siguientes comorbilidades: ${listToSentence(comorbidities)}. El índice de comorbilidad de Charlson es de ${charlsonScore}, con una supervivencia estimada a 10 años del ${charlsonSurvival}.`);
    }

    return sentences.join(' ');
}

function getFinalSummary() {
    let summary = "\n\n**IMPRESIÓN DIAGNÓSTICA Y PLAN**\n";
    summary += "-----------------------------------\n";
    summary += "[Pendiente de correlación con hemograma completo, frotis de sangre periférica, y estudios específicos (ej., bioquímica, pruebas de coagulación, biopsia de médula ósea) según los hallazgos clínicos y antecedentes. Considerar diagnósticos diferenciales según el perfil de síntomas.]\n\n";
    summary += "Se recomienda el siguiente plan de manejo inicial:\n";
    summary += "1.  **Estudios Complementarios:** [Solicitar analítica completa, estudios de imagen si procede].\n";
    summary += "2.  **Manejo Sintomático:** [Indicar tratamiento para los síntomas actuales].\n";
    summary += "3.  **Seguimiento:** [Programar reevaluación con resultados para definir diagnóstico y tratamiento definitivo].\n";
    return summary;
}

// ===================================================================
// FUNCIONES DE CÁLCULO DE ESCALAS
// ===================================================================
function evaluateAnemiaSeverity() {
    const tolerance = getInputValue('exercise-tolerance');
    const severityEl = document.getElementById('anemia-severity');
    const levels = { '0': 'Sin anemia clínica', '1': 'Anemia leve', '2': 'Anemia moderada', '3': 'Anemia severa', '4': 'Anemia crítica' };
    severityEl.textContent = levels[tolerance] || '--';
}

function evaluateVitalSigns() {
    const hr = parseFloat(getInputValue('frecuencia-cardiaca'));
    const sbp = parseFloat(getInputValue('pas'));
    const assessmentEl = document.getElementById('cardiovascular-assessment');
    let assessment = [];
    if (hr > 100) assessment.push('Taquicardia');
    if (hr < 60) assessment.push('Bradicardia');
    if (sbp < 90) assessment.push('Hipotensión');
    if (sbp > 140) assessment.push('Hipertensión');
    assessmentEl.textContent = assessment.length > 0 ? assessment.join(', ') : (hr || sbp ? 'Normal' : '--');
}

function evaluateOrganomegaly() {
    const hepatomegaliaCm = parseFloat(getInputValue('hepatomegalia-cm')) || 0;
    const hepatomegalyGradeEl = document.getElementById('hepatomegaly-grade');
    if (isChecked('hepatomegalia') && hepatomegaliaCm > 0) {
        if (hepatomegaliaCm < 3) hepatomegalyGradeEl.textContent = 'Leve';
        else if (hepatomegaliaCm < 6) hepatomegalyGradeEl.textContent = 'Moderada';
        else hepatomegalyGradeEl.textContent = 'Severa';
    } else if (isChecked('hepatomegalia')) {
        hepatomegalyGradeEl.textContent = 'Palpable';
    } else {
        hepatomegalyGradeEl.textContent = '--';
    }

    const spleenHackett = getInputValue('spleen-hackett');
    const splenomegalyGradeEl = document.getElementById('splenomegaly-grade');
    const hackettGrades = { '1': 'Leve', '2': 'Moderada', '3': 'Moderada-severa', '4': 'Severa', '5': 'Masiva' };
    splenomegalyGradeEl.textContent = isChecked('esplenomegalia') ? (hackettGrades[spleenHackett] || 'Palpable') : '--';
}

function calculateLymphNodeStats() {
    let affectedChains = 0;
    let maxSize = 0;
    let concerningFeatures = new Set();
    const nodeGroups = ['cervical-ant', 'cervical-post', 'supraclavicular', 'axilar', 'inguinal'];
    nodeGroups.forEach(group => {
        ['der', 'izq'].forEach(side => {
            if (isChecked(`${group}-${side}-palpable`)) {
                affectedChains++;
                const size = parseFloat(getInputValue(`${group}-${side}-size`)) || 0;
                maxSize = Math.max(maxSize, size);
                if (isChecked(`${group}-${side}-doloroso`)) concerningFeatures.add('Doloroso');
                if (isChecked(`${group}-${side}-duro`)) concerningFeatures.add('Duro');
                if (isChecked(`${group}-${side}-fijo`)) concerningFeatures.add('Fijo');
            }
        });
    });
    document.getElementById('affected-chains').textContent = affectedChains;
    document.getElementById('max-node-size').textContent = `${maxSize} cm`;
    document.getElementById('concerning-features').textContent = concerningFeatures.size > 0 ? [...concerningFeatures].join(', ') : 'Ninguna';
}

function calculateECOGScore() {
    const ecogRadio = document.querySelector('input[name="ecog-status"]:checked');
    document.getElementById('ecog-score').textContent = ecogRadio ? ecogRadio.value : '--';
}

function calculateISThScore() {
    let total = 0;
    ['menstrual', 'postparto', 'cirugia', 'dental'].forEach(category => {
        const radio = document.querySelector(`input[name="isth-${category}"]:checked`);
        if (radio) total += parseInt(radio.value);
    });
    document.getElementById('isth-total-score').textContent = total;
    let interpretation = 'Bajo riesgo hemorrágico';
    if (total >= 4) interpretation = 'Sugiere trastorno hemorrágico';
    else if (total >= 2) interpretation = 'Posible trastorno hemorrágico';
    document.getElementById('isth-interpretation').textContent = interpretation;
}

function calculateBSymptoms() {
    let count = 0;
    if (isChecked('sintoma-b-fiebre')) count++;
    if (isChecked('sintoma-b-sudoracion')) count++;
    if (isChecked('sintoma-b-peso')) count++;
    document.getElementById('b-symptoms-count').textContent = count;
    document.getElementById('b-symptoms-classification').textContent = count > 0 ? 'Síntomas B presentes' : 'Síntomas B ausentes';
}

function calculateCharlson() {
    const items = { 'charlson-iam': 1, 'charlson-icc': 1, 'charlson-evc': 1, 'charlson-demencia': 1, 'charlson-epoc': 1, 'charlson-colagenosis': 1, 'charlson-ulcera': 1, 'charlson-hepatopatia-leve': 1, 'charlson-diabetes': 1, 'charlson-hemiplejia': 2, 'charlson-renal-moderada': 2, 'charlson-diabetes-complicada': 2, 'charlson-tumor': 2, 'charlson-leucemia': 2, 'charlson-linfoma': 2, 'charlson-hepatopatia-severa': 3, 'charlson-tumor-metastasico': 6, 'charlson-sida': 6 };
    let total = 0;
    Object.keys(items).forEach(id => { if (isChecked(id)) total += items[id]; });
    document.getElementById('charlson-score').textContent = total;
    const survivalRates = { 0: '98%', 1: '96%', 2: '90%', 3: '77%', 4: '53%' };
    document.getElementById('charlson-survival').textContent = total >= 5 ? '21%' : (survivalRates[total] || '--');
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
        const inputs = section.querySelectorAll('input:checked, input[type="text"][value]:not([value=""]), input[type="number"][value]:not([value=""]), select:not([value=""])');
        if (inputs.length > 0) completedSections++;
        findingsCount += inputs.length;
    });

    if (document.getElementById('anemia-severity').textContent.includes('severa') || document.getElementById('anemia-severity').textContent.includes('crítica')) alertCount++;
    if (document.getElementById('cardiovascular-assessment').textContent.includes('Hipotensión')) alertCount++;
    if (parseInt(document.getElementById('b-symptoms-count').textContent) > 0) warningCount++;
    if (document.getElementById('isth-interpretation').textContent.includes('Sugiere')) alertCount++;
    if (parseInt(document.getElementById('charlson-score').textContent) > 4) alertCount++;
    
    const progress = sections.length > 0 ? Math.round((completedSections / sections.length) * 100) : 0;
    
    document.getElementById('exam-progress').textContent = `${progress}%`;
    document.getElementById('sections-completed').textContent = `${completedSections}/${sections.length}`;
    document.getElementById('alert-count').textContent = alertCount;
    document.getElementById('warning-count').textContent = warningCount;
    document.getElementById('findings-count').textContent = findingsCount;
    document.getElementById('vitals-status').textContent = document.getElementById('cardiovascular-assessment').textContent;
}

// ===================================================================
// FUNCIONES AUXILIARES Y DE UI
// ===================================================================

function getInputValue(id) { return document.getElementById(id)?.value || ''; }
function isChecked(id) { return document.getElementById(id)?.checked || false; }
function getLabelText(id) { return document.querySelector(`label[for="${id}"]`)?.textContent.trim() || ''; }

function getSelectedRadioLabel(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    if (!selected) return null;
    const label = document.querySelector(`label[for="${selected.id}"]`);
    return label ? label.textContent.trim().toLowerCase() : null;
}

function getCheckedLabelsFromContainer(selector) {
    const container = document.querySelector(selector);
    if (!container) return [];
    return Array.from(container.querySelectorAll('input:checked'))
        .map(cb => document.querySelector(`label[for="${cb.id}"]`)?.textContent.trim().toLowerCase())
        .filter(Boolean);
}
function listToSentence(arr) {
    if (!arr || arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ' y ' + arr.slice(-1);
}
function getSectionText(title, content) {
    return (content && content.trim()) ? `**${title}**\n${content.trim()}\n\n` : "";
}
function showNotification(message, type = 'success') {
    const notification = document.getElementById('copyNotification');
    if (!notification) return;
    notification.querySelector('span').textContent = message;
    notification.className = `copy-notification fixed bottom-8 right-8 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 transition-opacity duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} show`;
    setTimeout(() => notification.classList.remove('show'), 3000);
}

function _internalToggleSection(sectionElement) {
    if (!sectionElement) return;
    const content = sectionElement.querySelector('.section-content-main');
    const arrow = sectionElement.querySelector('.section-arrow');
    if (!content || !arrow) return;
    sectionElement.classList.toggle('active');
    content.classList.toggle('expanded');
    if (content.classList.contains('expanded')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        arrow.classList.replace('fa-chevron-down', 'fa-chevron-up');
    } else {
        content.style.maxHeight = '0';
        arrow.classList.replace('fa-chevron-up', 'fa-chevron-down');
    }
}

// ===================================================================
// ASIGNACIÓN DE FUNCIONES GLOBALES PARA EL HTML
// ===================================================================
window.toggleSection = (headerElement) => _internalToggleSection(headerElement.closest('.section-container'));
window.toggleTheme = () => {
    const body = document.body;
    const isDark = body.toggleAttribute('data-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('theme-icon').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
};
window.clearForm = () => {
    document.querySelector('main').querySelectorAll('input, select, textarea').forEach(el => {
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
        else if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else el.value = '';
    });
    generateHematologyReport();
    showNotification('Formulario limpiado.');
};
window.expandAllSections = () => document.querySelectorAll('.section-container:not(.active)').forEach(el => _internalToggleSection(el));
window.collapseAllSections = () => document.querySelectorAll('.section-container.active').forEach(el => _internalToggleSection(el));
window.copyStickyToClipboard = () => {
    navigator.clipboard.writeText(document.getElementById('stickyContent').textContent)
        .then(() => showNotification('Informe copiado.'))
        .catch(() => showNotification('Error al copiar.', 'error'));
};
window.printStickyConclusion = () => {
    const content = document.getElementById('stickyContent').textContent;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<pre>${content}</pre>`);
    printWindow.document.close();
    printWindow.print();
};
window.generateConclusion = generateHematologyReport;
window.generateStickyConclusion = generateHematologyReport;
window.toggleStickyPanel = () => document.getElementById('stickyConclusion').classList.toggle('active');
window.handleNoComplaints = () => {
    const isDisabled = isChecked('sin-quejas-hemato');
    document.querySelectorAll('#anamnesis .sub-section-card:first-of-type input:not(#sin-quejas-hemato)').forEach(el => {
        el.disabled = isDisabled;
        if (isDisabled) el.checked = false;
    });
    generateHematologyReport();
};
window.scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        if (!section.classList.contains('active')) _internalToggleSection(section);
    }
};
window.toggleHematoSubMenu = (event) => {
    event.preventDefault();
    const subMenu = document.getElementById('hemato-sub-menu');
    const link = document.getElementById('hemato-nav-link');
    link.classList.toggle('active');
    subMenu.style.maxHeight = link.classList.contains('active') ? subMenu.scrollHeight + 'px' : '0';
};
