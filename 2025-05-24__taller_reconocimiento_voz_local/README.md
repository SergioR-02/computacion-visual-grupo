# 🧪 Taller - Voz al Código: Comandos por Reconocimiento de Voz Local

## 📅 Fecha
`2025-05-24` – Taller de Reconocimiento de Voz con Visualización Interactiva

---

## 🎯 Objetivo del Taller

Implementar una interfaz de voz local en Python que permita controlar acciones visuales simples mediante comandos hablados. El sistema funciona completamente offline (con reconocimiento local usando Sphinx) y también incluye fallback online (Google Speech Recognition) para mayor precisión. Se busca conectar la entrada de voz con sistemas visuales para crear una experiencia de interacción por comandos hablados, demostrando el flujo completo: **Entrada de Voz → Procesamiento → Acción Visual**.

---

## 🧠 Conceptos Aprendidos

Lista de conceptos aplicados en este taller:

- [x] **Comunicación por voz** - Reconocimiento de voz local y síntesis de voz
- [x] **Transformaciones geométricas** - Rotación, traslación y escalado de formas
- [x] **Interfaces visuales interactivas** - pygame para renderizado en tiempo real
- [x] **Programación multi-threading** - Hilos separados para audio, reconocimiento y visualización
- [x] **Procesamiento de señales de audio** - Análisis RMS y visualización de ondas
- [x] **Sistemas híbridos offline/online** - Sphinx local + Google Speech como fallback
- [x] **Arquitecturas modulares** - Separación de responsabilidades en clases
- [x] **Manejo de errores robusto** - Validación de datos y recuperación de fallos
- [x] **Debug visual en tiempo real** - Panel de información para desarrollo

---

## 🔧 Herramientas y Entornos

Especifica los entornos usados:

**Python** (Entorno principal):
- `speech_recognition==3.10.0` - Reconocimiento de voz multiplataforma
- `pyaudio==0.2.11` - Interfaz de audio para micrófono  
- `pyttsx3==2.90` - Síntesis de voz para retroalimentación
- `pygame==2.5.2` - Interfaz visual y gráficos
- `numpy==1.24.3` - Procesamiento numérico de audio
- `pocketsphinx==5.0.0` - Motor de reconocimiento offline (opcional)

**Sistemas de Reconocimiento**:
- **CMU PocketSphinx** - Reconocimiento offline local
- **Google Speech Recognition** - Fallback online de alta precisión

📌 Instalación automática disponible con `python setup.py`

---

## 📁 Estructura del Proyecto

```
2025-05-24__taller_reconocimiento_voz_local/
├── python/                         # Entorno principal de desarrollo
│   ├── voice_visualizer.py         # 🎮 Aplicación principal (18KB, 456 líneas)
│   ├── simple_voice_demo.py        # 🎤 Demo básico sin interfaz compleja
│   ├── setup.py                    # 🔧 Instalador automático de dependencias
│   ├── test_environment.py         # 🧪 Verificador de entorno y diagnóstico
│   ├── run_workshop.py             # 🚀 Launcher con menú interactivo
│   ├── requirements.txt            # 📦 Lista de dependencias
│   ├── QUICK_START.md             # ⚡ Guía de inicio rápido
├── resultados/                     # Capturas y evidencias visuales
│   └── voice_recognition_demo.gif  # 🎬 GIF demostrativo del funcionamiento
├── README.md                       # 📚 Documentación completa
```

📎 Estructura modular con separación clara de responsabilidades y scripts especializados.

---

## 🧪 Implementación

### 🔹 Etapas realizadas

1. **Preparación del entorno de audio**
   - Calibración automática del micrófono para ruido ambiente
   - Inicialización de PyAudio para captura en tiempo real
   - Configuración de motores de reconocimiento (Sphinx + Google)

2. **Implementación del reconocimiento híbrido**
   - Sistema offline con PocketSphinx para independencia de internet
   - Fallback inteligente a Google Speech Recognition para mayor precisión
   - Manejo robusto de errores y detección automática de disponibilidad

3. **Desarrollo de la interfaz visual interactiva**
   - Renderizado de formas geométricas con pygame (círculo, cuadrado, triángulo)
   - Sistema de animaciones (rotación, movimiento, rebotes en bordes)
   - Visualización de audio en tiempo real con barras de nivel

4. **Integración de comandos y acciones**
   - Diccionario bilingüe de comandos (español/inglés)
   - Mapeo directo de comandos de voz a acciones visuales
   - Sistema de retroalimentación dual (visual + auditiva)

### 🔹 Código relevante

Núcleo del sistema de reconocimiento híbrido:

```python
def listen_for_commands(self):
    """Escucha comandos de voz con sistema híbrido offline/online."""
    while self.running and self.is_listening:
        with self.microphone as source:
            audio = self.recognizer.listen(source, timeout=2, phrase_time_limit=4)
        
        # 1. Intentar reconocimiento offline (Sphinx)
        if self.sphinx_available:
            try:
                command = self.recognizer.recognize_sphinx(audio, language='es-ES')
                self.process_command(command.lower())
                return
            except sr.UnknownValueError:
                pass  # Fallback a Google
        
        # 2. Fallback online (Google)
        try:
            command = self.recognizer.recognize_google(audio, language='es-ES')
            self.process_command(command.lower())
        except sr.UnknownValueError:
            self.status_message = "❌ No se entendió el comando"
```

Visualización de audio en tiempo real:

```python
def _capture_audio_levels(self):
    """Captura y procesa niveles de audio para visualización."""
    audio_data = np.frombuffer(data, dtype=np.int16)
    rms = np.sqrt(np.mean(audio_data.astype(np.float64)**2))
    normalized_level = min(rms / 2000.0, 1.0)
    self.audio_levels.append(float(normalized_level))
```

---

## 📊 Resultados Visuales

### 📌 Este taller **requiere explícitamente un GIF animado**:

> ✅ **GIF demostrativo incluido** mostrando la interacción completa por comandos de voz.

![reconocimiento_voz_comandos_visuales_taller](./resultados/voice_recognition_demo.gif)

**El GIF demuestra:**
- 🎤 **Activación de escucha** con barra de audio en tiempo real
- 🗣️ **Reconocimiento de comandos** mostrado en el panel de debug
- 🎨 **Cambios visuales inmediatos** (color, forma, animaciones)
- 📊 **Panel de debug** mostrando texto reconocido y método usado
- 🔊 **Visualización de ondas de audio** respondiendo a la voz

### 📸 **Características Visuales del Sistema:**

- **Barra de audio inferior**: Visualización en tiempo real de niveles de voz
- **Panel de debug**: Muestra texto reconocido, método usado y mensajes recientes
- **Interfaz HUD**: Estado de escucha, información de la forma y controles
- **Animaciones fluidas**: Rotación, movimiento con física de rebotes
- **Retroalimentación inmediata**: Cambios visuales instantáneos al reconocer comandos

### 🎬 **Secuencia de Demo Grabada:**

1. **Inicio**: Pantalla inicial con forma blanca centrada
2. **Activación**: Presionar ESPACIO - se activa barra de audio
3. **Comandos básicos**: "rojo", "círculo", "grande"  
4. **Animaciones**: "girar", "mover" - forma se anima
5. **Cambios**: "azul", "cuadrado", "detener"
6. **Utilidades**: "centro", "ayuda"

---

## 🧩 Prompts Usados

### ✅ **Prompts de Desarrollo Utilizados**

#### 1. **Prompt Inicial de Arquitectura**
```text
"Necesito implementar un sistema de reconocimiento de voz local en Python que capture comandos del micrófono y los traduzca a acciones visuales. Debe usar speech_recognition para captura, pyttsx3 para retroalimentación, y pygame para visualización. El sistema debe funcionar offline con Sphinx y tener fallback online con Google Speech."
```
**Resultado**: Estructura base de la clase `VoiceVisualizer` con todos los componentes integrados.

#### 2. **Prompt para Comandos Multiidioma**
```text
"Crea un diccionario de comandos que soporte tanto español como inglés para colores, formas y acciones. Los comandos deben ser intuitivos y fáciles de pronunciar."
```
**Resultado**: Diccionario comprehensivo con mapeo de comandos en ambos idiomas.

#### 3. **Prompt para Interfaz Visual**
```text
"Diseña una interfaz visual con pygame que muestre el estado actual del sistema, comandos disponibles, información en tiempo real y retroalimentación visual clara del reconocimiento de voz."
```
**Resultado**: Interfaz completa con HUD informativo y estados visuales.

#### 4. **Prompt para Visualización de Audio**
```text
"Agrega una barra inferior en la interfaz que sea una onda que se mueva cuando el usuario hable, para que pueda identificar cuando se le está escuchando."
```
**Resultado**: Sistema de visualización de audio en tiempo real con barras de nivel y colores dinámicos.

#### 5. **Prompt para Debug Visual**
```text
"Ya puedo ver que mi voz es escuchada, sin embargo, no veo que se generen cambios en la figura y me sale el error de reconocimiento, muéstrame por texto que está escuchando el programa o busca otra forma de solucionarlo."
```
**Resultado**: Panel de debug completo con información en tiempo real del reconocimiento.

📎 **Estrategia de Prompting**: Iteración incremental, especificidad técnica, casos de uso reales y optimización continua.

---

## 💬 Reflexión Final

**¿Qué aprendiste o reforzaste con este taller?**

Este taller me permitió explorar profundamente la integración de múltiples tecnologías para crear una experiencia de usuario fluida y natural. Reforcé conceptos fundamentales de programación concurrente (threading), procesamiento de señales de audio, y diseño de interfaces responsivas. La implementación del sistema híbrido offline/online me enseñó la importancia de tener sistemas resilientes con múltiples estrategias de fallback. Además, desarrollé habilidades en debug visual y experiencia de usuario, creando herramientas que facilitan tanto el desarrollo como el uso final.

**¿Qué parte fue más compleja o interesante?**

La parte más compleja fue sincronizar correctamente los múltiples hilos de ejecución (audio, reconocimiento, síntesis de voz, interfaz visual) sin bloqueos ni conflictos de recursos. Implementar el sistema de visualización de audio en tiempo real requirió un entendimiento profundo del procesamiento de señales y optimización de rendimiento. Lo más interesante fue crear el panel de debug visual que permite ver en tiempo real todo el proceso de reconocimiento, desde la captura de audio hasta la ejecución de comandos, convirtiendo un sistema "caja negra" en algo completamente transparente y educativo.

**¿Qué mejorarías o qué aplicarías en futuros proyectos?**

Para futuros proyectos implementaría un sistema de entrenamiento personalizado para mejorar la precisión del reconocimiento con vocabularios específicos. También agregaría soporte para comandos compuestos ("rojo grande círculo girando") y gestos de voz basados en tonalidad. La arquitectura modular desarrollada es perfectamente aplicable para proyectos de domótica, control de presentaciones, juegos interactivos, o interfaces de accesibilidad. El patrón de debug visual será especialmente útil en cualquier sistema que procese datos en tiempo real donde la transparencia del proceso es crucial.

---
