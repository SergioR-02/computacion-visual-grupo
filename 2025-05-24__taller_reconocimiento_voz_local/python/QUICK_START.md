# 🚀 Inicio Rápido - Taller de Reconocimiento de Voz

## ⚡ Ejecución Inmediata

### 1. Launcher Automático (Recomendado)
```bash
python run_workshop.py
```
Este script te guiará paso a paso por todo el proceso.

### 2. Instalación Manual
```bash
# 1. Instalar dependencias
python setup.py

# 2. Probar entorno
python test_environment.py

# 3. Ejecutar aplicación principal
python voice_visualizer.py
```

---

## 🎤 Comandos Básicos para Probar

### Al abrir `voice_visualizer.py`:
1. Presiona **ESPACIO** para activar la escucha
2. Prueba estos comandos:

```
"rojo"          → Cambia a color rojo
"círculo"       → Cambia a forma circular
"girar"         → Inicia rotación
"grande"        → Aumenta tamaño
"mover"         → Inicia movimiento
"centro"        → Centra la forma
"detener"       → Para todas las animaciones
"ayuda"         → Lista todos los comandos
```

### Al abrir `simple_voice_demo.py`:
```
"hola"          → Saludo
"nombre"        → Dice su nombre
"hora"          → Dice la hora actual
"salir"         → Termina el programa
```

---

## 🔧 Solución Rápida de Problemas

### "No se encuentra PyAudio"
```bash
# Windows
pip install pipwin
pipwin install pyaudio

# macOS
brew install portaudio
pip install pyaudio

# Linux
sudo apt-get install portaudio19-dev python3-pyaudio
pip install pyaudio
```

### "No se detecta micrófono"
- Verificar permisos de micrófono en el sistema operativo
- Cerrar otras aplicaciones que usen el micrófono
- En Windows: Configuración → Privacidad → Micrófono

### "Sphinx no funciona"
- No es crítico, el sistema usará Google Speech automáticamente
- Requiere conexión a internet para Google Speech

---

## 📂 Estructura de Archivos

```
python/
├── run_workshop.py          # 🚀 EJECUTAR ESTE PRIMERO
├── voice_visualizer.py      # Aplicación principal
├── simple_voice_demo.py     # Demo básico
├── setup.py                 # Instalador de dependencias
├── test_environment.py      # Verificador de entorno
├── requirements.txt         # Lista de dependencias
└── QUICK_START.md          # Esta guía
```

---

## 🎯 Flujo Recomendado

1. **`python run_workshop.py`** → Launcher con menú
2. **Opción 1** → Instalar dependencias
3. **Opción 2** → Probar entorno
4. **Opción 3** → Ejecutar aplicación principal
5. **¡Disfrutar!** → Comandos por voz

---

## 🆘 Ayuda Rápida

- **Control + C**: Interrumpir programa en ejecución
- **ESC**: Salir de voice_visualizer.py
- **ESPACIO**: Activar/desactivar escucha en voice_visualizer.py
- **"ayuda"**: Comando de voz para mostrar ayuda

🔗 **Documentación completa**: [README.md](../README.md) 