import React, { useState, useEffect } from 'react';
import './RheumatologyExam.css';

const RheumatologyExam = () => {
  // Estados para las diferentes secciones del examen
  const [complaints, setComplaints] = useState({
    dolorArticular: false,
    rigidezMatutina: false,
    inflamacionArticular: false,
    limitacionFuncional: false,
    fatiga: false,
    dolorMuscular: false,
    debilidadMuscular: false,
    dolorLumbar: false,
    deformidades: false,
    fenomenoRaynaud: false,
    sequedadOcular: false,
    rashCutaneo: false,
    sinQuejas: false
  });

  const [painCharacteristics, setPainCharacteristics] = useState({
    dolorGeneral: 0,
    dolorReposo: 0,
    dolorMovimiento: 0,
    tipoDolor: '',
    patronAfectacion: ''
  });

  const [stiffnessData, setStiffnessData] = useState({
    duracion: '',
    mejoraMovimiento: false,
    generalizada: false,
    localizada: false
  });

  const [systemicSymptoms, setSystemicSymptoms] = useState({
    fiebre: false,
    perdidaPeso: false,
    fatigaSistemica: false,
    sudoracionNocturna: false,
    nodulosSubcutaneos: false,
    ulcerasOrales: false,
    alopecia: false,
    fotosensibilidad: false
  });

  const [familyHistory, setFamilyHistory] = useState({
    artritisReumatoide: false,
    lupus: false,
    espondiloartritis: false,
    psoriasis: false,
    enfermedadInflamatoria: false
  });

  const [triggers, setTriggers] = useState({
    infeccionPrevia: false,
    traumaArticular: false,
    stressEmocional: false,
    exposicionFrio: false,
    cambiosHormonales: false
  });

  // Estados para examen articular
  const [jointExam, setJointExam] = useState({
    // Mano derecha
    ifp2Der: { dolor: false, tumefaccion: false, limitacion: false },
    ifp3Der: { dolor: false, tumefaccion: false, limitacion: false },
    ifp4Der: { dolor: false, tumefaccion: false, limitacion: false },
    ifp5Der: { dolor: false, tumefaccion: false, limitacion: false },
    mcf1Der: { dolor: false, tumefaccion: false, limitacion: false },
    mcf2Der: { dolor: false, tumefaccion: false, limitacion: false },
    mcf3Der: { dolor: false, tumefaccion: false, limitacion: false },
    mcf4Der: { dolor: false, tumefaccion: false, limitacion: false },
    mcf5Der: { dolor: false, tumefaccion: false, limitacion: false },
    munecaDer: { dolor: false, tumefaccion: false, limitacion: false },
    // Mano izquierda
    ifp2Izq: { dolor: false, tumefaccion: false, limitacion: false },
    ifp3Izq: { dolor: false, tumefaccion: false, limitacion: false },
    ifp4Izq: { dolor: false, tumefaccion: false, limitacion: false },
    ifp5Izq: { dolor: false, tumefaccion: false, limitacion: false },
    mcf1Izq: { dolor: false, tumefaccion: false, limitacion: false },
    mcf2Izq: { dolor: false, tumefaccion: false, limitacion: false },
    mcf3Izq: { dolor: false, tumefaccion: false, limitacion: false },
    mcf4Izq: { dolor: false, tumefaccion: false, limitacion: false },
    mcf5Izq: { dolor: false, tumefaccion: false, limitacion: false },
    munecaIzq: { dolor: false, tumefaccion: false, limitacion: false },
    // Columna vertebral
    cervicalAlto: { dolor: false, limitacion: false },
    cervicalBajo: { dolor: false, limitacion: false },
    toracica: { dolor: false, limitacion: false },
    lumbar: { dolor: false, limitacion: false },
    sacroiliacas: { dolor: false, limitacion: false }
  });

  // Estados para escalas de actividad
  const [das28Data, setDas28Data] = useState({
    tender: '',
    swollen: '',
    esr: '',
    vas: ''
  });

  const [haqData, setHaqData] = useState({
    dressing: '',
    arising: '',
    eating: '',
    walking: '',
    hygiene: '',
    reach: '',
    grip: '',
    activities: ''
  });

  // Estados para criterios diagnósticos
  const [arCriteria, setArCriteria] = useState({
    articulaciones: '',
    serologia: '',
    reactantes: '',
    duracion: ''
  });

  const [fibromyalgiaCriteria, setFibromyalgiaCriteria] = useState({
    wpi: '',
    fatiga: '',
    sueno: '',
    cognitivo: '',
    cefalea: false,
    dolorAbdominal: false,
    depresion: false
  });

  // Estados para resultados calculados
  const [results, setResults] = useState({
    das28: { score: 0, interpretation: '' },
    haq: { score: 0, interpretation: '' },
    arScore: { total: 0, interpretation: '' },
    fibromyalgia: { wpiScore: 0, sssScore: 0, diagnosis: '' },
    stiffnessInterpretation: ''
  });

  // Estados para UI
  const [activeSection, setActiveSection] = useState('anamnesis');
  const [sectionsCompleted, setSectionsCompleted] = useState(0);
  const [examProgress, setExamProgress] = useState(0);

  // Funciones de cálculo
  const calculateDAS28 = () => {
    const tender = parseFloat(das28Data.tender) || 0;
    const swollen = parseFloat(das28Data.swollen) || 0;
    const esr = parseFloat(das28Data.esr) || 0;
    const vas = parseFloat(das28Data.vas) || 0;

    if (tender && swollen && esr && vas) {
      const score = 0.56 * Math.sqrt(tender) + 0.28 * Math.sqrt(swollen) + 0.70 * Math.log(esr) + 0.014 * vas;
      let interpretation = '';
      
      if (score < 2.6) {
        interpretation = 'Remisión';
      } else if (score <= 3.2) {
        interpretation = 'Actividad baja';
      } else if (score <= 5.1) {
        interpretation = 'Actividad moderada';
      } else {
        interpretation = 'Actividad alta';
      }

      setResults(prev => ({
        ...prev,
        das28: { score: score.toFixed(2), interpretation }
      }));
    }
  };

  const calculateHAQ = () => {
    const values = Object.values(haqData).filter(val => val !== '').map(val => parseFloat(val));
    if (values.length === 8) {
      const score = values.reduce((sum, val) => sum + val, 0) / 8;
      let interpretation = '';
      
      if (score < 0.5) {
        interpretation = 'Discapacidad mínima';
      } else if (score < 1.0) {
        interpretation = 'Discapacidad leve';
      } else if (score < 2.0) {
        interpretation = 'Discapacidad moderada';
      } else {
        interpretation = 'Discapacidad severa';
      }

      setResults(prev => ({
        ...prev,
        haq: { score: score.toFixed(2), interpretation }
      }));
    }
  };

  const calculateARScore = () => {
    let total = 0;
    total += parseInt(arCriteria.articulaciones) || 0;
    total += parseInt(arCriteria.serologia) || 0;
    total += parseInt(arCriteria.reactantes) || 0;
    total += parseInt(arCriteria.duracion) || 0;

    const interpretation = total >= 6 ? 'Cumple criterios para AR' : 'No cumple criterios para AR';
    
    setResults(prev => ({
      ...prev,
      arScore: { total, interpretation }
    }));
  };

  const evaluateStiffness = () => {
    const duration = parseInt(stiffnessData.duracion) || 0;
    let interpretation = '';
    
    if (duration === 0) {
      interpretation = '--';
    } else if (duration < 30) {
      interpretation = 'Normal (< 30 min)';
    } else if (duration < 60) {
      interpretation = 'Leve (30-60 min)';
    } else {
      interpretation = 'Significativa (> 60 min) - Sugiere inflamación';
    }

    setResults(prev => ({
      ...prev,
      stiffnessInterpretation: interpretation
    }));
  };

  const calculateFibromyalgia = () => {
    const wpi = parseInt(fibromyalgiaCriteria.wpi) || 0;
    const fatiga = parseInt(fibromyalgiaCriteria.fatiga) || 0;
    const sueno = parseInt(fibromyalgiaCriteria.sueno) || 0;
    const cognitivo = parseInt(fibromyalgiaCriteria.cognitivo) || 0;
    
    const somaticCount = [fibromyalgiaCriteria.cefalea, fibromyalgiaCriteria.dolorAbdominal, fibromyalgiaCriteria.depresion]
      .filter(Boolean).length;
    
    const sssScore = fatiga + sueno + cognitivo + (somaticCount < 3 ? somaticCount : 3);
    
    let diagnosis = '';
    if (wpi >= 7 && sssScore >= 5) {
      diagnosis = 'Cumple criterios para Fibromialgia';
    } else if (wpi >= 3 && wpi <= 6 && sssScore >= 9) {
      diagnosis = 'Cumple criterios para Fibromialgia';
    } else {
      diagnosis = 'No cumple criterios para Fibromialgia';
    }

    setResults(prev => ({
      ...prev,
      fibromyalgia: { wpiScore: wpi, sssScore, diagnosis }
    }));
  };

  // Efectos para recalcular automáticamente
  useEffect(() => {
    calculateDAS28();
  }, [das28Data]);

  useEffect(() => {
    calculateHAQ();
  }, [haqData]);

  useEffect(() => {
    calculateARScore();
  }, [arCriteria]);

  useEffect(() => {
    evaluateStiffness();
  }, [stiffnessData.duracion]);

  useEffect(() => {
    calculateFibromyalgia();
  }, [fibromyalgiaCriteria]);

  // Función para manejar "Sin quejas"
  const handleNoComplaints = (checked) => {
    if (checked) {
      setComplaints({
        dolorArticular: false,
        rigidezMatutina: false,
        inflamacionArticular: false,
        limitacionFuncional: false,
        fatiga: false,
        dolorMuscular: false,
        debilidadMuscular: false,
        dolorLumbar: false,
        deformidades: false,
        fenomenoRaynaud: false,
        sequedadOcular: false,
        rashCutaneo: false,
        sinQuejas: true
      });
    } else {
      setComplaints(prev => ({ ...prev, sinQuejas: false }));
    }
  };

  // Función para actualizar examen articular
  const updateJointExam = (joint, type, value) => {
    setJointExam(prev => ({
      ...prev,
      [joint]: {
        ...prev[joint],
        [type]: value
      }
    }));
  };

  return (
    <div className="rheumatology-exam-container">
      <div className="exam-header">
        <h1><i className="fas fa-bone"></i> Examen Reumatológico</h1>
        <div className="progress-indicator">
          <span>Progreso: {examProgress}%</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${examProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="dashboard-section">
        <h2><i className="fas fa-chart-bar"></i> Dashboard del Examen</h2>
        <div className="dashboard-grid">
          <div className="dashboard-item">
            <i className="fas fa-clipboard-list"></i>
            <div className="label">Secciones Completadas</div>
            <div className="value">{sectionsCompleted}/5</div>
          </div>
          <div className="dashboard-item">
            <i className="fas fa-chart-line"></i>
            <div className="label">DAS28 Score</div>
            <div className="value">{results.das28.score || '--'}</div>
          </div>
          <div className="dashboard-item">
            <i className="fas fa-user-md"></i>
            <div className="label">HAQ Score</div>
            <div className="value">{results.haq.score || '--'}</div>
          </div>
          <div className="dashboard-item">
            <i className="fas fa-syringe"></i>
            <div className="label">Criterios AR</div>
            <div className="value">{results.arScore.total}/10</div>
          </div>
        </div>
      </div>

      {/* Navegación de secciones */}
      <div className="section-navigation">
        <button 
          className={`nav-btn ${activeSection === 'anamnesis' ? 'active' : ''}`}
          onClick={() => setActiveSection('anamnesis')}
        >
          <i className="fas fa-user-edit"></i> Anamnesis
        </button>
        <button 
          className={`nav-btn ${activeSection === 'joint-examination' ? 'active' : ''}`}
          onClick={() => setActiveSection('joint-examination')}
        >
          <i className="fas fa-bone"></i> Examen Articular
        </button>
        <button 
          className={`nav-btn ${activeSection === 'disease-activity' ? 'active' : ''}`}
          onClick={() => setActiveSection('disease-activity')}
        >
          <i className="fas fa-chart-line"></i> Actividad Enfermedad
        </button>
        <button 
          className={`nav-btn ${activeSection === 'special-tests' ? 'active' : ''}`}
          onClick={() => setActiveSection('special-tests')}
        >
          <i className="fas fa-stethoscope"></i> Pruebas Especiales
        </button>
        <button 
          className={`nav-btn ${activeSection === 'diagnostic-criteria' ? 'active' : ''}`}
          onClick={() => setActiveSection('diagnostic-criteria')}
        >
          <i className="fas fa-syringe"></i> Criterios Diagnósticos
        </button>
      </div>

      {/* Contenido de las secciones */}
      <div className="section-content">
        {activeSection === 'anamnesis' && (
          <div className="anamnesis-section">
            <h2><i className="fas fa-user-edit"></i> Anamnesis y Quejas Principales</h2>
            
            {/* Quejas Principales */}
            <div className="subsection-card">
              <h3><i className="fas fa-clipboard-list"></i> Quejas Reumatológicas Principales</h3>
              <div className="form-grid">
                {Object.entries(complaints).map(([key, value]) => {
                  if (key === 'sinQuejas') {
                    return (
                      <label key={key} className="checkbox-item special">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleNoComplaints(e.target.checked)}
                        />
                        <span>Sin quejas</span>
                      </label>
                    );
                  }
                  return (
                    <label key={key} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={value}
                        disabled={complaints.sinQuejas}
                        onChange={(e) => setComplaints(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Características del Dolor */}
            <div className="subsection-card">
              <h3><i className="fas fa-hand-holding-heart"></i> Características del Dolor Articular</h3>
              <div className="pain-assessment">
                <h4>Intensidad del Dolor (EVA)</h4>
                <div className="measurement">
                  <label>Dolor general:</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painCharacteristics.dolorGeneral}
                    onChange={(e) => setPainCharacteristics(prev => ({ ...prev, dolorGeneral: e.target.value }))}
                  />
                  <span>{painCharacteristics.dolorGeneral}/10</span>
                </div>
                <div className="measurement">
                  <label>Dolor en reposo:</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painCharacteristics.dolorReposo}
                    onChange={(e) => setPainCharacteristics(prev => ({ ...prev, dolorReposo: e.target.value }))}
                  />
                  <span>{painCharacteristics.dolorReposo}/10</span>
                </div>
                <div className="measurement">
                  <label>Dolor al movimiento:</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painCharacteristics.dolorMovimiento}
                    onChange={(e) => setPainCharacteristics(prev => ({ ...prev, dolorMovimiento: e.target.value }))}
                  />
                  <span>{painCharacteristics.dolorMovimiento}/10</span>
                </div>
              </div>
              
              <div className="exam-section">
                <h4>Características del Dolor</h4>
                <div className="radio-group">
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="tipo-dolor"
                      value="mecanico"
                      checked={painCharacteristics.tipoDolor === 'mecanico'}
                      onChange={(e) => setPainCharacteristics(prev => ({ ...prev, tipoDolor: e.target.value }))}
                    />
                    <span>Mecánico (mejora reposo)</span>
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="tipo-dolor"
                      value="inflamatorio"
                      checked={painCharacteristics.tipoDolor === 'inflamatorio'}
                      onChange={(e) => setPainCharacteristics(prev => ({ ...prev, tipoDolor: e.target.value }))}
                    />
                    <span>Inflamatorio (empeora reposo)</span>
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="tipo-dolor"
                      value="mixto"
                      checked={painCharacteristics.tipoDolor === 'mixto'}
                      onChange={(e) => setPainCharacteristics(prev => ({ ...prev, tipoDolor: e.target.value }))}
                    />
                    <span>Mixto</span>
                  </label>
                </div>
              </div>

              <div className="exam-section">
                <h4>Patrón de Afectación</h4>
                <div className="radio-group">
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="patron-afectacion"
                      value="monoarticular"
                      checked={painCharacteristics.patronAfectacion === 'monoarticular'}
                      onChange={(e) => setPainCharacteristics(prev => ({ ...prev, patronAfectacion: e.target.value }))}
                    />
                    <span>Monoarticular</span>
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="patron-afectacion"
                      value="oligoarticular"
                      checked={painCharacteristics.patronAfectacion === 'oligoarticular'}
                      onChange={(e) => setPainCharacteristics(prev => ({ ...prev, patronAfectacion: e.target.value }))}
                    />
                    <span>Oligoarticular (2-4 articulaciones)</span>
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="patron-afectacion"
                      value="poliarticular"
                      checked={painCharacteristics.patronAfectacion === 'poliarticular'}
                      onChange={(e) => setPainCharacteristics(prev => ({ ...prev, patronAfectacion: e.target.value }))}
                    />
                    <span>Poliarticular (>4 articulaciones)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Rigidez Matutina */}
            <div className="subsection-card">
              <h3><i className="fas fa-clock"></i> Rigidez Matutina</h3>
              <div className="stiffness-assessment">
                <h4>Duración de la Rigidez</h4>
                <div className="measurement">
                  <label>Duración (minutos):</label>
                  <input
                    type="number"
                    className="input-field"
                    min="0"
                    max="600"
                    value={stiffnessData.duracion}
                    onChange={(e) => setStiffnessData(prev => ({ ...prev, duracion: e.target.value }))}
                  />
                  <span>min</span>
                </div>
                <div className="score-item">
                  <span>Interpretación:</span>
                  <span className="score-value">{results.stiffnessInterpretation}</span>
                </div>
                <div className="form-grid">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={stiffnessData.mejoraMovimiento}
                      onChange={(e) => setStiffnessData(prev => ({ ...prev, mejoraMovimiento: e.target.checked }))}
                    />
                    <span>Mejora con el movimiento</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={stiffnessData.generalizada}
                      onChange={(e) => setStiffnessData(prev => ({ ...prev, generalizada: e.target.checked }))}
                    />
                    <span>Rigidez generalizada</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={stiffnessData.localizada}
                      onChange={(e) => setStiffnessData(prev => ({ ...prev, localizada: e.target.checked }))}
                    />
                    <span>Rigidez localizada</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Otras secciones se implementarán en la siguiente parte */}
      </div>
    </div>
  );
};

export default RheumatologyExam;