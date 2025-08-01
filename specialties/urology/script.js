// ========== VARIABLES GLOBALES ==========
let examProgress = 0;
let sectionsCompleted = 0;
let alertCount = 0;
let warningCount = 0;
let findingsCount = 0;
let urologyStatus = 'Pendiente'; // Nuevo status para el dashboard

// Ancho de la barra lateral principal
const MAIN_SIDEBAR_WIDTH = 250;
const COLLAPSED_SIDEBAR_WIDTH = 80;
// Ancho del panel de informe en tiempo real
const REPORT_PANEL_WIDTH = 400;
// Altura de la barra superior fija
const TOP_BAR_HEIGHT = 72;

// 🌙 Toggle de tema (Migrado de demo.html)
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

// 🎯 Toggle panel de navegación (Migrado de demo.html)
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

// 📊 FUNCIONES DEL PANEL STICKY (Migrado de urology_exam.html y adaptado)

// Toggle panel lateral sticky
function toggleStickyPanel() {
    const stickyPanel = document.getElementById('stickyReportPanel'); // Changed ID to match new HTML
    const btn = document.querySelector('#topBar .btn-primary'); // Select the correct button
    
    stickyPanel.classList.toggle('active');
    
    if (stickyPanel.classList.contains('active')) {
        btn.innerHTML = '<i class="fas fa-window-restore"></i> <span class="hidden md:inline">Vista Normal</span>';
        btn.classList.add('btn-secondary'); // Changed to secondary for active state
        btn.classList.remove('btn-primary');
        generateStickyConclusion();
    } else {
        btn.innerHTML = '<i class="fas fa-file-medical-alt"></i> <span class="hidden md:inline">Informe</span>';
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-secondary');
    }
    updateLayout(); // Update layout after toggle
}

// Generar conclusión para panel sticky
function generateStickyConclusion() {
    const stickyContent = document.getElementById('stickyContent');
    const updateIndicator = document.getElementById('updateIndicator');
    
    updateIndicator.classList.add('active');
    
    setTimeout(() => {
        const originalConclusionEl = document.getElementById('conclusion-text');
        const originalContent = originalConclusionEl.textContent;
        
        stickyContent.textContent = originalContent;
        
        updateIndicator.classList.remove('active');
    }, 300);
}

// Copiar contenido del panel sticky
function copyStickyToClipboard() {
    const stickyContent = document.getElementById('stickyContent').textContent;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(stickyContent).then(() => {
            showCopyNotification();
        }).catch(err => {
            console.error('Error al copiar con la API del portapapeles: ', err);
            fallbackCopyToClipboard(stickyContent);
        });
    } else {
        fallbackCopyToClipboard(stickyContent);
    }
}

// Fallback para copiar
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
        // Replaced alert with console.log as per instructions
        console.log('No se pudo copiar el texto. Por favor, cópielo manualmente.');
    }

    document.body.removeChild(textArea);
}

// Mostrar notificación de copia
function showCopyNotification() {
    const notification = document.getElementById('copyNotification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2500);
}

// Imprimir desde panel sticky
function printStickyConclusion() {
    const conclusion = document.getElementById('stickyContent').textContent;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Informe Urológico</title>
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
                    border-bottom: 2px solid #4A90E2; /* Adaptado al color principal de la app */
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
                <h1>Informe Urológico</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
                <p>Hora: ${new Date().toLocaleTimeString()}</p>
            </div>
            <pre>${conclusion}</pre>
            <div class="footer">
                <p>Generado por Sistema de Evaluación Urológica Premium</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// 🧭 Navegación a secciones (Migrado de demo.html y adaptado)
function scrollToSection(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
        });
        
        const header = section.querySelector('.section-header-main'); // Changed class
        if (header && !section.classList.contains('expanded')) { // Check section-container for expanded class
            toggleSection(header);
        }
    }
}

// ✅ Actualizar altura de sección (Migrado de demo.html)
function updateSectionHeight(contentElement) {
    if (contentElement && contentElement.classList.contains('expanded')) {
        setTimeout(() => {
            contentElement.style.maxHeight = contentElement.scrollHeight + 'px';
        }, 50);
    }
}

// 📂 Toggle de secciones mejorado con altura dinámica
function toggleSection(headerElement) {
    const sectionContainer = headerElement.closest('.section-container');
    const content = sectionContainer.querySelector('.section-content-main');
    const arrow = headerElement.querySelector('.section-arrow');
    
    if (sectionContainer.classList.contains('expanded')) {
        // Contraer
        content.style.maxHeight = '0px';
        sectionContainer.classList.remove('expanded');
        if (arrow) {
            arrow.classList.remove('fa-chevron-up');
            arrow.classList.add('fa-chevron-down');
        }
    } else {
        // Expandir
        sectionContainer.classList.add('expanded');
        content.style.maxHeight = content.scrollHeight + 'px';
        if (arrow) {
            arrow.classList.remove('fa-chevron-down');
            arrow.classList.add('fa-chevron-up');
        }
        // Permitir altura dinámica después de la transición
        setTimeout(() => {
            if (sectionContainer.classList.contains('expanded')) {
                content.style.maxHeight = 'none';
            }
        }, 300);
    }
}

// 🔄 Expandir/contraer todas las secciones con altura dinámica
function expandAllSections() {
    document.querySelectorAll('.section-container:not(.expanded)').forEach(container => {
        const content = container.querySelector('.section-content-main');
        const arrow = container.querySelector('.section-arrow');
        
        container.classList.add('expanded');
        content.style.maxHeight = content.scrollHeight + 'px';
        if (arrow) {
            arrow.classList.remove('fa-chevron-down');
            arrow.classList.add('fa-chevron-up');
        }
        
        // Permitir altura dinámica después de la transición
        setTimeout(() => {
            if (container.classList.contains('expanded')) {
                content.style.maxHeight = 'none';
            }
        }, 300);
    });
}

function collapseAllSections() {
    document.querySelectorAll('.section-container.expanded').forEach(container => {
        const content = container.querySelector('.section-content-main');
        const arrow = container.querySelector('.section-arrow');
        
        content.style.maxHeight = '0px';
        container.classList.remove('expanded');
        if (arrow) {
            arrow.classList.remove('fa-chevron-up');
            arrow.classList.add('fa-chevron-down');
        }
    });
}

// Función principal para actualizar todo el diseño (márgenes, posiciones de paneles) (Migrado de demo.html)
function updateLayout() {
    const contentArea = document.getElementById('contentArea');
    const sidebar = document.getElementById('sidebar');
    const stickyReportPanel = document.getElementById('stickyReportPanel');
    const topBar = document.getElementById('topBar');

    let currentSidebarWidth = sidebar.classList.contains('collapsed') ? COLLAPSED_SIDEBAR_WIDTH : MAIN_SIDEBAR_WIDTH;

    let contentAreaLeftOffset = 0;
    let contentAreaRightOffset = 0;

    if (window.innerWidth > 768) {
        // Desktop logic: sidebars push content
        contentAreaLeftOffset = currentSidebarWidth;
        
        // Fixed report panel pushes content if active
        if (stickyReportPanel.classList.contains('active')) {
            contentAreaRightOffset = REPORT_PANEL_WIDTH;
        }
        // Position fixed panels
        sidebar.style.left = `0px`;
        sidebar.style.transform = `translateX(0)`;
        stickyReportPanel.style.right = `0px`;
        stickyReportPanel.style.transform = stickyReportPanel.classList.contains('active') ? 'translateX(0)' : 'translateX(100%)';

    } else {
        // Mobile logic: main sidebar pushes, other panels overlay.
        contentAreaLeftOffset = sidebar.classList.contains('collapsed') ? 0 : COLLAPSED_SIDEBAR_WIDTH;
        contentAreaRightOffset = 0; // Side panels overlay on mobile, they don't push main content

        // Position fixed panels (overlay)
        sidebar.style.left = `0px`;
        sidebar.style.transform = sidebar.classList.contains('collapsed') ? 'translateX(-100%)' : 'translateX(0)';
        stickyReportPanel.style.right = `0px`;
        stickyReportPanel.style.transform = stickyReportPanel.classList.contains('active') ? 'translateX(0)' : 'translateX(100%)';
    }

    // Apply offsets to contentArea
    contentArea.style.marginLeft = `${contentAreaLeftOffset}px`;
    contentArea.style.marginRight = `${contentAreaRightOffset}px`;

    // Adjust topBar to align with contentArea
    topBar.style.left = `${contentAreaLeftOffset}px`;
    topBar.style.width = `calc(100% - ${contentAreaLeftOffset + contentAreaRightOffset}px)`;
}

// Manejo de visibilidad por género (Existente, modificado para llamar a updateDashboard y nav items)
function handleGenderSelection() {
    const isMale = document.getElementById('gender-male').checked;
    const isFemale = document.getElementById('gender-female').checked;
    
    // Mostrar/ocultar secciones específicas de género
    const maleSections = document.querySelectorAll('.male-section');
    const femaleSections = document.querySelectorAll('.female-section');
    const maleScales = document.querySelectorAll('.male-scale'); // Para escalas específicas de género
    
    maleSections.forEach(section => {
        section.style.display = isMale ? 'block' : 'none';
    });
    femaleSections.forEach(section => {
        section.style.display = isFemale ? 'block' : 'none';
    });
    maleScales.forEach(scale => {
        scale.style.display = isMale ? 'block' : 'none';
    });
    
    // Mostrar/ocultar campos específicos de género en anamnesis
    const maleOnlyFields = document.querySelectorAll('.form-item.male-only'); // Changed class
    const femaleOnlyFields = document.querySelectorAll('.form-item.female-only'); // Changed class
    
    maleOnlyFields.forEach(field => {
        field.style.display = isMale ? 'flex' : 'none'; // Usar flex para mantener el grid
        if (!isMale) field.querySelector('input').checked = false;
    });
    femaleOnlyFields.forEach(field => {
        field.style.display = isFemale ? 'flex' : 'none'; // Usar flex para mantener el grid
        if (!isFemale) field.querySelector('input').checked = false;
    });

    // Mostrar/ocultar nav items específicos de género
    const maleNavItems = document.querySelectorAll('.sub-menu-item.male-nav'); // Changed class
    const femaleNavItems = document.querySelectorAll('.sub-menu-item.female-nav'); // Changed class

    maleNavItems.forEach(item => {
        item.style.display = isMale ? 'list-item' : 'none'; // Use list-item for li elements
    });
    femaleNavItems.forEach(item => {
        item.style.display = isFemale ? 'list-item' : 'none'; // Use list-item for li elements
    });
    
    updateDashboard(); // Llamada a updateDashboard
}

// 🚫 Manejo de "Sin quejas" (Existente, modificado para llamar a updateDashboard)
function handleNoComplaints() {
    const noComplaintsCheckbox = document.getElementById('sin-quejas-uro');
    const otherCheckboxes = document.querySelectorAll('#anamnesis input[type="checkbox"]:not(#sin-quejas-uro)');
    
    otherCheckboxes.forEach(checkbox => {
        checkbox.disabled = noComplaintsCheckbox.checked;
        if (noComplaintsCheckbox.checked) checkbox.checked = false;
    });
    updateDashboard(); // Llamada a updateDashboard
}

// ⚖️ Manejo de checkboxes mutuamente excluyentes (Existente, modificado para llamar a updateDashboard)
function handleMutuallyExclusive(positiveId, negativeId, checkbox) {
    if (checkbox.checked) {
        const oppositeId = checkbox.id === positiveId ? negativeId : positiveId;
        const oppositeCheckbox = document.getElementById(oppositeId);
        if (oppositeCheckbox) oppositeCheckbox.checked = false;
    }
    updateDashboard(); // Llamada a updateDashboard
}

// Actualizar valores de intensidad de dolor (Existente, modificado para llamar a updateDashboard)
function updateDolorValue(type, value) {
    document.getElementById(`dolor-${type}-value`).textContent = value;
    updateDashboard();
}

// Evaluar síntomas urinarios (Existente, modificado para llamar a updateDashboard)
function evaluateUrinarySymptoms() {
    const frecuenciaDiurna = parseFloat(document.getElementById('frecuencia-diurna').value);
    const nicturia = parseFloat(document.getElementById('nicturia-frecuencia').value);
    
    // Evaluar normalidad basada en valores de referencia (this logic was not used in original, just a comment)
    // let interpretation = '';
    // if (frecuenciaDiurna > 8) interpretation += 'Polaquiuria ';
    // if (nicturia > 2) interpretation += 'Nicturia significativa ';
    
    updateDashboard(); // Llamada a updateDashboard
}

// Evaluar próstata (Existente, modificado para llamar a updateDashboard)
function evaluateProstate() {
    const size = document.getElementById('prostata-tamaño').value;
    const interpretEl = document.getElementById('prostata-interpretation');
    
    let color = '';
    switch(size) {
        case 'normal':
            interpretEl.textContent = 'Próstata de tamaño normal';
            color = 'var(--normal-color)';
            break;
        case 'aumentada-leve':
            interpretEl.textContent = 'Hiperplasia prostática leve';
            color = 'var(--warning-color)';
            break;
        case 'aumentada-moderada':
            interpretEl.textContent = 'Hiperplasia prostática moderada';
            color = 'var(--warning-color)';
            break;
        case 'aumentada-severa':
            interpretEl.textContent = 'Hiperplasia prostática severa';
            color = 'var(--alert-color)';
            break;
        default:
            interpretEl.textContent = '--';
            color = '';
            break;
    }
    interpretEl.style.color = color;
    updateDashboard(); // Llamada a updateDashboard
}

// Calcular IPSS (Existente, modificado para llamar a updateDashboard)
function calculateIPSS() {
    const questions = ['vaciado', 'frecuencia', 'intermitencia', 'urgencia', 'chorro', 'esfuerzo', 'nicturia'];
    let total = 0;
    let answered = 0;
    
    questions.forEach(q => {
        const value = parseFloat(document.getElementById(`ipss-${q}`).value);
        if (!isNaN(value)) {
            total += value;
            answered++;
        }
    });
    
    document.getElementById('ipss-score').textContent = answered === questions.length ? total : '--';
    
    let interpretation = '';
    let color = '';
    if (answered === questions.length) {
        if (total <= 7) {
            interpretation = 'Síntomas leves'; color = 'var(--normal-color)';
        } else if (total <= 19) {
            interpretation = 'Síntomas moderados'; color = 'var(--warning-color)';
        } else {
            interpretation = 'Síntomas severos'; color = 'var(--alert-color)';
        }
    }
    
    document.getElementById('ipss-interpretation').textContent = interpretation;
    document.getElementById('ipss-interpretation').style.color = color;
    
    // Calidad de vida
    const qol = document.getElementById('ipss-qol').value;
    if (qol !== '') {
        let qolText = '';
        let qolColor = '';
        const qolNum = parseInt(qol);
        if (qolNum <= 1) { qolText = 'Encantado/Satisfecho'; qolColor = 'var(--normal-color)'; }
        else if (qolNum <= 3) { qolText = 'Mayormente satisfecho/Mixto'; qolColor = 'var(--normal-color)'; }
        else if (qolNum <= 5) { qolText = 'Mayormente insatisfecho/Infeliz'; qolColor = 'var(--warning-color)'; }
        else { qolText = 'Terrible'; qolColor = 'var(--alert-color)'; }
        
        document.getElementById('ipss-qol-score').textContent = qolText;
        document.getElementById('ipss-qol-score').style.color = qolColor;
    } else {
         document.getElementById('ipss-qol-score').textContent = '--';
         document.getElementById('ipss-qol-score').style.color = '';
    }
    
    updateDashboard(); // Llamada a updateDashboard
}

// Calcular ICIQ (Existente, modificado para llamar a updateDashboard)
function calculateICIQ() {
    const frecuencia = parseFloat(document.getElementById('iciq-frecuencia').value) || 0;
    const cantidad = parseFloat(document.getElementById('iciq-cantidad').value) || 0;
    const interferencia = parseFloat(document.getElementById('iciq-interferencia').value) || 0;
    
    const total = frecuencia + cantidad + interferencia;
    document.getElementById('iciq-score').textContent = total;
    
    let interpretation = '';
    let color = '';
    if (total === 0) {
        interpretation = 'Sin incontinencia'; color = 'var(--normal-color)';
    } else if (total <= 5) {
        interpretation = 'Incontinencia leve'; color = 'var(--normal-color)';
    } else if (total <= 12) {
        interpretation = 'Incontinencia moderada'; color = 'var(--warning-color)';
    } else if (total <= 18) {
        interpretation = 'Incontinencia severa'; color = 'var(--alert-color)';
    } else {
        interpretation = 'Incontinencia muy severa'; color = 'var(--alert-color)';
    }
    
    document.getElementById('iciq-interpretation').textContent = interpretation;
    document.getElementById('iciq-interpretation').style.color = color;
    updateDashboard(); // Llamada a updateDashboard
}

// Calcular IIEF (Existente, modificado para llamar a updateDashboard)
function calculateIIEF() {
    const questions = ['confianza', 'firmeza', 'mantenimiento', 'dificultad', 'satisfaccion'];
    let total = 0;
    let answered = 0;
    
    questions.forEach(q => {
        const value = parseFloat(document.getElementById(`iief-${q}`).value);
        if (!isNaN(value)) {
            total += value;
            answered++;
        }
    });
    
    document.getElementById('iief-score').textContent = answered === questions.length ? total : '--';
    
    let interpretation = '';
    let color = '';
    if (answered === questions.length) {
        if (total >= 22) {
            interpretation = 'Sin disfunción eréctil'; color = 'var(--normal-color)';
        } else if (total >= 17) {
            interpretation = 'Disfunción eréctil leve'; color = 'var(--normal-color)';
        } else if (total >= 12) {
            interpretation = 'Disfunción eréctil leve-moderada'; color = 'var(--warning-color)';
        } else if (total >= 8) {
            interpretation = 'Disfunción eréctil moderada'; color = 'var(--alert-color)';
        } else {
            interpretation = 'Disfunción eréctil severa'; color = 'var(--alert-color)';
        }
    }
    
    document.getElementById('iief-interpretation').textContent = interpretation;
    document.getElementById('iief-interpretation').style.color = color;
    updateDashboard(); // Llamada a updateDashboard
}

// 📊 ACTUALIZAR DASHBOARD (Migrado y adaptado de urology_exam.html)
function updateDashboard() {
    const sections = [
        'gender-selection', 'anamnesis', 'general-exam', 'urological-scales'
    ];
    
    // Añadir secciones de género dinámicamente si están visibles
    if (document.getElementById('gender-male').checked) {
        sections.push('male-genital-exam');
    } else if (document.getElementById('gender-female').checked) {
        sections.push('female-genital-exam');
    }

    let currentCompletedSections = 0;
    let currentAlertCount = 0;
    let currentWarningCount = 0;
    let currentFindingsCount = 0;
    
    sections.forEach(sectionId => {
        const sectionElement = document.getElementById(sectionId);
        // Only process visible sections
        if (sectionElement && sectionElement.style.display !== 'none') {
            const checkboxes = sectionElement.querySelectorAll('input[type="checkbox"]:checked');
            const radios = sectionElement.querySelectorAll('input[type="radio"]:checked');
            const numbers = sectionElement.querySelectorAll('input[type="number"]');
            const selects = sectionElement.querySelectorAll('select');
            const textareas = sectionElement.querySelectorAll('textarea');
            
            let hasContent = false;
            if (checkboxes.length > 0 || radios.length > 0) hasContent = true;
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
                currentFindingsCount += (checkboxes.length + radios.length); // Hallazgos por cada checkbox/radio marcado
                
                // No badges in new structure, but nav items are updated
                const navItem = document.querySelector(`#specialty-sub-menu a[href="#section-${sectionId}"]`);
                if (navItem) {
                    navItem.parentElement.classList.add('completed');
                }
                
                // Criterios de alerta y warning específicos para Urología
                // Alert: Requiere atención urgente (hematuria, retención, masa palpable, cólico renal agudo, síntomas severos de IPSS/IIEF, cáncer)
                // Warning: Requiere atención, seguimiento (disuria, polaquiuria, nicturia, IPSS/IIEF moderado, ITU recurrente, hiperplasia prostática)
                
                // Quejas principales
                if (document.getElementById('hematuria').checked || document.getElementById('retencion-urinaria').checked || document.getElementById('colico-renal').checked || document.getElementById('secrecion-uretral').checked) currentAlertCount++;
                if (document.getElementById('disuria').checked || document.getElementById('polaquiuria').checked || document.getElementById('urgencia-miccional').checked || document.getElementById('nicturia').checked || document.getElementById('incontinencia-urinaria').checked) currentWarningCount++;
                if (document.getElementById('dolor-testicular').checked || document.getElementById('dolor-perineal').checked || document.getElementById('dolor-pelvico').checked) currentWarningCount++;
                if (document.getElementById('disfuncion-erectil').checked) currentWarningCount++;

                // Dolor (EVA)
                const dolorGeneralVal = parseFloat(document.getElementById('dolor-general-intensidad')?.value) || 0;
                if (dolorGeneralVal >= 7) currentAlertCount++;
                const dolorOrinarVal = parseFloat(document.getElementById('dolor-orinar-intensidad')?.value) || 0;
                if (dolorOrinarVal >= 7) currentAlertCount++;
                const dolorLumbarVal = parseFloat(document.getElementById('dolor-lumbar-intensidad')?.value) || 0;
                if (dolorLumbarVal >= 7) currentAlertCount++;
                if (document.querySelector('input[name="tipo-dolor-uro"]:checked')?.id === 'dolor-tipo-colico') currentAlertCount++;

                // Síntomas miccionales
                if (document.getElementById('urgencia-severa').checked || document.getElementById('incontinencia-urgencia').checked || document.getElementById('vejiga-hiperactiva').checked) currentWarningCount++;
                if (document.getElementById('chorro-debil').checked || document.getElementById('vaciado-incompleto').checked || document.getElementById('esfuerzo-para-orinar').checked) currentWarningCount++;

                // Antecedentes
                if (document.getElementById('cancer-urologico').checked) currentAlertCount++;
                if (document.getElementById('infecciones-urinarias-recurrentes').checked || document.getElementById('litiasis-renal').checked || document.getElementById('enfermedad-neurologica').checked) currentWarningCount++;

                // Examen Físico General
                if (document.getElementById('dolor-evidente').checked || document.getElementById('febril').checked || document.getElementById('agitacion').checked) currentAlertCount++;
                
                // Examen Abdominal (Renal y Suprapúbico)
                const renalPositives = ['punopercusion-der-pos', 'punopercusion-izq-pos', 'masa-renal-der-pos', 'masa-renal-izq-pos', 'dolor-palpacion-der-pos', 'dolor-palpacion-izq-pos'];
                renalPositives.forEach(id => { if (document.getElementById(id)?.checked) currentAlertCount++; });
                
                const suprapubicPositives = ['globo-vesical-pos', 'dolor-suprapubico-pos', 'masa-suprapubica-pos'];
                suprapubicPositives.forEach(id => { if (document.getElementById(id)?.checked) currentAlertCount++; });

                // Examen Genital Masculino
                if (document.getElementById('gender-male').checked) {
                    if (document.getElementById('secrecion-uretral-vis').checked || document.getElementById('priapismo').checked || document.getElementById('balanitis').checked || document.getElementById('fimosis').checked || document.getElementById('parafimosis').checked || document.getElementById('curvatura-peneana').checked || document.getElementById('lesiones-peneanas').checked) currentWarningCount++;
                    if (document.getElementById('testiculo-der-aumentado').checked || document.getElementById('testiculo-izq-aumentado').checked || document.getElementById('testiculo-der-disminuido').checked || document.getElementById('testiculo-izq-disminuido').checked || document.getElementById('testiculo-der-duro').checked || document.getElementById('testiculo-izq-duro').checked || document.getElementById('testiculo-der-doloroso').checked || document.getElementById('testiculo-izq-doloroso').checked || document.getElementById('testiculo-der-masa').checked || document.getElementById('testiculo-izq-masa').checked || document.getElementById('criptorquidia-der').checked || document.getElementById('criptorquidia-izq').checked) currentAlertCount++;
                    if (document.getElementById('epididimitis-der').checked || document.getElementById('epididimitis-izq').checked) currentWarningCount++;
                    if (document.getElementById('hidrocele').checked || document.getElementById('varicocele').checked || document.getElementById('hernia-inguinal').checked || document.getElementById('escroto-edema').checked || document.getElementById('escroto-eritema').checked) currentWarningCount++;
                    if (document.getElementById('cremasterico-der-neg').checked || document.getElementById('cremasterico-izq-neg').checked) currentAlertCount++;
                    if (document.getElementById('transiluminacion-pos').checked) currentWarningCount++;

                    // Próstata
                    const prostataInterpretText = document.getElementById('prostata-interpretation')?.textContent;
                    if (prostataInterpretText?.includes('severa')) currentAlertCount++;
                    else if (prostataInterpretText?.includes('moderada')) currentWarningCount++;
                    if (document.getElementById('prostata-dura').checked || document.getElementById('prostata-nodular').checked || document.getElementById('prostata-fija').checked) currentAlertCount++;
                    if (document.getElementById('prostata-dolorosa').checked) currentWarningCount++;
                }

                // Examen Genital Femenino
                if (document.getElementById('gender-female').checked) {
                    if (document.getElementById('vulva-eritema').checked || document.getElementById('vulva-edema').checked || document.getElementById('vulva-lesiones').checked || document.getElementById('vulva-secrecion').checked || document.getElementById('vulva-atrofia').checked) currentWarningCount++;
                    if (document.getElementById('meato-fem-eritema').checked || document.getElementById('meato-fem-secrecion').checked || document.getElementById('carúncula-uretral').checked || document.getElementById('prolapso-uretral').checked) currentWarningCount++;
                    if (document.getElementById('cistocele').checked || document.getElementById('rectocele').checked || document.getElementById('prolapso-uterino').checked || document.getElementById('enterocele').checked) currentWarningCount++;
                    if (document.getElementById('prueba-esfuerzo-pos').checked) currentWarningCount++;
                    const qtipAngleVal = parseFloat(document.getElementById('qtip-angle')?.value) || 0;
                    if (qtipAngleVal >= 30) currentWarningCount++;
                }

                // Escalas
                const ipssInterpretText = document.getElementById('ipss-interpretation')?.textContent;
                if (ipssInterpretText?.includes('severos')) currentAlertCount++;
                else if (ipssInterpretText?.includes('moderados')) currentWarningCount++;
                
                const iciqInterpretText = document.getElementById('iciq-interpretation')?.textContent;
                if (iciqInterpretText?.includes('severa')) currentAlertCount++;
                else if (iciqInterpretText?.includes('moderada')) currentWarningCount++;

                const iiefInterpretText = document.getElementById('iief-interpretation')?.textContent;
                if (iiefInterpretText?.includes('severa')) currentAlertCount++;
                else if (iiefInterpretText?.includes('moderada')) currentWarningCount++;


            } else {
                // If section has no content, ensure nav item is not marked as completed
                const navItem = document.querySelector(`#specialty-sub-menu a[href="#section-${sectionId}"]`);
                if (navItem) {
                    navItem.parentElement.classList.remove('completed');
                }
            }
        }
    });
    
    // Calculate total sections considering gender-specific ones
    let totalSectionsCount = 4; // gender, anamnesis, general, scales
    if (document.getElementById('gender-male').checked) {
        totalSectionsCount++; // Add male genital
    } else if (document.getElementById('gender-female').checked) {
        totalSectionsCount++; // Add female genital
    }

    const progress = Math.round((currentCompletedSections / totalSectionsCount) * 100);
    document.getElementById('exam-progress').textContent = `${progress}%`;
    document.getElementById('sections-completed').textContent = `${currentCompletedSections}/${totalSectionsCount}`;
    document.getElementById('alert-count').textContent = currentAlertCount;
    document.getElementById('warning-count').textContent = currentWarningCount;
    document.getElementById('findings-count').textContent = currentFindingsCount;
    
    const alertsItem = document.getElementById('alerts-item');
    const warningsItem = document.getElementById('warnings-item');
    const findingsItem = document.getElementById('findings-item');
    const urologyStatusItem = document.getElementById('urology-status-item');

    alertsItem.classList.toggle('dashboard-alert', currentAlertCount > 0);
    alertsItem.classList.toggle('dashboard-normal', currentAlertCount === 0);
    warningsItem.classList.toggle('dashboard-warning', currentWarningCount > 0);
    warningsItem.classList.toggle('dashboard-normal', currentWarningCount === 0);
    findingsItem.classList.toggle('dashboard-normal', currentFindingsCount > 0);
    findingsItem.classList.toggle('dashboard-warning', currentFindingsCount === 0); // If no findings, maybe it's a warning? Or just neutral. Keeping original logic.
    
    // Actualizar el estado de Función Urológica en el dashboard
    const ipssInterpretText = document.getElementById('ipss-interpretation')?.textContent;
    const iciqInterpretText = document.getElementById('iciq-interpretation')?.textContent;
    const prostataInterpretText = document.getElementById('prostata-interpretation')?.textContent;
    
    let currentUrologyStatus = 'Normal';
    let urologyColorClass = 'dashboard-normal';

    if (ipssInterpretText?.includes('severos') || iciqInterpretText?.includes('severa') || prostataInterpretText?.includes('severa') || currentAlertCount > 0) {
        currentUrologyStatus = 'Anormal';
        urologyColorClass = 'dashboard-alert';
    } else if (ipssInterpretText?.includes('moderados') || iciqInterpretText?.includes('moderada') || prostataInterpretText?.includes('moderada') || currentWarningCount > 0) {
        currentUrologyStatus = 'Advertencia';
        urologyColorClass = 'dashboard-warning';
    } else {
        currentUrologyStatus = 'Normal';
        urologyColorClass = 'dashboard-normal';
    }
    
    document.getElementById('urology-status').textContent = currentUrologyStatus;
    urologyStatusItem.className = `dashboard-item ${urologyColorClass}`;


    // Guardar valores globales
    examProgress = progress;
    sectionsCompleted = currentCompletedSections;
    alertCount = currentAlertCount;
    warningCount = currentWarningCount;
    findingsCount = currentFindingsCount;

    generateConclusion(); // Llama a generateConclusion al final de updateDashboard
}

function generateConclusion() {
    const conclusionEl = document.getElementById('conclusion-text');
    const realTimeEl = document.getElementById('stickyContent'); // Apunta al sticky-content
    let conclusion = 'EXAMEN UROLÓGICO:\n\n';

    // Obtener género
    const isMale = document.getElementById('gender-male')?.checked;
    const isFemale = document.getElementById('gender-female')?.checked;
    
    if (isMale || isFemale) {
        conclusion += `GÉNERO: ${isMale ? 'Masculino' : 'Femenino'}\n\n`;
    }

    // Obtener quejas principales
    const complaints = [];
    const hasAnamnesisContent = document.querySelector('#anamnesis input:checked') ||
                                 document.getElementById('dolor-general-intensidad')?.value > 0 ||
                                 document.getElementById('dolor-orinar-intensidad')?.value > 0 ||
                                 document.getElementById('dolor-lumbar-intensidad')?.value > 0 ||
                                 document.getElementById('frecuencia-diurna')?.value > 0 ||
                                 document.getElementById('nicturia-frecuencia')?.value > 0;

    if (document.getElementById('sin-quejas-uro')?.checked) {
        conclusion += 'MOTIVO DE CONSULTA: Paciente asintomático, consulta de rutina urológica.\n\n';
    } else if (hasAnamnesisContent) {
        document.querySelectorAll('#anamnesis input[type="checkbox"]:checked:not(#sin-quejas-uro)').forEach(cb => {
            const label = document.querySelector(`label[for="${cb.id}"]`);
            if (label && cb.closest('.form-item')?.style.display !== 'none') { // Only if the field is visible
                complaints.push(label.textContent.toLowerCase());
            }
        });
        if (complaints.length > 0) {
            conclusion += `MOTIVO DE CONSULTA: Paciente consulta por ${complaints.join(', ')}. `;
        }

        // Características del dolor
        const dolorGeneral = document.getElementById('dolor-general-intensidad')?.value;
        const dolorOrinar = document.getElementById('dolor-orinar-intensidad')?.value;
        const dolorLumbar = document.getElementById('dolor-lumbar-intensidad')?.value;
        const tipoDolorRadio = document.querySelector('input[name="tipo-dolor-uro"]:checked');
        const localizacionDolor = [];
        ['dolor-flanco-derecho', 'dolor-flanco-izquierdo', 'dolor-region-suprapubica', 
         'dolor-region-perineal', 'dolor-irradiado-ingle', 'dolor-irradiado-genitales'].forEach(id => {
            if (document.getElementById(id)?.checked) localizacionDolor.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        });

        if (dolorGeneral > 0 || dolorOrinar > 0 || dolorLumbar > 0 || tipoDolorRadio || localizacionDolor.length > 0) {
            conclusion += 'Dolor: ';
            if (dolorGeneral > 0) conclusion += `General ${dolorGeneral}/10. `;
            if (dolorOrinar > 0) conclusion += `Al orinar ${dolorOrinar}/10. `;
            if (dolorLumbar > 0) conclusion += `Lumbar ${dolorLumbar}/10. `;
            if (tipoDolorRadio) conclusion += `Tipo: ${document.querySelector(`label[for="${tipoDolorRadio.id}"]`).textContent.toLowerCase()}. `;
            if (localizacionDolor.length > 0) conclusion += `Localización: ${localizacionDolor.join(', ')}. `;
        }

        // Síntomas miccionales
        const frecuenciaDiurna = document.getElementById('frecuencia-diurna')?.value;
        const nicturiaFrec = document.getElementById('nicturia-frecuencia')?.value;
        const sintomasLlenado = [];
        ['urgencia-severa', 'incontinencia-urgencia', 'vejiga-hiperactiva'].forEach(id => {
            if (document.getElementById(id)?.checked) sintomasLlenado.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        });
        const sintomasVaciado = [];
        ['chorro-debil', 'chorro-intermitente', 'goteo-postmiccional', 'vaciado-incompleto', 'esfuerzo-para-orinar', 'retraso-inicio-miccion'].forEach(id => {
            if (document.getElementById(id)?.checked) sintomasVaciado.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        });
        const sintomasPostmiccionales = [];
        ['goteo-terminal', 'sensacion-vaciado-incompleto'].forEach(id => {
            if (document.getElementById(id)?.checked) sintomasPostmiccionales.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        });

        if (frecuenciaDiurna || nicturiaFrec || sintomasLlenado.length > 0 || sintomasVaciado.length > 0 || sintomasPostmiccionales.length > 0) {
            conclusion += 'Síntomas miccionales: ';
            if (frecuenciaDiurna) conclusion += `Frecuencia diurna ${frecuenciaDiurna} veces/día. `;
            if (nicturiaFrec) conclusion += `Nicturia ${nicturiaFrec} veces/noche. `;
            if (sintomasLlenado.length > 0) conclusion += `Llenado: ${sintomasLlenado.join(', ')}. `;
            if (sintomasVaciado.length > 0) conclusion += `Vaciado: ${sintomasVaciado.join(', ')}. `;
            if (sintomasPostmiccionales.length > 0) conclusion += `Post-miccionales: ${sintomasPostmiccionales.join(', ')}. `;
        }
        conclusion += '\n\n';
    }

    // Antecedentes Relevantes
    const historiaMedica = [];
    ['infecciones-urinarias-recurrentes', 'litiasis-renal', 'diabetes-mellitus', 
     'hipertension-arterial', 'enfermedad-neurologica', 'cirugia-urologica-previa', 
     'trauma-pelvico', 'cancer-urologico'].forEach(id => {
        if (document.getElementById(id)?.checked) historiaMedica.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
    });
    const medicamentosUrologicos = [];
    ['alfabloqueadores', 'anticolinergicos', 'diureticos', 'inhibidores-5alfa-reductasa', 
     'antidepresivos', 'antihistaminicos'].forEach(id => {
        if (document.getElementById(id)?.checked) medicamentosUrologicos.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
    });

    const hasRelevantHistory = historiaMedica.length > 0 || medicamentosUrologicos.length > 0;
    if (hasRelevantHistory) {
        conclusion += 'ANTECEDENTES RELEVANTES:\n';
        if (historiaMedica.length > 0) conclusion += `• Historia médica: ${historiaMedica.join(', ')}. `;
        if (medicamentosUrologicos.length > 0) conclusion += `• Medicamentos de interés urológico: ${medicamentosUrologicos.join(', ')}. `;
        conclusion += '\n\n';
    }

    // Examen Físico General
    const generalExamFindings = [];
    document.querySelectorAll('#general-exam .sub-section-card:first-of-type input[type="checkbox"]:checked').forEach(cb => { // Changed class
        if (!cb.id.includes('-normal')) generalExamFindings.push(document.querySelector(`label[for="${cb.id}"]`).textContent.toLowerCase());
    });
    
    const hasGeneralExamContent = generalExamFindings.length > 0 || document.getElementById('aspecto-general-normal')?.checked;
    if (hasGeneralExamContent) {
        conclusion += 'EXAMEN FÍSICO GENERAL:\n';
        if (generalExamFindings.length > 0) {
            conclusion += `• Inspección general: ${generalExamFindings.join(', ')}. `;
        } else if (document.getElementById('aspecto-general-normal')?.checked) {
            conclusion += '• Inspección general: Aspecto normal. ';
        }
    }

    // Examen Abdominal (Renal y Suprapúbico)
    const renalFindingsDer = [];
    ['punopercusion-der-pos', 'masa-renal-der-pos', 'dolor-palpacion-der-pos'].forEach(id => {
        if (document.getElementById(id)?.checked) renalFindingsDer.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
    });
    const renalFindingsIzq = [];
    ['punopercusion-izq-pos', 'masa-renal-izq-pos', 'dolor-palpacion-izq-pos'].forEach(id => {
        if (document.getElementById(id)?.checked) renalFindingsIzq.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
    });
    const suprapubicFindings = [];
    ['globo-vesical-pos', 'dolor-suprapubico-pos', 'masa-suprapubica-pos'].forEach(id => {
        if (document.getElementById(id)?.checked) suprapubicFindings.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
    });

    const hasAbdominalExamContent = renalFindingsDer.length > 0 || renalFindingsIzq.length > 0 || suprapubicFindings.length > 0 ||
                                     document.getElementById('punopercusion-der-neg')?.checked || document.getElementById('punopercusion-izq-neg')?.checked ||
                                     document.getElementById('globo-vesical-neg')?.checked;
    if (hasAbdominalExamContent) {
        if (!conclusion.includes('EXAMEN FÍSICO GENERAL:')) conclusion += 'EXAMEN FÍSICO GENERAL:\n'; // Ensure header exists
        conclusion += '• Examen abdominal: ';
        if (renalFindingsDer.length > 0) conclusion += `Flanco derecho: ${renalFindingsDer.join(', ')}. `;
        else if (document.getElementById('punopercusion-der-neg')?.checked && document.getElementById('masa-renal-der-neg')?.checked && document.getElementById('dolor-palpacion-der-neg')?.checked) conclusion += 'Flanco derecho: Sin hallazgos. ';
        
        if (renalFindingsIzq.length > 0) conclusion += `Flanco izquierdo: ${renalFindingsIzq.join(', ')}. `;
        else if (document.getElementById('punopercusion-izq-neg')?.checked && document.getElementById('masa-renal-izq-neg')?.checked && document.getElementById('dolor-palpacion-izq-neg')?.checked) conclusion += 'Flanco izquierdo: Sin hallazgos. ';
        
        if (suprapubicFindings.length > 0) conclusion += `Región suprapúbica: ${suprapubicFindings.join(', ')}. `;
        else if (document.getElementById('globo-vesical-neg')?.checked && document.getElementById('dolor-suprapubico-neg')?.checked && document.getElementById('masa-suprapubica-neg')?.checked) conclusion += 'Región suprapúbica: Sin hallazgos. ';
        conclusion += '\n\n';
    } else if (hasGeneralExamContent) {
         conclusion += '\n'; // If only general findings, add a line break
    }


    // Examen Genital Masculino
    if (isMale && document.getElementById('section-male-genital-exam')?.style.display !== 'none') {
        const peneHallazgos = [];
        document.querySelectorAll('#male-genital-exam .sub-section-card:first-of-type .genital-exam:first-of-type input[type="checkbox"]:checked').forEach(cb => { // Changed class
            if (!cb.id.includes('-normal')) peneHallazgos.push(document.querySelector(`label[for="${cb.id}"]`).textContent.toLowerCase());
        });
        const meatoHallazgos = [];
        document.querySelectorAll('#male-genital-exam .sub-section-card:first-of-type .genital-exam:last-of-type input[type="checkbox"]:checked').forEach(cb => { // Changed class
            if (!cb.id.includes('-normal')) meatoHallazgos.push(document.querySelector(`label[for="${cb.id}"]`).textContent.toLowerCase());
        });

        const testiculoDerTam = document.getElementById('testiculo-der-tamaño')?.value;
        const testiculoIzqTam = document.getElementById('testiculo-izq-tamaño')?.value;
        const testiculoDerHallazgos = [];
        document.querySelectorAll('#male-genital-exam .sub-section-card:nth-of-type(2) .side-container:first-of-type .genital-exam:first-of-type input[type="checkbox"]:checked').forEach(cb => { // Changed class
            if (!cb.id.includes('-normal')) testiculoDerHallazgos.push(document.querySelector(`label[for="${cb.id}"]`).textContent.toLowerCase());
        });
        const epididimoDerHallazgos = [];
        document.querySelectorAll('#male-genital-exam .sub-section-card:nth-of-type(2) .side-container:first-of-type .genital-exam:last-of-type input[type="checkbox"]:checked').forEach(cb => { // Changed class
            if (!cb.id.includes('-normal')) epididimoDerHallazgos.push(document.querySelector(`label[for="${cb.id}"]`).textContent.toLowerCase());
        });
        const testiculoIzqHallazgos = [];
        document.querySelectorAll('#male-genital-exam .sub-section-card:nth-of-type(2) .side-container:last-of-type .genital-exam:first-of-type input[type="checkbox"]:checked').forEach(cb => { // Changed class
            if (!cb.id.includes('-normal')) testiculoIzqHallazgos.push(document.querySelector(`label[for="${cb.id}"]`).textContent.toLowerCase());
        });
        const epididimoIzqHallazgos = [];
        document.querySelectorAll('#male-genital-exam .sub-section-card:nth-of-type(2) .side-container:last-of-type .genital-exam:last-of-type input[type="checkbox"]:checked').forEach(cb => { // Changed class
            if (!cb.id.includes('-normal')) epididimoIzqHallazgos.push(document.querySelector(`label[for="${cb.id}"]`).textContent.toLowerCase());
        });

        const escrotoHallazgos = [];
        document.querySelectorAll('#male-genital-exam .sub-section-card:nth-of-type(3) .genital-exam:first-of-type input[type="checkbox"]:checked').forEach(cb => { // Changed class
            if (!cb.id.includes('-normal')) escrotoHallazgos.push(document.querySelector(`label[for="${cb.id}"]`).textContent.toLowerCase());
        });
        const cremastericoDerPresente = document.getElementById('cremasterico-der-pos')?.checked;
        const cremastericoIzqPresente = document.getElementById('cremasterico-izq-pos')?.checked;
        const transiluminacionPos = document.getElementById('transiluminacion-pos')?.checked;

        const prostataTamano = document.getElementById('prostata-tamaño')?.value;
        const prostataInterpret = document.getElementById('prostata-interpretation')?.textContent;
        const prostataCaracteristicas = [];
        document.querySelectorAll('#male-genital-exam .sub-section-card:last-of-type .prostate-exam input[type="checkbox"]:checked').forEach(cb => { // Changed class
            if (!cb.id.includes('-normal') && !cb.id.includes('-lisa')) prostataCaracteristicas.push(document.querySelector(`label[for="${cb.id}"]`).textContent.toLowerCase());
        });

        const hasMaleGenitalExamContent = peneHallazgos.length > 0 || meatoHallazgos.length > 0 || testiculoDerTam || testiculoIzqTam ||
                                          testiculoDerHallazgos.length > 0 || epididimoDerHallazgos.length > 0 ||
                                          testiculoIzqHallazgos.length > 0 || epididimoIzqHallazgos.length > 0 ||
                                          escrotoHallazgos.length > 0 || cremastericoDerPresente || cremastericoIzqPresente || transiluminacionPos ||
                                          prostataTamano || prostataCaracteristicas.length > 0;

        if (hasMaleGenitalExamContent) {
            conclusion += 'EXAMEN GENITAL MASCULINO:\n';
            if (peneHallazgos.length > 0) conclusion += `• Pene: ${peneHallazgos.join(', ')}. `;
            else if (document.getElementById('pene-normal')?.checked) conclusion += '• Pene: Aspecto normal. ';
            if (meatoHallazgos.length > 0) conclusion += `Meato uretral: ${meatoHallazgos.join(', ')}. `;
            else if (document.getElementById('meato-normal')?.checked) conclusion += 'Meato uretral: Normal. ';

            conclusion += '• Testículos: ';
            if (testiculoDerTam) conclusion += `Derecho ${testiculoDerTam} cm`;
            if (testiculoDerHallazgos.length > 0) conclusion += ` (${testiculoDerHallazgos.join(', ')})`;
            if (epididimoDerHallazgos.length > 0) conclusion += `, Epidídimo derecho: ${epididimoDerHallazgos.join(', ')}`;
            
            if (testiculoIzqTam) conclusion += `. Izquierdo ${testiculoIzqTam} cm`;
            if (testiculoIzqHallazgos.length > 0) conclusion += ` (${testiculoIzqHallazgos.join(', ')})`;
            if (epididimoIzqHallazgos.length > 0) conclusion += `, Epidídimo izquierdo: ${epididimoIzqHallazgos.join(', ')}`;
            conclusion += '. ';

            if (escrotoHallazgos.length > 0) conclusion += `• Escroto y cordón espermático: ${escrotoHallazgos.join(', ')}. `;
            else if (document.getElementById('escroto-normal')?.checked) conclusion += '• Escroto y cordón espermático: Normal. ';
            
            if (document.getElementById('cremasterico-der-neg')?.checked) conclusion += `Reflejo cremastérico derecho ausente. `;
            if (document.getElementById('cremasterico-izq-neg')?.checked) conclusion += `Reflejo cremastérico izquierdo ausente. `;
            if (transiluminacionPos) conclusion += `Transiluminación positiva. `;

            if (prostataTamano) {
                conclusion += `• Próstata: Tamaño ${prostataTamano} (${prostataInterpret}). `;
                if (prostataCaracteristicas.length > 0) conclusion += `Características: ${prostataCaracteristicas.join(', ')}. `;
            }
            conclusion += '\n\n';
        }
    }

    // Examen Genital Femenino
    if (isFemale && document.getElementById('section-female-genital-exam')?.style.display !== 'none') {
        const vulvaHallazgos = [];
        document.querySelectorAll('#female-genital-exam .sub-section-card:first-of-type .genital-exam:first-of-type input[type="checkbox"]:checked').forEach(cb => { // Changed class
            if (!cb.id.includes('-normal')) vulvaHallazgos.push(document.querySelector(`label[for="${cb.id}"]`).textContent.toLowerCase());
        });
        const meatoFemHallazgos = [];
        document.querySelectorAll('#female-genital-exam .sub-section-card:first-of-type .genital-exam:last-of-type input[type="checkbox"]:checked').forEach(cb => { // Changed class
            if (!cb.id.includes('-normal')) meatoFemHallazgos.push(document.querySelector(`label[for="${cb.id}"]`).textContent.toLowerCase());
        });
        const prolapsoHallazgos = [];
        ['cistocele', 'rectocele', 'prolapso-uterino', 'enterocele'].forEach(id => {
            if (document.getElementById(id)?.checked) prolapsoHallazgos.push(document.querySelector(`label[for="${id}"]`).textContent.toLowerCase());
        });
        const pruebaEsfuerzoPos = document.getElementById('prueba-esfuerzo-pos')?.checked;
        const qtipAngle = document.getElementById('qtip-angle')?.value;

        const hasFemaleGenitalExamContent = vulvaHallazgos.length > 0 || meatoFemHallazgos.length > 0 || prolapsoHallazgos.length > 0 || pruebaEsfuerzoPos || qtipAngle;
        if (hasFemaleGenitalExamContent) {
            conclusion += 'EXAMEN GENITAL FEMENINO:\n';
            if (vulvaHallazgos.length > 0) conclusion += `• Vulva: ${vulvaHallazgos.join(', ')}. `;
            else if (document.getElementById('vulva-normal')?.checked) conclusion += '• Vulva: Aspecto normal. ';
            if (meatoFemHallazgos.length > 0) conclusion += `Meato uretral: ${meatoFemHallazgos.join(', ')}. `;
            else if (document.getElementById('meato-fem-normal')?.checked) conclusion += 'Meato uretral: Normal. ';

            if (prolapsoHallazgos.length > 0) conclusion += `• Prolapso de órganos pélvicos: ${prolapsoHallazgos.join(', ')}. `;
            else if (document.getElementById('prolapso-ausente')?.checked) conclusion += '• Prolapso de órganos pélvicos: Ausente. ';
            
            if (pruebaEsfuerzoPos) conclusion += `Prueba de esfuerzo (tos) positiva. `;
            if (qtipAngle) {
                const qtipStatus = parseFloat(qtipAngle) > 30 ? ' (aumentada)' : ' (normal)';
                conclusion += `Q-tip test: ${qtipAngle}°${qtipStatus}. `;
            }
            conclusion += '\n\n';
        }
    }

    // Escalas de Evaluación Urológica
    const ipssScore = document.getElementById('ipss-score')?.textContent;
    const ipssInterpret = document.getElementById('ipss-interpretation')?.textContent;
    const ipssQolScore = document.getElementById('ipss-qol-score')?.textContent;
    const iciqScore = document.getElementById('iciq-score')?.textContent;
    const iciqInterpret = document.getElementById('iciq-interpretation')?.textContent;
    const iiefScore = document.getElementById('iief-score')?.textContent;
    const iiefInterpret = document.getElementById('iief-interpretation')?.textContent;
    
    const hasScalesContent = (ipssScore && ipssScore !== '0' && ipssScore !== '--') || 
                             (iciqScore && iciqScore !== '0' && iciqScore !== '--') || 
                             (iiefScore && iiefScore !== '0' && iiefScore !== '--');

    if (hasScalesContent) {
        conclusion += 'ESCALAS DE EVALUACIÓN UROLÓGICA:\n';
        if (isMale && (ipssScore && ipssScore !== '0' && ipssScore !== '--')) {
            conclusion += `• IPSS (Síntomas Prostáticos): ${ipssScore}/35 - ${ipssInterpret}. `;
            if (ipssQolScore && ipssQolScore !== '--') conclusion += `Calidad de vida: ${ipssQolScore}. `;
        }
        if (iciqScore && iciqScore !== '0' && iciqScore !== '--') {
            conclusion += `• ICIQ-SF (Incontinencia Urinaria): ${iciqScore}/21 - ${iciqInterpret}. `;
        }
        if (isMale && (iiefScore && iiefScore !== '0' && iiefScore !== '--')) {
            conclusion += `• IIEF-5 (Disfunción Eréctil): ${iiefScore}/25 - ${iiefInterpret}. `;
        }
        conclusion += '\n\n';
    }

    // === CONCLUSIÓN FINAL ===
    if (conclusion.trim() === 'EXAMEN UROLÓGICO:') { // If only title remains
        conclusion = 'Seleccione los parámetros del examen para generar la conclusión urológica...';
    } else {
        // Resumen de hallazgos del dashboard (Migrated from urology_exam.html and adapted)
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
        conclusion += '[Pendiente de evaluación clínica completa y estudios complementarios]\n\n';
        conclusion += '📋 PLAN DE MANEJO:\n';
        conclusion += '[A determinar según hallazgos clínicos, estudios de imagen y laboratorio]\n\n';
        conclusion += `📊 COMPLETITUD DEL EXAMEN: ${examProgress}%`;
    }

    conclusionEl.textContent = conclusion;
    realTimeEl.textContent = conclusion; // Update sticky panel as well
}

function printConclusion() {
    const conclusion = document.getElementById('conclusion-text').textContent;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Conclusión Examen Urológico</title>
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
                    border-bottom: 2px solid #4A90E2; /* Adaptado al color principal de la app */
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
                <h1>Examen Urológico - Conclusión</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
            </div>
            <pre>${conclusion}</pre>
            <div class="footer">
                <p>Generado por Sistema de Evaluación Urológica</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function clearForm() {
    // Replaced confirm with console.log as per instructions
    console.log('Limpiando todos los datos del formulario.');
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.disabled = false; // Enable checkboxes of "sin quejas"
    });
    document.querySelectorAll('input[type="radio"]').forEach(rb => rb.checked = false);
    document.querySelectorAll('input[type="number"]').forEach(nb => nb.value = '');
    document.querySelectorAll('input[type="text"]').forEach(tb => tb.value = '');
    document.querySelectorAll('input[type="range"]').forEach(rb => rb.value = 0);
    document.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
    document.querySelectorAll('textarea').forEach(ta => ta.value = '');
    
    // Reset specific values and their colors
    document.getElementById('dolor-general-value').textContent = '0';
    document.getElementById('dolor-orinar-value').textContent = '0';
    document.getElementById('dolor-lumbar-value').textContent = '0';
    document.getElementById('prostata-interpretation').textContent = '--';
    document.getElementById('prostata-interpretation').style.color = '';
    document.getElementById('ipss-score').textContent = '0';
    document.getElementById('ipss-interpretation').textContent = '--';
    document.getElementById('ipss-interpretation').style.color = '';
    document.getElementById('ipss-qol-score').textContent = '--';
    document.getElementById('ipss-qol-score').style.color = '';
    document.getElementById('iciq-score').textContent = '0';
    document.getElementById('iciq-interpretation').textContent = '--';
    document.getElementById('iciq-interpretation').style.color = '';
    document.getElementById('iief-score').textContent = '0';
    document.getElementById('iief-interpretation').textContent = '--';
    document.getElementById('iief-interpretation').style.color = '';
    
    // Hide gender-specific sections and nav items
    document.querySelectorAll('.male-section, .female-section').forEach(section => {
        section.style.display = 'none';
    });
    document.querySelectorAll('.male-scale').forEach(scale => { // Hide male scales
        scale.style.display = 'none';
    });
    
    document.querySelectorAll('.male-only, .female-only').forEach(field => {
        field.style.display = 'none';
    });

    document.querySelectorAll('.sub-menu-item.male-nav, .sub-menu-item.female-nav').forEach(navItem => { // Changed class
        navItem.style.display = 'none';
    });
    
    // Enable checkboxes that might be disabled
    document.querySelectorAll('#anamnesis input[type="checkbox"]:not(#sin-quejas-uro)').forEach(cb => cb.disabled = false);
    
    // Reset dashboard variables and display
    examProgress = 0;
    sectionsCompleted = 0;
    alertCount = 0;
    warningCount = 0;
    findingsCount = 0;
    urologyStatus = 'Pendiente';

    document.getElementById('exam-progress').textContent = '0%';
    document.getElementById('sections-completed').textContent = '0/4'; // Base sections: Gender, Anamnesis, General, Scales
    document.getElementById('alert-count').textContent = '0';
    document.getElementById('warning-count').textContent = '0';
    document.getElementById('findings-count').textContent = '0';
    document.getElementById('urology-status').textContent = 'Pendiente';
    
    document.getElementById('alerts-item').classList.remove('dashboard-alert');
    document.getElementById('warnings-item').classList.remove('dashboard-warning');
    document.getElementById('findings-item').classList.remove('dashboard-normal');
    document.getElementById('urology-status-item').classList.remove('dashboard-normal', 'dashboard-warning', 'dashboard-alert'); // Clear classes
    document.getElementById('urology-status-item').classList.add('dashboard-item');


    // Re-evaluate all scales to clear visual and model state
    evaluateUrinarySymptoms();
    evaluateProstate();
    calculateIPSS();
    calculateICIQ();
    calculateIIEF();
    
    updateDashboard(); // Force dashboard and conclusion update
}

document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }

    // Configure sidebar on window resize
    const sidebarToggleButton = document.querySelector('.sidebar button.btn-secondary');
    if (window.innerWidth <= 768) {
        sidebarToggleButton.classList.add('hidden');
        document.getElementById('sidebar').classList.add('collapsed'); // Collapse by default on mobile
    } else {
        sidebarToggleButton.classList.remove('hidden');
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

    // Event listeners for general inputs
    document.querySelectorAll('input, select, textarea').forEach(el => {
        // Some elements already have specific onchange/oninput listeners that call their calculation functions.
        // Those calculation functions should call updateDashboard() at the end.
        // For elements without a specific listener, this general listener will catch them.
        el.addEventListener('change', updateDashboard);
        el.addEventListener('input', updateDashboard);
    });
     
    document.querySelector('.main-content').addEventListener('change', (event) => { // Changed class
        const sectionContent = event.target.closest('.section-content-main.expanded'); // Changed class
        if (sectionContent) {
            updateSectionHeight(sectionContent);
        }
    });
     
    // Expand the first section by default (Gender)
    toggleSection(document.querySelector('#section-gender-selection .section-header-main')); // Changed class
    
    // Initialize evaluations
    // These functions are called here so that initial values are set correctly
    // and in turn call updateDashboard() for the first complete rendering.
    evaluateUrinarySymptoms();
    evaluateProstate();
    calculateIPSS();
    calculateICIQ();
    calculateIIEF();
    
    // Force a complete initial update of the dashboard and conclusion
    updateDashboard();

    // Initial layout update
    updateLayout();

    // Show welcome message
    setTimeout(() => {
        console.log('🎉 Sistema de Evaluación Urológica Premium con Panel Sticky cargado exitosamente!');
    }, 1000);
});
