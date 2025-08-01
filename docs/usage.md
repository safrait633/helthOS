# Guía de Uso - HealthOS

## Introducción

HealthOS es un sistema integral de evaluación médica que permite realizar exámenes especializados en diferentes áreas de la medicina. Esta guía te ayudará a navegar y utilizar eficientemente todas las funcionalidades del sistema.

## Estructura del Sistema

### Página Principal
La página principal (`index.html`) sirve como punto de entrada al sistema y presenta:
- **Dashboard principal**: Resumen de todas las especialidades disponibles
- **Navegación intuitiva**: Acceso directo a cada especialidad médica
- **Estadísticas del sistema**: Información general sobre el uso y capacidades
- **Tema claro/oscuro**: Alternancia entre modos de visualización

### Especialidades Médicas

Cada especialidad está organizada en su propia carpeta dentro de `specialties/` y contiene:
- `index.html`: Interfaz principal de la especialidad
- `styles.css`: Estilos específicos de la especialidad
- `script.js`: Lógica y funcionalidades específicas

#### Especialidades Disponibles:

1. **Cardiología** (`/specialties/cardiology/`)
   - Evaluación cardiovascular completa
   - Anamnesis y quejas principales
   - Signos vitales y examen físico
   - Auscultación cardíaca
   - Electrocardiograma
   - Escalas de riesgo cardiovascular

2. **Dermatología** (`/specialties/dermatology/`)
   - Examen dermatológico especializado
   - Evaluación de lesiones pigmentadas
   - Análisis de lesiones primarias y secundarias
   - Distribución de lesiones
   - Anexos cutáneos

3. **Endocrinología** (`/specialties/endocrinology/`)
   - Evaluación endocrinológica
   - Análisis hormonal
   - Metabolismo y diabetes

4. **Gastroenterología** (`/specialties/gastroenterology/`)
   - Examen gastroenterológico
   - Evaluación abdominal
   - Síntomas digestivos

5. **Geriatría** (`/specialties/geriatrics/`)
   - Evaluación geriátrica integral
   - Escalas funcionales
   - Síndromes geriátricos

6. **Hematología** (`/specialties/hematology/`)
   - Examen hematológico
   - Análisis de sangre
   - Trastornos hematológicos

7. **Enfermedades Infecciosas** (`/specialties/infectious_diseases/`)
   - Evaluación de enfermedades infecciosas
   - Síntomas sistémicos
   - Factores de riesgo

8. **Sistema Musculoesquelético** (`/specialties/musculoskeletal/`)
   - Evaluación musculoesquelética
   - Examen articular
   - Movilidad y función

9. **Oftalmología** (`/specialties/ophthalmology/`)
   - Examen oftalmológico
   - Agudeza visual
   - Fondo de ojo

10. **Otorrinolaringología** (`/specialties/otolaryngology/`)
    - Evaluación ORL
    - Examen de oído, nariz y garganta

11. **Psiquiatría** (`/specialties/psychiatry/`)
    - Evaluación psiquiátrica
    - Estado mental
    - Escalas psicométricas

12. **Reumatología** (`/specialties/rheumatology/`)
    - Examen reumatológico
    - Articulaciones y tejido conectivo

13. **Urología** (`/specialties/urology/`)
    - Examen urológico
    - Sistema genitourinario

## Cómo Usar el Sistema

### 1. Acceso Inicial
1. Abre el archivo `index.html` en tu navegador web
2. Verás la página principal con todas las especialidades disponibles
3. Selecciona la especialidad que deseas utilizar haciendo clic en su tarjeta

### 2. Navegación en Especialidades
Cada especialidad incluye:
- **Sidebar de navegación**: Acceso rápido a diferentes secciones
- **Dashboard en tiempo real**: Progreso del examen y estadísticas
- **Formularios especializados**: Campos específicos para cada área médica
- **Panel de informes**: Generación automática de reportes

### 3. Completar Evaluaciones
1. **Anamnesis**: Completa la historia clínica del paciente
2. **Examen físico**: Registra hallazgos del examen
3. **Pruebas complementarias**: Ingresa resultados de estudios
4. **Evaluación**: El sistema calcula automáticamente scores y riesgos

### 4. Generar Informes
1. Haz clic en el botón "Informe" en la barra superior
2. El sistema generará automáticamente un reporte basado en los datos ingresados
3. El informe incluye:
   - Resumen de hallazgos
   - Diagnósticos sugeridos
   - Recomendaciones
   - Escalas de riesgo calculadas

## Funcionalidades Avanzadas

### Tema Claro/Oscuro
- Haz clic en el ícono de luna/sol para alternar entre temas
- La preferencia se guarda automáticamente

### Dashboard en Tiempo Real
- Progreso del examen actualizado automáticamente
- Contadores de alertas, avisos y hallazgos
- Estado de completitud por secciones

### Navegación Rápida
- Usa el menú lateral para saltar entre secciones
- Botones de "Expandir Todo" y "Contraer Todo" para mejor visualización

### Validación Automática
- El sistema valida automáticamente los datos ingresados
- Alertas en tiempo real para valores anormales
- Sugerencias diagnósticas basadas en hallazgos

## Consejos de Uso

### Eficiencia
1. **Completa secciones en orden**: Sigue el flujo natural del examen
2. **Usa atajos de teclado**: Tab para navegar entre campos
3. **Guarda frecuentemente**: Usa Ctrl+S para guardar el progreso

### Precisión
1. **Revisa datos críticos**: Verifica signos vitales y medicamentos
2. **Usa especificaciones**: Completa campos de texto libre cuando sea necesario
3. **Consulta referencias**: Usa las escalas y criterios integrados

### Organización
1. **Nombra casos claramente**: Usa identificadores únicos para pacientes
2. **Exporta informes**: Guarda reportes en formato PDF
3. **Mantén historial**: Conserva registros de evaluaciones previas

## Solución de Problemas

### Problemas Comunes

**El sistema no carga correctamente:**
- Verifica que todos los archivos estén en las carpetas correctas
- Asegúrate de tener conexión a internet para CDNs
- Actualiza tu navegador web

**Los estilos no se aplican:**
- Verifica que el archivo `assets/css/global.css` exista
- Limpia la caché del navegador
- Revisa la consola del navegador para errores

**JavaScript no funciona:**
- Asegúrate de que `assets/js/main.js` esté presente
- Verifica que JavaScript esté habilitado en tu navegador
- Revisa la consola para errores de script

### Compatibilidad
- **Navegadores soportados**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Resoluciones**: Optimizado para 1024x768 y superiores
- **Dispositivos**: Compatible con desktop, tablet y móvil

## Mantenimiento

### Actualizaciones
1. Respalda tus datos antes de actualizar
2. Reemplaza archivos del sistema manteniendo la estructura
3. Verifica compatibilidad con versiones anteriores

### Respaldos
1. Copia toda la carpeta `helthOS/` regularmente
2. Exporta informes importantes en formato PDF
3. Mantén copias de configuraciones personalizadas

## Soporte

Para obtener ayuda adicional:
1. Consulta la documentación técnica en `docs/`
2. Revisa los archivos de ejemplo en cada especialidad
3. Contacta al administrador del sistema para soporte técnico

---

*Última actualización: Enero 2024*
*Versión del sistema: 2.0*