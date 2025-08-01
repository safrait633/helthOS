// ========== VARIABLES GLOBALES Y CONSTANTES ==========
let examProgress = 0;
let sectionsCompleted = 0;
let alertCount = 0;
let warningCount = 0;
let findingsCount = 0;
let vitalsStatus = 'Pendiente';

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

function toggleCardioSubMenu(event) {
    if (event) event.preventDefault();
    
    const cardioNavLink = document.getElementById('cardio-nav-link');
    const cardioSubMenu = document.getElementById('cardio-sub-menu');

    if (!cardioNavLink || !cardioSubMenu) return;

    cardioNavLink.classList.toggle('active');

    if (cardioNavLink.classList.contains('active')) {
        cardioSubMenu.style.maxHeight = cardioSubMenu.scrollHeight + 'px';
    } else {
        cardioSubMenu.style.maxHeight = '0';
    }

    document.querySelectorAll('.nav-link.active:not(#cardio-nav-link)').forEach(otherLink => {
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

// ========== FUNCIONES DE ANAMNESIS ==========

function handleNoComplaints() {
    const noComplaintsCheckbox = document.getElementById('sin-quejas');
    const otherCheckboxes = document.querySelectorAll('#anamnesis input[type="checkbox"]:not(#sin-quejas)');
    
    if (!noComplaintsCheckbox) return;
    
    otherCheckboxes.forEach(checkbox => {
        checkbox.disabled = noComplaintsCheckbox.checked;
        if (noComplaintsCheckbox.checked) checkbox.checked = false;
    });
    
    if (noComplaintsCheckbox.checked) {
        const chestPainDetails = document.getElementById('chest-pain-details');
        const dyspneaDetails = document.getElementById('dyspnea-details');
        if (chestPainDetails) chestPainDetails.classList.remove('visible');
        if (dyspneaDetails) dyspneaDetails.classList.remove('visible');
    }
    
    updateDashboard();
}

function handleChestPainToggle() {
    const chestPainChecked = isChecked('dolor-toracico');
    const chestPainDetails = document.getElementById('chest-pain-details');
    
    if (chestPainChecked) {
        if (chestPainDetails) chestPainDetails.classList.add('visible');
    } else {
        if (chestPainDetails) chestPainDetails.classList.remove('visible');
        
        const intensitySlider = document.getElementById('dolor-intensidad');
        if (intensitySlider) intensitySlider.value = 0;
        
        const dolorValue = document.getElementById('dolor-value');
        if (dolorValue) dolorValue.textContent = '0';
        
        document.querySelectorAll('input[name="dolor-tipo"]').forEach(radio => {
            radio.checked = false;
        });
    }
    
    updateDashboard();
}

function handleDyspneaToggle() {
    const dyspneaChecked = isChecked('disnea');
    const dyspneaDetails = document.getElementById('dyspnea-details');
    
    if (dyspneaChecked) {
        if (dyspneaDetails) dyspneaDetails.classList.add('visible');
    } else {
        if (dyspneaDetails) dyspneaDetails.classList.remove('visible');
        
        const intensitySlider = document.getElementById('disnea-intensidad');
        if (intensitySlider) intensitySlider.value = 0;
        
        const disneaValue = document.getElementById('disnea-value');
        if (disneaValue) disneaValue.textContent = '0';
        
        const toleranceSelect = document.getElementById('ejercicio-tolerancia');
        if (toleranceSelect) toleranceSelect.selectedIndex = 0;
    }
    
    updateDashboard();
}

function updateDolorValue() {
    const valor = getInputValue('dolor-intensidad');
    const dolorValue = document.getElementById('dolor-value');
    if (dolorValue) dolorValue.textContent = valor;
    evaluateChestPain();
}

function updateDisneaValue() {
    const valor = getInputValue('disnea-intensidad');
    const disneaValue = document.getElementById('disnea-value');
    if (disneaValue) disneaValue.textContent = valor;
    updateDashboard();
}

function evaluateChestPain() {
    const intensidad = parseInt(getInputValue('dolor-intensidad')) || 0;
    let score = 0;
    
    if (isChecked('dolor-opresivo')) score += 2;
    if (isChecked('dolor-ejercicio')) score += 2;
    if (isChecked('alivio-reposo')) score += 1;
    if (isChecked('alivio-nitroglicerina')) score += 2;
    if (isChecked('irradiacion-brazo-izq')) score += 1;
    if (isChecked('irradiacion-mandibula')) score += 1;
    
    if (isChecked('dolor-punzante')) score -= 1;
    if (isChecked('dolor-movimientos')) score -= 1;
    if (isChecked('dolor-palpacion')) score -= 1;
    if (isChecked('alivio-posicion')) score -= 1;
    
    if (intensidad >= 8) score += 1;
    else if (intensidad <= 3) score -= 1;
    
    let probabilidad = '';
    let cssClass = '';
    
    if (score >= 6) {
        probabilidad = 'Muy alta probabilidad coronaria';
        cssClass = 'prob-muy-alta';
    } else if (score >= 4) {
        probabilidad = 'Alta probabilidad coronaria';
        cssClass = 'prob-alta';
    } else if (score >= 2) {
        probabilidad = 'Probabilidad intermedia';
        cssClass = 'prob-intermedia';
    } else if (score >= 0) {
        probabilidad = 'Baja probabilidad coronaria';
        cssClass = 'prob-baja';
    } else {
        probabilidad = 'Muy baja probabilidad coronaria';
        cssClass = 'prob-muy-baja';
    }
    
    const probEl = document.getElementById('probabilidad-coronaria');
    if (probEl) {
        probEl.textContent = probabilidad;
        // Remover todas las clases de probabilidad anteriores
        probEl.className = probEl.className.replace(/prob-[a-z-]+/g, '');
        // Agregar la nueva clase
        probEl.classList.add('score-value', cssClass);
    }
    updateDashboard();
}

function evaluateNYHA() {
    const tolerancia = getInputValue('ejercicio-tolerancia');
    let nyhaClass = '';
    let color = '';
    
    switch(tolerancia) {
        case '1': 
            nyhaClass = 'NYHA I'; 
            color = 'var(--normal-color)';
            break;
        case '2': 
            nyhaClass = 'NYHA II'; 
            color = 'var(--warning-color)';
            break;
        case '3': 
            nyhaClass = 'NYHA III'; 
            color = 'var(--alert-color)';
            break;
        case '4': 
            nyhaClass = 'NYHA IV'; 
            color = 'var(--alert-color)';
            break;
        default: 
            nyhaClass = '--';
            color = '';
    }
    
    const nyhaEl = document.getElementById('nyha-class');
    if (nyhaEl) {
        nyhaEl.textContent = nyhaClass;
        nyhaEl.style.color = color;
    }
    updateDashboard();
}

// ========== FUNCIONES DE SIGNOS VITALES ==========

function evaluateBloodPressure() {
    const pasDer = parseInt(getInputValue('pas-derecho')) || 0;
    const padDer = parseInt(getInputValue('pad-derecho')) || 0;
    const pasIzq = parseInt(getInputValue('pas-izquierdo')) || 0;
    const padIzq = parseInt(getInputValue('pad-izquierdo')) || 0;
    
    if (pasDer && padDer) {
        updateVitalIndicator('pas-derecho', 'pa-indicator', [pasDer, padDer], 'bp');
    }
    
    const assessment = document.getElementById('pa-assessment');
    if (assessment) {
        assessment.innerHTML = '';
        
        if (pasDer && padDer) {
            let message = '';
            let className = '';
            
            if (pasDer < 90 || padDer < 60) {
                message = 'Hipotensión arterial';
                className = 'alert';
            } else if (pasDer < 120 && padDer < 80) {
                message = 'Presión arterial normal';
                className = 'normal';
            } else if (pasDer < 130 && padDer < 80) {
                message = 'Presión arterial normal-alta';
                className = 'warning';
            } else if (pasDer < 140 || padDer < 90) {
                message = 'Hipertensión arterial grado 1';
                className = 'warning';
            } else if (pasDer < 180 || padDer < 110) {
                message = 'Hipertensión arterial grado 2';
                className = 'alert';
            } else {
                message = 'Hipertensión arterial grado 3 (crisis)';
                className = 'alert';
            }
            
            if (pasIzq && padIzq) {
                if (Math.abs(pasDer - pasIzq) > 10 || Math.abs(padDer - padIzq) > 10) {
                    message += '. Asimetría de PA entre brazos (>10 mmHg)';
                    className = 'warning';
                }
            }
            
            if (message) {
                assessment.classList.add('visible');
                assessment.innerHTML = `<div class="form-item"><div class="${className} p-2 rounded-md">${message}</div></div>`;
            }
        } else {
            assessment.classList.remove('visible');
        }
    }
    
    updateDashboard();
}

function evaluateHeartRate() {
    const fc = parseInt(getInputValue('frecuencia-cardiaca')) || 0;
    
    if (fc) {
        updateVitalIndicator('frecuencia-cardiaca', 'fc-indicator', fc, 'hr');
    }
    
    const container = document.getElementById('frecuencia-cardiaca')?.parentElement;
    if (container) {
        const existingWarning = container.querySelector('.warning, .alert, .normal');
        if (existingWarning) existingWarning.remove();
        
        if (fc) {
            let message = '';
            let className = '';
            
            if (fc < 50) {
                message = 'Bradicardia severa (< 50 lpm)';
                className = 'alert';
            } else if (fc < 60) {
                message = 'Bradicardia (< 60 lpm)';
                className = 'warning';
            } else if (fc <= 100) {
                message = 'Frecuencia cardíaca normal';
                className = 'normal';
            } else if (fc <= 150) {
                message = 'Taquicardia (> 100 lpm)';
                className = 'warning';
            } else {
                message = 'Taquicardia severa (> 150 lpm)';
                className = 'alert';
            }
            
            const statusDiv = document.createElement('div');
            statusDiv.className = `${className} p-2 rounded-md text-sm mt-2`;
            statusDiv.textContent = message;
            container.appendChild(statusDiv);
        }
    }
    
    updateDashboard();
}

function evaluateSaturation() {
    const spo2 = parseInt(getInputValue('saturacion-oxigeno')) || 0;
    if (spo2) {
        updateVitalIndicator('saturacion-oxigeno', 'spo2-indicator', spo2, 'spo2');
    }
    updateDashboard();
}

function updateVitalIndicator(inputId, indicatorId, value, type) {
    const indicator = document.getElementById(indicatorId);
    if (!indicator) return;
    
    indicator.className = 'vital-indicator';
    
    if (type === 'bp') {
        const [systolic, diastolic] = value;
        if (systolic < 90 || diastolic < 60) {
            indicator.classList.add('danger');
            indicator.textContent = 'HIPOTENSIÓN';
        } else if (systolic < 120 && diastolic < 80) {
            indicator.classList.add('normal');
            indicator.textContent = 'NORMAL';
        } else if (systolic < 140 || diastolic < 90) {
            indicator.classList.add('warning');
            indicator.textContent = 'HTA I';
        } else {
            indicator.classList.add('danger');
            indicator.textContent = 'HTA II-III';
        }
    } else if (type === 'hr') {
        if (value < 50) {
            indicator.classList.add('danger');
            indicator.textContent = 'BRADICARDIA SEVERA';
        } else if (value < 60) {
            indicator.classList.add('warning');
            indicator.textContent = 'BRADICARDIA';
        } else if (value <= 100) {
            indicator.classList.add('normal');
            indicator.textContent = 'NORMAL';
        } else if (value <= 150) {
            indicator.classList.add('warning');
            indicator.textContent = 'TAQUICARDIA';
        } else {
            indicator.classList.add('danger');
            indicator.textContent = 'TAQUICARDIA SEVERA';
        }
    } else if (type === 'spo2') {
        if (value < 90) {
            indicator.classList.add('danger');
            indicator.textContent = 'HIPOXEMIA SEVERA';
        } else if (value < 95) {
            indicator.classList.add('warning');
            indicator.textContent = 'HIPOXEMIA LEVE';
        } else {
            indicator.classList.add('normal');
            indicator.textContent = 'NORMAL';
        }
    }
}

// ========== FUNCIONES DE SECCIONES DINÁMICAS ==========

function handleSubsectionToggle(selectElement, detailsElementId) {
    if (!selectElement) return;
    
    const detailsElement = document.getElementById(detailsElementId);
    if (!detailsElement) return;
    
    const shouldBeVisible = selectElement.value && 
                          selectElement.value !== 'none' && 
                          selectElement.value !== 'normal' && 
                          selectElement.value !== 'sin-quejas' &&
                          selectElement.value !== 'normales' &&
                          selectElement.value !== 'ausentes' &&
                          selectElement.value !== '';
    
    if (shouldBeVisible) {
        detailsElement.classList.add('visible');
    } else {
        detailsElement.classList.remove('visible');
    }
    updateDashboard();
}

function handlePulseCharacter() { 
    const el = document.getElementById('pulso-caracter');
    handleSubsectionToggle(el, 'pulso-detalles'); 
}

function handleInspeccionCardiaca() {
    const el = document.getElementById('inspeccion-cardiaca');
    handleSubsectionToggle(el, 'inspeccion-detalles');
}

function handleLatidoApical() {
    const el = document.getElementById('latido-apical');
    handleSubsectionToggle(el, 'latido-detalles');
}

function handleLimitesCardiacos() {
    const el = document.getElementById('limites-cardiacos');
    handleSubsectionToggle(el, 'limites-detalles');
}

function handleEdemas() {
    const el = document.getElementById('edemas-presencia');
    handleSubsectionToggle(el, 'edemas-detalles');
}

function handleVenas() {
    const el = document.getElementById('venas-estado');
    handleSubsectionToggle(el, 'venas-detalles');
}

function handleECGRitmo() {
    const el = document.getElementById('ecg-ritmo');
    handleSubsectionToggle(el, 'ecg-ritmo-detalles');
}

function handleECGConduccion() {
    const el = document.getElementById('ecg-conduccion');
    handleSubsectionToggle(el, 'ecg-conduccion-detalles');
}

function handleCambiosIsquemicos() {
    const el = document.getElementById('cambios-isquemicos');
    handleSubsectionToggle(el, 'cambios-isquemicos-detalles');
}

function handleMurmurToggle(location, timing) {
    const checkbox = document.getElementById(`soplo-${timing}-${location}`);
    const gradeSelect = document.getElementById(`soplo-${timing}-${location}-grado`);
    const murmurDetails = document.getElementById('murmur-details');
    
    if (gradeSelect) {
        gradeSelect.disabled = !checkbox?.checked;
        if (!checkbox?.checked) gradeSelect.selectedIndex = 0;
    }
    
    const anySoplo = document.querySelectorAll('input[id*="soplo-"]:checked').length > 0;
    if (murmurDetails) {
        if (anySoplo) {
            murmurDetails.classList.add('visible');
        } else {
            murmurDetails.classList.remove('visible');
        }
    }
    updateDashboard();
}

// ========== FUNCIONES DE CÁLCULOS VASCULARES ==========

function calculateITB() {
    const paBrazoDer = parseFloat(getInputValue('pa-brazo-der')) || 0;
    const paBrazoIzq = parseFloat(getInputValue('pa-brazo-izq')) || 0;
    const paTobilloDer = parseFloat(getInputValue('pa-tobillo-der')) || 0;
    const paTobilloIzq = parseFloat(getInputValue('pa-tobillo-izq')) || 0;
    
    const itbDerEl = document.getElementById('itb-derecho');
    const itbIzqEl = document.getElementById('itb-izquierdo');
    const interpretacionEl = document.getElementById('itb-interpretacion');
    
    let itbDer = '--';
    let itbIzq = '--';
    let maxBrazo = Math.max(paBrazoDer, paBrazoIzq);

    if (paTobilloDer && maxBrazo > 0) {
        itbDer = (paTobilloDer / maxBrazo).toFixed(2);
    }
    if (itbDerEl) itbDerEl.textContent = itbDer;
    
    if (paTobilloIzq && maxBrazo > 0) {
        itbIzq = (paTobilloIzq / maxBrazo).toFixed(2);
    }
    if (itbIzqEl) itbIzqEl.textContent = itbIzq;
    
    const valItbDer = parseFloat(itbDer) || 0;
    const valItbIzq = parseFloat(itbIzq) || 0;
    const minItb = Math.min(
        valItbDer > 0 ? valItbDer : Infinity, 
        valItbIzq > 0 ? valItbIzq : Infinity
    );
    
    if (interpretacionEl) {
        let interpretacion = '--';
        let color = '';
        if (minItb !== Infinity) {
            if (minItb > 1.4) {
                interpretacion = 'Arterias no compresibles';
                color = 'var(--alert-color)';
            } else if (minItb >= 1.0) {
                interpretacion = 'Normal';
                color = 'var(--normal-color)';
            } else if (minItb >= 0.9) {
                interpretacion = 'Límite';
                color = 'var(--warning-color)';
            } else if (minItb >= 0.7) {
                interpretacion = 'Enfermedad arterial periférica leve';
                color = 'var(--warning-color)';
            } else if (minItb >= 0.4) {
                interpretacion = 'Enfermedad arterial periférica moderada';
                color = 'var(--alert-color)';
            } else {
                interpretacion = 'Enfermedad arterial periférica severa';
                color = 'var(--alert-color)';
            }
        }
        interpretacionEl.textContent = interpretacion;
        interpretacionEl.style.color = color;
    }
    
    updateDashboard();
}

// ========== FUNCIONES DE ESCALAS DE RIESGO ==========

function calculateCHADS() {
    let score = 0;
    
    if (isChecked('chads-icc')) score += 1;
    if (isChecked('chads-hta')) score += 1;
    if (isChecked('chads-edad-75')) score += 2;
    if (isChecked('chads-diabetes')) score += 1;
    if (isChecked('chads-stroke')) score += 2;
    if (isChecked('chads-vascular')) score += 1;
    if (isChecked('chads-edad-65')) score += 1;
    if (isChecked('chads-sexo')) score += 1;
    
    const scoreEl = document.getElementById('chads-score');
    const recomendacionEl = document.getElementById('chads-recomendacion');
    
    if (scoreEl) scoreEl.textContent = score;
    
    if (recomendacionEl) {
        let recomendacion = '';
        let color = '';
        if (score === 0) {
            recomendacion = 'Sin anticoagulación (considerar aspirina)';
            color = 'var(--normal-color)';
        } else if (score === 1) {
            recomendacion = 'Considerar anticoagulación oral';
            color = 'var(--warning-color)';
        } else {
            recomendacion = 'Anticoagulación oral recomendada';
            color = 'var(--alert-color)';
        }
        recomendacionEl.textContent = recomendacion;
        recomendacionEl.style.color = color;
    }
    updateDashboard();
}

function calculateHASBLED() {
    let score = 0;
    
    if (isChecked('hasbled-hta')) score += 1;
    if (isChecked('hasbled-renal')) score += 1;
    if (isChecked('hasbled-hepatica')) score += 1;
    if (isChecked('hasbled-stroke')) score += 1;
    if (isChecked('hasbled-sangrado')) score += 1;
    if (isChecked('hasbled-inr')) score += 1;
    if (isChecked('hasbled-edad')) score += 1;
    if (isChecked('hasbled-medicamentos')) score += 1;
    
    const scoreEl = document.getElementById('hasbled-score');
    const riesgoEl = document.getElementById('hasbled-riesgo');
    
    if (scoreEl) scoreEl.textContent = score;
    
    if (riesgoEl) {
        let riesgo = '';
        let color = '';
        if (score <= 2) {
            riesgo = 'Bajo riesgo hemorrágico';
            color = 'var(--normal-color)';
        } else if (score === 3) {
            riesgo = 'Riesgo hemorrágico moderado';
            color = 'var(--warning-color)';
        } else {
            riesgo = 'Alto riesgo hemorrágico';
            color = 'var(--alert-color)';
        }
        riesgoEl.textContent = riesgo;
        riesgoEl.style.color = color;
    }
    updateDashboard();
}

function calculateTIMI() {
    let score = 0;
    
    if (isChecked('timi-edad')) score += 1;
    if (isChecked('timi-factores')) score += 1;
    if (isChecked('timi-estenosis')) score += 1;
    if (isChecked('timi-st')) score += 1;
    if (isChecked('timi-angina')) score += 1;
    if (isChecked('timi-aspirina')) score += 1;
    if (isChecked('timi-marcadores')) score += 1;
    
    const scoreEl = document.getElementById('timi-score');
    const riesgoEl = document.getElementById('timi-riesgo');
    
    if (scoreEl) scoreEl.textContent = score;
    
    if (riesgoEl) {
        const riesgos = {
            0: '4.7%', 1: '8.3%', 2: '16.2%', 3: '24.2%',
            4: '36.9%', 5: '50.8%', 6: '64.7%', 7: '70.8%'
        };
        const porcentaje = riesgos[score] || '--';
        riesgoEl.textContent = porcentaje;
        
        let color = '';
        if (score >= 5) color = 'var(--alert-color)';
        else if (score >= 3) color = 'var(--warning-color)';
        else color = 'var(--normal-color)';
        riesgoEl.style.color = color;
    }
    updateDashboard();
}

function evaluate6MWT() {
    const distancia = parseFloat(getInputValue('marcha-6min')) || 0;
    
    const capacidadEl = document.getElementById('capacidad-funcional');
    const porcentajeEl = document.getElementById('porcentaje-predicho');
    
    if (distancia && capacidadEl) {
        let capacidad = '';
        let color = '';
        if (distancia >= 500) {
            capacidad = 'Excelente';
            color = 'var(--normal-color)';
        } else if (distancia >= 400) {
            capacidad = 'Buena';
            color = 'var(--normal-color)';
        } else if (distancia >= 300) {
            capacidad = 'Regular';
            color = 'var(--warning-color)';
        } else {
            capacidad = 'Limitada';
            color = 'var(--alert-color)';
        }
        capacidadEl.textContent = capacidad;
        capacidadEl.style.color = color;
        
        const predicho = 600;
        const porcentaje = Math.round((distancia / predicho) * 100);
        if (porcentajeEl) {
            porcentajeEl.textContent = `${porcentaje}%`;
            porcentajeEl.style.color = color;
        }
    }
    updateDashboard();
}

// ========== FUNCIONES DE DASHBOARD Y REPORTES ==========

function updateDashboard() {
    const sections = [
        'anamnesis', 'signos-vitales', 'examen-fisico', 'auscultacion', 
        'circulacion-periferica', 'vascular-periferico', 'electrocardiograma', 'escalas-riesgo'
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
            
            if (hasContent) {
                currentCompletedSections++;
                currentFindingsCount += checkboxes.length;
            }
        }
    });
    
    // Evaluar alertas específicas de cardiología
    if (isChecked('dolor-toracico')) {
        const probabilidad = document.getElementById('probabilidad-coronaria')?.textContent;
        if (probabilidad?.includes('Alta') || probabilidad?.includes('Muy alta')) currentAlertCount++;
        else if (probabilidad?.includes('intermedia')) currentWarningCount++;
    }
    
    if (isChecked('disnea')) {
        const nyha = document.getElementById('nyha-class')?.textContent;
        if (nyha === 'NYHA IV') currentAlertCount++;
        else if (nyha === 'NYHA III') currentWarningCount++;
    }
    
    if (isChecked('sincope') || isChecked('presincope')) currentAlertCount++;

    // Signos vitales
    const pasDer = parseFloat(getInputValue('pas-derecho'));
    const padDer = parseFloat(getInputValue('pad-derecho'));
    if (pasDer && padDer) {
        if (pasDer >= 180 || padDer >= 110 || pasDer < 90 || padDer < 60) currentAlertCount++;
        else if (pasDer >= 140 || padDer >= 90) currentWarningCount++;
    }
    
    const fc = parseFloat(getInputValue('frecuencia-cardiaca'));
    if (fc) {
        if (fc < 50 || fc > 150) currentAlertCount++;
        else if (fc < 60 || fc > 100) currentWarningCount++;
    }
    
    const spo2 = parseFloat(getInputValue('saturacion-oxigeno'));
    if (spo2) {
        if (spo2 < 90) currentAlertCount++;
        else if (spo2 < 95) currentWarningCount++;
    }

    // Examen físico
    if (isChecked('cianosis-central') || isChecked('ingurgitacion-yugular')) currentAlertCount++;

    // Auscultación
    if (isChecked('r3-galope') || isChecked('r4-galope') || isChecked('roce-pericardico')) currentAlertCount++;
    
    const soplos = document.querySelectorAll('input[id*="soplo-"]:checked');
    if (soplos.length > 0) currentWarningCount++;

    // ECG
    const ecgRitmo = getInputValue('ecg-ritmo');
    if (ecgRitmo?.includes('fibrilacion-auricular') || ecgRitmo?.includes('taquicardia-ventricular')) currentAlertCount++;
    
    const cambiosIsquemicos = getInputValue('cambios-isquemicos');
    if (cambiosIsquemicos?.includes('elevacion-st')) currentAlertCount++;
    else if (cambiosIsquemicos && cambiosIsquemicos !== 'ausentes' && cambiosIsquemicos !== '') currentWarningCount++;

    // Escalas de riesgo
    const chadsScore = parseInt(document.getElementById('chads-score')?.textContent || '0');
    if (chadsScore >= 2) currentWarningCount++;
    
    const timiScore = parseInt(document.getElementById('timi-score')?.textContent || '0');
    if (timiScore >= 5) currentAlertCount++;
    else if (timiScore >= 3) currentWarningCount++;
    
    const itbInterpretacion = document.getElementById('itb-interpretacion')?.textContent;
    if (itbInterpretacion?.includes('severa') || itbInterpretacion?.includes('no compresibles')) currentAlertCount++;
    else if (itbInterpretacion?.includes('leve') || itbInterpretacion?.includes('moderada')) currentWarningCount++;
    
    const totalSections = sections.length;
    const progress = Math.round((currentCompletedSections / totalSections) * 100);
    
    // Actualizar elementos del dashboard
    const progressEl = document.getElementById('exam-progress');
    const sectionsEl = document.getElementById('sections-completed');
    const alertEl = document.getElementById('alert-count');
    const warningEl = document.getElementById('warning-count');
    const findingsEl = document.getElementById('findings-count');
    
    if (progressEl) progressEl.textContent = `${progress}%`;
    if (sectionsEl) sectionsEl.textContent = `${currentCompletedSections}/${totalSections}`;
    if (alertEl) alertEl.textContent = currentAlertCount;
    if (warningEl) warningEl.textContent = currentWarningCount;
    if (findingsEl) findingsEl.textContent = currentFindingsCount;
    
    // Actualizar estado de signos vitales
    const vitalsStatusEl = document.getElementById('vitals-status');
    const vitalsStatusItem = document.getElementById('vitals-status-item');
    
    if (vitalsStatusEl && vitalsStatusItem) {
        const pas = parseFloat(getInputValue('pas-derecho'));
        const pad = parseFloat(getInputValue('pad-derecho'));
        const fc = parseFloat(getInputValue('frecuencia-cardiaca'));
        const spo2 = parseFloat(getInputValue('saturacion-oxigeno'));

        let currentVitalsStatus = 'Pendiente';
        let vitalsColorClass = 'dashboard-item';

        if (pas || pad || fc || spo2) {
            currentVitalsStatus = 'Completo';
            vitalsColorClass = 'dashboard-item dashboard-normal';
            
            if ((pas && (pas < 90 || pas >= 180)) || (pad && (pad < 60 || pad >= 110)) || 
                (fc && (fc < 50 || fc > 150)) || (spo2 && spo2 < 90)) {
                currentVitalsStatus = 'Crítico';
                vitalsColorClass = 'dashboard-item dashboard-alert';
            } else if ((pas && (pas >= 140 || pas < 100)) || (pad && (pad >= 90 || pad < 70)) || 
                       (fc && (fc < 60 || fc > 100)) || (spo2 && spo2 < 95)) {
                currentVitalsStatus = 'Advertencia';
                vitalsColorClass = 'dashboard-item dashboard-warning';
            }
        }

        vitalsStatusEl.textContent = currentVitalsStatus;
        vitalsStatusItem.className = vitalsColorClass;
    }
    
    // Actualizar clases de elementos del dashboard
    const alertsItem = document.getElementById('alerts-item');
    const warningsItem = document.getElementById('warnings-item');
    const findingsItem = document.getElementById('findings-item');

    if (alertsItem) {
        alertsItem.className = currentAlertCount > 0 ? 'dashboard-item dashboard-alert' : 'dashboard-item dashboard-normal';
    }
    if (warningsItem) {
        warningsItem.className = currentWarningCount > 0 ? 'dashboard-item dashboard-warning' : 'dashboard-item dashboard-normal';
    }
    if (findingsItem) {
        findingsItem.className = 'dashboard-item dashboard-normal';
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
            generateCardiovascularReport();
    }
}

function copyStickyToClipboard() {
    const stickyContent = document.getElementById('reportContent');
    if (!stickyContent) return;
    
    const content = stickyContent.textContent;
    
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

function printStickyConclusion() {
    const conclusion = document.getElementById('reportContent')?.textContent;
    if (!conclusion) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Informe Cardiovascular</title>
            <style>
                body { 
                    font-family: 'Inter', sans-serif; 
                    margin: 20px; 
                    line-height: 1.6;
                }
                pre { 
                    white-space: pre-wrap; 
                    font-family: 'Fira Code', 'Source Code Pro', monospace; 
                    font-size: 12px;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #dc2626;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .footer {
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    margin-top: 20px;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Informe Cardiovascular</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
                <p>Hora: ${new Date().toLocaleTimeString()}</p>
            </div>
            <pre>${conclusion}</pre>
            <div class="footer">
                <p>Generado por Sistema de Evaluación Cardiovascular Premium</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
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

    const report = generateCardiovascularReport();
    conclusionEl.textContent = report;
    if (conclusionTraditional) conclusionTraditional.textContent = report;
    
    const stickyPanel = document.getElementById('stickyReportPanel');
    if (stickyPanel?.classList.contains('active')) {
        setTimeout(() => generateStickyConclusion(), 100); 
    }
}

function generateCardiovascularReport() {
    let report = '# EVALUACIÓN CARDIOVASCULAR\n\n';

    // === MOTIVO DE CONSULTA ===
    report += '## MOTIVO DE CONSULTA\n\n';
    const complaints = [];
    
    if (isChecked('sin-quejas')) {
        report += 'Paciente acude para control cardiovascular de rutina, **sin síntomas cardiovasculares** en el momento actual.\n\n';
    } else {
        ['dolor-toracico', 'disnea', 'palpitaciones', 'sincope', 'presincope',
         'edema', 'fatiga', 'ortopnea', 'disnea-paroxistica', 'claudicacion', 'cianosis'].forEach(id => {
            if (isChecked(id)) {
                complaints.push(getLabelText(id).toLowerCase());
            }
        });

        if (complaints.length > 0) {
            if (complaints.length === 1) {
                report += `Paciente consulta por **${complaints[0]}**.\n\n`;
            } else if (complaints.length === 2) {
                report += `Paciente presenta **${complaints[0]} y ${complaints[1]}**.\n\n`;
            } else {
                const lastComplaint = complaints.pop();
                report += `Paciente manifiesta **${complaints.join(', ')} y ${lastComplaint}**.\n\n`;
            }
        }
    }

    // Evaluación detallada del dolor torácico
    if (isChecked('dolor-toracico') && document.getElementById('chest-pain-details')?.classList.contains('visible')) {
        const dolorIntensidad = getInputValue('dolor-intensidad');
        const probabilidad = document.getElementById('probabilidad-coronaria')?.textContent;
        
        let dolorDetalle = '**Características del dolor torácico:** ';
        if (dolorIntensidad && dolorIntensidad !== '0') {
            dolorDetalle += `Intensidad ${dolorIntensidad}/10. `;
        }
        
        const dolorTipo = document.querySelector('input[name="dolor-tipo"]:checked');
        if (dolorTipo) {
            dolorDetalle += `Carácter ${getLabelText(dolorTipo.id).toLowerCase()}. `;
        }

        const irradiaciones = [];
        ['irradiacion-brazo-izq', 'irradiacion-mandibula', 'irradiacion-espalda', 'irradiacion-cuello'].forEach(id => {
            if (isChecked(id)) irradiaciones.push(getLabelText(id).toLowerCase());
        });
        if (irradiaciones.length > 0) {
            dolorDetalle += `Con irradiación a ${irradiaciones.join(', ')}. `;
        }

        if (probabilidad && probabilidad !== '--') {
            dolorDetalle += `**${probabilidad}**.`;
        }
        
        report += dolorDetalle + '\n\n';
    }

    // Evaluación detallada de la disnea
    if (isChecked('disnea') && document.getElementById('dyspnea-details')?.classList.contains('visible')) {
        const nyhaClass = document.getElementById('nyha-class')?.textContent;
        const disneaIntensidad = getInputValue('disnea-intensidad');
        
        let disneaDetalle = '**Características de la disnea:** ';
        if (disneaIntensidad && disneaIntensidad !== '0') {
            disneaDetalle += `Intensidad ${disneaIntensidad}/10. `;
        }
        if (nyhaClass && nyhaClass !== '--') {
            disneaDetalle += `**Clase funcional ${nyhaClass}**.`;
        }
        
        report += disneaDetalle + '\n\n';
    }

    // === ANTECEDENTES ===
    const antecedentes = [];
    ['hipertension', 'diabetes', 'dislipidemia', 'tabaquismo',
     'iam-previo', 'icc-previa', 'fibrilacion-auricular', 'cirugia-cardiaca'].forEach(id => {
        if (isChecked(id)) {
            antecedentes.push(getLabelText(id).toLowerCase());
        }
    });

    if (antecedentes.length > 0) {
        report += '## ANTECEDENTES CARDIOVASCULARES\n\n';
        if (antecedentes.length === 1) {
            report += `Antecedente de **${antecedentes[0]}**.\n\n`;
        } else {
            const lastAnt = antecedentes.pop();
            report += `Antecedentes de **${antecedentes.join(', ')} y ${lastAnt}**.\n\n`;
        }
    }

    // Medicación actual
    const medicacion = getInputValue('medicacion-actual');
    if (medicacion) {
        report += `**Medicación cardiovascular actual:** ${medicacion}\n\n`;
    }

    // === SIGNOS VITALES ===
    const pasDer = getInputValue('pas-derecho');
    const padDer = getInputValue('pad-derecho');
    const fc = getInputValue('frecuencia-cardiaca');
    const spo2 = getInputValue('saturacion-oxigeno');

    if (pasDer || padDer || fc || spo2) {
        report += '## SIGNOS VITALES\n\n';
        if (pasDer && padDer) {
            const paIndicator = document.getElementById('pa-indicator')?.textContent || '';
            report += `**Presión arterial:** ${pasDer}/${padDer} mmHg`;
            if (paIndicator) report += ` (${paIndicator.toLowerCase()})`;
            report += '.\n';
        }
        if (fc) {
            const fcIndicator = document.getElementById('fc-indicator')?.textContent || '';
            report += `**Frecuencia cardíaca:** ${fc} lpm`;
            if (fcIndicator) report += ` (${fcIndicator.toLowerCase()})`;
            report += '.\n';
        }
        if (spo2) {
            const spo2Indicator = document.getElementById('spo2-indicator')?.textContent || '';
            report += `**Saturación de oxígeno:** ${spo2}%`;
            if (spo2Indicator) report += ` (${spo2Indicator.toLowerCase()})`;
            report += '.\n';
        }
        report += '\n';
    }

    // === RESUMEN ===
    report += '## RESUMEN\n\n';
    report += `**Progreso del examen:** ${examProgress}%\n`;
    report += `**Secciones completadas:** ${sectionsCompleted}/8\n`;
    if (alertCount > 0) {
        report += `**Hallazgos de alerta:** ${alertCount}\n`;
    }
    if (warningCount > 0) {
        report += `**Hallazgos de atención:** ${warningCount}\n`;
    }
    report += `**Total de hallazgos:** ${findingsCount}\n\n`;

    if (alertCount > 0 || warningCount > 0) {
        report += '**RECOMENDACIÓN:** Los hallazgos identificados requieren evaluación médica especializada y seguimiento apropiado.\n\n';
    }

    // Verificar si hay contenido real
    const hasRealContent = report.includes('**') || 
                          report.includes('lpm') || 
                          report.includes('mmHg') || 
                          report.includes('puntos') ||
                          report.includes('Antecedente') ||
                          report.includes('presenta') ||
                          report.includes('consulta');

    if (!hasRealContent) {
        return 'Complete los campos del examen para generar el informe cardiovascular...';
    }

    return report;
}

function clearForm() {
    if (!confirm('¿Está seguro de que desea limpiar todos los datos del formulario?')) {
        return;
    }
    
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
    
    const dolorValue = document.getElementById('dolor-value');
    if (dolorValue) dolorValue.textContent = '0';
    const disneaValue = document.getElementById('disnea-value');
    if (disneaValue) disneaValue.textContent = '0';
    
    ['probabilidad-coronaria', 'nyha-class', 'itb-derecho', 'itb-izquierdo', 'itb-interpretacion',
     'chads-score', 'chads-recomendacion', 'hasbled-score', 'hasbled-riesgo', 
     'timi-score', 'timi-riesgo', 'capacidad-funcional', 'porcentaje-predicho'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = id.includes('score') ? '0' : '--';
            el.style.color = '';
        }
    });
    
    document.querySelectorAll('.vital-indicator').forEach(ind => {
        ind.textContent = '';
        ind.className = 'vital-indicator';
    });
    
    document.querySelectorAll('.dynamic-section.visible').forEach(section => {
        section.classList.remove('visible');
    });
    
    const assessment = document.getElementById('pa-assessment');
    if (assessment) {
        assessment.classList.remove('visible');
        assessment.innerHTML = '';
    }
    
    examProgress = 0;
    sectionsCompleted = 0;
    alertCount = 0;
    warningCount = 0;
    findingsCount = 0;
    vitalsStatus = 'Pendiente';

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

    // Asegurar submenú de cardiología expandido
    const cardioNavLink = document.getElementById('cardio-nav-link');
    if (cardioNavLink?.classList.contains('active')) {
        const cardioSubMenu = document.getElementById('cardio-sub-menu');
        if (cardioSubMenu) {
            cardioSubMenu.style.maxHeight = cardioSubMenu.scrollHeight + 'px';
        }
    }

    // Layout inicial
    updateLayout();

    // Event listeners generales
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', updateDashboard);
        el.addEventListener('input', updateDashboard);
    });
     
    // Event listeners específicos
    const sin_quejas = document.getElementById('sin-quejas');
    if (sin_quejas) sin_quejas.addEventListener('change', handleNoComplaints);
    
    const dolor_toracico = document.getElementById('dolor-toracico');
    if (dolor_toracico) dolor_toracico.addEventListener('change', handleChestPainToggle);
    
    const disnea = document.getElementById('disnea');
    if (disnea) disnea.addEventListener('change', handleDyspneaToggle);
    
    const dolor_intensidad = document.getElementById('dolor-intensidad');
    if (dolor_intensidad) dolor_intensidad.addEventListener('input', updateDolorValue);
    
    const disnea_intensidad = document.getElementById('disnea-intensidad');
    if (disnea_intensidad) disnea_intensidad.addEventListener('input', updateDisneaValue);
    
    const ejercicio_tolerancia = document.getElementById('ejercicio-tolerancia');
    if (ejercicio_tolerancia) ejercicio_tolerancia.addEventListener('change', evaluateNYHA);
    
    // Signos vitales
    ['pas-derecho', 'pad-derecho', 'pas-izquierdo', 'pad-izquierdo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', evaluateBloodPressure);
    });
    
    const fc_el = document.getElementById('frecuencia-cardiaca');
    if (fc_el) fc_el.addEventListener('change', evaluateHeartRate);
    
    const spo2_el = document.getElementById('saturacion-oxigeno');
    if (spo2_el) spo2_el.addEventListener('change', evaluateSaturation);

    // Secciones dinámicas
    const pulso_caracter = document.getElementById('pulso-caracter');
    if (pulso_caracter) pulso_caracter.addEventListener('change', handlePulseCharacter);
    
    const inspeccion_cardiaca = document.getElementById('inspeccion-cardiaca');
    if (inspeccion_cardiaca) inspeccion_cardiaca.addEventListener('change', handleInspeccionCardiaca);
    
    const latido_apical = document.getElementById('latido-apical');
    if (latido_apical) latido_apical.addEventListener('change', handleLatidoApical);
    
    const limites_cardiacos = document.getElementById('limites-cardiacos');
    if (limites_cardiacos) limites_cardiacos.addEventListener('change', handleLimitesCardiacos);
    
    const edemas_presencia = document.getElementById('edemas-presencia');
    if (edemas_presencia) edemas_presencia.addEventListener('change', handleEdemas);
    
    const venas_estado = document.getElementById('venas-estado');
    if (venas_estado) venas_estado.addEventListener('change', handleVenas);
    
    const ecg_ritmo = document.getElementById('ecg-ritmo');
    if (ecg_ritmo) ecg_ritmo.addEventListener('change', handleECGRitmo);
    
    const ecg_conduccion = document.getElementById('ecg-conduccion');
    if (ecg_conduccion) ecg_conduccion.addEventListener('change', handleECGConduccion);
    
    const cambios_isquemicos = document.getElementById('cambios-isquemicos');
    if (cambios_isquemicos) cambios_isquemicos.addEventListener('change', handleCambiosIsquemicos);

    // Escalas de riesgo
    document.querySelectorAll('[id^="chads-"]').forEach(el => el.addEventListener('change', calculateCHADS));
    document.querySelectorAll('[id^="hasbled-"]').forEach(el => el.addEventListener('change', calculateHASBLED));
    document.querySelectorAll('[id^="timi-"]').forEach(el => el.addEventListener('change', calculateTIMI));
    document.querySelectorAll('[id^="pa-brazo-"], [id^="pa-tobillo-"]').forEach(el => el.addEventListener('change', calculateITB));
    
    const marcha_6min = document.getElementById('marcha-6min');
    if (marcha_6min) marcha_6min.addEventListener('change', evaluate6MWT);
    
    const borg_disnea = document.getElementById('borg-disnea');
    if (borg_disnea) borg_disnea.addEventListener('change', evaluate6MWT);

    // Soplos
    document.querySelectorAll('input[id*="soplo-"]').forEach(el => {
        if (el.type === 'checkbox') {
            el.addEventListener('change', (e) => {
                const idParts = e.target.id.split('-');
                if (idParts.length >= 3) {
                    const timing = idParts[1];
                    const location = idParts[2];
                    handleMurmurToggle(location, timing);
                }
            });
        }
    });

    // Dolor torácico
    document.querySelectorAll('input[name="dolor-tipo"]').forEach(el => {
        el.addEventListener('change', evaluateChestPain);
    });
    
    document.querySelectorAll('#chest-pain-details input[type="checkbox"]').forEach(el => {
        el.addEventListener('change', evaluateChestPain);
    });

    // Cálculos iniciales
    evaluateChestPain();
    evaluateNYHA();
    evaluateBloodPressure();
    evaluateHeartRate();
    evaluateSaturation();
    calculateITB();
    calculateCHADS();
    calculateHASBLED();
    calculateTIMI();
    evaluate6MWT();
    
    updateDashboard();

    console.log('🎉 Sistema de Evaluación Cardiovascular Premium cargado exitosamente!');
});