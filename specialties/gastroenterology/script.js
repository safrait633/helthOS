/**
 * Examen Gastroenterológico - Script de Evaluación Interactiva (Versión Narrativa)
 *
 * Este script maneja la lógica para un formulario de examen gastroenterológico interactivo.
 * Sus responsabilidades principales son:
 * 1.  Manejar la interfaz de usuario, incluyendo la expansión/colapso de secciones y el panel de informe.
 * 2.  Capturar datos de todas las entradas del formulario (checkboxes, radios, textos, etc.).
 * 3.  Calcular puntuaciones de escalas clínicas como Glasgow-Blatchford y Child-Pugh.
 * 4.  Generar un informe clínico en formato NARRATIVO y estructurado en tiempo real.
 * 5.  Actualizar un panel de control con métricas clave del progreso del examen.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Adjunta todos los event listeners a los elementos del formulario para la generación del informe en tiempo real.
    initializeEventListeners();
    
    // Configura la funcionalidad de la UI como secciones colapsables y el tema.
    initializeUI();

    // Genera el informe inicial (que estará mayormente vacío).
    generateGastroenterologyReport();
});

/**
 * Configura los componentes iniciales de la interfaz de usuario.
 */
function initializeUI() {
    // Permite que las cabeceras de sección expandan/colapsen su contenido.
    document.querySelectorAll('.section-header-main').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.parentElement;
            toggleSection(section);
        });
    });

    // Carga el tema guardado (claro/oscuro) desde localStorage.
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }
    
    // Contrae todas las secciones al cargar la página.
    collapseAllSections();
}

/**
 * Adjunta event listeners a todos los inputs relevantes del formulario.
 * Cada vez que un input cambia, el informe se regenera.
 */
function initializeEventListeners() {
    const form = document.querySelector('.app-container');
    form.addEventListener('input', () => {
        // Retrasa ligeramente la generación para asegurar que el valor del input se actualice antes de leerlo.
        setTimeout(generateGastroenterologyReport, 100);
    });
    
    // Listeners específicos para el mapa de abdomen, ya que son divs y no inputs.
    document.querySelectorAll('.abdomen-quadrant').forEach(quadrant => {
        quadrant.addEventListener('click', () => {
             quadrant.classList.toggle('selected');
             generateGastroenterologyReport();
        });
    });
}

/**
 * Función principal que orquesta la generación del informe.
 * Recopila datos de todas las secciones y los muestra en el panel de informe.
 */
function generateGastroenterologyReport() {
    let report = "INFORME DE EVALUACIÓN GASTROENTEROLÓGICA\n";
    report += "=========================================\n\n";

    // --- Recopilación de Datos ---
    report += getSectionText('ANTECEDENTES', getAntecedentesData());
    report += getSectionText('REVISIÓN POR SISTEMAS', getRevisionSistemasData());
    report += getSectionText('ANAMNESIS Y ENFERMEDAD ACTUAL', getAnamnesisData());
    report += getSectionText('EXAMEN FÍSICO', 
        getVitalSignsData() +
        getOralCavityData() +
        getInspectionData() +
        getAuscultationData() +
        getPercussionData() +
        getPalpationData() +
        getSpecialSignsData() +
        getOrganData() +
        getAdditionalExamData()
    );
    report += getSectionText('ESCALAS Y EVALUACIÓN FUNCIONAL', getScalesData());

    // --- Actualización de la UI ---
    const reportPanel = document.getElementById('stickyContent');
    if (reportPanel) {
        reportPanel.textContent = report.trim();
    }
    
    const conclusionText = document.getElementById('conclusion-text');
    if(conclusionText) {
        conclusionText.textContent = report.trim();
    }

    updateDashboard();
}

// =================================================================================
// FUNCIONES DE RECOPILACIÓN DE DATOS POR SECCIÓN (NARRATIVAS)
// =================================================================================

function getAntecedentesData() {
    let sentences = [];
    const enfermedades = getCheckedLabels('#antecedentes .sub-section-card:nth-child(1) input:checked');
    if (enfermedades.length > 0) {
        sentences.push(`Paciente con antecedentes personales patológicos de ${listToSentence(enfermedades)}.`);
    }

    const cirugias = getCheckedLabels('#antecedentes .sub-section-card:nth-child(2) input:checked');
    if (cirugias.length > 0) {
        sentences.push(`Refiere antecedentes quirúrgicos de ${listToSentence(cirugias)}.`);
    }

    const medicamentos = getCheckedLabels('#antecedentes .sub-section-card:nth-child(3) input:checked');
    let medText = "";
    if (medicamentos.length > 0) {
        medText = `Actualmente en tratamiento con ${listToSentence(medicamentos)}`;
        const aineTipo = getInputValue('med-aines-tipo');
        if (aineTipo) medText += ` (AINE especificado: ${aineTipo})`;
        const anticoagTipo = getInputValue('med-anticoag-tipo');
        if (anticoagTipo) medText += ` (Anticoagulante: ${anticoagTipo})`;
        const antibiotTipo = getInputValue('med-antibiot-tipo');
        if (antibiotTipo) medText += ` (Antibiótico: ${antibiotTipo})`;
        sentences.push(medText + ".");
    }
    
    // Alergias, Hábitos e Historia Familiar
    const alergias = getCheckedLabels('#antecedentes .sub-section-card:nth-child(4) input[id^="alergia"]:checked');
    if (alergias.length > 0) {
        let alergiaText = `Refiere alergias conocidas a ${listToSentence(alergias)}`;
        const alergiaMed = getInputValue('alergia-med-tipo');
        if (alergiaMed) alergiaText += ` (${alergiaMed})`;
        const alergiaAlim = getInputValue('alergia-alim-tipo');
        if (alergiaAlim) alergiaText += ` (${alergiaAlim})`;
        sentences.push(alergiaText + ".");
    }

    const habitos = [];
    if (isChecked('habito-tabaco')) {
        const paqDia = getInputValue('habito-tabaco-paq') || 'N/A';
        const anos = getInputValue('habito-tabaco-años') || 'N/A';
        habitos.push(`tabaquismo (índice: ${paqDia} paq/día por ${anos} años)`);
    }
    if (isChecked('habito-alcohol')) {
        const tipoAlcohol = getInputValue('habito-alcohol-tipo');
        habitos.push(`consumo de alcohol${tipoAlcohol ? `: ${tipoAlcohol}` : ''}`);
    }
    if (habitos.length > 0) {
        sentences.push(`En cuanto a hábitos, se registra ${listToSentence(habitos)}.`);
    }

    const historiaFamiliar = getCheckedLabels('#antecedentes .sub-section-card:nth-child(4) input[id^="fam-"]:checked');
    if (historiaFamiliar.length > 0) {
        sentences.push(`Con historia familiar de ${listToSentence(historiaFamiliar)}.`);
    }

    return sentences.join(' ');
}

function getRevisionSistemasData() {
    const constitucionales = getCheckedLabels('#revision-sistemas .sub-section-card:nth-child(1) input:checked');
    const cardioResp = getCheckedLabels('#revision-sistemas .sub-section-card:nth-child(2) input:checked');
    const otros = getCheckedLabels('#revision-sistemas .sub-section-card:nth-child(3) input:checked');
    
    let text = "";
    if (constitucionales.length > 0) {
        text += `A la revisión por sistemas, el paciente refiere síntomas constitucionales, incluyendo ${listToSentence(constitucionales)}. `;
    }
    if (cardioResp.length > 0) {
        text += `En la esfera cardiorrespiratoria, destaca la presencia de ${listToSentence(cardioResp)}. `;
    }
    if (otros.length > 0) {
        text += `Adicionalmente, se reportan síntomas en otros sistemas como ${listToSentence(otros)}.`;
    }
    
    if (text.length === 0) {
        return "Revisión por sistemas sin hallazgos positivos a reportar.";
    }
    
    return text;
}

function getAnamnesisData() {
    let sentences = [];
    const quejas = getCheckedLabels('#anamnesis .sub-section-card:nth-child(1) input:checked');
    
    if (quejas.length === 0 || isChecked('sin-quejas-gi')) {
        return "Paciente asintomático desde el punto de vista gastrointestinal en el momento de la evaluación.";
    }
    
    sentences.push(`Paciente consulta por un cuadro clínico caracterizado por ${listToSentence(quejas)}.`);

    if (isChecked('dolor-abdominal')) {
        let dolorSentence = "El dolor abdominal se describe como";
        const tipoDolor = getSelectedRadioLabel("tipo-dolor");
        if (tipoDolor) dolorSentence += ` ${tipoDolor.toLowerCase()}`;
        
        dolorSentence += `, con una intensidad de ${getInputValue('dolor-intensidad')}/10 en la Escala Visual Análoga.`;
        
        const localizacion = getAbdomenMapText();
        if(localizacion) dolorSentence += ` Se localiza principalmente en ${localizacion}.`;
        
        const caracteristicasDolor = getCheckedLabels('#dolor-section .form-grid:nth-of-type(2) input:checked');
        if (caracteristicasDolor.length > 0) {
            dolorSentence += ` Se asocia a ${listToSentence(caracteristicasDolor)}.`;
        }
        sentences.push(dolorSentence);
    }

    if (isChecked('diarrea') || isChecked('estreñimiento')) {
        let deposicionesSentence = "En cuanto al hábito intestinal,";
        const bristol = getSelectedRadioLabel("bristol");
        if (bristol) deposicionesSentence += ` las deposiciones son compatibles con el tipo ${bristol}`;
        
        const freq = getInputValue('frecuencia-deposiciones');
        if(freq) deposicionesSentence += `, con una frecuencia de ${freq} veces al día.`;

        const caracteristicasHeces = getCheckedLabels('#deposiciones-section .form-grid:nth-of-type(2) input:checked');
        if(caracteristicasHeces.length > 0) {
            deposicionesSentence += ` Se acompañan de ${listToSentence(caracteristicasHeces)}.`;
        }
        sentences.push(deposicionesSentence);
    }
    
    const factores = getCheckedLabels('#anamnesis .sub-section-card:last-child input:checked');
    if (factores.length > 0) {
        sentences.push(`El paciente relaciona la sintomatología con factores desencadenantes como ${listToSentence(factores)}.`);
    }

    return sentences.join(' ');
}

function getVitalSignsData() {
    let text = "A la evaluación, ";
    let findings = [];
    const paSistolica = getInputValue('pa-sistolica');
    const paDiastolica = getInputValue('pa-diastolica');
    if (paSistolica && paDiastolica) {
        findings.push(`presión arterial de ${paSistolica}/${paDiastolica} mmHg`);
    }
    const fc = getInputValue('frecuencia-cardiaca');
    if(fc) findings.push(`frecuencia cardíaca de ${fc} lpm`);
    const temp = getInputValue('temperatura');
    if(temp) findings.push(`temperatura de ${temp} °C`);
    const sat = getInputValue('saturacion');
    if(sat) findings.push(`saturación de oxígeno de ${sat}%`);
    
    if(findings.length === 0) return "";

    text += `se registran los siguientes signos vitales: ${listToSentence(findings)}. `;
    
    const estadoGeneral = getCheckedLabels('#signos-vitales .sub-section-card:nth-child(2) input:checked');
    if (estadoGeneral.length > 0) {
        text += `En el estado general, destaca ${listToSentence(estadoGeneral)}.`;
    } else {
        text += "El paciente se encuentra en buen estado general aparente.";
    }
    
    return text + "\n";
}

function getOralCavityData() {
    const labios = getCheckedLabels('#examen-oral .sub-section-card:nth-child(1) input:checked');
    const mucosa = getCheckedLabels('#examen-oral .sub-section-card:nth-child(2) input:checked');
    if (labios.length === 0 && mucosa.length === 0) return "";
    
    let text = "Al examen de la cavidad oral, ";
    if (labios.length > 0) {
        text += `se observa en labios ${listToSentence(labios)}. `;
    }
    if (mucosa.length > 0) {
        text += `La mucosa oral y encías presentan ${listToSentence(mucosa)}.`;
    }
    return text + "\n";
}

function getInspectionData() {
    let findings = [];
    const forma = getSelectedRadioLabel("forma-abdomen");
    if(forma) findings.push(`un abdomen ${forma.toLowerCase()}`);

    const visibles = getCheckedLabels('#inspeccion .sub-section-card:nth-child(2) input:checked');
    if(visibles.length > 0) {
        findings.push(`con presencia de ${listToSentence(visibles)}`);
    }
    
    if(findings.length === 0) return "";
    return `A la inspección, se evidencia ${listToSentence(findings)}.\n`;
}

function getAuscultationData() {
    const ruidos = getSelectedRadioLabel("ruidos-hidroaereos");
    const freq = getInputValue('frecuencia-ruidos');
    if (!ruidos && !freq) return "";
    
    let text = "A la auscultación abdominal, los ruidos hidroaéreos se encuentran";
    if (ruidos) text += ` ${ruidos.toLowerCase()}`;
    if (freq) text += ` (frecuencia aproximada de ${freq} por minuto)`;
    
    return text + ".\n";
}

function getPercussionData() {
    const general = getCheckedLabels('#percusion .sub-section-card:nth-child(1) input:checked');
    const bordeHepatico = getInputValue('borde-hepatico');
    const matidezHepatica = getInputValue('matidez-hepatica');

    if (general.length === 0 && !bordeHepatico && !matidezHepatica) return "";

    let text = "La percusión abdominal revela ";
    if (general.length > 0) {
        text += `${listToSentence(general)}. `;
    } else {
        text += "timpanismo generalizado conservado. ";
    }
    if (matidezHepatica) {
        text += `La matidez hepática se estima en ${matidezHepatica} cm`;
        if (bordeHepatico) {
            text += `, con un borde palpable a ${bordeHepatico} cm bajo el reborde costal`;
        }
        text += ".";
    }
    return text + "\n";
}

function getPalpationData() {
    let text = "A la palpación, ";
    const superficial = getCheckedLabels('#palpacion .sub-section-card:nth-child(1) input:checked');
    const profunda = getCheckedLabels('#palpacion .sub-section-card:nth-child(2) input:checked');

    if (superficial.length === 0 && profunda.length === 0) return "";
    
    if (superficial.length > 0) {
        text += `la palpación superficial encuentra ${listToSentence(superficial)}. `;
    }
    if (profunda.length > 0) {
        text += `La palpación profunda detecta ${listToSentence(profunda)}.`;
    }
    return text + "\n";
}

function getSpecialSignsData() {
    let findings = [];
    const blumberg = getSignResult("blumberg-pos", "blumberg-neg");
    if(blumberg) findings.push(`signo de Blumberg ${blumberg}`);
    
    const rovsing = getSignResult("rovsing-pos", "rovsing-neg");
    if(rovsing) findings.push(`signo de Rovsing ${rovsing}`);

    const psoas = getSignResult("psoas-pos", "psoas-neg");
    if(psoas) findings.push(`signo del Psoas ${psoas}`);

    const murphy = getSignResult("murphy-pos", "murphy-neg");
    if(murphy) findings.push(`signo de Murphy ${murphy}`);
    
    const mcburney = getSignResult("mcburney-pos", "mcburney-neg");
    if(mcburney) findings.push(`dolor en punto de McBurney ${mcburney}`);
    
    if (findings.length === 0) return "";
    return `En la búsqueda de signos específicos, se encontró: ${listToSentence(findings)}.\n`;
}

function getOrganData() {
    let text = "";
    const higadoFindings = getCheckedLabels('#organos .sub-section-card:nth-child(1) input:checked');
    const hepatoCm = getInputValue('hepatomegalia-cm');
    if (higadoFindings.length > 0 || hepatoCm) {
        text += "La evaluación del hígado evidencia ";
        if (higadoFindings.length > 0) text += `${listToSentence(higadoFindings)}`;
        if (hepatoCm) text += ` (palpable a ${hepatoCm} cm bajo reborde costal)`;
        text += ". ";
    }

    const bazoFindings = getCheckedLabels('#organos .sub-section-card:nth-child(2) input:checked');
    const esplenoCm = getInputValue('esplenomegalia-cm');
    if (bazoFindings.length > 0 || esplenoCm) {
        text += "En cuanto al bazo, se palpa ";
        if (bazoFindings.length > 0) text += `${listToSentence(bazoFindings)}`;
        if (esplenoCm) text += ` (palpable a ${esplenoCm} cm bajo reborde costal)`;
        text += ".";
    }
    return text ? text + "\n" : "";
}

function getAdditionalExamData() {
    let sentences = [];
    const piel = getCheckedLabels('#examen-adicional .sub-section-card:nth-child(1) input:checked');
    if(piel.length > 0) sentences.push(`En piel y faneras se observan estigmas de hepatopatía como ${listToSentence(piel)}.`);

    const ganglios = getCheckedLabels('#examen-adicional .sub-section-card:nth-child(2) input:checked');
    if(ganglios.length > 0) sentences.push(`Se palpan adenopatías en las siguientes localizaciones: ${listToSentence(ganglios)}.`);
    
    const tactoRectal = getCheckedLabels('#examen-adicional .sub-section-card:nth-child(3) input:checked');
    if(tactoRectal.length > 0) sentences.push(`El tacto rectal fue anormal, con hallazgos de ${listToSentence(tactoRectal)}.`);

    return sentences.join(' ') + "\n";
}

function getScalesData() {
    let text = "";
    // Glasgow-Blatchford
    let glasgowScore = 0;
    const glasgowItems = [
        { id: 'gb-urea-1', score: 2 }, { id: 'gb-urea-2', score: 3 },
        { id: 'gb-urea-3', score: 4 }, { id: 'gb-urea-4', score: 6 },
        { id: 'gb-hb-male', score: 1 }, { id: 'gb-hb-female', score: 1 },
        { id: 'gb-pas', score: 1 }, { id: 'gb-fc', score: 1 }
    ];
    glasgowItems.forEach(item => {
        if (isChecked(item.id)) glasgowScore += item.score;
    });
    document.getElementById('glasgow-total').textContent = glasgowScore;
    text += `La puntuación en la escala de Glasgow-Blatchford para hemorragia digestiva alta es de ${glasgowScore}. `;

    // Child-Pugh
    let childPughScore = 0;
    const childPughItems = ['child-bilirrubina', 'child-albumina', 'child-inr', 'child-ascitis', 'child-encefalopatia'];
    childPughItems.forEach(id => {
        childPughScore += parseInt(getInputValue(id) || '1');
    });
    let childClass = 'A';
    if (childPughScore > 9) childClass = 'C';
    else if (childPughScore > 6) childClass = 'B';
    document.getElementById('child-total').textContent = childPughScore;
    document.getElementById('child-class').textContent = `Clase ${childClass}`;
    text += `La clasificación de Child-Pugh para cirrosis hepática es de ${childPughScore} puntos, correspondiendo a una Clase ${childClass}. `;

    const impacto = getCheckedLabels('#escalas-severidad .sub-section-card:last-child .form-grid:first-of-type input:checked');
    const imc = getInputValue('imc');
    const nutricion = getCheckedLabels('#escalas-severidad .sub-section-card:last-child .form-grid:last-of-type input:checked');

    if (impacto.length > 0 || imc || nutricion.length > 0) {
        text += "Funcionalmente, ";
        if(imc) text += `el paciente tiene un IMC de ${imc} kg/m². `;
        if(impacto.length > 0) text += `La sintomatología genera un impacto significativo en ${listToSentence(impacto)}. `;
        if(nutricion.length > 0) text += `Se observan signos de ${listToSentence(nutricion)}.`;
    }

    return text;
}


// =================================================================================
// FUNCIONES AUXILIARES DE GENERACIÓN DE TEXTO Y UI
// =================================================================================

/**
 * Convierte un array de strings en una frase gramaticalmente correcta.
 * @param {string[]} array - El array de strings.
 * @returns {string} La frase formateada.
 */
function listToSentence(array) {
    if (!array || array.length === 0) return "";
    if (array.length === 1) return array[0];
    if (array.length === 2) return array.join(' y ');
    return array.slice(0, -1).join(', ') + ' y ' + array.slice(-1);
}

/**
 * Obtiene las etiquetas de los elementos seleccionados.
 * @param {string} selector - El selector CSS para los elementos.
 * @returns {string[]} Un array con las etiquetas de texto.
 */
function getCheckedLabels(selector) {
    return Array.from(document.querySelectorAll(selector))
        .map(item => {
            const label = document.querySelector(`label[for="${item.id}"]`);
            return label ? label.textContent.trim().toLowerCase() : null;
        })
        .filter(Boolean);
}

/**
 * Obtiene la etiqueta del radio button seleccionado de un grupo.
 * @param {string} name - El atributo 'name' del grupo de radio buttons.
 * @returns {string|null} El texto de la etiqueta del radio seleccionado.
 */
function getSelectedRadioLabel(name) {
    const selectedRadio = document.querySelector(`input[name="${name}"]:checked`);
    if (selectedRadio) {
        const label = document.querySelector(`label[for="${selectedRadio.id}"]`);
        return label ? label.textContent.trim() : null;
    }
    return null;
}

/**
 * Genera el resultado de un signo clínico (positivo/negativo).
 * @param {string} positiveId - El ID del checkbox para el resultado positivo.
 * @param {string} negativeId - El ID del checkbox para el resultado negativo.
 * @returns {string} "positivo", "negativo", o "".
 */
function getSignResult(positiveId, negativeId) {
    if (isChecked(positiveId)) return "positivo";
    if (isChecked(negativeId)) return "negativo";
    return "";
}

/**
 * Genera texto descriptivo para el mapa de abdomen.
 * @returns {string} Una cadena de texto describiendo las áreas de dolor.
 */
function getAbdomenMapText() {
    const selectedQuadrants = document.querySelectorAll('.abdomen-quadrant.selected');
    if (selectedQuadrants.length > 0) {
        const locations = Array.from(selectedQuadrants).map(q => q.textContent.replace(/<br>/g, ' ').replace(/\s+/g, ' ').trim());
        return listToSentence(locations);
    }
    return "";
}

function getSectionText(title, content) {
    if (content && content.trim() !== "") {
        return `**${title}**\n${content.trim()}\n\n`;
    }
    return "";
}

function getInputValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

function isChecked(id) {
    const element = document.getElementById(id);
    return element ? element.checked : false;
}

function toggleSection(sectionElement) {
    const content = sectionElement.querySelector('.section-content-main');
    const arrow = sectionElement.querySelector('.section-arrow');
    if (!content || !arrow) return;

    sectionElement.classList.toggle('expanded');
    if (sectionElement.classList.contains('expanded')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        arrow.classList.remove('fa-chevron-down');
        arrow.classList.add('fa-chevron-up');
    } else {
        content.style.maxHeight = '0px';
        arrow.classList.remove('fa-chevron-up');
        arrow.classList.add('fa-chevron-down');
    }
}

function toggleStickyPanel() {
    const stickyPanel = document.getElementById('stickyReportPanel');
    const contentArea = document.querySelector('.content-area');
    const topBar = document.getElementById('topBar');

    if (!stickyPanel || !contentArea || !topBar) return;
    
    stickyPanel.classList.toggle('active');
    
    const panelWidth = stickyPanel.classList.contains('active') ? '400px' : '0px';
    const sidebarWidth = document.getElementById('sidebar').offsetWidth + 'px';

    contentArea.style.marginRight = panelWidth;
    topBar.style.width = `calc(100% - ${sidebarWidth} - ${panelWidth})`;
}

function copyStickyToClipboard() {
    const reportText = document.getElementById('stickyContent').textContent;
    navigator.clipboard.writeText(reportText).then(() => {
        alert('Informe copiado al portapapeles.');
    }).catch(err => {
        console.error('Error al copiar el informe: ', err);
        alert('No se pudo copiar el informe.');
    });
}

function printStickyConclusion() {
    const conclusion = document.getElementById('stickyContent').textContent.replace(/\*\*(.*?)\*\*/g, '<h3>$1</h3>');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>Informe Gastroenterológico</title>
        <style>body{font-family:sans-serif;line-height:1.6;padding:20px;} h3{font-size:1.2em;border-bottom:1px solid #ccc;padding-bottom:5px;margin-top:20px;}</style>
        </head><body>${conclusion.replace(/\n/g, '<br>')}</body></html>`);
    printWindow.document.close();
    printWindow.print();
}

function clearForm() {
    document.querySelectorAll('input, select, textarea').forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    document.querySelectorAll('.abdomen-quadrant').forEach(q => q.classList.remove('selected'));
    collapseAllSections();
    generateGastroenterologyReport();
    alert('Formulario limpiado.');
}

function expandAllSections() {
    document.querySelectorAll('.section-container:not(.expanded)').forEach(toggleSection);
}

function collapseAllSections() {
    document.querySelectorAll('.section-container.expanded').forEach(toggleSection);
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

function updateDashboard() {
    const allInputs = document.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked, input[type="text"][value]:not([value=""]), input[type="number"][value]:not([value=""]), select');
    let filledCount = 0;
    document.querySelectorAll('input, select').forEach(input => {
        if ((input.type === 'checkbox' || input.type === 'radio') && input.checked) {
            filledCount++;
        } else if (input.value && input.value.trim() !== '' && (input.type === 'text' || input.type === 'number' || input.tagName === 'SELECT')) {
             if(input.tagName === 'SELECT' && input.value === '1') return; // Ignore default select values
             filledCount++;
        }
    });

    const totalSections = document.querySelectorAll('.section-container').length;
    let completedSections = 0;
    document.querySelectorAll('.section-container').forEach(section => {
        const inputs = section.querySelectorAll('input, select');
        let sectionCompleted = false;
        inputs.forEach(input => {
            if (((input.type === 'checkbox' || input.type === 'radio') && input.checked) || (input.value && input.value.trim() !== '')) {
                if(input.tagName === 'SELECT' && input.value === '1') return;
                sectionCompleted = true;
            }
        });
        if(sectionCompleted) completedSections++;
    });

    const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

    document.getElementById('exam-progress').textContent = `${progress}%`;
    document.getElementById('sections-completed').textContent = `${completedSections}/${totalSections}`;
    document.getElementById('findings-count').textContent = filledCount;
    let alertCount = document.querySelectorAll('#blumberg-pos:checked, #abdomen-rigido:checked').length;
    document.getElementById('alert-count').textContent = alertCount;
}

window.generateConclusion = generateGastroenterologyReport;
window.printConclusion = printStickyConclusion;
