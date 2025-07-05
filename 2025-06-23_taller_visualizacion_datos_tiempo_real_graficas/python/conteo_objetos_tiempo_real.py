import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import time
from datetime import datetime
import pandas as pd
import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import cv2

# Simula detección de objetos en un video
class ObjetoDetector:
    def __init__(self):
        self.categorias = ['persona', 'carro', 'bicicleta', 'moto', 'perro']
        
    def simular_deteccion(self):
        # Simular conteo aleatorio de objetos
        conteo = {
            'persona': np.random.randint(0, 5),
            'carro': np.random.randint(0, 3),
            'bicicleta': np.random.randint(0, 2),
            'moto': np.random.randint(0, 2),
            'perro': np.random.randint(0, 1)
        }
        return conteo

# Inicializar la aplicación Dash
app = dash.Dash(__name__)
app.layout = html.Div([
    html.H1("Conteo de Objetos en Tiempo Real"),
    dcc.Graph(id='live-graph', animate=True),
    dcc.Interval(
        id='graph-update',
        interval=1000,  # Actualizar cada segundo
        n_intervals=0
    )
])

# Inicializar datos
detector = ObjetoDetector()
df = pd.DataFrame({
    'tiempo': [],
    'persona': [],
    'carro': [],
    'bicicleta': [],
    'moto': [],
    'perro': []
})

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
    
    # Mantener solo los últimos 30 puntos
    if len(df) > 30:
        df = df.iloc[-30:]
    
    # Crear figura con subplots
    fig = make_subplots(rows=2, cols=1, 
                       subplot_titles=("Conteo de Personas y Vehículos", "Conteo de Otros Objetos"))
    
    # Gráfico de líneas para personas y vehículos
    fig.add_trace(
        go.Scatter(x=df['tiempo'], y=df['persona'], mode='lines+markers', name='Persona'),
        row=1, col=1
    )
    fig.add_trace(
        go.Scatter(x=df['tiempo'], y=df['carro'], mode='lines+markers', name='Carro'),
        row=1, col=1
    )
    fig.add_trace(
        go.Scatter(x=df['tiempo'], y=df['moto'], mode='lines+markers', name='Moto'),
        row=1, col=1
    )
    
    # Gráfico de barras para bicicletas y perros
    fig.add_trace(
        go.Bar(x=df['tiempo'], y=df['bicicleta'], name='Bicicleta'),
        row=2, col=1
    )
    fig.add_trace(
        go.Bar(x=df['tiempo'], y=df['perro'], name='Perro'),
        row=2, col=1
    )
    
    # Actualizar diseño
    fig.update_layout(
        height=700,
        showlegend=True,
        title_text="Monitoreo en Tiempo Real de Objetos Detectados"
    )
    
    return fig

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(debug=True)
