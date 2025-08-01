// ========== VARIABLES GLOBALES Y CONSTANTES ==========
let examProgress = 0;
let sectionsCompleted = 0;
let alertCount = 0;
let warningCount = 0;
let findingsCount = 0;
let qualityOfLifeStatus = 'Pendiente';

// Variables específicas de dermatología
let selectedBodyAreas = new Set();
let abcdeScore = 0;
let pasiTotal = 0;
let scoradTotal = 0;
let dlqiTotal = 0;

// Constantes de diseño
const MAIN_SIDEBAR_WIDTH = 250;
const COLLAPSED_SIDEBAR_WIDTH = 80;
const REPORT_PANEL_WIDTH = 400;
const TOP_BAR_HEIGHT = 72;

// ========== FUNCIONES DE UTILIDAD GENERAL ==========

function getInputValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

function isChecked(id) {
    const element = document.getElementById(id);
    return element ? element.checked : false;
}

function getLabelText(id) {
    const label = document.querySelector(`label[for="${id}"]`);
    return label ? label.textContent.trim() : '';
}

function getSelectedText(id) {
    const select = document.getElementById(id);
    return select && select.selectedOptions.length > 0 ? select.selectedOptions[0].text : '';
}

function getSelectedRadioValue(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : '';
}

function setElementText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}

function setElementColor(id, color) {
    const element = document.getElementById(id);
    if (element) element.style.color = color;
}

// ========== FUNCIONES DE TEMA Y NAVEGACIÓN ==========

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.getElementById('sidebar-toggle-icon');
    
    if (sidebar) {
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            if (toggleIcon) toggleIcon.className = 'fas fa-chevron-left';
        } else {
            sidebar.classList.add('collapsed');
            if (toggleIcon) toggleIcon.className = 'fas fa-chevron-right';
        }
        updateLayout();
    }
}

function toggleSection(headerElement) {
    if (!headerElement) return;
    
    const sectionContainer = headerElement.closest('.section-container');
    const content = sectionContainer?.querySelector('.section-content-main');
    const arrow = headerElement.querySelector('.section-arrow');
    
    if (!sectionContainer || !content) return;
    
    if (sectionContainer.classList.contains('expanded')) {
        content.style.maxHeight = '0px';
        sectionContainer.classList.remove('expanded');
        if (arrow) {
            arrow.classList.remove('fa-chevron-up');
            arrow.classList.add('fa-chevron-down');
        }
    } else {
        sectionContainer.classList.add('expanded');
        content.style.maxHeight = content.scrollHeight + 'px';
        if (arrow) {
            arrow.classList.remove('fa-chevron-down');
            arrow.classList.add('fa-chevron-up');
        }
        
        setTimeout(() => {
            if (sectionContainer.classList.contains('expanded')) {
                content.style.maxHeight = 'none';
            }
        }, 300);
    }
}

function toggleDermatologiaSubMenu(event) {
    if (event) event.preventDefault();
    
    const dermaNavLink = document.getElementById('dermatologia-nav-link');
    const dermaSubMenu = document.getElementById('dermatologia-sub-menu');

    if (!dermaNavLink || !dermaSubMenu) return;

    dermaNavLink.classList.toggle('active');

    if (dermaNavLink.classList.contains('active')) {
        dermaSubMenu.style.maxHeight = dermaSubMenu.scrollHeight + 'px';
    } else {
        dermaSubMenu.style.maxHeight = '0';
    }

    document.querySelectorAll('.nav-link.active:not(#dermatologia-nav-link)').forEach(otherLink => {
        otherLink.classList.remove('active');
        const otherSubMenu = otherLink.nextElementSibling;
        if (otherSubMenu?.classList.contains('sub-menu')) {
            otherSubMenu.style.maxHeight = '0';
        }
    });

    updateLayout();
}

function toggleStickyPanel() {
    const panel = document.getElementById('stickyReportPanel');
    if (!panel) return;
    
    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
        generateStickyConclusion();
    }
    
    updateLayout();
}

function updateLayout() {
    const contentArea = document.getElementById('contentArea');
    const sidebar = document.getElementById('sidebar');
    const stickyReportPanel = document.getElementById('stickyReportPanel');
    const topBar = document.getElementById('topBar');

    if (!contentArea || !sidebar || !topBar) return;

    let leftMargin = 0;
    let rightMargin = 0;

    if (window.innerWidth > 768) {
        leftMargin = sidebar.classList.contains('collapsed') ? COLLAPSED_SIDEBAR_WIDTH : MAIN_SIDEBAR_WIDTH;
    }

    if (stickyReportPanel?.classList.contains('active') && window.innerWidth > 768) {
        rightMargin = REPORT_PANEL_WIDTH;
    }

    contentArea.style.marginLeft = leftMargin + 'px';
    contentArea.style.marginRight = rightMargin + 'px';

    topBar.style.left = leftMargin + 'px';
    topBar.style.right = rightMargin + 'px';
    topBar.style.width = 'auto';
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    const sectionContainer = section.closest('.section-container');
    if (sectionContainer && !sectionContainer.classList.contains('expanded')) {
        const header = sectionContainer.querySelector('.section-header-main');
        if (header) toggleSection(header);
    }
}

function expandAllSections() {
    document.querySelectorAll('.section-container:not(.expanded)').forEach(container => {
        const header = container.querySelector('.section-header-main');
        if (header) toggleSection(header);
    });
}

function collapseAllSections() {
    document.querySelectorAll('.section-container.expanded').forEach(container => {
        const header = container.querySelector('.section-header-main');
        if (header) toggleSection(header);
    });
}

// ========== FUNCIONES DE ANTECEDENTES Y ANAMNESIS ==========

function toggleSpecification(checkboxId, specFieldId) {
    const checkbox = document.getElementById(checkboxId);
    const specField = document.getElementById(specFieldId);
    
    if (!checkbox || !specField) return;
    
    if (checkbox.checked) {
        specField.classList.add('show');
        specField.focus();
    } else {
        specField.classList.remove('show');
        specField.value = '';
    }
    updateDashboard();
}

function toggleSinAlergias() {
    const sinAlergiasCheckbox = document.getElementById('sin-alergias');
    const otherAllergyCheckboxes = document.querySelectorAll('#antecedentes input[type="checkbox"]:not(#sin-alergias)');
    
    if (!sinAlergiasCheckbox) return;
    
    otherAllergyCheckboxes.forEach(checkbox => {
        checkbox.disabled = sinAlergiasCheckbox.checked;
        if (sinAlergiasCheckbox.checked) {
            checkbox.checked = false;
            // Ocultar campos de especificación
            const specField = document.getElementById(checkbox.id.replace('alergia-', 'spec-'));
            if (specField) {
                specField.classList.remove('show');
                specField.value = '';
            }
        }
    });
    updateDashboard();
}

function toggleSinAntecedentesFam() {
    const sinAntecedentesFamCheckbox = document.getElementById('sin-antec-fam');
    const otherFamCheckboxes = document.querySelectorAll('#antecedentes input[type="checkbox"]:not(#sin-antec-fam):not([id*="sin-alergias"])');
    
    if (!sinAntecedentesFamCheckbox) return;
    
    otherFamCheckboxes.forEach(checkbox => {
        if (checkbox.id.startsWith('fam-')) {
            checkbox.disabled = sinAntecedentesFamCheckbox.checked;
            if (sinAntecedentesFamCheckbox.checked) checkbox.checked = false;
        }
    });
    updateDashboard();
}

function handleNoComplaints() {
    const noComplaintsCheckbox = document.getElementById('sin-quejas');
    const otherCheckboxes = document.querySelectorAll('#anamnesis input[type="checkbox"]:not(#sin-quejas)');
    
    if (!noComplaintsCheckbox) return;
    
    otherCheckboxes.forEach(checkbox => {
        checkbox.disabled = noComplaintsCheckbox.checked;
        if (noComplaintsCheckbox.checked) checkbox.checked = false;
    });
    updateDashboard();
}

function handleMutuallyExclusive(positiveId, negativeId, checkbox) {
    if (!checkbox.checked) return;
    
    const oppositeId = checkbox.id === positiveId ? negativeId : positiveId;
    const oppositeCheckbox = document.getElementById(oppositeId);
    if (oppositeCheckbox) oppositeCheckbox.checked = false;
    
    updateDashboard();
}

// ========== FUNCIONES DE EVALUACIÓN ABCDE ==========

function toggleABCDESection() {
    const tieneNevus = isChecked('tiene-nevus');
    const lesionSospechosa = isChecked('lesion-sospechosa');
    const abcdeSection = document.getElementById('abcde-evaluation');
    
    if (!abcdeSection) return;
    
    if (tieneNevus || lesionSospechosa) {
        abcdeSection.style.display = 'block';
        setTimeout(evaluateABCDE, 100);
    } else {
        abcdeSection.style.display = 'none';
        resetABCDEScore();
    }
    updateDashboard();
}

function evaluateABCDE() {
    let score = 0;
    let riskFactors = [];
    
    // A - Asimetría
    if (getSelectedRadioValue('abcde-asimetria') === 'asimetria-si') {
        score++;
        riskFactors.push('Asimetría');
    }
    
    // B - Bordes
    if (getSelectedRadioValue('abcde-bordes') === 'bordes-irregulares') {
        score++;
        riskFactors.push('Bordes irregulares');
    }
    
    // C - Color (múltiples colores o más de 2 colores)
    const colors = ['color-negro', 'color-marron', 'color-azul', 'color-rojo', 'color-blanco'];
    const colorCount = colors.filter(id => isChecked(id)).length;
    if (colorCount >= 2) {
        score++;
        riskFactors.push('Múltiples colores');
    }
    
    // D - Diámetro
    const diametro = parseFloat(getInputValue('abcde-diametro')) || 0;
    if (diametro > 6) {
        score++;
        riskFactors.push('Diámetro > 6mm');
        document.getElementById('diametro-mayor-6').checked = true;
        document.getElementById('diametro-menor-6').checked = false;
    } else if (diametro > 0) {
        document.getElementById('diametro-mayor-6').checked = false;
        document.getElementById('diametro-menor-6').checked = true;
    }
    
    // E - Evolución
    const evolution = ['evol-tamaño', 'evol-forma', 'evol-color', 'evol-sintomas'];
    if (evolution.some(id => isChecked(id))) {
        score++;
        riskFactors.push('Cambios recientes');
    }
    
    abcdeScore = score;
    
    // Actualizar display
    setElementText('abcde-score', `${score}/5`);
    
    let riskLevel = '';
    let riskColor = '';
    let recommendation = '';
    
    if (score === 0) {
        riskLevel = 'Muy bajo';
        riskColor = 'var(--normal-color)';
        recommendation = 'Seguimiento de rutina';
    } else if (score === 1) {
        riskLevel = 'Bajo';
        riskColor = 'var(--normal-color)';
        recommendation = 'Control en 6-12 meses';
    } else if (score === 2) {
        riskLevel = 'Moderado';
        riskColor = 'var(--warning-color)';
        recommendation = 'Evaluación dermatológica en 1-3 meses';
    } else if (score >= 3) {
        riskLevel = 'Alto';
        riskColor = 'var(--alert-color)';
        recommendation = 'DERIVACIÓN URGENTE a dermatología';
    }
    
    setElementText('abcde-risk', riskLevel);
    setElementColor('abcde-risk', riskColor);
    setElementText('abcde-recommendation', recommendation);
    setElementColor('abcde-recommendation', riskColor);
    
    updateDashboard();
}

function evaluateDiameter() {
    const diameter = parseFloat(getInputValue('abcde-diametro')) || 0;
    const mayor6 = document.getElementById('diametro-mayor-6');
    const menor6 = document.getElementById('diametro-menor-6');
    
    if (diameter > 6) {
        if (mayor6) mayor6.checked = true;
        if (menor6) menor6.checked = false;
    } else if (diameter > 0) {
        if (mayor6) mayor6.checked = false;
        if (menor6) menor6.checked = true;
    }
    
    evaluateABCDE();
}

function resetABCDEScore() {
    abcdeScore = 0;
    setElementText('abcde-score', '0/5');
    setElementText('abcde-risk', 'Bajo');
    setElementText('abcde-recommendation', 'Seguimiento de rutina');
    setElementColor('abcde-risk', '');
    setElementColor('abcde-recommendation', '');
}

// ========== FUNCIONES DE ESCALAS DE SEVERIDAD ==========

function updatePruritoValue(value) {
    setElementText('prurito-value', value);
    updateDashboard();
}

function calculatePASI() {
    const eritema = parseInt(getInputValue('pasi-eritema')) || 0;
    const infiltracion = parseInt(getInputValue('pasi-infiltracion')) || 0;
    const descamacion = parseInt(getInputValue('pasi-descamacion')) || 0;
    const areaCabeza = parseInt(getInputValue('pasi-area-cabeza')) || 0;
    
    // Fórmula simplificada para demostración
    pasiTotal = eritema + infiltracion + descamacion + areaCabeza;
    
    setElementText('pasi-total', pasiTotal.toFixed(1));
    
    evaluatePASISeverity(pasiTotal);
    updateDashboard();
}

function evaluatePASISeverity(score) {
    let severity = '';
    let color = '';
    
    if (score <= 2) {
        severity = 'Leve';
        color = 'var(--normal-color)';
    } else if (score <= 6) {
        severity = 'Moderada';
        color = 'var(--warning-color)';
    } else {
        severity = 'Severa';
        color = 'var(--alert-color)';
    }
    
    const severityElement = document.getElementById('pasi-severity');
    if (severityElement) {
        setElementText('pasi-severity', severity);
        setElementColor('pasi-severity', color);
    }
}

function calculateSCORAD() {
    const extension = parseFloat(getInputValue('scorad-extension')) || 0;
    const eritema = parseInt(getInputValue('scorad-eritema')) || 0;
    const edema = parseInt(getInputValue('scorad-edema')) || 0;
    const excoriacion = parseInt(getInputValue('scorad-excoriacion')) || 0;
    const liquenificacion = parseInt(getInputValue('scorad-liquenificacion')) || 0;
    const descamacion = parseInt(getInputValue('scorad-descamacion')) || 0;
    const xerosis = parseInt(getInputValue('scorad-xerosis')) || 0;
    const prurito = parseInt(getInputValue('scorad-prurito')) || 0;
    const sueño = parseInt(getInputValue('scorad-sueno')) || 0;

    const A = extension;
    const B = eritema + edema + excoriacion + liquenificacion + descamacion + xerosis;
    const C = prurito + sueño;
    
    scoradTotal = (A/5 + 7*B/2 + C);
    
    setElementText('scorad-total', scoradTotal.toFixed(1));
    
    evaluateSCORADSeverity(scoradTotal);
    updateDashboard();
}

function evaluateSCORADSeverity(score) {
    let severity = '';
    let color = '';
    
    if (score < 25) {
        severity = 'Leve';
        color = 'var(--normal-color)';
    } else if (score < 50) {
        severity = 'Moderada';
        color = 'var(--warning-color)';
    } else {
        severity = 'Severa';
        color = 'var(--alert-color)';
    }
    
    const severityElement = document.getElementById('scorad-severity');
    if (severityElement) {
        setElementText('scorad-severity', severity);
        setElementColor('scorad-severity', color);
    }
}

function calculateDLQI() {
    let total = 0;
    
    for (let i = 1; i <= 2; i++) {
        const selected = document.querySelector(`input[name="dlqi-${i}"]:checked`);
        if (selected) {
            total += parseInt(selected.value);
        }
    }
    
    dlqiTotal = total;
    setElementText('dlqi-total', total);
    
    let interpretation = '';
    let color = '';
    
    if (total <= 1) {
        interpretation = 'Sin impacto en la calidad de vida';
        color = 'var(--normal-color)';
        qualityOfLifeStatus = 'Sin impacto';
    } else if (total <= 5) {
        interpretation = 'Impacto pequeño en la calidad de vida';
        color = 'var(--normal-color)';
        qualityOfLifeStatus = 'Impacto leve';
    } else if (total <= 10) {
        interpretation = 'Impacto moderado en la calidad de vida';
        color = 'var(--warning-color)';
        qualityOfLifeStatus = 'Impacto moderado';
    } else {
        interpretation = 'Impacto muy grande en la calidad de vida';
        color = 'var(--alert-color)';
        qualityOfLifeStatus = 'Impacto alto';
    }
    
    setElementText('dlqi-interpretation', interpretation);
    setElementColor('dlqi-interpretation', color);
    
    updateDashboard();
}

// ========== FUNCIONES DE MAPA CORPORAL ==========

function setupBodyMap() {
    const bodyParts = document.querySelectorAll('.body-part');
    bodyParts.forEach(part => {
        part.addEventListener('click', function() {
            const area = this.getAttribute('data-area');
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedBodyAreas.delete(area);
            } else {
                this.classList.add('selected');
                selectedBodyAreas.add(area);
            }
            updateSelectedAreas();
        });
    });
}

function updateSelectedAreas() {
    const frontAreas = document.getElementById('selected-areas-front');
    const backAreas = document.getElementById('selected-areas-back');
    
    // Lista completa de áreas de la vista frontal según el HTML
    const frontAreasList = [
        'Cuero cabelludo frontal', 'Frente', 'Párpado derecho', 'Párpado izquierdo', 'Nariz',
        'Mejilla derecha', 'Mejilla izquierda', 'Labios', 'Mentón', 'Cuello anterior',
        'Hombro derecho', 'Hombro izquierdo', 'Axila derecha', 'Axila izquierda',
        'Tórax superior', 'Mama derecha', 'Mama izquierda', 'Pliegue submamario',
        'Brazo derecho anterior', 'Brazo izquierdo anterior', 'Codo derecho anterior', 'Codo izquierdo anterior',
        'Antebrazo derecho anterior', 'Antebrazo izquierdo anterior', 'Muñeca derecha', 'Muñeca izquierda',
        'Palma derecha', 'Palma izquierda', 'Uñas manos', 'Abdomen superior', 'Abdomen inferior',
        'Ombligo', 'Ingle derecha', 'Ingle izquierda', 'Genitales externos',
        'Muslo derecho anterior', 'Muslo izquierdo anterior', 'Rodilla derecha anterior', 'Rodilla izquierda anterior',
        'Pierna derecha anterior', 'Pierna izquierda anterior', 'Tobillo derecho anterior', 'Tobillo izquierdo anterior',
        'Dorso pie derecho', 'Dorso pie izquierdo', 'Uñas pies', 'Dedos pie derecho', 'Dedos pie izquierdo'
    ];
    
    // Lista completa de áreas de la vista posterior según el HTML
    const backAreasList = [
        'Cuero cabelludo posterior', 'Región occipital', 'Oreja derecha', 'Oreja izquierda', 'Nuca',
        'Cuello posterior', 'Hombro derecho posterior', 'Hombro izquierdo posterior', 'Espalda superior',
        'Brazo derecho posterior', 'Brazo izquierdo posterior', 'Codo derecho posterior', 'Codo izquierdo posterior',
        'Antebrazo derecho posterior', 'Antebrazo izquierdo posterior', 'Dorso mano derecha', 'Dorso mano izquierda',
        'Espalda media', 'Región lumbar', 'Región sacra', 'Glúteo derecho', 'Glúteo izquierdo',
        'Pliegue interglúteo', 'Región perianal', 'Muslo derecho posterior', 'Muslo izquierdo posterior',
        'Pliegue poplíteo derecho', 'Pliegue poplíteo izquierdo', 'Pantorrilla derecha', 'Pantorrilla izquierda',
        'Tendón Aquiles derecho', 'Tendón Aquiles izquierdo', 'Talón derecho', 'Talón izquierdo',
        'Planta pie derecho', 'Planta pie izquierdo'
    ];
    
    if (frontAreas) {
        const selectedFront = Array.from(selectedBodyAreas).filter(area => 
            frontAreasList.includes(area)
        );
        if (selectedFront.length > 0) {
            // Limitar a 3 áreas mostradas para evitar texto muy largo
            if (selectedFront.length <= 3) {
                frontAreas.textContent = selectedFront.join(', ');
            } else {
                frontAreas.textContent = `${selectedFront.slice(0, 3).join(', ')} y ${selectedFront.length - 3} más`;
            }
        } else {
            frontAreas.textContent = 'Ninguna área seleccionada';
        }
    }
    
    if (backAreas) {
        const selectedBack = Array.from(selectedBodyAreas).filter(area => 
            backAreasList.includes(area)
        );
        if (selectedBack.length > 0) {
            // Limitar a 3 áreas mostradas para evitar texto muy largo
            if (selectedBack.length <= 3) {
                backAreas.textContent = selectedBack.join(', ');
            } else {
                backAreas.textContent = `${selectedBack.slice(0, 3).join(', ')} y ${selectedBack.length - 3} más`;
            }
        } else {
            backAreas.textContent = 'Ninguna área seleccionada';
        }
    }
    
    // Debug: Mostrar total de áreas seleccionadas en consola
    if (selectedBodyAreas.size > 0) {
        console.log(`🗺️ Áreas corporales seleccionadas (${selectedBodyAreas.size}):`, Array.from(selectedBodyAreas));
    }
    
    updateDashboard();
}

// ========== FUNCIONES DE DASHBOARD Y REPORTES ==========

function updateDashboard() {
    const sections = [
        'antecedentes', 'anamnesis', 'lesiones-pigmentadas', 'primary-lesions',
        'secondary-lesions', 'distribution', 'appendages', 'special-tests', 'severity'
    ];
    
    let currentCompletedSections = 0;
    let currentAlertCount = 0;
    let currentWarningCount = 0;
    let currentFindingsCount = 0;
    
    sections.forEach(sectionId => {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            const checkboxes = sectionElement.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked');
            const numbers = sectionElement.querySelectorAll('input[type="number"]');
            const selects = sectionElement.querySelectorAll('select');
            const textareas = sectionElement.querySelectorAll('textarea');
            const ranges = sectionElement.querySelectorAll('input[type="range"]');
            
            let hasContent = false;
            if (checkboxes.length > 0) hasContent = true;
            
            numbers.forEach(input => {
                if (input.value && input.value !== '0') hasContent = true;
            });
            
            selects.forEach(select => {
                if (select.value && select.value !== '') hasContent = true;
            });
            
            textareas.forEach(textarea => {
                if (textarea.value.trim() !== '') hasContent = true;
            });
            
            ranges.forEach(range => {
                if (range.value && range.value !== '0') hasContent = true;
            });
            
            if (hasContent) {
                currentCompletedSections++;
                currentFindingsCount += checkboxes.length;
            }
        }
    });
    
    // Evaluar alertas específicas de dermatología
    
    // ABCDE Score alto
    if (abcdeScore >= 3) {
        currentAlertCount++;
    } else if (abcdeScore >= 2) {
        currentWarningCount++;
    }
    
    // Escalas de severidad
    if (pasiTotal > 6) {
        currentAlertCount++;
    } else if (pasiTotal > 2) {
        currentWarningCount++;
    }
    
    if (scoradTotal >= 50) {
        currentAlertCount++;
    } else if (scoradTotal >= 25) {
        currentWarningCount++;
    }
    
    if (dlqiTotal > 10) {
        currentWarningCount++;
    }
    
    // Pruebas positivas importantes
    const importantPositiveTests = [
        'nikolsky-pos', 'asboe-hansen-pos', 'koh-escamas-pos', 'koh-unas-pos', 'koh-cabello-pos'
    ];
    
    importantPositiveTests.forEach(testId => {
        if (isChecked(testId)) {
            currentWarningCount++;
        }
    });
    
    // Lesiones sospechosas
    if (isChecked('lesion-sospechosa')) {
        currentWarningCount++;
    }
    
    // Síntomas de alarma
    const alarmSymptoms = ['cambio-color', 'sangrado-lesion', 'crecimiento-rapido'];
    alarmSymptoms.forEach(symptom => {
        if (isChecked(symptom)) {
            currentAlertCount++;
        }
    });
    
    // Prurito intenso
    const pruritoIntensity = parseInt(getInputValue('prurito-intensity')) || 0;
    if (pruritoIntensity >= 8) {
        currentWarningCount++;
    }
    
    // Calcular progreso
    const totalSections = sections.length;
    const progress = Math.round((currentCompletedSections / totalSections) * 100);
    
    // Actualizar elementos del dashboard
    setElementText('exam-progress', `${progress}%`);
    setElementText('sections-completed', `${currentCompletedSections}/${totalSections}`);
    setElementText('alert-count', currentAlertCount);
    setElementText('warning-count', currentWarningCount);
    setElementText('findings-count', currentFindingsCount);
    setElementText('quality-of-life-status', qualityOfLifeStatus);
    
    // Actualizar clases de elementos del dashboard
    const dashboardItems = document.querySelectorAll('.dashboard-item');
    if (dashboardItems.length >= 6) {
        // Alertas
        dashboardItems[2].className = currentAlertCount > 0 ? 'dashboard-item dashboard-alert' : 'dashboard-item dashboard-normal';
        
        // Avisos/Warnings  
        dashboardItems[3].className = currentWarningCount > 0 ? 'dashboard-item dashboard-warning' : 'dashboard-item dashboard-normal';
        
        // Hallazgos
        dashboardItems[4].className = 'dashboard-item dashboard-normal';
        
        // Calidad de vida
        const qualityClass = qualityOfLifeStatus.includes('alto') || qualityOfLifeStatus.includes('Alto') ? 
            'dashboard-item dashboard-alert' : 
            qualityOfLifeStatus.includes('moderado') || qualityOfLifeStatus.includes('Moderado') ? 
            'dashboard-item dashboard-warning' : 'dashboard-item dashboard-normal';
        dashboardItems[5].className = qualityClass;
    }

    // Guardar valores globales
    examProgress = progress;
    sectionsCompleted = currentCompletedSections;
    alertCount = currentAlertCount;
    warningCount = currentWarningCount;
    findingsCount = currentFindingsCount;

    generateConclusion();
}

function generateStickyConclusion() {
    const stickyContent = document.getElementById('reportContent');
    const originalConclusionEl = document.getElementById('conclusion-text-traditional');
    if (stickyContent) {
        stickyContent.textContent = originalConclusionEl ? 
            originalConclusionEl.textContent : 
            generateDermatologyReport();
    }
}

function copyReportToClipboard() {
    const reportContent = document.getElementById('reportContent');
    if (!reportContent) return;
    
    const content = reportContent.textContent;
    
    navigator.clipboard.writeText(content).then(() => {
        showCopyNotification();
    }).catch(err => {
        console.error('Error al copiar: ', err);
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyNotification();
    });
}

function showCopyNotification() {
    const notification = document.getElementById('copyNotification');
    if (notification) {
        notification.style.opacity = '1';
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 2500);
    }
}

function generateConclusion() {
    const conclusionEl = document.getElementById('reportContent');
    const conclusionTraditional = document.getElementById('conclusion-text-traditional');
    
    if (!conclusionEl) return;

    const report = generateDermatologyReport();
    conclusionEl.textContent = report;
    if (conclusionTraditional) conclusionTraditional.textContent = report;
    
    const stickyPanel = document.getElementById('stickyReportPanel');
    if (stickyPanel?.classList.contains('active')) {
        setTimeout(() => generateStickyConclusion(), 100); 
    }
}

function generateDermatologyReport() {
    let report = '# EVALUACIÓN DERMATOLÓGICA COMPLETA\n\n';

    // === MOTIVO DE CONSULTA ===
    report += '## MOTIVO DE CONSULTA\n\n';
    
    if (isChecked('sin-quejas')) {
        report += 'Paciente acude para **control dermatológico de rutina**, sin quejas dermatológicas específicas en el momento actual.\n\n';
    } else {
        const complaints = [];
        const symptomIds = [
            'prurito', 'dolor-cutaneo', 'ardor', 'erupciones', 'descamacion', 
            'cambio-color', 'caida-cabello', 'cambios-unas', 'lesiones-mucosas', 'fotosensibilidad'
        ];
        
        symptomIds.forEach(id => {
            if (isChecked(id)) {
                complaints.push(getLabelText(id));
            }
        });

        if (complaints.length > 0) {
            report += `**Síntomas presentados:** ${complaints.join(', ')}\n\n`;
        }
    }

    // === CARACTERÍSTICAS TEMPORALES ===
    let hasTemporales = false;
    
    const tiempoEvol = getSelectedRadioValue('tiempo-evolucion');
    if (tiempoEvol) {
        if (!hasTemporales) {
            report += '## CARACTERÍSTICAS TEMPORALES\n\n';
            hasTemporales = true;
        }
        report += `**Tiempo de evolución:** ${getLabelText(tiempoEvol)}\n`;
    }
    
    const patrones = [];
    ['episodico', 'persistente', 'estacional', 'primera-vez'].forEach(id => {
        if (isChecked(id)) {
            patrones.push(getLabelText(id));
        }
    });
    
    if (patrones.length > 0) {
        if (!hasTemporales) {
            report += '## CARACTERÍSTICAS TEMPORALES\n\n';    
            hasTemporales = true;
        }
        report += `**Patrón de presentación:** ${patrones.join(', ')}\n`;
    }
    
    if (hasTemporales) report += '\n';

    // === FACTORES DESENCADENANTES ===
    const factores = [];
    const factorIds = {
        'exposicion-solar': 'Exposición solar',
        'contacto-quimicos': 'Contacto con químicos',
        'nuevos-cosmeticos': 'Nuevos cosméticos', 
        'medicamentos-factor': 'Medicamentos',
        'alimentos-factor': 'Alimentos',
        'estres': 'Estrés',
        'infecciones': 'Infecciones previas',
        'cambios-hormonales': 'Cambios hormonales',
        'picaduras': 'Picaduras de insectos',
        'contacto-animales': 'Contacto con animales'
    };
    
    Object.entries(factorIds).forEach(([id, label]) => {
        if (isChecked(id)) {
            let factor = label;
            
            // Agregar especificaciones si existen
            const specMappings = {
                'contacto-quimicos': 'spec-quimicos',
                'nuevos-cosmeticos': 'spec-cosmeticos', 
                'medicamentos-factor': 'spec-medicamentos-factor',
                'alimentos-factor': 'spec-alimentos-factor'
            };
            
            const specId = specMappings[id];
            if (specId) {
                const spec = getInputValue(specId);
                if (spec) {
                    factor += ` (${spec})`;
                }
            }
            
            factores.push(factor);
        }
    });
    
    if (factores.length > 0) {
        report += '## FACTORES DESENCADENANTES\n\n';
        report += `${factores.map(f => `• ${f}`).join('\n')}\n\n`;
    }

    // === ANTECEDENTES COMPLETOS ===
    let hasAntecedentes = false;
    
    // Alergias
    const alergias = [];
    if (isChecked('sin-alergias')) {
        alergias.push('Sin alergias conocidas');
    } else {
        if (isChecked('alergia-medicamentos')) {
            const spec = getInputValue('spec-medicamentos');
            alergias.push('Medicamentos' + (spec ? ` (${spec})` : ''));
        }
        if (isChecked('alergia-alimentos')) {
            const spec = getInputValue('spec-alimentos');
            alergias.push('Alimentos' + (spec ? ` (${spec})` : ''));
        }
        if (isChecked('alergia-contacto')) {
            const spec = getInputValue('spec-contacto');
            alergias.push('Alérgenos de contacto' + (spec ? ` (${spec})` : ''));
        }
    }
    
    // Historia de atopia
    const atopia = [];
    const atopiaIds = {
        'asma-bronquial': 'Asma bronquial',
        'rinitis-alergica': 'Rinitis alérgica', 
        'dermatitis-atopica': 'Dermatitis atópica',
        'conjuntivitis-alergica': 'Conjuntivitis alérgica'
    };
    
    Object.entries(atopiaIds).forEach(([id, label]) => {
        if (isChecked(id)) {
            atopia.push(label);
        }
    });
    
    // Enfermedades crónicas
    const cronicas = [];
    const cronicasIds = {
        'diabetes': 'Diabetes mellitus',
        'hipertension': 'Hipertensión arterial',
        'enf-autoinmune': 'Enfermedad autoinmune',
        'cancer-piel': 'Historia de cáncer de piel',
        'inmunodepresion': 'Inmunodepresión'
    };
    
    Object.entries(cronicasIds).forEach(([id, label]) => {
        if (isChecked(id)) {
            cronicas.push(label);
        }
    });
    
    // Antecedentes familiares
    const familiares = [];
    if (isChecked('sin-antec-fam')) {
        familiares.push('Sin antecedentes familiares relevantes');
    } else {
        const familiarIds = {
            'fam-psoriasis': 'Psoriasis',
            'fam-atopia': 'Atopia',
            'fam-melanoma': 'Melanoma',
            'fam-cancer-piel': 'Cáncer de piel no melanoma',
            'fam-vitiligo': 'Vitíligo'
        };
        
        Object.entries(familiarIds).forEach(([id, label]) => {
            if (isChecked(id)) {
                familiares.push(label);
            }
        });
    }
    
    // Tratamientos
    const tratamientosPrevios = getInputValue('tratamientos-previos');
    const medicacionHabitual = getInputValue('medicacion-habitual');
    
    if (alergias.length > 0 || atopia.length > 0 || cronicas.length > 0 || familiares.length > 0 || tratamientosPrevios || medicacionHabitual) {
        report += '## ANTECEDENTES\n\n';
        hasAntecedentes = true;
        
        if (alergias.length > 0) {
            report += `**Alergias:** ${alergias.join(', ')}\n`;
        }
        
        if (atopia.length > 0) {
            report += `**Historia de atopia:** ${atopia.join(', ')}\n`;
        }
        
        if (cronicas.length > 0) {
            report += `**Enfermedades crónicas:** ${cronicas.join(', ')}\n`;
        }
        
        if (familiares.length > 0) {
            report += `**Antecedentes familiares:** ${familiares.join(', ')}\n`;
        }
        
        if (tratamientosPrevios) {
            report += `**Tratamientos previos:** ${tratamientosPrevios}\n`;
        }
        
        if (medicacionHabitual) {
            report += `**Medicación habitual:** ${medicacionHabitual}\n`;
        }
        
        report += '\n';
    }

    // === EVALUACIÓN ABCDE DETALLADA ===
    if (document.getElementById('abcde-evaluation')?.style.display !== 'none' && (isChecked('tiene-nevus') || isChecked('lesion-sospechosa'))) {
        report += '## EVALUACIÓN DE LESIONES PIGMENTADAS (REGLA ABCDE)\n\n';
        
        if (isChecked('tiene-nevus')) report += '✓ Paciente presenta nevus/lunares para evaluar\n';
        if (isChecked('lesion-sospechosa')) report += '⚠️ **Lesión pigmentada sospechosa identificada**\n';
        report += '\n';
        
        let abcdeDetails = '';
        let scoreBreakdown = [];
        
        // A - Asimetría
        const asimetria = getSelectedRadioValue('abcde-asimetria');
        if (asimetria) {
            const asimetriaText = asimetria === 'asimetria-si' ? 'Asimétrica ⚠️' : 'Simétrica ✓';
            abcdeDetails += `**A - Asimetría:** ${asimetriaText}\n`;
            if (asimetria === 'asimetria-si') scoreBreakdown.push('Asimetría (+1)');
        }
        
        // B - Bordes
        const bordes = getSelectedRadioValue('abcde-bordes');
        if (bordes) {
            const bordesText = bordes === 'bordes-irregulares' ? 'Irregulares ⚠️' : 'Regulares ✓';
            abcdeDetails += `**B - Bordes:** ${bordesText}\n`;
            if (bordes === 'bordes-irregulares') scoreBreakdown.push('Bordes irregulares (+1)');
        }
        
        // C - Color
        const colores = [];
        const colorIds = ['color-negro', 'color-marron', 'color-azul', 'color-rojo', 'color-blanco'];
        colorIds.forEach(id => {
            if (isChecked(id)) {
                colores.push(getLabelText(id));
            }
        });
        if (isChecked('color-uniforme')) {
            colores.push('Uniforme');
        }
        
        if (colores.length > 0) {
            abcdeDetails += `**C - Color:** ${colores.join(', ')}`;
            const colorCount = colores.filter(c => c !== 'Uniforme').length;
            if (colorCount >= 2) {
                abcdeDetails += ' ⚠️';
                scoreBreakdown.push('Múltiples colores (+1)');
            } else {
                abcdeDetails += ' ✓';
            }
            abcdeDetails += '\n';
        }
        
        // D - Diámetro
        const diametro = getInputValue('abcde-diametro');
        if (diametro) {
            const diametroNum = parseFloat(diametro);
            abcdeDetails += `**D - Diámetro:** ${diametro} mm`;
            if (diametroNum > 6) {
                abcdeDetails += ' ⚠️';
                scoreBreakdown.push(`Diámetro >6mm (${diametro}mm) (+1)`);
            } else {
                abcdeDetails += ' ✓';
            }
            abcdeDetails += '\n';
        }
        
        // E - Evolución
        const evolucion = [];
        const evolIds = ['evol-tamaño', 'evol-forma', 'evol-color', 'evol-sintomas'];
        evolIds.forEach(id => {
            if (isChecked(id)) {
                evolucion.push(getLabelText(id));
            }
        });
        if (isChecked('sin-cambios')) {
            evolucion.push('Sin cambios');
        }
        
        if (evolucion.length > 0) {
            abcdeDetails += `**E - Evolución:** ${evolucion.join(', ')}`;
            const hasChanges = evolIds.some(id => isChecked(id));
            if (hasChanges) {
                abcdeDetails += ' ⚠️';
                scoreBreakdown.push('Cambios recientes (+1)');
            } else {
                abcdeDetails += ' ✓';
            }
            abcdeDetails += '\n';
        }
        
        report += abcdeDetails + '\n';
        
        // Puntuación y desglose
        report += `**PUNTUACIÓN ABCDE:** ${abcdeScore}/5\n`;
        if (scoreBreakdown.length > 0) {
            report += `**Desglose:** ${scoreBreakdown.join(', ')}\n`;
        }
        
        const riskText = document.getElementById('abcde-risk')?.textContent || '';
        const recommendation = document.getElementById('abcde-recommendation')?.textContent || '';
        
        if (riskText) report += `**Nivel de riesgo:** ${riskText}\n`;
        if (recommendation) report += `**Recomendación clínica:** ${recommendation}\n\n`;
    }

    // === DESCRIPCIÓN COMPLETA DE LESIONES ===
    let hasLesiones = false;
    
    // Lesiones primarias con tamaños
    const primariasSections = {
        'Máculas y manchas': {
            ids: ['macula-hiperpigmentada', 'macula-hipopigmentada', 'macula-eritematosa', 'macula-purpurica', 'petequias', 'equimosis'],
            sizeId: 'macula-size'
        },
        'Pápulas': {
            ids: ['papula-eritematosa', 'papula-normocromica', 'papula-pigmentada', 'papula-perlada'],
            sizeId: 'papula-size'
        },
        'Placas': {
            ids: ['placa-eritematosa', 'placa-escamosa', 'placa-liquenificada', 'placa-infiltrada'],
            sizeId: 'placa-size'
        },
        'Nódulos': {
            ids: ['nodulo-subcutaneo', 'nodulo-dermico', 'nodulo-doloroso', 'nodulo-no-doloroso'],
            sizeId: 'nodulo-size'
        },
        'Vesículas': {
            ids: ['vesicula-clara', 'vesicula-turbia', 'vesicula-hemorrhagica', 'vesicula-herpetiforme'],
            sizeId: 'vesicula-size'
        },
        'Ampollas/Bulas': {
            ids: ['ampolla-clara', 'ampolla-hemorrhagica', 'ampolla-tensa', 'ampolla-flacida'],
            sizeId: 'ampolla-size'
        },
        'Pústulas': {
            ids: ['pustula-folicular', 'pustula-no-folicular', 'pustula-esteril', 'pustula-infectada'],
            sizeId: 'pustula-size'
        }
    };
    
    let primariasReport = '';
    Object.entries(primariasSections).forEach(([sectionName, {ids, sizeId}]) => {
        const found = [];
        ids.forEach(id => {
            if (isChecked(id)) {
                found.push(getLabelText(id));
            }
        });
        
        if (found.length > 0) {
            if (!hasLesiones) {
                report += '## DESCRIPCIÓN DE LESIONES CUTÁNEAS\n\n';
                hasLesiones = true;
            }
            primariasReport += `**${sectionName}:** ${found.join(', ')}`;
            
            const size = getInputValue(sizeId);
            if (size && size !== '0') {
                primariasReport += ` (${size} mm promedio)`;
            }
            primariasReport += '\n';
        }
    });
    
    if (primariasReport) {
        report += '### Elementos Primarios\n' + primariasReport + '\n';
    }
    
    // Lesiones secundarias con tamaños
    const secundariasSections = {
        'Pérdida de sustancia': {
            'Erosiones y excoriaciones': ['erosion-superficial', 'excoriacion-lineal', 'excoriacion-puntiforme', 'erosion-post-ampolla'],
            'Úlceras': ['ulcera-superficial', 'ulcera-profunda', 'ulcera-bordes-regulares', 'ulcera-bordes-irregulares', 'ulcera-bordes-sobreelevados']
        },
        'Depósitos y acumulaciones': {
            'Escamas': ['escamas-finas', 'escamas-gruesas', 'escamas-plateadas', 'escamas-oleosas', 'descamacion-en-copos'],
            'Costras': ['costra-serotica', 'costra-hemorrhagica', 'costra-purulenta', 'costra-melicerica'],
            'Hiperqueratosis': ['hiperqueratosis-difusa', 'hiperqueratosis-localizada', 'callos', 'cuernos-cutaneos']
        },
        'Cambios de textura': {
            'Liquenificación': ['liquenificacion-leve', 'liquenificacion-moderada', 'liquenificacion-severa'],
            'Atrofia': ['atrofia-epidermica', 'atrofia-dermica', 'atrofia-subcutanea', 'piel-papel-cigarro'],
            'Cicatrices': ['cicatriz-atrofica', 'cicatriz-hipertrofica', 'queloides', 'cicatrices-varioliformes']
        }
    };
    
    let secundariasReport = '';
    Object.entries(secundariasSections).forEach(([category, subcategories]) => {
        let categoryReport = '';
        Object.entries(subcategories).forEach(([subcat, ids]) => {
            const found = [];
            ids.forEach(id => {
                if (isChecked(id)) {
                    found.push(getLabelText(id));
                }
            });
            if (found.length > 0) {
                categoryReport += `  **${subcat}:** ${found.join(', ')}\n`;
            }
        });
        
        if (categoryReport) {
            secundariasReport += `**${category}:**\n${categoryReport}`;
        }
    });
    
    // Tamaño de úlceras si está especificado
    const ulceraSize = getInputValue('ulcera-size');
    if (ulceraSize && ulceraSize !== '0') {
        secundariasReport += `**Tamaño de úlcera mayor:** ${ulceraSize} mm\n`;
    }
    
    if (secundariasReport) {
        if (!hasLesiones) {
            report += '## DESCRIPCIÓN DE LESIONES CUTÁNEAS\n\n';
            hasLesiones = true;
        }
        report += '### Elementos Secundarios\n' + secundariasReport + '\n';
    }

    // === DISTRIBUCIÓN Y LOCALIZACIÓN COMPLETA ===
    let hasDistribucion = false;
    
    // Patrón de distribución
    const patDistribucion = [];
    const distIds = {
        'dist-localizada': 'Localizada',
        'dist-regional': 'Regional', 
        'dist-generalizada': 'Generalizada',
        'dist-universal': 'Universal'
    };
    
    Object.entries(distIds).forEach(([id, label]) => {
        if (isChecked(id)) {
            patDistribucion.push(label);
        }
    });
    
    // Patrón morfológico
    const patMorfologico = [];
    const morfIds = {
        'patron-simetrico': 'Simétrico',
        'patron-asimetrico': 'Asimétrico',
        'patron-linear': 'Lineal',
        'patron-anular': 'Anular',
        'patron-serpiginoso': 'Serpiginoso',
        'patron-herpetiforme': 'Herpetiforme',
        'patron-reticular': 'Reticular',
        'patron-corimbiforme': 'Corimbiforme'
    };
    
    Object.entries(morfIds).forEach(([id, label]) => {
        if (isChecked(id)) {
            patMorfologico.push(label);
        }
    });
    
    // Mucosas y áreas especiales
    const mucosas = [];
    const mucosaIds = {
        'mucosa-oral': 'Mucosa oral',
        'mucosa-nasal': 'Mucosa nasal',
        'mucosa-genital': 'Mucosa genital',
        'mucosa-anal': 'Mucosa anal',
        'mucosa-conjuntival': 'Mucosa conjuntival',
        'cuero-cabelludo': 'Cuero cabelludo',
        'unas-manos-detalle': 'Uñas de manos',
        'unas-pies-detalle': 'Uñas de pies'
    };
    
    Object.entries(mucosaIds).forEach(([id, label]) => {
        if (isChecked(id)) {
            mucosas.push(label);
        }
    });
    
    // Mapa corporal
    const selectedAreas = Array.from(selectedBodyAreas);
    
    if (selectedAreas.length > 0 || patDistribucion.length > 0 || patMorfologico.length > 0 || mucosas.length > 0) {
        report += '## DISTRIBUCIÓN Y LOCALIZACIÓN\n\n';
        hasDistribucion = true;
        
        if (patDistribucion.length > 0) {
            report += `**Distribución general:** ${patDistribucion.join(', ')}\n`;
        }
        
        if (patMorfologico.length > 0) {
            report += `**Patrón morfológico:** ${patMorfologico.join(', ')}\n`;
        }
        
        if (selectedAreas.length > 0) {
            report += `**Localización anatómica (mapa corporal):**\n`;
            // Agrupar por regiones
            const regions = {
                'Cabeza y cuello': selectedAreas.filter(a => a.includes('Cuero cabelludo') || a.includes('Frente') || a.includes('Párpado') || a.includes('Nariz') || a.includes('Mejilla') || a.includes('Labios') || a.includes('Mentón') || a.includes('Cuello') || a.includes('Nuca') || a.includes('Oreja') || a.includes('occipital')),
                'Tronco': selectedAreas.filter(a => a.includes('Tórax') || a.includes('Abdomen') || a.includes('Espalda') || a.includes('Mama') || a.includes('Axila') || a.includes('lumbar') || a.includes('sacra')),
                'Extremidades superiores': selectedAreas.filter(a => a.includes('Hombro') || a.includes('Brazo') || a.includes('Codo') || a.includes('Antebrazo') || a.includes('Muñeca') || a.includes('mano') || a.includes('Palma') || a.includes('Dorso mano')),
                'Extremidades inferiores': selectedAreas.filter(a => a.includes('Glúteo') || a.includes('Muslo') || a.includes('Rodilla') || a.includes('Pierna') || a.includes('Pantorrilla') || a.includes('Tobillo') || a.includes('pie') || a.includes('Talón') || a.includes('Planta')),
                'Áreas especiales': selectedAreas.filter(a => a.includes('Genital') || a.includes('perianal') || a.includes('interglúteo') || a.includes('Ingle') || a.includes('Ombligo') || a.includes('Uñas') || a.includes('Dedos'))
            };
            
            Object.entries(regions).forEach(([region, areas]) => {
                if (areas.length > 0) {
                    report += `  • **${region}:** ${areas.join(', ')}\n`;
                }
            });
        }
        
        if (mucosas.length > 0) {
            report += `**Mucosas y áreas especiales:** ${mucosas.join(', ')}\n`;
        }
        
        report += '\n';
    }

    // === ANEXOS CUTÁNEOS COMPLETOS ===
    let hasAnexos = false;
    
    // Cabello y cuero cabelludo
    const cabellos = {
        'Características del cabello': ['cabello-normal', 'cabello-graso', 'cabello-seco', 'cabello-quebradizo', 'cabello-fino', 'cabello-grueso'],
        'Tipos de alopecia': ['alopecia-areata', 'alopecia-androgenetica', 'alopecia-difusa', 'alopecia-cicatricial', 'tricotillomania'],
        'Estado del cuero cabelludo': ['cuero-cabelludo-normal', 'descamacion-cuero-cabelludo', 'eritema-cuero-cabelludo', 'costras-cuero-cabelludo', 'placas-cuero-cabelludo']
    };
    
    let cabellosReport = '';
    Object.entries(cabellos).forEach(([category, ids]) => {
        const found = [];
        ids.forEach(id => {
            if (isChecked(id)) {
                found.push(getLabelText(id));
            }
        });
        if (found.length > 0) {
            cabellosReport += `**${category}:** ${found.join(', ')}\n`;
        }
    });
    
    // Uñas
    const unas = {
        'Uñas de las manos': ['unas-manos-normales', 'onicolisis-manos', 'onicodistrofia-manos', 'leuconiquia-manos', 'melanoniquia-manos', 'pitting-ungueal-manos', 'surcos-beau-manos', 'onicorrexis-manos', 'onicomicosis-manos'],
        'Uñas de los pies': ['unas-pies-normales', 'onicolisis-pies', 'onicodistrofia-pies', 'onicomicosis-pies', 'una-encarnada', 'onicogrifosis'],
        'Pliegues ungueales': ['pliegues-normales', 'paroniquia-aguda', 'paroniquia-cronica', 'pterigion', 'hipertrofia-pliegue']
    };
    
    let unasReport = '';
    Object.entries(unas).forEach(([category, ids]) => {
        const found = [];
        ids.forEach(id => {
            if (isChecked(id)) {
                found.push(getLabelText(id));
            }
        });
        if (found.length > 0) {
            unasReport += `**${category}:** ${found.join(', ')}\n`;
        }
    });
    
    if (cabellosReport || unasReport) {
        report += '## ANEXOS CUTÁNEOS\n\n';
        hasAnexos = true;
        
        if (cabellosReport) {
            report += '### Cabello y Cuero Cabelludo\n' + cabellosReport + '\n';
        }
        
        if (unasReport) {
            report += '### Uñas\n' + unasReport + '\n';
        }
    }

    // === PRUEBAS ESPECIALES COMPLETAS ===
    let hasPruebas = false;
    
    // Pruebas físicas
    const pruebasFisicas = [];
    const pruebasIds = ['nikolsky', 'asboe-hansen', 'darier', 'dermografismo', 'kobner'];
    pruebasIds.forEach(prueba => {
        if (isChecked(`${prueba}-pos`)) {
            pruebasFisicas.push(`${getLabelText(prueba)}: **POSITIVO**`);
        } else if (isChecked(`${prueba}-neg`)) {
            pruebasFisicas.push(`${getLabelText(prueba)}: Negativo`);
        }
    });
    
    // KOH con observaciones
    const kohResults = [];
    const kohIds = ['koh-escamas', 'koh-unas', 'koh-cabello'];
    kohIds.forEach(koh => {
        if (isChecked(`${koh}-pos`)) {
            const note = getInputValue(`${koh}-note`);
            kohResults.push(`${getLabelText(koh)}: **POSITIVO**` + (note ? ` (${note})` : ''));
        } else if (isChecked(`${koh}-neg`)) {
            kohResults.push(`${getLabelText(koh)}: Negativo`);
        }
    });
    
    // Otras pruebas con detalles
    const otherTests = [];
    if (isChecked('wood-pos')) {
        const color = getInputValue('wood-color');
        otherTests.push('Lámpara de Wood: **POSITIVA**' + (color ? ` - Fluorescencia ${color}` : ''));
    } else if (isChecked('wood-neg')) {
        otherTests.push('Lámpara de Wood: Negativa');
    }
    
    if (isChecked('patch-test-pos')) {
        const allergen = getInputValue('patch-test-allergen');
        otherTests.push('Patch test: **POSITIVO**' + (allergen ? ` - Alérgeno: ${allergen}` : ''));
    } else if (isChecked('patch-test-neg')) {
        otherTests.push('Patch test: Negativo');
    }
    
    if (isChecked('biopsia-realizada')) {
        const sitio = getInputValue('biopsia-sitio');
        otherTests.push('Biopsia cutánea: **REALIZADA**' + (sitio ? ` - Sitio: ${sitio}` : ''));
    } else if (isChecked('biopsia-pendiente')) {
        const sitio = getInputValue('biopsia-sitio');
        otherTests.push('Biopsia cutánea: **PENDIENTE**' + (sitio ? ` - Sitio: ${sitio}` : ''));
    }
    
    if (pruebasFisicas.length > 0 || kohResults.length > 0 || otherTests.length > 0) {
        report += '## PRUEBAS ESPECIALES\n\n';
        hasPruebas = true;
        
        if (pruebasFisicas.length > 0) {
            report += '### Pruebas Físicas\n';
            pruebasFisicas.forEach(test => report += `• ${test}\n`);
            report += '\n';
        }
        
        if (kohResults.length > 0) {
            report += '### Examen Directo con KOH\n';
            kohResults.forEach(result => report += `• ${result}\n`);
            report += '\n';
        }
        
        if (otherTests.length > 0) {
            report += '### Otras Pruebas Diagnósticas\n';
            otherTests.forEach(test => report += `• ${test}\n`);
            report += '\n';
        }
    }

    // === EVALUACIÓN DE SEVERIDAD CON DESGLOSE DETALLADO ===
    let hasSeveridad = false;
    
    // Superficie afectada
    const superficieAfectada = getInputValue('superficie-afectada');
    const extensionSeveridad = getSelectedRadioValue('extension-severidad');
    
    // Interferencia con actividades
    const interferencias = [];
    const interferIds = {
        'interfiere-sueno': 'Sueño',
        'interfiere-trabajo': 'Trabajo', 
        'interfiere-social': 'Actividades sociales',
        'interfiere-deportes': 'Deportes'
    };
    
    Object.entries(interferIds).forEach(([id, label]) => {
        if (isChecked(id)) {
            interferencias.push(label);
        }
    });
    
    if (superficieAfectada || extensionSeveridad || interferencias.length > 0 || pasiTotal > 0 || scoradTotal > 0 || dlqiTotal > 0) {
        report += '## EVALUACIÓN DE SEVERIDAD E IMPACTO FUNCIONAL\n\n';
        hasSeveridad = true;
        
        if (superficieAfectada) {
            report += `**Superficie corporal afectada:** ${superficieAfectada}%\n`;
        }
        
        if (extensionSeveridad) {
            const extensionLabel = getLabelText(extensionSeveridad);
            report += `**Clasificación por extensión:** ${extensionLabel}\n`;
        }
        
        const pruritoValue = getInputValue('prurito-intensity');
        if (pruritoValue && pruritoValue !== '0') {
            report += `**Intensidad del prurito:** ${pruritoValue}/10\n`;
        }
        
        if (interferencias.length > 0) {
            report += `**Interferencia funcional:** ${interferencias.join(', ')}\n`;
        }
        
        report += '\n';
    }
    
    // === ESCALAS DE SEVERIDAD CON DESGLOSE COMPLETO ===
    if (pasiTotal > 0 || scoradTotal > 0 || dlqiTotal > 0) {
        if (!hasSeveridad) {
            report += '## EVALUACIÓN DE SEVERIDAD E IMPACTO FUNCIONAL\n\n';
            hasSeveridad = true;
        }
        
        report += '### Escalas de Severidad Específicas\n\n';
        
        // PASI detallado
        if (pasiTotal > 0) {
            const eritema = parseInt(getInputValue('pasi-eritema')) || 0;
            const infiltracion = parseInt(getInputValue('pasi-infiltracion')) || 0;
            const descamacion = parseInt(getInputValue('pasi-descamacion')) || 0;
            const areaCabeza = parseInt(getInputValue('pasi-area-cabeza')) || 0;
            
            report += '**PASI (Psoriasis Area and Severity Index):**\n';
            report += `• Eritema: ${eritema}/4\n`;
            report += `• Infiltración: ${infiltracion}/4\n`;
            report += `• Descamación: ${descamacion}/4\n`;
            report += `• Área cabeza: ${areaCabeza}/6\n`;
            report += `• **PASI Total: ${pasiTotal.toFixed(1)}**\n`;
            
            let pasiSeverity = '';
            if (pasiTotal <= 2) pasiSeverity = 'Leve';
            else if (pasiTotal <= 6) pasiSeverity = 'Moderada';
            else pasiSeverity = 'Severa';
            
            report += `• **Severidad:** ${pasiSeverity}\n\n`;
        }
        
        // SCORAD detallado
        if (scoradTotal > 0) {
            const extension = parseFloat(getInputValue('scorad-extension')) || 0;
            const eritema = parseInt(getInputValue('scorad-eritema')) || 0;
            const edema = parseInt(getInputValue('scorad-edema')) || 0;
            const excoriacion = parseInt(getInputValue('scorad-excoriacion')) || 0;
            const liquenificacion = parseInt(getInputValue('scorad-liquenificacion')) || 0;
            const descamacion = parseInt(getInputValue('scorad-descamacion')) || 0;
            const xerosis = parseInt(getInputValue('scorad-xerosis')) || 0;
            const prurito = parseInt(getInputValue('scorad-prurito')) || 0;
            const sueño = parseInt(getInputValue('scorad-sueno')) || 0;
            
            const A = extension;
            const B = eritema + edema + excoriacion + liquenificacion + descamacion + xerosis;
            const C = prurito + sueño;
            
            report += '**SCORAD (SCORing Atopic Dermatitis):**\n';
            report += `• **A - Extensión:** ${A}% de superficie corporal\n`;
            report += `• **B - Intensidad total:** ${B}/18 (Eritema:${eritema}, Edema:${edema}, Excoriación:${excoriacion}, Liquenificación:${liquenificacion}, Descamación:${descamacion}, Xerosis:${xerosis})\n`;
            report += `• **C - Síntomas subjetivos:** ${C}/20 (Prurito:${prurito}, Pérdida sueño:${sueño})\n`;
            report += `• **Fórmula:** A/5 + 7B/2 + C = ${(A/5).toFixed(1)} + ${(7*B/2).toFixed(1)} + ${C} = **${scoradTotal.toFixed(1)}**\n`;
            
            let scoradSeverity = '';
            if (scoradTotal < 25) scoradSeverity = 'Leve';
            else if (scoradTotal < 50) scoradSeverity = 'Moderada';
            else scoradSeverity = 'Severa';
            
            report += `• **Severidad:** ${scoradSeverity}\n\n`;
        }
        
        // DLQI detallado
        if (dlqiTotal > 0) {
            report += '**DLQI (Dermatology Life Quality Index):**\n';
            
            // Mostrar respuestas individuales
            for (let i = 1; i <= 2; i++) {
                const selected = document.querySelector(`input[name="dlqi-${i}"]:checked`);
                if (selected) {
                    const questionTexts = {
                        1: '¿Cuánto le ha picado, dolido, escozido o molestado la piel?',
                        2: '¿Cuánto le ha dado vergüenza o le ha hecho sentirse cohibido?'
                    };
                    const responseTexts = {
                        '0': 'Nada',
                        '1': 'Un poco', 
                        '2': 'Mucho',
                        '3': 'Muchísimo'
                    };
                    report += `• Pregunta ${i}: ${responseTexts[selected.value]} (${selected.value} puntos)\n`;
                }
            }
            
            const interpretation = document.getElementById('dlqi-interpretation')?.textContent || '';
            report += `• **DLQI Total: ${dlqiTotal}/30**\n`;
            report += `• **Interpretación:** ${interpretation}\n\n`;
        }
    }

    // === RESUMEN EJECUTIVO ===
    report += '## RESUMEN EJECUTIVO\n\n';
    report += `**Estado del examen:** ${examProgress}% completado (${sectionsCompleted}/9 secciones)\n`;
    report += `**Total de hallazgos registrados:** ${findingsCount}\n`;
    
    if (alertCount > 0) {
        report += `**🚨 Hallazgos de ALERTA:** ${alertCount} (requieren atención urgente)\n`;
    }
    if (warningCount > 0) {
        report += `**⚠️ Hallazgos de ATENCIÓN:** ${warningCount} (requieren seguimiento)\n`;
    }
    
    if (selectedBodyAreas.size > 0) {
        report += `**Áreas corporales afectadas:** ${selectedBodyAreas.size} regiones identificadas\n`;
    }
    
    report += `**Impacto en calidad de vida:** ${qualityOfLifeStatus}\n\n`;

    if (alertCount > 0 || warningCount > 0 || abcdeScore >= 2) {
        report += '**🎯 RECOMENDACIÓN CLÍNICA:**\n';
        if (abcdeScore >= 3) {
            report += '• **DERIVACIÓN URGENTE** a dermatología por lesión pigmentada de alto riesgo\n';
        }
        if (alertCount > 0) {
            report += '• Evaluación dermatológica **PRIORITARIA** por hallazgos de alerta\n';
        }
        if (warningCount > 0) {
            report += '• Seguimiento dermatológico especializado recomendado\n';
        }
        report += '• Implementar medidas terapéuticas según protocolos clínicos\n\n';
    }

    // Verificar si hay contenido real
    const hasRealContent = hasAntecedentes || hasLesiones || hasDistribucion || hasAnexos || 
                          hasPruebas || hasSeveridad || isChecked('sin-quejas') || 
                          factores.length > 0 || selectedBodyAreas.size > 0 ||
                          (document.getElementById('abcde-evaluation')?.style.display !== 'none' && 
                           (isChecked('tiene-nevus') || isChecked('lesion-sospechosa')));

    if (!hasRealContent) {
        return 'Complete los campos del examen dermatológico para generar el informe completo con análisis detallado de escalas y localización anatómica...';
    }

    return report;
}

function generateReport() {
    generateConclusion();
}

function clearForm() {
    if (!confirm('¿Está seguro de que desea limpiar todos los datos del formulario?')) {
        return;
    }
    
    // Limpiar todos los campos
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.disabled = false;
    });
    document.querySelectorAll('input[type="radio"]').forEach(rb => rb.checked = false);
    document.querySelectorAll('input[type="number"]').forEach(nb => nb.value = '');
    document.querySelectorAll('input[type="text"]').forEach(tb => tb.value = '');
    document.querySelectorAll('input[type="range"]').forEach(rb => rb.value = 0);
    document.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
    document.querySelectorAll('textarea').forEach(ta => ta.value = '');
    
    // Resetear valores específicos
    setElementText('prurito-value', '0');
    setElementText('pasi-total', '0');
    setElementText('scorad-total', '0');
    setElementText('dlqi-total', '0');
    setElementText('dlqi-interpretation', 'Sin impacto');
    resetABCDEScore();
    
    // Limpiar campos de especificación
    document.querySelectorAll('.specification-field').forEach(field => {
        field.classList.remove('show');
        field.value = '';
    });
    
    // Ocultar sección ABCDE
    const abcdeSection = document.getElementById('abcde-evaluation');
    if (abcdeSection) abcdeSection.style.display = 'none';
    
    // Limpiar mapa corporal
    selectedBodyAreas.clear();
    document.querySelectorAll('.body-part.selected').forEach(part => {
        part.classList.remove('selected');
    });
    updateSelectedAreas();
    
    // Resetear variables globales
    examProgress = 0;
    sectionsCompleted = 0;
    alertCount = 0;
    warningCount = 0;
    findingsCount = 0;
    qualityOfLifeStatus = 'Pendiente';
    abcdeScore = 0;
    pasiTotal = 0;
    scoradTotal = 0;
    dlqiTotal = 0;

    updateDashboard();
}

// ========== INICIALIZACIÓN ==========

document.addEventListener('DOMContentLoaded', function() {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    }
    
    // Configurar sidebar en mobile
    const sidebarToggleButton = document.querySelector('.sidebar button.btn-secondary');
    if (window.innerWidth <= 768) {
        if (sidebarToggleButton) sidebarToggleButton.classList.add('hidden');
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.add('collapsed');
    } else {
        if (sidebarToggleButton) sidebarToggleButton.classList.remove('hidden');
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            if (sidebarToggleButton) sidebarToggleButton.classList.add('hidden');
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.add('collapsed');
        } else {
            if (sidebarToggleButton) sidebarToggleButton.classList.remove('hidden');
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.remove('collapsed');
        }
        updateLayout();
    });

    // Expandir primera sección por defecto
    const firstSectionHeader = document.querySelector('.section-header-main');
    if (firstSectionHeader) {
        toggleSection(firstSectionHeader);
    }

    // Asegurar submenú de dermatología expandido
    const dermaNavLink = document.getElementById('dermatologia-nav-link');
    if (dermaNavLink?.classList.contains('active')) {
        const dermaSubMenu = document.getElementById('dermatologia-sub-menu');
        if (dermaSubMenu) {
            dermaSubMenu.style.maxHeight = dermaSubMenu.scrollHeight + 'px';
        }
    }

    // Configurar mapa corporal
    setupBodyMap();

    // Layout inicial
    updateLayout();

    // Event listeners generales
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', updateDashboard);
        el.addEventListener('input', updateDashboard);
    });
     
    // Event listeners específicos de dermatología
    
    // Antecedentes
    const sinAlergias = document.getElementById('sin-alergias');
    if (sinAlergias) sinAlergias.addEventListener('change', toggleSinAlergias);
    
    const sinAntecFam = document.getElementById('sin-antec-fam');
    if (sinAntecFam) sinAntecFam.addEventListener('change', toggleSinAntecedentesFam);
    
    // Especificaciones de alergias
    ['alergia-medicamentos', 'alergia-alimentos', 'alergia-contacto'].forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            const specId = 'spec-' + id.replace('alergia-', '');
            checkbox.addEventListener('change', () => toggleSpecification(id, specId));
        }
    });
    
    // Anamnesis
    const sinQuejas = document.getElementById('sin-quejas');
    if (sinQuejas) sinQuejas.addEventListener('change', handleNoComplaints);
    
    // Especificaciones de factores desencadenantes
    ['contacto-quimicos', 'nuevos-cosmeticos', 'medicamentos-factor', 'alimentos-factor'].forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            let specId = 'spec-' + id.replace('-factor', '').replace('contacto-', '').replace('nuevos-', '');
            checkbox.addEventListener('change', () => toggleSpecification(id, specId));
        }
    });
    
    // ABCDE
    const tieneNevus = document.getElementById('tiene-nevus');
    if (tieneNevus) tieneNevus.addEventListener('change', toggleABCDESection);
    
    const lesionSospechosa = document.getElementById('lesion-sospechosa');
    if (lesionSospechosa) lesionSospechosa.addEventListener('change', toggleABCDESection);
    
    const abcdeDiametro = document.getElementById('abcde-diametro');
    if (abcdeDiametro) abcdeDiametro.addEventListener('change', evaluateDiameter);
    
    // Event listeners para evaluación ABCDE
    document.querySelectorAll('input[name^="abcde-"]').forEach(el => {
        el.addEventListener('change', evaluateABCDE);
    });
    
    document.querySelectorAll('input[id^="evol-"], input[id^="color-"]').forEach(el => {
        el.addEventListener('change', evaluateABCDE);
    });
    
    // Pruebas especiales - pruebas mutuamente exclusivas
    const mutuallyExclusiveTests = [
        ['nikolsky-pos', 'nikolsky-neg'],
        ['asboe-hansen-pos', 'asboe-hansen-neg'],  
        ['darier-pos', 'darier-neg'],
        ['dermografismo-pos', 'dermografismo-neg'],
        ['kobner-pos', 'kobner-neg'],
        ['koh-escamas-pos', 'koh-escamas-neg'],
        ['koh-unas-pos', 'koh-unas-neg'],
        ['koh-cabello-pos', 'koh-cabello-neg'],
        ['wood-pos', 'wood-neg'],
        ['patch-test-pos', 'patch-test-neg']
    ];
    
    mutuallyExclusiveTests.forEach(([posId, negId]) => {
        const posEl = document.getElementById(posId);
        const negEl = document.getElementById(negId);
        
        if (posEl) {
            posEl.addEventListener('change', function() {
                handleMutuallyExclusive(posId, negId, this);
            });
        }
        
        if (negEl) {
            negEl.addEventListener('change', function() {
                handleMutuallyExclusive(posId, negId, this);
            });
        }
    });
    
    // Escalas de severidad
    const pruritoIntensity = document.getElementById('prurito-intensity');
    if (pruritoIntensity) {
        pruritoIntensity.addEventListener('input', (e) => updatePruritoValue(e.target.value));
    }
    
    document.querySelectorAll('[id^="pasi-"]').forEach(el => {
        el.addEventListener('change', calculatePASI);
        el.addEventListener('input', calculatePASI);
    });
    
    document.querySelectorAll('[id^="scorad-"]').forEach(el => {
        el.addEventListener('change', calculateSCORAD);
        el.addEventListener('input', calculateSCORAD);
    });
    
    document.querySelectorAll('[name^="dlqi-"]').forEach(el => {
        el.addEventListener('change', calculateDLQI);
    });
    
    // Superficie corporal afectada
    const superficieAfectada = document.getElementById('superficie-afectada');
    if (superficieAfectada) {
        superficieAfectada.addEventListener('change', () => {
            const valor = parseFloat(superficieAfectada.value) || 0;
            // Auto-seleccionar el radio button apropiado
            if (valor < 10) {
                const leve = document.getElementById('extension-leve');
                if (leve) leve.checked = true;
            } else if (valor <= 30) {
                const moderada = document.getElementById('extension-moderada');
                if (moderada) moderada.checked = true;
            } else {
                const severa = document.getElementById('extension-severa');
                if (severa) severa.checked = true;
            }
            updateDashboard();
        });
    }
    
    // Event listeners adicionales para elementos específicos que requieren lógica especial
    
    // Biopsia - mutuamente exclusiva
    const biopsiaRealizada = document.getElementById('biopsia-realizada');
    const biopsiaPendiente = document.getElementById('biopsia-pendiente');
    
    if (biopsiaRealizada) {
        biopsiaRealizada.addEventListener('change', function() {
            if (this.checked && biopsiaPendiente) {
                biopsiaPendiente.checked = false;
            }
            updateDashboard();
        });
    }
    
    if (biopsiaPendiente) {
        biopsiaPendiente.addEventListener('change', function() {
            if (this.checked && biopsiaRealizada) {
                biopsiaRealizada.checked = false;
            }
            updateDashboard();
        });
    }
    
    // Extensión normal vs patológica - lógica especial para anexos
    const anexosNormales = ['cabello-normal', 'cuero-cabelludo-normal', 'unas-manos-normales', 'unas-pies-normales', 'pliegues-normales'];
    
    anexosNormales.forEach(normalId => {
        const normalEl = document.getElementById(normalId);
        if (normalEl) {
            normalEl.addEventListener('change', function() {
                if (this.checked) {
                    // Si se marca como normal, desmarcar otros checkboxes de la misma categoría
                    const category = normalId.split('-')[0]; // cabello, cuero, unas, pliegues
                    const categoryCheckboxes = document.querySelectorAll(`input[id^="${category}-"]:not(#${normalId})`);
                    categoryCheckboxes.forEach(cb => {
                        if (cb.type === 'checkbox') cb.checked = false;
                    });
                }
                updateDashboard();
            });
        }
    });
    
    // Añadir debug para verificar que todos los elementos están conectados
    const totalInputs = document.querySelectorAll('input, select, textarea').length;
    const connectedInputs = document.querySelectorAll('input[data-connected], select[data-connected], textarea[data-connected]').length;
    
    console.log(`📊 Elementos del formulario: ${totalInputs} total`);
    console.log(`🔗 Event listeners configurados correctamente`);
    
    // Marcar elementos como conectados para debug
    document.querySelectorAll('input, select, textarea').forEach(el => {
        if (!el.dataset.connected) {
            el.dataset.connected = 'true';
        }
    });
    
    // Cálculos iniciales
    calculatePASI();
    calculateSCORAD();
    calculateDLQI();
    evaluateABCDE();
    
    updateDashboard();

    console.log('🎨 Sistema de Evaluación Dermatológica Premium cargado exitosamente!');
    console.log('✅ Todos los campos están conectados al sistema de informes');
    console.log('🗺️ Mapa corporal interactivo activado');
});