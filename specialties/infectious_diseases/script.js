// ========== VARIABLES GLOBALES ==========
const MAIN_SIDEBAR_WIDTH = 250;
const COLLAPSED_SIDEBAR_WIDTH = 80;
const REPORT_PANEL_WIDTH = 400;
const TOP_BAR_HEIGHT = 72;

let examProgress = 0;
let sectionsCompleted = 0;
let alertCount = 0;
let warningCount = 0;
let findingsCount = 0;
let specialtyStatus = 'Normal'; // Changed from 'Pending' to 'Normal' as default state for sepsis/SIRS

// ========== FUNCIONES BASE DE DEMO.HTML ADAPTADAS ==========

// Función para cambiar el tema (claro/oscuro)
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

// Función para cambiar la barra lateral principal (colapsar/expandir)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.getElementById('sidebar-toggle-icon');
    sidebar.classList.toggle('collapsed');
    if (sidebar.classList.contains('collapsed')) {
        toggleIcon.className = 'fas fa-chevron-right';
    } else {
        toggleIcon.className = 'fas fa-chevron-left';
    }
    updateLayout(); // Actualizar el diseño
}

// Función para expandir/contraer el submenú de la especialidad
function toggleSpecialtySubMenu(event) {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del enlace
    const specialtyNavLink = document.getElementById('specialty-nav-link');
    const specialtySubMenu = document.getElementById('specialty-sub-menu');

    // Alternar la clase 'active' en el enlace de la especialidad
    specialtyNavLink.classList.toggle('active');

    // Ajustar la altura máxima del submenú para expandir/contraer
    if (specialtyNavLink.classList.contains('active')) {
        specialtySubMenu.style.maxHeight = specialtySubMenu.scrollHeight + 'px';
    } else {
        specialtySubMenu.style.maxHeight = '0';
    }

    // Opcional: Contraer otros submenús si los hubiera (not strictly needed for single specialty menu)
    document.querySelectorAll('.nav-link.active:not(#specialty-nav-link)').forEach(otherLink => {
        otherLink.classList.remove('active');
        const otherSubMenu = otherLink.nextElementSibling;
        if (otherSubMenu && otherSubMenu.classList.contains('sub-menu')) {
            otherSubMenu.style.maxHeight = '0';
        }
    });

    updateLayout(); // Actualizar el diseño (aunque este cambio no afecta el ancho principal)
}

// Función para cambiar la expansión de las secciones principales
function toggleSection(headerElement) {
    const sectionContainer = headerElement.closest('.section-container');
    const content = sectionContainer.querySelector('.section-content-main');
    sectionContainer.classList.toggle('expanded');
    if (sectionContainer.classList.contains('expanded')) {
        content.style.maxHeight = content.scrollHeight + 'px';
    } else {
        content.style.maxHeight = '0';
    }
}

// Función para cambiar la visibilidad del panel de informe en tiempo real (derecha)
function toggleStickyPanel() {
    const panel = document.getElementById('stickyReportPanel');
    panel.classList.toggle('active');
    updateLayout(); // Actualizar el diseño
    if (panel.classList.contains('active')) {
        updateReport(); // Generate report when panel opens
    }
}

// Función principal para actualizar todo el diseño (márgenes, posiciones de paneles)
function updateLayout() {
    const contentArea = document.getElementById('contentArea');
    const sidebar = document.getElementById('sidebar');
    const stickyReportPanel = document.getElementById('stickyReportPanel');
    const topBar = document.getElementById('topBar');

    let currentSidebarWidth = sidebar.classList.contains('collapsed') ? COLLAPSED_SIDEBAR_WIDTH : MAIN_SIDEBAR_WIDTH;

    let contentAreaLeftOffset = 0;
    let contentAreaRightOffset = 0;

    if (window.innerWidth > 768) {
        // Lógica de escritorio: las barras laterales empujan el contenido
        contentAreaLeftOffset = currentSidebarWidth;
        
        // El panel de informe fijo empuja el contenido si está activo
        if (stickyReportPanel.classList.contains('active')) {
            contentAreaRightOffset = REPORT_PANEL_WIDTH;
        }
        // Posicionar paneles fijos
        sidebar.style.left = `0px`;
        sidebar.style.transform = `translateX(0)`;
        stickyReportPanel.style.right = `0px`;
        stickyReportPanel.style.transform = stickyReportPanel.classList.contains('active') ? 'translateX(0)' : 'translateX(100%)';

    } else {
        // Lógica móvil: la barra lateral principal se superpone, otros paneles también.
        contentAreaLeftOffset = 0; // Sidebar covers main content on mobile
        contentAreaRightOffset = 0; 

        // Posicionar paneles fijos (se superponen)
        sidebar.style.left = `0px`;
        sidebar.style.transform = sidebar.classList.contains('collapsed') ? 'translateX(-100%)' : 'translateX(0)';
        stickyReportPanel.style.right = `0px`;
        stickyReportPanel.style.transform = stickyReportPanel.classList.contains('active') ? 'translateX(0)' : 'translateX(100%)';
    }

    // Aplicar offsets al contentArea
    contentArea.style.marginLeft = `${contentAreaLeftOffset}px`;
    contentArea.style.marginRight = `${contentAreaRightOffset}px`;

    // Ajustar topBar para que se alinee con contentArea
    topBar.style.left = `${contentAreaLeftOffset}px`;
    topBar.style.width = `calc(100% - ${contentAreaLeftOffset + contentAreaRightOffset}px)`;
}

// Función para desplazar a la sección
function scrollToSection(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Expandir la sección si está colapsada
        const sectionContainer = section.closest('.section-container');
        if (sectionContainer && !sectionContainer.classList.contains('expanded')) {
            toggleSection(sectionContainer.querySelector('.section-header-main'));
        }
    }
}

// 🔄 Expandir/contraer todas las secciones
function expandAllSections() {
    document.querySelectorAll('.section-container:not(.expanded) .section-header-main').forEach(header => {
        toggleSection(header);
    });
}

function collapseAllSections() {
    document.querySelectorAll('.section-container.expanded .section-header-main').forEach(header => {
        // Exclude the dashboard widget from collapsing if it is always expanded
        if (!header.closest('.dashboard-widget')) {
            toggleSection(header);
        }
    });
}

// Show copy notification
function showCopyNotification() {
    const notification = document.getElementById('copyNotification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2500);
}

// Fallback to copy to clipboard for insecure contexts
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
        alert('No se pudo copiar el texto. Por favor, cópielo manualmente.');
    }

    document.body.removeChild(textArea);
}

// ========== FUNCIONES DE INFORME (ADAPTADAS DEL ORIGINAL Y DEMO) ==========

// Función para actualizar el informe en tiempo real (en el panel sticky)
function updateReport() {
    const reportContentEl = document.getElementById('reportContent');
    const updateIndicator = document.getElementById('updateIndicator');
    
    updateIndicator.classList.add('active');
    
    setTimeout(() => {
        // Call the main generateConclusion function to get the latest report content
        const currentReport = generateConclusionText(); // Get the text, don't update HTML yet

        reportContentEl.textContent = currentReport;
        updateIndicator.classList.remove('active');
    }, 300);
}

// Función para copiar el informe del panel sticky al portapapeles
function copyReportToClipboard() {
    const reportContent = document.getElementById('reportContent').textContent;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(reportContent).then(() => {
            showCopyNotification();
        }).catch(err => {
            fallbackCopyToClipboard(reportContent);
        });
    } else {
        fallbackCopyToClipboard(reportContent);
    }
}

// Función para imprimir el informe del panel sticky
function printReport() {
    const conclusion = document.getElementById('reportContent').textContent;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Informe Infectológico</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    line-height: 1.6;
                }
                pre { 
                    white-space: pre-wrap; 
                    font-family: 'Courier New', monospace; 
                    font-size: 12px;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #e74c3c; /* Specialty main color */
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
                <h1>Informe Infectológico</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
                <p>Hora: ${new Date().toLocaleTimeString()}</p>
            </div>
            <pre>${conclusion}</pre>
            <div class="footer">
                <p>Generado por Sistema de Evaluación Infectológica HealthOS</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Functions for the conclusion in the main content area
function generateConclusion() {
    const conclusionText = generateConclusionText();
    document.getElementById('conclusion-text').textContent = conclusionText;
    updateReport(); // Also update sticky report panel
}

function copyConclusionToClipboard() {
    const conclusion = document.getElementById('conclusion-text').textContent;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(conclusion).then(() => {
            showCopyNotification();
        }).catch(err => {
            fallbackCopyToClipboard(conclusion);
        });
    } else {
        fallbackCopyToClipboard(conclusion);
    }
}

function printConclusion() {
    const conclusion = document.getElementById('conclusion-text').textContent;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Conclusión Infectológica</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    line-height: 1.6;
                }
                pre { 
                    white-space: pre-wrap; 
                    font-family: 'Courier New', monospace; 
                    font-size: 12px;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #e74c3c; /* Specialty main color */
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Conclusión Infectológica</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
            </div>
            <pre>${conclusion}</pre>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ========== FUNCIONES MÉDICAS ESPECÍFICAS MIGRADAS ==========

// 🚫 Manejo de "Sin fiebre"
function handleNoFever() {
    const noFeverCheckbox = document.getElementById('sin-fiebre');
    
    if (noFeverCheckbox.checked) {
        document.getElementById('temperatura-maxima').value = '';
        document.getElementById('duracion-fiebre').value = '';
        document.getElementById('fiebre-continua').checked = false;
        document.getElementById('fiebre-intermitente').checked = false;
        document.getElementById('fiebre-remitente').checked = false;
        document.getElementById('escalofrios').checked = false;
        document.getElementById('sudoracion').checked = false;
    }
    updateDashboard();
}

// ⚖️ Manejo de checkboxes mutuamente excluyentes (re-added for completeness, though no direct usage in provided file)
function handleMutuallyExclusive(positiveId, negativeId, checkbox) {
    if (checkbox.checked) {
        const oppositeId = checkbox.id === positiveId ? negativeId : positiveId;
        const oppositeCheckbox = document.getElementById(oppositeId);
        if (oppositeCheckbox) oppositeCheckbox.checked = false;
    }
    updateDashboard();
}

// Funciones de evaluación específicas para infectología
function evaluateFever() {
    const tempMax = parseFloat(document.getElementById('temperatura-maxima').value) || 0;
    const duracion = parseFloat(document.getElementById('duracion-fiebre').value) || 0;
    const classificationEl = document.getElementById('fever-classification');
    
    if (tempMax === 0 && duracion === 0 && !document.getElementById('sin-fiebre').checked) {
        classificationEl.textContent = '--';
        classificationEl.style.color = '';
        updateDashboard();
        return;
    }
    
    let classification = '';
    let color = '';
    if (tempMax >= 40) {
        classification = 'Hipertermia'; color = 'var(--alert-color)';
    } else if (tempMax >= 39) {
        classification = 'Fiebre alta'; color = 'var(--warning-color)';
    } else if (tempMax >= 38) {
        classification = 'Fiebre moderada'; color = 'var(--warning-color)';
    } else if (tempMax >= 37.2) {
        classification = 'Febrícula'; color = 'var(--normal-color)';
    } else {
        classification = 'Normal'; color = 'var(--normal-color)';
    }
    
    classificationEl.textContent = classification;
    classificationEl.style.color = color;
    updateDashboard();
}

function evaluateVitalSigns() {
    const temp = parseFloat(document.getElementById('temperatura-actual').value) || 0;
    const pas = parseFloat(document.getElementById('pas').value) || 0;
    const fc = parseFloat(document.getElementById('frecuencia-cardiaca').value) || 0;
    const fr = parseFloat(document.getElementById('frecuencia-respiratoria').value) || 0;
    const sat = parseFloat(document.getElementById('saturacion-o2').value) || 0;
    const statusEl = document.getElementById('hemodynamic-status');
    
    let status = 'Estable';
    let color = 'var(--normal-color)';
    
    if (pas < 90 || fc > 120 || fr > 30 || sat < 90) {
        status = 'Inestable'; color = 'var(--alert-color)';
    } else if (pas < 100 || fc > 100 || fr > 24 || sat < 95) {
        status = 'Vigilancia'; color = 'var(--warning-color)';
    }
    
    statusEl.textContent = status;
    statusEl.style.color = color;
    updateDashboard();
}

function evaluateGlasgow() {
    const glasgow = parseFloat(document.getElementById('glasgow').value) || 0;
    const interpretEl = document.getElementById('glasgow-interpretation');
    
    if (glasgow === 0) {
        interpretEl.textContent = '--';
        interpretEl.style.color = '';
        updateDashboard();
        return;
    }
    
    let interpretation = '';
    let color = '';
    if (glasgow >= 14) {
        interpretation = 'Leve'; color = 'var(--normal-color)';
    } else if (glasgow >= 9) {
        interpretation = 'Moderado'; color = 'var(--warning-color)';
    } else {
        interpretation = 'Severo'; color = 'var(--alert-color)';
    }
    
    interpretEl.textContent = interpretation;
    interpretEl.style.color = color;
    updateDashboard();
}

function evaluateFeverPattern() {
    const temp = parseFloat(document.getElementById('temp-presentacion').value) || 0;
    const tipoFiebre = document.querySelector('input[name="tipo-fiebre"]:checked');
    const duracionFiebre = document.querySelector('input[name="duracion-fiebre-radio"]:checked');
    const classificationEl = document.getElementById('fever-syndrome-classification');
    
    if (!tipoFiebre || !duracionFiebre) {
        classificationEl.textContent = '--';
        classificationEl.style.color = '';
        updateDashboard();
        return;
    }
    
    const tipo = tipoFiebre.value;
    const duracion = duracionFiebre.value;
    
    let classification = `${tipo} ${duracion}`;
    let color = 'var(--warning-color)';
    
    if (tipo === 'hipertermia' || duracion === 'fuo') {
        color = 'var(--alert-color)';
    } else if (tipo === 'febricula' && duracion === 'aguda') {
        color = 'var(--normal-color)';
    }
    
    classificationEl.textContent = classification;
    classificationEl.style.color = color;
    updateDashboard();
}

function calculateQSOFA() {
    let score = 0;
    
    if (document.getElementById('qsofa-fr').checked) score++;
    if (document.getElementById('qsofa-mental').checked) score++;
    if (document.getElementById('qsofa-pas').checked) score++;
    
    document.getElementById('qsofa-score').textContent = score;
    
    let risk = '';
    let color = '';
    if (score >= 2) {
        risk = 'Alto riesgo (>10% mortalidad)'; color = 'var(--alert-color)';
    } else if (score === 1) {
        risk = 'Riesgo moderado'; color = 'var(--warning-color)';
    } else {
        risk = 'Bajo riesgo (<3% mortalidad)'; color = 'var(--normal-color)';
    }
    
    document.getElementById('qsofa-risk').textContent = risk;
    document.getElementById('qsofa-risk').style.color = color;
    updateDashboard();
}

function calculateSIRS() {
    let criterios = 0;
    
    if (document.getElementById('sirs-temp').checked) criterios++;
    if (document.getElementById('sirs-fc').checked) criterios++;
    if (document.getElementById('sirs-fr').checked) criterios++;
    if (document.getElementById('sirs-leuco').checked) criterios++;
    
    document.getElementById('sirs-criterios').textContent = criterios;
    
    let diagnosis = '';
    let color = '';
    if (criterios >= 2) {
        diagnosis = 'SÍ - Cumple criterios SIRS'; color = 'var(--alert-color)';
    } else {
        diagnosis = 'NO - No cumple criterios SIRS'; color = 'var(--normal-color)';
    }
    
    document.getElementById('sirs-diagnosis').textContent = diagnosis;
    document.getElementById('sirs-diagnosis').style.color = color;
    updateDashboard();
}

function calculateCURB65() {
    let score = 0;
    
    if (document.getElementById('curb-confusion').checked) score++;
    if (document.getElementById('curb-urea').checked) score++;
    if (document.getElementById('curb-respiratoria').checked) score++;
    if (document.getElementById('curb-presion').checked) score++;
    if (document.getElementById('curb-edad').checked) score++;
    
    document.getElementById('curb65-score').textContent = score;
    
    let risk = '';
    let recommendation = '';
    let color = '';
    
    if (score === 0) {
        risk = 'Muy bajo (0.7%)'; recommendation = 'Ambulatorio'; color = 'var(--normal-color)';
    } else if (score === 1) {
        risk = 'Bajo (2.1%)'; recommendation = 'Ambulatorio vigilado'; color = 'var(--normal-color)';
    } else if (score === 2) {
        risk = 'Moderado (9.2%)'; recommendation = 'Hospitalización'; color = 'var(--warning-color)';
    } else if (score >= 3) {
        risk = 'Alto (14.5-57%)'; recommendation = 'Hospitalización/UCI'; color = 'var(--alert-color)';
    }
    
    document.getElementById('curb65-risk').textContent = risk;
    document.getElementById('curb65-risk').style.color = color;
    document.getElementById('curb65-recommendation').textContent = recommendation;
    document.getElementById('curb65-recommendation').style.color = color;
    updateDashboard();
}

function calculatePSI() {
    let score = 0;
    
    const edad = parseFloat(document.getElementById('psi-edad').value) || 0;
    const masculino = document.getElementById('psi-masculino').checked;
    
    score += edad;
    if (!masculino) score -= 10; // Adjustment for female sex
    
    // Comorbidities (10 points each)
    ['psi-neoplasia', 'psi-hepatopatia', 'psi-icc', 'psi-enfermedad-cerebrovascular', 'psi-nefropatia'].forEach(id => {
        if (document.getElementById(id).checked) score += 10;
    });
    
    document.getElementById('psi-score').textContent = score;
    
    let riskClass = '';
    let color = '';
    if (score <= 70) {
        riskClass = 'Clase I-II (Bajo riesgo)'; color = 'var(--normal-color)';
    } else if (score <= 90) {
        riskClass = 'Clase III (Riesgo moderado)'; color = 'var(--warning-color)';
    } else if (score <= 130) {
        riskClass = 'Clase IV (Alto riesgo)'; color = 'var(--alert-color)';
    } else {
        riskClass = 'Clase V (Muy alto riesgo)'; color = 'var(--alert-color)';
    }
    
    document.getElementById('psi-class').textContent = riskClass;
    document.getElementById('psi-class').style.color = color;
    updateDashboard();
}

function calculateITURisk() {
    let factors = 0;
    
    ['itu-embarazo', 'itu-diabetes', 'itu-inmunosupresion', 'itu-uropatia', 
     'itu-cateter', 'itu-instrumentacion', 'itu-masculino', 'itu-anciano'].forEach(id => {
        if (document.getElementById(id).checked) factors++;
    });
    
    document.getElementById('itu-risk-count').textContent = factors;
    
    let classification = '';
    let color = '';
    if (factors === 0) {
        classification = 'ITU no complicada'; color = 'var(--normal-color)';
    } else {
        classification = 'ITU complicada'; color = 'var(--alert-color)';
    }
    
    document.getElementById('itu-classification').textContent = classification;
    document.getElementById('itu-classification').style.color = color;
    updateDashboard();
}

function evaluateGastroenteritis() {
    const deposiciones = parseFloat(document.getElementById('deposiciones-dia').value) || 0;
    const sanguinolenta = document.getElementById('gastro-sanguinolenta').checked;
    const deshidratacion = document.getElementById('gastro-deshidratacion').checked;
    const severityEl = document.getElementById('gastroenteritis-severity');
    
    let severity = 'Leve';
    let color = 'var(--normal-color)';
    
    if (sanguinolenta || deshidratacion || deposiciones >= 10) {
        severity = 'Severa'; color = 'var(--alert-color)';
    } else if (deposiciones >= 6) {
        severity = 'Moderada'; color = 'var(--warning-color)';
    }
    
    severityEl.textContent = severity;
    severityEl.style.color = color;
    updateDashboard();
}

/**
 * Genera una conclusión narrativa del examen infectológico basada en los datos del formulario.
 * This function is refactored to return the text, which can then be used by different UI elements.
 */
function generateConclusionText() {
    let conclusion = 'EXAMEN INFECTOLÓGICO\n\n';

    // === 1. MOTIVO DE CONSULTA Y SÍNDROME FEBRIL ===
    let motivo = '';
    const tempMaxima = document.getElementById('temperatura-maxima').value;
    const duracionFiebre = document.getElementById('duracion-fiebre').value;
    const sinFiebre = document.getElementById('sin-fiebre').checked;
    const feverClassification = document.getElementById('fever-classification').textContent;

    if (sinFiebre) {
        motivo += 'MOTIVO DE CONSULTA: Proceso infeccioso sin fiebre. ';
    } else if (tempMaxima && tempMaxima > 0) {
        motivo += `MOTIVO DE CONSULTA: Síndrome febril con temperatura máxima de ${tempMaxima}°C`;
        if (duracionFiebre && duracionFiebre > 0) motivo += ` de ${duracionFiebre} días de evolución`;
        if (feverClassification !== '--') motivo += ` (${feverClassification})`;
        motivo += '. ';
        
        // Características del patrón febril
        const patronFebril = [];
        if (document.getElementById('fiebre-continua').checked) patronFebril.push('continua');
        if (document.getElementById('fiebre-intermitente').checked) patronFebril.push('intermitente');
        if (document.getElementById('fiebre-remitente').checked) patronFebril.push('remitente');
        if (document.getElementById('escalofrios').checked) patronFebril.push('escalofríos');
        if (document.getElementById('sudoracion').checked) patronFebril.push('sudoración profusa');
        
        if (patronFebril.length > 0) {
            motivo += `Patrón febril: ${patronFebril.join(', ')}. `;
        }
    }

    // === 2. SÍNTOMAS POR SISTEMAS ===
    let sintomas = '';

    // Síntomas respiratorios
    const sintomasResp = [];
    ['tos-seca', 'tos-productiva', 'expectoracion-purulenta', 'hemoptisis', 'disnea', 
     'dolor-toracico', 'dolor-pleuritico', 'odinofagia', 'rinorrea'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            sintomasResp.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });

    if (sintomasResp.length > 0) {
        sintomas += `Síntomas respiratorios: ${sintomasResp.join(', ')}. `;
    }

    // Síntomas gastrointestinales
    const sintomasGI = [];
    ['nauseas', 'vomitos', 'diarrea', 'diarrea-sanguinolenta', 'dolor-abdominal', 
     'distension-abdominal', 'tenesmo', 'ictericia'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            sintomasGI.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });

    if (sintomasGI.length > 0) {
        sintomas += `Síntomas gastrointestinales: ${sintomasGI.join(', ')}. `;
    }

    // Síntomas neurológicos
    const sintomasNeuro = [];
    ['cefalea', 'cefalea-intensa', 'fotofobia', 'rigidez-nuca', 'confusion', 
     'alteracion-conciencia', 'convulsiones', 'deficit-focal'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            sintomasNeuro.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });

    if (sintomasNeuro.length > 0) {
        sintomas += `Síntomas neurológicos: ${sintomasNeuro.join(', ')}. `;
    }

    // Síntomas genitourinarios
    const sintomasGU = [];
    ['disuria', 'poliaquiuria', 'urgencia-miccional', 'hematuria', 'dolor-lumbar', 
     'dolor-suprapubico', 'secrecion-uretral', 'dolor-pelvico'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            sintomasGU.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });

    if (sintomasGU.length > 0) {
        sintomas += `Síntomas genitourinarios: ${sintomasGU.join(', ')}. `;
    }

    // Síntomas cutáneos
    const sintomasCutaneos = [];
    ['exantema', 'petequias', 'purpura', 'celulitis', 'abscesos', 'ulceras-cutaneas', 
     'lesiones-vesiculares', 'adenopatias-cutaneas'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            sintomasCutaneos.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });

    if (sintomasCutaneos.length > 0) {
        sintomas += `Síntomas cutáneos: ${sintomasCutaneos.join(', ')}. `;
    }

    if (motivo || sintomas) {
        conclusion += motivo + sintomas + '\n\n';
    }

    // === 3. FACTORES EPIDEMIOLÓGICOS ===
    const viajesRecientes = document.getElementById('viajes-recientes')?.value;
    const factoresEpi = [];
    ['zona-endemica', 'contacto-animales', 'agua-contaminada', 'alimentos-riesgo', 
     'actividad-sexual-riesgo', 'picaduras-insectos', 'contacto-enfermos', 'brote-comunitario'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            factoresEpi.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });

    if (viajesRecientes || factoresEpi.length > 0) {
        conclusion += 'FACTORES EPIDEMIOLÓGICOS:\n';
        if (viajesRecientes) conclusion += `• Viajes recientes: ${viajesRecientes}. `;
        if (factoresEpi.length > 0) conclusion += `• Exposiciones de riesgo: ${factoresEpi.join(', ')}. `;
        conclusion += '\n\n';
    }

    // === 4. ESTADO INMUNOLÓGICO ===
    const estadoInmuno = [];
    ['vih-positivo', 'diabetes-mellitus', 'inmunosupresion-farmacologica', 'neoplasia-activa', 
     'transplante-organos', 'esplenectomia', 'cirrosis-hepatica'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            estadoInmuno.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });

    if (estadoInmuno.length > 0) {
        conclusion += `ESTADO INMUNOLÓGICO: ${estadoInmuno.join(', ')}.\n\n`;
    } else if (document.getElementById('inmunocompetente')?.checked) {
        conclusion += 'ESTADO INMUNOLÓGICO: Paciente inmunocompetente.\n\n';
    }

    // === 5. EXAMEN FÍSICO ===
    const hasPhysicalExamContent = document.querySelector('#physical-exam-content input:checked') ||
                                   document.getElementById('temperatura-actual')?.value > 0 ||
                                   document.getElementById('pas')?.value > 0;

    if (hasPhysicalExamContent) {
        conclusion += 'EXAMEN FÍSICO:\n';

        // Signos vitales
        const tempActual = document.getElementById('temperatura-actual')?.value;
        const pas = document.getElementById('pas')?.value;
        const pad = document.getElementById('pad')?.value;
        const fc = document.getElementById('frecuencia-cardiaca')?.value;
        const fr = document.getElementById('frecuencia-respiratoria')?.value;
        const satO2 = document.getElementById('saturacion-o2')?.value;
        const hemoStatus = document.getElementById('hemodynamic-status')?.textContent;

        if (tempActual || pas) {
            conclusion += '• Signos vitales: ';
            if (tempActual) conclusion += `T° ${tempActual}°C`;
            if (pas && pad) {
                if (tempActual) conclusion += ', ';
                conclusion += `PA ${pas}/${pad} mmHg`;
            }
            if (fc) conclusion += `, FC ${fc} lpm`;
            if (fr) conclusion += `, FR ${fr} rpm`;
            if (satO2) conclusion += `, SatO2 ${satO2}%`;
            if (hemoStatus !== '--') conclusion += ` (Estado: ${hemoStatus})`;
            conclusion += '. ';
        }

        // Estado general
        const estadoGeneral = [];
        ['mal-estado-general', 'aspecto-toxico', 'palidez', 'cianosis', 'ictericia-fisica', 'deshidratacion'].forEach(id => {
            if (document.getElementById(id)?.checked) {
                estadoGeneral.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
            }
        });

        if (estadoGeneral.length > 0) {
            conclusion += `• Estado general: ${estadoGeneral.join(', ')}. `;
        } else if (document.getElementById('buen-estado-general')?.checked) {
            conclusion += '• Estado general conservado. ';
        }

        // Examen respiratorio
        const hallazgosResp = [];
        ['crepitantes-der', 'crepitantes-izq', 'roncus-der', 'roncus-izq', 'sibilancias-der', 'sibilancias-izq',
         'mvr-disminuido-der', 'mvr-disminuido-izq', 'roce-pleural-der', 'roce-pleural-izq'].forEach(id => {
            if (document.getElementById(id)?.checked) {
                const lado = id.includes('-der') ? 'derecho' : 'izquierdo';
                const hallazgoMap = {
                    'crepitantes': 'Crepitantes',
                    'roncus': 'Roncus',
                    'sibilancias': 'Sibilancias',
                    'mvr-disminuido': 'MV disminuido',
                    'roce-pleural': 'Roce pleural'
                };
                const baseId = id.replace('-der', '').replace('-izq', '');
                hallazgosResp.push(`${hallazgoMap[baseId]} ${lado}`);
            }
        });

        if (hallazgosResp.length > 0) {
            conclusion += `• Examen respiratorio: ${hallazgosResp.join(', ')}. `;
        } else if (document.getElementById('mvr-normal-der')?.checked && document.getElementById('mvr-normal-izq')?.checked) {
            conclusion += '• Examen respiratorio: MV normal bilateral. ';
        }

        // Examen cardiovascular
        const hallazgosCardio = [];
        ['taquicardia', 'bradicardia', 'soplo-cardiaco', 'galope', 'roce-pericardico', 
         'edema-mmii', 'ingurgitacion-yugular'].forEach(id => {
            if (document.getElementById(id)?.checked) {
                hallazgosCardio.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
            }
        });

        if (hallazgosCardio.length > 0) {
            conclusion += `• Examen cardiovascular: ${hallazgosCardio.join(', ')}. `;
        } else if (document.getElementById('ruidos-cardiacos-normales')?.checked) {
            conclusion += '• Examen cardiovascular: Ruidos cardíacos normales. ';
        }

        // Examen abdominal
        const hallazgosAbdomen = [];
        ['abdomen-distendido', 'dolor-abdominal-palpacion', 'defensa-abdominal', 'rebote-positivo',
         'hepatomegalia', 'esplenomegalia', 'ascitis'].forEach(id => {
            if (document.getElementById(id)?.checked) {
                hallazgosAbdomen.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
            }
        });

        if (hallazgosAbdomen.length > 0) {
            conclusion += `• Examen abdominal: ${hallazgosAbdomen.join(', ')}. `;
        } else if (document.getElementById('abdomen-normal')?.checked) {
            conclusion += '• Examen abdominal: Abdomen blando, depresible, no doloroso. ';
        }

        // Examen neurológico
        const glasgow = document.getElementById('glasgow')?.value;
        const glasgowInterpretation = document.getElementById('glasgow-interpretation')?.textContent;
        const signosNeuro = [];
        ['desorientacion', 'somnolencia', 'estupor', 'kernig-positivo', 'brudzinski-positivo',
         'rigidez-nuca-fisica', 'fotofobia-fisica'].forEach(id => {
            if (document.getElementById(id)?.checked) {
                signosNeuro.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
            }
        });

        if (glasgow || signosNeuro.length > 0) {
            conclusion += '• Examen neurológico: ';
            if (glasgow) {
                conclusion += `Glasgow ${glasgow}/15`;
                if (glasgowInterpretation !== '--') conclusion += ` (${glasgowInterpretation})`;
            }
            if (signosNeuro.length > 0) {
                if (glasgow) conclusion += ', ';
                conclusion += signosNeuro.join(', ');
            }
            conclusion += '. ';
        } else if (document.getElementById('conciencia-normal')?.checked) {
            conclusion += '• Examen neurológico: Conciencia normal, sin signos meníngeos. ';
        }

        // Examen de piel
        const lesionescutaneas = [];
        ['exantema-maculopapular', 'exantema-vesicular', 'petequias-fisica', 'purpura-fisica',
         'equimosis', 'celulitis-fisica', 'abscesos-fisica'].forEach(id => {
            if (document.getElementById(id)?.checked) {
                lesionescutaneas.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
            }
        });

        if (lesionescutaneas.length > 0) {
            conclusion += `• Examen de piel: ${lesionescutaneas.join(', ')}. `;
        } else if (document.getElementById('piel-normal')?.checked) {
            conclusion += '• Examen de piel: Sin lesiones aparentes. ';
        }

        // Adenopatías
        const adenopatias = [];
        ['adenopatias-cervicales', 'adenopatias-supraclaviculares', 'adenopatias-axilares',
         'adenopatias-inguinales', 'adenopatias-generalizadas'].forEach(id => {
            if (document.getElementById(id)?.checked) {
                adenopatias.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase().replace('adenopatías ', ''));
            }
        });

        if (adenopatias.length > 0) {
            conclusion += `• Adenopatías: ${adenopatias.join(', ')}`;
            if (document.getElementById('adenopatias-dolorosas')?.checked) conclusion += ', dolorosas';
            if (document.getElementById('adenopatias-adheridas')?.checked) conclusion += ', adheridas';
            conclusion += '. ';
        } else if (document.getElementById('adenopatias-ausentes')?.checked) {
            conclusion += '• Sin adenopatías palpables. ';
        }

        conclusion += '\n\n';
    }

    // === 6. EVALUACIÓN DEL SÍNDROME FEBRIL ===
    const tempPresentacion = document.getElementById('temp-presentacion')?.value;
    const feverSyndromeClassification = document.getElementById('fever-syndrome-classification')?.textContent;

    if (tempPresentacion || feverSyndromeClassification !== '--') {
        conclusion += 'EVALUACIÓN DEL SÍNDROME FEBRIL:\n';
        if (tempPresentacion) conclusion += `• Temperatura de presentación: ${tempPresentacion}°C. `;
        if (feverSyndromeClassification !== '--') conclusion += `• Clasificación: ${feverSyndromeClassification}. `;
        conclusion += '\n\n';
    }

    // === 7. EVALUACIÓN DE SEPSIS Y SIRS ===
    const qsofaScore = document.getElementById('qsofa-score')?.textContent;
    const qsofaRisk = document.getElementById('qsofa-risk')?.textContent;
    const sirsCriterios = document.getElementById('sirs-criterios')?.textContent;
    const sirsDiagnosis = document.getElementById('sirs-diagnosis')?.textContent;

    if ((qsofaScore && qsofaScore !== '0') || (sirsDiagnosis && sirsDiagnosis !== '--')) {
        conclusion += 'EVALUACIÓN DE SEPSIS Y SIRS:\n';
        
        if (qsofaScore && qsofaScore !== '0') {
            conclusion += `• qSOFA: ${qsofaScore}/3 puntos`;
            if (qsofaRisk !== '--') conclusion += ` (${qsofaRisk})`;
            conclusion += '. ';
        }
        
        if (sirsDiagnosis && sirsDiagnosis !== '--') {
            const cumpleSIRS = sirsDiagnosis.includes('SÍ') ? 'Cumple' : 'No cumple';
            conclusion += `• SIRS: ${cumpleSIRS} criterios (${sirsCriterios}/4). `;
        }

        // Disfunción orgánica
        const disfuncionOrganica = [];
        ['hipotension-refractaria', 'oliguria', 'lactato-elevado', 'bilirrubina-elevada',
         'plaquetopenia', 'coagulopatia', 'hipoxemia', 'acidosis-metabolica'].forEach(id => {
            if (document.getElementById(id)?.checked) {
                disfuncionOrganica.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
            }
        });

        if (disfuncionOrganica.length > 0) {
            conclusion += `• Disfunción orgánica: ${disfuncionOrganica.join(', ')}. `;
        }

        conclusion += '\n\n';
    }

    // === 8. ESCALAS DE RIESGO ===
    const curb65Score = document.getElementById('curb65-score')?.textContent;
    const curb65Risk = document.getElementById('curb65-risk')?.textContent;
    const curb65Recommendation = document.getElementById('curb65-recommendation')?.textContent;
    const psiScore = document.getElementById('psi-score')?.textContent;
    const psiClass = document.getElementById('psi-class')?.textContent;
    const ituRiskCount = document.getElementById('itu-risk-count')?.textContent;
    const ituClassification = document.getElementById('itu-classification')?.textContent;

    const hasRiskScalesContent = (curb65Score && curb65Score !== '0') || 
                                 (psiScore && psiScore !== '0') || 
                                 (ituClassification && ituClassification !== '--');

    if (hasRiskScalesContent) {
        conclusion += 'ESCALAS DE RIESGO:\n';
        
        if (curb65Score && curb65Score !== '0') {
            conclusion += `• CURB-65: ${curb65Score}/5 puntos`;
            if (curb65Risk !== '--') conclusion += `, riesgo ${curb65Risk}`;
            if (curb65Recommendation !== '--') conclusion += `, recomendación: ${curb65Recommendation}`;
            conclusion += '. ';
        }
        
        if (psiScore && psiScore !== '0') {
            conclusion += `• PSI/PORT: ${psiScore} puntos`;
            if (psiClass !== '--') conclusion += ` (${psiClass})`;
            conclusion += '. ';
        }
        
        if (ituClassification && ituClassification !== '--') {
            conclusion += `• Evaluación ITU: ${ituClassification} (${ituRiskCount} factores de riesgo). `;
        }
        
        conclusion += '\n\n';
    }

    // === 9. FOCO INFECCIOSO IDENTIFICADO ===
    const focos = [];
    
    // Foco respiratorio
    const focosResp = [];
    ['neumonia-probable', 'bronquitis', 'faringitis', 'sinusitis', 'otitis'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            focosResp.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });
    if (focosResp.length > 0) focos.push(`Respiratorio: ${focosResp.join(', ')}`);

    // Foco urinario
    const focosUrin = [];
    ['itu-baja', 'pielonefritis', 'uretritis', 'prostatitis'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            focosUrin.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });
    if (focosUrin.length > 0) focos.push(`Urinario: ${focosUrin.join(', ')}`);

    // Foco gastrointestinal
    const focosGI = [];
    ['gastroenteritis', 'colitis', 'apendicitis', 'colangitis', 'absceso-abdominal'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            focosGI.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });
    if (focosGI.length > 0) focos.push(`Gastrointestinal: ${focosGI.join(', ')}`);

    // Foco neurológico
    const focosNeuro = [];
    ['meningitis-probable', 'encefalitis', 'absceso-cerebral'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            focosNeuro.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });
    if (focosNeuro.length > 0) focos.push(`Neurológico: ${focosNeuro.join(', ')}`);

    // Foco cutáneo
    const focosCutaneos = [];
    ['celulitis-foco', 'erisipela', 'absceso-cutaneo', 'impetigo'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            focosCutaneos.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });
    if (focosCutaneos.length > 0) focos.push(`Cutáneo: ${focosCutaneos.join(', ')}`);

    // Otros focos
    const otrosfocos = [];
    ['endocarditis-probable', 'artritis-septica', 'osteomielitis'].forEach(id => {
        if (document.getElementById(id)?.checked) {
            otrosfocos.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        }
    });
    if (otrosfocos.length > 0) focos.push(`Otros: ${otrosfocos.join(', ')}`);

    if (focos.length > 0) {
        conclusion += `FOCO INFECCIOSO IDENTIFICADO:\n• ${focos.join('. ')}.`;
        conclusion += '\n\n';
    } else if (document.getElementById('foco-desconocido')?.checked) {
        conclusion += 'FOCO INFECCIOSO: No identificado en el examen actual.\n\n';
    }

    // === CONCLUSIÓN FINAL ===
    if (conclusion.trim() === 'EXAMEN INFECTOLÓGICO') {
        conclusion = 'Seleccione los parámetros del examen para generar la conclusión infectológica...';
    } else {
        // Resumen de hallazgos del dashboard
        if (alertCount > 0 || warningCount > 0 || findingsCount > 0) {
            conclusion += '⚠️ RESUMEN DE HALLAZGOS DEL EXAMEN:\n';
            if (alertCount > 0) {
                conclusion += `• ALERTAS CRÍTICAS: ${alertCount}\n`;
            }
            if (warningCount > 0) {
                conclusion += `• HALLAZGOS DE ATENCIÓN: ${warningCount}\n`;
            }
            conclusion += `• TOTAL DE HALLAZGOS REGISTRADOS: ${findingsCount}\n\n`;
        }

        conclusion += '🎯 IMPRESIÓN DIAGNÓSTICA:\n';
        conclusion += '[Pendiente de correlación clínico-laboratorial y estudios complementarios]\n\n';
        conclusion += '📋 PLAN DE MANEJO:\n';
        conclusion += '[A determinar según la patología infecciosa sospechada y severidad]\n\n';
        conclusion += `📊 COMPLETITUD DEL EXAMEN: ${examProgress}%`;
    }

    return conclusion;
}

// 📊 ACTUALIZAR DASHBOARD
function updateDashboard() {
    const sections = [
        'anamnesis-content', 'physical-exam-content', 'fever-evaluation-content', 'sepsis-evaluation-content', 
        'risk-scales-content', 'source-evaluation-content'
    ];
    
    let currentCompletedSections = 0;
    let currentAlertCount = 0;
    let currentWarningCount = 0;
    let currentFindingsCount = 0;
    
    sections.forEach((sectionId, index) => {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            const checkboxes = sectionElement.querySelectorAll('input[type="checkbox"]:checked');
            const radios = sectionElement.querySelectorAll('input[type="radio"]:checked');
            const numbers = sectionElement.querySelectorAll('input[type="number"]');
            const textInputs = sectionElement.querySelectorAll('input[type="text"]');
            
            let hasContent = false;
            if (checkboxes.length > 0 || radios.length > 0) hasContent = true;
            numbers.forEach(input => {
                if (input.value && input.value !== '0') hasContent = true;
            });
            textInputs.forEach(input => {
                if (input.value.trim() !== '') hasContent = true;
            });
            
            // Only count if there's actual medical content, not just for a number input having a value of 0.
            let sectionHasMeaningfulContent = false;
            if (checkboxes.length > 0 || radios.length > 0) {
                sectionHasMeaningfulContent = true;
            }
            numbers.forEach(input => {
                if (input.value && parseFloat(input.value) > 0) { // Check if numeric input has value > 0
                    sectionHasMeaningfulContent = true;
                }
            });
            textInputs.forEach(input => {
                if (input.value.trim() !== '') {
                    sectionHasMeaningfulContent = true;
                }
            });

            if (sectionHasMeaningfulContent) {
                currentCompletedSections++;
                currentFindingsCount += (checkboxes.length + radios.length);
                
                // No badge element in the new architecture, completion is implicitly handled by is-expanded
                // Nav item completion visual feedback (from original file)
                const navItem = document.querySelector(`#specialty-sub-menu li:nth-child(${index + 1})`);
                if (navItem) {
                    navItem.classList.add('completed');
                }
                
                // Criterios de alerta y warning específicos para Infectología
                
                // Síndrome febril
                const feverClassificationText = document.getElementById('fever-classification')?.textContent;
                if (feverClassificationText === 'Hipertermia') currentAlertCount++;
                else if (feverClassificationText === 'Fiebre alta') currentWarningCount++;

                // Síntomas de alarma
                if (document.getElementById('hemoptisis')?.checked || document.getElementById('alteracion-conciencia')?.checked || 
                    document.getElementById('diarrea-sanguinolenta')?.checked) currentAlertCount++;
                if (document.getElementById('rigidez-nuca')?.checked || document.getElementById('fotofobia')?.checked || 
                    document.getElementById('convulsiones')?.checked) currentAlertCount++;

                // Estado general
                if (document.getElementById('mal-estado-general')?.checked || document.getElementById('aspecto-toxico')?.checked) currentAlertCount++;
                if (document.getElementById('cianosis')?.checked || document.getElementById('deshidratacion')?.checked) currentWarningCount++;

                // Signos vitales
                const hemoStatusText = document.getElementById('hemodynamic-status')?.textContent;
                if (hemoStatusText === 'Inestable') currentAlertCount++;
                else if (hemoStatusText === 'Vigilancia') currentWarningCount++;

                // Glasgow
                const glasgowInterpretation = document.getElementById('glasgow-interpretation')?.textContent;
                if (glasgowInterpretation === 'Severo') currentAlertCount++;
                else if (glasgowInterpretation === 'Moderado') currentWarningCount++;

                // Signos meníngeos
                if (document.getElementById('kernig-positivo')?.checked || document.getElementById('brudzinski-positivo')?.checked || 
                    document.getElementById('rigidez-nuca-fisica')?.checked) currentAlertCount++;

                // Lesiones cutáneas de gravedad
                if (document.getElementById('petequias-fisica')?.checked || document.getElementById('purpura-fisica')?.checked) currentAlertCount++;
                if (document.getElementById('exantema-maculopapular')?.checked) currentWarningCount++;

                // Escalas de riesgo
                const qsofaScoreValue = parseInt(document.getElementById('qsofa-score')?.textContent) || 0;
                if (qsofaScoreValue >= 2) currentAlertCount++;
                else if (qsofaScoreValue === 1) currentWarningCount++;

                const sirsDiagnosisText = document.getElementById('sirs-diagnosis')?.textContent;
                if (sirsDiagnosisText?.includes('SÍ')) currentAlertCount++;

                const curb65ScoreValue = parseInt(document.getElementById('curb65-score')?.textContent) || 0;
                if (curb65ScoreValue >= 3) currentAlertCount++;
                else if (curb65ScoreValue === 2) currentWarningCount++;

                // Disfunción orgánica
                const disfuncionOrganicaElements = ['hipotension-refractaria', 'oliguria', 'lactato-elevado', 'acidosis-metabolica'];
                disfuncionOrganicaElements.forEach(id => {
                    if (document.getElementById(id)?.checked) currentAlertCount++;
                });

                // Gastroenteritis severa
                const gastroenteritisRisk = document.getElementById('gastroenteritis-severity')?.textContent;
                if (gastroenteritisRisk === 'Severa') currentAlertCount++;
                else if (gastroenteritisRisk === 'Moderada') currentWarningCount++;

                // Estado inmunológico comprometido
                if (document.getElementById('vih-positivo')?.checked || document.getElementById('inmunosupresion-farmacologica')?.checked || 
                    document.getElementById('neoplasia-activa')?.checked) currentWarningCount++;

            } else {
                const navItem = document.querySelector(`#specialty-sub-menu li:nth-child(${index + 1})`);
                if (navItem) {
                    navItem.classList.remove('completed');
                }
            }
        }
    });
    
    const totalSections = sections.length;
    const progress = Math.round((currentCompletedSections / totalSections) * 100);
    document.getElementById('exam-progress').textContent = `${progress}%`;
    document.getElementById('sections-completed').textContent = `${currentCompletedSections}/${totalSections}`;
    document.getElementById('alert-count').textContent = currentAlertCount;
    document.getElementById('warning-count').textContent = currentWarningCount;
    document.getElementById('findings-count').textContent = currentFindingsCount;
    
    const alertsItem = document.getElementById('alerts-item');
    const warningsItem = document.getElementById('warnings-item');
    const findingsItem = document.getElementById('findings-item');
    const sepsisStatusItem = document.getElementById('sepsis-status-item');

    // These items are always displayed in the new dashboard widget
    // alertsItem.style.display = 'flex'; 
    // warningsItem.style.display = 'flex';
    // findingsItem.style.display = 'flex';
    // sepsisStatusItem.style.display = 'flex';
    
    alertsItem.classList.toggle('dashboard-alert', currentAlertCount > 0);
    warningsItem.classList.toggle('dashboard-warning', currentWarningCount > 0);
    findingsItem.classList.toggle('dashboard-normal', currentFindingsCount > 0); // Changed to normal if findings > 0
    
    // Actualizar el estado de sepsis/SIRS del dashboard
    const qsofaScoreValue = parseInt(document.getElementById('qsofa-score')?.textContent) || 0;
    const sirsDiagnosisText = document.getElementById('sirs-diagnosis')?.textContent;
    
    let currentSepsisStatus = 'Normal';
    let sepsisColorClass = 'dashboard-normal';

    if (qsofaScoreValue >= 2 || (sirsDiagnosisText && sirsDiagnosisText.includes('SÍ'))) {
        currentSepsisStatus = 'Sepsis/SIRS';
        sepsisColorClass = 'dashboard-sepsis';
    } else if (qsofaScoreValue === 1) {
        currentSepsisStatus = 'Vigilancia';
        sepsisColorClass = 'dashboard-warning';
    }

    document.getElementById('sepsis-status').textContent = currentSepsisStatus;
    // Remove all specific classes first, then add the correct one
    sepsisStatusItem.classList.remove('dashboard-normal', 'dashboard-warning', 'dashboard-sepsis');
    sepsisStatusItem.classList.add(sepsisColorClass);

    // Save global values
    examProgress = progress;
    sectionsCompleted = currentCompletedSections;
    alertCount = currentAlertCount;
    warningCount = currentWarningCount;
    findingsCount = currentFindingsCount;
    specialtyStatus = currentSepsisStatus; // Renamed from sepsisStatus to specialtyStatus to avoid confusion

    // Update the conclusion text and sticky report panel
    generateConclusion();
    updateReport();
}

// 🗑️ Limpiar formulario
function clearForm() {
    if (confirm('¿Está seguro de que desea limpiar todos los datos del formulario?')) {
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            cb.disabled = false; // Ensure disabled checkboxes are re-enabled if any exist
        });
        document.querySelectorAll('input[type="radio"]').forEach(rb => rb.checked = false);
        document.querySelectorAll('input[type="number"]').forEach(nb => nb.value = '');
        document.querySelectorAll('input[type="text"]').forEach(tb => tb.value = '');
        // document.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0); // No select elements in infectious diseases
        // document.querySelectorAll('textarea').forEach(ta => ta.value = ''); // No textarea elements in infectious diseases
        
        // Reset specific values and their colors
        const elementsToReset = [
            'fever-classification', 'hemodynamic-status', 'glasgow-interpretation',
            'fever-syndrome-classification', 'qsofa-risk', 'sirs-diagnosis', 
            'curb65-risk', 'curb65-recommendation', 'psi-class', 'itu-classification',
            'gastroenteritis-severity'
        ];
        
        elementsToReset.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '--';
                element.style.color = '';
            }
        });

        // Reset scores
        const scoresToReset = [
            'qsofa-score', 'sirs-criterios', 'curb65-score', 'psi-score', 'itu-risk-count'
        ];
        
        scoresToReset.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '0';
            }
        });

        // Reset dashboard variables
        examProgress = 0;
        sectionsCompleted = 0;
        alertCount = 0;
        warningCount = 0;
        findingsCount = 0;
        specialtyStatus = 'Normal';

        document.getElementById('exam-progress').textContent = '0%';
        document.getElementById('sections-completed').textContent = '0/6';
        document.getElementById('alert-count').textContent = '0';
        document.getElementById('warning-count').textContent = '0';
        document.getElementById('findings-count').textContent = '0';
        document.getElementById('sepsis-status').textContent = 'Normal';
        
        document.getElementById('alerts-item').classList.remove('dashboard-alert');
        document.getElementById('warnings-item').classList.remove('dashboard-warning');
        document.getElementById('findings-item').classList.remove('dashboard-normal');
        document.getElementById('sepsis-status-item').classList.remove('dashboard-normal', 'dashboard-warning', 'dashboard-sepsis');
        document.getElementById('sepsis-status-item').classList.add('dashboard-item');

        updateDashboard(); // Final update to reflect cleared state
    }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }

    // Event listeners para actualizar dashboard y conclusión
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', updateDashboard);
        el.addEventListener('input', updateDashboard);
    });
     
    // Adjust section height when content changes (useful for dynamic content or initial load)
    document.querySelectorAll('.section-content-main').forEach(content => {
        const observer = new MutationObserver(() => {
            if (content.classList.contains('expanded')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
        observer.observe(content, { childList: true, subtree: true, characterData: true });
    });


    // Initial setup for sidebar on load based on screen size
    const sidebarToggleButton = document.querySelector('.sidebar button.btn-secondary');
    if (window.innerWidth <= 768) {
        sidebarToggleButton.classList.add('hidden');
        document.getElementById('sidebar').classList.add('collapsed'); // Collapse by default on mobile
    } else {
        sidebarToggleButton.classList.remove('hidden');
        document.getElementById('sidebar').classList.remove('collapsed'); // Ensure expanded on desktop
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            sidebarToggleButton.classList.add('hidden');
            document.getElementById('sidebar').classList.add('collapsed');
        } else {
            sidebarToggleButton.classList.remove('hidden');
            document.getElementById('sidebar').classList.remove('collapsed'); // Expand on desktop
        }
        updateLayout(); // Update margins on resize
    });

    // Expand the dashboard widget by default
    const dashboardSectionHeader = document.querySelector('.dashboard-widget .section-header-main');
    if (dashboardSectionHeader) {
        // Ensure it's expanded without triggering toggleSection (which has animation)
        dashboardSectionHeader.closest('.section-container').classList.add('expanded');
        dashboardSectionHeader.nextElementSibling.style.maxHeight = dashboardSectionHeader.nextElementSibling.scrollHeight + 'px';
    }

    // Expand the specialty submenu by default
    const specialtyNavLink = document.getElementById('specialty-nav-link');
    if (specialtyNavLink) {
        specialtyNavLink.classList.add('active'); // Set active state
        const specialtySubMenu = document.getElementById('specialty-sub-menu');
        if (specialtySubMenu) {
            specialtySubMenu.style.maxHeight = specialtySubMenu.scrollHeight + 'px';
        }
    }
    
    // Initialize all evaluations (to set initial score/status displays)
    evaluateFever();
    evaluateVitalSigns();
    evaluateGlasgow();
    evaluateFeverPattern();
    calculateQSOFA();
    calculateSIRS();
    calculateCURB65();
    calculatePSI();
    calculateITURisk();
    evaluateGastroenteritis();
    
    // Force a complete initial update of the dashboard and conclusion
    updateDashboard();

    // Show welcome message
    setTimeout(() => {
        console.log('🦠 Sistema de Evaluación Infectológica HealthOS cargado exitosamente!');
    }, 1000);
});