import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Función para proyección ortogonal
def proyectar_ortogonal(puntos):
    """
    Aplica proyección ortogonal a puntos 3D.
    Ignora la coordenada z, proyectando sobre el plano xy.
    """
    # Matriz de proyección ortogonal sobre el plano xy
    P_ortogonal = np.array([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 1]
    ])
    
    # Convertir a coordenadas homogéneas
    puntos_hom = np.vstack((puntos, np.ones((1, puntos.shape[1]))))
    
    # Aplicar proyección
    proy = P_ortogonal @ puntos_hom
    
    # Normalizar (aunque en proyección ortogonal w=1)
    proy = proy / proy[-1, :]
    
    return proy[:2]  # Retornar solo x, y

# Función para proyección perspectiva
def proyectar_perspectiva(puntos, d=1.0):
    """
    Aplica proyección perspectiva a puntos 3D.
    d: distancia focal (distancia del punto de vista al plano de proyección)
    """
    # Matriz de proyección perspectiva
    P_perspectiva = np.array([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 1/d, 0]
    ])
    
    # Convertir a coordenadas homogéneas
    puntos_hom = np.vstack((puntos, np.ones((1, puntos.shape[1]))))
    
    # Aplicar proyección
    proy = P_perspectiva @ puntos_hom
    
    # Normalizar dividiendo por w
    proy = proy / proy[-1, :]
    
    return proy[:2]  # Retornar solo x, y

# Generar puntos de un cubo 3D
def generar_cubo(lado=2.0, centro=(0, 0, 5)):
    """
    Genera los vértices de un cubo 3D.
    """
    l = lado / 2
    cx, cy, cz = centro
    
    vertices = np.array([
        # Cara frontal
        [-l + cx, -l + cy, -l + cz],
        [l + cx, -l + cy, -l + cz],
        [l + cx, l + cy, -l + cz],
        [-l + cx, l + cy, -l + cz],
        # Cara trasera
        [-l + cx, -l + cy, l + cz],
        [l + cx, -l + cy, l + cz],
        [l + cx, l + cy, l + cz],
        [-l + cx, l + cy, l + cz]
    ]).T
    
    # Aristas del cubo (índices de vértices conectados)
    aristas = [
        # Cara frontal
        (0, 1), (1, 2), (2, 3), (3, 0),
        # Cara trasera
        (4, 5), (5, 6), (6, 7), (7, 4),
        # Conexiones entre caras
        (0, 4), (1, 5), (2, 6), (3, 7)
    ]
    
    return vertices, aristas

# Función para dibujar proyecciones
def dibujar_proyeccion(ax, puntos_2d, aristas, titulo, color='blue'):
    """
    Dibuja la proyección 2D de los puntos conectados según las aristas.
    """
    ax.set_title(titulo)
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.grid(True, alpha=0.3)
    ax.set_aspect('equal')
    
    # Dibujar aristas
    for i, j in aristas:
        ax.plot([puntos_2d[0, i], puntos_2d[0, j]], 
                [puntos_2d[1, i], puntos_2d[1, j]], 
                color=color, linewidth=2)
    
    # Dibujar vértices
    ax.scatter(puntos_2d[0], puntos_2d[1], color=color, s=50, zorder=5)

# Función principal para demostrar conceptos
def demostrar_proyecciones():
    """
    Demuestra diferentes tipos de proyecciones y el efecto de la distancia focal.
    """
    # Generar cubo
    vertices, aristas = generar_cubo(lado=2.0, centro=(0, 0, 5))
    
    # Crear figura con múltiples subgráficos
    fig = plt.figure(figsize=(15, 10))
    
    # 1. Visualización 3D original
    ax1 = fig.add_subplot(2, 3, 1, projection='3d')
    ax1.set_title('Cubo 3D Original')
    ax1.set_xlabel('X')
    ax1.set_ylabel('Y')
    ax1.set_zlabel('Z')
    
    # Dibujar cubo 3D
    for i, j in aristas:
        ax1.plot3D([vertices[0, i], vertices[0, j]], 
                   [vertices[1, i], vertices[1, j]], 
                   [vertices[2, i], vertices[2, j]], 'b-')
    ax1.scatter3D(vertices[0], vertices[1], vertices[2], color='red', s=50)
    
    # 2. Proyección Ortogonal
    ax2 = fig.add_subplot(2, 3, 2)
    proy_ortogonal = proyectar_ortogonal(vertices)
    dibujar_proyeccion(ax2, proy_ortogonal, aristas, 'Proyección Ortogonal', 'green')
    
    # 3. Proyección Perspectiva (d=1)
    ax3 = fig.add_subplot(2, 3, 3)
    proy_perspectiva_1 = proyectar_perspectiva(vertices, d=1.0)
    dibujar_proyeccion(ax3, proy_perspectiva_1, aristas, 'Proyección Perspectiva (d=1)', 'blue')
    
    # 4-6. Proyección Perspectiva con diferentes distancias focales
    distancias = [0.5, 2.0, 5.0]
    for idx, d in enumerate(distancias):
        ax = fig.add_subplot(2, 3, 4 + idx)
        proy = proyectar_perspectiva(vertices, d=d)
        dibujar_proyeccion(ax, proy, aristas, f'Proyección Perspectiva (d={d})', 'purple')
    
    plt.tight_layout()
    plt.show()

# Función para demostrar coordenadas homogéneas
def demostrar_coordenadas_homogeneas():
    """
    Demuestra el concepto de coordenadas homogéneas y su uso en transformaciones.
    """
    print("=== DEMOSTRACIÓN DE COORDENADAS HOMOGÉNEAS ===\n")
    
    # Punto en coordenadas cartesianas
    punto_3d = np.array([2, 3, 4])
    print(f"Punto en coordenadas cartesianas 3D: {punto_3d}")
    
    # Convertir a coordenadas homogéneas
    punto_hom = np.append(punto_3d, 1)
    print(f"Punto en coordenadas homogéneas: {punto_hom}")
    
    # Múltiples representaciones del mismo punto
    print("\nMúltiples representaciones del mismo punto en coordenadas homogéneas:")
    for w in [0.5, 1, 2, 3]:
        punto_hom_mult = punto_3d * w
        punto_hom_mult = np.append(punto_hom_mult, w)
        print(f"  {punto_hom_mult} → normalizado: {punto_hom_mult / punto_hom_mult[-1]}")
    
    print("\n" + "="*50 + "\n")

# Función para analizar diferencias entre geometrías
def analizar_geometrias():
    """
    Explica las diferencias entre geometría euclidiana, afín y proyectiva.
    """
    print("=== COMPARACIÓN DE GEOMETRÍAS ===\n")
    
    print("1. GEOMETRÍA EUCLIDIANA:")
    print("   - Preserva: distancias, ángulos, formas")
    print("   - Transformaciones: rotación, traslación, reflexión")
    print("   - No hay puntos en el infinito\n")
    
    print("2. GEOMETRÍA AFÍN:")
    print("   - Preserva: paralelismo, razones de distancias en líneas paralelas")
    print("   - Transformaciones: escalado no uniforme, cizallamiento")
    print("   - Las líneas paralelas nunca se encuentran\n")
    
    print("3. GEOMETRÍA PROYECTIVA:")
    print("   - Preserva: colinealidad, razón cruzada")
    print("   - Transformaciones: proyecciones perspectivas")
    print("   - Las líneas paralelas se encuentran en el infinito")
    print("   - Usa coordenadas homogéneas")
    
    print("\n" + "="*50 + "\n")

# Función para mostrar matrices de proyección
def mostrar_matrices_proyeccion():
    """
    Muestra las matrices de proyección ortogonal y perspectiva.
    """
    print("=== MATRICES DE PROYECCIÓN ===\n")
    
    print("1. MATRIZ DE PROYECCIÓN ORTOGONAL (sobre plano XY):")
    P_ortogonal = np.array([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 1]
    ])
    print(P_ortogonal)
    print("\n   - Simplemente ignora la coordenada Z")
    print("   - Las líneas paralelas permanecen paralelas")
    print("   - No hay efecto de profundidad\n")
    
    print("2. MATRIZ DE PROYECCIÓN PERSPECTIVA (distancia focal d):")
    print("   [[1  0  0  0]")
    print("    [0  1  0  0]")
    print("    [0  0  1  0]")
    print("    [0  0  1/d 0]]")
    print("\n   - Divide x,y por z/d (simulando perspectiva)")
    print("   - Las líneas paralelas convergen en el punto de fuga")
    print("   - Los objetos lejanos se ven más pequeños")
    
    print("\n" + "="*50 + "\n")

# Ejecutar demostración completa
if __name__ == "__main__":
    # Mostrar teoría
    analizar_geometrias()
    demostrar_coordenadas_homogeneas()
    mostrar_matrices_proyeccion()
    
    # Mostrar visualizaciones
    print("Generando visualizaciones de proyecciones...")
    demostrar_proyecciones()
