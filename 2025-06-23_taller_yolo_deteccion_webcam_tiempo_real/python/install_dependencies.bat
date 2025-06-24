@echo off
echo Installing YOLO Webcam Detection dependencies...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo Python found. Installing packages...
echo.

REM Install dependencies
pip install ultralytics opencv-python torch torchvision numpy matplotlib Pillow

echo.
echo Installation complete!
echo.
echo To run the detection:
echo   python yolo_webcam_detection.py
echo.
echo For simple version:
echo   python simple_yolo_detection.py
echo.
pause
