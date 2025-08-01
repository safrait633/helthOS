// ========== GLOBAL VARIABLES ==========
let examProgress = 0;
let sectionsCompleted = 0;
let alertCount = 0;
let warningCount = 0;
let findingsCount = 0;
let metabolicStatus = 'Pendiente';

// Ancho de la barra lateral principal
const MAIN_SIDEBAR_WIDTH = 250;
const COLLAPSED_SIDEBAR_WIDTH = 80;
// Ancho del panel de informe en tiempo real
const REPORT_PANEL_WIDTH = 400;
// Altura de la barra superior fija
const TOP_BAR_HEIGHT = 72;

// ========== MISSING FUNCTIONS ==========

// Toggle section expansion/collapse
function toggleSection(headerElement) {
    const sectionContainer = headerElement.closest('.section-container');
    const sectionContent = sectionContainer.querySelector('.section-content-main');
    const arrow = headerElement.querySelector('.section-arrow');
    
    if (sectionContainer.classList.contains('expanded')) {
        sectionContainer.classList.remove('expanded');
        sectionContent.style.maxHeight = '0';
        arrow.style.transform = 'rotate(0deg)';
    } else {
        sectionContainer.classList.add('expanded');
        sectionContent.style.maxHeight = sectionContent.scrollHeight + 'px';
        arrow.style.transform = 'rotate(180deg)';
    }
}

// Toggle theme (dark/light mode)
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

// Toggle main sidebar collapse/expand
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.getElementById('sidebar-toggle-icon');
    
    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        if (toggleIcon) toggleIcon.className = 'fas fa-chevron-left';
    } else {
        sidebar.classList.add('collapsed');
        if (toggleIcon) toggleIcon.className = 'fas fa-chevron-right';
    }
    
    updateLayout();
}

// Toggle sticky report panel
function toggleStickyPanel() {
    const panel = document.getElementById('stickyReportPanel');
    panel.classList.toggle('active');
    
    // Generate report when opening
    if (panel.classList.contains('active')) {
        generateStickyConclusion();
    }
    
    updateLayout();
}

// Toggle endocrinology submenu
function toggleEndoSubMenu(event) {
    event.preventDefault();
    const subMenu = document.getElementById('endo-sub-menu');
    const navLink = document.getElementById('endo-nav-link');
    
    if (subMenu.style.maxHeight === '0px' || !subMenu.style.maxHeight) {
        subMenu.style.maxHeight = subMenu.scrollHeight + 'px';
        navLink.classList.add('active');
    } else {
        subMenu.style.maxHeight = '0';
        navLink.classList.remove('active');
    }
}

// Update layout margins based on sidebar and panel states
function updateLayout() {
    const sidebar = document.getElementById('sidebar');
    const stickyPanel = document.getElementById('stickyReportPanel');
    const contentArea = document.getElementById('contentArea');
    const topBar = document.getElementById('topBar');
    
    let leftMargin = 0;
    let rightMargin = 0;
    
    // Calculate left margin based on sidebar state
    if (window.innerWidth > 768) {
        leftMargin = sidebar.classList.contains('collapsed') ? COLLAPSED_SIDEBAR_WIDTH : MAIN_SIDEBAR_WIDTH;
    } else {
        leftMargin = 0; // No margin on mobile - sidebar overlays
    }
    
    // Calculate right margin based on sticky panel state
    if (stickyPanel.classList.contains('active') && window.innerWidth > 768) {
        rightMargin = REPORT_PANEL_WIDTH;
    }
    
    // Apply margins
    contentArea.style.marginLeft = leftMargin + 'px';
    contentArea.style.marginRight = rightMargin + 'px';
    
    // Update top bar position and width
    topBar.style.left = leftMargin + 'px';
    topBar.style.right = rightMargin + 'px';
    topBar.style.width = 'auto';
}

// Function to generate report in sticky panel (called by toggleStickyPanel and updateDashboard)
function generateStickyConclusion() {
    const stickyContent = document.getElementById('reportContent');
    const originalConclusionEl = document.getElementById('conclusion-text-traditional');
    stickyContent.textContent = originalConclusionEl.textContent;
}

// Function to copy sticky panel content to clipboard
function copyStickyToClipboard() {
    const stickyContent = document.getElementById('reportContent').textContent;
    navigator.clipboard.writeText(stickyContent).then(() => {
        showCopyNotification();
    }).catch(err => {
        console.error('Error al copiar: ', err);
        // Fallback for older browsers or insecure contexts
        const textArea = document.createElement('textarea');
        textArea.value = stickyContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyNotification();
    });
}

// Function to print sticky panel content
function printStickyConclusion() {
    const conclusion = document.getElementById('reportContent').textContent;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Informe Endocrinológico</title>
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
                    border-bottom: 2px solid #2c5aa0;
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
                <h1>Informe Endocrinológico</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
                <p>Hora: ${new Date().toLocaleTimeString()}</p>
            </div>
            <pre>${conclusion}</pre>
            <div class="footer">
                <p>Generado por Sistema de Evaluación Endocrinológica Premium</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Show copy notification
function showCopyNotification() {
    const notification = document.getElementById('copyNotification');
    notification.classList.add('opacity-100');
    setTimeout(() => {
        notification.classList.remove('opacity-100');
    }, 2500);
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Expand the section if collapsed
        const sectionContainer = section.closest('.section-container');
        if (sectionContainer && !sectionContainer.classList.contains('expanded')) {
            toggleSection(sectionContainer.querySelector('.section-header-main'));
        }
    }
}

// Expand all sections
function expandAllSections() {
    document.querySelectorAll('.section-container:not(.expanded) .section-header-main').forEach(header => {
        toggleSection(header);
    });
}

// Collapse all sections
function collapseAllSections() {
    document.querySelectorAll('.section-container.expanded .section-header-main').forEach(header => {
        toggleSection(header);
    });
}

// Handle "No complaints" checkbox
function handleNoComplaints() {
    const noComplaintsCheckbox = document.getElementById('sin-quejas-endo');
    const otherCheckboxes = document.querySelectorAll('#anamnesis input[type="checkbox"]:not(#sin-quejas-endo)');
    
    otherCheckboxes.forEach(checkbox => {
        checkbox.disabled = noComplaintsCheckbox.checked;
        if (noComplaintsCheckbox.checked) checkbox.checked = false;
    });
    updateDashboard();
}

// Handle mutually exclusive checkboxes
function handleMutuallyExclusive(positiveId, negativeId, checkbox) {
    if (checkbox.checked) {
        const oppositeId = checkbox.id === positiveId ? negativeId : positiveId;
        const oppositeCheckbox = document.getElementById(oppositeId);
        if (oppositeCheckbox) oppositeCheckbox.checked = false;
    }
    updateDashboard();
}

// Handle gender selection to show/hide reproductive sections
function handleGenderSelection() {
    const maleSection = document.getElementById('male-reproductive-section');
    const femaleSection = document.getElementById('female-reproductive-section');
    const genderMale = document.getElementById('gender-male');
    const genderFemale = document.getElementById('gender-female');

    if (genderMale && genderMale.checked) {
        if (maleSection) maleSection.style.display = 'block';
        if (femaleSection) {
            femaleSection.style.display = 'none';
            femaleSection.querySelectorAll('input, select, textarea').forEach(el => el.value = el.type === 'checkbox' || el.type === 'radio' ? false : '');
        }
    } else if (genderFemale && genderFemale.checked) {
        if (femaleSection) femaleSection.style.display = 'block';
        if (maleSection) {
            maleSection.style.display = 'none';
            maleSection.querySelectorAll('input, select, textarea').forEach(el => el.value = el.type === 'checkbox' || el.type === 'radio' ? false : '');
        }
    } else {
        if (maleSection) maleSection.style.display = 'none';
        if (femaleSection) femaleSection.style.display = 'none';
    }
    updateDashboard();
}

// Existing calculation functions, modified to call updateDashboard()
function evaluateWeightChange() {
    const perdida = parseFloat(document.getElementById('perdida-peso')?.value) || 0;
    const ganancia = parseFloat(document.getElementById('ganancia-peso')?.value) || 0;
    const interpretEl = document.getElementById('interpretacion-peso');
    
    if (!interpretEl) return;
    
    if (perdida === 0 && ganancia === 0) {
        interpretEl.textContent = '--';
        interpretEl.style.color = '';
        updateDashboard();
        return;
    }
    
    if (perdida > 0) {
        if (perdida >= 5) {
            interpretEl.textContent = 'Pérdida significativa';
            interpretEl.style.color = 'var(--alert-color)';
        } else {
            interpretEl.textContent = 'Pérdida leve';
            interpretEl.style.color = 'var(--warning-color)';
        }
    } else if (ganancia > 0) {
        if (ganancia >= 5) {
            interpretEl.textContent = 'Ganancia significativa';
            interpretEl.style.color = 'var(--alert-color)';
        } else {
            interpretEl.textContent = 'Ganancia leve';
            interpretEl.style.color = 'var(--warning-color)';
        }
    }
    updateDashboard();
}

function evaluatePolyuria() {
    const volumen = parseFloat(document.getElementById('volumen-urinario')?.value) || 0;
    const interpretEl = document.getElementById('interpretacion-poliuria');
    
    if (!interpretEl) return;
    
    if (volumen === 0) {
        interpretEl.textContent = '--';
        interpretEl.style.color = '';
        updateDashboard();
        return;
    }
    
    if (volumen >= 3) {
        interpretEl.textContent = 'Poliuria severa';
        interpretEl.style.color = 'var(--alert-color)';
    } else if (volumen >= 2.5) {
        interpretEl.textContent = 'Poliuria moderada';
        interpretEl.style.color = 'var(--warning-color)';
    } else {
        interpretEl.textContent = 'Normal';
        interpretEl.style.color = 'var(--normal-color)';
    }
    updateDashboard();
}

function calculateBMI() {
    const peso = parseFloat(document.getElementById('peso-actual')?.value);
    const talla = parseFloat(document.getElementById('talla')?.value);
    const imcValueEl = document.getElementById('imc-value');
    const imcClassificationEl = document.getElementById('imc-classification');
    
    if (!imcValueEl || !imcClassificationEl) return;
    
    if (!peso || !talla) {
        imcValueEl.textContent = '--';
        imcClassificationEl.textContent = '--';
        imcClassificationEl.style.color = '';
        updateDashboard();
        return;
    }
    
    const imc = peso / Math.pow(talla / 100, 2);
    imcValueEl.textContent = imc.toFixed(1);
    
    let classification = '';
    let color = '';
    if (imc < 18.5) { classification = 'Bajo peso'; color = 'var(--warning-color)'; }
    else if (imc < 25) { classification = 'Normal'; color = 'var(--normal-color)'; }
    else if (imc < 30) { classification = 'Sobrepeso'; color = 'var(--warning-color)'; }
    else if (imc < 35) { classification = 'Obesidad I'; color = 'var(--alert-color)'; }
    else if (imc < 40) { classification = 'Obesidad II'; color = 'var(--alert-color)'; }
    else { classification = 'Obesidad III'; color = 'var(--alert-color)'; }
    
    imcClassificationEl.textContent = classification;
    imcClassificationEl.style.color = color;
    updateDashboard();
}

function calculateWHR() {
    const cintura = parseFloat(document.getElementById('circunferencia-cintura')?.value);
    const cadera = parseFloat(document.getElementById('circunferencia-cadera')?.value);
    const whrValueEl = document.getElementById('whr-value');
    
    if (!whrValueEl) return;
    
    if (!cintura || !cadera) {
        whrValueEl.textContent = '--';
        updateDashboard();
        return;
    }
    
    const whr = cintura / cadera;
    whrValueEl.textContent = whr.toFixed(2);
    updateDashboard();
}

function evaluateWaistCircumference() {
    const cintura = parseFloat(document.getElementById('circunferencia-cintura')?.value);
    const interpretEl = document.getElementById('waist-risk');
    
    if (!interpretEl) return;
    
    if (!cintura) {
        interpretEl.textContent = '--';
        interpretEl.style.color = '';
        updateDashboard();
        return;
    }
    
    // Assuming values for women (can be adjusted based on gender)
    let color = '';
    if (cintura >= 88) { // Criteria for women
        interpretEl.textContent = 'Riesgo alto';
        color = 'var(--alert-color)';
    } else if (cintura >= 80) { // Criteria for women
        interpretEl.textContent = 'Riesgo moderado';
        color = 'var(--warning-color)';
    } else {
        interpretEl.textContent = 'Riesgo bajo';
        color = 'var(--normal-color)';
    }
    interpretEl.style.color = color;
    updateDashboard();
}

function evaluateBloodPressure() {
    const pas = parseFloat(document.getElementById('pas')?.value);
    const pad = parseFloat(document.getElementById('pad')?.value);
    const classificationEl = document.getElementById('bp-classification');
    
    if (!classificationEl) return;
    
    if (!pas || !pad) {
        classificationEl.textContent = '--';
        classificationEl.style.color = '';
        updateDashboard();
        return;
    }
    
    let classification = '';
    let color = '';
    if (pas >= 180 || pad >= 110) {
        classification = 'HTA III (crisis)'; color = 'var(--alert-color)';
    } else if (pas >= 160 || pad >= 100) {
        classification = 'HTA II (moderada)'; color = 'var(--alert-color)';
    } else if (pas >= 140 || pad >= 90) {
        classification = 'HTA I (leve)'; color = 'var(--warning-color)';
    } else if (pas >= 130 || pad >= 85) {
        classification = 'Prehipertensión'; color = 'var(--warning-color)';
    } else {
        classification = 'Normal'; color = 'var(--normal-color)';
    }
    
    classificationEl.textContent = classification;
    classificationEl.style.color = color;
    updateDashboard();
}

function evaluateHeartRate() {
    const fc = parseFloat(document.getElementById('frecuencia-cardiaca')?.value);
    const classificationEl = document.getElementById('hr-classification');
    
    if (!classificationEl) return;
    
    if (!fc) {
        classificationEl.textContent = '--';
        classificationEl.style.color = '';
        updateDashboard();
        return;
    }
    
    let classification = '';
    let color = '';
    if (fc < 60) {
        classification = 'Bradicardia'; color = 'var(--warning-color)';
    } else if (fc > 100) {
        classification = 'Taquicardia'; color = 'var(--warning-color)';
    } else {
        classification = 'Normal'; color = 'var(--normal-color)';
    }
    classificationEl.textContent = classification;
    classificationEl.style.color = color;
    updateDashboard();
}

function evaluateGoiter() {
    const grado = document.getElementById('grado-bocio')?.value;
    updateDashboard();
}

function evaluateGlucose() {
    const ayunas = parseFloat(document.getElementById('glucemia-ayunas')?.value);
    const classificationEl = document.getElementById('clasificacion-glucemia');
    
    if (!classificationEl) return;
    
    if (!ayunas) {
        classificationEl.textContent = '--';
        classificationEl.style.color = '';
        updateDashboard();
        return;
    }
    
    let classification = '';
    let color = '';
    if (ayunas >= 126) {
        classification = 'Diabetes'; color = 'var(--alert-color)';
    } else if (ayunas >= 100) {
        classification = 'Prediabetes'; color = 'var(--warning-color)';
    } else {
        classification = 'Normal'; color = 'var(--normal-color)';
    }
    classificationEl.textContent = classification;
    classificationEl.style.color = color;
    updateDashboard();
}

function evaluateHbA1c() {
    const hba1c = parseFloat(document.getElementById('hba1c')?.value);
    const classificationEl = document.getElementById('clasificacion-hba1c');
    
    if (!classificationEl) return;
    
    if (!hba1c) {
        classificationEl.textContent = '--';
        classificationEl.style.color = '';
        updateDashboard();
        return;
    }
    
    let classification = '';
    let color = '';
    if (hba1c >= 6.5) {
        classification = 'Diabetes'; color = 'var(--alert-color)';
    } else if (hba1c >= 5.7) {
        classification = 'Prediabetes'; color = 'var(--warning-color)';
    } else {
        classification = 'Normal'; color = 'var(--normal-color)';
    }
    classificationEl.textContent = classification;
    classificationEl.style.color = color;
    updateDashboard();
}

function calculateFINDRISK() {
    let total = 0;
    
    const edad = document.querySelector('input[name="findrisk-edad"]:checked');
    if (edad) total += parseInt(edad.value);
    
    const imc = document.querySelector('input[name="findrisk-imc"]:checked');
    if (imc) total += parseInt(imc.value);
    
    const cintura = document.querySelector('input[name="findrisk-cintura"]:checked');
    if (cintura) total += parseInt(cintura.value);
    
    const actividad = document.querySelector('input[name="findrisk-actividad"]:checked');
    if (actividad) total += parseInt(actividad.value);
    
    const dieta = document.querySelector('input[name="findrisk-dieta"]:checked');
    if (dieta) total += parseInt(dieta.value);
    
    const hta = document.querySelector('input[name="findrisk-hta"]:checked');
    if (hta) total += parseInt(hta.value);
    
    const glucemia = document.querySelector('input[name="findrisk-glucemia"]:checked');
    if (glucemia) total += parseInt(glucemia.value);
    
    const familia = document.querySelector('input[name="findrisk-familia"]:checked');
    if (familia) total += parseInt(familia.value);
    
    const scoreEl = document.getElementById('findrisk-score');
    const riskEl = document.getElementById('findrisk-risk');
    
    if (scoreEl) scoreEl.textContent = total;
    
    let riesgo = '';
    let color = '';
    if (total < 7) {
        riesgo = 'Bajo (1%)'; color = 'var(--normal-color)';
    } else if (total < 12) {
        riesgo = 'Ligeramente elevado (4%)'; color = 'var(--normal-color)';
    } else if (total < 15) {
        riesgo = 'Moderado (17%)'; color = 'var(--warning-color)';
    } else if (total < 21) {
        riesgo = 'Alto (33%)'; color = 'var(--alert-color)';
    } else {
        riesgo = 'Muy alto (50%)'; color = 'var(--alert-color)';
    }
    
    if (riskEl) {
        riskEl.textContent = riesgo;
        riskEl.style.color = color;
    }
    updateDashboard();
}

function calculateMetabolicSyndrome() {
    let criterios = 0;
    const cinturaObligatoria = document.getElementById('sm-cintura')?.checked;
    
    if (document.getElementById('sm-trigliceridos')?.checked) criterios++;
    if (document.getElementById('sm-hdl')?.checked) criterios++;
    if (document.getElementById('sm-presion')?.checked) criterios++;
    if (document.getElementById('sm-glucemia')?.checked) criterios++;
    
    const criteriosEl = document.getElementById('sm-criterios');
    const diagnosisEl = document.getElementById('sm-diagnosis');
    
    if (criteriosEl) criteriosEl.textContent = (cinturaObligatoria ? 1 : 0) + criterios;
    
    let diagnosis = '';
    let color = '';
    if (cinturaObligatoria && criterios >= 2) {
        diagnosis = 'SÍ - Cumple criterios de Síndrome Metabólico'; color = 'var(--alert-color)';
    } else {
        diagnosis = 'NO - No cumple criterios de Síndrome Metabólico'; color = 'var(--normal-color)';
    }
    
    if (diagnosisEl) {
        diagnosisEl.textContent = diagnosis;
        diagnosisEl.style.color = color;
    }
    updateDashboard();
}

function calculateDiabetesCriteria() {
    let criterios = 0;
    
    if (document.getElementById('diabetes-ayunas')?.checked) criterios++;
    if (document.getElementById('diabetes-hba1c')?.checked) criterios++;
    if (document.getElementById('diabetes-postcarga')?.checked) criterios++;
    if (document.getElementById('diabetes-random')?.checked) criterios++;
    
    const criteriosEl = document.getElementById('diabetes-criterios');
    const diagnosisEl = document.getElementById('diabetes-diagnosis');
    
    if (criteriosEl) criteriosEl.textContent = criterios;
    
    let diagnosis = '';
    let color = '';
    if (criterios >= 1) {
        diagnosis = 'SÍ - Cumple criterios para Diabetes Mellitus'; color = 'var(--alert-color)';
    } else {
        diagnosis = 'NO - No cumple criterios para Diabetes Mellitus'; color = 'var(--normal-color)';
    }
    
    if (diagnosisEl) {
        diagnosisEl.textContent = diagnosis;
        diagnosisEl.style.color = color;
    }
    updateDashboard();
}

function evaluateHirsutism() {
    const score = parseFloat(document.getElementById('ferriman-gallwey')?.value) || 0;
    const interpretEl = document.getElementById('hirsutism-interpretation');
    
    if (!interpretEl) return;
    
    if (score === 0) {
        interpretEl.textContent = '--';
        interpretEl.style.color = '';
        updateDashboard();
        return;
    }
    
    let color = '';
    if (score >= 8) {
        interpretEl.textContent = 'Hirsutismo significativo'; color = 'var(--alert-color)';
    } else if (score >= 6) {
        interpretEl.textContent = 'Hirsutismo leve'; color = 'var(--warning-color)';
    } else {
        interpretEl.textContent = 'Normal'; color = 'var(--normal-color)';
    }
    interpretEl.style.color = color;
    updateDashboard();
}

/**
 * Generates a narrative conclusion of the endocrinological exam based on form data.
 */
function generateConclusion(narrative = true) {
    const conclusionEl = document.getElementById('reportContent');
    const conclusionTraditional = document.getElementById('conclusion-text-traditional');
    
    if (!conclusionEl || !conclusionTraditional) return;

    if (narrative) {
        const narrativeReport = generateNarrativeReport();
        conclusionEl.textContent = narrativeReport;
        conclusionTraditional.textContent = narrativeReport;
    } else {
        const traditionalReport = generateTraditionalReport();
        conclusionEl.textContent = traditionalReport;
        conclusionTraditional.textContent = traditionalReport;
    }
}

/**
 * Creates accessible, narrative text by replacing technical terms.
 * @param {string} text - The input text with technical terms.
 * @returns {string} - Text with simplified terms.
 */
function createAccessibleText(text) {
    const replacements = {
        'fatiga y astenia': 'se siente muy cansado/a',
        'cambios de peso': 'ha notado cambios en su peso',
        'polidipsia': 'tiene mucha sed',
        'poliuria': 'orina con mucha frecuencia',
        'polifagia': 'tiene más hambre de lo normal',
        'intolerancia al calor': 'no tolera el calor',
        'intolerancia al frío': 'tiene mucho frío siempre',
        'palpitaciones': 'siente que el corazón le late fuerte o rápido',
        'nerviosismo': 'está nervioso/a o ansioso/a',
        'irregularidades menstruales': 'la regla le viene de forma irregular',
        'disfunción eréctil': 'tiene problemas de erección',
        'galactorrea': 'le sale leche del pecho sin estar amamantando',
        'hirsutismo': 'le está saliendo vello en zonas no habituales',
        'alopecia': 'se le está cayendo el pelo',
        'cambios en la voz': 'la voz se le ha puesto más ronca o grave',
        'dolor óseo': 'tiene dolor en los huesos',
        'fracturas por fragilidad': 'ha tenido fracturas por golpes leves',
        'cefalea': 'le duele la cabeza',
        'alteraciones de la visión': 'ha notado cambios en la vista',
        // Add more replacements as needed
    };

    let narrativeText = text;
    for (const key in replacements) {
        if (Object.hasOwnProperty.call(replacements, key)) {
            narrativeText = narrativeText.replace(new RegExp(key, 'gi'), replacements[key]);
        }
    }
    return narrativeText;
}


function generateNarrativeReport() {
    const getInputValue = (id) => document.getElementById(id)?.value || '';
    const isChecked = (id) => document.getElementById(id)?.checked || false;
    const getLabelText = (id) => {
        const label = document.querySelector(`label[for="${id}"]`);
        return label ? label.textContent.trim() : '';
    };
    const getSelectedText = (id) => {
        const select = document.getElementById(id);
        return select ? select.selectedOptions[0]?.text : '';
    };

    let report = '# CONSULTA ENDOCRINOLÓGICA\n\n';

    // --- DATOS DEMOGRÁFICOS ---
    const isMale = isChecked('gender-male');
    const genderText = isMale ? 'paciente masculino' : 'paciente femenina';
    
    report += `## DATOS DEMOGRÁFICOS\n\nSe presenta ${genderText} para evaluación endocrinológica.\n\n`;

    // --- MOTIVO DE CONSULTA ---
    report += '## MOTIVO DE CONSULTA\n\n';
    let complaints = [];
    ['fatiga-astenia', 'cambios-peso', 'polidipsia', 'poliuria', 'polifagia', 
     'intolerancia-calor', 'intolerancia-frio', 'palpitaciones', 'nerviosismo',
     'irregularidades-menstruales', 'disfuncion-erectil', 'galactorrea',
     'hirsutismo', 'alopecia', 'cambios-voz', 'dolor-oseo', 'fracturas-fragalidad',
     'cefalea', 'alteraciones-vision'].forEach(id => {
        if (isChecked(id)) {
            complaints.push(getLabelText(id).toLowerCase());
        }
    });

    if (complaints.length > 0) {
        if (complaints.length === 1) {
            report += `El paciente refiere ${complaints[0]}.\n\n`;
        } else if (complaints.length === 2) {
            report += `El paciente presenta ${complaints[0]} y ${complaints[1]}.\n\n`;
        } else {
            const lastComplaint = complaints.pop();
            report += `El paciente manifiesta ${complaints.join(', ')} y ${lastComplaint}.\n\n`;
        }
    } else if (isChecked('sin-quejas-endo')) {
        report += 'El paciente se encuentra asintomático y acude para control de rutina.\n\n';
    } else {
        report += 'El paciente acude para evaluación y seguimiento endocrinológico.\n\n';
    }

    // --- Detalles específicos de síntomas ---
    let detallesSintomas = [];
    
    // Cambios de peso
    const pesoAnterior = getInputValue('peso-anterior');
    const pesoActual = getInputValue('peso-actual');
    const tiempoCambio = getInputValue('tiempo-cambio-peso');
    if (pesoAnterior && pesoActual && tiempoCambio) {
        const cambio = parseFloat(pesoActual) - parseFloat(pesoAnterior);
        if (Math.abs(cambio) > 0) {
            const tipo = cambio > 0 ? 'aumento' : 'pérdida';
            detallesSintomas.push(`Ha presentado ${tipo} de peso de ${Math.abs(cambio).toFixed(1)} kg en ${tiempoCambio}`);
        }
    }
    
    // Detalles de pérdida/ganancia de peso
    const perdidaPeso = getInputValue('perdida-peso');
    const gananciaPeso = getInputValue('ganancia-peso');
    if (perdidaPeso) detallesSintomas.push(`Pérdida de peso: ${perdidaPeso} kg`);
    if (gananciaPeso) detallesSintomas.push(`Ganancia de peso: ${gananciaPeso} kg`);
    
    // Síntomas poliúricos
    const frecuenciaOrina = getInputValue('frecuencia-orina-dia');
    const frecuenciaNoche = getInputValue('frecuencia-orina-noche');
    const volumenUrinario = getInputValue('volumen-urinario');
    if (frecuenciaOrina || frecuenciaNoche || volumenUrinario) {
        let textoPoliuria = 'Presenta síntomas urinarios:';
        if (frecuenciaOrina) textoPoliuria += ` orina ${frecuenciaOrina} veces durante el día`;
        if (frecuenciaNoche) textoPoliuria += ` y ${frecuenciaNoche} veces durante la noche`;
        if (volumenUrinario) textoPoliuria += `, volumen aproximado ${volumenUrinario} mL`;
        detallesSintomas.push(textoPoliuria);
    }
    
    // Otros síntomas específicos
    const consumoAgua = getInputValue('consumo-agua');
    const apetito = getInputValue('apetito-cambios');
    if (consumoAgua) detallesSintomas.push(`Consumo de agua: ${consumoAgua} L/día`);
    if (apetito) detallesSintomas.push(`Cambios en el apetito: ${apetito}`);
    
    if (detallesSintomas.length > 0) {
        report += detallesSintomas.join('. ') + '.\n\n';
    }

    // --- ANTECEDENTES ---
    report += '## ANTECEDENTES MÉDICOS\n\n';
    
    // Antecedentes personales
    let antecedentesPersonales = [];
    const antecedentesList = [
        'diabetes-previa', 'hipertension-arterial', 'dislipidemia', 
        'sindrome-ovarico-poliquistico', 'enfermedad-tiroidea', 'osteoporosis', 
        'menopausia', 'fracturas-previas', 'cirugia-tiroidea'
    ];
    
    antecedentesList.forEach(id => {
        if(isChecked(id)) {
            antecedentesPersonales.push(getLabelText(id).toLowerCase());
        }
    });
    
    // Medicamentos actuales
    let medicamentos = [];
    const medicamentosList = [
        'medicamento-metformina', 'medicamento-insulina', 'medicamento-levotiroxina', 
        'medicamento-anticonceptivos', 'medicamento-antihipertensivos', 'medicamento-estatinas',
        'medicamento-corticoides', 'medicamento-antitiroideos', 'medicamento-calcio-vitamina-d',
        'medicamento-otros'
    ];
    
    medicamentosList.forEach(id => {
        if(isChecked(id)) {
            medicamentos.push(getLabelText(id).toLowerCase());
        }
    });
    
    // Antecedentes familiares
    let antecedentesFamiliares = [];
    ['familia-diabetes', 'familia-tiroides', 'familia-obesidad', 'familia-hipertension', 'familia-dislipidemia', 'familia-cardiovascular'].forEach(id => {
        if(isChecked(id)) {
            antecedentesFamiliares.push(getLabelText(id).toLowerCase());
        }
    });
    
    // Antecedentes gineco-obstétricos (para mujeres)
    let antecedentesGineco = [];
    if (!isMale) {
        const menarquia = getInputValue('edad-menarquia');
        const ciclosDias = getInputValue('ciclos-dias');
        const embarazos = getInputValue('numero-embarazos');
        const partos = getInputValue('numero-partos');
        
        if (menarquia) antecedentesGineco.push(`menarquia a los ${menarquia} años`);
        if (ciclosDias) antecedentesGineco.push(`ciclos de ${ciclosDias} días`);
        if (embarazos) antecedentesGineco.push(`${embarazos} embarazos`);
        if (partos) antecedentesGineco.push(`${partos} partos`);
        
        // Irregularidades menstruales
        let irregularidades = [];
        if (isChecked('ciclos-regulares')) irregularidades.push('ciclos regulares');
        if (isChecked('oligomenorrea')) irregularidades.push('oligomenorrea');
        if (isChecked('amenorrea')) irregularidades.push('amenorrea');
        if (isChecked('menorragia')) irregularidades.push('menorragia');
        if (isChecked('dismenorrea')) irregularidades.push('dismenorrea');
        if (isChecked('menopausia')) irregularidades.push('menopausia');
        
        if (irregularidades.length > 0) {
            antecedentesGineco.push(`presenta ${irregularidades.join(', ')}`);
        }
    }
    
    // Construir narrativa
    let narrativeAntecedentes = '';
    
    if (antecedentesPersonales.length > 0) {
        if (antecedentesPersonales.length === 1) {
            narrativeAntecedentes += `Como antecedente personal relevante presenta ${antecedentesPersonales[0]}. `;
        } else {
            const ultimo = antecedentesPersonales.pop();
            narrativeAntecedentes += `Entre sus antecedentes personales destacan ${antecedentesPersonales.join(', ')} y ${ultimo}. `;
        }
    }
    
    if (medicamentos.length > 0) {
        if (medicamentos.length === 1) {
            narrativeAntecedentes += `Actualmente en tratamiento con ${medicamentos[0]}. `;
        } else {
            const ultimoMed = medicamentos.pop();
            narrativeAntecedentes += `Su tratamiento actual incluye ${medicamentos.join(', ')} y ${ultimoMed}. `;
        }
    }
    
    if (antecedentesFamiliares.length > 0) {
        if (antecedentesFamiliares.length === 1) {
            narrativeAntecedentes += `Refiere antecedente familiar de ${antecedentesFamiliares[0]}. `;
        } else {
            const ultimoFam = antecedentesFamiliares.pop();
            narrativeAntecedentes += `En cuanto a antecedentes familiares, reporta ${antecedentesFamiliares.join(', ')} y ${ultimoFam}. `;
        }
    }
    
    if (antecedentesGineco.length > 0) {
        narrativeAntecedentes += `Antecedentes gineco-obstétricos: ${antecedentesGineco.join(', ')}. `;
    }
    
    if (narrativeAntecedentes) {
        report += narrativeAntecedentes.trim() + '\n\n';
    } else {
        report += 'No refiere antecedentes médicos de relevancia.\n\n';
    }

    // --- EXAMEN FÍSICO ---
    report += '## EXAMEN FÍSICO\n\n';
    
    // Antropometría
    const peso = getInputValue('peso-actual');
    const talla = getInputValue('talla');
    const imc = getInputValue('imc-value') || document.getElementById('imc-value')?.textContent;
    const imcInterpretation = document.getElementById('imc-classification')?.textContent || '';
    const cintura = getInputValue('circunferencia-cintura');
    const cadera = getInputValue('circunferencia-cadera');
    const whr = getInputValue('indice-cintura-cadera') || document.getElementById('whr-value')?.textContent;
    const riesgoCintura = document.getElementById('waist-risk')?.textContent || '';
    
    if (peso || talla || cintura) {
        report += '### ANTROPOMETRÍA\n\n';
        let antropometriaTexto = 'Al examen físico se encuentra paciente ';
        
        if (peso && talla) {
            antropometriaTexto += `con peso de ${peso} kg y talla de ${talla} cm, `;
            if (imc) {
                antropometriaTexto += `lo que corresponde a un IMC de ${imc} kg/m²`;
                if (imcInterpretation && imcInterpretation !== '--') {
                    antropometriaTexto += ` (${imcInterpretation.toLowerCase()})`;
                }
                antropometriaTexto += '. ';
            }
        }
        
        if (cintura) {
            antropometriaTexto += `La circunferencia de cintura es de ${cintura} cm`;
            if (riesgoCintura && riesgoCintura !== '--') {
                antropometriaTexto += ` (${riesgoCintura.toLowerCase()})`;
            }
            antropometriaTexto += '. ';
        }
        
        if (cadera && whr) {
            antropometriaTexto += `Circunferencia de cadera ${cadera} cm, con índice cintura-cadera de ${whr}. `;
        }
        
        report += antropometriaTexto + '\n\n';
    }
    
    // Signos vitales
    const presionSistolica = getInputValue('pas');
    const presionDiastolica = getInputValue('pad');
    const presionInterpretation = document.getElementById('bp-classification')?.textContent || '';
    const pulso = getInputValue('frecuencia-cardiaca');
    const temperatura = getInputValue('temperatura');
    
    if (presionSistolica || presionDiastolica || pulso || temperatura) {
        report += '### SIGNOS VITALES\n\n';
        let vitalesTexto = '';
        
        if (presionSistolica && presionDiastolica) {
            vitalesTexto += `Presión arterial de ${presionSistolica}/${presionDiastolica} mmHg`;
            if (presionInterpretation && presionInterpretation !== '--') {
                vitalesTexto += ` (${presionInterpretation.toLowerCase()})`;
            }
            vitalesTexto += '. ';
        }
        
        if (pulso) {
            vitalesTexto += `Frecuencia cardíaca de ${pulso} latidos por minuto`;
            const pulsoNum = parseInt(pulso);
            if (pulsoNum < 60) vitalesTexto += ' (bradicardia)';
            else if (pulsoNum > 100) vitalesTexto += ' (taquicardia)';
            vitalesTexto += '. ';
        }
        
        if (temperatura) {
            vitalesTexto += `Temperatura corporal de ${temperatura}°C. `;
        }
        
        report += vitalesTexto + '\n\n';
    }
    
    // Habitus y otros hallazgos físicos generales
    let habitusHallazgos = [];
    if (isChecked('habitus-normal')) habitusHallazgos.push('habitus normal');
    if (isChecked('obesidad-central')) habitusHallazgos.push('obesidad central');
    if (isChecked('hirsutismo-facial')) habitusHallazgos.push('hirsutismo facial');
    if (isChecked('acantosis-nigricans')) habitusHallazgos.push('acantosis nigricans');
    if (isChecked('ginecomastia')) habitusHallazgos.push('ginecomastia');
    if (isChecked('galactorrea-examen')) habitusHallazgos.push('galactorrea');
    if (isChecked('alopecia-androgenica')) habitusHallazgos.push('alopecia androgénica');
    if (isChecked('estrias-purpuras')) habitusHallazgos.push('estrías purpúreas');
    if (isChecked('equimosis-faciles')) habitusHallazgos.push('equimosis fáciles');
    if (isChecked('debilidad-muscular')) habitusHallazgos.push('debilidad muscular');
    
    if (habitusHallazgos.length > 0) {
        report += '### OTROS HALLAZGOS FÍSICOS\n\n';
        if (habitusHallazgos.length === 1) {
            report += `Se observa ${habitusHallazgos[0]}.\n\n`;
        } else {
            const ultimo = habitusHallazgos.pop();
            report += `Se observan ${habitusHallazgos.join(', ')} y ${ultimo}.\n\n`;
        }
    }

    // --- Examen de Tiroides ---
    const bocio = getSelectedText('grado-bocio');
    const asimetria = isChecked('asimetria');
    const masasCervicales = isChecked('masas-cervicales');
    const nodulos = isChecked('nodulos-tiroideos');
    const dolorTiroideo = isChecked('dolor-tiroideo');
    
    if (bocio || asimetria || masasCervicales || nodulos || dolorTiroideo) {
        report += '### EXAMEN DE TIROIDES\n\n';
        let tiroidesTexto = 'En el examen de la glándula tiroides se observa ';
        
        if (bocio && bocio !== 'Grado 0: no palpable ni visible') {
            tiroidesTexto += `bocio ${bocio.toLowerCase()}, `;
        } else {
            tiroidesTexto += 'glándula de tamaño normal, ';
        }
        
        if (asimetria) {
            tiroidesTexto += 'con asimetría evidente, ';
        } else {
            tiroidesTexto += 'simétrica, ';
        }
        
        if (nodulos) {
            tiroidesTexto += 'con presencia de nódulos palpables, ';
        }
        
        if (masasCervicales) {
            tiroidesTexto += 'se palpan masas cervicales, ';
        }
        
        if (dolorTiroideo) {
            tiroidesTexto += 'dolorosa a la palpación, ';
        } else {
            tiroidesTexto += 'no dolorosa, ';
        }
        
        // Remover la última coma y agregar punto
        tiroidesTexto = tiroidesTexto.replace(/, $/, '. ');
        
        report += tiroidesTexto + '\n\n';
    }

    // --- Otros hallazgos físicos ---
    let otrosHallazgos = [];
    
    // Signos de hipotiroidismo
    const signosHipotiroidismo = [];
    const signosHipoMap = {
        'bradykinesia': 'bradiquinesia',
        'dry-cold-skin': 'piel seca y fría',
        'slow-reflexes': 'reflejos tendinosos lentos',
        'puffy-face': 'facies mixedematosa',
        'brittle-hair': 'cabello quebradizo',
        'macroglossia': 'macroglosia'
    };
    
    for (const [id, text] of Object.entries(signosHipoMap)) {
        if (isChecked(id)) {
            signosHipotiroidismo.push(text);
        }
    }
    
    // Signos de hipertiroidismo
    const signosHipertiroidismo = [];
    const signosHiperMap = {
        'tremor': 'temblor fino distal',
        'warm-moist-skin': 'piel caliente y húmeda',
        'hyperactive-reflexes': 'reflejos hiperactivos',
        'exophthalmos': 'exoftalmos',
        'lid-retraction': 'retracción palpebral',
        'tachycardia': 'taquicardia'
    };
    
    for (const [id, text] of Object.entries(signosHiperMap)) {
        if (isChecked(id)) {
            signosHipertiroidismo.push(text);
        }
    }
    
    // Signos de androgenización
    const signosAndrogenicos = [];
    if (isChecked('hirsutismo-facial')) signosAndrogenicos.push('hirsutismo facial');
    if (isChecked('acne')) signosAndrogenicos.push('acné');
    if (isChecked('alopecia-androgenica')) signosAndrogenicos.push('alopecia androgénica');
    if (isChecked('virilizacion')) signosAndrogenicos.push('signos de virilización');
    
    // Signos de diabetes
    const signosDiabetes = [];
    if (isChecked('acantosis-nigricans')) signosDiabetes.push('acantosis nigricans');
    if (isChecked('ulceras-pie')) signosDiabetes.push('úlceras en pie diabético');
    if (isChecked('neuropatia-periferica')) signosDiabetes.push('signos de neuropatía periférica');
    
    if (signosHipotiroidismo.length > 0) {
        otrosHallazgos.push(`Signos compatibles con hipotiroidismo: ${signosHipotiroidismo.join(', ')}`);
    }
    
    if (signosHipertiroidismo.length > 0) {
        otrosHallazgos.push(`Signos compatibles con hipertiroidismo: ${signosHipertiroidismo.join(', ')}`);
    }
    
    if (signosAndrogenicos.length > 0) {
        otrosHallazgos.push(`Signos de hiperandrogenismo: ${signosAndrogenicos.join(', ')}`);
    }
    
    if (signosDiabetes.length > 0) {
        otrosHallazgos.push(`Hallazgos relacionados con diabetes: ${signosDiabetes.join(', ')}`);
    }
    
    if (otrosHallazgos.length > 0) {
        report += '### OTROS HALLAZGOS FÍSICOS\n\n';
        otrosHallazgos.forEach(hallazgo => {
            report += `${hallazgo}.\n\n`;
        });
    }

    // --- ANÁLISIS DE LABORATORIO ---
    report += '## ANÁLISIS DE LABORATORIO\n\n';
    
    // Metabolismo de la glucosa
    const glucosa = getInputValue('glucemia-ayunas');
    const glucosaPostprandial = getInputValue('glucemia-postprandial');
    const hba1c = getInputValue('hba1c');
    const insulina = getInputValue('insulina-basal');
    const glucosaInterp = document.getElementById('clasificacion-glucemia')?.textContent || '--';
    const hba1cInterp = document.getElementById('clasificacion-hba1c')?.textContent || '--';
    
    if (glucosa || glucosaPostprandial || hba1c || insulina) {
        report += '### METABOLISMO DE LA GLUCOSA\n\n';
        
        if (glucosa) {
            report += `La glucemia en ayunas reportada es de ${glucosa} mg/dL`;
            if (glucosaInterp !== '--') {
                report += `, lo cual se clasifica como ${glucosaInterp.toLowerCase()}`;
            }
            report += '.\n\n';
        }
        
        if (glucosaPostprandial) {
            report += `La glucemia postprandial es de ${glucosaPostprandial} mg/dL.\n\n`;
        }
        
        if (hba1c) {
            report += `La hemoglobina glicosilada (HbA1c) es de ${hba1c}%`;
            if (hba1cInterp !== '--') {
                report += `, indicando ${hba1cInterp.toLowerCase()}`;
            }
            report += '.\n\n';
        }

        if (insulina) {
            report += `La insulina basal es de ${insulina} µU/mL.\n\n`;
        }
    }

    // Perfil lipídico
    const colesterolTotal = getInputValue('colesterol-total');
    const colesterolHDL = getInputValue('colesterol-hdl');
    const colesterolLDL = getInputValue('colesterol-ldl');
    const trigliceridos = getInputValue('trigliceridos');

    if (colesterolTotal || colesterolHDL || colesterolLDL || trigliceridos) {
        report += '### PERFIL LIPÍDICO\n\n';
        if (colesterolTotal) report += `- Colesterol total: ${colesterolTotal} mg/dL\n`;
        if (colesterolHDL) report += `- Colesterol HDL: ${colesterolHDL} mg/dL\n`;
        if (colesterolLDL) report += `- Colesterol LDL: ${colesterolLDL} mg/dL\n`;
        if (trigliceridos) report += `- Triglicéridos: ${trigliceridos} mg/dL\n`;
        report += '\n';
    }
    
    // Función tiroidea
    const tsh = getInputValue('tsh');
    const t4libre = getInputValue('t4-libre');
    const t3libre = getInputValue('t3-libre');
    
    if (tsh || t4libre || t3libre) {
        report += '### FUNCIÓN TIROIDEA\n\n';
        
        if (tsh) {
            const tshNum = parseFloat(tsh);
            let interpretacion = '';
            if (tshNum < 0.4) {
                interpretacion = ' (suprimida, sugiere hipertiroidismo)';
            } else if (tshNum > 4.0) {
                interpretacion = ' (elevada, sugiere hipotiroidismo)';
            } else {
                interpretacion = ' (dentro del rango normal)';
            }
            report += `La hormona estimulante de tiroides (TSH) es de ${tsh} mUI/L${interpretacion}.\n\n`;
        }
        
        if (t4libre) {
            const t4Num = parseFloat(t4libre);
            let interpretacion = '';
            if (t4Num < 0.8) {
                interpretacion = ' (por debajo del rango normal)';
            } else if (t4Num > 1.8) {
                interpretacion = ' (por encima del rango normal)';
            } else {
                interpretacion = ' (dentro del rango normal)';
            }
            report += `La tiroxina libre (T4 libre) es de ${t4libre} ng/dL${interpretacion}.\n\n`;
        }
        
        if (t3libre) {
            const t3Num = parseFloat(t3libre);
            let interpretacion = '';
            if (t3Num < 2.3) {
                interpretacion = ' (por debajo del rango normal)';
            } else if (t3Num > 4.2) {
                interpretacion = ' (por encima del rango normal)';
            } else {
                interpretacion = ' (dentro del rango normal)';
            }
            report += `La triyodotironina libre (T3 libre) es de ${t3libre} pg/mL${interpretacion}.\n\n`;
        }
    }

    // Otras hormonas
    const testosterona = getInputValue('testosterona-total');
    const estradiol = getInputValue('estradiol');
    const prolactina = getInputValue('prolactina');
    const cortisol = getInputValue('cortisol-am');

    if (testosterona || estradiol || prolactina || cortisol) {
        report += '### OTRAS HORMONAS\n\n';
        if (testosterona) report += `- Testosterona total: ${testosterona} ng/dL\n`;
        if (estradiol) report += `- Estradiol: ${estradiol} pg/mL\n`;
        if (prolactina) report += `- Prolactina: ${prolactina} ng/mL\n`;
        if (cortisol) report += `- Cortisol AM: ${cortisol} µg/dL\n`;
        report += '\n';
    }
    
    // Escalas de evaluación
    const findrisk = document.getElementById('findrisk-score')?.textContent;
    const findriskInterp = document.getElementById('findrisk-risk')?.textContent || '--';
    const ferriman = getInputValue('ferriman-gallwey');
    const ferrimanInterp = document.getElementById('hirsutism-interpretation')?.textContent || '--';
    
    if ((findrisk && findrisk !== '0' && findrisk !== '--') || ferriman) {
        report += '### ESCALAS DE EVALUACIÓN\n\n';
        
        if (findrisk && findrisk !== '0' && findrisk !== '--') {
            report += `La escala FINDRISK para riesgo de diabetes arroja un puntaje de ${findrisk} puntos, lo que indica ${findriskInterp.toLowerCase()}.\n\n`;
        }
        
        if (ferriman) {
            report += `La escala de Ferriman-Gallwey para evaluación de hirsutismo muestra ${ferriman} puntos, ${ferrimanInterp.toLowerCase()}.\n\n`;
        }
    }
    
    // --- EVALUACIÓN REPRODUCTIVA ---
    if (!isMale) {
        // Síntomas androgénicos femeninos
        let sintomasAndrogenicos = [];
        if (isChecked('acne')) sintomasAndrogenicos.push('acné');
        if (isChecked('hirsutismo-score')) sintomasAndrogenicos.push('hirsutismo');
        if (isChecked('alopecia-androgenica-fem')) sintomasAndrogenicos.push('alopecia androgénica');
        if (isChecked('voz-grave')) sintomasAndrogenicos.push('voz grave');
        if (isChecked('clitoromegalia')) sintomasAndrogenicos.push('clitoromegalia');
        
        if (sintomasAndrogenicos.length > 0) {
            report += '### EVALUACIÓN REPRODUCTIVA\n\n';
            if (sintomasAndrogenicos.length === 1) {
                report += `Se evidencia ${sintomasAndrogenicos[0]}.\n\n`;
            } else {
                const ultimo = sintomasAndrogenicos.pop();
                report += `Se evidencian signos de androgenización: ${sintomasAndrogenicos.join(', ')} y ${ultimo}.\n\n`;
            }
        }
    } else {
        // Síntomas de hipogonadismo masculino
        let sintomasHipogonadismo = [];
        if (isChecked('libido-disminuida')) sintomasHipogonadismo.push('libido disminuida');
        if (isChecked('disfuncion-erectil-masc')) sintomasHipogonadismo.push('disfunción eréctil');
        if (isChecked('fatiga-masculina')) sintomasHipogonadismo.push('fatiga');
        if (isChecked('perdida-masa-muscular')) sintomasHipogonadismo.push('pérdida de masa muscular');
        if (isChecked('osteoporosis-masculina')) sintomasHipogonadismo.push('osteoporosis');
        if (isChecked('ginecomastia-masc')) sintomasHipogonadismo.push('ginecomastia');
        
        const volTestDer = getInputValue('volumen-testicular-der');
        const volTestIzq = getInputValue('volumen-testicular-izq');
        
        if (sintomasHipogonadismo.length > 0 || volTestDer || volTestIzq) {
            report += '### EVALUACIÓN REPRODUCTIVA\n\n';
            
            if (sintomasHipogonadismo.length > 0) {
                if (sintomasHipogonadismo.length === 1) {
                    report += `Presenta ${sintomasHipogonadismo[0]}.\n\n`;
                } else {
                    const ultimo = sintomasHipogonadismo.pop();
                    report += `Presenta síntomas de hipogonadismo: ${sintomasHipogonadismo.join(', ')} y ${ultimo}.\n\n`;
                }
            }
            
            if (volTestDer || volTestIzq) {
                let examenGenital = 'Examen genital: ';
                if (volTestDer) examenGenital += `testículo derecho ${volTestDer} mL`;
                if (volTestIzq) {
                    if (volTestDer) examenGenital += `, testículo izquierdo ${volTestIzq} mL`;
                    else examenGenital += `testículo izquierdo ${volTestIzq} mL`;
                }
                
                if (isChecked('testiculos-pequeños')) {
                    examenGenital += ' (testículos pequeños)';
                } else if (isChecked('testiculos-normales')) {
                    examenGenital += ' (testículos normales)';
                }
                
                if (isChecked('varicocele')) examenGenital += ', varicocele presente';
                if (isChecked('hidrocele')) examenGenital += ', hidrocele presente';
                
                report += examenGenital + '.\n\n';
            }
        }
    }

    // --- EVALUACIÓN METABÓLICA ADICIONAL ---
    if (isChecked('deshidratacion') || isChecked('cetoacidosis') || isChecked('pie-diabetico') ||
        isChecked('ulceras-pie') || isChecked('neuropatia-periferica') || isChecked('retinopatia') ||
        isChecked('nefropatia') || isChecked('macroangiopatia')) {
        
        report += '### EVALUACIÓN METABÓLICA ADICIONAL\n\n';
        
        // Signos de descompensación
        if (isChecked('deshidratacion')) report += '- Signos de deshidratación\n';
        if (isChecked('cetoacidosis')) report += '- Signos de cetoacidosis\n';
        
        // Examen de pies
        if (isChecked('pie-diabetico')) report += '- Pie diabético\n';
        if (isChecked('ulceras-pie')) report += '- Úlceras en pie\n';
        
        // Complicaciones diabéticas
        if (isChecked('neuropatia-periferica')) report += '- Neuropatía periférica\n';
        if (isChecked('retinopatia')) report += '- Retinopatía\n';
        if (isChecked('nefropatia')) report += '- Nefropatía\n';
        if (isChecked('macroangiopatia')) report += '- Macroangiopatía\n';
        
        report += '\n';
    }

    // --- DIAGNÓSTICOS ---
    report += '## DIAGNÓSTICOS\n\n';
    let diagnosticos = [];

    // Diabetes y prediabetes
    const glucemiaAyunas = parseFloat(getInputValue('glucemia-ayunas'));
    const hba1c_val = parseFloat(getInputValue('hba1c'));
    if (hba1c_val >= 6.5 || glucemiaAyunas >= 126) {
        diagnosticos.push('**Diabetes Mellitus Tipo 2**');
    } else if ((hba1c_val >= 5.7 && hba1c_val < 6.5) || (glucemiaAyunas >= 100 && glucemiaAyunas < 126)) {
        diagnosticos.push('**Prediabetes**');
    }

    // Dislipidemia
    const colesterolTotal_val = parseFloat(getInputValue('colesterol-total'));
    const colesterolHDL_val = parseFloat(getInputValue('colesterol-hdl'));
    const colesterolLDL_val = parseFloat(getInputValue('colesterol-ldl'));
    const trigliceridos_val = parseFloat(getInputValue('trigliceridos'));
    let dislipidemia_parts = [];
    if (colesterolTotal_val > 200) dislipidemia_parts.push('hipercolesterolemia');
    if (colesterolLDL_val > 130) dislipidemia_parts.push('LDL elevado');
    if (colesterolHDL_val < 40) dislipidemia_parts.push('HDL bajo');
    if (trigliceridos_val > 150) dislipidemia_parts.push('hipertrigliceridemia');
    
    if (dislipidemia_parts.length > 0) {
        diagnosticos.push(`**Dislipidemia mixta (${dislipidemia_parts.join(', ')})**`);
    }

    // Hipotiroidismo
    const tsh_val = parseFloat(getInputValue('tsh'));
    const t4_libre_val = parseFloat(getInputValue('t4-libre'));
    if (tsh_val > 4.0) {
        if (t4_libre_val < 0.8) {
            diagnosticos.push('**Hipotiroidismo primario clínico**');
        } else {
            diagnosticos.push('**Hipotiroidismo subclínico**');
        }
    }

    // Hipertiroidismo
    if (tsh_val < 0.4) {
         if (t4_libre_val > 1.8) {
            diagnosticos.push('**Hipertiroidismo primario clínico**');
        } else {
            diagnosticos.push('**Hipertiroidismo subclínico**');
        }
    }

    // Síndrome metabólico
    if (document.getElementById('sm-diagnosis')?.textContent?.includes('Presente')) {
        diagnosticos.push('**Síndrome metabólico**');
    }

    // Hipertensión
    const pas = parseInt(getInputValue('pas'));
    const pad = parseInt(getInputValue('pad'));
    if (pas >= 140 || pad >= 90) {
        diagnosticos.push('**Hipertensión arterial**');
    } else if (pas >= 130 || pad >= 85) {
        diagnosticos.push('**Presión arterial elevada (Pre-hipertensión)**');
    }

    // Obesidad
    const imc = parseFloat(document.getElementById('imc')?.textContent);
    if (imc >= 30) {
        let grado = 'I';
        if (imc >= 35) grado = 'II';
        if (imc >= 40) grado = 'III';
        diagnosticos.push(`**Obesidad grado ${grado}**`);
    } else if (imc >= 25) {
        diagnosticos.push('**Sobrepeso**');
    }

    // SOP
    if (isChecked('diagnostico-sop')) {
        diagnosticos.push('**Síndrome de Ovario Poliquístico (SOP)**');
    }

    // Hipogonadismo masculino
    const testosterona_val = parseFloat(getInputValue('testosterona-total'));
    if (testosterona_val < 300) {
        diagnosticos.push('**Hipogonadismo masculino**');
    }

    // Hiperprolactinemia
    const prolactina_val = parseFloat(getInputValue('prolactina'));
    if (prolactina_val > 25) {
        diagnosticos.push('**Hiperprolactinemia**');
    }

    // Dislipidemia
    if (isChecked('dislipidemia')) {
        diagnosticos.push('**Colesterol y triglicéridos muy altos**');
    }

    // Hirsutismo
    const ferrimanInterp_val = document.getElementById('hirsutism-interpretation')?.textContent || '';
    if (ferrimanInterp_val.toLowerCase().includes('severo')) {
        diagnosticos.push('**Exceso de vello facial severo**');
    }

    // Menopausia
    if (isChecked('menopausia')) {
        diagnosticos.push('**Menopausia**');
    }

    if (diagnosticos.length > 0) {
        diagnosticos.forEach((diag, index) => {
            report += `${index + 1}. ${diag}\n`;
        });
        report += '\n';
    }

    // --- PLAN DE TRATAMIENTO ---
    report += '## PLAN DE TRATAMIENTO\n\n';
    let plan = [];

    if (diagnosticos.some(d => d.includes('Diabetes') || d.includes('Prediabetes'))) {
        plan.push('**Manejo de la glucosa:** Iniciar/ajustar tratamiento farmacológico (e.g., metformina, insulina). Fomentar monitorización de glucosa en casa. Referir a un programa de educación para la diabetes.');
    }
    if (diagnosticos.some(d => d.includes('Dislipidemia'))) {
        plan.push('**Manejo de lípidos:** Iniciar/ajustar estatinas y/o fibratos. Recomendar dieta baja en grasas saturadas y colesterol.');
    }
    if (diagnosticos.some(d => d.includes('Hipotiroidismo'))) {
        plan.push('**Terapia de reemplazo tiroideo:** Iniciar/ajustar dosis de levotiroxina. Monitoreo de TSH cada 6-8 semanas hasta alcanzar el objetivo.');
    }
    if (diagnosticos.some(d => d.includes('Hipertiroidismo'))) {
        plan.push('**Manejo del hipertiroidismo:** Considerar tionamidas (metimazol), yodo radioactivo o cirugía. Beta-bloqueantes para control sintomático.');
    }
    if (diagnosticos.some(d => d.includes('Hipertensión'))) {
        plan.push('**Control de la presión arterial:** Iniciar/ajustar antihipertensivos (IECA, ARA-II, calcioantagonistas o diuréticos). Promover dieta DASH y reducción de sodio.');
    }
    if (diagnosticos.some(d => d.includes('Obesidad') || d.includes('Sobrepeso'))) {
        plan.push('**Manejo del peso:** Referir a nutricionista y programa de ejercicio. Considerar farmacoterapia o cirugía bariátrica si está indicado.');
    }
    if (diagnosticos.some(d => d.includes('SOP'))) {
        plan.push('**Manejo del SOP:** Anticonceptivos orales para regular ciclos y controlar hiperandrogenismo. Metformina para resistencia a la insulina. Fomentar la pérdida de peso.');
    }
    if (diagnosticos.some(d => d.includes('Hipogonadismo'))) {
        plan.push('**Terapia de reemplazo de testosterona:** Iniciar terapia si no hay contraindicaciones, con monitorización de hematocrito y PSA.');
    }
    if (diagnosticos.some(d => d.includes('Hiperprolactinemia'))) {
        plan.push('**Manejo de hiperprolactinemia:** Investigar causa (e.g., RMN de hipófisis). Iniciar agonistas dopaminérgicos (cabergolina, bromocriptina).');
    }

    if (plan.length > 0) {
        report += '<ul>\n';
        plan.forEach(p => {
            report += `<li>${p}</li>\n`;
        });
        report += '</ul>\n\n';
    } else {
        report += 'No se ha generado un plan de tratamiento específico basado en la información proporcionada.\n\n';
    }

    // --- ESTUDIOS ADICIONALES ---
    report += '## ESTUDIOS ADICIONALES SUGERIDOS\n\n';
    report += '<ul>\n';
    report += '<li>Hemograma completo, perfil bioquímico, perfil hepático.</li>\n';
    if (diagnosticos.some(d => d.includes('Diabetes'))) {
        report += '<li>Microalbuminuria en orina de 24 horas, fondo de ojo.</li>\n';
    }
    if (diagnosticos.some(d => d.includes('tiroidismo'))) {
        report += '<li>Anticuerpos antitiroideos (Anti-TPO, Anti-TG), ecografía tiroidea.</li>\n';
    }
    if (diagnosticos.some(d => d.includes('SOP'))) {
        report += '<li>Perfil hormonal ginecológico completo (LH, FSH, estradiol, progesterona), ecografía pélvica transvaginal.</li>\n';
    }
    if (diagnosticos.some(d => d.includes('Hipogonadismo'))) {
        report += '<li>LH, FSH, prolactina, SHBG.</li>\n';
    }
    report += '</ul>\n\n';

    // --- Resumen final ---
    const hallazgosCriticos = document.querySelectorAll('.critical-finding').length;
    report += `*Caso muy complejo con ${diagnosticos.length} diagnósticos principales, requiere manejo multidisciplinario urgente. ${hallazgosCriticos} hallazgos críticos identificados.*`;

    return report;
}

function generateTraditionalReport() {
    const getInputValue = (id) => document.getElementById(id)?.value || '';
    const isChecked = (id) => document.getElementById(id)?.checked || false;
    const getLabelText = (id) => {
        const label = document.querySelector(`label[for="${id}"]`);
        return label ? label.textContent.toLowerCase() : '';
    };

    let conclusion = 'EXAMEN ENDOCRINOLÓGICO\n\n';

    // Gender selection
    const isMale = isChecked('gender-male');
    const isFemale = isChecked('gender-female');
    if (isMale || isFemale) {
        conclusion += `GÉNERO: ${isMale ? 'Masculino' : 'Femenino'}\n\n`;
    }

    // Main complaints
    const quejas = [];
    if (isChecked('sin-quejas-endo')) {
        conclusion += 'MOTIVO DE CONSULTA: Control endocrinológico de rutina. Paciente asintomático.\n\n';
    } else {
        ['fatiga-astenia', 'cambios-peso', 'polidipsia', 'poliuria', 'polifagia', 
        'intolerancia-calor', 'intolerancia-frio', 'palpitaciones', 'nerviosismo',
        'irregularidades-menstruales', 'disfuncion-erectil', 'galactorrea',
        'hirsutismo', 'alopecia', 'cambios-voz', 'dolor-oseo', 'fracturas-fragalidad',
        'cefalea', 'alteraciones-vision'].forEach(id => {
            if (isChecked(id)) {
                quejas.push(getLabelText(id));
            }
        });
        if (quejas.length > 0) {
            conclusion += `MOTIVO DE CONSULTA: ${quejas.join(', ')}\n\n`;
        }
    }

    // Physical examination
    const imc = document.getElementById('imc-value')?.textContent;
    const imcClasificacion = document.getElementById('imc-classification')?.textContent;
    if (imc && imc !== '--') {
        conclusion += `EXAMEN FÍSICO:\n`;
        conclusion += `• IMC: ${imc} kg/m² (${imcClasificacion})\n`;
        const cintura = getInputValue('circunferencia-cintura');
        if (cintura) conclusion += `• Circunferencia cintura: ${cintura} cm\n`;
        const pa = getInputValue('pas') && getInputValue('pad') ? `${getInputValue('pas')}/${getInputValue('pad')} mmHg` : '';
        const paClass = document.getElementById('bp-classification')?.textContent;
        if (pa && paClass !== '--') conclusion += `• Presión arterial: ${pa} (${paClass})\n`;
        conclusion += '\n';
    }

    // Thyroid examination
    const tiroidesHallazgos = [];
    if (isChecked('aumento-volumen-tiroideo')) tiroidesHallazgos.push('aumento de volumen');
    if (isChecked('asimetria-tiroidea')) tiroidesHallazgos.push('asimetría');
    if (isChecked('masa-cervical')) tiroidesHallazgos.push('masa cervical');
    const gradoBocio = document.getElementById('grado-bocio')?.value;
    if (gradoBocio && gradoBocio !== '') {
        const gradoTexto = document.getElementById('grado-bocio').options[document.getElementById('grado-bocio').selectedIndex].text;
        tiroidesHallazgos.push(`bocio ${gradoTexto.toLowerCase()}`);
    }
    if (tiroidesHallazgos.length > 0) {
        conclusion += `EXAMEN TIROIDEO: ${tiroidesHallazgos.join(', ')}\n\n`;
    }

    // Metabolic evaluation
    const glucemia = getInputValue('glucemia-ayunas');
    const hba1c = getInputValue('hba1c');
    const glucemiaClass = document.getElementById('clasificacion-glucemia')?.textContent;
    const hba1cClass = document.getElementById('clasificacion-hba1c')?.textContent;
    if ((glucemia && glucemiaClass !== '--') || (hba1c && hba1cClass !== '--')) {
        conclusion += 'EVALUACIÓN METABÓLICA:\n';
        if (glucemia && glucemiaClass !== '--') conclusion += `• Glucemia ayunas: ${glucemia} mg/dL (${glucemiaClass})\n`;
        if (hba1c && hba1cClass !== '--') conclusion += `• HbA1c: ${hba1c}% (${hba1cClass})\n`;
        conclusion += '\n';
    }

    // Risk scales
    const findriskScore = document.getElementById('findrisk-score')?.textContent;
    const findriskRisk = document.getElementById('findrisk-risk')?.textContent;
    if (findriskScore && findriskScore !== '0') {
        conclusion += `ESCALAS DE RIESGO:\n`;
        conclusion += `• FINDRISK: ${findriskScore}/25 puntos (${findriskRisk})\n\n`;
    }

    // Summary
    if (alertCount > 0 || warningCount > 0) {
        conclusion += `RESUMEN:\n`;
        if (alertCount > 0) conclusion += `• Hallazgos de alerta: ${alertCount}\n`;
        if (warningCount > 0) conclusion += `• Hallazgos de atención: ${warningCount}\n`;
        conclusion += `• Total hallazgos: ${findingsCount}\n`;
        conclusion += `• Progreso del examen: ${examProgress}%\n\n`;
    }

    conclusion += 'PLAN: Pendiente de correlación clínico-laboratorial.';
    return conclusion;
}

// UPDATE DASHBOARD
function updateDashboard() {
    const sections = [
        'gender-selection', 'anamnesis', 'physical-exam', 'thyroid-exam', 
        'metabolic-evaluation', 'risk-scales', 'reproductive-evaluation'
    ];
    
    let currentCompletedSections = 0;
    let currentAlertCount = 0;
    let currentWarningCount = 0;
    let currentFindingsCount = 0;
    
    sections.forEach(sectionId => {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            const checkboxes = sectionElement.querySelectorAll('input[type="checkbox"]:checked');
            const radios = sectionElement.querySelectorAll('input[type="radio"]:checked');
            const numbers = sectionElement.querySelectorAll('input[type="number"]');
            const selects = sectionElement.querySelectorAll('select');
            
            let hasContent = false;
            if (checkboxes.length > 0 || radios.length > 0) hasContent = true;
            numbers.forEach(input => {
                if (input.value && input.value !== '0') hasContent = true;
            });
            selects.forEach(select => {
                if (select.value && select.value !== '') hasContent = true;
            });
            
            if (hasContent) {
                currentCompletedSections++;
                currentFindingsCount += (checkboxes.length + radios.length);
                
                // Check for alerts and warnings
                const interpretacionPesoText = document.getElementById('interpretacion-peso')?.textContent;
                if (interpretacionPesoText?.includes('significativa')) currentAlertCount++;
                
                const imcClassificationText = document.getElementById('imc-classification')?.textContent;
                if (imcClassificationText?.includes('Obesidad')) currentAlertCount++;
                
                const clasificacionGlucemiaText = document.getElementById('clasificacion-glucemia')?.textContent;
                if (clasificacionGlucemiaText === 'Diabetes') currentAlertCount++;
                else if (clasificacionGlucemiaText === 'Prediabetes') currentWarningCount++;
                
                // Add more specific criteria as needed
            }
        }
    });
    
    const totalSections = sections.length;
    const progress = Math.round((currentCompletedSections / totalSections) * 100);
    
    // Update dashboard elements safely
    const progressEl = document.getElementById('exam-progress');
    const sectionsEl = document.getElementById('sections-completed');
    const alertEl = document.getElementById('alert-count');
    const warningEl = document.getElementById('warning-count');
    const findingsEl = document.getElementById('findings-count');
    const metabolicEl = document.getElementById('metabolic-status');
    
    if (progressEl) progressEl.textContent = `${progress}%`;
    if (sectionsEl) sectionsEl.textContent = `${currentCompletedSections}/${totalSections}`;
    if (alertEl) alertEl.textContent = currentAlertCount;
    if (warningEl) warningEl.textContent = currentWarningCount;
    if (findingsEl) findingsEl.textContent = currentFindingsCount;
    if (metabolicEl) metabolicEl.textContent = currentAlertCount > 0 ? 'Anormal' : 'Normal';
    
    // Save global values
    examProgress = progress;
    sectionsCompleted = currentCompletedSections;
    alertCount = currentAlertCount;
    warningCount = currentWarningCount;
    findingsCount = currentFindingsCount;

    generateConclusion();
}

// Clear form
function clearForm() {
    if (confirm('¿Está seguro de que desea limpiar todos los datos del formulario?')) {
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            cb.disabled = false;
        });
        document.querySelectorAll('input[type="radio"]').forEach(rb => rb.checked = false);
        document.querySelectorAll('input[type="number"]').forEach(nb => nb.value = '');
        document.querySelectorAll('input[type="text"]').forEach(tb => tb.value = '');
        document.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
        document.querySelectorAll('textarea').forEach(ta => ta.value = '');
        
        // Reset all evaluation results
        const resetElements = [
            'interpretacion-peso', 'interpretacion-poliuria', 'imc-value', 'imc-classification',
            'whr-value', 'waist-risk', 'bp-classification', 'hr-classification',
            'clasificacion-glucemia', 'clasificacion-hba1c', 'findrisk-score', 'findrisk-risk',
            'sm-criterios', 'sm-diagnosis', 'diabetes-criterios', 'diabetes-diagnosis',
            'hirsutism-interpretation'
        ];
        
        resetElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = id.includes('score') || id.includes('criterios') ? '0' : '--';
                el.style.color = '';
            }
        });

        handleGenderSelection();
        updateDashboard();
    }
}

// Function to copy the main conclusion text to clipboard
function copyToClipboard() {
    const conclusionContent = document.getElementById('conclusion-text-traditional')?.textContent || '';
    navigator.clipboard.writeText(conclusionContent).then(() => {
        showCopyNotification();
    }).catch(err => {
        console.error('Error al copiar: ', err);
        const textArea = document.createElement('textarea');
        textArea.value = conclusionContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyNotification();
    });
}

// Function to print the main conclusion
function printConclusion() {
    const conclusion = document.getElementById('conclusion-text-traditional')?.textContent || '';
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Informe Endocrinológico</title>
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
                    border-bottom: 2px solid #2c5aa0;
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
                <h1>Informe Endocrinológico</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
                <p>Hora: ${new Date().toLocaleTimeString()}</p>
            </div>
            <pre>${conclusion}</pre>
            <div class="footer">
                <p>Generado por Sistema de Evaluación Endocrinológica Premium</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Initialization on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    }

    // Configure sidebar on window resize
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

    // Expand the first section by default
    const firstSectionHeader = document.querySelector('.section-header-main');
    if (firstSectionHeader) {
        toggleSection(firstSectionHeader);
    }

    // Ensure Endocrinology submenu is expanded on load if it's the active page
    const endoNavLink = document.getElementById('endo-nav-link');
    if (endoNavLink && endoNavLink.classList.contains('active')) {
        const endoSubMenu = document.getElementById('endo-sub-menu');
        if (endoSubMenu) {
            endoSubMenu.style.maxHeight = endoSubMenu.scrollHeight + 'px';
        }
    }

    // Initial layout update
    updateLayout();

    // Event listeners for updating dashboard and conclusion
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', updateDashboard);
        el.addEventListener('input', updateDashboard);
    });

    // Initialize all evaluations and calculations on page load
    evaluateWeightChange();
    evaluatePolyuria();
    calculateBMI();
    calculateWHR();
    evaluateWaistCircumference();
    evaluateBloodPressure();
    evaluateHeartRate();
    evaluateGoiter();
    evaluateGlucose();
    evaluateHbA1c();
    calculateFINDRISK();
    calculateMetabolicSyndrome();
    calculateDiabetesCriteria();
    evaluateHirsutism();
    
    handleGenderSelection();
    updateDashboard();

    // Show welcome message
    setTimeout(() => {
        console.log('🎉 Sistema de Evaluación Endocrinológica Premium cargado exitosamente!');
    }, 1000);
});