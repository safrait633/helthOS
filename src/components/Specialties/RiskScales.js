import React, { useState, useEffect } from 'react';
import './RiskScales.css';

const RiskScales = () => {
  // Estado para DAS28
  const [das28Data, setDas28Data] = useState({
    tenderJoints: '',
    swollenJoints: '',
    esr: '',
    globalActivity: ''
  });

  // Estado para HAQ
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

  // Estado para Puntos Gatillo de Fibromialgia
  const [fibroData, setFibroData] = useState({
    occiput: false,
    cervicalBajo: false,
    trapecio: false,
    supraespinoso: false,
    segundaCostilla: false,
    epicondilo: false,
    gluteo: false,
    trocanter: false,
    rodilla: false
  });

  // Estado para resultados
  const [results, setResults] = useState({
    das28: { score: 0, interpretation: '' },
    haq: { score: 0, interpretation: '' },
    fibro: { count: 0, interpretation: '' }
  });

  // Función para calcular DAS28
  const calculateDAS28 = () => {
    const tender = parseFloat(das28Data.tenderJoints);
    const swollen = parseFloat(das28Data.swollenJoints);
    const esr = parseFloat(das28Data.esr);
    const global = parseFloat(das28Data.globalActivity);
    
    if (isNaN(tender) || isNaN(swollen) || isNaN(esr) || isNaN(global)) {
      setResults(prev => ({
        ...prev,
        das28: { score: 0, interpretation: 'Datos incompletos' }
      }));
      return;
    }
    
    const score = 0.56 * Math.sqrt(tender) + 0.28 * Math.sqrt(swollen) + 0.70 * Math.log(esr) + 0.014 * global;
    
    let interpretation;
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
  };

  // Función para calcular HAQ
  const calculateHAQ = () => {
    const values = Object.values(haqData).map(val => parseFloat(val)).filter(val => !isNaN(val));
    
    if (values.length === 0) {
      setResults(prev => ({
        ...prev,
        haq: { score: 0, interpretation: 'Datos incompletos' }
      }));
      return;
    }
    
    const score = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    let interpretation;
    if (score < 0.5) {
      interpretation = 'Discapacidad leve a nula';
    } else if (score < 1.0) {
      interpretation = 'Discapacidad leve a moderada';
    } else if (score < 2.0) {
      interpretation = 'Discapacidad moderada a severa';
    } else {
      interpretation = 'Discapacidad severa';
    }
    
    setResults(prev => ({
      ...prev,
      haq: { score: score.toFixed(2), interpretation }
    }));
  };

  // Función para calcular puntos gatillo de fibromialgia
  const calculateFibro = () => {
    const count = Object.values(fibroData).filter(Boolean).length;
    
    let interpretation;
    if (count >= 11) {
      interpretation = 'Criterio positivo para fibromialgia (≥11 puntos)';
    } else {
      interpretation = 'Criterio negativo para fibromialgia (<11 puntos)';
    }
    
    setResults(prev => ({
      ...prev,
      fibro: { count, interpretation }
    }));
  };

  // useEffect para recalcular automáticamente
  useEffect(() => {
    calculateDAS28();
  }, [das28Data]);

  useEffect(() => {
    calculateHAQ();
  }, [haqData]);

  useEffect(() => {
    calculateFibro();
  }, [fibroData]);

  return (
    <div className="risk-scales-container">
      <h2>Escalas de Riesgo Reumatológicas</h2>
      
      {/* DAS28 */}
      <div className="risk-scale-section">
        <h3>DAS28 (Disease Activity Score)</h3>
        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="tender-joints">Articulaciones dolorosas (0-28):</label>
            <input
              type="number"
              id="tender-joints"
              min="0"
              max="28"
              value={das28Data.tenderJoints}
              onChange={(e) => setDas28Data(prev => ({ ...prev, tenderJoints: e.target.value }))}
              placeholder="Ej: 5"
            />
          </div>
          <div className="input-group">
            <label htmlFor="swollen-joints">Articulaciones inflamadas (0-28):</label>
            <input
              type="number"
              id="swollen-joints"
              min="0"
              max="28"
              value={das28Data.swollenJoints}
              onChange={(e) => setDas28Data(prev => ({ ...prev, swollenJoints: e.target.value }))}
              placeholder="Ej: 3"
            />
          </div>
          <div className="input-group">
            <label htmlFor="esr">VSG (mm/h):</label>
            <input
              type="number"
              id="esr"
              min="0"
              value={das28Data.esr}
              onChange={(e) => setDas28Data(prev => ({ ...prev, esr: e.target.value }))}
              placeholder="Ej: 25"
            />
          </div>
          <div className="input-group">
            <label htmlFor="global-activity">Actividad global EVA (0-100):</label>
            <input
              type="number"
              id="global-activity"
              min="0"
              max="100"
              value={das28Data.globalActivity}
              onChange={(e) => setDas28Data(prev => ({ ...prev, globalActivity: e.target.value }))}
              placeholder="Ej: 40"
            />
          </div>
        </div>
        <div className="result-display">
          <div className="score">DAS28: {results.das28.score}</div>
          <div className="interpretation">Interpretación: {results.das28.interpretation}</div>
        </div>
      </div>

      {/* HAQ */}
      <div className="risk-scale-section">
        <h3>HAQ (Health Assessment Questionnaire)</h3>
        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="dressing">Vestirse y arreglarse (0-3):</label>
            <select
              id="dressing"
              value={haqData.dressing}
              onChange={(e) => setHaqData(prev => ({ ...prev, dressing: e.target.value }))}
            >
              <option value="">Seleccionar...</option>
              <option value="0">0 - Sin dificultad</option>
              <option value="1">1 - Alguna dificultad</option>
              <option value="2">2 - Mucha dificultad</option>
              <option value="3">3 - Incapaz de hacerlo</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="arising">Levantarse (0-3):</label>
            <select
              id="arising"
              value={haqData.arising}
              onChange={(e) => setHaqData(prev => ({ ...prev, arising: e.target.value }))}
            >
              <option value="">Seleccionar...</option>
              <option value="0">0 - Sin dificultad</option>
              <option value="1">1 - Alguna dificultad</option>
              <option value="2">2 - Mucha dificultad</option>
              <option value="3">3 - Incapaz de hacerlo</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="eating">Comer (0-3):</label>
            <select
              id="eating"
              value={haqData.eating}
              onChange={(e) => setHaqData(prev => ({ ...prev, eating: e.target.value }))}
            >
              <option value="">Seleccionar...</option>
              <option value="0">0 - Sin dificultad</option>
              <option value="1">1 - Alguna dificultad</option>
              <option value="2">2 - Mucha dificultad</option>
              <option value="3">3 - Incapaz de hacerlo</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="walking">Caminar (0-3):</label>
            <select
              id="walking"
              value={haqData.walking}
              onChange={(e) => setHaqData(prev => ({ ...prev, walking: e.target.value }))}
            >
              <option value="">Seleccionar...</option>
              <option value="0">0 - Sin dificultad</option>
              <option value="1">1 - Alguna dificultad</option>
              <option value="2">2 - Mucha dificultad</option>
              <option value="3">3 - Incapaz de hacerlo</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="hygiene">Higiene (0-3):</label>
            <select
              id="hygiene"
              value={haqData.hygiene}
              onChange={(e) => setHaqData(prev => ({ ...prev, hygiene: e.target.value }))}
            >
              <option value="">Seleccionar...</option>
              <option value="0">0 - Sin dificultad</option>
              <option value="1">1 - Alguna dificultad</option>
              <option value="2">2 - Mucha dificultad</option>
              <option value="3">3 - Incapaz de hacerlo</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="reach">Alcanzar (0-3):</label>
            <select
              id="reach"
              value={haqData.reach}
              onChange={(e) => setHaqData(prev => ({ ...prev, reach: e.target.value }))}
            >
              <option value="">Seleccionar...</option>
              <option value="0">0 - Sin dificultad</option>
              <option value="1">1 - Alguna dificultad</option>
              <option value="2">2 - Mucha dificultad</option>
              <option value="3">3 - Incapaz de hacerlo</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="grip">Agarrar (0-3):</label>
            <select
              id="grip"
              value={haqData.grip}
              onChange={(e) => setHaqData(prev => ({ ...prev, grip: e.target.value }))}
            >
              <option value="">Seleccionar...</option>
              <option value="0">0 - Sin dificultad</option>
              <option value="1">1 - Alguna dificultad</option>
              <option value="2">2 - Mucha dificultad</option>
              <option value="3">3 - Incapaz de hacerlo</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="activities">Actividades comunes (0-3):</label>
            <select
              id="activities"
              value={haqData.activities}
              onChange={(e) => setHaqData(prev => ({ ...prev, activities: e.target.value }))}
            >
              <option value="">Seleccionar...</option>
              <option value="0">0 - Sin dificultad</option>
              <option value="1">1 - Alguna dificultad</option>
              <option value="2">2 - Mucha dificultad</option>
              <option value="3">3 - Incapaz de hacerlo</option>
            </select>
          </div>
        </div>
        <div className="result-display">
          <div className="score">HAQ Score: {results.haq.score}</div>
          <div className="interpretation">Interpretación: {results.haq.interpretation}</div>
        </div>
      </div>

      {/* Puntos Gatillo de Fibromialgia */}
      <div className="risk-scale-section">
        <h3>Puntos Gatillo de Fibromialgia</h3>
        <div className="criteria-grid">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={fibroData.occiput}
              onChange={(e) => setFibroData(prev => ({ ...prev, occiput: e.target.checked }))}
            />
            <span>Occipucio (bilateral)</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={fibroData.cervicalBajo}
              onChange={(e) => setFibroData(prev => ({ ...prev, cervicalBajo: e.target.checked }))}
            />
            <span>Cervical bajo (bilateral)</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={fibroData.trapecio}
              onChange={(e) => setFibroData(prev => ({ ...prev, trapecio: e.target.checked }))}
            />
            <span>Trapecio (bilateral)</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={fibroData.supraespinoso}
              onChange={(e) => setFibroData(prev => ({ ...prev, supraespinoso: e.target.checked }))}
            />
            <span>Supraespinoso (bilateral)</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={fibroData.segundaCostilla}
              onChange={(e) => setFibroData(prev => ({ ...prev, segundaCostilla: e.target.checked }))}
            />
            <span>Segunda costilla (bilateral)</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={fibroData.epicondilo}
              onChange={(e) => setFibroData(prev => ({ ...prev, epicondilo: e.target.checked }))}
            />
            <span>Epicóndilo lateral (bilateral)</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={fibroData.gluteo}
              onChange={(e) => setFibroData(prev => ({ ...prev, gluteo: e.target.checked }))}
            />
            <span>Glúteo (bilateral)</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={fibroData.trocanter}
              onChange={(e) => setFibroData(prev => ({ ...prev, trocanter: e.target.checked }))}
            />
            <span>Trocánter mayor (bilateral)</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={fibroData.rodilla}
              onChange={(e) => setFibroData(prev => ({ ...prev, rodilla: e.target.checked }))}
            />
            <span>Rodilla (bilateral)</span>
          </label>
        </div>
        <div className="result-display">
          <div className="score">Puntos positivos: {results.fibro.count}/18</div>
          <div className="interpretation">Interpretación: {results.fibro.interpretation}</div>
        </div>
      </div>
    </div>
  );
};

export default RiskScales;