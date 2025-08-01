/**
 * Script para la Evaluación Musculoesquelética Integral - Versión Narrativa
 *
 * Este script maneja la lógica completa para un formulario de evaluación musculoesquelética altamente detallado.
 * Responsabilidades:
 * 1.  Gestión de la interfaz de usuario: paneles, secciones colapsables, tema.
 * 2.  Captura y procesamiento de cientos de puntos de datos, incluyendo ROM, MRC, reflejos y pruebas especiales.
 * 3.  Actualización de un panel de control superior con métricas clave en tiempo real.
 * 4.  Generación de un informe clínico narrativo exhaustivo que refleja cada selección del usuario.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Adjuntar listeners a todos los inputs para la actualización en tiempo real.
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', updateAll);
        el.addEventListener('input', updateAll);
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
    calculateAllMetrics();
    updateDashboard();
    // NOTA: La generación de resúmenes narrativos en los textareas se elimina para que sea entrada manual del usuario.
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
 * Llama a todas las funciones de cálculo de métricas específicas.
 */
function calculateAllMetrics() {
    calculateSchober();
}

/**
 * Construye el texto completo del informe narrativo.
 */
function generateFullReport() {
    let report = "INFORME DE EVALUACIÓN MUSCULOESQUELÉTICA\n";
    report += "==========================================\n\n";

    report += getSectionText('ANAMNESIS (ALICIA)', getAliciaData());
    report += getSectionText('QUEJAS PRINCIPALES', getComplaintsData());
    report += getSectionText('COLUMNA VERTEBRAL', getSpineData());
    report += getSectionText('EXTREMIDADES SUPERIORES', getUpperExtremitiesData());
    report += getSectionText('EXTREMIDADES INFERIORES', getLowerExtremitiesData());
    report += getSectionText('INFORME NARRATIVO DEL FACULTATIVO', getNarrativeInputs());

    const filledInputs = document.querySelectorAll('input:checked, input[type="text"][value]:not([value=""]), input[type="number"][value]:not([value=""]), select:not([value=""])');
    if (filledInputs.length < 2) {
        report = 'Seleccione los parámetros del examen para generar la conclusión...';
    }
    
    document.getElementById('reportContent').textContent = report.trim();
}

// ===================================================================
// FUNCIONES DE RECOPILACIÓN DE DATOS PARA EL INFORME NARRATIVO
// ===================================================================

function getAliciaData() {
    let sentences = [];
    const localizacion = Array.from(document.getElementById('localizacion-select').selectedOptions).map(opt => opt.text);
    if (localizacion.length > 0) {
        sentences.push(`Paciente consulta por dolor localizado en ${listToSentence(localizacion)}.`);
    }

    const aparicion = getCheckedLabelsFromContainer('#section-alicia-anamnesis .alicia-item:nth-of-type(1)');
    const aparicionOther = getInputValue('aparicion-other').trim();
    if (aparicion.length > 0 || aparicionOther) {
        let text = `El cuadro tuvo una aparición ${listToSentence(aparicion)}`;
        if (aparicionOther) text += ` (${aparicionOther})`;
        sentences.push(text + ".");
    }

    const caracter = getCheckedLabelsFromContainer('#section-alicia-anamnesis .alicia-item:nth-of-type(4)');
    const intensidad = getInputValue('pain-intensity');
    if (caracter.length > 0 || intensidad) {
        let text = "El dolor es de carácter " + (caracter.length > 0 ? listToSentence(caracter) : "no especificado");
        if (intensidad) text += `, con una intensidad de ${intensidad}/10`;
        sentences.push(text + ".");
    }
    
    const irradiacion = getCheckedLabelsFromContainer('#section-alicia-anamnesis .alicia-item:nth-of-type(3)');
    const irradiacionOther = getInputValue('irradiacion-other').trim();
    if (irradiacion.length > 0 && !isChecked('irradiacion-ninguna')) {
        let text = `Se irradia hacia ${listToSentence(irradiacion)}`;
        if (irradiacionOther) text += ` (${irradiacionOther})`;
        sentences.push(text + ".");
    }

    const agravantes = getCheckedLabelsFromContainer('#section-alicia-anamnesis .alicia-item:nth-of-type(6)');
    if (agravantes.length > 0) sentences.push(`Se agrava con ${listToSentence(agravantes)}.`);
    
    const atenuantes = getCheckedLabelsFromContainer('#section-alicia-anamnesis .alicia-item:nth-of-type(7)');
    if (atenuantes.length > 0) sentences.push(`Mejora con ${listToSentence(atenuantes)}.`);

    const temporalidad = getCheckedLabelsFromContainer('#section-alicia-anamnesis .alicia-item:nth-of-type(8)');
    if (temporalidad.length > 0) sentences.push(`En cuanto a la temporalidad, el dolor es ${listToSentence(temporalidad)}.`);

    return sentences.length > 0 ? sentences.join(' ') : "No se especificaron detalles del dolor.";
}

function getComplaintsData() {
    if (isChecked('no-complaints')) {
        return "Paciente no refiere quejas musculoesqueléticas específicas en el momento de la evaluación.";
    }
    const complaints = getCheckedLabelsFromContainer('#section-general-inspection .sub-section-card');
    return complaints.length > 0 ? `El paciente refiere ${listToSentence(complaints, true)}.` : "No se seleccionaron quejas principales.";
}

function getSpineData() {
    let sentences = [];
    
    // Inspección
    if (isChecked('spine-normal')) {
        sentences.push("A la inspección, la columna vertebral presenta curvaturas fisiológicas conservadas, sin deformidades evidentes.");
    } else {
        const alterations = getCheckedLabelsFromContainer('#section-spine .sub-section-card:first-of-type');
        if (alterations.length > 0) {
            sentences.push(`A la inspección, se observan alteraciones estructurales en la columna, incluyendo ${listToSentence(alterations)}.`);
        }
    }

    // ROM
    const cervicalRom = getRomNarrative('Cervical', ['Flexión', 'Extensión', 'Inclinación Lat.', 'Rotación'], 'cervical-active', 'cervical-passive');
    if (cervicalRom) sentences.push(cervicalRom);
    const thoracicRom = getRomNarrative('Torácica', ['Flexión', 'Extensión', 'Rotación'], 'thoracic-active', 'thoracic-passive');
    if (thoracicRom) sentences.push(thoracicRom);
    const lumbarRom = getRomNarrative('Lumbar', ['Flexión', 'Extensión', 'Inclinación Lat.'], 'lumbar-active', 'lumbar-passive');
    if (lumbarRom) sentences.push(lumbarRom);

    // Pruebas especiales
    let specialTests = [];
    const schober = document.getElementById('schober-result').textContent;
    if (schober) specialTests.push(`la prueba de Schober es de ${schober}`);
    if (isChecked('tension-positive')) specialTests.push("el signo de Lasègue es positivo");
    if (isChecked('tension-negative')) specialTests.push("el signo de Lasègue es negativo");
    if (specialTests.length > 0) sentences.push(`En pruebas especiales, ${listToSentence(specialTests)}.`);

    // Fuerza y Neuro
    const cervicalMrc = getMRCNarrative('cervical (MMSS)', [{ id: 'cervical-flexors' }, { id: 'cervical-extensors' }, { id: 'deltoid' }, { id: 'biceps' }, { id: 'triceps' }, { id: 'interossei' }]);
    if (cervicalMrc) sentences.push(cervicalMrc);
    const cervicalNeuro = getNeuroNarrative('cervical (MMSS)', [{ id: 'bicipital' }, { id: 'tricipital' }, { id: 'cervical-sensation' }]);
    if (cervicalNeuro) sentences.push(cervicalNeuro);
    
    const lumbarMrc = getMRCNarrative('lumbar (MMII)', [{ id: 'hip-flexors' }, { id: 'knee-extensors' }, { id: 'ankle-dorsiflexors' }, { id: 'hallux-extensor' }, { id: 'plantar-flexors' }]);
    if (lumbarMrc) sentences.push(lumbarMrc);
    const lumbarNeuro = getNeuroNarrative('lumbar (MMII)', [{ id: 'patellar' }, { id: 'achilles' }, { id: 'lumbar-sensation' }]);
    if (lumbarNeuro) sentences.push(lumbarNeuro);

    return sentences.length > 0 ? sentences.join(' ') : "No se realizaron evaluaciones en la columna vertebral.";
}

function getUpperExtremitiesData() {
    let sentences = [];
    sentences.push(getJointNarrative('Hombros', 'shoulder', ['Flexión', 'Abducción', 'Rotación Externa', 'Rotación Interna'], 
        [{ id: 'shoulder-deltoid' }, { id: 'biceps-shoulder' }, { id: 'triceps-shoulder' }, { id: 'shoulder-rotator' }],
        [{ id: 'painful-arc' }, { id: 'hawkins' }, { id: 'neer' }, { id: 'drop-arm' }, { id: 'jobe' }]
    ));
    sentences.push(getJointNarrative('Codos', 'elbow', ['Flexión', 'Extensión', 'Pronación', 'Supinación'], [], 
        [{ id: 'lateral-epicond' }, { id: 'medial-epicond' }]
    ));
    sentences.push(getJointNarrative('Muñecas y Manos', 'wrist', ['Flexión', 'Extensión', 'Desviación Radial', 'Desviación Ulnar'], [], 
        [{ id: 'finkelstein' }, { id: 'tinel' }, { id: 'phalen' }]
    ));
    return sentences.filter(Boolean).join('\n\n');
}

function getLowerExtremitiesData() {
    let sentences = [];
    sentences.push(getJointNarrative('Caderas', 'hip', ['Flexión', 'Extensión', 'Abducción', 'Aducción'], [], 
        [{ id: 'trendelenburg' }, { id: 'patrick' }, { id: 'thomas' }]
    ));
    sentences.push(getJointNarrative('Rodillas', 'knee', ['Flexión', 'Extensión'], [], 
        [{ id: 'anterior-drawer' }, { id: 'lachman' }, { id: 'mcmurray-medial' }, { id: 'mcmurray-lateral' }]
    ));
    sentences.push(getJointNarrative('Tobillos y Pies', 'ankle', ['Dorsiflexión', 'Flexión Plantar', 'Inversión', 'Eversión'], [], 
        [{ id: 'ankle-drawer' }, { id: 'talar-tilt' }, { id: 'thompson' }]
    ));
    return sentences.filter(Boolean).join('\n\n');
}

function getNarrativeInputs() {
    const sections = [
        { label: "Párrafo de Apertura", id: "narrative-opening" },
        { label: "Hallazgos de Columna Vertebral", id: "spine-narrative" },
        { label: "Hallazgos de Extremidades Superiores", id: "upper-extremity-narrative" },
        { label: "Hallazgos de Extremidades Inferiores", id: "lower-extremity-narrative" },
        { label: "Hallazgos Neurológicos Asociados", id: "neurological-narrative" },
        { label: "Negativos Pertinentes", id: "negatives-text" }
    ];
    let text = "";
    sections.forEach(section => {
        const value = getInputValue(section.id).trim();
        if (value) {
            text += `\n**${section.label}:**\n${value}\n`;
        }
    });
    return text;
}

function getFinalSummary() {
    return "\n\n**CONCLUSIÓN Y PLAN**\n" +
           "---------------------\n" +
           "[Integrar aquí la impresión diagnóstica principal y los diagnósticos diferenciales.]\n\n" +
           "Plan de manejo sugerido:\n" +
           "1.  **Estudios Complementarios:** [Ej: Radiografías, RMN, analítica con marcadores inflamatorios].\n" +
           "2.  **Tratamiento:** [Ej: Fisioterapia, AINEs, recomendaciones ergonómicas].\n" +
           "3.  **Seguimiento:** [Cita de reevaluación en X semanas].\n";
}

// ===================================================================
// FUNCIONES DE CÁLCULO DE MÉTRICAS
// ===================================================================
function calculateSchober() {
    const initial = parseFloat(getInputValue('schober-initial'));
    const final = parseFloat(getInputValue('schober-final'));
    const resultEl = document.getElementById('schober-result');
    if (!isNaN(initial) && !isNaN(final)) {
        const diff = final - initial;
        let text = `${diff.toFixed(1)} cm`;
        if (diff < 5) text += ' (Limitado)';
        else text += ' (Normal)';
        resultEl.textContent = text;
        resultEl.style.color = diff >= 5 ? 'var(--normal-color)' : 'var(--alert-color)';
    } else {
        resultEl.textContent = '';
    }
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
    let mrcScores = [];

    sections.forEach(section => {
        const inputs = section.querySelectorAll('input:checked, input[type="text"][value]:not([value=""]), input[type="number"][value]:not([value=""]), select:not([value=""])');
        if (inputs.length > 0) completedSections++;
        findingsCount += inputs.length;
    });

    // Alerts
    if (getInputValue('pain-intensity') >= 8) alertCount++;
    if (isChecked('tension-positive')) alertCount++;
    document.querySelectorAll('.mrc-select').forEach(sel => {
        if (sel.value !== "" && parseInt(sel.value) <= 2) alertCount++;
        if (sel.value !== "") mrcScores.push(parseInt(sel.value));
    });
    document.querySelectorAll('input[id*="-pos"]:checked').forEach(cb => {
        const testName = getLabelText(cb.id.replace('-pos', ''));
        if (['Lachman', 'Thompson', 'Caída del brazo'].includes(testName)) alertCount++;
    });

    // Warnings
    if (getInputValue('pain-intensity') >= 5 && getInputValue('pain-intensity') < 8) warningCount++;
    document.querySelectorAll('.mrc-select').forEach(sel => {
        if (sel.value === "3") warningCount++;
    });
    if (document.getElementById('schober-result').textContent.includes('Limitado')) warningCount++;

    const progress = sections.length > 0 ? Math.round((completedSections / sections.length) * 100) : 0;
    
    document.getElementById('exam-progress').textContent = `${progress}%`;
    document.getElementById('sections-completed').textContent = `${sections.length > 0 ? completedSections + "/" + sections.length : '10'}`;
    document.getElementById('alert-count').textContent = alertCount;
    document.getElementById('warning-count').textContent = warningCount;
    document.getElementById('findings-count').textContent = findingsCount;
    
    const muscleStatusEl = document.getElementById('muscle-strength-status');
    if (mrcScores.length === 0) {
        muscleStatusEl.textContent = 'Pendiente';
        muscleStatusEl.parentElement.className = 'dashboard-item sub-section-card';
    } else {
        const avgMrc = mrcScores.reduce((a, b) => a + b, 0) / mrcScores.length;
        if (avgMrc < 3.5) {
            muscleStatusEl.textContent = 'Déficit Severo';
            muscleStatusEl.parentElement.className = 'dashboard-item sub-section-card dashboard-alert';
        } else if (avgMrc < 4.5) {
            muscleStatusEl.textContent = 'Déficit Leve';
            muscleStatusEl.parentElement.className = 'dashboard-item sub-section-card dashboard-warning';
        } else {
            muscleStatusEl.textContent = 'Normal';
            muscleStatusEl.parentElement.className = 'dashboard-item sub-section-card dashboard-normal';
        }
    }
}

// ===================================================================
// FUNCIONES AUXILIARES Y DE UI
// ===================================================================
function getInputValue(id) { return document.getElementById(id)?.value || ''; }
function isChecked(id) { return document.getElementById(id)?.checked || false; }
function getLabelText(id) { return document.querySelector(`label[for="${id}"]`)?.textContent.trim() || ''; }
function getCheckedLabelsFromContainer(selector) {
    const container = document.querySelector(selector);
    if (!container) return [];
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => getLabelText(cb.id))
        .filter(Boolean);
}
function listToSentence(arr, capitalize = false) {
    if (!arr || arr.length === 0) return "";
    let items = capitalize ? arr.map(item => item.charAt(0).toUpperCase() + item.slice(1)) : arr;
    if (items.length === 1) return items[0];
    return items.slice(0, -1).join(', ') + ' y ' + items.slice(-1);
}
function getSectionText(title, content) {
    return (content && content.trim()) ? `**${title}**\n${content.trim()}\n\n` : "";
}

function getRomNarrative(name, movements, activePrefix, passivePrefix) {
    let limitedMovements = [];
    let hasValues = false;
    movements.forEach(mov => {
        const idSuffix = mov.replace(/\s+/g, '-').toLowerCase();
        const activeVal = getInputValue(`${activePrefix}-${idSuffix}`);
        const passiveVal = getInputValue(`${passivePrefix}-${passivePrefix}`);
        if (activeVal || passiveVal) {
            hasValues = true;
            // Simplified logic: assumes normal values from placeholder/span in HTML
            // A more robust version would compare against a map of normal values.
            // For now, just list any entered value as a finding.
            limitedMovements.push(`${mov.toLowerCase()} (Act: ${activeVal || 'N/A'}°, Pas: ${passiveVal || 'N/A'}°)`);
        }
    });
    if (!hasValues) return "";
    return `El rango de movimiento ${name.toLowerCase()} presenta las siguientes características: ${listToSentence(limitedMovements)}.`;
}

function getMRCNarrative(name, muscles) {
    let deficits = [];
    muscles.forEach(muscle => {
        const valR = getInputValue(`${muscle.id}-r-mrc`);
        const valL = getInputValue(`${muscle.id}-l-mrc`);
        if (valR && parseInt(valR) < 5) deficits.push(`${getLabelText(muscle.id + '-r-mrc')} derecho (${valR}/5)`);
        if (valL && parseInt(valL) < 5) deficits.push(`${getLabelText(muscle.id + '-l-mrc')} izquierdo (${valL}/5)`);
    });
    if (deficits.length === 0) {
        if (muscles.some(m => getInputValue(`${m.id}-r-mrc`) || getInputValue(`${m.id}-l-mrc`))) {
            return `La fuerza muscular en el segmento ${name} se encuentra conservada (5/5).`;
        }
        return "";
    }
    return `En la evaluación de fuerza del segmento ${name}, se objetiva déficit en: ${listToSentence(deficits)}.`;
}

function getNeuroNarrative(name, items) {
    let findings = [];
    items.forEach(item => {
        const valR = isChecked(`${item.id}-r-altered`) ? 'alterado' : (isChecked(`${item.id}-r-normal`) ? 'normal' : '');
        const valL = isChecked(`${item.id}-l-altered`) ? 'alterado' : (isChecked(`${item.id}-l-normal`) ? 'normal' : '');
        if (valR === 'alterado') findings.push(`${getLabelText(item.id + '-r-normal')} derecho alterado`);
        if (valL === 'alterado') findings.push(`${getLabelText(item.id + '-l-normal')} izquierdo alterado`);
    });
     if (findings.length === 0) {
        if (items.some(i => isChecked(`${i.id}-r-normal`) || isChecked(`${i.id}-l-normal`))) {
            return `El examen neurológico del segmento ${name} se encuentra dentro de la normalidad.`;
        }
        return "";
    }
    return `En el examen neurológico del segmento ${name}, se encuentran los siguientes hallazgos: ${listToSentence(findings)}.`;
}

function getJointNarrative(name, idPrefix, romMovements, mrcMuscles, specialTests) {
    let sentences = [];
    // Inspección
    if (isChecked(`${idPrefix}s-normal`)) {
        sentences.push(`A la inspección de ${name.toLowerCase()}, no se aprecian hallazgos patológicos.`);
    } else {
        const findings = getCheckedLabelsFromContainer(`#section-${idPrefix}-joints .sub-section-card:first-of-type`);
        if (findings.length > 0) {
            sentences.push(`A la inspección de ${name.toLowerCase()}, se evidencia ${listToSentence(findings)}.`);
        }
    }
    // Bilateral Data
    ['r', 'l'].forEach(side => {
        const sideName = side === 'r' ? 'derecho/a' : 'izquierdo/a';
        let sideSentences = [];
        // ROM
        let limitedRom = [];
        romMovements.forEach(mov => {
            const idSuffix = mov.replace(/\s+/g, '-').toLowerCase();
            const activeVal = getInputValue(`${idPrefix}-${side}-active-${idSuffix}`);
            if (activeVal) limitedRom.push(`${mov.toLowerCase()} a ${activeVal}°`);
        });
        if (limitedRom.length > 0) sideSentences.push(`presenta limitación en el rango de movimiento activo para ${listToSentence(limitedRom)}`);

        // MRC
        let mrcDeficits = [];
        mrcMuscles.forEach(muscle => {
            const val = getInputValue(`${muscle.id}-${side}-mrc`);
            if (val && parseInt(val) < 5) {
                mrcDeficits.push(`${getLabelText(muscle.id + '-r-mrc')} (${val}/5)`);
            }
        });
        if (mrcDeficits.length > 0) sideSentences.push(`con déficit de fuerza en ${listToSentence(mrcDeficits)}`);

        // Pruebas especiales
        let positiveTests = [];
        specialTests.forEach(test => {
            if (isChecked(`${test.id}-${side}-pos`)) {
                positiveTests.push(getLabelText(test.id + '-r-pos'));
            }
        });
        if (positiveTests.length > 0) sideSentences.push(`y las siguientes pruebas especiales positivas: ${listToSentence(positiveTests)}`);

        if (sideSentences.length > 0) {
            sentences.push(`El/La ${name.slice(0, -1).toLowerCase()} ${sideName} ${listToSentence(sideSentences)}.`);
        }
    });
    
    return sentences.length > 0 ? sentences.join(' ') : `No se evaluó la articulación de ${name.toLowerCase()}.`;
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
        document.querySelectorAll('.intensity-number.selected').forEach(el => el.classList.remove('selected'));
        updateAll();
    }
};
window.expandAllSections = () => document.querySelectorAll('.section-container:not(.expanded)').forEach(el => _internalToggleSection(el));
window.collapseAllSections = () => document.querySelectorAll('.section-container.expanded').forEach(el => _internalToggleSection(el));
window.copyReportToClipboard = () => {
    navigator.clipboard.writeText(document.getElementById('reportContent').textContent)
        .then(() => alert('Informe copiado.'))
        .catch(() => alert('Error al copiar.'));
};
window.printReport = () => {
    const content = document.getElementById('reportContent').textContent;
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
    const isDisabled = isChecked('no-complaints');
    document.querySelectorAll('#section-general-inspection input:not(#no-complaints)').forEach(el => {
        el.disabled = isDisabled;
        if (isDisabled) el.checked = false;
    });
    updateAll();
};
window.handleMutuallyExclusive = (id1, id2, el) => {
    if (el.checked) {
        const otherEl = document.getElementById(el.id === id1 ? id2 : id1);
        if (otherEl) otherEl.checked = false;
    }
    updateAll();
};
window.selectIntensity = (value) => {
    document.querySelectorAll('.intensity-number').forEach(el => el.classList.remove('selected'));
    event.target.classList.add('selected');
    document.getElementById('pain-intensity').value = value;
    updateAll();
};
window.toggleMusculoskeletalSubMenu = (event) => {
    event.preventDefault();
    const subMenu = document.getElementById('specialty-sub-menu');
    const link = document.getElementById('specialty-nav-link');
    link.classList.toggle('active');
    subMenu.style.maxHeight = link.classList.contains('active') ? subMenu.scrollHeight + 'px' : '0';
};
