# 🚀 Guía Rápida - Pintura Interactiva

## ⚡ Inicio Rápido

### 1. Instalar dependencias
```bash
# Opción 1: Automática (Windows)
install_dependencies.bat

# Opción 2: Manual
pip install opencv-python mediapipe numpy
pip install SpeechRecognition pyaudio  # Para versión con voz
```

### 2. Ejecutar
```bash
# Versión completa (con voz y gestos avanzados)
python main_advanced.py

# Versión estable (solo gestos avanzados)
python simple_painting_advanced.py

# Versión simple (gestos básicos)
python simple_painting.py
```

## 🎮 Controles Rápidos

### ✋ Gestos Nuevos (Avanzados)
- **👆 Índice solo**: Pincel circular
- **✌️ Índice + Medio**: Pincel línea  
- **🤟 Tres dedos**: Pincel cuadrado
- **�️ Cuatro dedos**: Pincel estrella ⭐
- **�️ Mano abierta**: Pincel spray 💨
- **� Pellizco**: Pincel caligrafía ✒️
- **👊 Puño**: Pausa (no dibujar)

### 🎨 Teclado
- **1-8**: Cambiar colores
- **+/-**: Cambiar tamaño
- **S**: Guardar, **C**: Limpiar

### 🎤 Voz (solo main_advanced.py)
- **Colores**: "rojo", "verde", "azul", etc.
- **Pinceles**: "estrella", "spray", "caligrafía"
- **Acciones**: "limpiar", "guardar"

## 🔧 Solución Rápida de Problemas

### No funciona la cámara
```python
# En línea 22 de cualquier archivo .py, cambiar:
self.cap = cv2.VideoCapture(1)  # Probar con 1, 2, etc.
```

### Error PyAudio (solo afecta versión completa)
- Usar versión simple: `python simple_painting.py`
- O instalar PyAudio manualmente desde wheel

### Gestos no detectados
- Mejor iluminación
- Mano más cerca de la cámara
- Reducir `min_detection_confidence` en el código

## 📂 Archivos Importantes

- `main.py` - Versión completa con voz
- `simple_painting.py` - Versión solo gestos (más estable)
- `requirements.txt` - Lista de dependencias
- `install_dependencies.bat` - Instalador automático
- `../obras/` - Carpeta donde se guardan las obras

¡Disfruta pintando! 🎨
