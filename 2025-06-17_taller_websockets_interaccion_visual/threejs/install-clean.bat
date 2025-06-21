@echo off
echo 🧹 Limpieza e instalacion de dependencias...
echo ==========================================
echo.

echo Eliminando node_modules y package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo.

echo Instalando dependencias con versiones compatibles...
npm install
echo.

echo ✅ Instalacion completada!
echo Ahora puedes ejecutar: npm run dev
echo.
pause 