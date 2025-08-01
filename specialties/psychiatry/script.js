// ========== GLOBAL VARIABLES & CONSTANTS ==========
let examProgress = 0;
let sectionsCompleted = 0;
let alertCount = 0;
let warningCount = 0;
let findingsCount = 0;
let suicideRisk = 'Bajo'; // Variable global para el nivel de riesgo suicida

// Ancho de la barra lateral principal
const MAIN_SIDEBAR_WIDTH = 250;
const COLLAPSED_SIDEBAR_WIDTH = 80;
// Ancho del panel de informe en tiempo real
const REPORT_PANEL_WIDTH = 400;
// Altura de la barra superior fija
const TOP_BAR_HEIGHT = 72;

// ========== BASE FUNCTIONS FROM DEMO.HTML ==========

/**
 * Alterna entre los temas claro y oscuro.
 */
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

/**
 * Contrae o expande la barra lateral principal.
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.getElementById('sidebar-toggle-icon');
    sidebar.classList.toggle('collapsed');
    if (sidebar.classList.contains('collapsed')) {
        toggleIcon.className = 'fas fa-chevron-right';
    } else {
        toggleIcon.className = 'fas fa-chevron-left';
    }
    updateLayout();
}

/**
 * Expande o contrae una sección principal del formulario.
 * @param {HTMLElement} headerElement - El elemento de la cabecera de la sección.
 */
function toggleSection(headerElement) {
    const sectionContainer = headerElement.closest('.section-container');
    const content = sectionContainer.querySelector('.section-content-main');
    sectionContainer.classList.toggle('expanded');
    sectionContainer.classList.toggle('active');
    if (sectionContainer.classList.contains('expanded')) {
        content.style.maxHeight = content.scrollHeight + 'px';
    } else {
        content.style.maxHeight = '0';
    }
    updateDashboard();
}

/**
 * Expande o contrae el submenú de la especialidad.
 * @param {Event} event - El evento de clic.
 */
function toggleSpecialtySubMenu(event) {
    event.preventDefault();
    const specialtyNavLink = document.getElementById('specialty-nav-link');
    const specialtySubMenu = document.getElementById('specialty-sub-menu');

    specialtyNavLink.classList.toggle('active');

    if (specialtyNavLink.classList.contains('active')) {
        specialtySubMenu.style.maxHeight = specialtySubMenu.scrollHeight + 'px';
    } else {
        specialtySubMenu.style.maxHeight = '0';
    }
    updateLayout();
}

/**
 * Muestra u oculta el panel de informe en tiempo real.
 */
function toggleStickyPanel() {
    const panel = document.getElementById('stickyReportPanel');
    const btn = document.getElementById('sticky-toggle-btn');
    panel.classList.toggle('active');
    updateLayout();

    if (panel.classList.contains('active')) {
        btn.innerHTML = '<i class="fas fa-window-restore"></i> <span class="hidden md:inline">Vista Normal</span>';
        btn.classList.add('btn-warning');
        btn.classList.remove('btn-primary');
        generateReport();
    } else {
        btn.innerHTML = '<i class="fas fa-file-medical-alt"></i> <span class="hidden md:inline">Informe</span>';
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-warning');
    }
}

/**
 * Actualiza el diseño general de la página (márgenes, posiciones de paneles).
 */
function updateLayout() {
    const contentArea = document.getElementById('contentArea');
    const sidebar = document.getElementById('sidebar');
    const stickyReportPanel = document.getElementById('stickyReportPanel');
    const topBar = document.getElementById('topBar');

    let currentSidebarWidth = sidebar.classList.contains('collapsed') ? COLLAPSED_SIDEBAR_WIDTH : MAIN_SIDEBAR_WIDTH;
    let contentAreaLeftOffset = 0;
    let contentAreaRightOffset = 0;

    if (window.innerWidth > 768) {
        contentAreaLeftOffset = currentSidebarWidth;
        if (stickyReportPanel.classList.contains('active')) {
            contentAreaRightOffset = REPORT_PANEL_WIDTH;
        }
        sidebar.style.transform = `translateX(0)`;
        stickyReportPanel.style.transform = stickyReportPanel.classList.contains('active') ? 'translateX(0)' : 'translateX(100%)';
    } else {
        sidebar.style.transform = sidebar.classList.contains('collapsed') ? 'translateX(-100%)' : 'translateX(0)';
        stickyReportPanel.style.transform = stickyReportPanel.classList.contains('active') ? 'translateX(0)' : 'translateX(100%)';
    }

    contentArea.style.marginLeft = `${contentAreaLeftOffset}px`;
    contentArea.style.marginRight = `${contentAreaRightOffset}px`;
    topBar.style.left = `${contentAreaLeftOffset}px`;
    topBar.style.width = `calc(100% - ${contentAreaLeftOffset + contentAreaRightOffset}px)`;
}

/**
 * Se desplaza a una sección específica del formulario.
 * @param {string} sectionId - El ID de la sección.
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const sectionContainer = section.closest('.section-container');
        if (sectionContainer && !sectionContainer.classList.contains('expanded')) {
            toggleSection(sectionContainer.querySelector('.section-header-main'));
        }
    }
}

/**
 * Muestra un modal personalizado de alerta o confirmación.
 * @param {string} title - El título del modal.
 * @param {string} message - El mensaje del modal.
 * @param {string} type - 'alert' o 'confirm'.
 * @param {Function} callback - La función a ejecutar al cerrar el modal.
 */
function showModal(title, message, type, callback) {
    const modal = document.getElementById('customModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    const modalFooter = document.getElementById('modalFooter');
    modalFooter.innerHTML = '';

    if (type === 'confirm') {
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn btn-primary';
        confirmBtn.textContent = 'Aceptar';
        confirmBtn.onclick = () => {
            closeModal();
            if (callback) callback(true);
        };
        modalFooter.appendChild(confirmBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.onclick = () => {
            closeModal();
            if (callback) callback(false);
        };
        modalFooter.appendChild(cancelBtn);
    } else {
        const okBtn = document.createElement('button');
        okBtn.className = 'btn btn-primary';
        okBtn.textContent = 'OK';
        okBtn.onclick = () => {
            closeModal();
            if (callback) callback();
        };
        modalFooter.appendChild(okBtn);
    }
    modal.classList.remove('hidden');
}

/**
 * Cierra el modal personalizado.
 */
function closeModal() {
    document.getElementById('customModal').classList.add('hidden');
}

/**
 * Muestra una notificación de que el texto ha sido copiado.
 */
function showCopyNotification() {
    const notification = document.getElementById('copyNotification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2500);
}

/**
 * Copia texto al portapapeles usando un método de respaldo.
 * @param {string} text - El texto a copiar.
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showCopyNotification();
    } catch (err) {
        console.error('Error al usar el método de respaldo para copiar: ', err);
        showModal('Error al copiar', 'No se pudo copiar el texto. Por favor, cópielo manualmente.', 'alert');
    }

    document.body.removeChild(textArea);
}

// ========== MEDICAL SPECIFIC FUNCTIONS ==========

/**
 * Maneja el estado del checkbox "Sin síntomas".
 */
function handleNoSymptoms() {
    const noSymptomsCheckbox = document.getElementById('sin-sintomas');
    const otherCheckboxes = document.querySelectorAll('#anamnesis input[type="checkbox"]:not(#sin-sintomas)');

    otherCheckboxes.forEach(checkbox => {
        checkbox.disabled = noSymptomsCheckbox.checked;
        if (noSymptomsCheckbox.checked) checkbox.checked = false;
    });
    updateDashboard();
}

/**
 * Calcula el riesgo suicida basado en las selecciones del formulario.
 */
function calculateSuicideRisk() {
    let riskScore = 0;

    // Ponderación de factores de riesgo
    if (document.getElementById('ideas-muerte-pasivas')?.checked) riskScore += 1;
    if (document.getElementById('ideas-suicidas-sin-plan')?.checked) riskScore += 2;
    if (document.getElementById('ideas-suicidas-con-plan')?.checked) riskScore += 3;
    if (document.getElementById('plan-detallado')?.checked) riskScore += 4;
    if (document.getElementById('acceso-medios')?.checked) riskScore += 3;
    if (document.getElementById('intento-reciente')?.checked) riskScore += 4;
    if (document.getElementById('intentos-previos')?.checked) riskScore += 2;
    if (document.getElementById('desesperanza')?.checked) riskScore += 2;
    if (document.getElementById('aislamiento-social')?.checked) riskScore += 1;
    if (document.getElementById('impulsividad')?.checked) riskScore += 2;
    if (document.getElementById('abuso-sustancias-riesgo')?.checked) riskScore += 1;

    // Ponderación de factores protectores
    if (document.getElementById('apoyo-familiar')?.checked) riskScore -= 2;
    if (document.getElementById('red-social')?.checked) riskScore -= 1;
    if (document.getElementById('razones-vivir')?.checked) riskScore -= 2;
    if (document.getElementById('adherencia-tratamiento')?.checked) riskScore -= 1;

    let riskLevel = 'Bajo';
    let color = 'var(--normal-color)';

    if (riskScore >= 8) {
        riskLevel = 'Muy Alto';
        color = 'var(--alert-color)';
    } else if (riskScore >= 5) {
        riskLevel = 'Alto';
        color = 'var(--alert-color)';
    } else if (riskScore >= 3) {
        riskLevel = 'Moderado';
        color = 'var(--warning-color)';
    }

    document.getElementById('suicide-risk-level').textContent = riskLevel;
    document.getElementById('suicide-risk-level').style.color = color;
    suicideRisk = riskLevel;
    updateDashboard();
}

/**
 * Evalúa el estado cognitivo del paciente.
 */
function calculateCognition() {
    let impairmentScore = 0;

    if (document.getElementById('desorientado-tiempo')?.checked) impairmentScore++;
    if (document.getElementById('desorientado-espacio')?.checked) impairmentScore++;
    if (document.getElementById('atencion-disminuida')?.checked) impairmentScore++;
    if (document.getElementById('amnesia-anterograda')?.checked) impairmentScore++;
    if (document.getElementById('juicio-alterado')?.checked) impairmentScore++;
    if (document.getElementById('insight-alterado')?.checked) impairmentScore++;

    let cognitiveStatus = 'Normal';
    let color = 'var(--normal-color)';

    if (impairmentScore >= 4) {
        cognitiveStatus = 'Deterioro Severo';
        color = 'var(--alert-color)';
    } else if (impairmentScore >= 2) {
        cognitiveStatus = 'Deterioro Moderado';
        color = 'var(--warning-color)';
    } else if (impairmentScore > 0) {
        cognitiveStatus = 'Deterioro Leve';
        color = 'var(--warning-color)';
    }

    document.getElementById('cognitive-status').textContent = cognitiveStatus;
    document.getElementById('cognitive-status').style.color = color;
    updateDashboard();
}

/**
 * Calcula la puntuación de la Escala de Depresión de Hamilton (HAM-D).
 */
function calculateHamiltonDepression() {
    const total = ['hamilton-humor', 'hamilton-culpa', 'hamilton-suicidio', 'hamilton-insomnio-precoz', 'hamilton-insomnio-medio', 'hamilton-insomnio-tardio']
        .reduce((sum, id) => sum + (parseInt(document.getElementById(id).value) || 0), 0);

    document.getElementById('hamilton-score').textContent = total;

    let severity = 'Normal';
    let color = 'var(--normal-color)';
    if (total >= 18) {
        severity = 'Depresión Severa';
        color = 'var(--alert-color)';
    } else if (total >= 14) {
        severity = 'Depresión Moderada';
        color = 'var(--warning-color)';
    } else if (total >= 8) {
        severity = 'Depresión Leve';
        color = 'var(--warning-color)';
    }
    document.getElementById('hamilton-severity').textContent = severity;
    document.getElementById('hamilton-severity').style.color = color;
    updateDashboard();
}

/**
 * Calcula la puntuación de la Escala de Ansiedad de Hamilton (HAM-A).
 */
function calculateHamiltonAnxiety() {
    const total = ['hamilton-ansiedad-humor', 'hamilton-tension', 'hamilton-miedos', 'hamilton-somaticos-musculares']
        .reduce((sum, id) => sum + (parseInt(document.getElementById(id).value) || 0), 0);
    
    document.getElementById('hamilton-anxiety-score').textContent = total;

    let severity = 'Normal';
    let color = 'var(--normal-color)';
    if (total >= 15) {
        severity = 'Ansiedad Severa';
        color = 'var(--alert-color)';
    } else if (total >= 8) {
        severity = 'Ansiedad Moderada';
        color = 'var(--warning-color)';
    } else if (total >= 6) {
        severity = 'Ansiedad Leve';
        color = 'var(--warning-color)';
    }
    document.getElementById('hamilton-anxiety-severity').textContent = severity;
    document.getElementById('hamilton-anxiety-severity').style.color = color;
    updateDashboard();
}

/**
 * Calcula la puntuación del Mini-Mental State Examination (MMSE).
 */
function calculateMMSE() {
    const total = ['mmse-tiempo', 'mmse-espacio', 'mmse-registro', 'mmse-atencion', 'mmse-recuerdo', 'mmse-lenguaje']
        .reduce((sum, id) => sum + (parseInt(document.getElementById(id).value) || 0), 0);

    document.getElementById('mmse-total').textContent = total;

    let interpretation = 'Normal';
    let color = 'var(--normal-color)';
    if (total < 10) {
        interpretation = 'Deterioro Severo';
        color = 'var(--alert-color)';
    } else if (total < 20) {
        interpretation = 'Deterioro Moderado';
        color = 'var(--warning-color)';
    } else if (total < 24) {
        interpretation = 'Deterioro Leve';
        color = 'var(--warning-color)';
    }
    document.getElementById('mmse-interpretation').textContent = interpretation;
    document.getElementById('mmse-interpretation').style.color = color;
    updateDashboard();
}

/**
 * Genera el informe psiquiátrico completo en formato narrativo.
 */
function generateReport() {
    const reportContentEl = document.getElementById('reportContent');
    const updateIndicator = document.getElementById('updateIndicator');
    updateIndicator.classList.add('active');

    setTimeout(() => {
        let report = 'INFORME DE EVALUACIÓN PSIQUIÁTRICA\n\n';

        // Helper para construir frases narrativas a partir de checkboxes.
        const buildNarrative = (items) => {
            if (items.length === 0) return '';
            if (items.length === 1) return items[0];
            const last = items.pop();
            return items.join(', ') + ' y ' + last;
        };
        
        // Helper para obtener texto de checkboxes seleccionados
        const getCheckedTexts = (ids) => {
            return ids
                .filter(id => document.getElementById(id)?.checked)
                .map(id => document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        };
        
        // Helper para añadir una sección al informe si tiene contenido
        const addSection = (title, content) => {
            if (content && content.trim() !== '') {
                report += `${title}:\n${content}\n\n`;
            }
        };

        // 1. Motivo de Consulta y Anamnesis
        let anamnesisContent = '';
        if (document.getElementById('sin-sintomas')?.checked) {
            anamnesisContent = 'Paciente asiste a control de rutina, se encuentra asintomático en el momento de la evaluación.';
        } else {
            const sintomas = getCheckedTexts(['tristeza', 'ansiedad', 'irritabilidad', 'euforia', 'alucinaciones', 'delirios', 'insomnio', 'apetito', 'concentracion', 'memoria', 'obsesiones', 'panico', 'fobias', 'agitacion', 'lentitud', 'ideas-suicidas', 'ideas-homicidas', 'consumo-sustancias']);
            if (sintomas.length > 0) {
                anamnesisContent += `Paciente consulta por un cuadro clínico caracterizado por ${buildNarrative(sintomas)}. `;
            }
            const duracion = document.getElementById('duracion-sintomas')?.value;
            if (duracion) {
                anamnesisContent += `Los síntomas presentan una evolución de aproximadamente ${duracion} ${document.getElementById('unidad-duracion').value}. `;
            }
            const cronologia = getCheckedTexts(['inicio-gradual', 'inicio-subito']);
            if (cronologia.length > 0) {
                anamnesisContent += `El inicio del cuadro fue ${buildNarrative(cronologia)}. `;
            }
            const episodios = getCheckedTexts(['episodios-previos', 'primer-episodio']);
            if (episodios.length > 0) {
                anamnesisContent += `Se refiere que se trata de ${buildNarrative(episodios)}.`;
            }
        }
        addSection('MOTIVO DE CONSULTA Y ANAMNESIS', anamnesisContent);

        // 2. Antecedentes Psiquiátricos
        let antecedentesContent = '';
        const personales = getCheckedTexts(['depresion-previa', 'mania-previa', 'psicosis-previa', 'ansiedad-previa', 'hospitalizaciones', 'intentos-suicidas', 'autolesiones', 'terapia-previa']);
        if (personales.length > 0) {
            antecedentesContent += `Como antecedentes personales de relevancia, el paciente refiere historia de ${buildNarrative(personales)}. `;
        }
        const familiares = getCheckedTexts(['familia-depresion', 'familia-bipolar', 'familia-esquizofrenia', 'familia-suicidio', 'familia-adicciones']);
        if (familiares.length > 0) {
            antecedentesContent += `En cuanto a los antecedentes familiares, se destaca la presencia de ${buildNarrative(familiares)}. `;
        }
        const medicacion = getCheckedTexts(['antidepresivos', 'antipsicoticos', 'estabilizadores', 'ansioliticos']);
        if (medicacion.length > 0) {
            antecedentesContent += `Actualmente, el paciente se encuentra en tratamiento con ${buildNarrative(medicacion)}.`;
        } else if (document.getElementById('sin-medicacion')?.checked) {
            antecedentesContent += 'No se encuentra recibiendo medicación psiquiátrica en la actualidad.';
        }
        addSection('ANTECEDENTES PSIQUIÁTRICOS', antecedentesContent);

        // 3. Examen del Estado Mental
        let mentalStatusContent = '';
        const apariencia = getCheckedTexts(['bien-vestido', 'descuidado', 'extravagante']);
        const contacto = getCheckedTexts(['contacto-visual', 'evita-mirada', 'hipervigilante']);
        if (apariencia.length > 0 || contacto.length > 0) {
            mentalStatusContent += `A la inspección, el paciente se presenta ${buildNarrative(apariencia)}, con un contacto visual ${buildNarrative(contacto)}. `;
        }
        const actividad = getCheckedTexts(['actividad-normal', 'agitacion-psicomotora', 'retardo-psicomotor', 'manierismos', 'estereotipias', 'catatonia']);
        if (actividad.length > 0) {
            mentalStatusContent += `La actividad psicomotora se encuentra ${buildNarrative(actividad)}. `;
        }
        const habla = getCheckedTexts(['habla-normal', 'habla-rapida', 'habla-lenta', 'mutismo']);
        const volumen = getCheckedTexts(['volumen-alto', 'volumen-bajo']);
        if (habla.length > 0) {
            mentalStatusContent += `El habla es ${buildNarrative(habla)}`;
            if(volumen.length > 0) mentalStatusContent += `, con un volumen ${buildNarrative(volumen)}. `;
            else mentalStatusContent += `. `;
        }
        const lenguaje = getCheckedTexts(['lenguaje-coherente', 'circunstancial', 'tangencial', 'fuga-ideas', 'incoherente', 'neologismos']);
        if (lenguaje.length > 0) {
            mentalStatusContent += `El lenguaje se caracteriza por ser ${buildNarrative(lenguaje)}. `;
        }
        const animo = getCheckedTexts(['animo-eutimico', 'animo-deprimido', 'animo-elevado', 'animo-irritable', 'animo-ansioso', 'animo-disfórico']);
        if (animo.length > 0) {
            mentalStatusContent += `El estado de ánimo referido es ${buildNarrative(animo)}. `;
        }
        const afecto = getCheckedTexts(['afecto-congruente', 'afecto-incongruente', 'afecto-embotado', 'afecto-plano', 'afecto-labil', 'afecto-restringido']);
        if (afecto.length > 0) {
            mentalStatusContent += `El afecto observado es ${buildNarrative(afecto)}.`;
        }
        addSection('EXAMEN DEL ESTADO MENTAL', mentalStatusContent);
        
        // 4. Pensamiento y Percepción
        let thoughtContent = '';
        const curso = getCheckedTexts(['pensamiento-normal', 'pensamiento-acelerado', 'pensamiento-lentificado', 'bloqueo-pensamiento', 'perseveracion']);
        if (curso.length > 0) {
            thoughtContent += `El curso del pensamiento es ${buildNarrative(curso)}. `;
        }
        const contenido = getCheckedTexts(['contenido-normal', 'ideas-delirantes-persecucion', 'ideas-delirantes-grandeza', 'ideas-delirantes-referencia', 'ideas-sobrevaloradas', 'obsesiones-mentales', 'fobias-mentales', 'preocupaciones-hipocondria']);
        if (contenido.length > 0) {
            thoughtContent += `En cuanto al contenido, se identifican ${buildNarrative(contenido)}. `;
        }
        const percepcion = getCheckedTexts(['sin-alucinaciones', 'alucinaciones-auditivas', 'alucinaciones-visuales', 'alucinaciones-tactiles', 'alucinaciones-olfativas', 'pseudoalucinaciones']);
        if (percepcion.length > 0) {
            thoughtContent += `En la esfera perceptual, se reporta la presencia de ${buildNarrative(percepcion)}. `;
        }
        const otrasPercepciones = getCheckedTexts(['ilusiones', 'despersonalizacion', 'desrealizacion', 'distorsiones-perceptuales']);
        if (otrasPercepciones.length > 0) {
            thoughtContent += `Adicionalmente, se describen ${buildNarrative(otrasPercepciones)}.`;
        }
        addSection('PENSAMIENTO Y PERCEPCIÓN', thoughtContent);

        // 5. Evaluación de Riesgo
        let riskContent = `El riesgo suicida se evalúa como ${suicideRisk}. `;
        const factoresRiesgo = getCheckedTexts(['desesperanza', 'aislamiento-social', 'impulsividad', 'abuso-sustancias-riesgo', 'perdidas-recientes', 'problemas-legales']);
        if(factoresRiesgo.length > 0) riskContent += `Se identifican los siguientes factores de riesgo: ${buildNarrative(factoresRiesgo)}. `;
        const factoresProtectores = getCheckedTexts(['apoyo-familiar', 'red-social', 'razones-vivir', 'adherencia-tratamiento', 'creencias-religiosas']);
        if(factoresProtectores.length > 0) riskContent += `Como factores protectores se observan: ${buildNarrative(factoresProtectores)}. `;
        const heteroagresividad = getCheckedTexts(['sin-ideas-violentas', 'fantasias-violentas', 'ideas-homicidas-aggro', 'amenazas-directas', 'agresion-previa', 'control-impulsos']);
        if(heteroagresividad.length > 0) riskContent += `Respecto al riesgo de heteroagresividad, se consigna: ${buildNarrative(heteroagresividad)}.`;
        addSection('EVALUACIÓN DE RIESGO', riskContent);

        // 6. Evaluación Cognitiva y Escalas
        let scalesContent = '';
        const orientacion = getCheckedTexts(['orientado-tiempo', 'orientado-espacio', 'orientado-persona']);
        if (orientacion.length > 0) scalesContent += `El paciente se encuentra ${buildNarrative(orientacion)}. `;
        const atencion = getCheckedTexts(['atencion-normal', 'atencion-disminuida', 'distractibilidad']);
        if (atencion.length > 0) scalesContent += `La atención se describe como ${buildNarrative(atencion)}. `;
        const memoria = getCheckedTexts(['memoria-normal', 'amnesia-anterograda', 'amnesia-retrograda', 'confabulaciones']);
        if (memoria.length > 0) scalesContent += `La memoria se encuentra ${buildNarrative(memoria)}. `;
        const ejecutivas = getCheckedTexts(['funciones-ejecutivas-normal', 'planificacion-alterada', 'flexibilidad-alterada', 'juicio-alterado', 'insight-alterado']);
        if (ejecutivas.length > 0) scalesContent += `Las funciones ejecutivas están ${buildNarrative(ejecutivas)}. `;

        const cognitiveStatus = document.getElementById('cognitive-status')?.textContent;
        if (cognitiveStatus !== 'Normal') scalesContent += `El estado cognitivo global se clasifica como ${cognitiveStatus}. `;
        
        const mmseTotal = document.getElementById('mmse-total')?.textContent;
        if (mmseTotal > 0) scalesContent += `La puntuación en la escala MMSE es de ${mmseTotal}/30, lo que sugiere un ${document.getElementById('mmse-interpretation').textContent}. `;
        const hamDTotal = document.getElementById('hamilton-score')?.textContent;
        if (hamDTotal > 0) scalesContent += `La puntuación en la escala HAM-D es de ${hamDTotal}/24, indicativo de ${document.getElementById('hamilton-severity').textContent}. `;
        const hamATotal = document.getElementById('hamilton-anxiety-score')?.textContent;
        if (hamATotal > 0) scalesContent += `La puntuación en la escala HAM-A es de ${hamATotal}/16, sugiriendo ${document.getElementById('hamilton-anxiety-severity').textContent}.`;
        addSection('EVALUACIÓN COGNITIVA Y ESCALAS', scalesContent);

        // Conclusión Final
        if (report.trim() === 'INFORME DE EVALUACIÓN PSIQUIÁTRICA') {
            report = 'El informe se generará aquí a medida que completes los campos del examen...';
        } else {
            report += '--- RESUMEN DE HALLAZGOS ---\n';
            if (alertCount > 0) report += `• ALERTAS CRÍTICAS: ${alertCount}\n`;
            if (warningCount > 0) report += `• AVISOS / SÍNTOMAS RELEVANTES: ${warningCount}\n`;
            report += `• TOTAL DE HALLAZGOS: ${findingsCount}\n\n`;
            report += '--- IMPRESIÓN DIAGNÓSTICA Y PLAN ---\n[Pendiente de correlación clínica final e integración de todos los datos.]';
        }

        reportContentEl.textContent = report;
        document.getElementById('conclusion-text').textContent = report;
        updateIndicator.classList.remove('active');
    }, 300);
}


/**
 * Copia el informe al portapapeles.
 */
function copyReportToClipboard() {
    const reportContent = document.getElementById('reportContent').textContent;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(reportContent).then(showCopyNotification).catch(err => {
            console.error('Error al copiar: ', err);
            fallbackCopyToClipboard(reportContent);
        });
    } else {
        fallbackCopyToClipboard(reportContent);
    }
}

/**
 * Imprime el informe.
 */
function printReport() {
    const conclusion = document.getElementById('reportContent').textContent;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Informe Psiquiátrico</title><style>body{font-family:sans-serif;line-height:1.5} pre{white-space:pre-wrap;font-family:monospace}</style></head><body><h1>Informe de Evaluación Psiquiátrica</h1><pre>${conclusion}</pre></body></html>`);
    printWindow.document.close();
    printWindow.print();
}

/**
 * Actualiza el dashboard con las métricas del examen.
 */
function updateDashboard() {
    const sections = ['anamnesis', 'mental-status', 'thought-perception', 'risk-assessment', 'cognitive-assessment', 'scales-assessment'];
    let currentCompletedSections = 0;
    let currentAlertCount = 0;
    let currentWarningCount = 0;
    let currentFindingsCount = 0;

    sections.forEach(sectionId => {
        const sectionElement = document.getElementById(`section-${sectionId}`);
        if (sectionElement) {
            const inputs = sectionElement.querySelectorAll('input:checked, input[type="number"], select');
            let hasContent = Array.from(inputs).some(el => (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value && el.value !== '0');
            
            const badge = document.getElementById(`badge-${sectionId}`);
            if (hasContent) {
                currentCompletedSections++;
                badge.classList.add('completed');
                badge.innerHTML = '<i class="fas fa-check"></i>';
            } else {
                badge.classList.remove('completed');
                badge.innerHTML = '<i class="fas fa-circle"></i>';
            }
        }
    });
    
    // Conteo de Alertas y Avisos
    const alertChecks = ['ideas-suicidas-con-plan', 'plan-detallado', 'intento-reciente', 'alucinaciones-auditivas', 'ideas-homicidas-aggro', 'catatonia'];
    currentAlertCount = alertChecks.filter(id => document.getElementById(id)?.checked).length;
    if (suicideRisk === 'Alto' || suicideRisk === 'Muy Alto') currentAlertCount += 2;
    if (document.getElementById('hamilton-severity')?.textContent === 'Depresión Severa') currentAlertCount++;

    const warningChecks = ['tristeza', 'ansiedad', 'irritabilidad', 'insomnio', 'desesperanza', 'aislamiento-social', 'hospitalizaciones', 'autolesiones'];
    currentWarningCount = warningChecks.filter(id => document.getElementById(id)?.checked).length;
    if (suicideRisk === 'Moderado') currentWarningCount++;
    
    currentFindingsCount = document.querySelectorAll('input:checked').length;

    // Actualizar UI del Dashboard
    const totalSections = sections.length;
    examProgress = Math.round((currentCompletedSections / totalSections) * 100);
    document.getElementById('exam-progress').textContent = `${examProgress}%`;
    document.getElementById('sections-completed').textContent = `${currentCompletedSections}/${totalSections}`;
    document.getElementById('alert-count').textContent = currentAlertCount;
    document.getElementById('warning-count').textContent = currentWarningCount;
    document.getElementById('findings-count').textContent = currentFindingsCount;
    document.getElementById('suicide-risk').textContent = suicideRisk;

    // Actualizar colores del dashboard
    document.getElementById('alerts-item').classList.toggle('dashboard-alert', currentAlertCount > 0);
    document.getElementById('warnings-item').classList.toggle('dashboard-warning', currentWarningCount > 0);
    let riskColorClass = 'dashboard-normal';
    if (suicideRisk === 'Alto' || suicideRisk === 'Muy Alto') riskColorClass = 'dashboard-alert';
    else if (suicideRisk === 'Moderado') riskColorClass = 'dashboard-warning';
    document.getElementById('risk-status-item').className = `dashboard-item ${riskColorClass}`;

    // Actualizar variables globales
    alertCount = currentAlertCount;
    warningCount = currentWarningCount;
    findingsCount = currentFindingsCount;

    generateReport();
}

/**
 * Limpia todos los campos del formulario.
 */
function clearForm() {
    showModal('Confirmar Limpieza', '¿Está seguro de que desea borrar todos los datos del formulario? Esta acción no se puede deshacer.', 'confirm', (result) => {
        if (result) {
            document.querySelectorAll('form').forEach(form => form.reset());
            document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(el => el.checked = false);
            document.querySelectorAll('input, select, textarea').forEach(el => {
                el.disabled = false;
                if(el.tagName.toLowerCase() === 'select') el.selectedIndex = 0;
            });
            
            // Resetear valores calculados en la UI
            document.getElementById('suicide-risk-level').textContent = 'Bajo';
            document.getElementById('suicide-risk-level').style.color = 'var(--normal-color)';
            document.getElementById('cognitive-status').textContent = 'Normal';
            document.getElementById('cognitive-status').style.color = 'var(--normal-color)';
            
            // Resetear escalas
            ['hamilton-score', 'hamilton-anxiety-score', 'mmse-total'].forEach(id => document.getElementById(id).textContent = '0');
            ['hamilton-severity', 'hamilton-anxiety-severity', 'mmse-interpretation'].forEach(id => {
                document.getElementById(id).textContent = 'Normal';
                document.getElementById(id).style.color = 'var(--normal-color)';
            });

            // Resetear variables globales y actualizar dashboard
            suicideRisk = 'Bajo';
            updateDashboard();
        }
    });
}


// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }

    // Configurar la barra lateral en el redimensionamiento de la ventana
    window.addEventListener('resize', updateLayout);

    // Añadir event listeners para actualizar el dashboard
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', updateDashboard);
    });
    
    // Expandir la primera sección por defecto
    const firstSectionHeader = document.querySelector('.section-header-main');
    if (firstSectionHeader) {
        toggleSection(firstSectionHeader);
    }
    
    // Expandir submenú de especialidad si está activo
    const specialtyNavLink = document.getElementById('specialty-nav-link');
    if (specialtyNavLink?.classList.contains('active')) {
        specialtyNavLink.nextElementSibling.style.maxHeight = specialtyNavLink.nextElementSibling.scrollHeight + 'px';
    }

    // Actualización inicial del layout y dashboard
    updateLayout();
    updateDashboard();

    console.log('🎉 Sistema de Evaluación Psiquiátrica HealthOS cargado exitosamente!');
});
