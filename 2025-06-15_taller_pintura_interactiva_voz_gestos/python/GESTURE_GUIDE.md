# 🎨 Guía de Gestos - Pintura Interactiva

## ✋ Sistema de Gestos Avanzado

El sistema ahora detecta **7 gestos diferentes** de la mano para controlar automáticamente el tipo de pincel:

### 📋 Lista de Gestos

| Gesto | Emoji | Descripción | Pincel Resultante | Efecto |
|-------|--------|-------------|-------------------|---------|
| **Índice Solo** | 👆 | Solo dedo índice extendido | Circular | Pincel redondo clásico |
| **Paz/Victoria** | ✌️ | Índice + Medio extendidos | Línea | Trazos conectados suaves |
| **Tres Dedos** | 🤟 | Índice + Medio + Anular | Cuadrado | Formas rectangulares |
| **Cuatro Dedos** | 🖐️ | Todos menos pulgar | Estrella | Estrellas de 5 puntas |
| **Mano Abierta** | 🖐️ | Los 5 dedos extendidos | Spray | Efecto aerosol/spray |
| **Pellizco** | 🤏 | Pulgar + Índice | Caligrafía | Grosor variable por velocidad |
| **Puño Cerrado** | 👊 | Ningún dedo extendido | *(Pausa)* | No dibuja |

### 🎯 Cómo Usar los Gestos

1. **👆 Pincel Circular (Índice Solo)**
   - Extiende solo el dedo índice
   - Ideal para trazos suaves y continuos
   - Perfecto para comenzar a dibujar

2. **✌️ Pincel Línea (Paz)**
   - Extiende índice y medio (como señal de paz)
   - Conecta automáticamente los puntos
   - Excelente para dibujo técnico

3. **🤟 Pincel Cuadrado (Tres Dedos)**
   - Extiende índice, medio y anular
   - Crea formas rectangulares
   - Útil para texturas y rellenos

4. **🖐️ Pincel Estrella (Cuatro Dedos)**
   - Extiende todos menos el pulgar
   - Dibuja estrellas de 5 puntas
   - Perfecto para efectos decorativos

5. **🖐️ Pincel Spray (Mano Abierta)**
   - Extiende todos los dedos
   - Efecto de aerosol con puntos aleatorios
   - Ideal para sombreado y texturas

6. **🤏 Pincel Caligrafía (Pellizco)**
   - Junta pulgar e índice
   - Grosor varía según la velocidad del movimiento
   - Perfecto para escritura artística

7. **👊 Pausa (Puño Cerrado)**
   - Cierra todos los dedos
   - Para de dibujar manteniendo el color/pincel
   - Útil para reposicionar sin trazar

## 🎮 Controles Adicionales

### 🎨 Cambio de Colores (Teclado)
- **1**: Verde 🟢
- **2**: Rojo 🔴  
- **3**: Azul 🔵
- **4**: Amarillo 🟡
- **5**: Morado 🟣
- **6**: Cian 🔷
- **7**: Blanco ⚪
- **8**: Negro ⚫

### 📏 Control de Tamaño
- **+/=**: Aumentar tamaño del pincel
- **-**: Reducir tamaño del pincel

### 💾 Acciones
- **S**: Guardar obra actual
- **C**: Limpiar lienzo completo
- **ESC**: Salir de la aplicación

## 🎤 Comandos de Voz (Solo Versión Completa)

Si usas `main_advanced.py`, también puedes usar comandos de voz:

- **Colores**: "rojo", "verde", "azul", "amarillo", "morado", "cian", "blanco", "negro"
- **Pinceles**: "pincel", "línea", "cuadrado", "estrella", "spray", "caligrafía"
- **Acciones**: "limpiar", "guardar"
- **Tamaño**: "más grande", "más pequeño"

## 🚀 Archivos Disponibles

### `main_advanced.py` - Versión Completa
- ✅ Gestos avanzados (7 tipos)
- ✅ Comandos de voz
- ✅ Todos los efectos de pincel
- ⚠️ Requiere: OpenCV + MediaPipe + SpeechRecognition + PyAudio

### `simple_painting_advanced.py` - Versión Estable
- ✅ Gestos avanzados (7 tipos)
- ✅ Controles de teclado
- ✅ Todos los efectos de pincel
- ✅ Solo requiere: OpenCV + MediaPipe + NumPy

### `simple_painting.py` - Versión Original
- ✅ Gestos básicos (2 tipos)
- ✅ Controles de teclado
- ✅ Pincel simple
- ✅ Máxima compatibilidad

## 💡 Consejos para Mejores Resultados

### 🔍 Detección de Gestos
1. **Iluminación**: Asegúrate de tener buena luz sobre las manos
2. **Fondo**: Usa un fondo contrastante (no del color de tu piel)
3. **Distancia**: Mantén la mano a 30-60cm de la cámara
4. **Estabilidad**: Haz los gestos de forma clara y deliberada

### 🎨 Técnicas Artísticas
1. **Combinar Pinceles**: Cambia gestos durante el dibujo para variar efectos
2. **Capas**: Usa el pincel spray sobre líneas para crear profundidad
3. **Detalles**: Usa caligrafía para trazos finos y delicados
4. **Texturas**: Combina cuadrados y spray para crear superficies interesantes

### 🖐️ Práctica de Gestos
- **Calentamiento**: Practica cada gesto antes de empezar
- **Transiciones**: Aprende a cambiar suavemente entre gestos
- **Precisión**: El índice solo es el más preciso para detalles
- **Velocidad**: La caligrafía responde a la velocidad del movimiento

## 🎯 Flujo de Trabajo Recomendado

1. **🚀 Inicio**: Ejecutar `python simple_painting_advanced.py`
2. **✋ Calibrar**: Probar cada gesto para ver la respuesta
3. **🎨 Paleta**: Elegir color inicial con teclas 1-8
4. **👆 Bosquejo**: Usar índice para líneas principales
5. **✌️ Conexiones**: Usar paz para conectar elementos
6. **🖐️ Texturas**: Usar spray para sombreado
7. **⭐ Detalles**: Usar estrella para decoraciones
8. **🤏 Refinado**: Usar caligrafía para detalles finales
9. **💾 Guardar**: Presionar S para salvar la obra

¡Disfruta creando arte con tus gestos! 🎨✨
