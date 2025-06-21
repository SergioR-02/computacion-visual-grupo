#!/bin/bash

echo "🧹 Limpieza e instalación de dependencias..."
echo "=========================================="
echo

echo "Eliminando node_modules y package-lock.json..."
rm -rf node_modules
rm -f package-lock.json
echo

echo "Instalando dependencias con versiones compatibles..."
npm install
echo

echo "✅ Instalación completada!"
echo "Ahora puedes ejecutar: npm run dev"
echo 