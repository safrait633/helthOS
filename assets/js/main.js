1// script.js

// Global variables for the dashboard
let examProgress = 0;
let sectionsCompleted = 0;
let alertCount = 0;
let warningCount = 0;
let findingsCount = 0;
let completenessStatus = '0%';

// Constants for layout dimensions
const MAIN_SIDEBAR_WIDTH = 250;
const COLLAPSED_SIDEBAR_WIDTH = 80;
const REPORT_PANEL_WIDTH = 400;
const TOP_BAR_HEIGHT = 72;

/**
 * Toggles the theme between light and dark mode.
 * Stores the preference in local storage.
 */
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (body.hasAttribute('data-theme')) {
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon'; // Set icon to moon for light mode
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun'; // Set icon to sun for dark mode
        localStorage.setItem('theme', 'dark');
    }
}

/**
 * Toggles the visibility of the sticky report panel.
 * Adjusts content area and top bar width accordingly.
 */
function toggleStickyPanel() {
    const panel = document.getElementById('stickyReportPanel');
    const contentArea = document.getElementById('contentArea');
    const topBar = document.getElementById('topBar');
    
    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
        // If panel is active, adjust content area and top bar to make space
        contentArea.style.marginRight = `${REPORT_PANEL_WIDTH}px`;
        topBar.style.width = `calc(100% - ${MAIN_SIDEBAR_WIDTH + REPORT_PANEL_WIDTH}px)`;
        generateStickyConclusion(); // Generate report when panel opens
    } else {
        // If panel is not active, reset margins and width
        contentArea.style.marginRight = '0';
        topBar.style.width = `calc(100% - ${MAIN_SIDEBAR_WIDTH}px)`;
    }
}

/**
 * Toggles the expansion/collapse of a section.
 * @param {HTMLElement} headerElement The header element that was clicked.
 */
function toggleSection(headerElement) {
    const container = headerElement.closest('.section-container');
    const content = container.querySelector('.section-content-main');
    
    container.classList.toggle('expanded');
    
    if (container.classList.contains('expanded')) {
        // Set max-height to scrollHeight to animate expansion
        content.style.maxHeight = content.scrollHeight + 'px';
    } else {
        // Collapse by setting max-height to 0
        content.style.maxHeight = '0';
    }
}

/**
 * Updates the max-height of a section, typically after its content has changed.
 * @param {HTMLElement} contentElement The .section-content-main element.
 */
function updateSectionHeight(contentElement) {
    const container = contentElement.closest('.section-container');
    if (container && container.classList.contains('expanded')) {
        contentElement.style.maxHeight = contentElement.scrollHeight + 'px';
    }
}

// ========== INITIALIZATION & OBSERVERS ==========

document.addEventListener('DOMContentLoaded', () => {
    // Observer for dynamic height adjustments in sections
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                // Find the closest section content container and update its height
                const target = mutation.target.closest('.section-content-main');
                if (target) {
                    updateSectionHeight(target);
                }
            }
        });
    });

    // Start observing all main content sections for changes
    const config = { childList: true, subtree: true, attributes: true };
    const contentSections = document.querySelectorAll('.section-content-main');
    contentSections.forEach(section => {
        observer.observe(section, config);
    });
});

/**
 * Expands all collapsible sections in the document.
 */
function expandAllSections() {
    document.querySelectorAll('.section-header-main').forEach(header => {
        const container = header.closest('.section-container');
        // Only expand if not already expanded
        if (!container.classList.contains('expanded')) {
            toggleSection(header);
        }
    });
}

/**
 * Toggles the 'selected' class on an abdomen quadrant.
 * @param {HTMLElement} element The clicked quadrant element.
 * @param {string} quadrantId The ID of the quadrant.
 */
function toggleQuadrant(element, quadrantId) {
    element.classList.toggle('selected');
    updateDashboard();
    generateConclusion();
}

/**
 * Handles the "Sin quejas" (No complaints) checkbox.
 * Disables/enables other complaint checkboxes and hides/shows related sections.
 */
function handleNoComplaints() {
    const noComplaintsCheckbox = document.getElementById('sin-quejas-gi');
    const otherCheckboxes = document.querySelectorAll('#anamnesis input[type="checkbox"]:not(#sin-quejas-gi)');
    
    otherCheckboxes.forEach(checkbox => {
        checkbox.disabled = noComplaintsCheckbox.checked;
        if (noComplaintsCheckbox.checked) checkbox.checked = false; // Uncheck others if "No complaints" is checked
    });
    
    // Hide pain and stool sections if "No complaints" is checked
    const dolorSection = document.getElementById('dolor-section');
    const deposicionesSection = document.getElementById('deposiciones-section');
    
    if (noComplaintsCheckbox.checked) {
        dolorSection.classList.add('hidden');
        deposicionesSection.classList.add('hidden');
    }
    
    updateDashboard();
    generateConclusion();
}

/**
 * Shows/hides the abdominal pain section based on the "Dolor abdominal" checkbox.
 * Resets pain-related inputs if the section is hidden.
 * @param {HTMLInputElement} checkbox The "Dolor abdominal" checkbox.
 */
function handlePainComplaint(checkbox) {
    const dolorSection = document.getElementById('dolor-section');
    
    if (checkbox.checked) {
        dolorSection.classList.remove('hidden');
    } else {
        dolorSection.classList.add('hidden');
        // Reset pain-related inputs when hiding the section
        document.getElementById('dolor-intensidad').value = 0;
        updateDolorValue(0);
        document.querySelectorAll('#dolor-section input').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            }
        });
        document.querySelectorAll('.abdomen-quadrant.selected').forEach(quad => {
            quad.classList.remove('selected');
        });
    }
    updateDashboard();
    generateConclusion();
}

/**
 * Shows/hides the stool characteristics section based on diarrhea or constipation checkboxes.
 * Resets stool-related inputs if the section is hidden.
 * @param {HTMLInputElement} checkbox The diarrhea or constipation checkbox.
 */
function handleStoolComplaint(checkbox) {
    const deposicionesSection = document.getElementById('deposiciones-section');
    const diarreaChecked = document.getElementById('diarrea').checked;
    const estreñimientoChecked = document.getElementById('estreñimiento').checked;
    
    if (diarreaChecked || estreñimientoChecked) {
        deposicionesSection.classList.remove('hidden');
    } else {
        deposicionesSection.classList.add('hidden');
        // Reset stool-related inputs when hiding the section
        document.querySelectorAll('#deposiciones-section input').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else if (input.type === 'number') {
                input.value = '';
            }
        });
    }
    updateDashboard();
    generateConclusion();
}

/**
 * Synchronizes the state of "Melena" checkboxes (Anamnesis and Heces).
 * @param {HTMLInputElement} sourceElement The checkbox that triggered the change.
 */
function syncMelenaFields(sourceElement) {
    const targetId = sourceElement.id === 'melena' ? 'heces-negras' : 'melena';
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.checked = sourceElement.checked;
    }
    updateDashboard();
    generateConclusion();
}

/**
 * Highlights related fields when "Ictericia" is checked, and unhighlights when unchecked.
 * @param {HTMLInputElement} sourceElement The "Ictericia" checkbox.
 */
function syncIctericiaFields(sourceElement) {
    const related = ['mucosa-ictérica', 'ictericia-general'];
    related.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.checked = sourceElement.checked; // Sync checked state
            if (sourceElement.checked) {
                element.style.backgroundColor = '#fff3cd'; // Yellowish highlight
                element.style.border = '2px solid #ffc107';
            } else {
                element.style.backgroundColor = '';
                element.style.border = '';
            }
        }
    });
    updateDashboard();
    generateConclusion();
}

/**
 * Highlights related fields when "Acolia" is checked, and unhighlights when unchecked.
 * (Currently no specific visual effect, but included for consistency if added later)
 * @param {HTMLInputElement} sourceElement The "Acólicas" checkbox.
 */
function syncAcoliaFields(sourceElement) {
    // Add specific highlighting logic for Acolia if needed in the future
    updateDashboard();
    generateConclusion();
}

/**
 * Highlights related fields when "Palidez" is checked, and unhighlights when unchecked.
 * @param {HTMLInputElement} sourceElement The "Palidez" checkbox.
 */
function syncPalidezFields(sourceElement) {
    const related = ['mucosa-palida', 'palidez-labial'];
    related.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.checked = sourceElement.checked; // Sync checked state
            if (sourceElement.checked) {
                element.style.backgroundColor = '#fff3cd'; // Yellowish highlight
                element.style.border = '2px solid #ffc107';
            } else {
                element.style.backgroundColor = '';
                element.style.border = '';
            }
        }
    });
    updateDashboard();
    generateConclusion();
}

/**
 * Ensures only one of two mutually exclusive checkboxes (e.g., positive/negative signs) is checked.
 * @param {string} positiveId The ID of the positive checkbox.
 * @param {string} negativeId The ID of the negative checkbox.
 * @param {HTMLInputElement} checkbox The checkbox that was just clicked.
 */
function handleMutuallyExclusive(positiveId, negativeId, checkbox) {
    if (checkbox.checked) {
        const oppositeId = checkbox.id === positiveId ? negativeId : positiveId;
        const oppositeCheckbox = document.getElementById(oppositeId);
        if (oppositeCheckbox) oppositeCheckbox.checked = false;
    }
    updateDashboard();
    generateConclusion();
}

/**
 * Updates the displayed value for the abdominal pain intensity slider.
 * @param {string} value The current value of the slider.
 */
function updateDolorValue(value) {
    document.getElementById('dolor-value').textContent = value;
    updateDashboard();
    generateConclusion();
}

/**
 * Calculates the Glasgow-Blatchford score based on selected criteria.
 * Updates the displayed score.
 */
function calculateGlasgow() {
    let score = 0;
    
    // Checkboxes for Glasgow-Blatchford score
    if (document.getElementById('gb-urea-1').checked) score += 2;
    if (document.getElementById('gb-urea-2').checked) score += 3;
    if (document.getElementById('gb-urea-3').checked) score += 4;
    if (document.getElementById('gb-urea-4').checked) score += 6;
    if (document.getElementById('gb-hb-male').checked) score += 1;
    if (document.getElementById('gb-hb-female').checked) score += 1;
    if (document.getElementById('gb-pas').checked) score += 1;
    if (document.getElementById('gb-fc').checked) score += 1;
    
    document.getElementById('glasgow-total').textContent = score;
    updateDashboard();
    generateConclusion();
}

/**
 * Calculates the Child-Pugh score and classification based on selected criteria.
 * Updates the displayed score and class.
 */
function calculateChildPugh() {
    // Get values from select elements, default to 1 if not selected
    const bilirrubina = parseInt(document.getElementById('child-bilirrubina').value) || 1;
    const albumina = parseInt(document.getElementById('child-albumina').value) || 1;
    const inr = parseInt(document.getElementById('child-inr').value) || 1;
    const ascitis = parseInt(document.getElementById('child-ascitis').value) || 1;
    const encefalopatia = parseInt(document.getElementById('child-encefalopatia').value) || 1;
    
    const total = bilirrubina + albumina + inr + ascitis + encefalopatia;
    document.getElementById('child-total').textContent = total;
    
    let childClass = '';
    if (total <= 6) {
        childClass = 'Clase A';
    } else if (total <= 9) {
        childClass = 'Clase B';
    } else {
        childClass = 'Clase C';
    }
    
    document.getElementById('child-class').textContent = childClass;
    updateDashboard();
    generateConclusion();
}

/**
 * Updates the dashboard summary (progress, completed sections, alerts, warnings, findings).
 * This function iterates through all sections and checks for user input.
 */
function updateDashboard() {
    const sections = ['antecedentes', 'revision-sistemas', 'anamnesis', 'cavidad-oral', 'signos-vitales', 'inspeccion', 'auscultacion', 'percusion', 'palpacion', 'signos-especiales', 'organos', 'examen-adicional', 'escalas-severidad'];
    
    let currentCompletedSections = 0;
    let currentTotalFindings = 0;
    let currentTotalAlerts = 0;
    let currentTotalWarnings = 0;
    
    sections.forEach(sectionId => {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            // Check for any input within the section
            const checkboxes = sectionElement.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked');
            const numbers = sectionElement.querySelectorAll('input[type="number"]');
            const selects = sectionElement.querySelectorAll('select');
            const texts = sectionElement.querySelectorAll('input[type="text"]');
            
            let hasContent = checkboxes.length > 0;
            
            numbers.forEach(input => {
                if (input.value && input.value !== '0') hasContent = true;
            });
            
            selects.forEach(select => {
                if (select.selectedIndex > 0) hasContent = true;
            });
            
            texts.forEach(input => {
                if (input.value && input.value.trim() !== '') hasContent = true;
            });
            
            if (hasContent) {
                currentCompletedSections++;
                currentTotalFindings += checkboxes.length; // Count checked items as findings
                
                // Simple logic for alerts and warnings based on keywords or specific IDs
                checkboxes.forEach(checkbox => {
                    const label = checkbox.nextElementSibling ? checkbox.nextElementSibling.textContent.toLowerCase() : '';
                    
                    // Critical alerts (e.g., signs of peritonitis, rigidity)
                    if (label.includes('rigido') || label.includes('defensa') || 
                        label.includes('blumberg (+)') || label.includes('rovsing (+)') || 
                        label.includes('psoas (+)') || label.includes('murphy (+)') || 
                        label.includes('mcburney (+)') || label.includes('sangre oculta') ||
                        label.includes('melena') || label.includes('hematemesis')) {
                        currentTotalAlerts++;
                    } 
                    // Warnings (e.g., pain, distension, organomegaly)
                    else if (label.includes('dolor') || label.includes('distension') ||
                               label.includes('hepatomegalia') || label.includes('esplenomegalia') ||
                               label.includes('ictericia')) {
                        currentTotalWarnings++;
                    }
                });
            }
        }
    });
    
    // Update global variables and display
    examProgress = Math.round((currentCompletedSections / sections.length) * 100);
    sectionsCompleted = currentCompletedSections;
    alertCount = currentTotalAlerts;
    warningCount = currentTotalWarnings;
    findingsCount = currentTotalFindings;
    completenessStatus = `${examProgress}%`;

    document.getElementById('exam-progress').textContent = `${examProgress}%`;
    document.getElementById('sections-completed').textContent = `${sectionsCompleted}/${sections.length}`;
    document.getElementById('alert-count').textContent = alertCount;
    document.getElementById('warning-count').textContent = warningCount;
    document.getElementById('findings-count').textContent = findingsCount;
    document.getElementById('completeness-status').textContent = completenessStatus;
}

/**
 * Generates a simplified conclusion based on selected form inputs.
 * This function should be expanded for a more comprehensive report.
 */
function generateConclusion() {
    const conclusionEl = document.getElementById('conclusion-text');
    let conclusion = 'INFORME DEL EXAMEN GASTROENTEROLÓGICO:\n\n';
    
    // Helper functions to get input states
    const getLabelText = (id) => document.querySelector(`label[for="${id}"]`)?.textContent.toLowerCase() || '';
    const isChecked = (id) => document.getElementById(id)?.checked;
    const getInputValue = (id) => document.getElementById(id)?.value;
    const getSelectedOptionText = (id) => {
        const select = document.getElementById(id);
        return select ? select.options[select.selectedIndex].textContent : '';
    };

    // --- ANTECEDENTES ---
    conclusion += 'ANTECEDENTES:\n';
    const previousGI = [];
    document.querySelectorAll('#antecedentes .sub-section-card:nth-of-type(1) input[type="checkbox"]:checked').forEach(cb => {
        previousGI.push(getLabelText(cb.id));
    });
    if (previousGI.length > 0) {
        conclusion += `Enfermedades GI previas: ${previousGI.join(', ')}.\n`;
    } else {
        conclusion += 'Sin antecedentes de enfermedades GI relevantes.\n';
    }

    const surgeries = [];
    document.querySelectorAll('#antecedentes .sub-section-card:nth-of-type(2) input[type="checkbox"]:checked').forEach(cb => {
        surgeries.push(getLabelText(cb.id));
    });
    if (surgeries.length > 0) {
        conclusion += `Cirugías GI previas: ${surgeries.join(', ')}.\n`;
    } else {
        conclusion += 'Sin cirugías GI previas.\n';
    }

    const medications = [];
    document.querySelectorAll('#antecedentes .sub-section-card:nth-of-type(3) input[type="checkbox"]:checked').forEach(cb => {
        medications.push(getLabelText(cb.id));
    });
    if (isChecked('med-aines') && getInputValue('med-aines-tipo')) {
        medications.push(`AINEs (${getInputValue('med-aines-tipo')})`);
    }
    if (isChecked('med-anticoagulantes') && getInputValue('med-anticoag-tipo')) {
        medications.push(`Anticoagulantes (${getInputValue('med-anticoag-tipo')})`);
    }
    if (isChecked('med-antibioticos') && getInputValue('med-antibiot-tipo')) {
        medications.push(`Antibióticos recientes (${getInputValue('med-antibiot-tipo')})`);
    }
    if (medications.length > 0) {
        conclusion += `Medicamentos actuales/recientes: ${medications.join(', ')}.\n`;
    } else {
        conclusion += 'Sin medicamentos actuales/recientes relevantes.\n';
    }

    const allergiesHabits = [];
    document.querySelectorAll('#antecedentes .sub-section-card:nth-of-type(4) input[type="checkbox"]:checked').forEach(cb => {
        allergiesHabits.push(getLabelText(cb.id));
    });
    if (isChecked('alergia-medicamentos') && getInputValue('alergia-med-tipo')) {
        allergiesHabits.push(`Alergia a medicamentos (${getInputValue('alergia-med-tipo')})`);
    }
    if (isChecked('alergia-alimentos') && getInputValue('alergia-alim-tipo')) {
        allergiesHabits.push(`Alergia a alimentos (${getInputValue('alergia-alim-tipo')})`);
    }
    if (isChecked('habito-tabaco')) {
        const paq = getInputValue('habito-tabaco-paq');
        const años = getInputValue('habito-tabaco-años');
        allergiesHabits.push(`Tabaquismo (${paq ? paq + ' paq/día' : ''}${años ? ' por ' + años + ' años' : ''})`);
    }
    if (isChecked('habito-alcohol') && getInputValue('habito-alcohol-tipo')) {
        allergiesHabits.push(`Alcoholismo (${getInputValue('habito-alcohol-tipo')})`);
    }
    if (allergiesHabits.length > 0) {
        conclusion += `Alergias y hábitos: ${allergiesHabits.join(', ')}.\n`;
    } else {
        conclusion += 'Sin alergias o hábitos de riesgo significativos.\n';
    }
    conclusion += '\n';

    // --- ANAMNESIS Y QUEJAS PRINCIPALES ---
    conclusion += 'ANAMNESIS Y QUEJAS PRINCIPALES:\n';
    const complaints = [];
    if (isChecked('sin-quejas-gi')) {
        conclusion += 'Paciente refiere ausencia de quejas gastrointestinales.\n';
    } else {
        if (isChecked('dolor-abdominal')) {
            const dolorIntensidad = getInputValue('dolor-intensidad');
            const selectedQuadrants = Array.from(document.querySelectorAll('.abdomen-quadrant.selected')).map(el => el.textContent.trim().replace(/\s+/g, ' '));
            const dolorType = document.querySelector('input[name="tipo-dolor"]:checked');
            const dolorIrradiado = isChecked('dolor-irradiado') ? 'con irradiación' : '';
            const dolorNocturno = isChecked('dolor-nocturno') ? 'nocturno' : '';
            const dolorPostprandial = isChecked('dolor-postprandial') ? 'postprandial' : '';
            const dolorAyunas = isChecked('dolor-ayunas') ? 'en ayunas' : '';
            const dolorDefecacion = isChecked('dolor-defecacion') ? 'relacionado con la defecación' : '';
            
            let dolorDesc = `Dolor abdominal (EVA: ${dolorIntensidad}/10)`;
            if (selectedQuadrants.length > 0) dolorDesc += `, localizado en: ${selectedQuadrants.join(', ')}`;
            if (dolorType) dolorDesc += `, tipo: ${getLabelText(dolorType.id)}`;
            if (dolorIrradiado) dolorDesc += `, ${dolorIrradiado}`;
            if (dolorNocturno) dolorDesc += `, ${dolorNocturno}`;
            if (dolorPostprandial) dolorDesc += `, ${dolorPostprandial}`;
            if (dolorAyunas) dolorDesc += `, ${dolorAyunas}`;
            if (dolorDefecacion) dolorDesc += `, ${dolorDefecacion}`;
            complaints.push(dolorDesc);
        }
        if (isChecked('nauseas')) complaints.push('náuseas');
        if (isChecked('vomitos')) complaints.push('vómitos');
        if (isChecked('diarrea') || isChecked('estreñimiento')) {
            const bristolType = document.querySelector('input[name="bristol"]:checked');
            const frecuencia = getInputValue('frecuencia-deposiciones');
            let stoolDesc = '';
            if (isChecked('diarrea')) stoolDesc += 'Diarrea';
            if (isChecked('estreñimiento')) stoolDesc += 'Estreñimiento';
            if (bristolType) stoolDesc += `, Bristol: ${getLabelText(bristolType.id)}`;
            if (frecuencia) stoolDesc += `, ${frecuencia} veces/día`;
            if (isChecked('heces-con-sangre')) stoolDesc += ', con sangre visible';
            if (isChecked('heces-con-moco')) stoolDesc += ', con moco';
            if (isChecked('heces-con-pus')) stoolDesc += ', con pus';
            if (isChecked('heces-grasosas')) stoolDesc += ', esteatorrea';
            if (isChecked('heces-negras')) stoolDesc += ', melena';
            if (isChecked('heces-acolia')) stoolDesc += ', acólicas';
            complaints.push(stoolDesc);
        }
        if (isChecked('distension-abdominal')) complaints.push('distensión abdominal');
        if (isChecked('acidez')) complaints.push('acidez/pirosis');
        if (isChecked('regurgitacion')) complaints.push('regurgitación');
        if (isChecked('disfagia')) complaints.push('disfagia');
        if (isChecked('odinofagia')) complaints.push('odinofagia');
        if (isChecked('melena') && !isChecked('dolor-abdominal')) complaints.push('melena'); // Only if not already covered by pain
        if (isChecked('rectorragia')) complaints.push('rectorragia');
        if (isChecked('hematemesis')) complaints.push('hematemesis');
        if (isChecked('ictericia') && !isChecked('sin-quejas-gi')) complaints.push('ictericia'); // Only if not already covered by "no complaints"
        if (isChecked('perdida-peso')) complaints.push('pérdida de peso');
        if (isChecked('anorexia')) complaints.push('anorexia');
        if (isChecked('saciedad-precoz')) complaints.push('saciedad precoz');
        if (isChecked('flatulencia')) complaints.push('flatulencia');
        if (isChecked('eructos')) complaints.push('eructos');

        if (complaints.length > 0) {
            conclusion += `Quejas principales: ${complaints.join('; ')}.\n`;
        } else {
            conclusion += 'No se registraron quejas gastrointestinales específicas.\n';
        }

        const triggers = [];
        document.querySelectorAll('#anamnesis .sub-section-card:nth-of-type(3) input[type="checkbox"]:checked').forEach(cb => {
            triggers.push(getLabelText(cb.id));
        });
        if (triggers.length > 0) {
            conclusion += `Factores desencadenantes/asociados: ${triggers.join(', ')}.\n`;
        } else {
            conclusion += 'No se identificaron factores desencadenantes o asociados específicos.\n';
        }
    }
    conclusion += '\n';

    // --- EXAMEN FÍSICO ---
    conclusion += 'EXAMEN FÍSICO:\n';

    // Cavidad Oral
    conclusion += 'Cavidad Oral:\n';
    const oralLabios = [];
    document.querySelectorAll('#cavidad-oral .sub-section-card:nth-of-type(1) input[type="checkbox"]:checked').forEach(cb => {
        oralLabios.push(getLabelText(cb.id));
    });
    if (oralLabios.length > 0) {
        conclusion += `Labios y región perioral: ${oralLabios.join(', ')}.\n`;
    } else {
        conclusion += 'Labios y región perioral sin alteraciones aparentes.\n';
    }

    const oralMucosa = [];
    document.querySelectorAll('#cavidad-oral .sub-section-card:nth-of-type(2) input[type="checkbox"]:checked').forEach(cb => {
        oralMucosa.push(getLabelText(cb.id));
    });
    if (oralMucosa.length > 0) {
        conclusion += `Mucosa oral y encías: ${oralMucosa.join(', ')}.\n`;
    } else {
        conclusion += 'Mucosa oral y encías sin alteraciones aparentes.\n';
    }
    conclusion += '\n';

    // Signos Vitales
    conclusion += 'Signos Vitales:\n';
    const pas = getInputValue('pa-sistolica');
    const pad = getInputValue('pa-diastolica');
    const fc = getInputValue('frecuencia-cardiaca');
    const temp = getInputValue('temperatura');
    const satO2 = getInputValue('saturacion');

    if (pas && pad) conclusion += `Presión arterial: ${pas}/${pad} mmHg. `;
    if (fc) conclusion += `Frecuencia cardíaca: ${fc} lpm. `;
    if (temp) conclusion += `Temperatura: ${temp}°C. `;
    if (satO2) conclusion += `Saturación O2: ${satO2}%.`;
    if (!pas && !pad && !fc && !temp && !satO2) conclusion += 'No se registraron signos vitales.\n';
    conclusion += '\n\n';

    // Estado General
    conclusion += 'Estado General:\n';
    const generalState = [];
    document.querySelectorAll('#signos-vitales .sub-section-card:nth-of-type(2) input[type="checkbox"]:checked').forEach(cb => {
        generalState.push(getLabelText(cb.id));
    });
    if (generalState.length > 0) {
        conclusion += `Estado general: ${generalState.join(', ')}.\n`;
    } else {
        conclusion += 'Buen estado general, sin hallazgos relevantes.\n';
    }
    conclusion += '\n';

    // Inspección Abdominal
    conclusion += 'Inspección del Abdomen:\n';
    const abdomenForm = document.querySelector('input[name="forma-abdomen"]:checked');
    if (abdomenForm) {
        conclusion += `Forma y contorno: ${getLabelText(abdomenForm.id)}.\n`;
    } else {
        conclusion += 'Forma y contorno abdominal normal.\n';
    }
    const visibleFindings = [];
    document.querySelectorAll('#inspeccion .sub-section-card:nth-of-type(2) input[type="checkbox"]:checked').forEach(cb => {
        visibleFindings.push(getLabelText(cb.id));
    });
    if (visibleFindings.length > 0) {
        conclusion += `Hallazgos visibles: ${visibleFindings.join(', ')}.\n`;
    } else {
        conclusion += 'Sin hallazgos visibles anormales.\n';
    }
    conclusion += '\n';

    // Auscultación Abdominal
    conclusion += 'Auscultación Abdominal:\n';
    const ruidosHidroaereos = document.querySelector('input[name="ruidos-hidroaereos"]:checked');
    if (ruidosHidroaereos) {
        conclusion += `Ruidos hidroaéreos: ${getLabelText(ruidosHidroaereos.id)}. `;
    } else {
        conclusion += 'Ruidos hidroaéreos normales. ';
    }
    const frecuenciaRuidos = getInputValue('frecuencia-ruidos');
    if (frecuenciaRuidos) {
        conclusion += `Frecuencia: ${frecuenciaRuidos} ruidos/min.\n`;
    } else {
        conclusion += '\n';
    }
    conclusion += '\n';

    // Percusión Abdominal
    conclusion += 'Percusión Abdominal:\n';
    const percussionFindings = [];
    document.querySelectorAll('#percusion .sub-section-card:nth-of-type(1) input[type="checkbox"]:checked').forEach(cb => {
        percussionFindings.push(getLabelText(cb.id));
    });
    if (percussionFindings.length > 0) {
        conclusion += `Hallazgos: ${percussionFindings.join(', ')}.\n`;
    } else {
        conclusion += 'Timpanismo normal en todos los cuadrantes.\n';
    }
    const bordeHepatico = getInputValue('borde-hepatico');
    if (bordeHepatico) conclusion += `Hígado palpable ${bordeHepatico} cm bajo reborde costal.\n`;
    const matidezHepatica = getInputValue('matidez-hepatica');
    if (matidezHepatica) conclusion += `Matidez hepática: ${matidezHepatica} cm.\n`;
    conclusion += '\n';

    // Palpación Abdominal
    conclusion += 'Palpación Abdominal:\n';
    const superficialPalpation = [];
    document.querySelectorAll('#palpacion .sub-section-card:nth-of-type(1) input[type="checkbox"]:checked').forEach(cb => {
        superficialPalpation.push(getLabelText(cb.id));
    });
    if (superficialPalpation.length > 0) {
        conclusion += `Superficial: ${superficialPalpation.join(', ')}.\n`;
    } else {
        conclusion += 'Abdomen blando y depresible a la palpación superficial.\n';
    }
    const deepPalpation = [];
    document.querySelectorAll('#palpacion .sub-section-card:nth-of-type(2) input[type="checkbox"]:checked').forEach(cb => {
        deepPalpation.push(getLabelText(cb.id));
    });
    if (deepPalpation.length > 0) {
        conclusion += `Profunda: ${deepPalpation.join(', ')}.\n`;
    } else {
        conclusion += 'Sin masas ni organomegalias a la palpación profunda.\n';
    }
    conclusion += '\n';

    // Signos Específicos
    conclusion += 'Signos Específicos y Maniobras:\n';
    const irritationSigns = [];
    document.querySelectorAll('#signos-especiales .sub-section-card:nth-of-type(1) input[type="checkbox"]:checked').forEach(cb => {
        irritationSigns.push(getLabelText(cb.id));
    });
    if (irritationSigns.length > 0) {
        conclusion += `Irritación peritoneal: ${irritationSigns.join(', ')}.\n`;
    } else {
        conclusion += 'Signos de irritación peritoneal negativos.\n';
    }
    conclusion += '\n';

    // Órganos Específicos
    conclusion += 'Evaluación de Órganos Específicos:\n';
    const liverFindings = [];
    document.querySelectorAll('#organos .sub-section-card:nth-of-type(1) input[type="checkbox"]:checked').forEach(cb => {
        liverFindings.push(getLabelText(cb.id));
    });
    if (liverFindings.length > 0) {
        conclusion += `Hígado: ${liverFindings.join(', ')}. `;
    } else {
        conclusion += 'Hígado no palpable. ';
    }
    const hepatomegalyCm = getInputValue('hepatomegalia-cm');
    if (hepatomegalyCm) conclusion += `Tamaño: ${hepatomegalyCm} cm bajo reborde costal.\n`;
    else conclusion += '\n';

    const spleenFindings = [];
    document.querySelectorAll('#organos .sub-section-card:nth-of-type(2) input[type="checkbox"]:checked').forEach(cb => {
        spleenFindings.push(getLabelText(cb.id));
    });
    if (spleenFindings.length > 0) {
        conclusion += `Bazo: ${spleenFindings.join(', ')}. `;
    } else {
        conclusion += 'Bazo no palpable. ';
    }
    const splenomegalyCm = getInputValue('esplenomegalia-cm');
    if (splenomegalyCm) conclusion += `Tamaño: ${splenomegalyCm} cm bajo reborde costal.\n`;
    else conclusion += '\n';
    conclusion += '\n';

    // Examen Adicional
    conclusion += 'EXAMEN ADICIONAL:\n';
    const skinFindings = [];
    document.querySelectorAll('#examen-adicional .sub-section-card:nth-of-type(1) input[type="checkbox"]:checked').forEach(cb => {
        skinFindings.push(getLabelText(cb.id));
    });
    if (skinFindings.length > 0) {
        conclusion += `Piel y faneras: ${skinFindings.join(', ')}.\n`;
    } else {
        conclusion += 'Piel y faneras sin hallazgos relevantes.\n';
    }

    const lymphNodes = [];
    document.querySelectorAll('#examen-adicional .sub-section-card:nth-of-type(2) input[type="checkbox"]:checked').forEach(cb => {
        lymphNodes.push(getLabelText(cb.id));
    });
    if (lymphNodes.length > 0) {
        conclusion += `Ganglios linfáticos: ${lymphNodes.join(', ')}.\n`;
    } else {
        conclusion += 'Sin adenopatías palpables.\n';
    }

    const rectalExam = [];
    document.querySelectorAll('#examen-adicional .sub-section-card:nth-of-type(3) input[type="checkbox"]:checked').forEach(cb => {
        rectalExam.push(getLabelText(cb.id));
    });
    if (rectalExam.length > 0) {
        conclusion += `Tacto rectal: ${rectalExam.join(', ')}.\n`;
    } else {
        conclusion += 'No se realizó tacto rectal o sin hallazgos relevantes.\n';
    }
    conclusion += '\n';

    // --- ESCALAS DE SEVERIDAD ---
    conclusion += 'EVALUACIÓN DE SEVERIDAD Y ESCALAS:\n';
    const glasgowTotal = document.getElementById('glasgow-total').textContent;
    if (glasgowTotal && parseInt(glasgowTotal) > 0) {
        conclusion += `Escala de Glasgow-Blatchford: ${glasgowTotal} puntos (riesgo de hemorragia GI alta). `;
    } else {
        conclusion += 'Escala de Glasgow-Blatchford: 0 puntos (bajo riesgo de hemorragia GI alta). ';
    }
    
    const childTotal = document.getElementById('child-total').textContent;
    const childClass = document.getElementById('child-class').textContent;
    if (childTotal && parseInt(childTotal) !== 5) { // Default is 5 (Class A)
        conclusion += `Clasificación de Child-Pugh: ${childTotal} puntos (${childClass}).\n`;
    } else {
        conclusion += `Clasificación de Child-Pugh: ${childTotal} puntos (${childClass}) - función hepática conservada.\n`;
    }

    const functionalImpact = [];
    document.querySelectorAll('#escalas-severidad .sub-section-card:nth-of-type(2) input[type="checkbox"]:checked').forEach(cb => {
        functionalImpact.push(getLabelText(cb.id));
    });
    if (functionalImpact.length > 0) {
        conclusion += `Impacto funcional: ${functionalImpact.join(', ')}.\n`;
    } else {
        conclusion += 'Sin impacto funcional significativo reportado.\n';
    }
    const imc = getInputValue('imc');
    if (imc) conclusion += `IMC: ${imc} kg/m². `;
    if (isChecked('perdida-peso-significativa')) conclusion += 'Pérdida de peso >5% en 6 meses. ';
    if (isChecked('sarcopenia')) conclusion += 'Signos de sarcopenia. ';
    if (isChecked('malnutricion')) conclusion += 'Signos de malnutrición.';
    conclusion += '\n\n';

    // --- RESUMEN Y RECOMENDACIONES ---
    conclusion += 'RESUMEN Y HALLAZGOS CLAVE:\n';
    if (alertCount > 0) {
        conclusion += `Se identifican ${alertCount} alertas críticas que requieren atención inmediata. `;
    }
    if (warningCount > 0) {
        conclusion += `${warningCount} hallazgos importantes que deben ser investigados. `;
    }
    conclusion += `Total de hallazgos registrados: ${findingsCount}. `;
    conclusion += `Completitud del examen: ${examProgress}%\n\n`;
    
    conclusion += 'IMPRESIÓN DIAGNÓSTICA PRELIMINAR:\n[Basado en los hallazgos, considere diagnósticos diferenciales como...]\n\n';
    conclusion += 'RECOMENDACIONES Y PLAN DE ACCIÓN:\n[Se sugiere realizar estudios complementarios como..., iniciar tratamiento con..., y seguimiento en...]';
    
    conclusionEl.textContent = conclusion;
}


/**
 * Updates the sticky report panel content with the current conclusion.
 */
function generateStickyConclusion() {
    generateConclusion(); // Ensure the main conclusion is up-to-date
    const stickyContent = document.getElementById('stickyContent');
    const conclusionText = document.getElementById('conclusion-text').textContent;
    stickyContent.textContent = conclusionText;
}

/**
 * Copies the content of the sticky report panel to the clipboard.
 */
function copyStickyToClipboard() {
    const stickyContent = document.getElementById('stickyContent').textContent;
    // Use document.execCommand('copy') for better compatibility in iframes
    const textarea = document.createElement('textarea');
    textarea.value = stickyContent;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        // Replace alert with a custom modal or toast for better UX
        showCustomAlert('¡Informe copiado al portapapeles!');
    } catch (err) {
        console.error('Error al copiar: ', err);
        showCustomAlert('No se pudo copiar el texto. Por favor, copie manualmente.');
    }
    document.body.removeChild(textarea);
}

/**
 * Prints the generated conclusion.
 */
function printConclusion() {
    const conclusion = document.getElementById('conclusion-text').textContent;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Conclusión Examen Gastroenterológico</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                pre { white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>Examen Gastroenterológico - Conclusión</h1>
            <p>Fecha: ${new Date().toLocaleDateString()}</p>
            <pre>${conclusion}</pre>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

/**
 * Prints the content of the sticky report panel.
 */
function printStickyConclusion() {
    printConclusion(); // Re-use the main print function
}

/**
 * Clears all form inputs and resets the dashboard and conclusion.
 */
function clearForm() {
    // Replace confirm with a custom modal for better UX
    showCustomConfirm('¿Está seguro de que desea limpiar todos los datos del formulario?', () => {
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            cb.disabled = false; // Ensure disabled fields are re-enabled
            cb.style.backgroundColor = ''; // Clear any highlights
            cb.style.border = '';
        });
        document.querySelectorAll('input[type="radio"]').forEach(rb => rb.checked = false);
        document.querySelectorAll('input[type="number"]').forEach(nb => nb.value = '');
        document.querySelectorAll('input[type="text"]').forEach(tb => tb.value = '');
        document.querySelectorAll('input[type="range"]').forEach(rb => rb.value = 0);
        document.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
        
        document.getElementById('dolor-value').textContent = '0';
        document.getElementById('glasgow-total').textContent = '0';
        document.getElementById('child-total').textContent = '5'; // Reset to default Child-Pugh A
        document.getElementById('child-class').textContent = 'Clase A';
        
        // Hide conditional sections
        document.getElementById('dolor-section').classList.add('hidden');
        document.getElementById('deposiciones-section').classList.add('hidden');
        
        // Clear selected abdomen quadrants
        document.querySelectorAll('.abdomen-quadrant.selected').forEach(quad => {
            quad.classList.remove('selected');
        });
        
        // Recalculate and regenerate after clearing
        updateDolorValue(0); // Ensure dolor value is reset
        calculateChildPugh(); // Recalculate Child-Pugh to reset to default
        calculateGlasgow(); // Recalculate Glasgow to reset to default
        updateDashboard();
        generateConclusion();
        generateStickyConclusion(); // Also update sticky panel
    });
}

/**
 * Custom alert function to replace native alert().
 * @param {string} message The message to display.
 */
function showCustomAlert(message) {
    // A simple implementation for demonstration.
    // In a real app, this would be a styled modal.
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background-color: #4A90E2; color: white; padding: 20px; border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 2000; text-align: center;
        font-family: 'Inter', sans-serif;
    `;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.remove();
    }, 2000); // Remove after 2 seconds
}

/**
 * Custom confirm function to replace native confirm().
 * @param {string} message The confirmation message.
 * @param {Function} onConfirm Callback function if user confirms.
 */
function showCustomConfirm(message, onConfirm) {
    const confirmOverlay = document.createElement('div');
    confirmOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.5); z-index: 1999;
        display: flex; justify-content: center; align-items: center;
    `;

    const confirmBox = document.createElement('div');
    confirmBox.style.cssText = `
        background-color: var(--card-bg-light); padding: 30px; border-radius: 15px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.4); text-align: center; max-width: 400px;
        font-family: 'Inter', sans-serif; color: var(--text-dark);
    `;
    confirmBox.innerHTML = `
        <p class="text-lg font-semibold mb-6">${message}</p>
        <div class="flex justify-center gap-4">
            <button id="confirm-yes" class="btn btn-primary">Sí</button>
            <button id="confirm-no" class="btn btn-secondary">No</button>
        </div>
    `;
    document.body.appendChild(confirmOverlay);
    confirmOverlay.appendChild(confirmBox);

    document.getElementById('confirm-yes').onclick = () => {
        onConfirm();
        confirmOverlay.remove();
    };
    document.getElementById('confirm-no').onclick = () => {
        confirmOverlay.remove();
    };
}


// Initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }

    // Add event listeners to all section headers for toggling
    document.querySelectorAll('.section-header-main').forEach(header => {
        header.addEventListener('click', () => toggleSection(header));
    });

    // Add change/input listeners to all form elements to update dashboard and conclusion
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', () => {
            updateDashboard();
            generateConclusion();
            generateStickyConclusion(); // Update sticky panel on any form change
        });
        el.addEventListener('input', () => { // For range inputs and text inputs
            updateDashboard();
            generateConclusion();
            generateStickyConclusion(); // Update sticky panel on any form change
        });
    });

    // Initial calculations and UI updates on page load
    expandAllSections(); // Start with all sections expanded for easier initial view
    calculateChildPugh();
    calculateGlasgow();
    updateDashboard();
    generateConclusion();
    generateStickyConclusion(); // Generate initial content for sticky panel
});

// Note: The original code had `updateVitalsSummary` called directly on `onchange` for vital signs.
// This is now handled by the general `el.addEventListener('change')` and `el.addEventListener('input')`
// which calls `updateDashboard()` and `generateConclusion()`.
// The `updateVitalsSummary` function itself is no longer strictly necessary as a separate call,
// but its logic is implicitly part of `updateDashboard`.
// For clarity, I've kept an empty `updateVitalsSummary` function, but it could be removed if desired.
function updateVitalsSummary() {
    // This function is called by onchange events in HTML.
    // Its logic is now covered by the general event listeners in DOMContentLoaded
    // which call updateDashboard() and generateConclusion().
    // No specific logic needed here.
}
