# 🤖 Configuración de ChatGPT para Consejos Inteligentes

Este documento explica cómo configurar la integración con ChatGPT para obtener consejos personalizados sobre reciclaje y impacto ambiental.

## 📋 Requisitos

- Una cuenta de OpenAI (gratuita o de pago)
- Clave API de OpenAI
- Python 3.7+ instalado

## 🚀 Configuración Paso a Paso

### 1. Instalar Dependencias

Ejecuta el script de instalación desde la carpeta `Backend`:

```bash
cd Backend
python install_chatgpt_dependencies.py
```

O instala manualmente:

```bash
pip install openai>=1.0.0 python-dotenv>=1.0.0
```

### 2. Obtener Clave API de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Haz clic en "Create new secret key"
4. Copia la clave (guárdala en un lugar seguro)

### 3. Crear Archivo de Variables de Entorno

En la carpeta `Backend`, crea un archivo llamado `.env`:

```bash
# Backend/.env
OPENAI_API_KEY=tu_clave_de_openai_aqui
OPENAI_MODEL=gpt-3.5-turbo
```

**⚠️ IMPORTANTE**: 
- Reemplaza `tu_clave_de_openai_aqui` con tu clave real de OpenAI
- No compartas este archivo en git (ya está en .gitignore)

### 4. Verificar Configuración

Prueba la configuración ejecutando:

```bash
cd Backend
python chatgpt_adviser.py
```

Si todo está correcto, deberías ver:
```
✅ ChatGPT Adviser inicializado con modelo: gpt-3.5-turbo
Conexión exitosa con OpenAI API
```

## 🔧 Configuración del Modelo

### Modelos Disponibles (más baratos primero):

1. **gpt-3.5-turbo** (Recomendado) - $0.0015 por 1K tokens
2. **gpt-3.5-turbo-16k** - $0.003 por 1K tokens
3. **gpt-4** - $0.03 por 1K tokens

Para cambiar el modelo, edita el archivo `.env`:

```bash
OPENAI_MODEL=gpt-3.5-turbo
```

## 🎯 Funcionalidades

Una vez configurado, el sistema proporcionará:

- **Consejos de Reciclaje**: Instrucciones específicas para cada tipo de material
- **Impacto Ambiental**: Información sobre el impacto de no reciclar
- **Datos Curiosos**: Estadísticas y datos interesantes
- **Alternativas Sostenibles**: Sugerencias para reducir el impacto ambiental

## 🔍 Pruebas

### Probar Backend

```bash
cd Backend
python api_server.py
```

### Probar Frontend

```bash
cd ThreejsFrontend
npm run dev
```

## 🛠️ Solución de Problemas

### Error: "OPENAI_API_KEY no encontrada"

- Verifica que el archivo `.env` esté en la carpeta `Backend`
- Verifica que la clave API esté correcta
- Reinicia el servidor API

### Error: "Insufficient quota"

- Tu cuenta OpenAI ha alcanzado el límite de uso
- Verifica tu plan en [OpenAI Platform](https://platform.openai.com/usage)
- Considera agregar un método de pago para uso continuo

### Error: "Invalid API key"

- Verifica que la clave API sea correcta
- Regenera la clave en OpenAI Platform si es necesario

### Sin Consejos de ChatGPT

- El sistema funcionará con consejos de respaldo si ChatGPT no está disponible
- Los consejos aparecerán marcados como "IA" cuando ChatGPT esté funcionando

## 💰 Costos

- **gpt-3.5-turbo**: ~$0.002 por consulta (muy económico)
- Consultas típicas: 300-500 tokens
- 1000 consultas ≈ $2-3 USD

## 🔒 Seguridad

- Nunca compartas tu clave API
- Usa variables de entorno (.env)
- Monitorea el uso en OpenAI Platform

## 📞 Soporte

Si tienes problemas:

1. Verifica que todas las dependencias estén instaladas
2. Verifica que el archivo `.env` esté configurado correctamente
3. Prueba la conexión con `python chatgpt_adviser.py`
4. Revisa los logs del servidor API

¡Listo! 🎉 Tu sistema ahora proporcionará consejos inteligentes sobre reciclaje. 