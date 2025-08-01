/**
 * Script para la Evaluación Oftalmológica Integral - Versión Narrativa
 *
 * Este script maneja la lógica completa para un formulario de evaluación oftalmológica altamente detallado.
 * Responsabilidades:
 * 1.  Gestión de la interfaz de usuario: paneles, secciones colapsables, tema.
 * 2.  Captura y procesamiento de todos los puntos de datos, incluyendo AV, PIO, examen de segmento anterior/posterior, etc.
 * 3.  Actualización de un panel de control superior con métricas clave en tiempo real.
 * 4.  Generación de un informe clínico narrativo exhaustivo que refleja cada selección del usuario.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Adjuntar listeners a todos los inputs para la actualización en tiempo real.
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', updateAll);
        el.addEventListener('input', updateAll);
    });
    // Listeners para los campos visuales
    document.querySelectorAll('.field-quadrant').forEach(el => {
        el.addEventListener('click', () => {
            el.classList.toggle('defect');
            updateAll();
        });
    });
    
    // Configurar la UI inicial
    initializeUI();
    
    // Generar el estado inicial del informe y los cálculos.
    updateAll();
});

/**
 * Función principal que se llama en cada cambio para actualizar todo.
 */
function updateAll() {
    updateDashboard();
    generateFullReport();
}

/**
 * Configura los componentes iniciales de la interfaz de usuario.
 */
function initializeUI() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }

    // Expandir la primera sección por defecto.
    const firstSection = document.querySelector('.section-container');
    if (firstSection) {
        _internalToggleSection(firstSection);
    }
}

/**
 * Construye el texto completo del informe narrativo.
 */
function generateFullReport() {
    let report = "INFORME DE EVALUACIÓN OFTALMOLÓGICA\n";
    report += "======================================\n\n";

    report += getSectionText('ANAMNESIS Y QUEJAS PRINCIPALES', getAnamnesisData());
    report += getSectionText('AGUDEZA VISUAL Y CAMPO VISUAL', getVisualAcuityData());
    report += getSectionText('EXAMEN PUPILAR', getPupilData());
    report += getSectionText('EXAMEN EXTERNO', getExternalExamData());
    report += getSectionText('MOTILIDAD OCULAR', getMotilityData());
    report += getSectionText('SEGMENTO ANTERIOR (BIOMICROSCOPÍA)', getAnteriorSegmentData());
    report += getSectionText('PRESIÓN INTRAOCULAR (TONOMETRÍA)', getPressureData());
    report += getSectionText('SEGMENTO POSTERIOR (FUNDOSCOPÍA)', getFundoscopyData());
    report += getSectionText('ESCALAS Y CLASIFICACIONES', getScalesData());

    const filledInputs = document.querySelectorAll('input:checked, input[type="text"][value]:not([value=""]), input[type="number"][value]:not([value=""])');
    if (filledInputs.length < 2 && !document.querySelector('.field-quadrant.defect')) {
        report = 'Seleccione los parámetros del examen para generar la conclusión...';
    }
    
    document.getElementById('stickyContent').textContent = report.trim();
}

// ===================================================================
// FUNCIONES DE RECOPILACIÓN DE DATOS PARA EL INFORME NARRATIVO
// ===================================================================

function getAnamnesisData() {
    let sentences = [];
    if (isChecked('sin-quejas-oftalmo')) {
        return "Paciente acude a control, asintomático desde el punto de vista oftalmológico.";
    }
    
    const complaints = getCheckedLabelsFromContainer('#anamnesis-section .sub-section-card:first-of-type');
    if (complaints.length > 0) {
        sentences.push(`Paciente consulta refiriendo ${listToSentence(complaints)}.`);
    }

    if (isChecked('dolor-ocular')) {
        const dolorOD = getInputValue('dolor-od-intensidad');
        const dolorOI = getInputValue('dolor-oi-intensidad');
        const tipoDolor = getSelectedRadioLabel('tipo-dolor-ocular');
        let painSentence = "Describe dolor ocular";
        if (tipoDolor) painSentence += ` de tipo ${tipoDolor}`;
        if (dolorOD > 0 && dolorOI > 0) painSentence += `, con una intensidad de ${dolorOD}/10 en OD y ${dolorOI}/10 en OI.`;
        else if (dolorOD > 0) painSentence += `, con una intensidad de ${dolorOD}/10 en OD.`;
        else if (dolorOI > 0) painSentence += `, con una intensidad de ${dolorOI}/10 en OI.`;
        sentences.push(painSentence);
    }

    const history = getCheckedLabelsFromContainer('#anamnesis-section .sub-section-card:last-of-type');
    if (history.length > 0) {
        sentences.push(`Como antecedentes de relevancia, se consignan: ${listToSentence(history)}.`);
    }

    return sentences.join(' ');
}

function getVisualAcuityData() {
    let sentences = [];
    const avOD_sc = getInputValue('av-lejos-od-sc');
    const avOD_cc = getInputValue('av-lejos-od-cc');
    const avOI_sc = getInputValue('av-lejos-oi-sc');
    const avOI_cc = getInputValue('av-lejos-oi-cc');
    const mejorAV_OD = avOD_cc || avOD_sc;
    const mejorAV_OI = avOI_cc || avOI_sc;

    if (mejorAV_OD || mejorAV_OI) {
        sentences.push(`La agudeza visual de lejos es de ${mejorAV_OD || 'no evaluada'} en ojo derecho (OD) y ${mejorAV_OI || 'no evaluada'} en ojo izquierdo (OI).`);
    }
    
    let fieldDefects = [];
    document.querySelectorAll('.field-quadrant.defect').forEach(q => {
        const fieldData = q.dataset.field.split('-');
        fieldDefects.push(`cuadrante ${fieldData[1]} ${fieldData[2]} de ojo ${fieldData[0].toUpperCase()}`);
    });
    const namedDefects = getCheckedLabelsFromContainer('#visual-acuity-section .sub-section-card:nth-of-type(3)');
    if (namedDefects.length > 0) fieldDefects.push(...namedDefects);

    if (fieldDefects.length > 0) {
        sentences.push(`En la campimetría por confrontación se objetivan los siguientes defectos: ${listToSentence(fieldDefects)}.`);
    }

    const ishiharaOD = isChecked('ishihara-od-alterado') ? `alterada (${getInputValue('ishihara-od-score')})` : (isChecked('ishihara-od-normal') ? 'normal' : '');
    const ishiharaOI = isChecked('ishihara-oi-alterado') ? `alterada (${getInputValue('ishihara-oi-score')})` : (isChecked('ishihara-oi-normal') ? 'normal' : '');
    if (ishiharaOD || ishiharaOI) {
        sentences.push(`La visión de colores, evaluada con test de Ishihara, es ${ishiharaOD} en OD y ${ishiharaOI} en OI.`);
    }

    return sentences.join(' ');
}

function getPupilData() {
    let sentences = [];
    const sizeOD = getInputValue('pupila-od-luz');
    const sizeOI = getInputValue('pupila-oi-luz');
    const shapeOD = getSelectedRadioLabel('forma-od');
    const shapeOI = getSelectedRadioLabel('forma-oi');

    let pupilDescription = "Las pupilas son";
    if (sizeOD && sizeOI && sizeOD === sizeOI) pupilDescription += " isocóricas";
    else if (sizeOD && sizeOI) pupilDescription += ` anisocóricas (${sizeOD}mm OD, ${sizeOI}mm OI)`;
    
    if (shapeOD && shapeOI && shapeOD === shapeOI) pupilDescription += `, ${shapeOD}s y`;
    else if (shapeOD && shapeOI) pupilDescription += `, de forma ${shapeOD} en OD y ${shapeOI} en OI, y`;

    let reflexes = [];
    if (isChecked('fotomotor-directo-od-pos') && isChecked('fotomotor-directo-oi-pos')) reflexes.push("fotomotor directo conservado bilateralmente");
    if (isChecked('consensual-od-oi-pos') && isChecked('consensual-oi-od-pos')) reflexes.push("consensual conservado");
    
    pupilDescription += ` ${listToSentence(reflexes)}.`;
    sentences.push(pupilDescription);

    if (isChecked('marcus-gunn-pos')) {
        const eye = document.getElementById('marcus-gunn-ojo').value;
        sentences.push(`Se evidencia un defecto pupilar aferente relativo (DPAR) en ojo ${eye}.`);
    } else if (isChecked('marcus-gunn-neg')) {
        sentences.push("No se detecta DPAR.");
    }
    return sentences.join(' ');
}

function getExternalExamData() {
    let findingsOD = [], findingsOI = [];
    // OD
    if (isChecked('ptosis-od')) findingsOD.push('ptosis palpebral');
    if (isChecked('ectropion-od')) findingsOD.push('ectropión');
    if (isChecked('hiperemia-conjuntival-od')) findingsOD.push('hiperemia conjuntival');
    if (isChecked('hemorragia-subconjuntival-od')) findingsOD.push('hemorragia subconjuntival');
    // OI
    if (isChecked('ptosis-oi')) findingsOI.push('ptosis palpebral');
    if (isChecked('ectropion-oi')) findingsOI.push('ectropión');
    if (isChecked('hiperemia-conjuntival-oi')) findingsOI.push('hiperemia conjuntival');
    if (isChecked('hemorragia-subconjuntival-oi')) findingsOI.push('hemorragia subconjuntival');

    let text = "";
    if (findingsOD.length > 0) text += `En ojo derecho se observa: ${listToSentence(findingsOD)}. `;
    if (findingsOI.length > 0) text += `En ojo izquierdo se observa: ${listToSentence(findingsOI)}. `;
    
    return text || "El examen externo de ambos ojos se encuentra dentro de la normalidad.";
}

function getMotilityData() {
    let sentences = [];
    if (isChecked('duccion-od-normal') && isChecked('duccion-oi-normal') && isChecked('versiones-normales')) {
        sentences.push("La motilidad ocular extrínseca se encuentra conservada en ducciones y versiones.");
    } else {
        let limitations = [];
        if (!isChecked('duccion-od-normal')) limitations.push('ducciones en OD');
        if (!isChecked('duccion-oi-normal')) limitations.push('ducciones en OI');
        if (isChecked('limitacion-abduccion-od')) limitations.push('limitación de la abducción en OD');
        if (isChecked('limitacion-abduccion-oi')) limitations.push('limitación de la abducción en OI');
        if (limitations.length > 0) sentences.push(`Se objetiva alteración de la motilidad ocular con ${listToSentence(limitations)}.`);
    }

    const coverTest = getSelectedText('cover-test');
    if (coverTest && coverTest !== 'Seleccionar') {
        sentences.push(`El Cover Test revela ${coverTest.toLowerCase()}.`);
    }

    if (isChecked('nistagmo-presente')) {
        const direction = getSelectedText('direccion-nistagmo');
        sentences.push(`Se evidencia nistagmo ${direction ? direction.toLowerCase() : ''}.`);
    }
    return sentences.join(' ');
}

function getAnteriorSegmentData() {
    let text = "";
    // OD
    let findingsOD = [];
    if (isChecked('cornea-od-edema')) findingsOD.push('edema corneal');
    if (isChecked('cornea-od-ulcera')) findingsOD.push('úlcera corneal');
    if (isChecked('fluoresceina-od-pos')) findingsOD.push('tinción con fluoresceína positiva');
    if (isChecked('hipopion-od')) findingsOD.push('hipopión en cámara anterior');
    if (isChecked('catarata-nuclear-od')) findingsOD.push('catarata nuclear');
    if (isChecked('pseudofaco-od')) findingsOD.push('lente intraocular (pseudofaquia)');
    if (findingsOD.length > 0) text += `Segmento anterior OD: ${listToSentence(findingsOD)}. `;
    
    // OI
    let findingsOI = [];
    if (isChecked('cornea-oi-edema')) findingsOI.push('edema corneal');
    if (isChecked('cornea-oi-ulcera')) findingsOI.push('úlcera corneal');
    if (isChecked('fluoresceina-oi-pos')) findingsOI.push('tinción con fluoresceína positiva');
    if (isChecked('hipopion-oi')) findingsOI.push('hipopión en cámara anterior');
    if (isChecked('catarata-nuclear-oi')) findingsOI.push('catarata nuclear');
    if (isChecked('pseudofaco-oi')) findingsOI.push('lente intraocular (pseudofaquia)');
    if (findingsOI.length > 0) text += `Segmento anterior OI: ${listToSentence(findingsOI)}.`;

    return text || "El examen del segmento anterior de ambos ojos es normal.";
}

function getPressureData() {
    const pioOD = getInputValue('pio-od');
    const pioOI = getInputValue('pio-oi');
    if (pioOD || pioOI) {
        return `La presión intraocular es de ${pioOD || 'N/A'} mmHg en OD y ${pioOI || 'N/A'} mmHg en OI.`;
    }
    return "";
}

function getFundoscopyData() {
    let text = "";
    // OD
    let findingsOD = [];
    if (isChecked('papiledema-od')) findingsOD.push('papiledema');
    const cdOD = getInputValue('cup-disc-od');
    if (cdOD) findingsOD.push(`excavación papilar de ${cdOD}`);
    if (isChecked('drusas-od')) findingsOD.push('drusas maculares');
    if (isChecked('hemorragias-retinianas-od')) findingsOD.push('hemorragias retinianas');
    if (isChecked('desprendimiento-retina-od')) findingsOD.push('desprendimiento de retina');
    if (findingsOD.length > 0) text += `Fundoscopía OD: ${listToSentence(findingsOD)}. `;
    
    // OI
    let findingsOI = [];
    if (isChecked('papiledema-oi')) findingsOI.push('papiledema');
    const cdOI = getInputValue('cup-disc-oi');
    if (cdOI) findingsOI.push(`excavación papilar de ${cdOI}`);
    if (isChecked('drusas-oi')) findingsOI.push('drusas maculares');
    if (isChecked('hemorragias-retinianas-oi')) findingsOI.push('hemorragias retinianas');
    if (isChecked('desprendimiento-retina-oi')) findingsOI.push('desprendimiento de retina');
    if (findingsOI.length > 0) text += `Fundoscopía OI: ${listToSentence(findingsOI)}.`;

    return text || "El examen de fondo de ojo de ambos ojos es normal.";
}

function getScalesData() {
    let sentences = [];
    const rd = getSelectedRadioLabel('retinopatia-diabetica');
    if (rd) sentences.push(`Clasificación de Retinopatía Diabética (ETDRS): ${rd}.`);
    const rh = getSelectedRadioLabel('retinopatia-hipertensiva');
    if (rh) sentences.push(`Clasificación de Retinopatía Hipertensiva (KWB): ${rh}.`);
    const disability = document.getElementById('clasificacion-oms').textContent;
    if (disability !== '--') sentences.push(`Clasificación de Discapacidad Visual (OMS): ${disability}.`);
    return sentences.join(' ');
}

// ===================================================================
// FUNCIONES DE ACTUALIZACIÓN DE DASHBOARD Y UI
// ===================================================================
function updateDashboard() {
    const sections = document.querySelectorAll('.section-container:not(.dashboard-widget)');
    let completedSections = 0;
    let findingsCount = 0;
    let alertCount = 0;
    let warningCount = 0;
    
    sections.forEach(section => {
        const inputs = section.querySelectorAll('input:checked, input[type="text"][value]:not([value=""]), input[type="number"][value]:not([value=""])');
        if (inputs.length > 0 || section.querySelector('.field-quadrant.defect')) {
            completedSections++;
        }
        findingsCount += inputs.length + section.querySelectorAll('.field-quadrant.defect').length;
    });

    // Alerts
    if (isChecked('perdida-vision')) alertCount++;
    if (parseFloat(getInputValue('pio-od')) > 25 || parseFloat(getInputValue('pio-oi')) > 25) alertCount++;
    if (isChecked('desprendimiento-retina-od') || isChecked('desprendimiento-retina-oi')) alertCount++;
    if (isChecked('papiledema-od') || isChecked('papiledema-oi')) alertCount++;

    // Warnings
    const avOD = document.getElementById('av-od-status').textContent;
    const avOI = document.getElementById('av-oi-status').textContent;
    if (avOD === 'Reducida' || avOI === 'Reducida') warningCount++;
    if (isChecked('marcus-gunn-pos')) warningCount++;
    if (parseFloat(getInputValue('pio-od')) > 21 || parseFloat(getInputValue('pio-oi')) > 21) warningCount++;

    document.getElementById('exam-progress').textContent = `${Math.round((completedSections / sections.length) * 100)}%`;
    document.getElementById('sections-completed').textContent = `${completedSections}/${sections.length}`;
    document.getElementById('alert-count').textContent = alertCount;
    document.getElementById('warning-count').textContent = warningCount;
    document.getElementById('findings-count').textContent = findingsCount;

    // Actualizar estados de AV y PIO
    evaluateAVStatus('od');
    evaluateAVStatus('oi');
    evaluatePIO();
    calculateVisualDisability();
}

function evaluateAVStatus(eye) {
    const sc = getInputValue(`av-lejos-${eye}-sc`);
    const cc = getInputValue(`av-lejos-${eye}-cc`);
    const finalAV = cc || sc;
    let status = '--';
    if (finalAV) {
        const denominator = parseInt(finalAV.split('/')[1]);
        if (denominator <= 25) status = 'Normal';
        else if (denominator <= 60) status = 'Leve';
        else status = 'Reducida';
    }
    document.getElementById(`av-${eye}-status`).textContent = status;
}

function evaluatePIO() {
    const pioOD = parseFloat(getInputValue('pio-od'));
    const pioOI = parseFloat(getInputValue('pio-oi'));
    const interpret = (pio) => {
        if (isNaN(pio)) return '--';
        if (pio > 21) return 'Elevada';
        return 'Normal';
    };
    document.getElementById('pio-od-status').textContent = interpret(pioOD);
    document.getElementById('pio-oi-status').textContent = interpret(pioOI);
}

function calculateVisualDisability() {
    const av = getInputValue('mejor-ojo-av');
    let classification = '--';
    if (av) {
        const denominator = parseInt(av.split('/')[1]);
        if (denominator >= 200) classification = 'Ceguera legal';
        else if (denominator > 60) classification = 'Baja visión';
    }
    document.getElementById('clasificacion-oms').textContent = classification;
}

// ===================================================================
// FUNCIONES AUXILIARES Y DE UI
// ===================================================================
function getInputValue(id) { return document.getElementById(id)?.value || ''; }
function isChecked(id) { return document.getElementById(id)?.checked || false; }
function getLabelText(id) { return document.querySelector(`label[for="${id}"]`)?.textContent.trim() || ''; }
function getSelectedText(id) {
    const select = document.getElementById(id);
    return select && select.selectedIndex > 0 ? select.options[select.selectedIndex].text : '';
}
function getSelectedRadioLabel(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    if (!selected) return null;
    return getLabelText(selected.id);
}
function getCheckedLabelsFromContainer(selector) {
    const container = document.querySelector(selector);
    if (!container) return [];
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => getLabelText(cb.id))
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

function _internalToggleSection(sectionElement) {
    if (!sectionElement) return;
    const content = sectionElement.querySelector('.section-content-main');
    const arrow = sectionElement.querySelector('.section-arrow');
    if (!content) return;
    sectionElement.classList.toggle('expanded');
    if (sectionElement.classList.contains('expanded')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        if (arrow) arrow.classList.replace('fa-chevron-down', 'fa-chevron-up');
    } else {
        content.style.maxHeight = '0';
        if (arrow) arrow.classList.replace('fa-chevron-up', 'fa-chevron-down');
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
    if(confirm('¿Está seguro de que desea limpiar todos los datos del formulario?')) {
        document.querySelector('main').querySelectorAll('input, select, textarea').forEach(el => {
            if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
            else el.value = '';
        });
        document.querySelectorAll('.field-quadrant.defect').forEach(el => el.classList.remove('defect'));
        updateAll();
    }
};
window.expandAllSections = () => document.querySelectorAll('.section-container:not(.expanded)').forEach(el => _internalToggleSection(el));
window.collapseAllSections = () => document.querySelectorAll('.section-container.expanded').forEach(el => _internalToggleSection(el));
window.copyReportToClipboard = () => {
    navigator.clipboard.writeText(document.getElementById('stickyContent').textContent)
        .then(() => alert('Informe copiado.'))
        .catch(() => alert('Error al copiar.'));
};
window.printReport = () => {
    const content = document.getElementById('stickyContent').textContent;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<pre>${content}</pre>`);
    printWindow.document.close();
    printWindow.print();
};
window.generateConclusion = () => {
    updateAll();
    const panel = document.getElementById('stickyReportPanel');
    if (!panel.classList.contains('active')) panel.classList.add('active');
};
window.toggleStickyPanel = () => document.getElementById('stickyReportPanel').classList.toggle('active');
window.handleNoComplaints = () => {
    const isDisabled = isChecked('sin-quejas-oftalmo');
    document.querySelectorAll('#anamnesis-section .sub-section-card:first-of-type input:not(#sin-quejas-oftalmo)').forEach(el => {
        el.disabled = isDisabled;
        if (isDisabled) el.checked = false;
    });
    const painCheckbox = document.getElementById('dolor-ocular');
    if (painCheckbox) painCheckbox.dispatchEvent(new Event('change'));
    updateAll();
};
window.handleMutuallyExclusive = (id1, id2, el) => {
    if (el.checked) {
        const otherEl = document.getElementById(el.id === id1 ? id2 : id1);
        if (otherEl) otherEl.checked = false;
    }
    updateAll();
};
window.toggleOphthalmologySubMenu = (event) => {
    event.preventDefault();
    const subMenu = document.getElementById('specialty-sub-menu');
    const link = document.getElementById('specialty-nav-link');
    link.classList.toggle('active');
    subMenu.style.maxHeight = link.classList.contains('active') ? subMenu.scrollHeight + 'px' : '0';
};
