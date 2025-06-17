@echo off
echo 🎨 Instalando dependencias para Pintura Interactiva...
echo.

echo Instalando OpenCV...
pip install opencv-python
if %errorlevel% neq 0 (
    echo ❌ Error instalando OpenCV
    pause
    exit /b 1
)

echo Instalando MediaPipe...
pip install mediapipe
if %errorlevel% neq 0 (
    echo ❌ Error instalando MediaPipe
    pause
    exit /b 1
)

echo Instalando NumPy...
pip install numpy
if %errorlevel% neq 0 (
    echo ❌ Error instalando NumPy
    pause
    exit /b 1
)

echo Instalando SpeechRecognition...
pip install SpeechRecognition
if %errorlevel% neq 0 (
    echo ⚠️ Error instalando SpeechRecognition (opcional para versión completa)
)

echo Instalando PyAudio...
pip install pyaudio
if %errorlevel% neq 0 (
    echo ⚠️ Error instalando PyAudio (opcional para versión completa)
    echo 💡 Si falla, puedes usar la versión simple sin voz
)

echo.
echo ✅ Instalación completada!
echo.
echo 🚀 Para ejecutar:
echo    - Versión completa: python main.py
echo    - Versión simple: python simple_painting.py
echo.
pause
