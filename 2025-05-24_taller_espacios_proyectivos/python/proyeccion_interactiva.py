import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
import matplotlib.patches as mpatches
from matplotlib.widgets import Slider
from mpl_toolkits.mplot3d import Axes3D

class DemostracionProyeccion:
    """
    Demostración visual e interactiva de las diferencias entre
    proyección ortogonal y perspectiva
    """
    
    def __init__(self):
        # Crear una escena 3D simple: una casa
        self.crear_casa_3d()
        
    def crear_casa_3d(self):
        """Crear los puntos de una casa simple en 3D"""
        # Base de la casa (cuadrado)
        base = np.array([
            [-1, -1, 0],  # 0
            [1, -1, 0],   # 1
            [1, 1, 0],    # 2
            [-1, 1, 0],   # 3
        ])
        
        # Techo de la casa (pirámide)
        techo = np.array([
            [-1, -1, 1],   # 4
            [1, -1, 1],    # 5
            [1, 1, 1],     # 6
            [-1, 1, 1],    # 7
            [0, 0, 2],     # 8 - punta del techo
        ])
        
        # Combinar todos los puntos
        self.puntos_casa = np.vstack([base, techo]).T
        
        # Definir las aristas de la casa
        self.aristas_casa = [
            # Base
            [0, 1], [1, 2], [2, 3], [3, 0],
            # Paredes
            [0, 4], [1, 5], [2, 6], [3, 7],
            # Techo superior
            [4, 5], [5, 6], [6, 7], [7, 4],
            # Punta del techo
            [4, 8], [5, 8], [6, 8], [7, 8]
        ]
        
    def proyeccion_ortogonal(self, puntos):
        """Proyección ortogonal simple (eliminar Z)"""
        return puntos[:2, :]
    
    def proyeccion_perspectiva(self, puntos, distancia_focal=2.0, centro_camara=np.array([0, 0, -5])):
        """
        Proyección perspectiva más realista con centro de cámara
        """
        puntos_trasladados = puntos.T - centro_camara
        
        # Proyección perspectiva
        x_proy = (distancia_focal * puntos_trasladados[:, 0]) / (-puntos_trasladados[:, 2])
        y_proy = (distancia_focal * puntos_trasladados[:, 1]) / (-puntos_trasladados[:, 2])
        
        return np.array([x_proy, y_proy])
    
    def visualizar_proyecciones(self):
        """Crear visualización comparativa de las proyecciones"""
        fig = plt.figure(figsize=(16, 10))
        
        # 1. Vista 3D original
        ax1 = fig.add_subplot(2, 3, 1, projection='3d')
        self.dibujar_casa_3d(ax1)
        ax1.set_title('Vista 3D Original', fontsize=14, fontweight='bold')
        ax1.set_xlabel('X')
        ax1.set_ylabel('Y')
        ax1.set_zlabel('Z')
        ax1.view_init(elev=20, azim=45)
        
        # 2. Proyección Ortogonal
        ax2 = fig.add_subplot(2, 3, 2)
        proy_ortogonal = self.proyeccion_ortogonal(self.puntos_casa)
        self.dibujar_casa_2d(ax2, proy_ortogonal, 'blue')
        ax2.set_title('Proyección Ortogonal', fontsize=14, fontweight='bold')
        ax2.set_xlabel('X')
        ax2.set_ylabel('Y')
        ax2.grid(True, alpha=0.3)
        ax2.set_aspect('equal')
        ax2.set_xlim(-2, 2)
        ax2.set_ylim(-2, 2)
        
        # Añadir anotación
        ax2.text(0, -1.7, 'Sin efecto de profundidad', 
                ha='center', fontsize=10, style='italic', color='blue')
        
        # 3. Proyección Perspectiva (distancia focal = 2)
        ax3 = fig.add_subplot(2, 3, 3)
        proy_perspectiva = self.proyeccion_perspectiva(self.puntos_casa, distancia_focal=2.0)
        self.dibujar_casa_2d(ax3, proy_perspectiva, 'green')
        ax3.set_title('Proyección Perspectiva (f=2.0)', fontsize=14, fontweight='bold')
        ax3.set_xlabel('X')
        ax3.set_ylabel('Y')
        ax3.grid(True, alpha=0.3)
        ax3.set_aspect('equal')
        ax3.set_xlim(-2, 2)
        ax3.set_ylim(-2, 2)
        
        # Añadir anotación
        ax3.text(0, -1.7, 'Efecto de profundidad moderado', 
                ha='center', fontsize=10, style='italic', color='green')
        
        # 4. Diagrama explicativo de proyección ortogonal
        ax4 = fig.add_subplot(2, 3, 4)
        self.dibujar_diagrama_ortogonal(ax4)
        ax4.set_title('Diagrama: Proyección Ortogonal', fontsize=14, fontweight='bold')
        
        # 5. Proyección Perspectiva (distancia focal = 1)
        ax5 = fig.add_subplot(2, 3, 5)
        proy_perspectiva_1 = self.proyeccion_perspectiva(self.puntos_casa, distancia_focal=1.0)
        self.dibujar_casa_2d(ax5, proy_perspectiva_1, 'red')
        ax5.set_title('Proyección Perspectiva (f=1.0)', fontsize=14, fontweight='bold')
        ax5.set_xlabel('X')
        ax5.set_ylabel('Y')
        ax5.grid(True, alpha=0.3)
        ax5.set_aspect('equal')
        ax5.set_xlim(-2, 2)
        ax5.set_ylim(-2, 2)
        
        # Añadir anotación
        ax5.text(0, -1.7, 'Efecto de profundidad fuerte', 
                ha='center', fontsize=10, style='italic', color='red')
        
        # 6. Diagrama explicativo de proyección perspectiva
        ax6 = fig.add_subplot(2, 3, 6)
        self.dibujar_diagrama_perspectiva(ax6)
        ax6.set_title('Diagrama: Proyección Perspectiva', fontsize=14, fontweight='bold')
        
        plt.suptitle('Comparación de Proyecciones: Ortogonal vs Perspectiva', 
                    fontsize=16, fontweight='bold')
        plt.tight_layout()
        
        # Guardar la figura
        plt.savefig('demostracion_proyecciones.png', dpi=150, bbox_inches='tight')
        print("📊 Demostración guardada como 'demostracion_proyecciones.png'")
        
        try:
            plt.show()
        except:
            print("⚠️ No se pudo mostrar la visualización en pantalla.")
    
    def dibujar_casa_3d(self, ax):
        """Dibujar la casa en 3D"""
        # Dibujar puntos
        ax.scatter(self.puntos_casa[0, :], self.puntos_casa[1, :], 
                  self.puntos_casa[2, :], c='red', s=100, alpha=0.8)
        
        # Dibujar aristas
        for arista in self.aristas_casa:
            p1, p2 = arista
            ax.plot([self.puntos_casa[0, p1], self.puntos_casa[0, p2]],
                   [self.puntos_casa[1, p1], self.puntos_casa[1, p2]],
                   [self.puntos_casa[2, p1], self.puntos_casa[2, p2]], 
                   'b-', linewidth=2, alpha=0.7)
    
    def dibujar_casa_2d(self, ax, puntos, color):
        """Dibujar la casa proyectada en 2D"""
        # Dibujar puntos
        ax.scatter(puntos[0, :], puntos[1, :], c=color, s=100, alpha=0.8, zorder=5)
        
        # Dibujar aristas
        for arista in self.aristas_casa:
            p1, p2 = arista
            ax.plot([puntos[0, p1], puntos[0, p2]],
                   [puntos[1, p1], puntos[1, p2]], 
                   color=color, linewidth=2, alpha=0.7)
            
    def dibujar_diagrama_ortogonal(self, ax):
        """Dibujar diagrama explicativo de proyección ortogonal"""
        ax.set_xlim(-3, 3)
        ax.set_ylim(-2, 3)
        ax.axis('off')
        
        # Plano de proyección
        ax.plot([-2, -2], [-1.5, 2.5], 'k-', linewidth=3, label='Plano de proyección')
        ax.text(-2.2, 2.7, 'Plano de\nProyección', ha='center', fontsize=10, fontweight='bold')
        
        # Rayos de proyección (paralelos)
        for y in np.linspace(-1, 2, 4):
            ax.arrow(2, y, -3.8, 0, head_width=0.1, head_length=0.1, 
                    fc='blue', ec='blue', alpha=0.5, linestyle='--')
        
        # Objeto 3D
        rect = Rectangle((1.5, 0.5), 0.5, 1, fill=True, 
                        facecolor='red', edgecolor='darkred', alpha=0.7)
        ax.add_patch(rect)
        ax.text(1.75, 1.7, 'Objeto 3D', ha='center', fontsize=10)
        
        # Proyección
        rect_proy = Rectangle((-2.2, 0.5), 0.2, 1, fill=True, 
                            facecolor='blue', edgecolor='darkblue', alpha=0.7)
        ax.add_patch(rect_proy)
        
        # Anotación
        ax.text(0, -1.5, 'Rayos paralelos\n(ortogonales al plano)', 
               ha='center', fontsize=10, style='italic', color='blue')
        
    def dibujar_diagrama_perspectiva(self, ax):
        """Dibujar diagrama explicativo de proyección perspectiva"""
        ax.set_xlim(-3, 3)
        ax.set_ylim(-2, 3)
        ax.axis('off')
        
        # Centro de proyección (ojo/cámara)
        ax.scatter([2.5], [1], s=200, c='orange', marker='o', zorder=5)
        ax.text(2.5, 0.5, 'Centro de\nProyección', ha='center', fontsize=10, fontweight='bold')
        
        # Plano de proyección
        ax.plot([-2, -2], [-1.5, 2.5], 'k-', linewidth=3)
        ax.text(-2.2, 2.7, 'Plano de\nProyección', ha='center', fontsize=10, fontweight='bold')
        
        # Rayos de proyección (convergentes)
        puntos_objeto = [[0, 0.5], [0, 1.5], [0.5, 0.5], [0.5, 1.5]]
        for punto in puntos_objeto:
            # Línea desde el centro hasta el punto
            ax.plot([2.5, punto[0]], [1, punto[1]], 'g--', alpha=0.5)
            # Continuar hasta el plano
            # Calcular intersección con el plano x=-2
            t = (-2 - 2.5) / (punto[0] - 2.5)
            y_intersec = 1 + t * (punto[1] - 1)
            ax.plot([punto[0], -2], [punto[1], y_intersec], 'g--', alpha=0.5)
            ax.scatter([-2], [y_intersec], s=50, c='green', zorder=5)
        
        # Objeto 3D
        rect = Rectangle((0, 0.5), 0.5, 1, fill=True, 
                        facecolor='red', edgecolor='darkred', alpha=0.7)
        ax.add_patch(rect)
        ax.text(0.25, 1.7, 'Objeto 3D', ha='center', fontsize=10)
        
        # Anotación
        ax.text(0, -1.5, 'Rayos convergentes\n(pasan por el centro)', 
               ha='center', fontsize=10, style='italic', color='green')

class VisualizadorProyecciones:
    """
    Clase para visualización interactiva de proyecciones 3D a 2D.
    """
    
    def __init__(self):
        self.fig = None
        self.axes = {}
        self.sliders = {}
        self.objetos_3d = {}
        
    def generar_casa_3d(self):
        """
        Genera los vértices y aristas de una casa 3D simple.
        """
        # Base de la casa
        base = np.array([
            [-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0],  # Piso
            [-2, -2, 3], [2, -2, 3], [2, 2, 3], [-2, 2, 3],  # Techo base
        ])
        
        # Techo triangular
        techo = np.array([
            [0, -2, 5], [0, 2, 5]  # Punta del techo
        ])
        
        vertices = np.vstack([base, techo]).T
        
        # Definir aristas
        aristas = [
            # Base
            (0, 1), (1, 2), (2, 3), (3, 0),
            # Paredes
            (0, 4), (1, 5), (2, 6), (3, 7),
            # Techo base
            (4, 5), (5, 6), (6, 7), (7, 4),
            # Techo triangular
            (4, 8), (5, 8), (7, 9), (6, 9), (8, 9)
        ]
        
        return vertices, aristas
    
    def proyectar_con_camara(self, puntos, pos_camara, orientacion, d=1.0, tipo='perspectiva'):
        """
        Proyecta puntos 3D usando posición y orientación de cámara.
        """
        # Trasladar puntos al sistema de coordenadas de la cámara
        puntos_cam = puntos - pos_camara.reshape(3, 1)
        
        # Aplicar rotación según orientación (simplificado)
        # Aquí asumimos orientación como ángulos de Euler
        yaw, pitch = orientacion
        
        # Matriz de rotación Y (yaw)
        cy, sy = np.cos(yaw), np.sin(yaw)
        Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
        
        # Matriz de rotación X (pitch)
        cp, sp = np.cos(pitch), np.sin(pitch)
        Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]])
        
        # Aplicar rotaciones
        puntos_cam = Rx @ Ry @ puntos_cam
        
        if tipo == 'perspectiva':
            # Proyección perspectiva
            z = puntos_cam[2, :]
            z[z == 0] = 0.001  # Evitar división por cero
            puntos_2d = puntos_cam[:2, :] * d / z
        else:
            # Proyección ortogonal
            puntos_2d = puntos_cam[:2, :]
        
        return puntos_2d
    
    def crear_visualizacion_interactiva(self):
        """
        Crea una visualización interactiva con sliders para controlar la proyección.
        """
        # Generar objetos 3D
        vertices_casa, aristas_casa = self.generar_casa_3d()
        self.objetos_3d['casa'] = (vertices_casa, aristas_casa)
        
        # Crear figura
        self.fig = plt.figure(figsize=(16, 10))
        self.fig.suptitle('Visualización Interactiva de Proyecciones 3D', fontsize=16)
        
        # Configurar grid de subgráficos
        gs = self.fig.add_gridspec(3, 3, height_ratios=[2, 2, 1], hspace=0.3, wspace=0.3)
        
        # Vista 3D original
        self.axes['3d'] = self.fig.add_subplot(gs[0, 0], projection='3d')
        self.dibujar_escena_3d()
        
        # Proyección ortogonal
        self.axes['ortogonal'] = self.fig.add_subplot(gs[0, 1])
        
        # Proyección perspectiva
        self.axes['perspectiva'] = self.fig.add_subplot(gs[0, 2])
        
        # Diagrama explicativo
        self.axes['diagrama'] = self.fig.add_subplot(gs[1, :])
        
        # Sliders
        ax_d = plt.axes([0.2, 0.15, 0.6, 0.03])
        ax_yaw = plt.axes([0.2, 0.10, 0.6, 0.03])
        ax_pitch = plt.axes([0.2, 0.05, 0.6, 0.03])
        
        self.sliders['d'] = Slider(ax_d, 'Distancia Focal', 0.5, 5.0, valinit=2.0)
        self.sliders['yaw'] = Slider(ax_yaw, 'Rotación Y (Yaw)', -np.pi, np.pi, valinit=0.3)
        self.sliders['pitch'] = Slider(ax_pitch, 'Rotación X (Pitch)', -np.pi/2, np.pi/2, valinit=0.2)
        
        # Conectar sliders a función de actualización
        for slider in self.sliders.values():
            slider.on_changed(self.actualizar_visualizacion)
        
        # Actualización inicial
        self.actualizar_visualizacion(None)
        
        plt.show()
    
    def dibujar_escena_3d(self):
        """
        Dibuja la escena 3D original.
        """
        ax = self.axes['3d']
        ax.clear()
        ax.set_title('Escena 3D Original')
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
        
        vertices, aristas = self.objetos_3d['casa']
        
        # Dibujar aristas
        for i, j in aristas:
            ax.plot3D([vertices[0, i], vertices[0, j]], 
                     [vertices[1, i], vertices[1, j]], 
                     [vertices[2, i], vertices[2, j]], 'b-', linewidth=2)
        
        # Dibujar vértices
        ax.scatter3D(vertices[0], vertices[1], vertices[2], color='red', s=50)
        
        # Añadir plano de proyección
        xx, yy = np.meshgrid(np.linspace(-4, 4, 10), np.linspace(-4, 4, 10))
        zz = np.ones_like(xx) * -2
        ax.plot_surface(xx, yy, zz, alpha=0.2, color='cyan')
        
        # Posición de cámara
        ax.scatter3D([0], [0], [-8], color='green', s=100, marker='^')
        ax.text(0, 0, -8.5, 'Cámara', ha='center')
        
        ax.set_xlim([-5, 5])
        ax.set_ylim([-5, 5])
        ax.set_zlim([-10, 6])
    
    def actualizar_visualizacion(self, val):
        """
        Actualiza las visualizaciones basándose en los valores de los sliders.
        """
        # Obtener valores actuales
        d = self.sliders['d'].val
        yaw = self.sliders['yaw'].val
        pitch = self.sliders['pitch'].val
        
        # Posición de cámara
        pos_camara = np.array([0, 0, -8])
        orientacion = (yaw, pitch)
        
        vertices, aristas = self.objetos_3d['casa']
        
        # Actualizar proyección ortogonal
        ax_ort = self.axes['ortogonal']
        ax_ort.clear()
        puntos_ort = self.proyectar_con_camara(vertices, pos_camara, orientacion, d, 'ortogonal')
        self.dibujar_proyeccion_2d(ax_ort, puntos_ort, aristas, 
                                  'Proyección Ortogonal', 'green')
        
        # Actualizar proyección perspectiva
        ax_persp = self.axes['perspectiva']
        ax_persp.clear()
        puntos_persp = self.proyectar_con_camara(vertices, pos_camara, orientacion, d, 'perspectiva')
        self.dibujar_proyeccion_2d(ax_persp, puntos_persp, aristas, 
                                  f'Proyección Perspectiva (d={d:.1f})', 'blue')
        
        # Actualizar diagrama explicativo
        self.actualizar_diagrama(d, yaw, pitch)
        
        self.fig.canvas.draw_idle()
    
    def dibujar_proyeccion_2d(self, ax, puntos_2d, aristas, titulo, color):
        """
        Dibuja una proyección 2D.
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
        
        ax.set_xlim([-4, 4])
        ax.set_ylim([-4, 4])
    
    def actualizar_diagrama(self, d, yaw, pitch):
        """
        Actualiza el diagrama explicativo de las proyecciones.
        """
        ax = self.axes['diagrama']
        ax.clear()
        ax.set_title('Diagrama Conceptual de Proyecciones')
        ax.set_xlim(-10, 10)
        ax.set_ylim(-5, 5)
        ax.axis('off')
        
        # Dibujar diagrama de proyección ortogonal
        ax.text(-7, 4, 'Proyección Ortogonal', fontsize=12, weight='bold')
        ax.arrow(-8, 2, 0, -3, head_width=0.3, head_length=0.2, fc='green', ec='green')
        ax.arrow(-6, 2, 0, -3, head_width=0.3, head_length=0.2, fc='green', ec='green')
        ax.arrow(-4, 2, 0, -3, head_width=0.3, head_length=0.2, fc='green', ec='green')
        ax.plot([-9, -3], [-1.5, -1.5], 'k-', linewidth=2)
        ax.text(-6, -2.5, 'Plano de proyección', ha='center')
        ax.text(-6, 3, 'Rayos paralelos', ha='center', color='green')
        
        # Dibujar diagrama de proyección perspectiva
        ax.text(3, 4, 'Proyección Perspectiva', fontsize=12, weight='bold')
        ax.plot([5, 5], [3, 0], 'ko', markersize=8)  # Punto de vista
        ax.text(5, 3.5, 'Cámara', ha='center')
        
        # Rayos convergentes
        for y in [2.5, 1.5, 0.5]:
            ax.plot([5, 3], [0, -1.5], 'b-', alpha=0.5)
            ax.plot([5, 7], [0, -1.5], 'b-', alpha=0.5)
        
        ax.plot([2, 8], [-1.5, -1.5], 'k-', linewidth=2)
        ax.text(5, -2.5, 'Plano de proyección', ha='center')
        ax.text(5, -3.5, f'Distancia focal: {d:.1f}', ha='center', color='blue')
        
        # Información adicional
        ax.text(0, -4.5, f'Yaw: {np.degrees(yaw):.1f}°  Pitch: {np.degrees(pitch):.1f}°', 
               ha='center', fontsize=10)

# Función para demostración de transformaciones matriciales
def demostrar_transformaciones_matriciales():
    """
    Muestra cómo las matrices de proyección transforman puntos.
    """
    print("\n=== DEMOSTRACIÓN DE TRANSFORMACIONES MATRICIALES ===\n")
    
    # Punto ejemplo
    punto_3d = np.array([3, 2, 5, 1])  # En coordenadas homogéneas
    print(f"Punto 3D original (homogéneo): {punto_3d}")
    
    # Matriz de proyección ortogonal
    P_ort = np.array([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 1]
    ])
    
    punto_ort = P_ort @ punto_3d
    print(f"\nProyección Ortogonal:")
    print(f"  Matriz P_ort @ punto = {punto_ort}")
    print(f"  Resultado 2D: ({punto_ort[0]}, {punto_ort[1]})")
    
    # Matriz de proyección perspectiva
    d = 2.0
    P_persp = np.array([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 1/d, 0]
    ])
    
    punto_persp = P_persp @ punto_3d
    punto_persp_norm = punto_persp / punto_persp[3]
    print(f"\nProyección Perspectiva (d={d}):")
    print(f"  Matriz P_persp @ punto = {punto_persp}")
    print(f"  Después de normalizar: {punto_persp_norm}")
    print(f"  Resultado 2D: ({punto_persp_norm[0]:.2f}, {punto_persp_norm[1]:.2f})")
    
    print("\nObserva cómo en la proyección perspectiva, las coordenadas x,y")
    print("se dividen por z/d, creando el efecto de perspectiva.")

def main():
    """Función principal"""
    print("🎯 TALLER MEJORADO: ESPACIOS PROYECTIVOS")
    print("=" * 50)
    
    # Ejecutar el ejemplo de matrices
    demostrar_transformaciones_matriciales()
    
    # Crear y ejecutar la demostración visual
    demo = DemostracionProyeccion()
    print("\n📊 Generando visualizaciones comparativas...")
    demo.visualizar_proyecciones()
    
    print("\n✅ ¡Taller completado con éxito!")
    print("📁 Revisa los archivos PNG generados para ver las visualizaciones")

if __name__ == "__main__":
    main() 