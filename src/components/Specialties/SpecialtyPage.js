import React, { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import RiskScales from './RiskScales';
import RheumatologyExam from './RheumatologyExam';
import './SpecialtyPage.css';

function SpecialtyPage() {
  const { specialtyName } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Estados del componente
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('anamnesis');
  const [reportSidebarOpen, setReportSidebarOpen] = useState(false);
  
  // Estados para las quejas principales
  const [complaints, setComplaints] = useState({
    // Quejas respiratorias principales
    sinQuejas: false,
    disnea: false,
    disneaOtros: '',
    tos: false,
    expectoracion: false,
    dolorToracico: false,
    dolorToracicoOtros: '',
    hemoptisis: false,
    sibilancias: false,
    ortopnea: false,
    disneaParoxistica: false,
    cianosis: false,
    ronquidos: false,
    apneas: false,
    fiebre: false,
    sudoracionNocturna: false,
    perdidaPeso: false,
    // Quejas cardiovasculares (para compatibilidad)
    palpitaciones: false,
    sincope: false,
    presincope: false,
    edema: false,
    fatiga: false,
    claudicacion: false,
    cianosisCentral: false,
    cianosisPeripherica: false,
    controlFactoresRiesgo: false,
    seguimientoCardiopatia: false,
    estudioPreoperatorio: false,
    dolorPrecordialAtipico: false,
    hipertensionArterial: false,
    dislipemia: false,
    diabetesMellitus: false,
    soploCardiaco: false,
    evaluacionRiesgoCardiovascular: false,
    otrosQuejas: ''
  });

  // Estados para electrocardiograma
  const [ecgData, setEcgData] = useState({
    // Ritmo y Frecuencia
    ritmo: '',
    frecuenciaCardiaca: '',
    regularidad: '',
    // Conducción e Intervalos
    conduccion: '',
    intervaloPR: '',
    anchoQRS: '',
    intervaloQT: '',
    // Hipertrofia
    hipertrofiaVI: false,
    hipertrofiaVD: false,
    hipertrofiaAI: false,
    hipertrofiaAD: false,
    // Cambios Isquémicos
    cambiosIsquemicos: '',
    paredAnterior: false,
    paredInferior: false,
    paredLateral: false,
    paredPosterior: false,
    septo: false
  });

  // Estados para evaluación del dolor torácico
  const [chestPainData, setChestPainData] = useState({
    intensity: 0,
    // Localización
    locationRetroesternal: false,
    locationPrecordialLeft: false,
    locationInterescapular: false,
    locationEpigastric: false,
    locationCervicalMandibular: false,
    // Calidad del dolor
    qualityOppressive: false,
    qualityStabbing: false,
    qualityBurning: false,
    qualityPleuritic: false,
    qualityDull: false,
    // Irradiación
    radiationLeftArm: false,
    radiationBothArms: false,
    radiationJaw: false,
    radiationBack: false,
    radiationEpigastrium: false,
    // Factores desencadenantes
    triggeredByExercise: false,
    triggeredByEmotions: false,
    triggeredByStress: false,
    triggeredByCold: false,
    triggeredByEating: false,
    triggeredByDecubitus: false,
    triggeredByRest: false,
    // Factores atenuantes
    relievedByRest: false,
    relievedByNitroglycerin: false,
    relievedBySitting: false,
    relievedByAntacids: false,
    relievedByNSAIDs: false,
    // Duración de episodios
    durationLess2min: false,
    duration2to10min: false,
    duration10to30min: false,
    durationMore30min: false,
    durationContinuous: false,
    // Síntomas asociados
    associatedDyspnea: false,
    associatedProfuseSweating: false,
    associatedNauseaVomiting: false,
    associatedPalpitations: false,
    associatedSyncope: false,
    associatedImpendingDoom: false
  });

  // Estados para medicación cardiovascular
  const [medications, setMedications] = useState({
    customText: '',
    selectedMeds: []
  });

  // Lista de medicamentos cardiovasculares populares
  const popularCardioMeds = [
    'Enalapril 10mg',
    'Losartán 50mg',
    'Metoprolol 50mg',
    'Atenolol 50mg',
    'Amlodipino 5mg',
    'Aspirina 100mg',
    'Clopidogrel 75mg',
    'Atorvastatina 20mg',
    'Simvastatina 20mg',
    'Furosemida 40mg',
    'Espironolactona 25mg',
    'Digoxina 0.25mg',
    'Warfarina 5mg',
    'Rivaroxabán 20mg'
  ];

  // Función para manejar selección de medicamentos
  const handleMedicationToggle = useCallback((med) => {
    setMedications(prev => ({
      ...prev,
      selectedMeds: prev.selectedMeds.includes(med)
        ? prev.selectedMeds.filter(m => m !== med)
        : [...prev.selectedMeds, med]
    }));
  }, []);

  // Función para manejar texto personalizado de medicamentos
  const handleCustomMedicationChange = useCallback((text) => {
    setMedications(prev => ({ ...prev, customText: text }));
  }, []);

  // Función para manejar cambios en campos "Otros"
  const handleOtrosChange = useCallback((field, value) => {
    if (field === 'quejas') {
      setComplaints(prev => ({ ...prev, otrosQuejas: value }));
    } else if (field === 'dolorToracicoOtros' || field === 'disneaOtros') {
      setComplaints(prev => ({ ...prev, [field]: value }));
    } else if (field === 'pulmonaryMedication') {
      setPulmonaryMedications(prev => ({ ...prev, customText: value }));
    } else {
      setAntecedentes(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  // Función para manejar cambios en medicación pulmonar
  const handlePulmonaryMedicationChange = useCallback((medication, checked) => {
    setPulmonaryMedications(prev => ({ ...prev, [medication]: checked }));
  }, []);

  // Función para manejar cambios en antecedentes pulmonares
  const handlePulmonaryHistoryChange = useCallback((condition, checked) => {
    setPulmonaryHistory(prev => ({ ...prev, [condition]: checked }));
  }, []);

  // Estados para evaluación de disnea
  const [dyspneaData, setDyspneaData] = useState({
    intensity: 0,
    exerciseTolerance: ''
  });

  // Estados para antecedentes
  const [antecedentes, setAntecedentes] = useState({
    cardiovascularesOtros: '',
    familiaresOtros: '',
    pulmonaresOtros: ''
  });

  // Estados para medicación pulmonar
  const [pulmonaryMedications, setPulmonaryMedications] = useState({
    broncodilatadores: false,
    corticoides: false,
    mucolíticos: false,
    antibióticos: false,
    oxigenoterapia: false,
    customText: ''
  });

  // Estados para antecedentes pulmonares
  const [pulmonaryHistory, setPulmonaryHistory] = useState({
    asma: false,
    epoc: false,
    neumonia: false,
    tuberculosis: false,
    fibrosisPulmonar: false,
    cancerPulmon: false,
    embolia: false,
    neumotorax: false
  });

  // Estados para características del pulso
  const [pulseData, setPulseData] = useState({
    character: '',
    arrhythmiaType: '',
    pulseDeficit: ''
  });

  // Estados para examen físico cardiovascular
  const [physicalExamData, setPhysicalExamData] = useState({
    // Inspección General
    aspectoNormal: false,
    palidez: false,
    cianosisCentral: false,
    cianosisPeripherica: false,
    diaforesis: false,
    ingurgitacionYugular: false,
    
    // Inspección de la región cardíaca
    inspeccionCardiaca: '',
    inspeccionDescripcion: '',
    
    // Palpación cardíaca
    latidoApical: '',
    latidoLocalizacion: '',
    latidoDifuso: false,
    latidoFuerte: false,
    latidoProlongado: false,
    latidoSostenido: false,
    
    // Percusión cardíaca
    limitesCardiacos: '',
    limiteDerecho: '',
    limiteIzquierdo: '',
    limiteSuperior: '',
    
    // Otros hallazgos palpatorios
    fremitoSistolico: false,
    fremitoDiastolico: false,
    levantamientoParaesternal: false,
    p2Palpable: false
  });

  // Estados para auscultación pulmonar
  const [pulmonaryAuscultationData, setPulmonaryAuscultationData] = useState({
    // Ruidos respiratorios normales - Pulmón Derecho
    ruidosDerechoApice: '',
    ruidosDerechoSuperior: '',
    ruidosDerechoMedio: '',
    ruidosDerechoInferior: '',
    
    // Ruidos respiratorios normales - Pulmón Izquierdo
    ruidosIzquierdoApice: '',
    ruidosIzquierdoSuperior: '',
    ruidosIzquierdoMedio: '',
    ruidosIzquierdoInferior: '',
    
    // Ruidos adventicios - Pulmón Derecho
    crepitantesDerechoApice: false,
    subcrepitantesDerechoApice: false,
    sibilanciasDerechoApice: false,
    roncusDerechoApice: false,
    estridorDerechoApice: false,
    rocePleuralDerechoApice: false,
    
    crepitantesDerechoSuperior: false,
    subcrepitantesDerechoSuperior: false,
    sibilanciasDerechoSuperior: false,
    roncusDerechoSuperior: false,
    estridorDerechoSuperior: false,
    rocePleuralDerechoSuperior: false,
    
    crepitantesDerechoMedio: false,
    subcrepitantesDerechoMedio: false,
    sibilanciasDerechoMedio: false,
    roncusDerechoMedio: false,
    estridorDerechoMedio: false,
    rocePleuralDerechoMedio: false,
    
    crepitantesDerechoInferior: false,
    subcrepitantesDerechoInferior: false,
    sibilanciasDerechoInferior: false,
    roncusDerechoInferior: false,
    estridorDerechoInferior: false,
    rocePleuralDerechoInferior: false,
    
    // Ruidos adventicios - Pulmón Izquierdo
    crepitantesIzquierdoApice: false,
    subcrepitantesIzquierdoApice: false,
    sibilanciasIzquierdoApice: false,
    roncusIzquierdoApice: false,
    estridorIzquierdoApice: false,
    rocePleuralIzquierdoApice: false,
    
    crepitantesIzquierdoSuperior: false,
    subcrepitantesIzquierdoSuperior: false,
    sibilanciasIzquierdoSuperior: false,
    roncusIzquierdoSuperior: false,
    estridorIzquierdoSuperior: false,
    rocePleuralIzquierdoSuperior: false,
    
    crepitantesIzquierdoMedio: false,
    subcrepitantesIzquierdoMedio: false,
    sibilanciasIzquierdoMedio: false,
    roncusIzquierdoMedio: false,
    estridorIzquierdoMedio: false,
    rocePleuralIzquierdoMedio: false,
    
    crepitantesIzquierdoInferior: false,
    subcrepitantesIzquierdoInferior: false,
    sibilanciasIzquierdoInferior: false,
    roncusIzquierdoInferior: false,
    estridorIzquierdoInferior: false,
    rocePleuralIzquierdoInferior: false
  });

  // Estados para auscultación cardíaca
  const [auscultationData, setAuscultationData] = useState({
    // Foco Aórtico
    r1Aortico: '',
    r2Aortico: '',
    soploSistAortico: false,
    soploSistAorticoGrado: '',
    soploDiastAortico: false,
    soploDiastAorticoGrado: '',
    
    // Foco Pulmonar
    r1Pulmonar: '',
    r2Pulmonar: '',
    desdoblamiento: false,
    soploSistPulmonar: false,
    soploSistPulmonarGrado: '',
    
    // Foco Tricúspide
    r1Tricuspide: '',
    r2Tricuspide: '',
    soploSistTricuspide: false,
    soploSistTricuspideGrado: '',
    
    // Foco Mitral
    r1Mitral: '',
    r2Mitral: '',
    soploSistMitral: false,
    soploSistMitralGrado: '',
    soploDiastMitral: false,
    soploDiastMitralGrado: '',
    
    // Características de soplos
    irradiacionAxila: false,
    irradiacionCuello: false,
    irradiacionEspalda: false,
    irradiacionPunta: false,
    soplosRespiracion: '',
    soplosManiobras: '',
    soplosDescripcion: '',
    
    // Otros hallazgos
    r3Galope: false,
    r4Galope: false,
    clickSistolico: false,
    chasquidoApertura: false,
    rocePericardico: false,
    arritmiaAuscultacion: false,
    soplosDescripcionGlobal: ''
  });

  // Estados para circulación periférica y edemas
  const [peripheralCirculationData, setPeripheralCirculationData] = useState({
    // Edemas
    edemasPresencia: false,
    edemasLocalizacion: '',
    edemasIntensidad: '',
    edemasSimetria: '',
    edemasFovea: '',
    edemasTemperatura: '',
    
    // Venas y piel
    estadoVenas: '',
    venasDescripcion: '',
    colorPiel: ''
  });

  // Estados para examen vascular periférico
  const [vascularPeripheralData, setVascularPeripheralData] = useState({
    // Miembros superiores derecho
    radialDer: '',
    cubitalDer: '',
    braquialDer: '',
    
    // Miembros inferiores derecho
    femoralDer: '',
    popliteoDer: '',
    tibialPostDer: '',
    pedioDer: '',
    
    // Miembros superiores izquierdo
    radialIzq: '',
    cubitalIzq: '',
    braquialIzq: '',
    
    // Miembros inferiores izquierdo
    femoralIzq: '',
    popliteoIzq: '',
    tibialPostIzq: '',
    pedioIzq: '',
    
    // Índice Tobillo-Brazo
    paBrazoDer: '',
    paBrazoIzq: '',
    paTobilloDer: '',
    paTobilloIzq: '',
    itbDerecho: '',
    itbIzquierdo: '',
    itbInterpretacion: ''
  });

  // Función para manejar cambios en características del pulso
  const handlePulseCharacterChange = useCallback((value) => {
    setPulseData(prev => ({ ...prev, character: value }));
  }, []);

  const handleArrhythmiaTypeChange = useCallback((value) => {
    setPulseData(prev => ({ ...prev, arrhythmiaType: value }));
  }, []);

  const handlePulseDeficitChange = useCallback((value) => {
    setPulseData(prev => ({ ...prev, pulseDeficit: value }));
  }, []);

  // Funciones para manejar cambios en examen físico
  const handlePhysicalExamChange = useCallback((field, value) => {
    setPhysicalExamData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePhysicalExamCheckbox = useCallback((field, checked) => {
    setPhysicalExamData(prev => ({ ...prev, [field]: checked }));
  }, []);

  // Funciones para manejar cambios en auscultación
  const handleAuscultationChange = useCallback((field, value) => {
    setAuscultationData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAuscultationCheckbox = useCallback((field, checked) => {
    setAuscultationData(prev => ({ ...prev, [field]: checked }));
  }, []);

  const handleMurmurToggle = useCallback((focus, type, checked) => {
    const fieldName = `soplo${type.charAt(0).toUpperCase() + type.slice(1)}${focus.charAt(0).toUpperCase() + focus.slice(1)}`;
    const gradeFieldName = `${fieldName}Grado`;
    
    setAuscultationData(prev => ({
      ...prev,
      [fieldName]: checked,
      [gradeFieldName]: checked ? prev[gradeFieldName] : ''
    }));
  }, []);

  // Funciones para manejar cambios en auscultación pulmonar
  const handlePulmonaryAuscultationChange = useCallback((field, value) => {
    setPulmonaryAuscultationData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePulmonaryAuscultationCheckbox = useCallback((field, checked) => {
    setPulmonaryAuscultationData(prev => ({ ...prev, [field]: checked }));
  }, []);

  const handleLungSoundChange = useCallback((lung, zone, value) => {
    const fieldName = `ruidos${lung}${zone}`;
    setPulmonaryAuscultationData(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleAdventitiousSoundToggle = useCallback((sound, lung, zone, checked) => {
    const fieldName = `${sound}${lung}${zone}`;
    setPulmonaryAuscultationData(prev => ({ ...prev, [fieldName]: checked }));
  }, []);

  // Funciones para manejar cambios en circulación periférica
  const handlePeripheralCirculationChange = useCallback((field, value) => {
    setPeripheralCirculationData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePeripheralCirculationCheckbox = useCallback((field, checked) => {
    setPeripheralCirculationData(prev => ({ ...prev, [field]: checked }));
  }, []);

  // Funciones para manejar cambios en examen vascular periférico
  const handleVascularPeripheralChange = useCallback((field, value) => {
    setVascularPeripheralData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Función para calcular ITB
  const calculateITB = useCallback(() => {
    const { paBrazoDer, paBrazoIzq, paTobilloDer, paTobilloIzq } = vascularPeripheralData;
    
    if (paBrazoDer && paTobilloDer) {
      const itbDer = (parseFloat(paTobilloDer) / parseFloat(paBrazoDer)).toFixed(2);
      setVascularPeripheralData(prev => ({ ...prev, itbDerecho: itbDer }));
    }
    
    if (paBrazoIzq && paTobilloIzq) {
      const itbIzq = (parseFloat(paTobilloIzq) / parseFloat(paBrazoIzq)).toFixed(2);
      setVascularPeripheralData(prev => ({ ...prev, itbIzquierdo: itbIzq }));
    }
    
    // Interpretación del ITB
    const itbValues = [vascularPeripheralData.itbDerecho, vascularPeripheralData.itbIzquierdo].filter(v => v);
    if (itbValues.length > 0) {
      const minITB = Math.min(...itbValues.map(parseFloat));
      let interpretacion = '';
      
      if (minITB > 1.3) {
        interpretacion = 'Calcificación arterial';
      } else if (minITB >= 0.9) {
        interpretacion = 'Normal';
      } else if (minITB >= 0.7) {
        interpretacion = 'Enfermedad arterial periférica leve';
      } else if (minITB >= 0.4) {
        interpretacion = 'Enfermedad arterial periférica moderada';
      } else {
        interpretacion = 'Enfermedad arterial periférica severa';
      }
      
      setVascularPeripheralData(prev => ({ ...prev, itbInterpretacion: interpretacion }));
    }
  }, [vascularPeripheralData]);

  // Funciones para manejar cambios en ECG
  const handleEcgChange = useCallback((field, value) => {
    setEcgData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEcgCheckbox = useCallback((field, checked) => {
    setEcgData(prev => ({ ...prev, [field]: checked }));
  }, []);

  const handleEcgRhythmChange = useCallback((value) => {
    setEcgData(prev => ({ ...prev, ritmo: value }));
  }, []);

  const handleEcgConductionChange = useCallback((value) => {
    setEcgData(prev => ({ ...prev, conduccion: value }));
  }, []);

  const handleIschemicChanges = useCallback((value) => {
    setEcgData(prev => ({ ...prev, cambiosIsquemicos: value }));
  }, []);

  // Función para manejar "Sin quejas"
  const handleNoComplaints = useCallback((checked) => {
    if (checked) {
      setComplaints({
        sinQuejas: true,
        // Quejas respiratorias principales
        disnea: false,
        disneaOtros: '',
        tos: false,
        expectoracion: false,
        dolorToracico: false,
        dolorToracicoOtros: '',
        hemoptisis: false,
        sibilancias: false,
        ortopnea: false,
        disneaParoxistica: false,
        cianosis: false,
        ronquidos: false,
        apneas: false,
        fiebre: false,
        sudoracionNocturna: false,
        perdidaPeso: false,
        // Quejas cardiovasculares (para compatibilidad)
        palpitaciones: false,
        sincope: false,
        presincope: false,
        edema: false,
        fatiga: false,
        claudicacion: false,
        cianosisCentral: false,
        cianosisPeripherica: false,
        controlFactoresRiesgo: false,
        seguimientoCardiopatia: false,
        estudioPreoperatorio: false,
        dolorPrecordialAtipico: false,
        hipertensionArterial: false,
        dislipemia: false,
        diabetesMellitus: false,
        soploCardiaco: false,
        evaluacionRiesgoCardiovascular: false,
        otrosQuejas: ''
      });
      // Reset evaluations
      setChestPainData(prev => ({ ...prev, intensity: 0, type: '' }));
      setDyspneaData(prev => ({ ...prev, intensity: 0, exerciseTolerance: '' }));
    }
  }, []);

  // Función para manejar cambios en quejas individuales
  const handleComplaintChange = useCallback((complaintKey, checked) => {
    setComplaints(prev => ({
      ...prev,
      [complaintKey]: checked,
      sinQuejas: checked ? false : prev.sinQuejas
    }));
  }, []);

  // Función para evaluar dolor torácico
  const evaluateChestPain = useCallback(() => {
    let score = 0;
    
    // Scoring based on characteristics
    if (chestPainData.type === 'opresivo') score += 2;
    if (chestPainData.triggeredByExercise) score += 2;
    if (chestPainData.relievedByRest) score += 1;
    if (chestPainData.relievedByNitroglycerin) score += 2;
    if (chestPainData.radiationLeftArm) score += 1;
    if (chestPainData.radiationJaw) score += 1;
    
    if (chestPainData.intensity >= 8) score += 1;
    else if (chestPainData.intensity <= 3) score -= 1;
    
    if (score >= 6) {
      return { text: 'Muy alta probabilidad coronaria', color: 'var(--alert-color)' };
    } else if (score >= 4) {
      return { text: 'Alta probabilidad coronaria', color: 'var(--alert-color)' };
    } else if (score >= 2) {
      return { text: 'Probabilidad intermedia', color: 'var(--warning-color)' };
    } else {
      return { text: 'Baja probabilidad coronaria', color: 'var(--normal-color)' };
    }
  }, [chestPainData]);

  // Función para evaluar NYHA
  const evaluateNYHA = useCallback(() => {
    switch(dyspneaData.exerciseTolerance) {
      case 'normal':
        return { text: 'NYHA I', color: 'var(--normal-color)' };
      case 'leve':
        return { text: 'NYHA II', color: 'var(--normal-color)' };
      case 'moderada':
        return { text: 'NYHA III', color: 'var(--warning-color)' };
      case 'severa':
      case 'reposo':
        return { text: 'NYHA IV', color: 'var(--alert-color)' };
      default:
        return { text: 'No evaluada', color: 'var(--text-color)' };
    }
  }, [dyspneaData.exerciseTolerance]);

  // Datos de especialidades
  const specialtyData = {
    cardiology: {
      name: t('specialties.cardiology'),
      icon: 'fas fa-heartbeat',
      color: '#e53e3e',
      sections: [
        { id: 'anamnesis', name: t('specialty.anamnesis'), icon: 'fas fa-clipboard-list' },
        { id: 'vital-signs', name: t('specialty.vitalSigns'), icon: 'fas fa-thermometer-half' },
        { id: 'physical-exam', name: t('specialty.physicalExam'), icon: 'fas fa-stethoscope' },
        { id: 'auscultation', name: t('specialty.auscultation'), icon: 'fas fa-headphones' },
        { id: 'peripheral-circulation', name: t('specialty.peripheralCirculation'), icon: 'fas fa-hand-paper' },
        { id: 'vascular-peripheral', name: t('specialty.vascularPeriphery'), icon: 'fas fa-project-diagram' },
        { id: 'electrocardiogram', name: t('specialty.electrocardiogram'), icon: 'fas fa-chart-line' },
        { id: 'risk-scales', name: t('specialty.riskScales'), icon: 'fas fa-calculator' }
      ]
    },
    neurology: {
      name: t('specialties.neurology'),
      icon: 'fas fa-brain',
      color: '#9f7aea',
      sections: [
        { id: 'anamnesis', name: t('specialty.anamnesis'), icon: 'fas fa-clipboard-list' },
        { id: 'vital-signs', name: t('specialty.vitalSigns'), icon: 'fas fa-thermometer-half' },
        { id: 'consciousness', name: t('specialty.consciousness'), icon: 'fas fa-eye' },
        { id: 'cranial-nerves', name: t('specialty.cranialNerves'), icon: 'fas fa-head-side-virus' },
        { id: 'motor-system', name: t('specialty.motorSystem'), icon: 'fas fa-running' },
        { id: 'sensory-system', name: t('specialty.sensorySystem'), icon: 'fas fa-hand-paper' },
        { id: 'reflexes', name: t('specialty.reflexes'), icon: 'fas fa-hammer' },
        { id: 'coordination', name: t('specialty.coordination'), icon: 'fas fa-balance-scale' },
        { id: 'meningeal-signs', name: t('specialty.meningealSigns'), icon: 'fas fa-exclamation-triangle' }
      ]
    },
    gastroenterology: {
      name: t('specialties.gastroenterology'),
      icon: 'fas fa-stomach',
      color: '#38a169',
      sections: [
        { id: 'anamnesis', name: t('specialty.anamnesis'), icon: 'fas fa-clipboard-list' },
        { id: 'vital-signs', name: t('specialty.vitalSigns'), icon: 'fas fa-thermometer-half' },
        { id: 'inspection', name: t('specialty.inspection'), icon: 'fas fa-search' },
        { id: 'palpation', name: t('specialty.palpation'), icon: 'fas fa-hand-paper' },
        { id: 'percussion', name: t('specialty.percussion'), icon: 'fas fa-hand-rock' },
        { id: 'auscultation', name: t('specialty.auscultation'), icon: 'fas fa-headphones' }
      ]
    },
    pneumology: {
      name: t('specialties.pneumology'),
      icon: 'fas fa-lungs',
      color: '#3182ce',
      sections: [
        { id: 'anamnesis', name: 'Anamnesis', icon: 'fas fa-clipboard-list' },
        { id: 'vital-signs', name: 'Signos Vitales', icon: 'fas fa-thermometer-half' },
        { id: 'inspection', name: 'Inspección', icon: 'fas fa-search' },
        { id: 'palpation', name: 'Palpación', icon: 'fas fa-hand-paper' },
        { id: 'percussion', name: 'Percusión', icon: 'fas fa-hand-rock' },
        { id: 'auscultation', name: 'Auscultación', icon: 'fas fa-headphones' },
        { id: 'respiratory-scales', name: 'Escalas de Evaluación', icon: 'fas fa-chart-line' },
        { id: 'spirometry', name: 'Espirometría', icon: 'fas fa-tachometer-alt' }
      ]
    },
    endocrinology: {
      name: t('specialties.endocrinology'),
      icon: 'fas fa-dna',
      color: '#d69e2e',
      sections: [
        { id: 'anamnesis', name: t('specialty.anamnesis'), icon: 'fas fa-clipboard-list' },
        { id: 'vital-signs', name: t('specialty.vitalSigns'), icon: 'fas fa-thermometer-half' },
        { id: 'physical-exam', name: t('specialty.physicalExam'), icon: 'fas fa-stethoscope' },
        { id: 'thyroid', name: t('specialty.thyroid'), icon: 'fas fa-circle' },
        { id: 'metabolic', name: t('specialty.metabolic'), icon: 'fas fa-chart-line' }
      ]
    },
    dermatology: {
      name: t('specialties.dermatology'),
      icon: 'fas fa-hand-paper',
      color: '#ed8936',
      sections: [
        { id: 'anamnesis', name: t('specialty.anamnesis'), icon: 'fas fa-clipboard-list' },
        { id: 'vital-signs', name: t('specialty.vitalSigns'), icon: 'fas fa-thermometer-half' },
        { id: 'skin-inspection', name: t('specialty.skinInspection'), icon: 'fas fa-search' },
        { id: 'lesion-analysis', name: t('specialty.lesionAnalysis'), icon: 'fas fa-microscope' }
      ]
    },
    urology: {
      name: t('specialties.urology'),
      icon: 'fas fa-kidneys',
      color: '#38b2ac',
      sections: [
        { id: 'anamnesis', name: t('specialty.anamnesis'), icon: 'fas fa-clipboard-list' },
        { id: 'vital-signs', name: t('specialty.vitalSigns'), icon: 'fas fa-thermometer-half' },
        { id: 'physical-exam', name: t('specialty.physicalExam'), icon: 'fas fa-stethoscope' },
        { id: 'urogenital', name: t('specialty.urogenital'), icon: 'fas fa-user-md' }
      ]
    },
    rheumatology: {
      name: 'Reumatología',
      icon: 'fas fa-bone',
      color: '#e53e3e',
      sections: [
        { id: 'anamnesis', name: 'Anamnesis', icon: 'fas fa-clipboard-list' },
        { id: 'vital-signs', name: 'Signos Vitales', icon: 'fas fa-thermometer-half' },
        { id: 'joint-examination', name: 'Examen Articular', icon: 'fas fa-bone' },
        { id: 'disease-activity', name: 'Actividad de Enfermedad', icon: 'fas fa-chart-line' },
        { id: 'special-tests', name: 'Pruebas Especiales', icon: 'fas fa-stethoscope' },
        { id: 'diagnostic-criteria', name: 'Criterios Diagnósticos', icon: 'fas fa-syringe' },
        { id: 'risk-scales', name: 'Escalas de Riesgo', icon: 'fas fa-calculator' }
      ]
    }
  };

  const currentSpecialty = specialtyData[specialtyName] || {
    name: t('specialty.specialty'),
    icon: 'fas fa-stethoscope',
    color: '#667eea',
    sections: [
      { id: 'anamnesis', name: t('specialty.anamnesis'), icon: 'fas fa-clipboard-list' },
      { id: 'vital-signs', name: t('specialty.vitalSigns'), icon: 'fas fa-thermometer-half' },
      { id: 'examination', name: t('specialty.examination'), icon: 'fas fa-search' }
    ]
  };

  // Renderizar contenido de sección
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'anamnesis':
        if (specialtyName === 'rheumatology') {
          return (
            <div className="section-content">
              <h3><i className="fas fa-user-edit"></i> Anamnesis y Quejas Principales</h3>
              
              {/* Quejas Reumatológicas Principales */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">
                  <i className="fas fa-clipboard-list"></i> Quejas Reumatológicas Principales
                </h4>
                <div className="form-grid">
                  <div className="form-item">
                    <input type="checkbox" id="sin-quejas-reuma" />
                    <label htmlFor="sin-quejas-reuma">Sin quejas</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="dolor-articular" />
                    <label htmlFor="dolor-articular">Dolor articular</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="rigidez-matutina" />
                    <label htmlFor="rigidez-matutina">Rigidez matutina</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="inflamacion-articular" />
                    <label htmlFor="inflamacion-articular">Inflamación articular</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="limitacion-funcional" />
                    <label htmlFor="limitacion-funcional">Limitación funcional</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="fatiga" />
                    <label htmlFor="fatiga">Fatiga</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="dolor-muscular" />
                    <label htmlFor="dolor-muscular">Dolor muscular</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="debilidad-muscular" />
                    <label htmlFor="debilidad-muscular">Debilidad muscular</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="dolor-lumbar" />
                    <label htmlFor="dolor-lumbar">Dolor lumbar</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="deformidades" />
                    <label htmlFor="deformidades">Deformidades</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="fenomeno-raynaud" />
                    <label htmlFor="fenomeno-raynaud">Fenómeno de Raynaud</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="sequedad-ocular" />
                    <label htmlFor="sequedad-ocular">Sequedad ocular</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="rash-cutaneo" />
                    <label htmlFor="rash-cutaneo">Rash cutáneo</label>
                  </div>
                </div>
              </div>
              
              {/* Características del Dolor */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">
                  <i className="fas fa-hand-holding-heart"></i> Características del Dolor Articular
                </h4>
                <div className="pain-assessment">
                  <h5>Intensidad del Dolor (EVA)</h5>
                  <div className="form-group">
                    <label>Dolor general:</label>
                    <input type="range" min="0" max="10" defaultValue="0" className="range-input" />
                    <span>0/10</span>
                  </div>
                  <div className="form-group">
                    <label>Dolor en reposo:</label>
                    <input type="range" min="0" max="10" defaultValue="0" className="range-input" />
                    <span>0/10</span>
                  </div>
                  <div className="form-group">
                    <label>Dolor al movimiento:</label>
                    <input type="range" min="0" max="10" defaultValue="0" className="range-input" />
                    <span>0/10</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <h5>Tipo de Dolor</h5>
                  <div className="radio-group">
                    <div className="form-item">
                      <input type="radio" name="tipo-dolor" id="mecanico" value="mecanico" />
                      <label htmlFor="mecanico">Mecánico (mejora con reposo)</label>
                    </div>
                    <div className="form-item">
                      <input type="radio" name="tipo-dolor" id="inflamatorio" value="inflamatorio" />
                      <label htmlFor="inflamatorio">Inflamatorio (empeora con reposo)</label>
                    </div>
                    <div className="form-item">
                      <input type="radio" name="tipo-dolor" id="mixto" value="mixto" />
                      <label htmlFor="mixto">Mixto</label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Antecedentes Familiares */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">
                  <i className="fas fa-users"></i> Antecedentes Familiares
                </h4>
                <div className="form-grid">
                  <div className="form-item">
                    <input type="checkbox" id="artritis-reumatoide" />
                    <label htmlFor="artritis-reumatoide">Artritis reumatoide</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="lupus" />
                    <label htmlFor="lupus">Lupus eritematoso sistémico</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="espondiloartritis" />
                    <label htmlFor="espondiloartritis">Espondiloartritis</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="psoriasis" />
                    <label htmlFor="psoriasis">Psoriasis</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="enfermedad-inflamatoria" />
                    <label htmlFor="enfermedad-inflamatoria">Enfermedad inflamatoria intestinal</label>
                  </div>
                </div>
              </div>

              {/* Auscultación Pulmonar */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">
                  <i className="fas fa-stethoscope"></i> Auscultación Pulmonar
                </h4>
                
                {/* Ruidos Respiratorios Normales */}
                <div className="exam-container">
                  <h5 className="exam-header">
                    <i className="fas fa-volume-up"></i> Ruidos Respiratorios Normales
                  </h5>
                  <div className="lung-map">
                    {/* Pulmón Derecho */}
                    <div className="lung-side">
                      <h6>Pulmón Derecho</h6>
                      
                      {/* Ápice Derecho */}
                      <div className="lung-zone">
                        <strong>Ápice</strong>
                        <div className="radio-group">
                          <label><input type="radio" name="ruidos-der-apice" value="vesicular" checked={pulmonaryAuscultationData.ruidosDerechoApice === 'vesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Apice', e.target.value)} />Vesicular</label>
                          <label><input type="radio" name="ruidos-der-apice" value="bronquial" checked={pulmonaryAuscultationData.ruidosDerechoApice === 'bronquial'} onChange={(e) => handleLungSoundChange('Derecho', 'Apice', e.target.value)} />Bronquial</label>
                          <label><input type="radio" name="ruidos-der-apice" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosDerechoApice === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Apice', e.target.value)} />Broncovesicular</label>
                          <label><input type="radio" name="ruidos-der-apice" value="disminuido" checked={pulmonaryAuscultationData.ruidosDerechoApice === 'disminuido'} onChange={(e) => handleLungSoundChange('Derecho', 'Apice', e.target.value)} />Disminuido</label>
                          <label><input type="radio" name="ruidos-der-apice" value="abolido" checked={pulmonaryAuscultationData.ruidosDerechoApice === 'abolido'} onChange={(e) => handleLungSoundChange('Derecho', 'Apice', e.target.value)} />Abolido</label>
                        </div>
                      </div>
                      
                      {/* Campo Superior Derecho */}
                      <div className="lung-zone">
                        <strong>Campo Superior</strong>
                        <div className="radio-group">
                          <label><input type="radio" name="ruidos-der-superior" value="vesicular" checked={pulmonaryAuscultationData.ruidosDerechoSuperior === 'vesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Superior', e.target.value)} />Vesicular</label>
                          <label><input type="radio" name="ruidos-der-superior" value="bronquial" checked={pulmonaryAuscultationData.ruidosDerechoSuperior === 'bronquial'} onChange={(e) => handleLungSoundChange('Derecho', 'Superior', e.target.value)} />Bronquial</label>
                          <label><input type="radio" name="ruidos-der-superior" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosDerechoSuperior === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Superior', e.target.value)} />Broncovesicular</label>
                          <label><input type="radio" name="ruidos-der-superior" value="disminuido" checked={pulmonaryAuscultationData.ruidosDerechoSuperior === 'disminuido'} onChange={(e) => handleLungSoundChange('Derecho', 'Superior', e.target.value)} />Disminuido</label>
                          <label><input type="radio" name="ruidos-der-superior" value="abolido" checked={pulmonaryAuscultationData.ruidosDerechoSuperior === 'abolido'} onChange={(e) => handleLungSoundChange('Derecho', 'Superior', e.target.value)} />Abolido</label>
                        </div>
                      </div>
                      
                      {/* Campo Medio Derecho */}
                      <div className="lung-zone">
                        <strong>Campo Medio</strong>
                        <div className="radio-group">
                          <label><input type="radio" name="ruidos-der-medio" value="vesicular" checked={pulmonaryAuscultationData.ruidosDerechoMedio === 'vesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Medio', e.target.value)} />Vesicular</label>
                          <label><input type="radio" name="ruidos-der-medio" value="bronquial" checked={pulmonaryAuscultationData.ruidosDerechoMedio === 'bronquial'} onChange={(e) => handleLungSoundChange('Derecho', 'Medio', e.target.value)} />Bronquial</label>
                          <label><input type="radio" name="ruidos-der-medio" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosDerechoMedio === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Medio', e.target.value)} />Broncovesicular</label>
                          <label><input type="radio" name="ruidos-der-medio" value="disminuido" checked={pulmonaryAuscultationData.ruidosDerechoMedio === 'disminuido'} onChange={(e) => handleLungSoundChange('Derecho', 'Medio', e.target.value)} />Disminuido</label>
                          <label><input type="radio" name="ruidos-der-medio" value="abolido" checked={pulmonaryAuscultationData.ruidosDerechoMedio === 'abolido'} onChange={(e) => handleLungSoundChange('Derecho', 'Medio', e.target.value)} />Abolido</label>
                        </div>
                      </div>
                      
                      {/* Campo Inferior Derecho */}
                      <div className="lung-zone">
                        <strong>Campo Inferior</strong>
                        <div className="radio-group">
                          <label><input type="radio" name="ruidos-der-inferior" value="vesicular" checked={pulmonaryAuscultationData.ruidosDerechoInferior === 'vesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Inferior', e.target.value)} />Vesicular</label>
                          <label><input type="radio" name="ruidos-der-inferior" value="bronquial" checked={pulmonaryAuscultationData.ruidosDerechoInferior === 'bronquial'} onChange={(e) => handleLungSoundChange('Derecho', 'Inferior', e.target.value)} />Bronquial</label>
                          <label><input type="radio" name="ruidos-der-inferior" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosDerechoInferior === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Inferior', e.target.value)} />Broncovesicular</label>
                          <label><input type="radio" name="ruidos-der-inferior" value="disminuido" checked={pulmonaryAuscultationData.ruidosDerechoInferior === 'disminuido'} onChange={(e) => handleLungSoundChange('Derecho', 'Inferior', e.target.value)} />Disminuido</label>
                          <label><input type="radio" name="ruidos-der-inferior" value="abolido" checked={pulmonaryAuscultationData.ruidosDerechoInferior === 'abolido'} onChange={(e) => handleLungSoundChange('Derecho', 'Inferior', e.target.value)} />Abolido</label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pulmón Izquierdo */}
                    <div className="lung-side">
                      <h6>Pulmón Izquierdo</h6>
                      
                      {/* Ápice Izquierdo */}
                      <div className="lung-zone">
                        <strong>Ápice</strong>
                        <div className="radio-group">
                          <label><input type="radio" name="ruidos-izq-apice" value="vesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoApice === 'vesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Apice', e.target.value)} />Vesicular</label>
                          <label><input type="radio" name="ruidos-izq-apice" value="bronquial" checked={pulmonaryAuscultationData.ruidosIzquierdoApice === 'bronquial'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Apice', e.target.value)} />Bronquial</label>
                          <label><input type="radio" name="ruidos-izq-apice" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoApice === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Apice', e.target.value)} />Broncovesicular</label>
                          <label><input type="radio" name="ruidos-izq-apice" value="disminuido" checked={pulmonaryAuscultationData.ruidosIzquierdoApice === 'disminuido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Apice', e.target.value)} />Disminuido</label>
                          <label><input type="radio" name="ruidos-izq-apice" value="abolido" checked={pulmonaryAuscultationData.ruidosIzquierdoApice === 'abolido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Apice', e.target.value)} />Abolido</label>
                        </div>
                      </div>
                      
                      {/* Campo Superior Izquierdo */}
                      <div className="lung-zone">
                        <strong>Campo Superior</strong>
                        <div className="radio-group">
                          <label><input type="radio" name="ruidos-izq-superior" value="vesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoSuperior === 'vesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Superior', e.target.value)} />Vesicular</label>
                          <label><input type="radio" name="ruidos-izq-superior" value="bronquial" checked={pulmonaryAuscultationData.ruidosIzquierdoSuperior === 'bronquial'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Superior', e.target.value)} />Bronquial</label>
                          <label><input type="radio" name="ruidos-izq-superior" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoSuperior === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Superior', e.target.value)} />Broncovesicular</label>
                          <label><input type="radio" name="ruidos-izq-superior" value="disminuido" checked={pulmonaryAuscultationData.ruidosIzquierdoSuperior === 'disminuido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Superior', e.target.value)} />Disminuido</label>
                          <label><input type="radio" name="ruidos-izq-superior" value="abolido" checked={pulmonaryAuscultationData.ruidosIzquierdoSuperior === 'abolido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Superior', e.target.value)} />Abolido</label>
                        </div>
                      </div>
                      
                      {/* Campo Medio Izquierdo */}
                      <div className="lung-zone">
                        <strong>Campo Medio</strong>
                        <div className="radio-group">
                          <label><input type="radio" name="ruidos-izq-medio" value="vesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoMedio === 'vesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Medio', e.target.value)} />Vesicular</label>
                          <label><input type="radio" name="ruidos-izq-medio" value="bronquial" checked={pulmonaryAuscultationData.ruidosIzquierdoMedio === 'bronquial'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Medio', e.target.value)} />Bronquial</label>
                          <label><input type="radio" name="ruidos-izq-medio" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoMedio === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Medio', e.target.value)} />Broncovesicular</label>
                          <label><input type="radio" name="ruidos-izq-medio" value="disminuido" checked={pulmonaryAuscultationData.ruidosIzquierdoMedio === 'disminuido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Medio', e.target.value)} />Disminuido</label>
                          <label><input type="radio" name="ruidos-izq-medio" value="abolido" checked={pulmonaryAuscultationData.ruidosIzquierdoMedio === 'abolido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Medio', e.target.value)} />Abolido</label>
                        </div>
                      </div>
                      
                      {/* Campo Inferior Izquierdo */}
                      <div className="lung-zone">
                        <strong>Campo Inferior</strong>
                        <div className="radio-group">
                          <label><input type="radio" name="ruidos-izq-inferior" value="vesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoInferior === 'vesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Inferior', e.target.value)} />Vesicular</label>
                          <label><input type="radio" name="ruidos-izq-inferior" value="bronquial" checked={pulmonaryAuscultationData.ruidosIzquierdoInferior === 'bronquial'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Inferior', e.target.value)} />Bronquial</label>
                          <label><input type="radio" name="ruidos-izq-inferior" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoInferior === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Inferior', e.target.value)} />Broncovesicular</label>
                          <label><input type="radio" name="ruidos-izq-inferior" value="disminuido" checked={pulmonaryAuscultationData.ruidosIzquierdoInferior === 'disminuido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Inferior', e.target.value)} />Disminuido</label>
                          <label><input type="radio" name="ruidos-izq-inferior" value="abolido" checked={pulmonaryAuscultationData.ruidosIzquierdoInferior === 'abolido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Inferior', e.target.value)} />Abolido</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ruidos Adventicios */}
                <div className="exam-container">
                  <h5 className="exam-header">
                    <i className="fas fa-exclamation-triangle"></i> Ruidos Adventicios
                  </h5>
                  <div className="lung-map">
                    {/* Pulmón Derecho - Ruidos Adventicios */}
                    <div className="lung-side">
                      <h6>Pulmón Derecho</h6>
                      
                      {/* Ápice Derecho - Adventicios */}
                      <div className="lung-zone">
                        <strong>Ápice</strong>
                        <div className="checkbox-group">
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesDerechoApice} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Derecho', 'Apice', e.target.checked)} />Crepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesDerechoApice} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Derecho', 'Apice', e.target.checked)} />Subcrepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasDerechoApice} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Derecho', 'Apice', e.target.checked)} />Sibilancias</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusDerechoApice} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Derecho', 'Apice', e.target.checked)} />Roncus</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorDerechoApice} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Derecho', 'Apice', e.target.checked)} />Estridor</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralDerechoApice} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Derecho', 'Apice', e.target.checked)} />Roce pleural</label>
                        </div>
                      </div>
                      
                      {/* Campo Superior Derecho - Adventicios */}
                      <div className="lung-zone">
                        <strong>Campo Superior</strong>
                        <div className="checkbox-group">
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesDerechoSuperior} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Derecho', 'Superior', e.target.checked)} />Crepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesDerechoSuperior} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Derecho', 'Superior', e.target.checked)} />Subcrepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasDerechoSuperior} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Derecho', 'Superior', e.target.checked)} />Sibilancias</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusDerechoSuperior} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Derecho', 'Superior', e.target.checked)} />Roncus</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorDerechoSuperior} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Derecho', 'Superior', e.target.checked)} />Estridor</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralDerechoSuperior} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Derecho', 'Superior', e.target.checked)} />Roce pleural</label>
                        </div>
                      </div>
                      
                      {/* Campo Medio Derecho - Adventicios */}
                      <div className="lung-zone">
                        <strong>Campo Medio</strong>
                        <div className="checkbox-group">
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesDerechoMedio} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Derecho', 'Medio', e.target.checked)} />Crepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesDerechoMedio} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Derecho', 'Medio', e.target.checked)} />Subcrepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasDerechoMedio} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Derecho', 'Medio', e.target.checked)} />Sibilancias</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusDerechoMedio} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Derecho', 'Medio', e.target.checked)} />Roncus</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorDerechoMedio} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Derecho', 'Medio', e.target.checked)} />Estridor</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralDerechoMedio} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Derecho', 'Medio', e.target.checked)} />Roce pleural</label>
                        </div>
                      </div>
                      
                      {/* Campo Inferior Derecho - Adventicios */}
                      <div className="lung-zone">
                        <strong>Campo Inferior</strong>
                        <div className="checkbox-group">
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesDerechoInferior} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Derecho', 'Inferior', e.target.checked)} />Crepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesDerechoInferior} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Derecho', 'Inferior', e.target.checked)} />Subcrepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasDerechoInferior} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Derecho', 'Inferior', e.target.checked)} />Sibilancias</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusDerechoInferior} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Derecho', 'Inferior', e.target.checked)} />Roncus</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorDerechoInferior} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Derecho', 'Inferior', e.target.checked)} />Estridor</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralDerechoInferior} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Derecho', 'Inferior', e.target.checked)} />Roce pleural</label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pulmón Izquierdo - Ruidos Adventicios */}
                    <div className="lung-side">
                      <h6>Pulmón Izquierdo</h6>
                      
                      {/* Ápice Izquierdo - Adventicios */}
                      <div className="lung-zone">
                        <strong>Ápice</strong>
                        <div className="checkbox-group">
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesIzquierdoApice} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Izquierdo', 'Apice', e.target.checked)} />Crepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesIzquierdoApice} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Izquierdo', 'Apice', e.target.checked)} />Subcrepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasIzquierdoApice} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Izquierdo', 'Apice', e.target.checked)} />Sibilancias</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusIzquierdoApice} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Izquierdo', 'Apice', e.target.checked)} />Roncus</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorIzquierdoApice} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Izquierdo', 'Apice', e.target.checked)} />Estridor</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralIzquierdoApice} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Izquierdo', 'Apice', e.target.checked)} />Roce pleural</label>
                        </div>
                      </div>
                      
                      {/* Campo Superior Izquierdo - Adventicios */}
                      <div className="lung-zone">
                        <strong>Campo Superior</strong>
                        <div className="checkbox-group">
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesIzquierdoSuperior} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Izquierdo', 'Superior', e.target.checked)} />Crepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesIzquierdoSuperior} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Izquierdo', 'Superior', e.target.checked)} />Subcrepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasIzquierdoSuperior} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Izquierdo', 'Superior', e.target.checked)} />Sibilancias</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusIzquierdoSuperior} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Izquierdo', 'Superior', e.target.checked)} />Roncus</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorIzquierdoSuperior} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Izquierdo', 'Superior', e.target.checked)} />Estridor</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralIzquierdoSuperior} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Izquierdo', 'Superior', e.target.checked)} />Roce pleural</label>
                        </div>
                      </div>
                      
                      {/* Campo Medio Izquierdo - Adventicios */}
                      <div className="lung-zone">
                        <strong>Campo Medio</strong>
                        <div className="checkbox-group">
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesIzquierdoMedio} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Izquierdo', 'Medio', e.target.checked)} />Crepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesIzquierdoMedio} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Izquierdo', 'Medio', e.target.checked)} />Subcrepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasIzquierdoMedio} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Izquierdo', 'Medio', e.target.checked)} />Sibilancias</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusIzquierdoMedio} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Izquierdo', 'Medio', e.target.checked)} />Roncus</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorIzquierdoMedio} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Izquierdo', 'Medio', e.target.checked)} />Estridor</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralIzquierdoMedio} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Izquierdo', 'Medio', e.target.checked)} />Roce pleural</label>
                        </div>
                      </div>
                      
                      {/* Campo Inferior Izquierdo - Adventicios */}
                      <div className="lung-zone">
                        <strong>Campo Inferior</strong>
                        <div className="checkbox-group">
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesIzquierdoInferior} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Izquierdo', 'Inferior', e.target.checked)} />Crepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesIzquierdoInferior} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Izquierdo', 'Inferior', e.target.checked)} />Subcrepitantes</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasIzquierdoInferior} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Izquierdo', 'Inferior', e.target.checked)} />Sibilancias</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusIzquierdoInferior} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Izquierdo', 'Inferior', e.target.checked)} />Roncus</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorIzquierdoInferior} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Izquierdo', 'Inferior', e.target.checked)} />Estridor</label>
                          <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralIzquierdoInferior} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Izquierdo', 'Inferior', e.target.checked)} />Roce pleural</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        if (specialtyName === 'pneumology') {
          return (
            <div className="section-content">
              <h3><i className="fas fa-user-edit"></i> Anamnesis y Quejas Principales</h3>
              
              {/* Quejas Respiratorias Principales */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">
                  <i className="fas fa-lungs"></i> Quejas Respiratorias Principales
                </h4>
                <div className="form-grid">
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="sin-quejas-resp"
                      checked={complaints.sinQuejas}
                      onChange={(e) => handleNoComplaints(e.target.checked)}
                    />
                    <label htmlFor="sin-quejas-resp">Sin quejas</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="disnea-resp"
                      checked={complaints.disnea}
                      onChange={(e) => handleComplaintChange('disnea', e.target.checked)}
                    />
                    <label htmlFor="disnea-resp">Disnea</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="tos-resp"
                      checked={complaints.tos}
                      onChange={(e) => handleComplaintChange('tos', e.target.checked)}
                    />
                    <label htmlFor="tos-resp">Tos</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="expectoracion-resp"
                      checked={complaints.expectoracion}
                      onChange={(e) => handleComplaintChange('expectoracion', e.target.checked)}
                    />
                    <label htmlFor="expectoracion-resp">Expectoración</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="dolor-toracico-resp"
                      checked={complaints.dolorToracico}
                      onChange={(e) => handleComplaintChange('dolorToracico', e.target.checked)}
                    />
                    <label htmlFor="dolor-toracico-resp">Dolor torácico</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="hemoptisis-resp"
                      checked={complaints.hemoptisis}
                      onChange={(e) => handleComplaintChange('hemoptisis', e.target.checked)}
                    />
                    <label htmlFor="hemoptisis-resp">Hemoptisis</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="sibilancias-resp"
                      checked={complaints.sibilancias}
                      onChange={(e) => handleComplaintChange('sibilancias', e.target.checked)}
                    />
                    <label htmlFor="sibilancias-resp">Sibilancias</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="ortopnea-resp"
                      checked={complaints.ortopnea}
                      onChange={(e) => handleComplaintChange('ortopnea', e.target.checked)}
                    />
                    <label htmlFor="ortopnea-resp">Ortopnea</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="disnea-paroxistica-resp"
                      checked={complaints.disneaParoxistica}
                      onChange={(e) => handleComplaintChange('disneaParoxistica', e.target.checked)}
                    />
                    <label htmlFor="disnea-paroxistica-resp">Disnea paroxística nocturna</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="cianosis-resp"
                      checked={complaints.cianosis}
                      onChange={(e) => handleComplaintChange('cianosis', e.target.checked)}
                    />
                    <label htmlFor="cianosis-resp">Cianosis</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="ronquidos-resp"
                      checked={complaints.ronquidos}
                      onChange={(e) => handleComplaintChange('ronquidos', e.target.checked)}
                    />
                    <label htmlFor="ronquidos-resp">Ronquidos</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="apneas-resp"
                      checked={complaints.apneas}
                      onChange={(e) => handleComplaintChange('apneas', e.target.checked)}
                    />
                    <label htmlFor="apneas-resp">Pausas respiratorias</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="fiebre-resp"
                      checked={complaints.fiebre}
                      onChange={(e) => handleComplaintChange('fiebre', e.target.checked)}
                    />
                    <label htmlFor="fiebre-resp">Fiebre</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="sudoracion-resp"
                      checked={complaints.sudoracionNocturna}
                      onChange={(e) => handleComplaintChange('sudoracionNocturna', e.target.checked)}
                    />
                    <label htmlFor="sudoracion-resp">Sudoración nocturna</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="perdida-peso-resp"
                      checked={complaints.perdidaPeso}
                      onChange={(e) => handleComplaintChange('perdidaPeso', e.target.checked)}
                    />
                    <label htmlFor="perdida-peso-resp">Pérdida de peso</label>
                  </div>
                </div>
              </div>

              {/* Campo Otros para Quejas Respiratorias */}
              <div className="form-group otros-field">
                <label htmlFor="quejas-otros-resp">Otros:</label>
                <input 
                  type="text" 
                  id="quejas-otros-resp"
                  value={complaints.otrosQuejas}
                  onChange={(e) => handleOtrosChange('quejas', e.target.value)}
                  placeholder="Otras quejas respiratorias..."
                />
              </div>

              {/* Medicación Pulmonar Actual */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">
                  <i className="fas fa-pills"></i> Medicación Pulmonar Actual
                </h4>
                <div className="form-grid">
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="broncodilatadores-pneu"
                      checked={pulmonaryMedications.broncodilatadores}
                      onChange={(e) => handlePulmonaryMedicationChange('broncodilatadores', e.target.checked)}
                    />
                    <label htmlFor="broncodilatadores-pneu">Broncodilatadores</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="corticoides-pneu"
                      checked={pulmonaryMedications.corticoides}
                      onChange={(e) => handlePulmonaryMedicationChange('corticoides', e.target.checked)}
                    />
                    <label htmlFor="corticoides-pneu">Corticoides</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="mucoliticos-pneu"
                      checked={pulmonaryMedications.mucolíticos}
                      onChange={(e) => handlePulmonaryMedicationChange('mucolíticos', e.target.checked)}
                    />
                    <label htmlFor="mucoliticos-pneu">Mucolíticos</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="antibioticos-pneu"
                      checked={pulmonaryMedications.antibióticos}
                      onChange={(e) => handlePulmonaryMedicationChange('antibióticos', e.target.checked)}
                    />
                    <label htmlFor="antibioticos-pneu">Antibióticos</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="oxigenoterapia-pneu"
                      checked={pulmonaryMedications.oxigenoterapia}
                      onChange={(e) => handlePulmonaryMedicationChange('oxigenoterapia', e.target.checked)}
                    />
                    <label htmlFor="oxigenoterapia-pneu">Oxigenoterapia</label>
                  </div>
                </div>
                <div className="form-group otros-field">
                  <label htmlFor="medicacion-otros-pneu">Otros:</label>
                  <input 
                    type="text" 
                    id="medicacion-otros-pneu"
                    value={pulmonaryMedications.customText}
                    onChange={(e) => handlePulmonaryMedicationChange('customText', e.target.value)}
                    placeholder="Otra medicación pulmonar..."
                  />
                </div>
              </div>

              {/* Antecedentes Pulmonares */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">
                  <i className="fas fa-history"></i> Antecedentes Pulmonares
                </h4>
                <div className="form-grid">
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="asma-pneu"
                      checked={pulmonaryHistory.asma}
                      onChange={(e) => handlePulmonaryHistoryChange('asma', e.target.checked)}
                    />
                    <label htmlFor="asma-pneu">Asma</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="epoc-pneu"
                      checked={pulmonaryHistory.epoc}
                      onChange={(e) => handlePulmonaryHistoryChange('epoc', e.target.checked)}
                    />
                    <label htmlFor="epoc-pneu">EPOC</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="neumonia-pneu"
                      checked={pulmonaryHistory.neumonia}
                      onChange={(e) => handlePulmonaryHistoryChange('neumonia', e.target.checked)}
                    />
                    <label htmlFor="neumonia-pneu">Neumonía</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="tuberculosis-pneu"
                      checked={pulmonaryHistory.tuberculosis}
                      onChange={(e) => handlePulmonaryHistoryChange('tuberculosis', e.target.checked)}
                    />
                    <label htmlFor="tuberculosis-pneu">Tuberculosis</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="fibrosis-pulmonar-pneu"
                      checked={pulmonaryHistory.fibrosisPulmonar}
                      onChange={(e) => handlePulmonaryHistoryChange('fibrosisPulmonar', e.target.checked)}
                    />
                    <label htmlFor="fibrosis-pulmonar-pneu">Fibrosis pulmonar</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="cancer-pulmon-pneu"
                      checked={pulmonaryHistory.cancerPulmon}
                      onChange={(e) => handlePulmonaryHistoryChange('cancerPulmon', e.target.checked)}
                    />
                    <label htmlFor="cancer-pulmon-pneu">Cáncer de pulmón</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="embolia-pneu"
                      checked={pulmonaryHistory.embolia}
                      onChange={(e) => handlePulmonaryHistoryChange('embolia', e.target.checked)}
                    />
                    <label htmlFor="embolia-pneu">Embolia pulmonar</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="neumotorax-pneu"
                      checked={pulmonaryHistory.neumotorax}
                      onChange={(e) => handlePulmonaryHistoryChange('neumotorax', e.target.checked)}
                    />
                    <label htmlFor="neumotorax-pneu">Neumotórax</label>
                  </div>
                </div>
                <div className="form-group otros-field">
                  <label htmlFor="antecedentes-pulmonares-otros-pneu">Otros:</label>
                  <input 
                    type="text" 
                    id="antecedentes-pulmonares-otros-pneu"
                    value={antecedentes.pulmonaresOtros}
                    onChange={(e) => handleOtrosChange('pulmonaresOtros', e.target.value)}
                    placeholder="Otros antecedentes pulmonares..."
                  />
                </div>
              </div>

              {/* Antecedentes Familiares */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">
                  <i className="fas fa-users"></i> Antecedentes Familiares
                </h4>
                <div className="form-grid">
                  <div className="form-item">
                    <input type="checkbox" id="asma-familiar-pneu" />
                    <label htmlFor="asma-familiar-pneu">Asma</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="epoc-familiar-pneu" />
                    <label htmlFor="epoc-familiar-pneu">EPOC</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="cancer-pulmon-familiar-pneu" />
                    <label htmlFor="cancer-pulmon-familiar-pneu">Cáncer de pulmón</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="tuberculosis-familiar-pneu" />
                    <label htmlFor="tuberculosis-familiar-pneu">Tuberculosis</label>
                  </div>
                  <div className="form-item">
                    <input type="checkbox" id="fibrosis-familiar-pneu" />
                    <label htmlFor="fibrosis-familiar-pneu">Fibrosis pulmonar</label>
                  </div>
                </div>
                <div className="form-group otros-field">
                  <label htmlFor="familiares-otros-pneu">Otros:</label>
                  <input 
                    type="text" 
                    id="familiares-otros-pneu"
                    value={antecedentes.familiaresOtros}
                    onChange={(e) => handleOtrosChange('familiaresOtros', e.target.value)}
                    placeholder="Otros antecedentes familiares..."
                  />
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div className="section-content">
            <h3>{t('specialty.anamnesis')}</h3>
            
            {/* Quejas Principales */}
            <div className="sub-section-card">
              <h4 className="sub-section-title">
                <i className="fas fa-exclamation-triangle"></i> Quejas Principales
              </h4>
              
              {/* Síntomas Cardiovasculares Principales */}
              <div className="form-subgroup">
                <h5 className="subgroup-title">Síntomas Cardiovasculares</h5>
                <div className="cardio-complaints-grid">
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="sin-quejas"
                      checked={complaints.sinQuejas}
                      onChange={(e) => handleNoComplaints(e.target.checked)}
                    />
                    <label htmlFor="sin-quejas">Sin quejas</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="dolor-toracico"
                      checked={complaints.dolorToracico}
                      onChange={(e) => handleComplaintChange('dolorToracico', e.target.checked)}
                    />
                    <label htmlFor="dolor-toracico">Dolor torácico</label>
                  </div>
                  {complaints.dolorToracico && (
                    <div className="form-item otros-subfield">
                      <input 
                        type="text" 
                        id="otros-dolor-toracico"
                        value={complaints.otrosDolorToracico}
                        onChange={(e) => handleOtrosChange('dolorToracico', e.target.value)}
                        placeholder="Especificar..."
                      />
                    </div>
                  )}
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="disnea"
                      checked={complaints.disnea}
                      onChange={(e) => handleComplaintChange('disnea', e.target.checked)}
                    />
                    <label htmlFor="disnea">Disnea</label>
                  </div>
                  {complaints.disnea && (
                    <div className="form-item otros-subfield">
                      <input 
                        type="text" 
                        id="otros-disnea"
                        value={complaints.otrosDisnea}
                        onChange={(e) => handleOtrosChange('disnea', e.target.value)}
                        placeholder="Especificar..."
                      />
                    </div>
                  )}
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="palpitaciones"
                      checked={complaints.palpitaciones}
                      onChange={(e) => handleComplaintChange('palpitaciones', e.target.checked)}
                    />
                    <label htmlFor="palpitaciones">Palpitaciones</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="sincope"
                      checked={complaints.sincope}
                      onChange={(e) => handleComplaintChange('sincope', e.target.checked)}
                    />
                    <label htmlFor="sincope">Síncope</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="presincope"
                      checked={complaints.presincope}
                      onChange={(e) => handleComplaintChange('presincope', e.target.checked)}
                    />
                    <label htmlFor="presincope">Presíncope</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="edema"
                      checked={complaints.edema}
                      onChange={(e) => handleComplaintChange('edema', e.target.checked)}
                    />
                    <label htmlFor="edema">Edema</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="fatiga"
                      checked={complaints.fatiga}
                      onChange={(e) => handleComplaintChange('fatiga', e.target.checked)}
                    />
                    <label htmlFor="fatiga">Fatiga</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="ortopnea"
                      checked={complaints.ortopnea}
                      onChange={(e) => handleComplaintChange('ortopnea', e.target.checked)}
                    />
                    <label htmlFor="ortopnea">Ortopnea</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="disnea-paroxistica"
                      checked={complaints.disneaParoxistica}
                      onChange={(e) => handleComplaintChange('disneaParoxistica', e.target.checked)}
                    />
                    <label htmlFor="disnea-paroxistica">Disnea paroxística nocturna</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="claudicacion"
                      checked={complaints.claudicacion}
                      onChange={(e) => handleComplaintChange('claudicacion', e.target.checked)}
                    />
                    <label htmlFor="claudicacion">Claudicación intermitente</label>
                  </div>
                </div>
              </div>
              
              {/* Motivos de Consulta y Seguimiento */}
              <div className="form-subgroup">
                <h5 className="subgroup-title">Motivos de Consulta y Seguimiento</h5>
                <div className="cardio-complaints-grid">
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="control-factores-riesgo"
                      checked={complaints.controlFactoresRiesgo}
                      onChange={(e) => handleComplaintChange('controlFactoresRiesgo', e.target.checked)}
                    />
                    <label htmlFor="control-factores-riesgo">Control factores riesgo cardiovascular</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="seguimiento-cardiopatia"
                      checked={complaints.seguimientoCardiopatia}
                      onChange={(e) => handleComplaintChange('seguimientoCardiopatia', e.target.checked)}
                    />
                    <label htmlFor="seguimiento-cardiopatia">Seguimiento cardiopatía conocida</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="estudio-preoperatorio"
                      checked={complaints.estudioPreoperatorio}
                      onChange={(e) => handleComplaintChange('estudioPreoperatorio', e.target.checked)}
                    />
                    <label htmlFor="estudio-preoperatorio">Estudio preoperatorio</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="dolor-precordial-atipico"
                      checked={complaints.dolorPrecordialAtipico}
                      onChange={(e) => handleComplaintChange('dolorPrecordialAtipico', e.target.checked)}
                    />
                    <label htmlFor="dolor-precordial-atipico">Dolor precordial atípico</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="hipertension-arterial"
                      checked={complaints.hipertensionArterial}
                      onChange={(e) => handleComplaintChange('hipertensionArterial', e.target.checked)}
                    />
                    <label htmlFor="hipertension-arterial">Hipertensión arterial</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="dislipemia"
                      checked={complaints.dislipemia}
                      onChange={(e) => handleComplaintChange('dislipemia', e.target.checked)}
                    />
                    <label htmlFor="dislipemia">Dislipemia</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="diabetes-mellitus"
                      checked={complaints.diabetesMellitus}
                      onChange={(e) => handleComplaintChange('diabetesMellitus', e.target.checked)}
                    />
                    <label htmlFor="diabetes-mellitus">Diabetes mellitus</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="soplo-cardiaco"
                      checked={complaints.soploCardiaco}
                      onChange={(e) => handleComplaintChange('soploCardiaco', e.target.checked)}
                    />
                    <label htmlFor="soplo-cardiaco">Soplo cardíaco</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="evaluacion-riesgo-cardiovascular"
                      checked={complaints.evaluacionRiesgoCardiovascular}
                      onChange={(e) => handleComplaintChange('evaluacionRiesgoCardiovascular', e.target.checked)}
                    />
                    <label htmlFor="evaluacion-riesgo-cardiovascular">Evaluación riesgo cardiovascular</label>
                  </div>
                </div>
              </div>
              
              {/* Estados Patológicos */}
              <div className="form-subgroup">
                <h5 className="subgroup-title">Estados Patológicos</h5>
                <div className="cardio-complaints-grid">
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="cianosis-central"
                      checked={complaints.cianosisCentral}
                      onChange={(e) => handleComplaintChange('cianosisCentral', e.target.checked)}
                    />
                    <label htmlFor="cianosis-central">Cianosis Central</label>
                  </div>
                  <div className="form-item">
                    <input 
                      type="checkbox" 
                      id="cianosis-periferica"
                      checked={complaints.cianosisPeripherica}
                      onChange={(e) => handleComplaintChange('cianosisPeripherica', e.target.checked)}
                    />
                    <label htmlFor="cianosis-periferica">Cianosis Periférica</label>
                  </div>
                </div>
              </div>
              
              {/* Campo Otros para Quejas Principales */}
              <div className="form-group otros-field">
                <label htmlFor="otros-quejas">Otros:</label>
                <input 
                  type="text" 
                  id="otros-quejas"
                  value={complaints.otrosQuejas}
                  onChange={(e) => handleOtrosChange('quejas', e.target.value)}
                  placeholder="Especificar otras quejas..."
                />
              </div>
            </div>

            {/* Evaluación Detallada del Dolor Torácico */}
            {complaints.dolorToracico && (
              <div className="sub-section-card dynamic-section visible">
                <h4 className="sub-section-title">
                  <i className="fas fa-heart-broken"></i> 📍 Características del Dolor Torácico
                </h4>
                <div className="mb-4">
                  <h5 className="text-md font-semibold mb-2">Intensidad del Dolor</h5>
                  <div className="measurement">
                    <label>Intensidad del dolor (EVA):</label>
                    <div className="flex items-center gap-2 w-full">
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        value={chestPainData.intensity}
                        onChange={(e) => setChestPainData(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                        className="flex-grow"
                      />
                      <span className="text-cardio-alert font-bold">{chestPainData.intensity}</span>
                      <span>/10</span>
                    </div>
                  </div>
                  
                  {/* Localización */}
                  <div className="form-group">
                    <label>📍 Localización:</label>
                    <div className="checkbox-group">
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="loc-retroesternal"
                          checked={chestPainData.locationRetroesternal}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, locationRetroesternal: e.target.checked }))}
                        />
                        <label htmlFor="loc-retroesternal">Retroesternal <span className="text-xs text-gray-500">(Típico isquemia miocárdica)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="loc-precordial"
                          checked={chestPainData.locationPrecordialLeft}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, locationPrecordialLeft: e.target.checked }))}
                        />
                        <label htmlFor="loc-precordial">Precordial izquierdo <span className="text-xs text-gray-500">(Pericarditis, pleurítico)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="loc-interescapular"
                          checked={chestPainData.locationInterescapular}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, locationInterescapular: e.target.checked }))}
                        />
                        <label htmlFor="loc-interescapular">Interescapular <span className="text-xs text-gray-500">(Disección aórtica)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="loc-epigastrico"
                          checked={chestPainData.locationEpigastric}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, locationEpigastric: e.target.checked }))}
                        />
                        <label htmlFor="loc-epigastrico">Epigástrico <span className="text-xs text-gray-500">(Infarto inferior, ERGE)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="loc-cervical"
                          checked={chestPainData.locationCervicalMandibular}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, locationCervicalMandibular: e.target.checked }))}
                        />
                        <label htmlFor="loc-cervical">Cervical/mandibular <span className="text-xs text-gray-500">(Isquemia atípica - diabéticos, mujeres)</span></label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Calidad del dolor */}
                  <div className="form-group">
                    <label>🔍 Calidad del dolor:</label>
                    <div className="checkbox-group">
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="qual-opresivo"
                          checked={chestPainData.qualityOppressive}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, qualityOppressive: e.target.checked }))}
                        />
                        <label htmlFor="qual-opresivo">Opresivo/constrictivo <span className="text-xs text-gray-500">(Isquemia coronaria típica)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="qual-punzante"
                          checked={chestPainData.qualityStabbing}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, qualityStabbing: e.target.checked }))}
                        />
                        <label htmlFor="qual-punzante">Punzante/lacerante <span className="text-xs text-gray-500">(Disección, pericarditis)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="qual-urente"
                          checked={chestPainData.qualityBurning}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, qualityBurning: e.target.checked }))}
                        />
                        <label htmlFor="qual-urente">Urente/quemante <span className="text-xs text-gray-500">(ERGE, espasmo esofágico)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="qual-pleuritico"
                          checked={chestPainData.qualityPleuritic}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, qualityPleuritic: e.target.checked }))}
                        />
                        <label htmlFor="qual-pleuritico">Pleurítico <span className="text-xs text-gray-500">(Pericarditis, embolia pulmonar)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="qual-sordo"
                          checked={chestPainData.qualityDull}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, qualityDull: e.target.checked }))}
                        />
                        <label htmlFor="qual-sordo">Sordo/gravativo <span className="text-xs text-gray-500">(Angor estable crónico)</span></label>
                      </div>
                    </div>
                  </div>

                  {/* Irradiación */}
                  <div className="form-group">
                    <label>🔄 Irradiación:</label>
                    <div className="checkbox-group">
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="rad-brazo-izq"
                          checked={chestPainData.radiationLeftArm}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, radiationLeftArm: e.target.checked }))}
                        />
                        <label htmlFor="rad-brazo-izq">Brazo izquierdo <span className="text-xs text-gray-500">(Clásica isquemia miocárdica)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="rad-ambos-brazos"
                          checked={chestPainData.radiationBothArms}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, radiationBothArms: e.target.checked }))}
                        />
                        <label htmlFor="rad-ambos-brazos">Ambos brazos <span className="text-xs text-gray-500">(Isquemia severa - tronco común)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="rad-mandibula"
                          checked={chestPainData.radiationJaw}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, radiationJaw: e.target.checked }))}
                        />
                        <label htmlFor="rad-mandibula">Mandíbula <span className="text-xs text-gray-500">(Territorio coronario derecho)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="rad-espalda"
                          checked={chestPainData.radiationBack}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, radiationBack: e.target.checked }))}
                        />
                        <label htmlFor="rad-espalda">Espalda/interescapular <span className="text-xs text-gray-500">(Disección aórtica)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="rad-epigastrio"
                          checked={chestPainData.radiationEpigastrium}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, radiationEpigastrium: e.target.checked }))}
                        />
                        <label htmlFor="rad-epigastrio">Epigastrio <span className="text-xs text-gray-500">(Cara inferior - coronaria derecha)</span></label>
                      </div>
                    </div>
                  </div>

                  {/* Factores desencadenantes */}
                  <div className="form-group">
                    <label>⚡ Factores desencadenantes:</label>
                    <div className="checkbox-group">
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="triggered-effort"
                          checked={chestPainData.triggeredByExercise}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, triggeredByExercise: e.target.checked }))}
                        />
                        <label htmlFor="triggered-effort">Esfuerzo físico <span className="text-xs text-gray-500">(Angor estable, graduar intensidad)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="triggered-stress"
                          checked={chestPainData.triggeredByStress}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, triggeredByStress: e.target.checked }))}
                        />
                        <label htmlFor="triggered-stress">Estrés emocional <span className="text-xs text-gray-500">(Síndrome Tako-tsubo, isquemia)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="triggered-cold"
                          checked={chestPainData.triggeredByCold}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, triggeredByCold: e.target.checked }))}
                        />
                        <label htmlFor="triggered-cold">Frío/viento <span className="text-xs text-gray-500">(Espasmo coronario, angor vasoespástico)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="triggered-postprandial"
                          checked={chestPainData.triggeredByEating}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, triggeredByEating: e.target.checked }))}
                        />
                        <label htmlFor="triggered-postprandial">Postprandial <span className="text-xs text-gray-500">(Síndrome robo, angor postprandial)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="triggered-decubitus"
                          checked={chestPainData.triggeredByDecubitus}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, triggeredByDecubitus: e.target.checked }))}
                        />
                        <label htmlFor="triggered-decubitus">Decúbito <span className="text-xs text-gray-500">(Angor decúbito - ICC severa)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="triggered-rest"
                          checked={chestPainData.atRest}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, atRest: e.target.checked }))}
                        />
                        <label htmlFor="triggered-rest">Reposo/madrugada <span className="text-xs text-gray-500">(Angor vasoespástico - Prinzmetal)</span></label>
                      </div>
                    </div>
                  </div>

                  {/* Factores atenuantes */}
                  <div className="form-group">
                    <label>🛡️ Factores atenuantes:</label>
                    <div className="checkbox-group">
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="relieved-rest"
                          checked={chestPainData.relievedByRest}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, relievedByRest: e.target.checked }))}
                        />
                        <label htmlFor="relieved-rest">Reposo <span className="text-xs text-gray-500">(Angor estable típico 2-5 minutos)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="relieved-nitro"
                          checked={chestPainData.relievedByNitroglycerin}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, relievedByNitroglycerin: e.target.checked }))}
                        />
                        <label htmlFor="relieved-nitro">Nitroglicerina sublingual <span className="text-xs text-gray-500">(Respuesta &lt;3min confirma isquemia)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="relieved-sitting"
                          checked={chestPainData.relievedBySitting}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, relievedBySitting: e.target.checked }))}
                        />
                        <label htmlFor="relieved-sitting">Posición sentado <span className="text-xs text-gray-500">(Pericarditis, derrame pericárdico)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="relieved-antacids"
                          checked={chestPainData.relievedByAntacids}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, relievedByAntacids: e.target.checked }))}
                        />
                        <label htmlFor="relieved-antacids">Antiácidos <span className="text-xs text-gray-500">(ERGE, úlcera péptica)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="relieved-nsaids"
                          checked={chestPainData.relievedByNSAIDs}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, relievedByNSAIDs: e.target.checked }))}
                        />
                        <label htmlFor="relieved-nsaids">AINEs <span className="text-xs text-gray-500">(Pericarditis, dolor musculoesquelético)</span></label>
                      </div>
                    </div>
                  </div>

                  {/* Duración episodios */}
                  <div className="form-group">
                    <label>⏱️ Duración episodios:</label>
                    <div className="checkbox-group">
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="duration-less2min"
                          checked={chestPainData.durationLess2min}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, durationLess2min: e.target.checked }))}
                        />
                        <label htmlFor="duration-less2min">&lt;2 minutos <span className="text-xs text-gray-500">(No coronario - neuromusular, ERGE)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="duration-2to10min"
                          checked={chestPainData.duration2to10min}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, duration2to10min: e.target.checked }))}
                        />
                        <label htmlFor="duration-2to10min">2-10 minutos <span className="text-xs text-gray-500">(Angor estable típico)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="duration-10to30min"
                          checked={chestPainData.duration10to30min}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, duration10to30min: e.target.checked }))}
                        />
                        <label htmlFor="duration-10to30min">10-30 minutos <span className="text-xs text-gray-500">(Angor inestable, SCASEST)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="duration-more30min"
                          checked={chestPainData.durationMore30min}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, durationMore30min: e.target.checked }))}
                        />
                        <label htmlFor="duration-more30min">&gt;30 minutos <span className="text-xs text-gray-500">(SCACEST, disección, EP masiva)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="duration-continuous"
                          checked={chestPainData.durationContinuous}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, durationContinuous: e.target.checked }))}
                        />
                        <label htmlFor="duration-continuous">Continuo fluctuante <span className="text-xs text-gray-500">(Pericarditis, origen no cardíaco)</span></label>
                      </div>
                    </div>
                  </div>

                  {/* Síntomas asociados */}
                  <div className="form-group">
                    <label>🔗 Síntomas asociados:</label>
                    <div className="checkbox-group">
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="assoc-dyspnea"
                          checked={chestPainData.associatedDyspnea}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, associatedDyspnea: e.target.checked }))}
                        />
                        <label htmlFor="assoc-dyspnea">Disnea <span className="text-xs text-gray-500">(Disfunción VI, ICC aguda)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="assoc-profuse-sweating"
                          checked={chestPainData.associatedProfuseSweating}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, associatedProfuseSweating: e.target.checked }))}
                        />
                        <label htmlFor="assoc-profuse-sweating">Sudoración profusa <span className="text-xs text-gray-500">(Reacción vegetativa - infarto)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="assoc-nausea-vomiting"
                          checked={chestPainData.associatedNauseaVomiting}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, associatedNauseaVomiting: e.target.checked }))}
                        />
                        <label htmlFor="assoc-nausea-vomiting">Náuseas/vómitos <span className="text-xs text-gray-500">(Infarto inferior, reacción vagal)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="assoc-palpitations"
                          checked={chestPainData.associatedPalpitations}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, associatedPalpitations: e.target.checked }))}
                        />
                        <label htmlFor="assoc-palpitations">Palpitaciones <span className="text-xs text-gray-500">(Arritmias asociadas, taquicardia sinusal)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="assoc-syncope"
                          checked={chestPainData.associatedSyncope}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, associatedSyncope: e.target.checked }))}
                        />
                        <label htmlFor="assoc-syncope">Síncope <span className="text-xs text-gray-500">(Arritmias graves, shock cardiogénico)</span></label>
                      </div>
                      <div className="form-item">
                        <input 
                          type="checkbox" 
                          id="assoc-impending-doom"
                          checked={chestPainData.associatedImpendingDoom}
                          onChange={(e) => setChestPainData(prev => ({ ...prev, associatedImpendingDoom: e.target.checked }))}
                        />
                        <label htmlFor="assoc-impending-doom">Sensación muerte inminente <span className="text-xs text-gray-500">(Infarto masivo, EP masiva)</span></label>
                      </div>
                    </div>
                  </div>

                  <div className="risk-assessment">
                    <div className="risk-indicator">
                      <span>Probabilidad coronaria: </span>
                      <span 
                        className="risk-value" 
                        style={{ color: evaluateChestPain().color }}
                      >
                        {evaluateChestPain().text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Evaluación Detallada de la Disnea */}
            {complaints.disnea && (
              <div className="sub-section-card dynamic-section visible">
                <h4 className="sub-section-title">
                  <i className="fas fa-lungs"></i> Evaluación Detallada de la Disnea
                </h4>
                <div className="measurement">
                  <label>Intensidad de la disnea (EVA):</label>
                  <div className="flex items-center gap-2 w-full">
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      value={dyspneaData.intensity}
                      onChange={(e) => setDyspneaData(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                      className="flex-grow"
                    />
                    <span className="text-cardio-alert font-bold">{dyspneaData.intensity}</span>
                    <span>/10</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Tolerancia al ejercicio:</label>
                  <select 
                    value={dyspneaData.exerciseTolerance}
                    onChange={(e) => setDyspneaData(prev => ({ ...prev, exerciseTolerance: e.target.value }))}
                  >
                    <option value="">Seleccione...</option>
                    <option value="normal">Actividad normal sin limitaciones</option>
                    <option value="leve">Ligera limitación con esfuerzo importante</option>
                    <option value="moderada">Limitación marcada con actividad ordinaria</option>
                    <option value="severa">Limitación con actividad mínima</option>
                    <option value="reposo">Síntomas en reposo</option>
                  </select>
                </div>
                
                <div className="risk-assessment">
                  <div className="risk-indicator">
                    <span>Clase funcional NYHA: </span>
                    <span 
                      className="risk-value"
                      style={{ color: evaluateNYHA().color }}
                    >
                      {evaluateNYHA().text}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Medicación */}
            <div className="sub-section-card">
              <h4 className="sub-section-title">
                <i className="fas fa-pills"></i> Medicación Cardiovascular Actual
              </h4>
              
              <div className="form-group">
                <label>Seleccionar medicamentos comunes:</label>
                <div className="medication-grid">
                  {popularCardioMeds.map((med, index) => (
                    <div key={index} className="form-item medication-item">
                      <input 
                        type="checkbox" 
                        id={`med-${index}`}
                        checked={medications.selectedMeds.includes(med)}
                        onChange={() => handleMedicationToggle(med)}
                      />
                      <label htmlFor={`med-${index}`}>{med}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Medicamentos adicionales o dosis específicas:</label>
                <textarea 
                  rows="4" 
                  value={medications.customText}
                  onChange={(e) => handleCustomMedicationChange(e.target.value)}
                  placeholder="Ej: Otros medicamentos no listados arriba, dosis específicas, horarios..."
                />
              </div>

              {(medications.selectedMeds.length > 0 || medications.customText) && (
                <div className="medication-summary">
                  <h5>Resumen de medicación:</h5>
                  <div className="selected-medications">
                    {medications.selectedMeds.map((med, index) => (
                      <span key={index} className="medication-tag">{med}</span>
                    ))}
                    {medications.customText && (
                      <div className="custom-medication-text">
                        <strong>Adicionales:</strong> {medications.customText}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Antecedentes Personales */}
            <div className="sub-section-card">
              <h4 className="sub-section-title">
                <i className="fas fa-history"></i> Antecedentes Cardiovasculares
              </h4>
              <div className="checkbox-group">
                <div className="form-item">
                  <input type="checkbox" id="hipertension" />
                  <label htmlFor="hipertension">Hipertensión arterial</label>
                </div>
                <div className="form-item">
                  <input type="checkbox" id="diabetes" />
                  <label htmlFor="diabetes">Diabetes mellitus</label>
                </div>
                <div className="form-item">
                  <input type="checkbox" id="dislipidemia" />
                  <label htmlFor="dislipidemia">Dislipidemia</label>
                </div>
                <div className="form-item">
                  <input type="checkbox" id="tabaquismo" />
                  <label htmlFor="tabaquismo">Tabaquismo</label>
                </div>
                <div className="form-item">
                  <input type="checkbox" id="iam-previo" />
                  <label htmlFor="iam-previo">IAM previo</label>
                </div>
                <div className="form-item">
                  <input type="checkbox" id="icc-previa" />
                  <label htmlFor="icc-previa">Insuficiencia cardíaca</label>
                </div>
                <div className="form-item">
                  <input type="checkbox" id="fibrilacion-auricular" />
                  <label htmlFor="fibrilacion-auricular">Fibrilación auricular</label>
                </div>
                <div className="form-item">
                  <input type="checkbox" id="cirugia-cardiaca" />
                  <label htmlFor="cirugia-cardiaca">Cirugía cardíaca previa</label>
                </div>
              </div>
              
              {/* Campo Otros para Antecedentes Cardiovasculares */}
              <div className="form-group otros-field">
                <label htmlFor="cardiovasculares-otros">Otros:</label>
                <input 
                  type="text" 
                  id="cardiovasculares-otros"
                  value={antecedentes.cardiovascularesOtros}
                  onChange={(e) => handleOtrosChange('cardiovascularesOtros', e.target.value)}
                  placeholder="Otros antecedentes cardiovasculares..."
                />
              </div>
            </div>

            {/* Antecedentes Familiares */}
            <div className="sub-section-card">
              <h4 className="sub-section-title">
                <i className="fas fa-users"></i> Antecedentes Familiares
              </h4>
              <div className="checkbox-group">
                <div className="form-item">
                  <input type="checkbox" id="familia-iam" />
                  <label htmlFor="familia-iam">IAM en familiar &lt;55 años (H) / &lt;65 años (M)</label>
                </div>
                <div className="form-item">
                  <input type="checkbox" id="familia-muerte-subita" />
                  <label htmlFor="familia-muerte-subita">Muerte súbita en la familia</label>
                </div>
                <div className="form-item">
                  <input type="checkbox" id="familia-hipertension" />
                  <label htmlFor="familia-hipertension">Hipertensión familiar</label>
                </div>
                <div className="form-item">
                  <input type="checkbox" id="familia-diabetes" />
                  <label htmlFor="familia-diabetes">Diabetes familiar</label>
                </div>
              </div>
              
              {/* Campo Otros para Antecedentes Familiares */}
              <div className="form-group otros-field">
                <label htmlFor="familiares-otros">Otros:</label>
                <input 
                  type="text" 
                  id="familiares-otros"
                  value={antecedentes.familiaresOtros}
                  onChange={(e) => handleOtrosChange('familiaresOtros', e.target.value)}
                  placeholder="Otros antecedentes familiares..."
                />
              </div>
            </div>
          </div>
        );

      case 'vital-signs':
        return (
          <div className="section-content">
            <h3>{t('specialty.vitalSigns')}</h3>
            <div className="vital-signs-grid">
              <div className="vital-card">
                <div className="vital-icon">
                  <i className="fas fa-heartbeat"></i>
                </div>
                <label>{t('specialty.pulse')}</label>
                <input type="number" placeholder="72" />
              </div>
              <div className="vital-card">
                <div className="vital-icon">
                  <i className="fas fa-tachometer-alt"></i>
                </div>
                <label>Presión Arterial (derecho)</label>
                <div className="bp-inputs">
                  <input type="number" placeholder="120" />
                  <span>/</span>
                  <input type="number" placeholder="80" />
                  <span className="unit">mmHg</span>
                </div>
              </div>
              <div className="vital-card">
                <div className="vital-icon">
                  <i className="fas fa-tachometer-alt"></i>
                </div>
                <label>Presión Arterial (izquierdo)</label>
                <div className="bp-inputs">
                  <input type="number" placeholder="120" />
                  <span>/</span>
                  <input type="number" placeholder="80" />
                  <span className="unit">mmHg</span>
                </div>
              </div>
              <div className="vital-card">
                <div className="vital-icon">
                  <i className="fas fa-thermometer-half"></i>
                </div>
                <label>{t('specialty.temperature')}</label>
                <div className="input-with-unit">
                  <input type="number" step="0.1" placeholder="36.6" />
                  <span className="unit">°C</span>
                </div>
              </div>
              <div className="vital-card">
                <div className="vital-icon">
                  <i className="fas fa-lungs"></i>
                </div>
                <label>{t('specialty.respiratoryRate')}</label>
                <div className="input-with-unit">
                  <input type="number" placeholder="16" />
                  <span className="unit">rpm</span>
                </div>
              </div>
              <div className="vital-card">
                <div className="vital-icon">
                  <i className="fas fa-wind"></i>
                </div>
                <label>Saturación de Oxígeno</label>
                <div className="input-with-unit">
                  <input type="number" min="70" max="100" placeholder="98" />
                  <span className="unit">%</span>
                </div>
              </div>
              <div className="vital-card">
                <div className="vital-icon">
                  <i className="fas fa-wave-square"></i>
                </div>
                <label>Características del Pulso</label>
                <select 
                  className="pulse-select"
                  value={pulseData.character}
                  onChange={(e) => handlePulseCharacterChange(e.target.value)}
                >
                  <option value="">Seleccione...</option>
                  <option value="ritmico-normal">Rítmico, de buen llenado</option>
                  <option value="ritmico-debil">Rítmico, de llenado débil</option>
                  <option value="ritmico-lleno">Rítmico, lleno</option>
                  <option value="arritmico">Arrítmico</option>
                  <option value="no-palpable">No palpable</option>
                </select>
                
                {pulseData.character === 'arritmico' && (
                  <div className="pulse-details">
                    <div className="pulse-detail-item">
                      <label>Tipo de arritmia:</label>
                      <select 
                        value={pulseData.arrhythmiaType}
                        onChange={(e) => handleArrhythmiaTypeChange(e.target.value)}
                      >
                        <option value="">Seleccione...</option>
                        <option value="extrasistoles">Extrasístoles</option>
                        <option value="fibrilacion-auricular">Fibrilación auricular</option>
                        <option value="flutter-auricular">Flutter auricular</option>
                        <option value="ritmo-irregular">Ritmo irregular</option>
                      </select>
                    </div>
                    <div className="pulse-detail-item">
                      <label>Déficit de pulso:</label>
                      <div className="input-with-unit">
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={pulseData.pulseDeficit}
                          onChange={(e) => handlePulseDeficitChange(e.target.value)}
                          placeholder="0"
                        />
                        <span className="unit">lpm</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'physical-exam':
        return (
          <div className="section-content">
            <h3>Examen Físico Cardiovascular</h3>
            
            {/* Inspección General */}
            <div className="sub-section-card">
              <h4 className="sub-section-title">
                <i className="fas fa-eye"></i> Inspección General
              </h4>
              
              <div className="form-group">
                <label>Aspecto General:</label>
                <div className="checkbox-grid">
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="aspecto-normal"
                      checked={physicalExamData.aspectoNormal}
                      onChange={(e) => handlePhysicalExamCheckbox('aspectoNormal', e.target.checked)}
                    />
                    <label htmlFor="aspecto-normal">Aspecto general normal</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="palidez"
                      checked={physicalExamData.palidez}
                      onChange={(e) => handlePhysicalExamCheckbox('palidez', e.target.checked)}
                    />
                    <label htmlFor="palidez">Palidez</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="cianosis-central"
                      checked={physicalExamData.cianosisCentral}
                      onChange={(e) => handlePhysicalExamCheckbox('cianosisCentral', e.target.checked)}
                    />
                    <label htmlFor="cianosis-central">Cianosis central</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="cianosis-periferica"
                      checked={physicalExamData.cianosisPeripherica}
                      onChange={(e) => handlePhysicalExamCheckbox('cianosisPeripherica', e.target.checked)}
                    />
                    <label htmlFor="cianosis-periferica">Cianosis periférica</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="diaforesis"
                      checked={physicalExamData.diaforesis}
                      onChange={(e) => handlePhysicalExamCheckbox('diaforesis', e.target.checked)}
                    />
                    <label htmlFor="diaforesis">Diaforesis</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="ingurgitacion-yugular"
                      checked={physicalExamData.ingurgitacionYugular}
                      onChange={(e) => handlePhysicalExamCheckbox('ingurgitacionYugular', e.target.checked)}
                    />
                    <label htmlFor="ingurgitacion-yugular">Ingurgitación yugular</label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Inspección de la región cardíaca:</label>
                <select 
                  value={physicalExamData.inspeccionCardiaca}
                  onChange={(e) => handlePhysicalExamChange('inspeccionCardiaca', e.target.value)}
                  className="select-field"
                >
                  <option value="">Seleccione...</option>
                  <option value="normal">No se observan cambios patológicos</option>
                  <option value="latido-apical-visible">Latido apical visible</option>
                  <option value="deformidad-toracica">Deformidad del tórax en región cardíaca</option>
                  <option value="giba-cardiaca">Giba cardíaca</option>
                  <option value="pulsacion-patologica">Pulsación patológica visible</option>
                </select>
              </div>
              
              {physicalExamData.inspeccionCardiaca && physicalExamData.inspeccionCardiaca !== 'normal' && (
                <div className="sub-detail-card">
                  <h5>Descripción de Cambios</h5>
                  <div className="form-group">
                    <label>Descripción de los cambios:</label>
                    <textarea 
                      value={physicalExamData.inspeccionDescripcion}
                      onChange={(e) => handlePhysicalExamChange('inspeccionDescripcion', e.target.value)}
                      rows="3" 
                      placeholder="Describa la localización, carácter e intensidad de los cambios observados..."
                      className="textarea-field"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Palpación Cardíaca */}
            <div className="sub-section-card">
              <h4 className="sub-section-title">
                <i className="fas fa-hand-paper"></i> Palpación Cardíaca
              </h4>
              
              <div className="form-group">
                <label>Palpación del latido apical:</label>
                <select 
                  value={physicalExamData.latidoApical}
                  onChange={(e) => handlePhysicalExamChange('latidoApical', e.target.value)}
                  className="select-field"
                >
                  <option value="">Seleccione...</option>
                  <option value="normal">V EIC en línea medioclavicular izquierda</option>
                  <option value="desplazado-izquierda">Desplazado a la izquierda</option>
                  <option value="desplazado-abajo">Desplazado hacia abajo</option>
                  <option value="desplazado-izquierda-abajo">Desplazado a la izquierda y abajo</option>
                  <option value="debilitado">Debilitado</option>
                  <option value="aumentado">Aumentado</option>
                  <option value="no-palpable">No palpable</option>
                </select>
              </div>
              
              {physicalExamData.latidoApical && physicalExamData.latidoApical !== 'normal' && (
                <div className="sub-detail-card">
                  <h5>Detalles del Latido Apical</h5>
                  <div className="form-group">
                    <label>Localización específica:</label>
                    <input 
                      type="text" 
                      value={physicalExamData.latidoLocalizacion}
                      onChange={(e) => handlePhysicalExamChange('latidoLocalizacion', e.target.value)}
                      placeholder="ej: VI espacio intercostal, fuera de línea medioclavicular" 
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label>Características del latido:</label>
                    <div className="checkbox-grid">
                      <div className="checkbox-item">
                        <input 
                          type="checkbox" 
                          id="latido-difuso"
                          checked={physicalExamData.latidoDifuso}
                          onChange={(e) => handlePhysicalExamCheckbox('latidoDifuso', e.target.checked)}
                        />
                        <label htmlFor="latido-difuso">Difuso</label>
                      </div>
                      <div className="checkbox-item">
                        <input 
                          type="checkbox" 
                          id="latido-fuerte"
                          checked={physicalExamData.latidoFuerte}
                          onChange={(e) => handlePhysicalExamCheckbox('latidoFuerte', e.target.checked)}
                        />
                        <label htmlFor="latido-fuerte">Fuerte</label>
                      </div>
                      <div className="checkbox-item">
                        <input 
                          type="checkbox" 
                          id="latido-prolongado"
                          checked={physicalExamData.latidoProlongado}
                          onChange={(e) => handlePhysicalExamCheckbox('latidoProlongado', e.target.checked)}
                        />
                        <label htmlFor="latido-prolongado">Prolongado</label>
                      </div>
                      <div className="checkbox-item">
                        <input 
                          type="checkbox" 
                          id="latido-sostenido"
                          checked={physicalExamData.latidoSostenido}
                          onChange={(e) => handlePhysicalExamCheckbox('latidoSostenido', e.target.checked)}
                        />
                        <label htmlFor="latido-sostenido">Sostenido</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Percusión Cardíaca */}
            <div className="sub-section-card">
              <h4 className="sub-section-title">
                <i className="fas fa-hand-fist"></i> Percusión Cardíaca
              </h4>
              
              <div className="form-group">
                <label>Percusión de límites cardíacos:</label>
                <select 
                  value={physicalExamData.limitesCardiacos}
                  onChange={(e) => handlePhysicalExamChange('limitesCardiacos', e.target.value)}
                  className="select-field"
                >
                  <option value="">Seleccione...</option>
                  <option value="normales">Dentro de límites normales</option>
                  <option value="agrandados-izquierda">Agrandados a la izquierda</option>
                  <option value="agrandados-derecha">Agrandados a la derecha</option>
                  <option value="agrandados-superior">Agrandados hacia arriba</option>
                  <option value="agrandados-todas">Agrandados en todas las direcciones</option>
                </select>
              </div>
              
              {physicalExamData.limitesCardiacos && physicalExamData.limitesCardiacos !== 'normales' && (
                <div className="sub-detail-card">
                  <h5>Detalles de Límites Cardíacos</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Límite derecho:</label>
                      <input 
                        type="text" 
                        value={physicalExamData.limiteDerecho}
                        onChange={(e) => handlePhysicalExamChange('limiteDerecho', e.target.value)}
                        placeholder="ej: IV EIC, borde derecho esternal" 
                        className="input-field"
                      />
                    </div>
                    <div className="form-group">
                      <label>Límite izquierdo:</label>
                      <input 
                        type="text" 
                        value={physicalExamData.limiteIzquierdo}
                        onChange={(e) => handlePhysicalExamChange('limiteIzquierdo', e.target.value)}
                        placeholder="ej: V EIC, 2 cm fuera de línea medioclavicular" 
                        className="input-field"
                      />
                    </div>
                    <div className="form-group">
                      <label>Límite superior:</label>
                      <input 
                        type="text" 
                        value={physicalExamData.limiteSuperior}
                        onChange={(e) => handlePhysicalExamChange('limiteSuperior', e.target.value)}
                        placeholder="ej: III espacio intercostal" 
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Otros Hallazgos Palpatorios */}
            <div className="sub-section-card">
              <h4 className="sub-section-title">
                <i className="fas fa-hand-pointer"></i> Otros Hallazgos Palpatorios
              </h4>
              
              <div className="checkbox-grid">
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="fremito-sistolico"
                    checked={physicalExamData.fremitoSistolico}
                    onChange={(e) => handlePhysicalExamCheckbox('fremitoSistolico', e.target.checked)}
                  />
                  <label htmlFor="fremito-sistolico">Frémito sistólico</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="fremito-diastolico"
                    checked={physicalExamData.fremitoDiastolico}
                    onChange={(e) => handlePhysicalExamCheckbox('fremitoDiastolico', e.target.checked)}
                  />
                  <label htmlFor="fremito-diastolico">Frémito diastólico</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="levantamiento-paraesternal"
                    checked={physicalExamData.levantamientoParaesternal}
                    onChange={(e) => handlePhysicalExamCheckbox('levantamientoParaesternal', e.target.checked)}
                  />
                  <label htmlFor="levantamiento-paraesternal">Levantamiento paraesternal</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="p2-palpable"
                    checked={physicalExamData.p2Palpable}
                    onChange={(e) => handlePhysicalExamCheckbox('p2Palpable', e.target.checked)}
                  />
                  <label htmlFor="p2-palpable">P2 palpable</label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'auscultation':
        if (specialtyName === 'pneumology') {
          return (
            <div className="section-content">
              <h3><i className="fas fa-stethoscope"></i> Auscultación Pulmonar</h3>
              
              {/* Ruidos Respiratorios Normales */}
              <div className="exam-container">
                <h5 className="exam-header">
                  <i className="fas fa-lungs"></i> Ruidos Respiratorios Normales
                </h5>
                <div className="lung-map">
                  {/* Pulmón Derecho */}
                  <div className="lung-side">
                    <h6>Pulmón Derecho</h6>
                    
                    {/* Ápice Derecho */}
                    <div className="lung-zone">
                      <strong>Ápice</strong>
                      <div className="radio-group">
                        <label><input type="radio" name="ruidos-der-apice" value="vesicular" checked={pulmonaryAuscultationData.ruidosDerechoApice === 'vesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Apice', e.target.value)} />Vesicular</label>
                        <label><input type="radio" name="ruidos-der-apice" value="bronquial" checked={pulmonaryAuscultationData.ruidosDerechoApice === 'bronquial'} onChange={(e) => handleLungSoundChange('Derecho', 'Apice', e.target.value)} />Bronquial</label>
                        <label><input type="radio" name="ruidos-der-apice" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosDerechoApice === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Apice', e.target.value)} />Broncovesicular</label>
                        <label><input type="radio" name="ruidos-der-apice" value="disminuido" checked={pulmonaryAuscultationData.ruidosDerechoApice === 'disminuido'} onChange={(e) => handleLungSoundChange('Derecho', 'Apice', e.target.value)} />Disminuido</label>
                        <label><input type="radio" name="ruidos-der-apice" value="abolido" checked={pulmonaryAuscultationData.ruidosDerechoApice === 'abolido'} onChange={(e) => handleLungSoundChange('Derecho', 'Apice', e.target.value)} />Abolido</label>
                      </div>
                    </div>
                    
                    {/* Campo Superior Derecho */}
                    <div className="lung-zone">
                      <strong>Campo Superior</strong>
                      <div className="radio-group">
                        <label><input type="radio" name="ruidos-der-superior" value="vesicular" checked={pulmonaryAuscultationData.ruidosDerechoSuperior === 'vesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Superior', e.target.value)} />Vesicular</label>
                        <label><input type="radio" name="ruidos-der-superior" value="bronquial" checked={pulmonaryAuscultationData.ruidosDerechoSuperior === 'bronquial'} onChange={(e) => handleLungSoundChange('Derecho', 'Superior', e.target.value)} />Bronquial</label>
                        <label><input type="radio" name="ruidos-der-superior" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosDerechoSuperior === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Superior', e.target.value)} />Broncovesicular</label>
                        <label><input type="radio" name="ruidos-der-superior" value="disminuido" checked={pulmonaryAuscultationData.ruidosDerechoSuperior === 'disminuido'} onChange={(e) => handleLungSoundChange('Derecho', 'Superior', e.target.value)} />Disminuido</label>
                        <label><input type="radio" name="ruidos-der-superior" value="abolido" checked={pulmonaryAuscultationData.ruidosDerechoSuperior === 'abolido'} onChange={(e) => handleLungSoundChange('Derecho', 'Superior', e.target.value)} />Abolido</label>
                      </div>
                    </div>
                    
                    {/* Campo Medio Derecho */}
                    <div className="lung-zone">
                      <strong>Campo Medio</strong>
                      <div className="radio-group">
                        <label><input type="radio" name="ruidos-der-medio" value="vesicular" checked={pulmonaryAuscultationData.ruidosDerechoMedio === 'vesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Medio', e.target.value)} />Vesicular</label>
                        <label><input type="radio" name="ruidos-der-medio" value="bronquial" checked={pulmonaryAuscultationData.ruidosDerechoMedio === 'bronquial'} onChange={(e) => handleLungSoundChange('Derecho', 'Medio', e.target.value)} />Bronquial</label>
                        <label><input type="radio" name="ruidos-der-medio" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosDerechoMedio === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Medio', e.target.value)} />Broncovesicular</label>
                        <label><input type="radio" name="ruidos-der-medio" value="disminuido" checked={pulmonaryAuscultationData.ruidosDerechoMedio === 'disminuido'} onChange={(e) => handleLungSoundChange('Derecho', 'Medio', e.target.value)} />Disminuido</label>
                        <label><input type="radio" name="ruidos-der-medio" value="abolido" checked={pulmonaryAuscultationData.ruidosDerechoMedio === 'abolido'} onChange={(e) => handleLungSoundChange('Derecho', 'Medio', e.target.value)} />Abolido</label>
                      </div>
                    </div>
                    
                    {/* Campo Inferior Derecho */}
                    <div className="lung-zone">
                      <strong>Campo Inferior</strong>
                      <div className="radio-group">
                        <label><input type="radio" name="ruidos-der-inferior" value="vesicular" checked={pulmonaryAuscultationData.ruidosDerechoInferior === 'vesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Inferior', e.target.value)} />Vesicular</label>
                        <label><input type="radio" name="ruidos-der-inferior" value="bronquial" checked={pulmonaryAuscultationData.ruidosDerechoInferior === 'bronquial'} onChange={(e) => handleLungSoundChange('Derecho', 'Inferior', e.target.value)} />Bronquial</label>
                        <label><input type="radio" name="ruidos-der-inferior" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosDerechoInferior === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Derecho', 'Inferior', e.target.value)} />Broncovesicular</label>
                        <label><input type="radio" name="ruidos-der-inferior" value="disminuido" checked={pulmonaryAuscultationData.ruidosDerechoInferior === 'disminuido'} onChange={(e) => handleLungSoundChange('Derecho', 'Inferior', e.target.value)} />Disminuido</label>
                        <label><input type="radio" name="ruidos-der-inferior" value="abolido" checked={pulmonaryAuscultationData.ruidosDerechoInferior === 'abolido'} onChange={(e) => handleLungSoundChange('Derecho', 'Inferior', e.target.value)} />Abolido</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pulmón Izquierdo */}
                  <div className="lung-side">
                    <h6>Pulmón Izquierdo</h6>
                    
                    {/* Ápice Izquierdo */}
                    <div className="lung-zone">
                      <strong>Ápice</strong>
                      <div className="radio-group">
                        <label><input type="radio" name="ruidos-izq-apice" value="vesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoApice === 'vesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Apice', e.target.value)} />Vesicular</label>
                        <label><input type="radio" name="ruidos-izq-apice" value="bronquial" checked={pulmonaryAuscultationData.ruidosIzquierdoApice === 'bronquial'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Apice', e.target.value)} />Bronquial</label>
                        <label><input type="radio" name="ruidos-izq-apice" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoApice === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Apice', e.target.value)} />Broncovesicular</label>
                        <label><input type="radio" name="ruidos-izq-apice" value="disminuido" checked={pulmonaryAuscultationData.ruidosIzquierdoApice === 'disminuido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Apice', e.target.value)} />Disminuido</label>
                        <label><input type="radio" name="ruidos-izq-apice" value="abolido" checked={pulmonaryAuscultationData.ruidosIzquierdoApice === 'abolido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Apice', e.target.value)} />Abolido</label>
                      </div>
                    </div>
                    
                    {/* Campo Superior Izquierdo */}
                    <div className="lung-zone">
                      <strong>Campo Superior</strong>
                      <div className="radio-group">
                        <label><input type="radio" name="ruidos-izq-superior" value="vesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoSuperior === 'vesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Superior', e.target.value)} />Vesicular</label>
                        <label><input type="radio" name="ruidos-izq-superior" value="bronquial" checked={pulmonaryAuscultationData.ruidosIzquierdoSuperior === 'bronquial'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Superior', e.target.value)} />Bronquial</label>
                        <label><input type="radio" name="ruidos-izq-superior" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoSuperior === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Superior', e.target.value)} />Broncovesicular</label>
                        <label><input type="radio" name="ruidos-izq-superior" value="disminuido" checked={pulmonaryAuscultationData.ruidosIzquierdoSuperior === 'disminuido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Superior', e.target.value)} />Disminuido</label>
                        <label><input type="radio" name="ruidos-izq-superior" value="abolido" checked={pulmonaryAuscultationData.ruidosIzquierdoSuperior === 'abolido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Superior', e.target.value)} />Abolido</label>
                      </div>
                    </div>
                    
                    {/* Campo Medio Izquierdo */}
                    <div className="lung-zone">
                      <strong>Campo Medio</strong>
                      <div className="radio-group">
                        <label><input type="radio" name="ruidos-izq-medio" value="vesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoMedio === 'vesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Medio', e.target.value)} />Vesicular</label>
                        <label><input type="radio" name="ruidos-izq-medio" value="bronquial" checked={pulmonaryAuscultationData.ruidosIzquierdoMedio === 'bronquial'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Medio', e.target.value)} />Bronquial</label>
                        <label><input type="radio" name="ruidos-izq-medio" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoMedio === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Medio', e.target.value)} />Broncovesicular</label>
                        <label><input type="radio" name="ruidos-izq-medio" value="disminuido" checked={pulmonaryAuscultationData.ruidosIzquierdoMedio === 'disminuido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Medio', e.target.value)} />Disminuido</label>
                        <label><input type="radio" name="ruidos-izq-medio" value="abolido" checked={pulmonaryAuscultationData.ruidosIzquierdoMedio === 'abolido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Medio', e.target.value)} />Abolido</label>
                      </div>
                    </div>
                    
                    {/* Campo Inferior Izquierdo */}
                    <div className="lung-zone">
                      <strong>Campo Inferior</strong>
                      <div className="radio-group">
                        <label><input type="radio" name="ruidos-izq-inferior" value="vesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoInferior === 'vesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Inferior', e.target.value)} />Vesicular</label>
                        <label><input type="radio" name="ruidos-izq-inferior" value="bronquial" checked={pulmonaryAuscultationData.ruidosIzquierdoInferior === 'bronquial'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Inferior', e.target.value)} />Bronquial</label>
                        <label><input type="radio" name="ruidos-izq-inferior" value="broncovesicular" checked={pulmonaryAuscultationData.ruidosIzquierdoInferior === 'broncovesicular'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Inferior', e.target.value)} />Broncovesicular</label>
                        <label><input type="radio" name="ruidos-izq-inferior" value="disminuido" checked={pulmonaryAuscultationData.ruidosIzquierdoInferior === 'disminuido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Inferior', e.target.value)} />Disminuido</label>
                        <label><input type="radio" name="ruidos-izq-inferior" value="abolido" checked={pulmonaryAuscultationData.ruidosIzquierdoInferior === 'abolido'} onChange={(e) => handleLungSoundChange('Izquierdo', 'Inferior', e.target.value)} />Abolido</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Ruidos Adventicios */}
              <div className="exam-container">
                <h5 className="exam-header">
                  <i className="fas fa-exclamation-triangle"></i> Ruidos Adventicios
                </h5>
                <div className="lung-map">
                  {/* Pulmón Derecho - Ruidos Adventicios */}
                  <div className="lung-side">
                    <h6>Pulmón Derecho</h6>
                    
                    {/* Ápice Derecho - Adventicios */}
                    <div className="lung-zone">
                      <strong>Ápice</strong>
                      <div className="checkbox-group">
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesDerechoApice} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Derecho', 'Apice', e.target.checked)} />Crepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesDerechoApice} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Derecho', 'Apice', e.target.checked)} />Subcrepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasDerechoApice} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Derecho', 'Apice', e.target.checked)} />Sibilancias</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusDerechoApice} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Derecho', 'Apice', e.target.checked)} />Roncus</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorDerechoApice} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Derecho', 'Apice', e.target.checked)} />Estridor</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralDerechoApice} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Derecho', 'Apice', e.target.checked)} />Roce pleural</label>
                      </div>
                    </div>
                    
                    {/* Campo Superior Derecho - Adventicios */}
                    <div className="lung-zone">
                      <strong>Campo Superior</strong>
                      <div className="checkbox-group">
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesDerechoSuperior} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Derecho', 'Superior', e.target.checked)} />Crepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesDerechoSuperior} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Derecho', 'Superior', e.target.checked)} />Subcrepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasDerechoSuperior} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Derecho', 'Superior', e.target.checked)} />Sibilancias</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusDerechoSuperior} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Derecho', 'Superior', e.target.checked)} />Roncus</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorDerechoSuperior} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Derecho', 'Superior', e.target.checked)} />Estridor</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralDerechoSuperior} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Derecho', 'Superior', e.target.checked)} />Roce pleural</label>
                      </div>
                    </div>
                    
                    {/* Campo Medio Derecho - Adventicios */}
                    <div className="lung-zone">
                      <strong>Campo Medio</strong>
                      <div className="checkbox-group">
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesDerechoMedio} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Derecho', 'Medio', e.target.checked)} />Crepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesDerechoMedio} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Derecho', 'Medio', e.target.checked)} />Subcrepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasDerechoMedio} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Derecho', 'Medio', e.target.checked)} />Sibilancias</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusDerechoMedio} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Derecho', 'Medio', e.target.checked)} />Roncus</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorDerechoMedio} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Derecho', 'Medio', e.target.checked)} />Estridor</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralDerechoMedio} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Derecho', 'Medio', e.target.checked)} />Roce pleural</label>
                      </div>
                    </div>
                    
                    {/* Campo Inferior Derecho - Adventicios */}
                    <div className="lung-zone">
                      <strong>Campo Inferior</strong>
                      <div className="checkbox-group">
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesDerechoInferior} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Derecho', 'Inferior', e.target.checked)} />Crepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesDerechoInferior} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Derecho', 'Inferior', e.target.checked)} />Subcrepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasDerechoInferior} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Derecho', 'Inferior', e.target.checked)} />Sibilancias</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusDerechoInferior} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Derecho', 'Inferior', e.target.checked)} />Roncus</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorDerechoInferior} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Derecho', 'Inferior', e.target.checked)} />Estridor</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralDerechoInferior} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Derecho', 'Inferior', e.target.checked)} />Roce pleural</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pulmón Izquierdo - Ruidos Adventicios */}
                  <div className="lung-side">
                    <h6>Pulmón Izquierdo</h6>
                    
                    {/* Ápice Izquierdo - Adventicios */}
                    <div className="lung-zone">
                      <strong>Ápice</strong>
                      <div className="checkbox-group">
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesIzquierdoApice} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Izquierdo', 'Apice', e.target.checked)} />Crepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesIzquierdoApice} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Izquierdo', 'Apice', e.target.checked)} />Subcrepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasIzquierdoApice} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Izquierdo', 'Apice', e.target.checked)} />Sibilancias</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusIzquierdoApice} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Izquierdo', 'Apice', e.target.checked)} />Roncus</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorIzquierdoApice} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Izquierdo', 'Apice', e.target.checked)} />Estridor</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralIzquierdoApice} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Izquierdo', 'Apice', e.target.checked)} />Roce pleural</label>
                      </div>
                    </div>
                    
                    {/* Campo Superior Izquierdo - Adventicios */}
                    <div className="lung-zone">
                      <strong>Campo Superior</strong>
                      <div className="checkbox-group">
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesIzquierdoSuperior} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Izquierdo', 'Superior', e.target.checked)} />Crepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesIzquierdoSuperior} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Izquierdo', 'Superior', e.target.checked)} />Subcrepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasIzquierdoSuperior} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Izquierdo', 'Superior', e.target.checked)} />Sibilancias</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusIzquierdoSuperior} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Izquierdo', 'Superior', e.target.checked)} />Roncus</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorIzquierdoSuperior} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Izquierdo', 'Superior', e.target.checked)} />Estridor</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralIzquierdoSuperior} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Izquierdo', 'Superior', e.target.checked)} />Roce pleural</label>
                      </div>
                    </div>
                    
                    {/* Campo Medio Izquierdo - Adventicios */}
                    <div className="lung-zone">
                      <strong>Campo Medio</strong>
                      <div className="checkbox-group">
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesIzquierdoMedio} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Izquierdo', 'Medio', e.target.checked)} />Crepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesIzquierdoMedio} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Izquierdo', 'Medio', e.target.checked)} />Subcrepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasIzquierdoMedio} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Izquierdo', 'Medio', e.target.checked)} />Sibilancias</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusIzquierdoMedio} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Izquierdo', 'Medio', e.target.checked)} />Roncus</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorIzquierdoMedio} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Izquierdo', 'Medio', e.target.checked)} />Estridor</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralIzquierdoMedio} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Izquierdo', 'Medio', e.target.checked)} />Roce pleural</label>
                      </div>
                    </div>
                    
                    {/* Campo Inferior Izquierdo - Adventicios */}
                    <div className="lung-zone">
                      <strong>Campo Inferior</strong>
                      <div className="checkbox-group">
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.crepitantesIzquierdoInferior} onChange={(e) => handleAdventitiousSoundToggle('crepitantes', 'Izquierdo', 'Inferior', e.target.checked)} />Crepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.subcrepitantesIzquierdoInferior} onChange={(e) => handleAdventitiousSoundToggle('subcrepitantes', 'Izquierdo', 'Inferior', e.target.checked)} />Subcrepitantes</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.sibilanciasIzquierdoInferior} onChange={(e) => handleAdventitiousSoundToggle('sibilancias', 'Izquierdo', 'Inferior', e.target.checked)} />Sibilancias</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.roncusIzquierdoInferior} onChange={(e) => handleAdventitiousSoundToggle('roncus', 'Izquierdo', 'Inferior', e.target.checked)} />Roncus</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.estridorIzquierdoInferior} onChange={(e) => handleAdventitiousSoundToggle('estridor', 'Izquierdo', 'Inferior', e.target.checked)} />Estridor</label>
                        <label><input type="checkbox" checked={pulmonaryAuscultationData.rocePleuralIzquierdoInferior} onChange={(e) => handleAdventitiousSoundToggle('rocePleural', 'Izquierdo', 'Inferior', e.target.checked)} />Roce pleural</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div className="section-content">
            <h3><i className="fas fa-stethoscope"></i> Auscultación Cardíaca</h3>
            
            {/* Focos Cardíacos */}
            <div className="auscultation-grid">
              {/* Foco Aórtico */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">Foco Aórtico (2° EIC derecho)</h4>
                <div className="form-group">
                  <label>R1:</label>
                  <select 
                    value={auscultationData.r1Aortico}
                    onChange={(e) => handleAuscultationChange('r1Aortico', e.target.value)}
                    className="select-field"
                  >
                    <option value="">-</option>
                    <option value="abolido">Abolido</option>
                    <option value="hipofonico">Hipofonético</option>
                    <option value="normal">Normal</option>
                    <option value="hiperfonico">Hiperfonético</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>R2:</label>
                  <select 
                    value={auscultationData.r2Aortico}
                    onChange={(e) => handleAuscultationChange('r2Aortico', e.target.value)}
                    className="select-field"
                  >
                    <option value="">-</option>
                    <option value="abolido">Abolido</option>
                    <option value="hipofonico">Hipofonético</option>
                    <option value="normal">Normal</option>
                    <option value="hiperfonico">Hiperfonético</option>
                  </select>
                </div>
                <div className="form-group">
                  <div className="checkbox-with-select">
                    <input 
                      type="checkbox" 
                      id="soplo-sist-aortico"
                      checked={auscultationData.soploSistAortico}
                      onChange={(e) => handleMurmurToggle('Aortico', 'Sist', e.target.checked)}
                    />
                    <label htmlFor="soplo-sist-aortico">Soplo sistólico</label>
                    <select 
                      value={auscultationData.soploSistAorticoGrado}
                      onChange={(e) => handleAuscultationChange('soploSistAorticoGrado', e.target.value)}
                      disabled={!auscultationData.soploSistAortico}
                      className="grade-select"
                    >
                      <option value="">-</option>
                      <option value="1">I/VI</option>
                      <option value="2">II/VI</option>
                      <option value="3">III/VI</option>
                      <option value="4">IV/VI</option>
                      <option value="5">V/VI</option>
                      <option value="6">VI/VI</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <div className="checkbox-with-select">
                    <input 
                      type="checkbox" 
                      id="soplo-diast-aortico"
                      checked={auscultationData.soploDiastAortico}
                      onChange={(e) => handleMurmurToggle('Aortico', 'Diast', e.target.checked)}
                    />
                    <label htmlFor="soplo-diast-aortico">Soplo diastólico</label>
                    <select 
                      value={auscultationData.soploDiastAorticoGrado}
                      onChange={(e) => handleAuscultationChange('soploDiastAorticoGrado', e.target.value)}
                      disabled={!auscultationData.soploDiastAortico}
                      className="grade-select"
                    >
                      <option value="">-</option>
                      <option value="1">I/VI</option>
                      <option value="2">II/VI</option>
                      <option value="3">III/VI</option>
                      <option value="4">IV/VI</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Foco Pulmonar */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">Foco Pulmonar (2° EIC izquierdo)</h4>
                <div className="form-group">
                  <label>R1:</label>
                  <select 
                    value={auscultationData.r1Pulmonar}
                    onChange={(e) => handleAuscultationChange('r1Pulmonar', e.target.value)}
                    className="select-field"
                  >
                    <option value="">-</option>
                    <option value="abolido">Abolido</option>
                    <option value="hipofonico">Hipofonético</option>
                    <option value="normal">Normal</option>
                    <option value="hiperfonico">Hiperfonético</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>R2:</label>
                  <select 
                    value={auscultationData.r2Pulmonar}
                    onChange={(e) => handleAuscultationChange('r2Pulmonar', e.target.value)}
                    className="select-field"
                  >
                    <option value="">-</option>
                    <option value="abolido">Abolido</option>
                    <option value="hipofonico">Hipofonético</option>
                    <option value="normal">Normal</option>
                    <option value="hiperfonico">Hiperfonético</option>
                  </select>
                </div>
                <div className="form-group">
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="desdoblamiento-r2"
                      checked={auscultationData.desdoblamiento}
                      onChange={(e) => handleAuscultationCheckbox('desdoblamiento', e.target.checked)}
                    />
                    <label htmlFor="desdoblamiento-r2">Desdoblamiento R2</label>
                  </div>
                </div>
                <div className="form-group">
                  <div className="checkbox-with-select">
                    <input 
                      type="checkbox" 
                      id="soplo-sist-pulmonar"
                      checked={auscultationData.soploSistPulmonar}
                      onChange={(e) => handleMurmurToggle('Pulmonar', 'Sist', e.target.checked)}
                    />
                    <label htmlFor="soplo-sist-pulmonar">Soplo sistólico</label>
                    <select 
                      value={auscultationData.soploSistPulmonarGrado}
                      onChange={(e) => handleAuscultationChange('soploSistPulmonarGrado', e.target.value)}
                      disabled={!auscultationData.soploSistPulmonar}
                      className="grade-select"
                    >
                      <option value="">-</option>
                      <option value="1">I/VI</option>
                      <option value="2">II/VI</option>
                      <option value="3">III/VI</option>
                      <option value="4">IV/VI</option>
                      <option value="5">V/VI</option>
                      <option value="6">VI/VI</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Foco Tricúspide */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">Foco Tricúspide (4° EIC izquierdo)</h4>
                <div className="form-group">
                  <label>R1:</label>
                  <select 
                    value={auscultationData.r1Tricuspide}
                    onChange={(e) => handleAuscultationChange('r1Tricuspide', e.target.value)}
                    className="select-field"
                  >
                    <option value="">-</option>
                    <option value="abolido">Abolido</option>
                    <option value="hipofonico">Hipofonético</option>
                    <option value="normal">Normal</option>
                    <option value="hiperfonico">Hiperfonético</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>R2:</label>
                  <select 
                    value={auscultationData.r2Tricuspide}
                    onChange={(e) => handleAuscultationChange('r2Tricuspide', e.target.value)}
                    className="select-field"
                  >
                    <option value="">-</option>
                    <option value="abolido">Abolido</option>
                    <option value="hipofonico">Hipofonético</option>
                    <option value="normal">Normal</option>
                    <option value="hiperfonico">Hiperfonético</option>
                  </select>
                </div>
                <div className="form-group">
                  <div className="checkbox-with-select">
                    <input 
                      type="checkbox" 
                      id="soplo-sist-tricuspide"
                      checked={auscultationData.soploSistTricuspide}
                      onChange={(e) => handleMurmurToggle('Tricuspide', 'Sist', e.target.checked)}
                    />
                    <label htmlFor="soplo-sist-tricuspide">Soplo sistólico</label>
                    <select 
                      value={auscultationData.soploSistTricuspideGrado}
                      onChange={(e) => handleAuscultationChange('soploSistTricuspideGrado', e.target.value)}
                      disabled={!auscultationData.soploSistTricuspide}
                      className="grade-select"
                    >
                      <option value="">-</option>
                      <option value="1">I/VI</option>
                      <option value="2">II/VI</option>
                      <option value="3">III/VI</option>
                      <option value="4">IV/VI</option>
                      <option value="5">V/VI</option>
                      <option value="6">VI/VI</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Foco Mitral */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">Foco Mitral (5° EIC izquierdo)</h4>
                <div className="form-group">
                  <label>R1:</label>
                  <select 
                    value={auscultationData.r1Mitral}
                    onChange={(e) => handleAuscultationChange('r1Mitral', e.target.value)}
                    className="select-field"
                  >
                    <option value="">-</option>
                    <option value="abolido">Abolido</option>
                    <option value="hipofonico">Hipofonético</option>
                    <option value="normal">Normal</option>
                    <option value="hiperfonico">Hiperfonético</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>R2:</label>
                  <select 
                    value={auscultationData.r2Mitral}
                    onChange={(e) => handleAuscultationChange('r2Mitral', e.target.value)}
                    className="select-field"
                  >
                    <option value="">-</option>
                    <option value="abolido">Abolido</option>
                    <option value="hipofonico">Hipofonético</option>
                    <option value="normal">Normal</option>
                    <option value="hiperfonico">Hiperfonético</option>
                  </select>
                </div>
                <div className="form-group">
                  <div className="checkbox-with-select">
                    <input 
                      type="checkbox" 
                      id="soplo-sist-mitral"
                      checked={auscultationData.soploSistMitral}
                      onChange={(e) => handleMurmurToggle('Mitral', 'Sist', e.target.checked)}
                    />
                    <label htmlFor="soplo-sist-mitral">Soplo sistólico</label>
                    <select 
                      value={auscultationData.soploSistMitralGrado}
                      onChange={(e) => handleAuscultationChange('soploSistMitralGrado', e.target.value)}
                      disabled={!auscultationData.soploSistMitral}
                      className="grade-select"
                    >
                      <option value="">-</option>
                      <option value="1">I/VI</option>
                      <option value="2">II/VI</option>
                      <option value="3">III/VI</option>
                      <option value="4">IV/VI</option>
                      <option value="5">V/VI</option>
                      <option value="6">VI/VI</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <div className="checkbox-with-select">
                    <input 
                      type="checkbox" 
                      id="soplo-diast-mitral"
                      checked={auscultationData.soploDiastMitral}
                      onChange={(e) => handleMurmurToggle('Mitral', 'Diast', e.target.checked)}
                    />
                    <label htmlFor="soplo-diast-mitral">Soplo diastólico</label>
                    <select 
                      value={auscultationData.soploDiastMitralGrado}
                      onChange={(e) => handleAuscultationChange('soploDiastMitralGrado', e.target.value)}
                      disabled={!auscultationData.soploDiastMitral}
                      className="grade-select"
                    >
                      <option value="">-</option>
                      <option value="1">I/VI</option>
                      <option value="2">II/VI</option>
                      <option value="3">III/VI</option>
                      <option value="4">IV/VI</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Características Detalladas de Soplos */}
            <div className="sub-section-card">
              <h4 className="sub-section-title">
                <i className="fas fa-wave-square"></i> Características Detalladas de Soplos
              </h4>
              
              <div className="form-group">
                <label>Irradiación del soplo:</label>
                <div className="checkbox-grid">
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="irradiacion-axila"
                      checked={auscultationData.irradiacionAxila}
                      onChange={(e) => handleAuscultationCheckbox('irradiacionAxila', e.target.checked)}
                    />
                    <label htmlFor="irradiacion-axila">Hacia axila</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="irradiacion-cuello"
                      checked={auscultationData.irradiacionCuello}
                      onChange={(e) => handleAuscultationCheckbox('irradiacionCuello', e.target.checked)}
                    />
                    <label htmlFor="irradiacion-cuello">Hacia cuello</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="irradiacion-espalda"
                      checked={auscultationData.irradiacionEspalda}
                      onChange={(e) => handleAuscultationCheckbox('irradiacionEspalda', e.target.checked)}
                    />
                    <label htmlFor="irradiacion-espalda">Hacia espalda</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="irradiacion-punta"
                      checked={auscultationData.irradiacionPunta}
                      onChange={(e) => handleAuscultationCheckbox('irradiacionPunta', e.target.checked)}
                    />
                    <label htmlFor="irradiacion-punta">Hacia punta</label>
                  </div>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Relación con respiración:</label>
                  <select 
                    value={auscultationData.soplosRespiracion}
                    onChange={(e) => handleAuscultationChange('soplosRespiracion', e.target.value)}
                    className="select-field"
                  >
                    <option value="">Seleccione...</option>
                    <option value="aumenta-inspiracion">Aumenta con inspiración</option>
                    <option value="disminuye-inspiracion">Disminuye con inspiración</option>
                    <option value="no-cambia">No cambia con respiración</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Relación con maniobras:</label>
                  <select 
                    value={auscultationData.soplosManiobras}
                    onChange={(e) => handleAuscultationChange('soplosManiobras', e.target.value)}
                    className="select-field"
                  >
                    <option value="">Seleccione...</option>
                    <option value="aumenta-valsalva">Aumenta con Valsalva</option>
                    <option value="disminuye-valsalva">Disminuye con Valsalva</option>
                    <option value="aumenta-handgrip">Aumenta con handgrip</option>
                    <option value="disminuye-handgrip">Disminuye con handgrip</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Descripción adicional del soplo:</label>
                <textarea 
                  value={auscultationData.soplosDescripcion}
                  onChange={(e) => handleAuscultationChange('soplosDescripcion', e.target.value)}
                  rows="3" 
                  placeholder="Describe tono, timbre, forma del soplo (crescendo, decrescendo, holosistólico, etc.)..."
                  className="textarea-field"
                />
              </div>
            </div>

            {/* Otros Hallazgos Auscultatorios */}
            <div className="sub-section-card">
              <h4 className="sub-section-title">
                <i className="fas fa-headphones"></i> Otros Hallazgos Auscultatorios
              </h4>
              
              <div className="checkbox-grid">
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="r3-galope"
                    checked={auscultationData.r3Galope}
                    onChange={(e) => handleAuscultationCheckbox('r3Galope', e.target.checked)}
                  />
                  <label htmlFor="r3-galope">R3 (galope ventricular)</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="r4-galope"
                    checked={auscultationData.r4Galope}
                    onChange={(e) => handleAuscultationCheckbox('r4Galope', e.target.checked)}
                  />
                  <label htmlFor="r4-galope">R4 (galope auricular)</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="click-sistolico"
                    checked={auscultationData.clickSistolico}
                    onChange={(e) => handleAuscultationCheckbox('clickSistolico', e.target.checked)}
                  />
                  <label htmlFor="click-sistolico">Click sistólico</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="chasquido-apertura"
                    checked={auscultationData.chasquidoApertura}
                    onChange={(e) => handleAuscultationCheckbox('chasquidoApertura', e.target.checked)}
                  />
                  <label htmlFor="chasquido-apertura">Chasquido de apertura</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="roce-pericardico"
                    checked={auscultationData.rocePericardico}
                    onChange={(e) => handleAuscultationCheckbox('rocePericardico', e.target.checked)}
                  />
                  <label htmlFor="roce-pericardico">Roce pericárdico</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="arritmia-auscultacion"
                    checked={auscultationData.arritmiaAuscultacion}
                    onChange={(e) => handleAuscultationCheckbox('arritmiaAuscultacion', e.target.checked)}
                  />
                  <label htmlFor="arritmia-auscultacion">Arritmia auscultada</label>
                </div>
              </div>
              
              <div className="form-group">
                <label>Características detalladas de soplos (global):</label>
                <textarea 
                  value={auscultationData.soplosDescripcionGlobal}
                  onChange={(e) => handleAuscultationChange('soplosDescripcionGlobal', e.target.value)}
                  rows="4" 
                  placeholder="Describa localización, irradiación, intensidad, relación con respiración y maniobras..."
                  className="textarea-field"
                />
              </div>
            </div>
          </div>
        );

      case 'peripheral-circulation':
        return (
          <div className="section-content">
            <h3><i className="fas fa-wave-square"></i> Circulación Periférica y Edemas</h3>
            
            {/* Edemas */}
            <div className="sub-section-card">
              <h4 className="sub-section-title">
                <i className="fas fa-water"></i> Edemas
              </h4>
              
              <div className="form-group">
                <label>Presencia de edemas:</label>
                <select 
                  value={peripheralCirculationData.edemasPresencia}
                  onChange={(e) => handlePeripheralCirculationChange('edemasPresencia', e.target.value)}
                  className="select-field"
                >
                  <option value="">Seleccione...</option>
                  <option value="sin-edemas">Sin edemas</option>
                  <option value="edemas-perifericos">Edemas periféricos</option>
                  <option value="edema-pulmonar">Signos de edema pulmonar</option>
                  <option value="anasarca">Anasarca</option>
                  <option value="ascitis">Ascitis</option>
                </select>
              </div>
              
              {peripheralCirculationData.edemasPresencia && peripheralCirculationData.edemasPresencia !== 'sin-edemas' && (
                <div className="sub-detail-card">
                  <h5 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Detalles de Edemas</h5>
                  
                  <div className="form-group">
                    <label>Localización e intensidad de edemas:</label>
                    <div className="edema-grid">
                      <div className="edema-item">
                        <label htmlFor="edema-pies">Pies:</label>
                        <select 
                          id="edema-pies"
                          value={peripheralCirculationData.edemaPies || '0'}
                          onChange={(e) => handlePeripheralCirculationChange('edemaPies', e.target.value)}
                          className="select-field"
                        >
                          <option value="0">0</option>
                          <option value="1">+</option>
                          <option value="2">++</option>
                          <option value="3">+++</option>
                          <option value="4">++++</option>
                        </select>
                      </div>
                      
                      <div className="edema-item">
                        <label htmlFor="edema-piernas">Piernas:</label>
                        <select 
                          id="edema-piernas"
                          value={peripheralCirculationData.edemaPiernas || '0'}
                          onChange={(e) => handlePeripheralCirculationChange('edemaPiernas', e.target.value)}
                          className="select-field"
                        >
                          <option value="0">0</option>
                          <option value="1">+</option>
                          <option value="2">++</option>
                          <option value="3">+++</option>
                          <option value="4">++++</option>
                        </select>
                      </div>
                      
                      <div className="edema-item">
                        <label htmlFor="edema-muslos">Muslos:</label>
                        <select 
                          id="edema-muslos"
                          value={peripheralCirculationData.edemaMuslos || '0'}
                          onChange={(e) => handlePeripheralCirculationChange('edemaMuslos', e.target.value)}
                          className="select-field"
                        >
                          <option value="0">0</option>
                          <option value="1">+</option>
                          <option value="2">++</option>
                          <option value="3">+++</option>
                          <option value="4">++++</option>
                        </select>
                      </div>
                      
                      <div className="edema-item">
                        <label htmlFor="edema-sacro">Región sacra:</label>
                        <select 
                          id="edema-sacro"
                          value={peripheralCirculationData.edemaSacro || '0'}
                          onChange={(e) => handlePeripheralCirculationChange('edemaSacro', e.target.value)}
                          className="select-field"
                        >
                          <option value="0">0</option>
                          <option value="1">+</option>
                          <option value="2">++</option>
                          <option value="3">+++</option>
                          <option value="4">++++</option>
                        </select>
                      </div>
                      
                      <div className="edema-item">
                        <label htmlFor="edema-parpados">Párpados:</label>
                        <select 
                          id="edema-parpados"
                          value={peripheralCirculationData.edemaParpados || '0'}
                          onChange={(e) => handlePeripheralCirculationChange('edemaParpados', e.target.value)}
                          className="select-field"
                        >
                          <option value="0">0</option>
                          <option value="1">+</option>
                          <option value="2">++</option>
                          <option value="3">+++</option>
                        </select>
                      </div>
                      
                      <div className="edema-item">
                        <label htmlFor="edema-abdomen">Abdomen:</label>
                        <select 
                          id="edema-abdomen"
                          value={peripheralCirculationData.edemaAbdomen || '0'}
                          onChange={(e) => handlePeripheralCirculationChange('edemaAbdomen', e.target.value)}
                          className="select-field"
                        >
                          <option value="0">0</option>
                          <option value="1">+</option>
                          <option value="2">++</option>
                          <option value="3">+++</option>
                          <option value="4">++++</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Características de los edemas:</label>
                    <div className="checkbox-grid">
                      <div className="checkbox-item">
                        <input 
                          type="checkbox" 
                          id="edema-simetrico"
                          checked={peripheralCirculationData.edemaSimetrico}
                          onChange={(e) => handlePeripheralCirculationCheckbox('edemaSimetrico', e.target.checked)}
                        />
                        <label htmlFor="edema-simetrico">Simétricos</label>
                      </div>
                      <div className="checkbox-item">
                        <input 
                          type="checkbox" 
                          id="edema-fovea"
                          checked={peripheralCirculationData.edemaFovea}
                          onChange={(e) => handlePeripheralCirculationCheckbox('edemaFovea', e.target.checked)}
                        />
                        <label htmlFor="edema-fovea">Deja fóvea</label>
                      </div>
                      <div className="checkbox-item">
                        <input 
                          type="checkbox" 
                          id="edema-frio"
                          checked={peripheralCirculationData.edemaFrio}
                          onChange={(e) => handlePeripheralCirculationCheckbox('edemaFrio', e.target.checked)}
                        />
                        <label htmlFor="edema-frio">Frío al tacto</label>
                      </div>
                      <div className="checkbox-item">
                        <input 
                          type="checkbox" 
                          id="edema-caliente"
                          checked={peripheralCirculationData.edemaCaliente}
                          onChange={(e) => handlePeripheralCirculationCheckbox('edemaCaliente', e.target.checked)}
                        />
                        <label htmlFor="edema-caliente">Caliente al tacto</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Venas y Piel */}
            <div className="sub-section-card">
              <h4 className="sub-section-title">
                <i className="fas fa-hand-holding-water"></i> Venas y Piel
              </h4>
              
              <div className="form-group">
                <label>Estado de las venas:</label>
                <select 
                  value={peripheralCirculationData.estadoVenas}
                  onChange={(e) => handlePeripheralCirculationChange('estadoVenas', e.target.value)}
                  className="select-field"
                >
                  <option value="">Seleccione...</option>
                  <option value="normales">No dilatadas</option>
                  <option value="varices">Varicosamente dilatadas</option>
                  <option value="ingurgitacion-yugular">Ingurgitación yugular</option>
                  <option value="reflujo-hepatoyugular">Reflujo hepatoyugular positivo</option>
                </select>
              </div>
              
              {peripheralCirculationData.estadoVenas && peripheralCirculationData.estadoVenas !== 'normales' && (
                <div className="sub-detail-card">
                  <h5 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Detalles de Venas</h5>
                  <div className="form-group">
                    <label>Descripción de cambios venosos:</label>
                    <textarea 
                      value={peripheralCirculationData.venasDescripcion}
                      onChange={(e) => handlePeripheralCirculationChange('venasDescripcion', e.target.value)}
                      rows="4" 
                      placeholder="Describa localización, grado, presencia de complicaciones..."
                      className="textarea-field"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Color de la piel:</label>
                    <select 
                      value={peripheralCirculationData.colorPiel}
                      onChange={(e) => handlePeripheralCirculationChange('colorPiel', e.target.value)}
                      className="select-field"
                    >
                      <option value="">Seleccione...</option>
                      <option value="normal">Normal</option>
                      <option value="palido">Pálido</option>
                      <option value="cianotico">Cianótico</option>
                      <option value="acrocianosis">Acrocianosis</option>
                      <option value="marmoreo">Piel marmórea</option>
                      <option value="hiperpigmentado">Hiperpigmentado</option>
                      <option value="ulceraciones">Con ulceraciones</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'vascular-peripheral':
        return (
          <div className="section-content">
            <h3><i className="fas fa-heart-pulse"></i> Examen Vascular Periférico</h3>
            
            <div className="vascular-grid">
              {/* Lado Derecho */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">Lado Derecho</h4>
                
                <div className="mb-4">
                  <h5 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Miembros Superiores</h5>
                  
                  <div className="pulse-item">
                    <span>Radial:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="radial-der" 
                            value={grade}
                            checked={vascularPeripheralData.radialDer === grade}
                            onChange={(e) => handleVascularPeripheralChange('radialDer', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pulse-item">
                    <span>Cubital:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="cubital-der" 
                            value={grade}
                            checked={vascularPeripheralData.cubitalDer === grade}
                            onChange={(e) => handleVascularPeripheralChange('cubitalDer', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pulse-item">
                    <span>Braquial:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="braquial-der" 
                            value={grade}
                            checked={vascularPeripheralData.braquialDer === grade}
                            onChange={(e) => handleVascularPeripheralChange('braquialDer', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Miembros Inferiores</h5>
                  
                  <div className="pulse-item">
                    <span>Femoral:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="femoral-der" 
                            value={grade}
                            checked={vascularPeripheralData.femoralDer === grade}
                            onChange={(e) => handleVascularPeripheralChange('femoralDer', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pulse-item">
                    <span>Poplíteo:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="popliteo-der" 
                            value={grade}
                            checked={vascularPeripheralData.popliteoDer === grade}
                            onChange={(e) => handleVascularPeripheralChange('popliteoDer', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pulse-item">
                    <span>Tibial posterior:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="tibial-post-der" 
                            value={grade}
                            checked={vascularPeripheralData.tibialPostDer === grade}
                            onChange={(e) => handleVascularPeripheralChange('tibialPostDer', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pulse-item">
                    <span>Pedio:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="pedio-der" 
                            value={grade}
                            checked={vascularPeripheralData.pedioDer === grade}
                            onChange={(e) => handleVascularPeripheralChange('pedioDer', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Lado Izquierdo */}
              <div className="sub-section-card">
                <h4 className="sub-section-title">Lado Izquierdo</h4>
                
                <div className="mb-4">
                  <h5 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Miembros Superiores</h5>
                  
                  <div className="pulse-item">
                    <span>Radial:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="radial-izq" 
                            value={grade}
                            checked={vascularPeripheralData.radialIzq === grade}
                            onChange={(e) => handleVascularPeripheralChange('radialIzq', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pulse-item">
                    <span>Cubital:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="cubital-izq" 
                            value={grade}
                            checked={vascularPeripheralData.cubitalIzq === grade}
                            onChange={(e) => handleVascularPeripheralChange('cubitalIzq', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pulse-item">
                    <span>Braquial:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="braquial-izq" 
                            value={grade}
                            checked={vascularPeripheralData.braquialIzq === grade}
                            onChange={(e) => handleVascularPeripheralChange('braquialIzq', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Miembros Inferiores</h5>
                  
                  <div className="pulse-item">
                    <span>Femoral:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="femoral-izq" 
                            value={grade}
                            checked={vascularPeripheralData.femoralIzq === grade}
                            onChange={(e) => handleVascularPeripheralChange('femoralIzq', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pulse-item">
                    <span>Poplíteo:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="popliteo-izq" 
                            value={grade}
                            checked={vascularPeripheralData.popliteoIzq === grade}
                            onChange={(e) => handleVascularPeripheralChange('popliteoIzq', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pulse-item">
                    <span>Tibial posterior:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="tibial-post-izq" 
                            value={grade}
                            checked={vascularPeripheralData.tibialPostIzq === grade}
                            onChange={(e) => handleVascularPeripheralChange('tibialPostIzq', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pulse-item">
                    <span>Pedio:</span>
                    <div className="pulse-options">
                      {['0', '1+', '2+', '3+', '4+'].map(grade => (
                        <label key={grade} className="pulse-option">
                          <input 
                            type="radio" 
                            name="pedio-izq" 
                            value={grade}
                            checked={vascularPeripheralData.pedioIzq === grade}
                            onChange={(e) => handleVascularPeripheralChange('pedioIzq', e.target.value)}
                          />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="legend text-center mt-4">
              <span>Escala: 0 = Ausente, 1+ = Débil, 2+ = Normal, 3+ = Aumentado, 4+ = Saltón</span>
            </div>
            
            {/* Índice Tobillo-Brazo */}
            <div className="sub-section-card mt-4">
              <h4 className="sub-section-title">
                <i className="fas fa-ruler-horizontal"></i> Índice Tobillo-Brazo (ITB)
              </h4>
              
              <div className="form-grid">
                <div className="measurement">
                  <label>PA sistólica brazo derecho:</label>
                  <div className="input-with-unit">
                    <input 
                      type="number" 
                      value={vascularPeripheralData.paBrazoDer}
                      onChange={(e) => {
                        handleVascularPeripheralChange('paBrazoDer', e.target.value);
                        setTimeout(calculateITB, 100);
                      }}
                      min="70" 
                      max="250" 
                      className="input-field"
                    />
                    <span className="unit">mmHg</span>
                  </div>
                </div>
                
                <div className="measurement">
                  <label>PA sistólica brazo izquierdo:</label>
                  <div className="input-with-unit">
                    <input 
                      type="number" 
                      value={vascularPeripheralData.paBrazoIzq}
                      onChange={(e) => {
                        handleVascularPeripheralChange('paBrazoIzq', e.target.value);
                        setTimeout(calculateITB, 100);
                      }}
                      min="70" 
                      max="250" 
                      className="input-field"
                    />
                    <span className="unit">mmHg</span>
                  </div>
                </div>
              </div>
              
              <div className="form-grid mt-4">
                <div className="measurement">
                  <label>PA sistólica tobillo derecho:</label>
                  <div className="input-with-unit">
                    <input 
                      type="number" 
                      value={vascularPeripheralData.paTobilloDer}
                      onChange={(e) => {
                        handleVascularPeripheralChange('paTobilloDer', e.target.value);
                        setTimeout(calculateITB, 100);
                      }}
                      min="50" 
                      max="250" 
                      className="input-field"
                    />
                    <span className="unit">mmHg</span>
                  </div>
                </div>
                
                <div className="measurement">
                  <label>PA sistólica tobillo izquierdo:</label>
                  <div className="input-with-unit">
                    <input 
                      type="number" 
                      value={vascularPeripheralData.paTobilloIzq}
                      onChange={(e) => {
                        handleVascularPeripheralChange('paTobilloIzq', e.target.value);
                        setTimeout(calculateITB, 100);
                      }}
                      min="50" 
                      max="250" 
                      className="input-field"
                    />
                    <span className="unit">mmHg</span>
                  </div>
                </div>
              </div>
              
              <div className="score-item mt-4">
                <span>ITB derecho:</span>
                <span className="score-value">{vascularPeripheralData.itbDerecho || '--'}</span>
              </div>
              
              <div className="score-item">
                <span>ITB izquierdo:</span>
                <span className="score-value">{vascularPeripheralData.itbIzquierdo || '--'}</span>
              </div>
              
              <div className="score-item">
                <span>Interpretación:</span>
                <span className="score-value">{vascularPeripheralData.itbInterpretacion || '--'}</span>
              </div>
            </div>
          </div>
        );

      case 'electrocardiogram':
        return (
          <div className="section-content">
            <h3>Electrocardiograma</h3>
            
            {/* Ritmo y Frecuencia */}
            <div className="form-group">
              <h4>Ritmo y Frecuencia</h4>
              <div className="form-row">
                <div className="form-field">
                  <label>Ritmo:</label>
                  <select 
                    value={ecgData.ritmo} 
                    onChange={(e) => handleEcgChange('ritmo', e.target.value)}
                    className="select-field"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="sinusal">Sinusal</option>
                    <option value="fibrilacion-auricular">Fibrilación auricular</option>
                    <option value="flutter-auricular">Flutter auricular</option>
                    <option value="taquicardia-supraventricular">Taquicardia supraventricular</option>
                    <option value="taquicardia-ventricular">Taquicardia ventricular</option>
                    <option value="bradicardia">Bradicardia</option>
                    <option value="ritmo-nodal">Ritmo nodal</option>
                    <option value="marcapasos">Marcapasos</option>
                  </select>
                </div>
                
                <div className="form-field">
                  <label>Frecuencia cardíaca:</label>
                  <input 
                    type="number" 
                    value={ecgData.frecuenciaCardiaca} 
                    onChange={(e) => handleEcgChange('frecuenciaCardiaca', e.target.value)}
                    placeholder="lpm"
                    min="30" 
                    max="250" 
                    className="input-field"
                  />
                </div>
                
                <div className="form-field">
                  <label>Regularidad:</label>
                  <select 
                    value={ecgData.regularidad} 
                    onChange={(e) => handleEcgChange('regularidad', e.target.value)}
                    className="select-field"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="regular">Regular</option>
                    <option value="irregular">Irregular</option>
                    <option value="irregularmente-irregular">Irregularmente irregular</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Conducción e Intervalos */}
            <div className="form-group">
              <h4>Conducción e Intervalos</h4>
              <div className="form-row">
                <div className="form-field">
                  <label>Conducción:</label>
                  <select 
                    value={ecgData.conduccion} 
                    onChange={(e) => handleEcgChange('conduccion', e.target.value)}
                    className="select-field"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="normal">Normal</option>
                    <option value="bloqueo-av-primer-grado">Bloqueo AV 1er grado</option>
                    <option value="bloqueo-av-segundo-grado">Bloqueo AV 2do grado</option>
                    <option value="bloqueo-av-tercer-grado">Bloqueo AV 3er grado</option>
                    <option value="bloqueo-rama-derecha">Bloqueo rama derecha</option>
                    <option value="bloqueo-rama-izquierda">Bloqueo rama izquierda</option>
                    <option value="hemibloqueo-anterior">Hemibloqueo anterior</option>
                    <option value="hemibloqueo-posterior">Hemibloqueo posterior</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <label>Intervalo PR (ms):</label>
                  <input 
                    type="number" 
                    value={ecgData.intervaloPR} 
                    onChange={(e) => handleEcgChange('intervaloPR', e.target.value)}
                    placeholder="120-200"
                    min="80" 
                    max="400" 
                    className="input-field"
                  />
                </div>
                
                <div className="form-field">
                  <label>Ancho QRS (ms):</label>
                  <input 
                    type="number" 
                    value={ecgData.anchoQRS} 
                    onChange={(e) => handleEcgChange('anchoQRS', e.target.value)}
                    placeholder="80-120"
                    min="60" 
                    max="200" 
                    className="input-field"
                  />
                </div>
                
                <div className="form-field">
                  <label>Intervalo QT (ms):</label>
                  <input 
                    type="number" 
                    value={ecgData.intervaloQT} 
                    onChange={(e) => handleEcgChange('intervaloQT', e.target.value)}
                    placeholder="350-450"
                    min="300" 
                    max="600" 
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Hipertrofia */}
            <div className="form-group">
              <h4>Hipertrofia</h4>
              <div className="checkbox-grid">
                <label className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={ecgData.hipertrofiaVI} 
                    onChange={(e) => handleEcgCheckbox('hipertrofiaVI', e.target.checked)}
                  />
                  <span>Hipertrofia VI</span>
                </label>
                
                <label className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={ecgData.hipertrofiaVD} 
                    onChange={(e) => handleEcgCheckbox('hipertrofiaVD', e.target.checked)}
                  />
                  <span>Hipertrofia VD</span>
                </label>
                
                <label className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={ecgData.hipertrofiaAI} 
                    onChange={(e) => handleEcgCheckbox('hipertrofiaAI', e.target.checked)}
                  />
                  <span>Hipertrofia AI</span>
                </label>
                
                <label className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={ecgData.hipertrofiaAD} 
                    onChange={(e) => handleEcgCheckbox('hipertrofiaAD', e.target.checked)}
                  />
                  <span>Hipertrofia AD</span>
                </label>
              </div>
            </div>

            {/* Cambios Isquémicos */}
            <div className="form-group">
              <h4>Cambios Isquémicos</h4>
              <div className="form-field">
                <label>Tipo de cambios:</label>
                <select 
                  value={ecgData.cambiosIsquemicos} 
                  onChange={(e) => handleIschemicChanges(e.target.value)}
                  className="select-field"
                >
                  <option value="">Sin cambios</option>
                  <option value="depresion-st">Depresión del ST</option>
                  <option value="elevacion-st">Elevación del ST</option>
                  <option value="inversion-t">Inversión de T</option>
                  <option value="ondas-q">Ondas Q patológicas</option>
                  <option value="cambios-mixtos">Cambios mixtos</option>
                </select>
              </div>
              
              {ecgData.cambiosIsquemicos && (
                <div className="checkbox-grid mt-3">
                  <label className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={ecgData.paredAnterior} 
                      onChange={(e) => handleEcgCheckbox('paredAnterior', e.target.checked)}
                    />
                    <span>Pared anterior</span>
                  </label>
                  
                  <label className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={ecgData.paredInferior} 
                      onChange={(e) => handleEcgCheckbox('paredInferior', e.target.checked)}
                    />
                    <span>Pared inferior</span>
                  </label>
                  
                  <label className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={ecgData.paredLateral} 
                      onChange={(e) => handleEcgCheckbox('paredLateral', e.target.checked)}
                    />
                    <span>Pared lateral</span>
                  </label>
                  
                  <label className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={ecgData.paredPosterior} 
                      onChange={(e) => handleEcgCheckbox('paredPosterior', e.target.checked)}
                    />
                    <span>Pared posterior</span>
                  </label>
                  
                  <label className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={ecgData.septo} 
                      onChange={(e) => handleEcgCheckbox('septo', e.target.checked)}
                    />
                    <span>Septo</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        );

      case 'risk-scales':
        return (
          <div className="section-content">
            <RiskScales />
          </div>
        );

      case 'joint-examination':
        return (
          <div className="section-content">
            <h3><i className="fas fa-bone"></i> Examen Articular Sistemático</h3>
            
            <div className="legend" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#e74c3c', borderRadius: '4px' }}></div>
                <span>Examen Articular</span>
              </div>
            </div>

            {/* Manos y Muñecas */}
            <div className="sub-section-card" style={{ marginBottom: '30px', border: '1px solid #e1e8ed', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ marginBottom: '20px', color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>
                <i className="fas fa-hand"></i> Manos y Muñecas
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Mano Derecha */}
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '15px', textAlign: 'center', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>Mano Derecha</div>
                  
                  {/* Articulaciones IFP */}
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ marginBottom: '10px', color: '#6c757d' }}>Articulaciones IFP</h5>
                    {['2° dedo', '3° dedo', '4° dedo', '5° dedo'].map((dedo, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f1f3f4' }}>
                        <span>{dedo}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> D
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> T
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> L
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Articulaciones MCF */}
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ marginBottom: '10px', color: '#6c757d' }}>Articulaciones MCF</h5>
                    {['1° dedo', '2° dedo', '3° dedo', '4° dedo', '5° dedo'].map((dedo, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f1f3f4' }}>
                        <span>{dedo}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> D
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> T
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> L
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Muñeca */}
                  <div>
                    <h5 style={{ marginBottom: '10px', color: '#6c757d' }}>Muñeca</h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f1f3f4' }}>
                      <span>Radiocarpiana</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="checkbox" /> D
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="checkbox" /> T
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="checkbox" /> L
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mano Izquierda */}
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '15px', textAlign: 'center', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>Mano Izquierda</div>
                  
                  {/* Articulaciones IFP */}
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ marginBottom: '10px', color: '#6c757d' }}>Articulaciones IFP</h5>
                    {['2° dedo', '3° dedo', '4° dedo', '5° dedo'].map((dedo, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f1f3f4' }}>
                        <span>{dedo}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> D
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> T
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> L
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Articulaciones MCF */}
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ marginBottom: '10px', color: '#6c757d' }}>Articulaciones MCF</h5>
                    {['1° dedo', '2° dedo', '3° dedo', '4° dedo', '5° dedo'].map((dedo, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f1f3f4' }}>
                        <span>{dedo}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> D
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> T
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> L
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Muñeca */}
                  <div>
                    <h5 style={{ marginBottom: '10px', color: '#6c757d' }}>Muñeca</h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f1f3f4' }}>
                      <span>Radiocarpiana</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="checkbox" /> D
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="checkbox" /> T
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="checkbox" /> L
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '15px', textAlign: 'center', fontStyle: 'italic' }}>
                D = Dolor, T = Tumefacción, L = Limitación del movimiento
              </div>
            </div>

            {/* Articulaciones Grandes */}
            <div className="sub-section-card" style={{ marginBottom: '30px', border: '1px solid #e1e8ed', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ marginBottom: '20px', color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>Articulaciones Grandes</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Lado Derecho */}
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '15px', textAlign: 'center', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>Lado Derecho</div>
                  {[
                    { name: 'Hombro', joint: 'Glenohumeral' },
                    { name: 'Codo', joint: 'Humeroulnar' },
                    { name: 'Cadera', joint: 'Coxofemoral' },
                    { name: 'Rodilla', joint: 'Tibiofemoral' },
                    { name: 'Tobillo', joint: 'Tibiotalar' }
                  ].map((item, index) => (
                    <div key={index} style={{ marginBottom: '15px' }}>
                      <h5 style={{ marginBottom: '8px', color: '#6c757d' }}>{item.name}</h5>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f1f3f4' }}>
                        <span>{item.joint}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> D
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> T
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> L
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Lado Izquierdo */}
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '15px', textAlign: 'center', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>Lado Izquierdo</div>
                  {[
                    { name: 'Hombro', joint: 'Glenohumeral' },
                    { name: 'Codo', joint: 'Humeroulnar' },
                    { name: 'Cadera', joint: 'Coxofemoral' },
                    { name: 'Rodilla', joint: 'Tibiofemoral' },
                    { name: 'Tobillo', joint: 'Tibiotalar' }
                  ].map((item, index) => (
                    <div key={index} style={{ marginBottom: '15px' }}>
                      <h5 style={{ marginBottom: '8px', color: '#6c757d' }}>{item.name}</h5>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f1f3f4' }}>
                        <span>{item.joint}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> D
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> T
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> L
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna Vertebral */}
            <div className="sub-section-card" style={{ marginBottom: '30px', border: '1px solid #e1e8ed', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ marginBottom: '20px', color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>Columna Vertebral</h4>
              <h5 style={{ marginBottom: '15px', color: '#6c757d' }}>Segmentos Espinales</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {[
                  { name: 'Cervical', segments: [{ name: 'Occipito-atloidea' }, { name: 'C2-C7' }] },
                  { name: 'Torácica', segments: [{ name: 'T1-T12' }] },
                  { name: 'Lumbar', segments: [{ name: 'L1-L5' }] },
                  { name: 'Sacroilíacas', segments: [{ name: 'Bilateral' }] }
                ].map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <h5 style={{ marginBottom: '10px', color: '#6c757d' }}>{section.name}</h5>
                    {section.segments.map((segment, segmentIndex) => (
                      <div key={segmentIndex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f1f3f4', marginBottom: '5px' }}>
                        <span>{segment.name}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> D
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="checkbox" /> L
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'disease-activity':
        return (
          <div className="section-content">
            <h3><i className="fas fa-chart-line"></i> Escalas de Actividad de Enfermedad</h3>
            
            {/* Escala DAS28 */}
            <div className="sub-section-card" style={{ marginBottom: '30px', border: '1px solid #e1e8ed', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ marginBottom: '20px', color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>Escala DAS28 (Disease Activity Score)</h4>
              <div className="score-calculation">
                <h5 style={{ marginBottom: '15px', color: '#6c757d' }}>Componentes del DAS28</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: '500', color: '#495057' }}>Articulaciones dolorosas (0-28):</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="28" 
                      placeholder="0-28"
                      style={{ 
                        padding: '8px 12px', 
                        border: '1px solid #ced4da', 
                        borderRadius: '4px', 
                        fontSize: '14px',
                        width: '100px'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: '500', color: '#495057' }}>Articulaciones tumefactas (0-28):</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="28" 
                      placeholder="0-28"
                      style={{ 
                        padding: '8px 12px', 
                        border: '1px solid #ced4da', 
                        borderRadius: '4px', 
                        fontSize: '14px',
                        width: '100px'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: '500', color: '#495057' }}>VHS (mm/h):</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="200" 
                      placeholder="mm/h"
                      style={{ 
                        padding: '8px 12px', 
                        border: '1px solid #ced4da', 
                        borderRadius: '4px', 
                        fontSize: '14px',
                        width: '100px'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: '500', color: '#495057' }}>EVA actividad global (0-100):</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      placeholder="0-100"
                      style={{ 
                        padding: '8px 12px', 
                        border: '1px solid #ced4da', 
                        borderRadius: '4px', 
                        fontSize: '14px',
                        width: '100px'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', color: '#495057' }}>DAS28 Score:</span>
                    <span style={{ fontWeight: 'bold', color: '#007bff', fontSize: '18px' }}>--</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', color: '#495057' }}>Interpretación:</span>
                    <span style={{ fontWeight: 'bold', color: '#28a745', fontSize: '16px' }}>--</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HAQ */}
            <div className="sub-section-card" style={{ marginBottom: '30px', border: '1px solid #e1e8ed', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ marginBottom: '20px', color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>HAQ (Health Assessment Questionnaire)</h4>
              <div className="score-calculation">
                <h5 style={{ marginBottom: '15px', color: '#6c757d' }}>Capacidad Funcional</h5>
                <div style={{ marginBottom: '20px' }}>
                  <h6 style={{ marginBottom: '15px', color: '#6c757d', fontStyle: 'italic' }}>Dificultad para realizar actividades (0=sin dificultad, 3=imposible)</h6>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                    {[
                      'Vestirse y asearse',
                      'Levantarse', 
                      'Comer',
                      'Caminar',
                      'Higiene',
                      'Alcanzar objetos',
                      'Agarrar objetos',
                      'Actividades comunes'
                    ].map((activity, index) => (
                      <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '500', color: '#495057' }}>{activity}:</label>
                        <select style={{ 
                          padding: '8px 12px', 
                          border: '1px solid #ced4da', 
                          borderRadius: '4px', 
                          fontSize: '14px',
                          backgroundColor: 'white'
                        }}>
                          <option value="">Seleccionar</option>
                          <option value="0">Sin dificultad (0)</option>
                          <option value="1">Alguna dificultad (1)</option>
                          <option value="2">Mucha dificultad (2)</option>
                          <option value="3">Imposible (3)</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', color: '#495057' }}>HAQ Score:</span>
                    <span style={{ fontWeight: 'bold', color: '#007bff', fontSize: '18px' }}>--</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', color: '#495057' }}>Interpretación:</span>
                    <span style={{ fontWeight: 'bold', color: '#28a745', fontSize: '16px' }}>--</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'special-tests':
        return (
          <div className="section-content">
            <h3><i className="fas fa-vials"></i> Pruebas Especiales y Maniobras</h3>
            
            {/* Pruebas de Sacroilíacas */}
            <div className="sub-section-card" style={{ marginBottom: '30px', border: '1px solid #e1e8ed', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ marginBottom: '20px', color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>Pruebas de Sacroilíacas</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { id: 'fabere', label: 'Maniobra de FABERE (Patrick)' },
                  { id: 'gaenslen', label: 'Maniobra de Gaenslen' },
                  { id: 'compresion-si', label: 'Prueba de compresión sacroilíaca' },
                  { id: 'distraccion-si', label: 'Prueba de distracción sacroilíaca' }
                ].map((test, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                    <label style={{ fontWeight: '500', color: '#495057', minWidth: '250px' }}>{test.label}</label>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" id={`${test.id}-pos`} style={{ transform: 'scale(1.2)' }} />
                        <span style={{ color: '#dc3545', fontWeight: '500' }}>Positiva</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" id={`${test.id}-neg`} style={{ transform: 'scale(1.2)' }} />
                        <span style={{ color: '#28a745', fontWeight: '500' }}>Negativa</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pruebas de Flexibilidad Espinal */}
            <div className="sub-section-card" style={{ marginBottom: '30px', border: '1px solid #e1e8ed', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ marginBottom: '20px', color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>Pruebas de Flexibilidad Espinal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <label style={{ fontWeight: '500', color: '#495057', minWidth: '200px' }}>Prueba de Schober</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="number" placeholder="Inicial" style={{ padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', width: '80px' }} />
                    <span style={{ color: '#6c757d' }}>cm →</span>
                    <input type="number" placeholder="Final" style={{ padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', width: '80px' }} />
                    <span style={{ fontWeight: 'bold', minWidth: '60px', color: '#007bff' }}>-- cm</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <label style={{ fontWeight: '500', color: '#495057', minWidth: '200px' }}>Expansión torácica</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="number" placeholder="cm" style={{ padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', width: '80px' }} />
                    <span style={{ color: '#6c757d' }}>cm (normal >5 cm)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <label style={{ fontWeight: '500', color: '#495057', minWidth: '200px' }}>Distancia occipucio-pared</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="number" placeholder="cm" style={{ padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', width: '80px' }} />
                    <span style={{ color: '#6c757d' }}>cm (normal &lt;5 cm)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <label style={{ fontWeight: '500', color: '#495057', minWidth: '200px' }}>Flexión lateral lumbar</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="number" placeholder="cm" style={{ padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', width: '80px' }} />
                    <span style={{ color: '#6c757d' }}>cm (normal >10 cm)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pruebas de Inflamación */}
            <div className="sub-section-card" style={{ marginBottom: '30px', border: '1px solid #e1e8ed', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ marginBottom: '20px', color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>Pruebas de Inflamación</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { id: 'tinel', label: 'Signo de Tinel (síndrome túnel carpiano)' },
                  { id: 'phalen', label: 'Signo de Phalen (síndrome túnel carpiano)' },
                  { id: 'mcmurray', label: 'Prueba de McMurray (meniscos)' }
                ].map((test, index) => (
                  <div key={index} style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                    <label style={{ fontWeight: '500', color: '#495057', marginBottom: '15px', display: 'block' }}>{test.label}</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" id={`${test.id}-der-pos`} style={{ transform: 'scale(1.2)' }} />
                        <span style={{ color: '#dc3545', fontWeight: '500' }}>Derecho +</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" id={`${test.id}-der-neg`} style={{ transform: 'scale(1.2)' }} />
                        <span style={{ color: '#28a745', fontWeight: '500' }}>Derecho -</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" id={`${test.id}-izq-pos`} style={{ transform: 'scale(1.2)' }} />
                        <span style={{ color: '#dc3545', fontWeight: '500' }}>Izquierdo +</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" id={`${test.id}-izq-neg`} style={{ transform: 'scale(1.2)' }} />
                        <span style={{ color: '#28a745', fontWeight: '500' }}>Izquierdo -</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'diagnostic-criteria':
        return (
          <div className="section-content">
            <h3><i className="fas fa-syringe"></i> Criterios Diagnósticos</h3>
            <div className="sub-section-card">
              <h4 className="sub-section-title">Criterios ACR/EULAR 2010 para Artritis Reumatoide</h4>
              <div className="score-calculation">
                <h4>Sistema de Puntuación (total ≥6 confirma AR)</h4>
                <div className="exam-section">
                  <h4>A. Afectación articular</h4>
                  <div className="severity-grid">
                    <div className="severity-item"><input type="radio" name="ar-articulaciones" id="ar-1-art" value="0"/><label htmlFor="ar-1-art">1 articulación grande (0 puntos)</label></div>
                    <div className="severity-item"><input type="radio" name="ar-articulaciones" id="ar-2-10-art-grandes" value="1"/><label htmlFor="ar-2-10-art-grandes">2-10 articulaciones grandes (1 punto)</label></div>
                    <div className="severity-item"><input type="radio" name="ar-articulaciones" id="ar-1-3-art-pequenas" value="2"/><label htmlFor="ar-1-3-art-pequenas">1-3 articulaciones pequeñas (2 puntos)</label></div>
                    <div className="severity-item"><input type="radio" name="ar-articulaciones" id="ar-4-10-art-pequenas" value="3"/><label htmlFor="ar-4-10-art-pequenas">4-10 articulaciones pequeñas (3 puntos)</label></div>
                    <div className="severity-item"><input type="radio" name="ar-articulaciones" id="ar-mas-10-art" value="5"/><label htmlFor="ar-mas-10-art">&gt;10 articulaciones (5 puntos)</label></div>
                  </div>
                </div>
                <div className="exam-section">
                  <h4>B. Serología</h4>
                  <div className="severity-grid">
                    <div className="severity-item"><input type="radio" name="ar-serologia" id="ar-rf-neg-acpa-neg" value="0"/><label htmlFor="ar-rf-neg-acpa-neg">RF negativo y ACPA negativo (0 puntos)</label></div>
                    <div className="severity-item"><input type="radio" name="ar-serologia" id="ar-rf-bajo-acpa-bajo" value="2"/><label htmlFor="ar-rf-bajo-acpa-bajo">RF bajo positivo o ACPA bajo positivo (2 puntos)</label></div>
                    <div className="severity-item"><input type="radio" name="ar-serologia" id="ar-rf-alto-acpa-alto" value="3"/><label htmlFor="ar-rf-alto-acpa-alto">RF alto positivo o ACPA alto positivo (3 puntos)</label></div>
                  </div>
                </div>
                <div className="exam-section">
                  <h4>C. Reactantes de fase aguda</h4>
                  <div className="severity-grid">
                    <div className="severity-item"><input type="radio" name="ar-reactantes" id="ar-pcr-normal-vhs-normal" value="0"/><label htmlFor="ar-pcr-normal-vhs-normal">PCR normal y VHS normal (0 puntos)</label></div>
                    <div className="severity-item"><input type="radio" name="ar-reactantes" id="ar-pcr-alta-vhs-alta" value="1"/><label htmlFor="ar-pcr-alta-vhs-alta">PCR anormal o VHS anormal (1 punto)</label></div>
                  </div>
                </div>
                <div className="exam-section">
                  <h4>D. Duración de síntomas</h4>
                  <div className="severity-grid">
                    <div className="severity-item"><input type="radio" name="ar-duracion" id="ar-menos-6-sem" value="0"/><label htmlFor="ar-menos-6-sem">&lt;6 semanas (0 puntos)</label></div>
                    <div className="severity-item"><input type="radio" name="ar-duracion" id="ar-mas-6-sem" value="1"/><label htmlFor="ar-mas-6-sem">≥6 semanas (1 punto)</label></div>
                  </div>
                </div>
                <div className="score-item">
                  <span>Puntuación total ACR/EULAR:</span>
                  <span className="score-value" id="ar-score">0</span>
                  <span>/10 puntos</span>
                </div>
                <div className="score-item">
                  <span>Interpretación:</span>
                  <span className="score-value" id="ar-interpretation">--</span>
                </div>
              </div>
            </div>

            <div className="sub-section-card">
              <h4 className="sub-section-title">Criterios de Fibromialgia ACR 2016</h4>
              <div className="score-calculation">
                <h4>Criterios Modificados 2016</h4>
                <div className="exam-section">
                  <h4>A. Índice de Dolor Generalizado (WPI)</h4>
                  <div className="measurement">
                    <label>Número de áreas con dolor (0-19):</label>
                    <input type="number" className="input-field" id="fibro-wpi" min="0" max="19"/>
                  </div>
                </div>
                <div className="exam-section">
                  <h4>B. Escala de Severidad de Síntomas (SSS)</h4>
                  <div className="measurement">
                    <label>Fatiga (0-3):</label>
                    <select id="fibro-fatiga">
                      <option value="">Seleccionar</option>
                      <option value="0">Sin problema (0)</option>
                      <option value="1">Problema leve (1)</option>
                      <option value="2">Problema moderado (2)</option>
                      <option value="3">Problema severo (3)</option>
                    </select>
                  </div>
                  <div className="measurement">
                    <label>Sueño no reparador (0-3):</label>
                    <select id="fibro-sueno">
                      <option value="">Seleccionar</option>
                      <option value="0">Sin problema (0)</option>
                      <option value="1">Problema leve (1)</option>
                      <option value="2">Problema moderado (2)</option>
                      <option value="3">Problema severo (3)</option>
                    </select>
                  </div>
                  <div className="measurement">
                    <label>Síntomas cognitivos (0-3):</label>
                    <select id="fibro-cognitivo">
                      <option value="">Seleccionar</option>
                      <option value="0">Sin problema (0)</option>
                      <option value="1">Problema leve (1)</option>
                      <option value="2">Problema moderado (2)</option>
                      <option value="3">Problema severo (3)</option>
                    </select>
                  </div>
                </div>
                <div className="exam-section">
                  <h4>C. Síntomas somáticos (0-3)</h4>
                  <div className="form-grid">
                    <div className="form-item"><input type="checkbox" id="fibro-cefalea"/><label htmlFor="fibro-cefalea">Cefalea</label></div>
                    <div className="form-item"><input type="checkbox" id="fibro-dolor-abdominal"/><label htmlFor="fibro-dolor-abdominal">Dolor abdominal</label></div>
                    <div className="form-item"><input type="checkbox" id="fibro-depresion"/><label htmlFor="fibro-depresion">Depresión</label></div>
                  </div>
                  <div className="measurement">
                    <label>Número de síntomas somáticos:</label>
                    <span id="fibro-somaticos-count">0</span>
                  </div>
                </div>
                <div className="score-item">
                  <span>WPI Score:</span>
                  <span className="score-value" id="fibro-wpi-score">0</span>
                </div>
                <div className="score-item">
                  <span>SSS Score:</span>
                  <span className="score-value" id="fibro-sss-score">0</span>
                </div>
                <div className="score-item">
                  <span>Cumple criterios:</span>
                  <span className="score-value" id="fibro-diagnosis">--</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'respiratory-scales':
        return (
          <div className="section-content">
            <h3><i className="fas fa-chart-line"></i> Escalas de Evaluación Respiratoria</h3>
            <div className="placeholder-content">
              <i className="fas fa-construction"></i>
              <h4>Sección en desarrollo</h4>
              <p>Las escalas de evaluación respiratoria estarán disponibles próximamente.</p>
            </div>
          </div>
        );

      case 'spirometry':
        return (
          <div className="section-content">
            <h3><i className="fas fa-tachometer-alt"></i> Espirometría</h3>
            <div className="placeholder-content">
              <i className="fas fa-construction"></i>
              <h4>Sección en desarrollo</h4>
              <p>La evaluación espirométrica estará disponible próximamente.</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="section-content">
            <h3>{currentSpecialty.sections.find(s => s.id === activeSection)?.name || t('specialty.section')}</h3>
            <div className="placeholder-content">
              <i className="fas fa-construction"></i>
              <h4>{t('specialty.sectionInDevelopment')}</h4>
              <p>{t('specialty.sectionInDevelopmentDescription')}</p>
            </div>
          </div>
        );
    }
  };

  // Función para generar reporte en tiempo real
  const generateRealTimeReport = () => {
    const report = {
      timestamp: new Date().toLocaleString(),
      section: activeSection,
      data: {}
    };

    // Agregar datos según la sección activa
    switch (activeSection) {
      case 'anamnesis':
        const selectedComplaints = Object.entries(complaints)
          .filter(([key, value]) => value === true)
          .map(([key]) => key);
        report.data.complaints = selectedComplaints;
        report.data.otherComplaints = complaints.otrosQuejas;
        break;
      
      case 'electrocardiogram':
        report.data.ecg = {
          rhythm: ecgData.ritmo,
          heartRate: ecgData.frecuenciaCardiaca,
          regularity: ecgData.regularidad,
          conduction: ecgData.conduccion,
          prInterval: ecgData.intervaloPR,
          qrsWidth: ecgData.anchoQRS,
          qtInterval: ecgData.intervaloQT,
          hypertrophy: {
            leftVentricle: ecgData.hipertrofiaVI,
            rightVentricle: ecgData.hipertrofiaVD,
            leftAtrium: ecgData.hipertrofiaAI,
            rightAtrium: ecgData.hipertrofiaAD
          },
          ischemicChanges: {
            type: ecgData.cambiosIsquemicos,
            walls: {
              anterior: ecgData.paredAnterior,
              inferior: ecgData.paredInferior,
              lateral: ecgData.paredLateral,
              posterior: ecgData.paredPosterior,
              septum: ecgData.septo
            }
          }
        };
        break;
      
      case 'chest-pain':
        report.data.chestPain = {
          intensity: chestPainData.intensity,
          location: {
            retrosternal: chestPainData.locationRetroesternal,
            precordialLeft: chestPainData.locationPrecordialLeft,
            interescapular: chestPainData.locationInterescapular,
            epigastric: chestPainData.locationEpigastric,
            cervicalMandibular: chestPainData.locationCervicalMandibular
          },
          quality: {
            oppressive: chestPainData.qualityOppressive,
            stabbing: chestPainData.qualityStabbing,
            burning: chestPainData.qualityBurning,
            pleuritic: chestPainData.qualityPleuritic,
            dull: chestPainData.qualityDull
          },
          radiation: {
            leftArm: chestPainData.radiationLeftArm,
            bothArms: chestPainData.radiationBothArms,
            jaw: chestPainData.radiationJaw,
            back: chestPainData.radiationBack,
            epigastrium: chestPainData.radiationEpigastrium
          },
          triggers: {
            exercise: chestPainData.triggeredByExercise,
            emotions: chestPainData.triggeredByEmotions,
            stress: chestPainData.triggeredByStress,
            cold: chestPainData.triggeredByCold,
            eating: chestPainData.triggeredByEating,
            decubitus: chestPainData.triggeredByDecubitus
          }
        };
        break;
      
      default:
        report.data.message = 'Sección en desarrollo';
    }

    return report;
  };

  // Componente ReportSidebar
  const ReportSidebar = () => {
    const report = generateRealTimeReport();
    
    const formatReportData = (data, level = 0) => {
      const indent = '  '.repeat(level);
      
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
          return data.length > 0 ? data.map(item => `${indent}• ${item}`).join('\n') : `${indent}Ninguno seleccionado`;
        }
        
        return Object.entries(data)
          .filter(([key, value]) => value !== '' && value !== false && value !== null && value !== undefined)
          .map(([key, value]) => {
            if (typeof value === 'object') {
              const formattedValue = formatReportData(value, level + 1);
              return formattedValue ? `${indent}${key}:\n${formattedValue}` : '';
            }
            return `${indent}${key}: ${value === true ? 'Sí' : value}`;
          })
          .filter(item => item)
          .join('\n');
      }
      
      return `${indent}${data}`;
    };

    return (
      <div className={`report-sidebar ${reportSidebarOpen ? 'open' : ''}`}>
        <div className="report-sidebar-header">
          <h3>
            <i className="fas fa-chart-line"></i>
            Reporte en Tiempo Real
          </h3>
          <button 
            className="report-sidebar-close"
            onClick={() => setReportSidebarOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="report-sidebar-content">
          <div className="report-timestamp">
            <i className="fas fa-clock"></i>
            {report.timestamp}
          </div>
          
          <div className="report-section">
            <h4>Sección Activa</h4>
            <p>{currentSpecialty.sections.find(s => s.id === activeSection)?.name || activeSection}</p>
          </div>
          
          <div className="report-data">
            <h4>Datos Capturados</h4>
            <pre className="report-content">
              {Object.keys(report.data).length > 0 ? formatReportData(report.data) : 'No hay datos capturados'}
            </pre>
          </div>
          
          <div className="report-actions">
            <button className="btn btn-primary btn-sm">
              <i className="fas fa-download"></i>
              Exportar PDF
            </button>
            <button className="btn btn-outline btn-sm">
              <i className="fas fa-copy"></i>
              Copiar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="specialty-page">
      {/* Sidebar */}
      <aside className={`specialty-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="back-link">
            <i className="fas fa-home"></i>
          </Link>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>

        <div className="specialty-info">
          <div className="specialty-icon" style={{ color: currentSpecialty.color }}>
            <i className={currentSpecialty.icon}></i>
          </div>
          {!sidebarCollapsed && (
            <div className="specialty-details">
              <h2>{currentSpecialty.name}</h2>
            </div>
          )}
        </div>

        <nav className="sections-nav">
          <ul className="sections-list">
            {currentSpecialty.sections.map((section) => (
              <li key={section.id} className="section-item">
                <button 
                  className={`section-link ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <i className={section.icon}></i>
                  {!sidebarCollapsed && <span>{section.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user-md"></i>
            </div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-specialty">{user?.specialty}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="specialty-main">
        <header className="specialty-header">
          <div className="header-content">
            <div className="breadcrumb">
              <Link to="/dashboard">{t('dashboard.title')}</Link>
              <i className="fas fa-chevron-right"></i>
              <span>{currentSpecialty.name}</span>
            </div>
            <div className="header-actions">
              <button 
                className="theme-toggle" 
                onClick={toggleTheme}
                title={isDarkMode ? t('theme.lightMode') : t('theme.darkMode')}
              >
                <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setReportSidebarOpen(!reportSidebarOpen)}
                title="Reporte en Tiempo Real"
              >
                <i className="fas fa-chart-line"></i>
                Reporte
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-save"></i>
                {t('specialty.save')}
              </button>
              <button className="btn btn-primary">
                <i className="fas fa-file-medical"></i>
                {t('specialty.createReport')}
              </button>
            </div>
          </div>
        </header>

        <div className="specialty-content">
          {renderSectionContent()}
        </div>
      </main>
      
      {/* Report Sidebar */}
      <ReportSidebar />
    </div>
  );
}

export default SpecialtyPage;