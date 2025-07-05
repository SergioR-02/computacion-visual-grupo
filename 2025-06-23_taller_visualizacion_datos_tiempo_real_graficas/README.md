# 🎯 Taller de Visualización de Datos en Tiempo Real: Gráficas en Movimiento

📅 **Fecha:** 2025-06-23 – Fecha de realización

🎯 **Objetivo del Taller:**
Capturar o simular datos (como temperatura, conteo de objetos, coordenadas de sensores) y visualizarlos en tiempo real mediante gráficos dinámicos. El propósito es explorar cómo enlazar datos numéricos con representaciones gráficas actualizadas en vivo, útiles en monitoreo, visualización científica y dashboards.

## 🧠 Conceptos Aprendidos

Lista de conceptos clave aplicados en el taller:

* **Simulación de datos**: Generación de datos sintéticos para pruebas y visualización.
* **Animación de gráficos**: Técnicas para actualizar gráficos en tiempo real.
* **Representación visual**: Selección del tipo de gráfico adecuado según los datos.
* **Integración de interfaces**: Combinación de gráficos con otras fuentes de información.

## 🔧 Herramientas y Entornos

* Python + Matplotlib
* NumPy
* Plotly + Dash
* OpenCV
* Pandas

## 📁 Estructura del Proyecto

```
taller_visualizacion_datos_tiempo_real_graficas/
├── python/
│   ├── temperatura_tiempo_real.py
│   ├── conteo_objetos_tiempo_real.py
│   └── sensor_movimiento_tiempo_real.py
├── resultados/
└── requirements.txt
```

## 🧪 Implementación

La implementación se centra en la visualización de datos en tiempo real mediante gráficos dinámicos. Se desarrollaron scripts en Python que permiten realizar las siguientes tareas:

- **Simulación de datos**: Crear flujos de datos sintéticos que simulan sensores o detecciones.
- **Visualización en tiempo real**: Mostrar los datos en gráficos que se actualizan continuamente.
- **Integración de interfaces**: Combinar visualizaciones gráficas con otras interfaces de usuario.
- **Análisis de tendencias**: Observar patrones y cambios en los datos a medida que evolucionan.

### 🔹 Etapas realizadas

1. **Generación de datos**: Creación de simuladores de datos para temperaturas, conteo de objetos y sensores de movimiento.
2. **Configuración de gráficos**: Selección y configuración de los tipos de gráficos adecuados para cada tipo de dato.
3. **Animación**: Implementación de técnicas de actualización de gráficos en tiempo real.
4. **Integración**: Combinación de visualizaciones con interfaces interactivas.
5. **Optimización**: Ajuste del rendimiento para mantener actualizaciones fluidas.

### 🔹 Código relevante

📌 **1. Animación de gráficos con Matplotlib**

```python
# Función de actualización para la animación
def update(frame):
    current_time = time.time() - start_time
    x_data.append(current_time)
    
    # Simular temperatura usando una función seno con algo de ruido
    temperature = np.sin(current_time * 0.5) + np.random.normal(0, 0.1)
    y_data.append(temperature)
    
    # Actualizar los datos
    line.set_data(x_data, y_data)
    
    return line,

# Crear animación
ani = FuncAnimation(fig, update, frames=None, init_func=init, 
                   interval=100, blit=True)
```

📌 **2. Actualización de gráficos con Plotly y Dash**

```python
# Callback para actualizar el gráfico
@app.callback(
    Output('live-graph', 'figure'),
    [Input('graph-update', 'n_intervals')]
)
def update_graph(n):
    global df
    
    # Obtener nuevos datos
    conteo = detector.simular_deteccion()
    tiempo_actual = datetime.now().strftime("%H:%M:%S")
    
    # Crear nuevo DataFrame con la detección actual
    nueva_fila = pd.DataFrame({
        'tiempo': [tiempo_actual],
        'persona': [conteo['persona']],
        'carro': [conteo['carro']],
        'bicicleta': [conteo['bicicleta']],
        'moto': [conteo['moto']],
        'perro': [conteo['perro']]
    })
    
    # Concatenar con los datos existentes
    df = pd.concat([df, nueva_fila], ignore_index=True)
```

📌 **3. Integración de Matplotlib con OpenCV**

```python
# Función para convertir la figura de matplotlib a imagen de OpenCV
def fig_to_image(fig):
    canvas = FigureCanvasAgg(fig)
    canvas.draw()
    buf = canvas.buffer_rgba()
    w, h = canvas.get_width_height()
    img_array = np.frombuffer(buf, dtype=np.uint8).reshape(h, w, 4)
    img_array_rgb = cv2.cvtColor(img_array, cv2.COLOR_RGBA2BGR)
    return img_array_rgb
```

## 📊 Resultados y Análisis

### 📌 Simulación de Temperatura
![Simulación de Temperatura](./resultados/SimTemperatura.gif)

### 📌 Conteo de Objetos
![Conteo de Objetos](./resultados/ConteoObjetos.gif)

### 📌 Datos de Sensores de Movimiento
![Sensores de Movimiento](./resultados/SensorMov.gif)

## 🧩 Prompts Usados

"Crea una simulación de temperatura usando numpy y visualízala en tiempo real con matplotlib."

"Implementa un detector de objetos simulado y muestra los conteos en gráficos dinámicos con plotly."

"Integra gráficos de matplotlib con OpenCV para mostrar datos de sensores de movimiento en tiempo real."

"Optimiza la actualización de gráficos para mantener un rendimiento fluido en tiempo real."

## 💬 Reflexión Final

Este taller me permitió explorar las diferentes técnicas para visualizar datos en tiempo real, un aspecto fundamental en aplicaciones de monitoreo y análisis. La principal dificultad fue balancear la frecuencia de actualización de los gráficos con el rendimiento general de la aplicación, especialmente cuando se integran múltiples fuentes de datos. La visualización en tiempo real ofrece ventajas significativas para la toma de decisiones inmediatas y la detección de patrones emergentes que no serían evidentes en análisis estáticos.
