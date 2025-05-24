# Taller 57 - Espacios Proyectivos y Matrices de Proyección

## 🔍 Descripción

Este proyecto implementa una demostración completa de los conceptos fundamentales de geometría proyectiva y matrices de proyección, mostrando cómo representar escenas tridimensionales en un plano bidimensional.

## 📋 Características

- **Coordenadas Homogéneas**: Demostración práctica del uso de coordenadas homogéneas en proyecciones
- **Proyección Ortogonal**: Implementación de proyección ortogonal sobre el plano XY
- **Proyección Perspectiva**: Implementación de proyección perspectiva con distancia focal variable
- **Visualización Comparativa**: Múltiples gráficos mostrando las diferencias entre proyecciones
- **Análisis Teórico**: Explicación de las diferencias entre geometría euclidiana, afín y proyectiva

## 🚀 Instalación

1. Clona o descarga este repositorio
2. Instala las dependencias:

```bash
pip install -r requirements.txt
```

## 💻 Uso

Ejecuta el script principal:

```bash
python main.py
```

El programa mostrará:

1. Análisis teórico de las diferentes geometrías
2. Demostración de coordenadas homogéneas
3. Matrices de proyección explicadas
4. Visualización gráfica con 6 subgráficos:
   - Cubo 3D original
   - Proyección ortogonal
   - Proyección perspectiva con d=1
   - Proyección perspectiva con d=0.5
   - Proyección perspectiva con d=2.0
   - Proyección perspectiva con d=5.0

## 🧮 Conceptos Implementados

### Matrices de Proyección

#### Proyección Ortogonal

```
[[1  0  0  0]
 [0  1  0  0]
 [0  0  0  0]
 [0  0  0  1]]
```

- Simplemente ignora la coordenada Z
- Las líneas paralelas permanecen paralelas

#### Proyección Perspectiva

```
[[1  0  0  0]
 [0  1  0  0]
 [0  0  1  0]
 [0  0  1/d 0]]
```

- d: distancia focal
- Simula el efecto de perspectiva dividiendo por la profundidad

### Efectos de la Distancia Focal

- **d pequeña (0.5)**: Mayor efecto de perspectiva, campo de visión más amplio
- **d media (1-2)**: Perspectiva natural
- **d grande (5)**: Menor efecto de perspectiva, se aproxima a proyección ortogonal

## 📊 Resultados Esperados

El programa genera una ventana con 6 visualizaciones que muestran:

- Cómo un cubo 3D se ve bajo diferentes proyecciones
- El efecto de variar la distancia focal en la proyección perspectiva
- La diferencia visual entre proyección ortogonal y perspectiva

## 🔧 Estructura del Código

- `proyectar_ortogonal()`: Aplica proyección ortogonal a puntos 3D
- `proyectar_perspectiva()`: Aplica proyección perspectiva con distancia focal variable
- `generar_cubo()`: Genera los vértices y aristas de un cubo 3D
- `demostrar_proyecciones()`: Función principal que genera todas las visualizaciones
- `analizar_geometrias()`: Explica las diferencias teóricas entre geometrías
- `demostrar_coordenadas_homogeneas()`: Muestra el concepto de coordenadas homogéneas

## 📚 Recursos Adicionales

- [Geometría Proyectiva - Wikipedia](https://es.wikipedia.org/wiki/Geometr%C3%ADa_proyectiva)
- [Coordenadas Homogéneas - Wikipedia](https://es.wikipedia.org/wiki/Coordenadas_homog%C3%A9neas)
- [Proyección 3D - Wikipedia](https://es.wikipedia.org/wiki/Proyecci%C3%B3n_3D)
