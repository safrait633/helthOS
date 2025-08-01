// ========== VARIABLES GLOBALES Y CONSTANTES ==========
let examProgress = 0;
let sectionsCompleted = 0;
let alertCount = 0;
let warningCount = 0;
let findingsCount = 0;

// Constantes de diseño
const MAIN_SIDEBAR_WIDTH = 250;
const COLLAPSED_SIDEBAR_WIDTH = 80;
const REPORT_PANEL_WIDTH = 400;

// ========== FUNCIONES DE UTILIDAD GENERAL ==========

function getInputValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

function isChecked(id) {
    const element = document.getElementById(id);
    return element ? element.checked : false;
}

function getLabelText(forId) {
    const label = document.querySelector(`label[for="${forId}"]`);
    return label ? label.textContent.trim().toLowerCase() : '';
}

function getSelectedText(id) {
    const select = document.getElementById(id);
    if (!select) return '';
    const selectedOption = select.options[select.selectedIndex];
    return selectedOption ? selectedOption.text : '';
}

function getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.id : '';
}

function buildNarrative(items, separator = ', ', lastSeparator = ' y ') {
    if (!items || items.length === 0) return '';
    if (items.length === 1) return items[0];
    const last = items.pop();
    return items.join(separator) + lastSeparator + last;
}

// ========== FUNCIONES DE INTERFAZ DE USUARIO (TEMA, NAVEGACIÓN, PANELES) ==========

function toggleTheme() {
    document.body.toggleAttribute('data-theme');
    localStorage.setItem('theme', document.body.hasAttribute('data-theme') ? 'dark' : 'light');
    document.getElementById('theme-icon').className = document.body.hasAttribute('data-theme') ? 'fas fa-sun' : 'fas fa-moon';
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768) {
        sidebar.classList.toggle('collapsed');
    } else {
        sidebar.classList.toggle('open');
    }
    updateLayout();
}

function toggleSection(headerElement) {
    const sectionContainer = headerElement.closest('.section-container');
    sectionContainer.classList.toggle('expanded');
    const content = sectionContainer.querySelector('.section-content-main');
    content.style.maxHeight = sectionContainer.classList.contains('expanded') ? `${content.scrollHeight}px` : '0px';
}

function toggleStickyPanel() {
    const panel = document.getElementById('stickyReportPanel');
    panel.classList.toggle('active');
    updateLayout();
    if (panel.classList.contains('active')) {
        generateReport();
    }
}

function updateLayout() {
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('contentArea');
    const topBar = document.getElementById('topBar');
    const stickyPanel = document.getElementById('stickyReportPanel');

    let sidebarWidth = (window.innerWidth <= 768) ? 0 : (sidebar.classList.contains('collapsed') ? COLLAPSED_SIDEBAR_WIDTH : MAIN_SIDEBAR_WIDTH);
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) sidebarWidth = MAIN_SIDEBAR_WIDTH;
    
    let reportPanelWidth = (stickyPanel.classList.contains('active') && window.innerWidth > 768) ? REPORT_PANEL_WIDTH : 0;
    
    contentArea.style.marginLeft = `${sidebarWidth}px`;
    contentArea.style.marginRight = `${reportPanelWidth}px`;
    topBar.style.left = `${sidebarWidth}px`;
    topBar.style.width = `calc(100% - ${sidebarWidth + reportPanelWidth}px)`;
}

function toggleRheumaSubMenu(event) {
    if (event) event.preventDefault();
    
    const rheumaNavLink = document.getElementById('specialty-nav-link');
    const rheumaSubMenu = document.getElementById('specialty-sub-menu');

    if (!rheumaNavLink || !rheumaSubMenu) return;

    rheumaNavLink.classList.toggle('active');

    if (rheumaNavLink.classList.contains('active')) {
        rheumaSubMenu.style.maxHeight = rheumaSubMenu.scrollHeight + 'px';
    } else {
        rheumaSubMenu.style.maxHeight = '0';
    }

    document.querySelectorAll('.nav-link.active:not(#specialty-nav-link)').forEach(otherLink => {
        otherLink.classList.remove('active');
        const otherSubMenu = otherLink.nextElementSibling;
        if (otherSubMenu?.classList.contains('sub-menu')) {
            otherSubMenu.style.maxHeight = '0';
        }
    });

    updateLayout();
}

function scrollToSection(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (!section.classList.contains('expanded')) {
            toggleSection(section.querySelector('.section-header-main'));
        }
    }
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
    updateLayout();
}

// ========== FUNCIONES DE CÁLCULO Y EVALUACIÓN REUMATOLÓGICA ==========

function updateDolorValue(type, value) {
    const valueEl = document.getElementById(`dolor-${type}-value`);
    if (valueEl) {
        valueEl.textContent = value;
    }
}

function evaluateStiffness() {
    const duration = parseFloat(getInputValue('rigidez-duracion'));
    const interpretEl = document.getElementById('interpretacion-rigidez');
    if (isNaN(duration) || duration === 0) {
        interpretEl.textContent = '--';
        interpretEl.className = 'score-value';
        return;
    }
    if (duration >= 60) {
        interpretEl.textContent = 'Sugestivo de proceso inflamatorio';
        interpretEl.className = 'score-value positive';
    } else if (duration >= 30) {
        interpretEl.textContent = 'Leve';
        interpretEl.className = 'score-value warning';
    } else {
        interpretEl.textContent = 'Normal';
        interpretEl.className = 'score-value negative';
    }
}

function calculateDAS28() {
    const tender = parseFloat(getInputValue('das28-tender')) || 0;
    const swollen = parseFloat(getInputValue('das28-swollen')) || 0;
    const esr = parseFloat(getInputValue('das28-esr')) || 1; // Evitar log(0)
    const vas = parseFloat(getInputValue('das28-vas')) || 0;
    const scoreEl = document.getElementById('das28-score');
    const interpEl = document.getElementById('das28-interpretation');

    if (tender === 0 && swollen === 0 && getInputValue('das28-esr') === '' && vas === 0) {
        scoreEl.textContent = '--';
        interpEl.textContent = '--';
        interpEl.className = 'score-value';
        return;
    }
    
    const das28 = 0.56 * Math.sqrt(tender) + 0.28 * Math.sqrt(swollen) + 0.70 * Math.log(esr) + 0.014 * vas;
    scoreEl.textContent = das28.toFixed(2);

    if (das28 >= 5.1) {
        interpEl.textContent = 'Actividad alta';
        interpEl.className = 'score-value positive';
    } else if (das28 >= 3.2) {
        interpEl.textContent = 'Actividad moderada';
        interpEl.className = 'score-value warning';
    } else if (das28 >= 2.6) {
        interpEl.textContent = 'Actividad baja';
        interpEl.className = 'score-value negative';
    } else {
        interpEl.textContent = 'Remisión';
        interpEl.className = 'score-value negative';
    }
}

function calculateHAQ() {
    const categories = ['dressing', 'arising', 'eating', 'walking', 'hygiene', 'reach', 'grip', 'activities'];
    const values = categories.map(cat => parseFloat(getInputValue(`haq-${cat}`))).filter(v => !isNaN(v));
    const scoreEl = document.getElementById('haq-score');
    const interpEl = document.getElementById('haq-interpretation');

    if (values.length === 0) {
        scoreEl.textContent = '--';
        interpEl.textContent = '--';
        interpEl.className = 'score-value';
        return;
    }
    
    const haqScore = values.reduce((a, b) => a + b, 0) / values.length;
    scoreEl.textContent = haqScore.toFixed(2);

    if (haqScore >= 2.0) {
        interpEl.textContent = 'Discapacidad severa';
        interpEl.className = 'score-value positive';
    } else if (haqScore >= 1.0) {
        interpEl.textContent = 'Discapacidad moderada a severa';
        interpEl.className = 'score-value warning';
    } else if (haqScore >= 0.5) {
        interpEl.textContent = 'Discapacidad leve a moderada';
        interpEl.className = 'score-value warning';
    } else {
        interpEl.textContent = 'Discapacidad leve/ninguna';
        interpEl.className = 'score-value negative';
    }
}

function calculateTenderPoints() {
    const count = document.querySelectorAll('#section-disease-activity .tender-point input:checked').length;
    document.getElementById('tender-points-count').textContent = count;
    const interpEl = document.getElementById('tender-points-interpretation');
    if (count >= 11) {
        interpEl.textContent = 'Criterio de 1990 positivo (≥11/18)';
        interpEl.className = 'score-value positive';
    } else {
        interpEl.textContent = 'Criterio de 1990 negativo (<11/18)';
        interpEl.className = 'score-value negative';
    }
}

function calculateFibromyalgia() {
    const wpi = parseFloat(getInputValue('fibro-wpi')) || 0;
    const fatiga = parseFloat(getInputValue('fibro-fatiga')) || 0;
    const sueno = parseFloat(getInputValue('fibro-sueno')) || 0;
    const cognitivo = parseFloat(getInputValue('fibro-cognitivo')) || 0;
    const somaticos = ['fibro-cefalea', 'fibro-dolor-abdominal', 'fibro-depresion'].filter(isChecked).length;
    
    document.getElementById('fibro-somaticos-count').textContent = somaticos;
    const sss = fatiga + sueno + cognitivo + Math.min(somaticos, 3);
    
    document.getElementById('fibro-wpi-score').textContent = wpi;
    document.getElementById('fibro-sss-score').textContent = sss;
    
    const interpEl = document.getElementById('fibro-diagnosis');
    if ((wpi >= 7 && sss >= 5) || (wpi >= 4 && wpi <= 6 && sss >= 9)) {
        interpEl.textContent = 'SÍ - Cumple criterios ACR 2016';
        interpEl.className = 'score-value positive';
    } else {
        interpEl.textContent = 'NO - No cumple criterios ACR 2016';
        interpEl.className = 'score-value negative';
    }
}

function calculateARCriteria() {
    let score = 0;
    const artValue = getRadioValue('ar-articulaciones');
    if (artValue) score += parseInt(document.getElementById(artValue).value);
    
    const seroValue = getRadioValue('ar-serologia');
    if (seroValue) score += parseInt(document.getElementById(seroValue).value);

    const reacValue = getRadioValue('ar-reactantes');
    if (reacValue) score += parseInt(document.getElementById(reacValue).value);

    const durValue = getRadioValue('ar-duracion');
    if (durValue) score += parseInt(document.getElementById(durValue).value);

    document.getElementById('ar-score').textContent = score;
    const interpEl = document.getElementById('ar-interpretation');
    if (score >= 6) {
        interpEl.textContent = 'Cumple criterios para Artritis Reumatoide';
        interpEl.className = 'score-value positive';
    } else {
        interpEl.textContent = 'No cumple criterios para Artritis Reumatoide';
        interpEl.className = 'score-value negative';
    }
}

function calculateSchober() {
    const inicial = parseFloat(getInputValue('schober-inicial'));
    const final = parseFloat(getInputValue('schober-final'));
    const resultEl = document.getElementById('schober-resultado');
    if (!isNaN(inicial) && !isNaN(final)) {
        const diff = final - inicial;
        resultEl.textContent = `${diff.toFixed(1)} cm`;
        resultEl.className = (diff >= 5) ? 'negative' : 'positive';
    } else {
        resultEl.textContent = '';
        resultEl.className = '';
    }
}

// ========== GENERACIÓN DE INFORME NARRATIVO ==========

function getAnamnesisNarrative() {
    let narrative = '';
    if (isChecked('sin-quejas-reuma')) {
        return 'Paciente asiste a control de rutina, se encuentra asintomático desde el punto de vista reumatológico.';
    }

    const complaints = ['dolor-articular', 'rigidez-matutina', 'inflamacion-articular', 'limitacion-funcional', 'fatiga', 'dolor-muscular', 'debilidad-muscular', 'dolor-lumbar', 'deformidades', 'fenomeno-raynaud', 'sequedad-ocular', 'rash-cutaneo'].filter(isChecked).map(getLabelText);
    if (complaints.length > 0) {
        narrative += `Paciente consulta por un cuadro clínico caracterizado por ${buildNarrative(complaints)}. `;
    }

    if (isChecked('dolor-articular')) {
        const dolorGeneral = getInputValue('dolor-general-intensidad');
        const dolorReposo = getInputValue('dolor-reposo-intensidad');
        const dolorMovimiento = getInputValue('dolor-movimiento-intensidad');
        const tipoDolor = getLabelText(getRadioValue('tipo-dolor-articular'));
        const patron = getLabelText(getRadioValue('patron-afectacion'));
        
        let painDetails = [];
        if (tipoDolor) painDetails.push(`de tipo ${tipoDolor}`);
        if (patron) painDetails.push(`con un patrón ${patron}`);

        let intensityDetails = [];
        if (dolorGeneral > 0) intensityDetails.push(`general de ${dolorGeneral}/10`);
        if (dolorReposo > 0) intensityDetails.push(`en reposo de ${dolorReposo}/10`);
        if (dolorMovimiento > 0) intensityDetails.push(`al movimiento de ${dolorMovimiento}/10`);

        if (intensityDetails.length > 0) {
            painDetails.push(`con una intensidad ${buildNarrative(intensityDetails)}`);
        }
        
        if (painDetails.length > 0) {
            narrative += `Se detallan las características del dolor articular: es ${buildNarrative(painDetails, ', ', ', ')}. `;
        }
    }

    if (isChecked('rigidez-matutina')) {
        const rigidez = getInputValue('rigidez-duracion');
        if (rigidez > 0) {
            narrative += `Presenta rigidez matutina de aproximadamente ${rigidez} minutos de duración, lo cual es ${document.getElementById('interpretacion-rigidez').textContent.toLowerCase()}. `;
        }
    }

    const systemic = ['fiebre', 'perdida-peso', 'fatiga-sistemica', 'sudoracion-nocturna', 'nodulos-subcutaneos', 'ulceras-orales', 'alopecia', 'fotosensibilidad'].filter(isChecked).map(getLabelText);
    if (systemic.length > 0) {
        narrative += `Asocia síntomas sistémicos como ${buildNarrative(systemic)}. `;
    }
    
    const familyHx = ['familia-artritis-reumatoide', 'familia-lupus', 'familia-espondiloartritis', 'familia-psoriasis', 'familia-enfermedad-inflamatoria'].filter(isChecked).map(id => getLabelText(id).replace('artritis reumatoide', 'AR').replace('lupus eritematoso sistémico', 'LES'));
    if (familyHx.length > 0) {
        narrative += `\nComo antecedentes familiares de relevancia, se destaca historia de ${buildNarrative(familyHx)}.`;
    }

    return narrative;
}

function getJointExamNarrative() {
    let narrative = '';
    const affectedJoints = { dolor: [], tumefaccion: [], limitacion: [] };
    const jointGroups = ['ifp2', 'ifp3', 'ifp4', 'ifp5', 'mcf1', 'mcf2', 'mcf3', 'mcf4', 'mcf5', 'muneca', 'hombro', 'codo', 'cadera', 'rodilla', 'tobillo'];
    const sides = { der: 'derecha', izq: 'izquierda' };

    jointGroups.forEach(group => {
        Object.keys(sides).forEach(side => {
            if (isChecked(`${group}-${side}-dolor`)) affectedJoints.dolor.push(`${group} ${sides[side]}`);
            if (isChecked(`${group}-${side}-tumefaccion`)) affectedJoints.tumefaccion.push(`${group} ${sides[side]}`);
            if (isChecked(`${group}-${side}-limitacion`)) affectedJoints.limitacion.push(`${group} ${sides[side]}`);
        });
    });

    if (affectedJoints.dolor.length > 0) narrative += `Se objetiva dolor a la palpación en ${affectedJoints.dolor.length} articulaciones: ${buildNarrative(affectedJoints.dolor)}. `;
    if (affectedJoints.tumefaccion.length > 0) narrative += `Se evidencia tumefacción en ${affectedJoints.tumefaccion.length} articulaciones: ${buildNarrative(affectedJoints.tumefaccion)}. `;
    if (affectedJoints.limitacion.length > 0) narrative += `Presenta limitación funcional en ${affectedJoints.limitacion.length} articulaciones: ${buildNarrative(affectedJoints.limitacion)}. `;

    const spinalSegments = { 'cervical-alto': 'cervical alta', 'cervical-bajo': 'cervical baja', 'toracica': 'torácica', 'lumbar': 'lumbar', 'sacroiliacas': 'sacroilíacas' };
    const affectedSpine = Object.keys(spinalSegments).filter(seg => isChecked(`${seg}-dolor`) || isChecked(`${seg}-limitacion`)).map(seg => spinalSegments[seg]);
    if (affectedSpine.length > 0) {
        narrative += `\nEn la columna vertebral, se encuentra afectación en la región ${buildNarrative(affectedSpine)}. `;
    }

    const schober = document.getElementById('schober-resultado').textContent;
    if (schober) {
        narrative += `La prueba de Schober muestra un resultado de ${schober}. `;
    }
    
    return narrative;
}

function getScalesNarrative() {
    let narrative = '';
    const das28Score = document.getElementById('das28-score').textContent;
    if (das28Score && das28Score !== '--') {
        narrative += `La escala DAS28 arroja un puntaje de ${das28Score}, lo que indica ${document.getElementById('das28-interpretation').textContent.toLowerCase()}. `;
    }
    const haqScore = document.getElementById('haq-score').textContent;
    if (haqScore && haqScore !== '--') {
        narrative += `El cuestionario HAQ muestra un puntaje de ${haqScore}, compatible con ${document.getElementById('haq-interpretation').textContent.toLowerCase()}. `;
    }
    return narrative;
}

function getSpecialTestsNarrative() {
    let narrative = '';
    const positiveTests = [];
    if (isChecked('fabere-pos')) positiveTests.push('FABERE');
    if (isChecked('gaenslen-pos')) positiveTests.push('Gaenslen');
    if (isChecked('tinel-der-pos') || isChecked('tinel-izq-pos')) positiveTests.push('Tinel');
    if (isChecked('phalen-der-pos') || isChecked('phalen-izq-pos')) positiveTests.push('Phalen');
    if (isChecked('mcmurray-der-pos') || isChecked('mcmurray-izq-pos')) positiveTests.push('McMurray');
    
    if (positiveTests.length > 0) {
        narrative += `Se encontraron maniobras especiales positivas: ${buildNarrative(positiveTests)}.`;
    }
    return narrative;
}

function getCriteriaNarrative() {
    let narrative = '';
    const arInterp = document.getElementById('ar-interpretation').textContent;
    if (arInterp !== '--') {
        narrative += `Criterios ACR/EULAR 2010 para Artritis Reumatoide: ${arInterp}. `;
    }
    const fibroInterp = document.getElementById('fibro-diagnosis').textContent;
    if (fibroInterp !== '--') {
        narrative += `Criterios de Fibromialgia ACR 2016: ${fibroInterp}.`;
    }
    return narrative;
}

function generateReport() {
    const reportContentEl = document.getElementById('reportContent');
    const conclusionTextEl = document.getElementById('conclusion-text');
    
    const sections = {
        "MOTIVO DE CONSULTA Y ANAMNESIS": getAnamnesisNarrative(),
        "EXAMEN FÍSICO ARTICULAR": getJointExamNarrative(),
        "ESCALAS DE ACTIVIDAD Y FUNCIONALIDAD": getScalesNarrative(),
        "PRUEBAS ESPECIALES": getSpecialTestsNarrative(),
        "CRITERIOS DIAGNÓSTICOS": getCriteriaNarrative()
    };

    let finalReport = 'INFORME DE EVALUACIÓN REUMATOLÓGICA\n\n';
    let hasContent = false;

    for (const [title, content] of Object.entries(sections)) {
        if (content && content.trim() !== '') {
            finalReport += `${title}:\n${content.trim()}\n\n`;
            hasContent = true;
        }
    }

    if (!hasContent) {
        finalReport = 'El informe se generará aquí a medida que completes los campos del examen...';
    } else {
        finalReport += '--- RESUMEN DE HALLAZGOS ---\n';
        finalReport += `• Alertas Críticas: ${alertCount}\n`;
        finalReport += `• Hallazgos de Atención: ${warningCount}\n\n`;
        finalReport += '--- IMPRESIÓN DIAGNÓSTICA Y PLAN ---\n[Pendiente de correlación clínica, laboratorial e imagenológica.]';
    }

    reportContentEl.textContent = finalReport;
    conclusionTextEl.textContent = finalReport;
}

// ========== FUNCIÓN PRINCIPAL DE ACTUALIZACIÓN ==========

function updateDashboard() {
    // 1. Ejecutar todos los cálculos
    evaluateStiffness();
    calculateDAS28();
    calculateHAQ();
    calculateTenderPoints();
    calculateFibromyalgia();
    calculateARCriteria();
    calculateSchober();

    // 2. Actualizar métricas del dashboard
    let currentAlerts = 0;
    let currentWarnings = 0;
    const allInputs = document.querySelectorAll('#mainContent input, #mainContent select, #mainContent textarea');
    let completedSectionsSet = new Set();

    allInputs.forEach(input => {
        const section = input.closest('.section-container');
        if (section && ( (input.type === 'checkbox' && input.checked) || (input.type === 'radio' && input.checked) || (input.value && input.value !== '0' && input.value !== '')) ) {
            completedSectionsSet.add(section.id);
        }
    });
    
    sectionsCompleted = completedSectionsSet.size;
    examProgress = Math.round((sectionsCompleted / 5) * 100);
    findingsCount = document.querySelectorAll('#mainContent input:checked').length;
    
    if (document.getElementById('das28-interpretation')?.textContent === 'Actividad alta') currentAlerts++;
    if (document.getElementById('ar-interpretation')?.textContent.includes('Cumple')) currentAlerts++;
    if (document.getElementById('schober-resultado')?.className.includes('positive')) currentAlerts++;
    
    if (document.getElementById('das28-interpretation')?.textContent === 'Actividad moderada') currentWarnings++;
    if (parseFloat(getInputValue('rigidez-duracion')) >= 30) currentWarnings++;
    
    alertCount = currentAlerts;
    warningCount = currentWarnings;

    // 3. Actualizar la UI del dashboard
    document.getElementById('exam-progress').textContent = `${examProgress}%`;
    document.getElementById('sections-completed').textContent = `${sectionsCompleted}/5`;
    document.getElementById('alert-count').textContent = alertCount;
    document.getElementById('warning-count').textContent = warningCount;
    document.getElementById('findings-count').textContent = findingsCount;
    document.getElementById('disease-activity-status').textContent = document.getElementById('das28-interpretation').textContent || 'Pendiente';
    
    document.getElementById('alerts-item').classList.toggle('dashboard-alert', alertCount > 0);
    document.getElementById('warnings-item').classList.toggle('dashboard-warning', warningCount > 0);

    // 4. Generar el informe narrativo
    generateReport();
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    // Cargar tema
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }

    // Event listeners
    window.addEventListener('resize', updateLayout);
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', updateDashboard);
        el.addEventListener('input', updateDashboard);
    });
    
    // Expandir primera sección
    const firstSectionHeader = document.querySelector('.section-header-main');
    if (firstSectionHeader) {
        toggleSection(firstSectionHeader);
    }
    
    // Llamadas iniciales
    updateLayout();
    updateDashboard();

    console.log('🎉 Sistema de Evaluación Reumatológica HealthOS cargado y corregido!');
});
