@echo off
REM Fase 3 - Gaussian Splatting Implementation
REM Autor: Daniel
REM Computacion Visual - Julio 2025

echo.
echo ========================================
echo   Fase 3 - Gaussian Splatting Setup
echo   Autor: Daniel
echo   Computacion Visual - Julio 2025
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no esta instalado o no esta en el PATH
    echo Por favor instala Python 3.7 o superior
    pause
    exit /b 1
)

echo 1. Instalando dependencias...
pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo ERROR: Error instalando dependencias
    echo Intentando instalacion basica...
    pip install torch torchvision opencv-python numpy matplotlib plyfile tqdm
)

echo.
echo 2. Configuracion completada!
echo.
echo Opciones de ejecucion:
echo   A) Abrir Jupyter Notebook (Recomendado)
echo   B) Ejecutar script Python automatizado
echo   C) Salir
echo.

set /p choice="Selecciona una opcion (A/B/C): "

if /i "%choice%"=="A" (
    echo Abriendo Jupyter Notebook...
    start "" code gaussian_splatting_implementacion.ipynb
) else if /i "%choice%"=="B" (
    echo Ejecutando script automatizado...
    python run_gaussian_splatting.py
) else if /i "%choice%"=="C" (
    echo Saliendo...
    exit /b 0
) else (
    echo Opcion invalida. Abriendo notebook por defecto...
    start "" code gaussian_splatting_implementacion.ipynb
)

echo.
echo Proceso iniciado. Revisa la documentacion en README.md para mas detalles.
echo.
pause
