/**
 * Script para la Evaluación Otorrinolaringológica Integral - Versión Narrativa (Corregido y Funcional)
 *
 * Este script maneja la lógica completa para un formulario de evaluación de ORL altamente detallado.
 * Responsabilidades:
 * 1.  Gestión de la interfaz de usuario: paneles, secciones colapsables, tema.
 * 2.  Cálculo en tiempo real de todas las escalas (PTP, DHI, Epworth, GRBAS).
 * 3.  Actualización de un panel de control superior con métricas clave.
 * 4.  Generación de un informe clínico detallado y en formato narrativo a medida que el usuario completa el formulario.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Configurar la UI inicial
    initializeUI();
    // Generar el estado inicial del informe y los cálculos.
    updateAll();
});

/**
 * Función principal que se llama en cada cambio para actualizar todo.
 */
function updateAll() {
    calculateAllScales();
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
    
    // Expandir submenú de la especialidad
    const specialtyNavLink = document.getElementById('specialty-nav-link');
    if (specialtyNavLink) {
        specialtyNavLink.classList.add('active');
        const specialtySubMenu = document.getElementById('specialty-sub-menu');
        if (specialtySubMenu) {
            specialtySubMenu.style.maxHeight = specialtySubMenu.scrollHeight + 'px';
        }
    }
}

/**
 * Llama a todas las funciones de cálculo de escalas.
 */
function calculateAllScales() {
    calculatePTP();
    calculateDHI();
    calculateEpworth();
}

/**
 * Construye el texto completo del informe narrativo.
 */
function generateFullReport() {
    let report = "INFORME DE EVALUACIÓN OTORRINOLARINGOLÓGICA\n";
    report += "==============================================\n\n";

    report += getSectionText('ANAMNESIS Y QUEJAS PRINCIPALES', getAnamnesisData());
    report += getSectionText('EXAMEN DEL OÍDO', getEarExamData());
    report += getSectionText('EXAMEN DE NARIZ Y SENOS PARANASALES', getNoseExamData());
    report += getSectionText('EXAMEN DE GARGANTA Y FARINGE', getThroatExamData());
    report += getSectionText('EXAMEN DE LARINGE Y EVALUACIÓN DE LA VOZ', getLarynxExamData());
    report += getSectionText('EXAMEN DEL CUELLO', getNeckExamData());
    report += getSectionText('EVALUACIÓN NEUROLÓGICA ORL', getNeuroExamData());
    report += getSectionText('ESCALAS DE EVALUACIÓN', getScalesData());

    const filledInputs = document.querySelectorAll('input:checked, input[type="text"][value]:not([value=""]), input[type="number"][value]:not([value=""])');
    if (filledInputs.length < 2) {
        report = 'Seleccione los parámetros del examen para generar la conclusión...';
    }
    
    document.getElementById('reportContent').textContent = report.trim();
}

// ===================================================================
// FUNCIONES DE RECOPILACIÓN DE DATOS PARA EL INFORME NARRATIVO
// ===================================================================

function getAnamnesisData() {
    let sentences = [];
    if (isChecked('sin-quejas-orl')) {
        return "Paciente acude a control, asintomático desde el punto de vista otorrinolaringológico.";
    }
    
    const complaints = getCheckedLabelsFromContainer('#anamnesis .sub-section-card:first-of-type');
    if (complaints.length > 0) sentences.push(`Paciente consulta por ${listToSentence(complaints)}.`);

    const tiempo = getSelectedRadioLabel('tiempo-evolucion-orl');
    if (tiempo) sentences.push(`El cuadro tiene un tiempo de evolución ${tiempo}.`);

    const triggers = getCheckedLabelsFromContainer('#anamnesis .sub-section-card:nth-of-type(2) .exam-section-migrated:last-of-type');
    if (triggers.length > 0) sentences.push(`Relaciona la sintomatología con factores desencadenantes como ${listToSentence(triggers)}.`);

    const otalgia = getInputValue('otalgia-intensidad');
    const odinofagia = getInputValue('odinofagia-intensidad');
    if (otalgia > 0 || odinofagia > 0) {
        let painText = "Refiere dolor con una intensidad (EVA) de";
        if (otalgia > 0) painText += ` ${otalgia}/10 para la otalgia`;
        if (otalgia > 0 && odinofagia > 0) painText += " y";
        if (odinofagia > 0) painText += ` ${odinofagia}/10 para la odinofagia`;
        sentences.push(painText + ".");
    }

    const vertigo = getSelectedRadioLabel('tipo-vertigo');
    if (vertigo) sentences.push(`Describe el vértigo como ${vertigo}.`);

    return sentences.join(' ');
}

function getEarExamData() {
    let sentences = [];
    let hasContent = false;
    
    ['der', 'izq'].forEach(side => {
        const sideName = side === 'der' ? 'derecho' : 'izquierdo';
        let sideSentences = [];
        
        const pabellon = getCheckedLabelsFromContainer(`#ear-exam .side-container:nth-of-type(${side === 'der' ? 1 : 2}) .exam-section-migrated:first-of-type`);
        if (pabellon.length > 0 && !pabellon.includes('Aspecto normal')) sideSentences.push(`pabellón auricular con ${listToSentence(pabellon)}`);
        
        const cae = getCheckedLabelsFromContainer(`#ear-exam .side-container:nth-of-type(${side === 'der' ? 1 : 2}) .exam-section-migrated:last-of-type`);
        if (cae.length > 0 && !cae.includes('Aspecto normal')) sideSentences.push(`conducto auditivo externo con ${listToSentence(cae)}`);

        const mt = getCheckedLabelsFromContainer(`#ear-exam .side-container:nth-of-type(${side === 'der' ? 3 : 4}) .exam-section-migrated:first-of-type`);
        if (mt.length > 0 && !mt.includes('Aspecto normal')) sideSentences.push(`membrana timpánica ${listToSentence(mt)}`);
        
        const movilidad = getCheckedLabelsFromContainer(`#ear-exam .side-container:nth-of-type(${side === 'der' ? 3 : 4}) .exam-section-migrated:last-of-type`);
        if (movilidad.length > 0 && !movilidad.includes('Móvil')) sideSentences.push(`con movilidad ${listToSentence(movilidad)}`);

        if (sideSentences.length > 0) {
            hasContent = true;
            sentences.push(`En el oído ${sideName}, se observa: ${listToSentence(sideSentences)}.`);
        }
    });

    let diapasonText = [];
    const weber = getSelectedText('weber-result');
    if (weber) diapasonText.push(`Weber ${weber.toLowerCase()}`);
    const rinneD = isChecked('rinne-der-pos') ? 'positivo' : (isChecked('rinne-der-neg') ? 'negativo' : '');
    if (rinneD) diapasonText.push(`Rinne derecho ${rinneD}`);
    const rinneI = isChecked('rinne-izq-pos') ? 'positivo' : (isChecked('rinne-izq-neg') ? 'negativo' : '');
    if (rinneI) diapasonText.push(`Rinne izquierdo ${rinneI}`);
    if (diapasonText.length > 0) {
        hasContent = true;
        sentences.push(`Las pruebas con diapasón muestran: ${listToSentence(diapasonText)}.`);
    }

    const ptpD = document.getElementById('ptp-derecho').textContent;
    const ptpI = document.getElementById('ptp-izquierdo').textContent;
    if (ptpD !== '-- dB HL' || ptpI !== '-- dB HL') {
        hasContent = true;
        sentences.push(`La audiometría tonal revela un promedio tonal puro de ${ptpD} en OD y ${ptpI} en OI.`);
    }
    
    return hasContent ? sentences.join(' ') : "El examen otológico se encuentra dentro de la normalidad.";
}

function getNoseExamData() {
    let sentences = [];
    let hasContent = false;

    const external = getCheckedLabelsFromContainer('#nose-exam .sub-section-card:first-of-type');
    if (external.length > 0 && !external.includes('Aspecto normal')) {
        hasContent = true;
        sentences.push(`A la inspección externa, la nariz presenta ${listToSentence(external)}.`);
    }

    ['der', 'izq'].forEach(side => {
        const sideName = side === 'der' ? 'derecha' : 'izquierda';
        let sideSentences = [];
        const vestibulo = getCheckedLabelsFromContainer(`#nose-exam .side-container:nth-of-type(${side === 'der' ? 1 : 2}) .exam-section-migrated:first-of-type`);
        if (vestibulo.length > 0 && !vestibulo.includes('Aspecto normal')) sideSentences.push(`vestíbulo con ${listToSentence(vestibulo)}`);
        
        const tabique = getCheckedLabelsFromContainer(`#nose-exam .side-container:nth-of-type(${side === 'der' ? 1 : 2}) .exam-section-migrated:nth-of-type(2)`);
        if (tabique.length > 0 && !tabique.includes('Normal')) sideSentences.push(`tabique ${listToSentence(tabique)}`);

        const cornetes = getCheckedLabelsFromContainer(`#nose-exam .side-container:nth-of-type(${side === 'der' ? 1 : 2}) .exam-section-migrated:last-of-type`);
        if (cornetes.length > 0 && !cornetes.includes('Normales')) sideSentences.push(`cornetes con ${listToSentence(cornetes)}`);

        if (sideSentences.length > 0) {
            hasContent = true;
            sentences.push(`En la fosa nasal ${sideName}, se observa: ${listToSentence(sideSentences)}.`);
        }
    });

    const secreciones = getCheckedLabelsFromContainer('#nose-exam .exam-section-migrated:nth-of-type(3)');
    if (secreciones.length > 0 && !secreciones.includes('Sin secreciones')) {
        hasContent = true;
        sentences.push(`Se aprecian secreciones nasales de tipo ${listToSentence(secreciones)}.`);
    }

    let senos = [];
    if (isChecked('frontales-pos')) senos.push('dolor en senos frontales');
    if (isChecked('maxilares-pos')) senos.push('dolor en senos maxilares');
    if (isChecked('etmoidales-pos')) senos.push('dolor en senos etmoidales');
    if (isChecked('transil-maxilar-anormal')) senos.push('transiluminación maxilar anormal');
    if (senos.length > 0) {
        hasContent = true;
        sentences.push(`La evaluación de senos paranasales revela ${listToSentence(senos)}.`);
    }

    return hasContent ? sentences.join(' ') : "El examen de nariz y senos paranasales se encuentra dentro de la normalidad.";
}

function getThroatExamData() {
    let sentences = [];
    let hasContent = false;
    
    const orofaringe = getCheckedLabelsFromContainer('#throat-exam .exam-section-migrated:first-of-type');
    if (orofaringe.length > 0 && !orofaringe.includes('Aspecto normal')) {
        hasContent = true;
        sentences.push(`La orofaringe presenta ${listToSentence(orofaringe)}.`);
    }
    
    const amigdalas = getCheckedLabelsFromContainer('#throat-exam .exam-section-migrated:nth-of-type(2) .form-grid');
    if (amigdalas.length > 0 && !amigdalas.includes('Aspecto normal')) {
        hasContent = true;
        sentences.push(`Las amígdalas palatinas son ${listToSentence(amigdalas)}.`);
    }
    const gradoAmigdalas = getSelectedRadioLabel('grado-amigdalas');
    if (gradoAmigdalas) {
        hasContent = true;
        sentences.push(`Se clasifican con un ${gradoAmigdalas.toLowerCase()} (Brodsky).`);
    }

    const paladar = getCheckedLabelsFromContainer('#throat-exam .exam-section-migrated:nth-of-type(3)');
    if (paladar.length > 0 && !paladar.includes('Aspecto normal') && !paladar.includes('Úvula normal')) {
        hasContent = true;
        sentences.push(`El paladar blando y la úvula muestran ${listToSentence(paladar)}.`);
    }

    const hipofaringe = getCheckedLabelsFromContainer('#throat-exam .sub-section-card:last-of-type');
    if (hipofaringe.length > 0 && !hipofaringe.includes('Aspecto normal') && !hipofaringe.includes('Base de lengua normal')) {
        hasContent = true;
        sentences.push(`En la hipofaringe y base de lengua se observa ${listToSentence(hipofaringe)}.`);
    }

    return hasContent ? sentences.join(' ') : "El examen de garganta y faringe se encuentra dentro de la normalidad.";
}

function getLarynxExamData() {
    let sentences = [];
    let hasContent = false;

    const cuerdas = getCheckedLabelsFromContainer('#larynx-exam .exam-section-migrated:first-of-type');
    if (cuerdas.length > 0 && !cuerdas.includes('Aspecto normal')) {
        hasContent = true;
        sentences.push(`La laringoscopia indirecta revela cuerdas vocales con ${listToSentence(cuerdas)}.`);
    }

    const movilidadD = getSelectedRadioLabel('movilidad-der');
    const movilidadI = getSelectedRadioLabel('movilidad-izq');
    if ((movilidadD && movilidadD !== 'movilidad normal') || (movilidadI && movilidadI !== 'movilidad normal')) {
        hasContent = true;
        sentences.push(`La movilidad de las cuerdas vocales es ${movilidadD || 'normal'} en la derecha y ${movilidadI || 'normal'} en la izquierda.`);
    }

    const otras = getCheckedLabelsFromContainer('#larynx-exam .exam-section-migrated:nth-of-type(3)');
    if (otras.length > 0 && !otras.every(item => item.includes('normales'))) {
        hasContent = true;
        sentences.push(`Otras estructuras laríngeas muestran ${listToSentence(otras)}.`);
    }

    const grbas = document.getElementById('overall-grbas').textContent;
    if (grbas === 'Anormal') {
        hasContent = true;
        let voiceDetails = [];
        if (getInputValue('ronquera-grado') > 0) voiceDetails.push(`ronquera (G${getInputValue('ronquera-grado')})`);
        if (getInputValue('rugosidad-grado') > 0) voiceDetails.push(`rugosidad (R${getInputValue('rugosidad-grado')})`);
        if (getInputValue('soplo-grado') > 0) voiceDetails.push(`soplo (B${getInputValue('soplo-grado')})`);
        if (getInputValue('astenia-grado') > 0) voiceDetails.push(`astenia (A${getInputValue('astenia-grado')})`);
        if (getInputValue('tension-grado') > 0) voiceDetails.push(`tensión (S${getInputValue('tension-grado')})`);
        sentences.push(`La evaluación perceptual de la voz (GRBAS) es anormal, con presencia de ${listToSentence(voiceDetails)}.`);
    }

    return hasContent ? sentences.join(' ') : "El examen de laringe y voz se encuentra dentro de la normalidad.";
}

function getNeckExamData() {
    let sentences = [];
    let hasContent = false;

    const inspeccion = getCheckedLabelsFromContainer('#neck-exam .sub-section-card:first-of-type');
    if (inspeccion.length > 0 && !inspeccion.includes('Aspecto normal')) {
        hasContent = true;
        sentences.push(`A la inspección del cuello se objetiva ${listToSentence(inspeccion)}.`);
    }

    const gangliosD = getCheckedLabelsFromContainer('#neck-exam .side-container:first-of-type');
    const gangliosI = getCheckedLabelsFromContainer('#neck-exam .side-container:last-of-type');
    if (gangliosD.length > 0 || gangliosI.length > 0) {
        hasContent = true;
        let adenopatiasText = "Se palpan adenopatías en las siguientes cadenas:";
        if (gangliosD.length > 0) adenopatiasText += ` Lado derecho: ${listToSentence(gangliosD)}.`;
        if (gangliosI.length > 0) adenopatiasText += ` Lado izquierdo: ${listToSentence(gangliosI)}.`;
        
        const caracteristicas = getCheckedLabelsFromContainer('#neck-exam .exam-section-migrated:last-of-type .form-grid');
        const tamano = getInputValue('adenopatia-tamano');
        if (caracteristicas.length > 0 || tamano) {
            adenopatiasText += " Las adenopatías son";
            if (tamano) adenopatiasText += ` de hasta ${tamano}mm,`;
            if (caracteristicas.length > 0) adenopatiasText += ` ${listToSentence(caracteristicas)}.`;
        }
        sentences.push(adenopatiasText);
    }

    const tiroides = getCheckedLabelsFromContainer('#neck-exam .sub-section-card:last-of-type .form-grid');
    const bocio = getSelectedText('grado-bocio');
    if ((tiroides.length > 0 && !tiroides.includes('No palpable')) || (bocio && bocio !== 'Grado 0: No palpable')) {
        hasContent = true;
        let tiroidesText = "La glándula tiroides es";
        if (tiroides.length > 0) tiroidesText += ` ${listToSentence(tiroides)}`;
        if (bocio) tiroidesText += `, con un ${bocio.toLowerCase()}`;
        sentences.push(tiroidesText + ".");
    }
    
    return hasContent ? sentences.join(' ') : "El examen de cuello se encuentra dentro de la normalidad.";
}

function getNeuroExamData() {
    let sentences = [];
    let hasContent = false;

    let pares = [];
    if (isChecked('facial-motor-alterado')) pares.push('parálisis facial');
    if (isChecked('gusto-anterior-alterado')) pares.push('alteración del gusto en 2/3 anteriores de la lengua (VII)');
    if (isChecked('audicion-alterada')) pares.push('alteración auditiva (VIII)');
    if (isChecked('vestibular-alterada')) pares.push('alteración vestibular (VIII)');
    if (isChecked('reflejo-nauseoso-ausente')) pares.push('reflejo nauseoso ausente (IX)');
    if (isChecked('paladar-asimetrico')) pares.push('elevación asimétrica del paladar (X)');
    if (isChecked('lengua-desviada')) pares.push('desviación de la lengua (XII)');
    if (pares.length > 0) {
        hasContent = true;
        sentences.push(`La evaluación de pares craneales muestra ${listToSentence(pares)}.`);
    }

    let vestibulares = [];
    if (isChecked('romberg-pos')) vestibulares.push('Romberg positivo');
    if (isChecked('unterberger-pos')) vestibulares.push('Unterberger positivo');
    if (isChecked('nistagmo-presente')) vestibulares.push('nistagmo espontáneo presente');
    if (isChecked('dix-hallpike-pos')) vestibulares.push('Dix-Hallpike positivo');
    if (isChecked('hit-pos')) vestibulares.push('Head Impulse Test positivo');
    if (vestibulares.length > 0) {
        hasContent = true;
        sentences.push(`Las pruebas vestibulares revelan ${listToSentence(vestibulares)}.`);
    }

    return hasContent ? sentences.join(' ') : "La evaluación neurológica ORL se encuentra dentro de la normalidad.";
}

function getScalesData() {
    let sentences = [];
    const dhi = document.getElementById('dhi-interpretation').textContent;
    if (dhi !== 'Sin discapacidad') sentences.push(`La escala de discapacidad por vértigo (DHI) indica una ${dhi.toLowerCase()}.`);
    
    const mallampati = getSelectedRadioLabel('mallampati');
    if (mallampati) sentences.push(`La clasificación de Mallampati es ${mallampati}.`);
    
    const epworth = document.getElementById('overall-epworth').textContent;
    if (epworth !== 'Normal') sentences.push(`La escala de Epworth sugiere una somnolencia diurna ${epworth.toLowerCase()}.`);

    return sentences.join(' ');
}

// ===================================================================
// FUNCIONES DE CÁLCULO DE ESCALAS
// ===================================================================
function calculatePTP() {
    const getAvg = (ids) => {
        let sum = 0, count = 0;
        ids.forEach(id => {
            const val = parseFloat(getInputValue(id));
            if (!isNaN(val)) { sum += val; count++; }
        });
        return count > 0 ? (sum / count).toFixed(1) : null;
    };
    const ptpD = getAvg(['aud-der-va-500', 'aud-der-va-1000', 'aud-der-va-2000']);
    const ptpI = getAvg(['aud-izq-va-500', 'aud-izq-va-1000', 'aud-izq-va-2000']);
    document.getElementById('ptp-derecho').textContent = ptpD ? `${ptpD} dB HL` : '-- dB HL';
    document.getElementById('ptp-izquierdo').textContent = ptpI ? `${ptpI} dB HL` : '-- dB HL';
}

function calculateDHI() {
    let score = 0;
    document.querySelectorAll('#scales input[id^="dhi-"]:checked').forEach(() => score += 4);
    document.getElementById('dhi-total').textContent = score;
    let interpretation = 'Sin discapacidad';
    if (score >= 54) interpretation = 'Discapacidad muy severa';
    else if (score >= 36) interpretation = 'Discapacidad severa';
    else if (score >= 18) interpretation = 'Discapacidad moderada';
    else if (score > 0) interpretation = 'Discapacidad leve';
    document.getElementById('dhi-interpretation').textContent = interpretation;
}

function calculateEpworth() {
    let total = 0;
    ['epworth-lectura', 'epworth-tv', 'epworth-auto', 'epworth-almuerzo'].forEach(id => {
        total += parseInt(getInputValue(id)) || 0;
    });
    document.getElementById('epworth-total').textContent = total;
    let interpretation = 'Normal';
    if (total > 15) interpretation = 'Somnolencia severa';
    else if (total > 12) interpretation = 'Somnolencia moderada';
    else if (total > 10) interpretation = 'Somnolencia límite';
    document.getElementById('epworth-interpretation').textContent = `/24 - ${interpretation}`;
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
        if (inputs.length > 0) completedSections++;
        findingsCount += inputs.length;
    });

    if (isChecked('epistaxis') || isChecked('mt-der-perforacion') || isChecked('mt-izq-perforacion') || isChecked('adenopatias-fijas')) alertCount++;
    if (isChecked('hipoacusia') || isChecked('vertigo') || isChecked('disfonia')) warningCount++;
    if (parseFloat(document.getElementById('ptp-derecho').textContent) > 40 || parseFloat(document.getElementById('ptp-izquierdo').textContent) > 40) alertCount++;
    if (parseFloat(document.getElementById('ptp-derecho').textContent) > 25 || parseFloat(document.getElementById('ptp-izquierdo').textContent) > 25) warningCount++;
    if (document.getElementById('dhi-interpretation').textContent.includes('severa')) alertCount++;
    if (document.getElementById('epworth-interpretation').textContent.includes('severa')) alertCount++;

    document.getElementById('exam-progress').textContent = `${Math.round((completedSections / sections.length) * 100)}%`;
    document.getElementById('sections-completed').textContent = `${completedSections}/${sections.length}`;
    document.getElementById('alert-count').textContent = alertCount;
    document.getElementById('warning-count').textContent = warningCount;
    document.getElementById('findings-count').textContent = findingsCount;
    
    const ptpD = parseFloat(document.getElementById('ptp-derecho').textContent) || 0;
    const ptpI = parseFloat(document.getElementById('ptp-izquierdo').textContent) || 0;
    const avgPtp = (ptpD + ptpI) / ((ptpD > 0 ? 1 : 0) + (ptpI > 0 ? 1 : 0) || 1);
    document.getElementById('overall-ptp').textContent = avgPtp > 0 ? `${avgPtp.toFixed(1)} dB HL` : '-- dB HL';
    
    let grbasSum = 0;
    ['ronquera-grado', 'rugosidad-grado', 'soplo-grado', 'astenia-grado', 'tension-grado'].forEach(id => grbasSum += parseInt(getInputValue(id)));
    document.getElementById('overall-grbas').textContent = grbasSum > 0 ? 'Anormal' : 'Normal';
    
    document.getElementById('overall-dhi').textContent = document.getElementById('dhi-interpretation').textContent;
    document.getElementById('overall-epworth').textContent = document.getElementById('epworth-interpretation').textContent.split(' - ')[1] || 'Normal';
}

// ===================================================================
// FUNCIONES AUXILIARES Y DE UI
// ===================================================================
function getInputValue(id) { return document.getElementById(id)?.value || ''; }
function isChecked(id) { return document.getElementById(id)?.checked || false; }
function getLabelText(id) { return document.querySelector(`label[for="${id}"]`)?.textContent.trim() || ''; }
function getSelectedText(id) {
    const select = document.getElementById(id);
    return select && select.selectedIndex >= 0 ? select.options[select.selectedIndex].text : '';
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
window.showClearFormModal = () => document.getElementById('clearFormModal').style.display = 'flex';
window.hideClearFormModal = () => document.getElementById('clearFormModal').style.display = 'none';
window.clearFormConfirmed = () => {
    document.querySelector('main').querySelectorAll('input, select, textarea').forEach(el => {
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
        else if (el.type === 'range') el.value = 0;
        else el.value = '';
    });
    // Reset range value displays
    ['otalgia', 'odinofagia', 'ronquera', 'rugosidad', 'soplo', 'astenia', 'tension'].forEach(id => {
        const el = document.getElementById(`${id}-value`);
        if(el) el.textContent = '0';
    });
    hideClearFormModal();
    updateAll();
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
    const isDisabled = isChecked('sin-quejas-orl');
    document.querySelectorAll('#anamnesis .sub-section-card:first-of-type input:not(#sin-quejas-orl)').forEach(el => {
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
window.toggleSpecialtySubMenu = (event) => {
    event.preventDefault();
    const subMenu = document.getElementById('specialty-sub-menu');
    const link = document.getElementById('specialty-nav-link');
    link.classList.toggle('active');
    subMenu.style.maxHeight = link.classList.contains('active') ? subMenu.scrollHeight + 'px' : '0';
};
window.scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        if (!section.classList.contains('expanded')) _internalToggleSection(section.querySelector('.section-header-main').parentElement);
    }
};
// Update range slider text values
window.updateOtalgiaValue = (val) => {
    document.getElementById('otalgia-value').textContent = val;
    updateAll();
};
window.updateOdinofagiaValue = (val) => {
    document.getElementById('odinofagia-value').textContent = val;
    updateAll();
};
window.updateVoiceValue = (param, val) => {
    document.getElementById(`${param}-value`).textContent = val;
    updateAll();
};

// CORRECCIÓN: Funciones que deben ser globales para los `onchange` del HTML
window.updateReport = updateAll;
window.updateDashboard = updateAll;
window.calculatePTP = updateAll;
window.calculateDHI = updateAll;
window.calculateEpworth = updateAll;
