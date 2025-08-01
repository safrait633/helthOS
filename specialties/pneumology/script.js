// Variables globales para el dashboard
let examProgress = 0;
let sectionsCompleted = 0;
let alertCount = 0;
let warningCount = 0;
let findingsCount = 0;
let completenessStatus = '0%';

// Ancho de la barra lateral principal
const MAIN_SIDEBAR_WIDTH = 250;
const COLLAPSED_SIDEBAR_WIDTH = 80;
const REPORT_PANEL_WIDTH = 400;
const TOP_BAR_HEIGHT = 72;

// 🌙 Toggle de tema
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

// 🎯 Toggle barra lateral principal
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

// 📂 Toggle de secciones con altura dinámica
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

// 📊 Toggle panel sticky
function toggleStickyPanel() {
    const panel = document.getElementById('stickyReportPanel');
    const body = document.body;
    
    panel.classList.toggle('active');
    body.classList.toggle('split-view-active');
    
    if (panel.classList.contains('active')) {
        generateStickyConclusion();
    }
    updateLayout();
}

// 🧭 Navegación a secciones
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
        });
        
        // Expandir la sección si está colapsada
        const sectionContainer = section.closest('.section-container');
        if (sectionContainer && !sectionContainer.classList.contains('expanded')) {
            toggleSection(sectionContainer.querySelector('.section-header-main'));
        }
    }
}

// 🔄 Expandir/contraer todas las secciones
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

// 🚫 Manejo de "Sin quejas"
function handleNoComplaints() {
    const noComplaintsCheckbox = document.getElementById('sin-quejas-neumo');
    const otherCheckboxes = document.querySelectorAll('#anamnesis input[type="checkbox"]:not(#sin-quejas-neumo)');
    
    if (noComplaintsCheckbox.checked) {
        otherCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.disabled = true;
        });
    } else {
        otherCheckboxes.forEach(checkbox => {
            checkbox.disabled = false;
        });
    }
    
    updateDashboard();
    generateConclusion();
}

// ⚖️ Manejo de checkboxes mutuamente excluyentes
function handleMutuallyExclusive(positiveId, negativeId, checkbox) {
    if (checkbox.checked) {
        const oppositeId = checkbox.id === positiveId ? negativeId : positiveId;
        const oppositeCheckbox = document.getElementById(oppositeId);
        if (oppositeCheckbox) oppositeCheckbox.checked = false;
    }
    updateDashboard();
    generateConclusion();
}

// 🚬 Calcular paquetes/año
function calculatePackYears() {
    const cigarrillosDia = parseFloat(document.getElementById('cigarrillos-dia').value) || 0;
    const anosFumando = parseFloat(document.getElementById('anos-fumando').value) || 0;
    
    const paquetesAno = (cigarrillosDia * anosFumando) / 20;
    document.getElementById('paquetes-calculados').textContent = paquetesAno.toFixed(1);
    
    // Actualizar el campo manual si existe
    if (document.getElementById('paquetes-ano').value === '') {
        document.getElementById('paquetes-ano').value = paquetesAno.toFixed(1);
    }
    
    updateDashboard();
    generateConclusion();
}

// 🫁 Evaluar frecuencia respiratoria
function evaluateRespiratoryRate() {
    const fr = parseFloat(document.getElementById('frecuencia-respiratoria').value);
    const interpretEl = document.getElementById('interpretacion-fr');
    
    if (isNaN(fr) || !fr) { // Check for NaN or empty value
        interpretEl.textContent = '--';
        interpretEl.style.color = ''; // Reset color
        return;
    }
    
    if (fr < 12) {
        interpretEl.textContent = 'Bradipnea';
        interpretEl.style.color = '#f39c12';
    } else if (fr > 20) {
        interpretEl.textContent = 'Taquipnea';
        interpretEl.style.color = '#e74c3c';
    } else {
        interpretEl.textContent = 'Normal';
        interpretEl.style.color = '#1abc9c';
    }
    updateDashboard();
    generateConclusion();
}

// 💨 Evaluar saturación
function evaluateSaturation() {
    const sat = parseFloat(document.getElementById('saturacion-o2').value);
    const interpretEl = document.getElementById('interpretacion-sat');
    
    if (isNaN(sat) || !sat) { // Check for NaN or empty value
        interpretEl.textContent = '--';
        interpretEl.style.color = ''; // Reset color
        return;
    }
    
    if (sat < 88) {
        interpretEl.textContent = 'Hipoxemia severa';
        interpretEl.style.color = '#e74c3c';
    } else if (sat < 92) {
        interpretEl.textContent = 'Hipoxemia moderada';
        interpretEl.style.color = '#e74c3c';
    } else if (sat < 95) {
        interpretEl.textContent = 'Hipoxemia leve';
        interpretEl.style.color = '#f39c12';
    } else {
        interpretEl.textContent = 'Normal';
        interpretEl.style.color = '#1abc9c';
    }
    updateDashboard();
    generateConclusion();
}

// 📊 Actualizar valor CAT
function updateCATValue(category, value) {
    document.getElementById(`cat-${category}-value`).textContent = value;
    calculateCAT();
}

// 🧮 Calcular CAT
function calculateCAT() {
    const categories = ['tos', 'flemas', 'opresion', 'disnea'];
    let total = 0;
    
    categories.forEach(category => {
        const element = document.getElementById(`cat-${category}`);
        if (element) {
            const value = parseFloat(element.value) || 0;
            total += value;
        }
    });
    
    document.getElementById('cat-total').textContent = total;
    
    let interpretation = '';
    if (total < 10) {
        interpretation = 'Impacto bajo';
    } else if (total < 20) {
        interpretation = 'Impacto medio';
    } else if (total < 30) {
        interpretation = 'Impacto alto';
    } else {
        interpretation = 'Impacto muy alto';
    }
    
    document.getElementById('cat-interpretation').textContent = interpretation;
    updateDashboard();
    generateConclusion();
}

// 📈 Calcular BODE
function calculateBODE() {
    let total = 0;
    
    // IMC
    const imc = parseFloat(document.getElementById('bode-imc').value);
    if (!isNaN(imc)) {
        if (imc <= 21) total += 1;
    }
    
    // FEV1
    const fev1 = parseFloat(document.getElementById('bode-fev1').value);
    if (!isNaN(fev1)) {
        if (fev1 >= 65) total += 0;
        else if (fev1 >= 50) total += 1;
        else if (fev1 >= 36) total += 2;
        else total += 3;
    }
    
    // Disnea mMRC
    const disnea = document.querySelector('input[name="bode-disnea"]:checked');
    if (disnea) total += parseInt(disnea.value);
    
    // Ejercicio
    const ejercicio = parseFloat(document.getElementById('bode-ejercicio').value);
    if (!isNaN(ejercicio)) {
        if (ejercicio >= 350) total += 0;
        else if (ejercicio >= 250) total += 1;
        else if (ejercicio >= 150) total += 2;
        else total += 3;
    }
    
    document.getElementById('bode-total').textContent = total;
    
    let prognosis = '';
    if (total <= 2) {
        prognosis = '80% supervivencia';
    } else if (total <= 4) {
        prognosis = '67% supervivencia';
    } else if (total <= 6) {
        prognosis = '57% supervivencia';
    } else {
        prognosis = '18% supervivencia';
    }
    
    document.getElementById('bode-prognosis').textContent = prognosis;
    updateDashboard();
    generateConclusion();
}

// 🌀 Calcular espirometría
function calculateSpirometry() {
    const fvcPre = parseFloat(document.getElementById('fvc-pre').value);
    const fev1Pre = parseFloat(document.getElementById('fev1-pre').value);
    const fev1FvcPre = parseFloat(document.getElementById('fev1-fvc-pre').value);
    const fvcPost = parseFloat(document.getElementById('fvc-post').value);
    const fev1Post = parseFloat(document.getElementById('fev1-post').value);
    const fev1FvcPost = parseFloat(document.getElementById('fev1-fvc-post').value);
    
    // Calcular reversibilidad
    const reversibilityFEV1El = document.getElementById('reversibility-fev1');
    if (!isNaN(fev1Pre) && !isNaN(fev1Post) && fev1Pre !== 0) {
        const reversibilityFEV1 = ((fev1Post - fev1Pre) / fev1Pre) * 100;
        reversibilityFEV1El.textContent = `${reversibilityFEV1.toFixed(1)}%`;
    } else {
        reversibilityFEV1El.textContent = '--';
    }
    
    // Determinar patrón
    let pattern = '--';
    let interpretation = '--';
    
    const ratio = !isNaN(fev1FvcPost) ? fev1FvcPost : (!isNaN(fev1FvcPre) ? fev1FvcPre : null);

    if (ratio !== null) {
        if (ratio < 70) {
            pattern = 'Obstructivo';
            interpretation = 'Patrón obstructivo compatible con EPOC/Asma';
        } else {
            pattern = 'Normal o Restrictivo';
            interpretation = 'Patrón normal. Evaluar volúmenes pulmonares si sospecha restrictivo';
        }
    }
    
    document.getElementById('spirometry-pattern').textContent = pattern;
    document.getElementById('spirometry-interpretation').textContent = interpretation;
    updateDashboard();
    generateConclusion();
}

// 🚶‍♂️ Evaluar test de marcha
function evaluateWalkTest() {
    const distancia = parseFloat(document.getElementById('marcha-distancia').value);
    const spo2Inicial = parseFloat(document.getElementById('marcha-spo2-inicial').value);
    const spo2Final = parseFloat(document.getElementById('marcha-spo2-final').value);
    
    const marchaInterpretationEl = document.getElementById('marcha-interpretation');
    const marchaDesaturacionEl = document.getElementById('marcha-desaturacion');

    if (!isNaN(distancia)) {
        let interpretation = '';
        if (distancia >= 400) {
            interpretation = 'Normal';
        } else if (distancia >= 300) {
            interpretation = 'Levemente reducida';
        } else if (distancia >= 200) {
            interpretation = 'Moderadamente reducida';
        } else {
            interpretation = 'Severamente reducida';
        }
        marchaInterpretationEl.textContent = interpretation;
    } else {
        marchaInterpretationEl.textContent = '--';
    }
    
    if (!isNaN(spo2Inicial) && !isNaN(spo2Final)) {
        const desaturacion = spo2Inicial - spo2Final;
        let desatInterpretation = '';
        if (desaturacion >= 4) {
            desatInterpretation = `Sí (${desaturacion.toFixed(1)}%)`;
        } else {
            desatInterpretation = `No (${desaturacion.toFixed(1)}%)`;
        }
        marchaDesaturacionEl.textContent = desatInterpretation;
    } else {
        marchaDesaturacionEl.textContent = '--';
    }
    
    updateDashboard();
    generateConclusion();
}

// 🎯 Auto-rellenar campos comunes
function autoPopulateCommon() {
    // Simular examen normal básico
    document.getElementById('torax-normal').checked = true;
    document.getElementById('respiracion-normal').checked = true;
    document.getElementById('expansibilidad-normal').checked = true;
    document.getElementById('amplitud-normal').checked = true;
    
    // Signos vitales normales
    document.getElementById('frecuencia-respiratoria').value = '16';
    document.getElementById('saturacion-o2').value = '98';
    
    // Ruidos respiratorios normales
    ['der-apice', 'izq-apice'].forEach(zona => {
        const ruidoId = `ruidos-${zona}-vesicular`;
        const fremitoId = `fremito-${zona}-normal`;
        const percusionId = `percusion-${zona}-sonoro`;
        
        const ruidoEl = document.getElementById(ruidoId);
        const fremitoEl = document.getElementById(fremitoId);
        const percusionEl = document.getElementById(percusionId);
        
        if (ruidoEl) ruidoEl.checked = true;
        if (fremitoEl) fremitoEl.checked = true;
        if (percusionEl) percusionEl.checked = true;
    });
    
    updateDashboard();
    generateConclusion();
}

// 📊 Actualizar dashboard
function updateDashboard() {
    const sections = [
        'anamnesis', 'thoracic-inspection', 'thoracic-palpation', 
        'thoracic-percussion', 'pulmonary-auscultation', 'respiratory-scales', 'spirometry'
    ];
    
    let completedSections = 0;
    let totalFindings = 0;
    let totalAlerts = 0;
    let totalWarnings = 0;
    
    sections.forEach(sectionId => {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            const checkboxes = sectionElement.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked');
            const numbers = sectionElement.querySelectorAll('input[type="number"]');
            const selects = sectionElement.querySelectorAll('select');
            const ranges = sectionElement.querySelectorAll('input[type="range"]');
            
            let hasContent = checkboxes.length > 0;
            
            // Verificar campos numéricos
            numbers.forEach(input => {
                if (input.value && input.value !== '0' && !isNaN(parseFloat(input.value))) hasContent = true;
            });
            
            // Verificar selects
            selects.forEach(select => {
                if (select.selectedIndex > 0 || select.value !== '') hasContent = true;
            });
            
            // Verificar ranges
            ranges.forEach(input => {
                if (input.value && input.value !== '0') hasContent = true;
            });
            
            if (hasContent) {
                completedSections++;
                totalFindings += checkboxes.length;
                
                // Contar alertas y warnings específicos
                checkboxes.forEach(checkbox => {
                    const label = checkbox.nextElementSibling ? checkbox.nextElementSibling.textContent.toLowerCase() : '';
                    
                    // Criterios de alerta para neumología
                    if (label.includes('taquipnea') || label.includes('bradipnea') || 
                        label.includes('cianosis') || label.includes('hipoxemia') ||
                        label.includes('abolido') || label.includes('mate') ||
                        checkbox.id.includes('confusion') || checkbox.id.includes('estridor')) {
                        totalAlerts++;
                    }
                    // Criterios de warning
                    else if (label.includes('disnea') || label.includes('tos') ||
                             label.includes('sibilancias') || label.includes('crepitantes') ||
                             label.includes('disminuido') || label.includes('asimétric')) {
                        totalWarnings++;
                    }
                });

                // Check specific interpretations for alerts/warnings
                const frInterpret = document.getElementById('interpretacion-fr')?.textContent;
                const satInterpret = document.getElementById('interpretacion-sat')?.textContent;
                
                if (frInterpret === 'Bradipnea' || frInterpret === 'Taquipnea') {
                    totalAlerts++;
                }
                if (satInterpret && (satInterpret.includes('Hipoxemia') || satInterpret.includes('severa') || satInterpret.includes('moderada'))) {
                    totalAlerts++;
                } else if (satInterpret && satInterpret.includes('leve')) {
                    totalWarnings++;
                }
            }
        }
    });
    
    // Actualizar valores del dashboard
    const progress = Math.round((completedSections / sections.length) * 100);
    document.getElementById('exam-progress').textContent = `${progress}%`;
    document.getElementById('sections-completed').textContent = `${completedSections}/${sections.length}`;
    document.getElementById('alert-count').textContent = totalAlerts;
    document.getElementById('warnings-item').classList.toggle('dashboard-warning', totalWarnings > 0);
    document.getElementById('alerts-item').classList.toggle('dashboard-alert', totalAlerts > 0);
    document.getElementById('warning-count').textContent = totalWarnings;
    document.getElementById('findings-count').textContent = totalFindings;
    document.getElementById('completeness-status').textContent = `${progress}%`;
    
    // Guardar valores globales
    examProgress = progress;
    sectionsCompleted = completedSections;
    alertCount = totalAlerts;
    warningCount = totalWarnings;
    findingsCount = totalFindings;
    completenessStatus = `${progress}%`;
}

// 📊 Panel sticky - funciones
function generateStickyConclusion() {
    const stickyContent = document.getElementById('stickyContent');
    
    setTimeout(() => {
        const originalContent = document.getElementById('conclusion-text').textContent;
        stickyContent.textContent = originalContent;
    }, 100);
}

function copyStickyToClipboard() {
    const stickyContent = document.getElementById('stickyContent').textContent;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(stickyContent).then(() => {
            showCopyNotification();
        }).catch(err => {
            console.error('Error al copiar: ', err);
            fallbackCopyToClipboard(stickyContent);
        });
    } else {
        fallbackCopyToClipboard(stickyContent);
    }
}

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
        console.error('Error al copiar: ', err);
        // Use a custom message box instead of alert()
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #e74c3c;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10001;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            font-size: 16px;
            text-align: center;
        `;
        messageBox.textContent = 'No se pudo copiar el texto. Por favor, copie manualmente.';
        document.body.appendChild(messageBox);
        setTimeout(() => document.body.removeChild(messageBox), 3000);
    }

    document.body.removeChild(textArea);
}

function showCopyNotification() {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1abc9c;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    notification.innerHTML = '<i class="fas fa-check-circle"></i> ¡Informe copiado!';
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.opacity = '1', 100);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 2500);
}

function printStickyConclusion() {
    const conclusion = document.getElementById('stickyContent').textContent;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Informe Neumológico</title>
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
                    border-bottom: 2px solid #2196F3;
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
                <h1>Informe Neumológico</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
                <p>Hora: ${new Date().toLocaleTimeString()}</p>
            </div>
            <pre>${conclusion}</pre>
            <div class="footer">
                <p>Generado por Sistema de Evaluación Neumológica - HealthOS</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// 📝 Generar conclusión completa
function generateConclusion() {
    const conclusionEl = document.getElementById('conclusion-text');
    let conclusion = 'INFORME DEL EXAMEN NEUMOLÓGICO:\n\n';

    // Funciones auxiliares
    const getLabelText = (id) => document.querySelector(`label[for="${id}"]`)?.textContent.toLowerCase() || '';
    const isChecked = (id) => document.getElementById(id)?.checked;
    const getInputValue = (id) => document.getElementById(id)?.value;
    const formatMedicalList = (arr) => {
        if (arr.length === 0) return '';
        if (arr.length === 1) return arr[0];
        if (arr.length === 2) return `${arr[0]} y ${arr[1]}`;
        return `${arr.slice(0, -1).join(', ')} y ${arr[arr.length - 1]}`;
    };

    // 1. QUEJAS PRINCIPALES
    let anamnesisSection = 'ANAMNESIS Y QUEJAS PRINCIPALES:\n';
    let hasAnamnesisFindings = false;

    if (isChecked('sin-quejas-neumo')) {
        anamnesisSection += 'El paciente se encuentra asintomático desde el punto de vista respiratorio. ';
        hasAnamnesisFindings = true;
    } else {
        const complaints = [];
        ['disnea', 'tos', 'expectoracion', 'dolor-toracico', 'hemoptisis', 'sibilancias',
         'ortopnea', 'disnea-paroxistica', 'cianosis', 'ronquidos', 'apneas', 'fiebre',
         'sudoracion-nocturna', 'perdida-peso'].forEach(id => {
            if (isChecked(id)) complaints.push(getLabelText(id));
        });

        if (complaints.length > 0) {
            anamnesisSection += `Quejas principales: ${formatMedicalList(complaints)}. `;
            hasAnamnesisFindings = true;
        }
    }

    // Evaluación de la disnea
    const mmrcSelected = document.querySelector('input[name="mmrc-dyspnea"]:checked');
    const disneaTiempo = getInputValue('disnea-tiempo');
    const disneaUnidad = document.getElementById('disnea-unidad')?.value;

    if (mmrcSelected || (disneaTiempo && disneaTiempo !== '')) {
        anamnesisSection += 'Evaluación de disnea: ';
        if (mmrcSelected) {
            const mmrcLabel = document.querySelector(`label[for="${mmrcSelected.id}"]`).textContent;
            anamnesisSection += `${mmrcLabel}. `;
        }
        if (disneaTiempo && disneaTiempo !== '') anamnesisSection += `Tiempo de evolución: ${disneaTiempo} ${disneaUnidad}. `;
        hasAnamnesisFindings = true;
    }

    // Hábito tabáquico
    const tabacSelected = document.querySelector('input[name="tabaquismo"]:checked');
    const paquetesAno = document.getElementById('paquetes-calculados')?.textContent;

    if (tabacSelected) {
        const tabacLabel = document.querySelector(`label[for="${tabacSelected.id}"]`).textContent;
        anamnesisSection += `Hábito tabáquico: ${tabacLabel}. `;
        if (paquetesAno && paquetesAno !== '0') anamnesisSection += `Paquetes/año: ${paquetesAno}. `;
        hasAnamnesisFindings = true;
    }

    if (hasAnamnesisFindings) {
        conclusion += anamnesisSection.trim() + '\n\n';
    }

    // 2. EXAMEN FÍSICO
    let physicalExamSection = 'EXAMEN FÍSICO:\n';
    let hasPhysicalFindings = false;

    // Signos vitales
    const fr = getInputValue('frecuencia-respiratoria');
    const frInterpretacion = document.getElementById('interpretacion-fr')?.textContent;
    const sat = getInputValue('saturacion-o2');
    const satInterpretacion = document.getElementById('interpretacion-sat')?.textContent;

    if ((fr && fr !== '') || (sat && sat !== '')) {
        physicalExamSection += 'Signos vitales: ';
        if (fr && fr !== '') physicalExamSection += `FR: ${fr} rpm (${frInterpretacion}). `;
        if (sat && sat !== '') physicalExamSection += `SatO2: ${sat}% (${satInterpretacion}). `;
        hasPhysicalFindings = true;
    }

    // Configuración torácica
    const formaTorax = document.querySelector('input[name="forma-torax"]:checked');
    const patronRespiratorio = document.querySelector('input[name="patron-respiratorio"]:checked');

    if (formaTorax || patronRespiratorio) {
        physicalExamSection += 'Inspección: ';
        if (formaTorax) {
            const formaLabel = document.querySelector(`label[for="${formaTorax.id}"]`).textContent;
            physicalExamSection += `Tórax ${formaLabel.toLowerCase()}. `;
        }
        if (patronRespiratorio) {
            const patronLabel = document.querySelector(`label[for="${patronRespiratorio.id}"]`).textContent;
            physicalExamSection += `Patrón respiratorio: ${patronLabel.toLowerCase()}. `;
        }
        hasPhysicalFindings = true;
    }

    // Expansibilidad
    const expansibilidadNormal = isChecked('expansibilidad-normal');
    const expansibilidadAsimetrica = isChecked('expansibilidad-asimetrica');
    const amplitudNormal = isChecked('amplitud-normal');
    const amplitudDisminuida = isChecked('amplitud-disminuida');

    let expansibilidadText = '';
    if (expansibilidadNormal) expansibilidadText += 'Expansibilidad simétrica normal. ';
    if (expansibilidadAsimetrica) expansibilidadText += 'Expansibilidad asimétrica. ';
    if (amplitudNormal) expansibilidadText += 'Amplitud de expansión normal. ';
    if (amplitudDisminuida) expansibilidadText += 'Amplitud de expansión disminuida. ';

    if (expansibilidadText !== '') {
        physicalExamSection += 'Palpación: ' + expansibilidadText;
        hasPhysicalFindings = true;
    }

    // Percusión
    const percusionDerApice = document.querySelector('input[name="percusion-der-apice"]:checked');
    const percusionIzqApice = document.querySelector('input[name="percusion-izq-apice"]:checked');
    let percusionText = [];
    if (percusionDerApice) percusionText.push(`Percusión derecho ápice: ${percusionDerApice.value}`);
    if (percusionIzqApice) percusionText.push(`Percusión izquierdo ápice: ${percusionIzqApice.value}`);

    if (percusionText.length > 0) {
        physicalExamSection += `Percusión: ${percusionText.join(', ')}. `;
        hasPhysicalFindings = true;
    } else {
        // Default if nothing selected
        physicalExamSection += `Percusión: Sonoridad pulmonar conservada bilateralmente. `;
        hasPhysicalFindings = true;
    }


    // Auscultación
    const ruidosPatologicos = [];
    const adventicios = [];
    
    // Verificar ruidos por zona
    ['der-apice', 'izq-apice'].forEach(zona => {
        const ruido = document.querySelector(`input[name="ruidos-${zona}"]:checked`);
        if (ruido && ruido.value !== 'vesicular') {
            ruidosPatologicos.push(`${ruido.value} en ${zona.replace('der-', 'pulmón derecho ').replace('izq-', 'pulmón izquierdo ')}`);
        }
    });

    // Ruidos adventicios
    document.querySelectorAll('input[id*="crepitantes"]:checked, input[id*="subcrepitantes"]:checked, input[id*="sibilancias"]:checked, input[id*="roncus"]:checked').forEach(cb => {
        const parts = cb.id.split('-');
        const tipo = parts[0];
        const lado = parts[1] === 'der' ? 'derecho' : 'izquierdo';
        const zona = parts[2];
        adventicios.push(`${tipo} en pulmón ${lado} ${zona}`);
    });

    if (ruidosPatologicos.length > 0 || adventicios.length > 0) {
        physicalExamSection += 'Auscultación: ';
        if (ruidosPatologicos.length > 0) {
            physicalExamSection += `Ruidos respiratorios: ${formatMedicalList(ruidosPatologicos)}. `;
        }
        if (adventicios.length > 0) {
            physicalExamSection += `Ruidos adventicios: ${formatMedicalList(adventicios)}. `;
        }
        hasPhysicalFindings = true;
    } else if (hasPhysicalFindings) { // Only add default if other physical findings exist
        physicalExamSection += 'Auscultación: Ruidos respiratorios vesiculares bilaterales, sin ruidos adventicios. ';
    }

    if (hasPhysicalFindings) {
        conclusion += physicalExamSection.trim() + '\n\n';
    }

    // 3. ESCALAS DE EVALUACIÓN
    let scalesSection = 'ESCALAS DE EVALUACIÓN:\n';
    let hasScalesFindings = false;

    const catTotal = document.getElementById('cat-total')?.textContent;
    const catInterpretation = document.getElementById('cat-interpretation')?.textContent;
    const bodeTotal = document.getElementById('bode-total')?.textContent;
    const bodePrognosis = document.getElementById('bode-prognosis')?.textContent;

    if (catTotal && catTotal !== '0') {
        scalesSection += `Test CAT: ${catTotal}/40 puntos (${catInterpretation}). `;
        hasScalesFindings = true;
    }
    if (bodeTotal && bodeTotal !== '0') {
        scalesSection += `Índice BODE: ${bodeTotal}/10 puntos (${bodePrognosis}). `;
        hasScalesFindings = true;
    }

    if (hasScalesFindings) {
        conclusion += scalesSection.trim() + '\n\n';
    }

    // 4. PRUEBAS FUNCIONALES
    let functionalSection = 'PRUEBAS FUNCIONALES:\n';
    let hasFunctionalFindings = false;

    const spirometryPattern = document.getElementById('spirometry-pattern')?.textContent;
    const spirometryInterpretation = document.getElementById('spirometry-interpretation')?.textContent;

    if (spirometryPattern && spirometryPattern !== '--') {
        functionalSection += `Espirometría: Patrón ${spirometryPattern.toLowerCase()}. `;
        if (spirometryInterpretation && spirometryInterpretation !== '--') {
            functionalSection += `${spirometryInterpretation}. `;
        }
        hasFunctionalFindings = true;
    }

    const marchaDistancia = getInputValue('marcha-distancia');
    const marchaInterpretation = document.getElementById('marcha-interpretation')?.textContent;
    const marchaDesaturacion = document.getElementById('marcha-desaturacion')?.textContent;

    if (marchaDistancia && marchaDistancia !== '') {
        functionalSection += `Test de marcha 6 minutos: ${marchaDistancia} metros (${marchaInterpretation}). `;
        if (marchaDesaturacion && marchaDesaturacion !== '--') {
            functionalSection += `Desaturación: ${marchaDesaturacion}. `;
        }
        hasFunctionalFindings = true;
    }

    if (hasFunctionalFindings) {
        conclusion += functionalSection.trim() + '\n\n';
    }

    // RESUMEN FINAL
    if (conclusion.trim() === 'INFORME DEL EXAMEN NEUMOLÓGICO:') {
        conclusion = 'Seleccione los parámetros del examen para generar la conclusión neumológica...';
    } else {
        conclusion += 'RESUMEN Y CONCLUSIÓN:\n';
        if (alertCount > 0) {
            conclusion += `Se identifican ${alertCount} **hallazgos críticos** que requieren atención inmediata. `;
        }
        if (warningCount > 0) {
            conclusion += `Existen ${warningCount} **hallazgos importantes** que deben ser considerados. `;
        }
        if (findingsCount > 0) {
            conclusion += `Un total de ${findingsCount} hallazgos relevantes han sido registrados en este examen. `;
        } else {
            conclusion += `El examen no ha revelado hallazgos patológicos significativos. `;
        }
        conclusion += '\n\n';

        conclusion += 'IMPRESIÓN DIAGNÓSTICA:\n';
        conclusion += '[Pendiente de correlación clínica y estudios complementarios]\n\n';
        conclusion += 'PLAN:\n';
        conclusion += '[A determinar según hallazgos clínicos e imagenológicos]\n\n';
        conclusion += 'SEGUIMIENTO:\n';
        conclusion += '[Control según patología respiratoria sospechada]\n\n';
        conclusion += `COMPLETITUD DEL EXAMEN: ${examProgress}%`;
    }

    conclusionEl.textContent = conclusion;
    
    // Actualizar panel sticky si está activo
    const stickyPanel = document.getElementById('stickyReportPanel');
    if (stickyPanel && stickyPanel.classList.contains('active')) {
        setTimeout(() => generateStickyConclusion(), 100); 
    }
}

// 🗑️ Limpiar formulario
function clearForm() {
    // Using a custom message box instead of confirm()
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--card-bg-light);
        color: var(--text-dark);
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-size: 16px;
        text-align: center;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 15px;
    `;
    messageBox.innerHTML = `
        <p>¿Está seguro de que desea limpiar todos los datos del formulario?</p>
        <div style="display: flex; justify-content: center; gap: 10px;">
            <button id="confirmClear" class="btn btn-primary">Sí</button>
            <button id="cancelClear" class="btn btn-secondary">No</button>
        </div>
    `;
    document.body.appendChild(messageBox);

    document.getElementById('confirmClear').onclick = () => {
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            cb.disabled = false;
        });
        document.querySelectorAll('input[type="radio"]').forEach(rb => rb.checked = false);
        document.querySelectorAll('input[type="number"]').forEach(nb => nb.value = '');
        document.querySelectorAll('input[type="range"]').forEach(rb => rb.value = 0);
        document.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
        document.querySelectorAll('textarea').forEach(ta => ta.value = '');
        
        // Resetear valores específicos de CAT
        ['tos', 'flemas', 'opresion', 'disnea'].forEach(cat => {
            const valueEl = document.getElementById(`cat-${cat}-value`);
            if (valueEl) valueEl.textContent = '0';
        });
        
        // Resetear valores calculados
        document.getElementById('paquetes-calculados').textContent = '0';
        document.getElementById('interpretacion-fr').textContent = '--';
        document.getElementById('interpretacion-fr').style.color = ''; // Reset color
        document.getElementById('interpretacion-sat').textContent = '--';
        document.getElementById('interpretacion-sat').style.color = ''; // Reset color
        document.getElementById('cat-total').textContent = '0';
        document.getElementById('cat-interpretation').textContent = '--';
        document.getElementById('bode-total').textContent = '0';
        document.getElementById('bode-prognosis').textContent = '--';
        document.getElementById('spirometry-pattern').textContent = '--';
        document.getElementById('spirometry-interpretation').textContent = '--';
        document.getElementById('reversibility-fev1').textContent = '--';
        
        const marchaInterpretation = document.getElementById('marcha-interpretation');
        const marchaDesaturacion = document.getElementById('marcha-desaturacion');
        if (marchaInterpretation) marchaInterpretation.textContent = '--';
        if (marchaDesaturacion) marchaDesaturacion.textContent = '--';
        
        // Reset dashboard item colors
        document.getElementById('warnings-item').classList.remove('dashboard-warning');
        document.getElementById('alerts-item').classList.remove('dashboard-alert');

        updateDashboard();
        generateConclusion();
        document.body.removeChild(messageBox);
    };

    document.getElementById('cancelClear').onclick = () => {
        document.body.removeChild(messageBox);
    };
}


// 🎛️ Función principal para actualizar diseño
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
        
        sidebar.style.left = `0px`;
        sidebar.style.transform = `translateX(0)`;
        stickyReportPanel.style.right = `0px`;
        stickyReportPanel.style.transform = stickyReportPanel.classList.contains('active') ? 'translateX(0)' : 'translateX(100%)';

    } else {
        // On smaller screens, sidebar slides out completely when collapsed
        contentAreaLeftOffset = sidebar.classList.contains('collapsed') ? 0 : COLLAPSED_SIDEBAR_WIDTH;
        contentAreaRightOffset = 0; // Report panel will overlay on mobile

        sidebar.style.left = `0px`;
        sidebar.style.transform = sidebar.classList.contains('collapsed') ? 'translateX(-100%)' : 'translateX(0)';
        
        // Ensure sticky panel is full width and slides from right
        stickyReportPanel.style.width = '100%';
        stickyReportPanel.style.left = '0'; // Ensure it starts from left edge for full width
        stickyReportPanel.style.right = '0'; // Ensure it covers right edge
        stickyReportPanel.style.transform = stickyReportPanel.classList.contains('active') ? 'translateX(0)' : 'translateX(100%)';
    }

    contentArea.style.marginLeft = `${contentAreaLeftOffset}px`;
    contentArea.style.marginRight = `${contentAreaRightOffset}px`;

    topBar.style.left = `${contentAreaLeftOffset}px`;
    topBar.style.width = `calc(100% - ${contentAreaLeftOffset + contentAreaRightOffset}px)`;
}


// 🚀 Inicialización del sistema
document.addEventListener('DOMContentLoaded', () => {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }

    // Event listeners para inputs generales
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', () => {
            updateDashboard();
            generateConclusion();
        });
        el.addEventListener('input', () => {
            updateDashboard();
            generateConclusion();
        });
    });

    // Event listeners específicos para CAT sliders
    ['tos', 'flemas', 'opresion', 'disnea'].forEach(category => {
        const element = document.getElementById(`cat-${category}`);
        if (element) {
            element.addEventListener('input', () => {
                updateCATValue(category, element.value);
            });
        }
    });
    
    // Configurar la barra lateral al cambiar el tamaño de la ventana
    window.addEventListener('resize', () => {
        updateLayout();
    });

    // Expandir la primera sección por defecto
    const firstSection = document.querySelector('.section-container');
    if (firstSection) {
        const firstHeader = firstSection.querySelector('.section-header-main');
        if (firstHeader) {
            toggleSection(firstHeader);
        }
    }

    // Asegurarse de que el submenú de Neumología esté expandido
    const neumoNavLink = document.getElementById('neumologia-nav-link');
    if (neumoNavLink && neumoNavLink.classList.contains('active')) {
        const neumoSubMenu = document.getElementById('neumologia-sub-menu');
        if (neumoSubMenu) {
            neumoSubMenu.style.maxHeight = neumoSubMenu.scrollHeight + 'px';
        }
    }

    // Inicializar evaluaciones
    evaluateRespiratoryRate();
    evaluateSaturation();
    calculatePackYears();
    calculateCAT();
    calculateBODE();
    calculateSpirometry();
    evaluateWalkTest();
    updateDashboard();
    generateConclusion();

    // Actualización inicial de los márgenes
    updateLayout();

    console.log('🫁 Sistema de Evaluación Neumológica HealthOS cargado exitosamente!');
});
