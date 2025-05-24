"""
BCI Visual Interface - Interfaz visual reactiva a señales EEG
Implementa control visual en tiempo real basado en actividad cerebral simulada
"""

import pygame
import numpy as np
import math
import time
import threading
from collections import deque
import colorsys

class BCIVisualInterface:
    def __init__(self, width=1200, height=800):
        """
        Inicializa la interfaz visual BCI
        
        Args:
            width: Ancho de la ventana
            height: Alto de la ventana
        """
        # Inicializar pygame
        pygame.init()
        self.width = width
        self.height = height
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption("🧠 BCI Control Visual - Interfaz Cerebro-Computadora")
        
        # Reloj para controlar FPS
        self.clock = pygame.time.Clock()
        self.fps = 60
        self.running = True
        
        # Estado de control BCI
        self.current_attention = 0.0
        self.current_relaxation = 0.0
        self.current_activation = 0.0
        self.current_calmness = 0.0
        self.mental_state = 'neutral'
        
        # Historia de señales para efectos visuales
        self.attention_history = deque(maxlen=100)
        self.relaxation_history = deque(maxlen=100)
        
        # Elementos visuales
        self.particles = []
        self.time_offset = 0
        
        # Configuración de colores
        self.colors = {
            'background': (10, 10, 30),
            'focused': (255, 100, 100),     # Rojo intenso
            'alert': (255, 200, 100),       # Naranja
            'neutral': (100, 150, 255),     # Azul suave
            'relaxed': (100, 255, 150),     # Verde suave
            'attention': (255, 50, 50),     # Rojo atención
            'relaxation': (50, 255, 50),    # Verde relajación
            'activation': (255, 255, 50),   # Amarillo activación
            'calmness': (50, 150, 255)      # Azul calma
        }
        
        # Fuentes
        self.font_large = pygame.font.Font(None, 48)
        self.font_medium = pygame.font.Font(None, 36)
        self.font_small = pygame.font.Font(None, 24)
        
        # Inicializar partículas
        self.init_particles()
    
    def init_particles(self):
        """Inicializa sistema de partículas"""
        for _ in range(50):
            particle = {
                'x': np.random.randint(0, self.width),
                'y': np.random.randint(0, self.height),
                'vx': np.random.uniform(-2, 2),
                'vy': np.random.uniform(-2, 2),
                'size': np.random.uniform(2, 8),
                'life': 1.0,
                'birth_time': time.time()
            }
            self.particles.append(particle)
    
    def update_bci_state(self, attention, relaxation, activation, calmness, mental_state):
        """
        Actualiza el estado BCI desde el procesador de señales
        
        Args:
            attention: Nivel de atención [0-1]
            relaxation: Nivel de relajación [0-1]
            activation: Nivel de activación [0-1]
            calmness: Nivel de calma [0-1]
            mental_state: Estado mental ('focused', 'alert', 'neutral', 'relaxed')
        """
        self.current_attention = float(attention)
        self.current_relaxation = float(relaxation)
        self.current_activation = float(activation)
        self.current_calmness = float(calmness)
        self.mental_state = mental_state
        
        # Agregar a historia
        self.attention_history.append(self.current_attention)
        self.relaxation_history.append(self.current_relaxation)
    
    def get_dynamic_background_color(self):
        """Calcula color de fondo dinámico basado en estado mental"""
        base_color = self.colors['background']
        
        # Modificar según estado mental
        if self.mental_state == 'focused':
            # Fondo más rojizo cuando concentrado
            modifier = (int(50 * self.current_attention), 0, 0)
        elif self.mental_state == 'relaxed':
            # Fondo más verdoso cuando relajado
            modifier = (0, int(50 * self.current_relaxation), 0)
        elif self.mental_state == 'alert':
            # Fondo más amarillento cuando alerta
            modifier = (int(30 * self.current_activation), int(30 * self.current_activation), 0)
        else:
            # Neutral - azul suave
            modifier = (0, 0, int(20 * self.current_calmness))
        
        # Combinar colores
        final_color = tuple(min(255, base_color[i] + modifier[i]) for i in range(3))
        return final_color
    
    def draw_central_visualization(self):
        """Dibuja la visualización central reactiva"""
        center_x = self.width // 2
        center_y = self.height // 2
        
        # Radio base y pulsación
        base_radius = 100
        pulse_radius = base_radius + (50 * self.current_attention)
        
        # Color basado en estado mental
        if self.mental_state == 'focused':
            color = self.colors['focused']
        elif self.mental_state == 'relaxed':
            color = self.colors['relaxed']
        elif self.mental_state == 'alert':
            color = self.colors['alert']
        else:
            color = self.colors['neutral']
        
        # Crear efecto de pulsación
        pulse_intensity = math.sin(self.time_offset * 2 * math.pi) * 0.3 + 0.7
        alpha = int(255 * pulse_intensity * self.current_activation)
        
        # Crear superficie con transparencia
        surf = pygame.Surface((pulse_radius * 2, pulse_radius * 2), pygame.SRCALPHA)
        
        # Dibujar círculos concéntricos
        for i in range(5):
            radius = pulse_radius * (1 - i * 0.15)
            alpha_layer = alpha * (1 - i * 0.2)
            if alpha_layer > 0:
                color_with_alpha = (*color, int(alpha_layer))
                pygame.draw.circle(surf, color_with_alpha, 
                                 (pulse_radius, pulse_radius), int(radius))
        
        # Blittear superficie al centro
        surf_rect = surf.get_rect(center=(center_x, center_y))
        self.screen.blit(surf, surf_rect)
        
        # Añadir anillos de atención
        if self.current_attention > 0.5:
            ring_radius = pulse_radius + 30
            ring_width = int(10 * self.current_attention)
            pygame.draw.circle(self.screen, self.colors['attention'], 
                             (center_x, center_y), int(ring_radius), ring_width)
    
    def draw_brain_waves_visualization(self):
        """Dibuja ondas cerebrales dinámicas"""
        # Calcular ondas basadas en los niveles BCI
        wave_height = 50
        wave_offset_y = self.height - 100
        
        # Onda Alpha (relajación)
        alpha_points = []
        for x in range(0, self.width, 5):
            frequency = 10  # Hz Alpha
            amplitude = wave_height * self.current_relaxation
            y = wave_offset_y - amplitude * math.sin(
                (x * frequency / 100) + (self.time_offset * 2 * math.pi)
            )
            alpha_points.append((x, y))
        
        if len(alpha_points) > 1:
            pygame.draw.lines(self.screen, self.colors['relaxation'], 
                            False, alpha_points, 3)
        
        # Onda Beta (atención)
        beta_points = []
        for x in range(0, self.width, 3):
            frequency = 20  # Hz Beta
            amplitude = wave_height * self.current_attention
            y = wave_offset_y - 60 - amplitude * math.sin(
                (x * frequency / 100) + (self.time_offset * 3 * math.pi)
            )
            beta_points.append((x, y))
        
        if len(beta_points) > 1:
            pygame.draw.lines(self.screen, self.colors['attention'], 
                            False, beta_points, 2)
    
    def update_particles(self):
        """Actualiza sistema de partículas reactivo"""
        current_time = time.time()
        
        for particle in self.particles[:]:  # Copiar lista para modificación segura
            # Actualizar posición
            particle['x'] += particle['vx'] * (1 + self.current_activation)
            particle['y'] += particle['vy'] * (1 + self.current_activation)
            
            # Efecto de atracción al centro cuando hay alta concentración
            if self.current_attention > 0.7:
                center_x, center_y = self.width // 2, self.height // 2
                dx = center_x - particle['x']
                dy = center_y - particle['y']
                distance = math.sqrt(dx**2 + dy**2)
                
                if distance > 0:
                    attraction_force = 0.1 * self.current_attention
                    particle['vx'] += (dx / distance) * attraction_force
                    particle['vy'] += (dy / distance) * attraction_force
            
            # Rebote en bordes
            if particle['x'] <= 0 or particle['x'] >= self.width:
                particle['vx'] *= -0.8
                particle['x'] = max(0, min(self.width, particle['x']))
            
            if particle['y'] <= 0 or particle['y'] >= self.height:
                particle['vy'] *= -0.8
                particle['y'] = max(0, min(self.height, particle['y']))
            
            # Actualizar vida
            age = current_time - particle['birth_time']
            particle['life'] = max(0, 1 - age / 10)  # Vida de 10 segundos
            
            # Remover partículas muertas
            if particle['life'] <= 0:
                self.particles.remove(particle)
                # Crear nueva partícula
                new_particle = {
                    'x': np.random.randint(0, self.width),
                    'y': np.random.randint(0, self.height),
                    'vx': np.random.uniform(-2, 2),
                    'vy': np.random.uniform(-2, 2),
                    'size': np.random.uniform(2, 8),
                    'life': 1.0,
                    'birth_time': current_time
                }
                self.particles.append(new_particle)
    
    def draw_particles(self):
        """Dibuja partículas con colores reactivos"""
        for particle in self.particles:
            # Color basado en estado mental y vida
            if self.mental_state == 'focused':
                color = self.colors['focused']
            elif self.mental_state == 'relaxed':
                color = self.colors['relaxation']
            else:
                color = self.colors['neutral']
            
            # Aplicar transparencia basada en vida
            alpha = int(255 * particle['life'])
            size = int(particle['size'] * particle['life'])
            
            if size > 0:
                # Crear superficie temporal para transparencia
                surf = pygame.Surface((size * 2, size * 2), pygame.SRCALPHA)
                color_with_alpha = (*color, alpha)
                pygame.draw.circle(surf, color_with_alpha, (size, size), size)
                
                surf_rect = surf.get_rect(center=(int(particle['x']), int(particle['y'])))
                self.screen.blit(surf, surf_rect)
    
    def draw_control_panels(self):
        """Dibuja paneles de control con métricas BCI"""
        panel_height = 120
        panel_width = 250
        margin = 20
        
        # Panel de atención
        attention_rect = pygame.Rect(margin, margin, panel_width, panel_height)
        self.draw_metric_panel(attention_rect, "ATENCIÓN", self.current_attention, 
                              self.colors['attention'], self.attention_history)
        
        # Panel de relajación
        relaxation_rect = pygame.Rect(margin, margin + panel_height + 20, 
                                    panel_width, panel_height)
        self.draw_metric_panel(relaxation_rect, "RELAJACIÓN", self.current_relaxation, 
                              self.colors['relaxation'], self.relaxation_history)
        
        # Panel de estado mental
        state_rect = pygame.Rect(self.width - panel_width - margin, margin, 
                               panel_width, panel_height)
        self.draw_state_panel(state_rect)
        
        # Panel de activación
        activation_rect = pygame.Rect(self.width - panel_width - margin, 
                                    margin + panel_height + 20, 
                                    panel_width, panel_height)
        self.draw_activation_panel(activation_rect)
    
    def draw_metric_panel(self, rect, title, value, color, history):
        """Dibuja panel de métrica individual"""
        # Fondo semi-transparente
        surf = pygame.Surface((rect.width, rect.height), pygame.SRCALPHA)
        pygame.draw.rect(surf, (0, 0, 0, 150), surf.get_rect(), border_radius=10)
        self.screen.blit(surf, rect)
        
        # Borde
        pygame.draw.rect(self.screen, color, rect, 3, border_radius=10)
        
        # Título
        title_surf = self.font_medium.render(title, True, color)
        title_rect = title_surf.get_rect(centerx=rect.centerx, y=rect.y + 10)
        self.screen.blit(title_surf, title_rect)
        
        # Valor numérico
        value_text = f"{value:.2f}"
        value_surf = self.font_large.render(value_text, True, (255, 255, 255))
        value_rect = value_surf.get_rect(centerx=rect.centerx, y=rect.y + 45)
        self.screen.blit(value_surf, value_rect)
        
        # Barra de progreso
        bar_width = rect.width - 40
        bar_height = 15
        bar_x = rect.x + 20
        bar_y = rect.y + 85
        
        # Fondo de la barra
        pygame.draw.rect(self.screen, (50, 50, 50), 
                        (bar_x, bar_y, bar_width, bar_height), border_radius=7)
        
        # Barra de valor
        fill_width = int(bar_width * value)
        if fill_width > 0:
            pygame.draw.rect(self.screen, color, 
                           (bar_x, bar_y, fill_width, bar_height), border_radius=7)
        
        # Mini gráfico de historia
        if len(history) > 1:
            points = []
            for i, hist_value in enumerate(history):
                x = rect.x + 20 + (i * (rect.width - 40) / len(history))
                y = rect.y + 100 - (hist_value * 15)
                points.append((x, y))
            
            if len(points) > 1:
                pygame.draw.lines(self.screen, color, False, points, 2)
    
    def draw_state_panel(self, rect):
        """Dibuja panel de estado mental"""
        # Fondo
        surf = pygame.Surface((rect.width, rect.height), pygame.SRCALPHA)
        state_color = self.colors.get(self.mental_state, self.colors['neutral'])
        pygame.draw.rect(surf, (*state_color, 100), surf.get_rect(), border_radius=10)
        self.screen.blit(surf, rect)
        
        # Borde
        pygame.draw.rect(self.screen, state_color, rect, 3, border_radius=10)
        
        # Título
        title_surf = self.font_medium.render("ESTADO MENTAL", True, state_color)
        title_rect = title_surf.get_rect(centerx=rect.centerx, y=rect.y + 10)
        self.screen.blit(title_surf, title_rect)
        
        # Estado actual
        state_text = self.mental_state.upper()
        state_surf = self.font_large.render(state_text, True, (255, 255, 255))
        state_rect = state_surf.get_rect(centerx=rect.centerx, centery=rect.centery)
        self.screen.blit(state_surf, state_rect)
        
        # Indicador visual
        indicator_radius = 15
        indicator_pos = (rect.centerx, rect.y + rect.height - 25)
        pygame.draw.circle(self.screen, state_color, indicator_pos, indicator_radius)
    
    def draw_activation_panel(self, rect):
        """Dibuja panel de activación/calma"""
        # Fondo
        surf = pygame.Surface((rect.width, rect.height), pygame.SRCALPHA)
        pygame.draw.rect(surf, (0, 0, 0, 150), surf.get_rect(), border_radius=10)
        self.screen.blit(surf, rect)
        
        # Título
        title_surf = self.font_medium.render("ACTIVACIÓN", True, self.colors['activation'])
        title_rect = title_surf.get_rect(centerx=rect.centerx, y=rect.y + 10)
        self.screen.blit(title_surf, title_rect)
        
        # Medidor circular
        center = (rect.centerx, rect.y + 70)
        radius = 30
        
        # Círculo base
        pygame.draw.circle(self.screen, (50, 50, 50), center, radius, 3)
        
        # Arco de activación
        if self.current_activation > 0:
            angle = self.current_activation * 2 * math.pi
            points = [center]
            for i in range(int(angle * 20)):
                x = center[0] + radius * math.cos(i / 20 - math.pi/2)
                y = center[1] + radius * math.sin(i / 20 - math.pi/2)
                points.append((x, y))
            
            if len(points) > 2:
                pygame.draw.polygon(self.screen, self.colors['activation'], points)
    
    def draw_instructions(self):
        """Dibuja instrucciones de uso"""
        instructions = [
            "🧠 CONTROLES MENTALES:",
            "• CONCENTRACIÓN → Círculo rojo pulsante",
            "• RELAJACIÓN → Ondas verdes suaves", 
            "• ACTIVACIÓN → Partículas dinámicas",
            "• CALMA → Fondo azul tranquilo",
            "",
            "Presiona 'Q' para salir"
        ]
        
        y_start = self.height - len(instructions) * 25 - 20
        for i, instruction in enumerate(instructions):
            color = (200, 200, 200) if instruction.startswith("•") else (255, 255, 255)
            if instruction.startswith("🧠"):
                color = self.colors['activation']
            
            text_surf = self.font_small.render(instruction, True, color)
            self.screen.blit(text_surf, (20, y_start + i * 25))
    
    def handle_events(self):
        """Maneja eventos de pygame"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_q:
                    self.running = False
    
    def render_frame(self):
        """Renderiza un frame completo"""
        # Limpiar pantalla con color dinámico
        bg_color = self.get_dynamic_background_color()
        self.screen.fill(bg_color)
        
        # Actualizar tiempo
        self.time_offset = time.time() % 1.0
        
        # Actualizar partículas
        self.update_particles()
        
        # Dibujar elementos visuales
        self.draw_particles()
        self.draw_brain_waves_visualization()
        self.draw_central_visualization()
        self.draw_control_panels()
        self.draw_instructions()
        
        # Actualizar pantalla
        pygame.display.flip()
        self.clock.tick(self.fps)
    
    def run(self):
        """Ejecuta el bucle principal de la interfaz"""
        print("🎮 Iniciando interfaz visual BCI...")
        print("Utiliza los controles de simulación para ver efectos visuales")
        
        while self.running:
            self.handle_events()
            self.render_frame()
        
        pygame.quit()
    
    def close(self):
        """Cierra la interfaz"""
        self.running = False
        pygame.quit()

# Clase para simular control desde teclado (para pruebas)
class KeyboardBCISimulator:
    def __init__(self, interface):
        """
        Simulador de control BCI usando teclado
        
        Args:
            interface: Instancia de BCIVisualInterface
        """
        self.interface = interface
        self.attention = 0.5
        self.relaxation = 0.5
        self.activation = 0.5
        self.calmness = 0.5
        self.running = True
    
    def simulate_controls(self):
        """Simula controles BCI usando el teclado"""
        keys = pygame.key.get_pressed()
        
        # Controles de atención (A/Z)
        if keys[pygame.K_a]:
            self.attention = min(1.0, self.attention + 0.02)
        elif keys[pygame.K_z]:
            self.attention = max(0.0, self.attention - 0.02)
        
        # Controles de relajación (S/X)
        if keys[pygame.K_s]:
            self.relaxation = min(1.0, self.relaxation + 0.02)
        elif keys[pygame.K_x]:
            self.relaxation = max(0.0, self.relaxation - 0.02)
        
        # Controles de activación (D/C)
        if keys[pygame.K_d]:
            self.activation = min(1.0, self.activation + 0.02)
        elif keys[pygame.K_c]:
            self.activation = max(0.0, self.activation - 0.02)
        
        # Controles de calma (F/V)
        if keys[pygame.K_f]:
            self.calmness = min(1.0, self.calmness + 0.02)
        elif keys[pygame.K_v]:
            self.calmness = max(0.0, self.calmness - 0.02)
        
        # Determinar estado mental
        if self.attention > 0.7 and self.relaxation < 0.3:
            mental_state = 'focused'
        elif self.attention > 0.5 and self.relaxation < 0.5:
            mental_state = 'alert'
        elif self.relaxation > 0.7:
            mental_state = 'relaxed'
        else:
            mental_state = 'neutral'
        
        # Actualizar interfaz
        self.interface.update_bci_state(
            self.attention, self.relaxation, 
            self.activation, self.calmness, mental_state
        )

def main():
    """Función principal para ejecutar la interfaz BCI"""
    print("🧠 Interfaz Visual BCI - Brain-Computer Interface")
    print("="*60)
    print("\n🎮 CONTROLES DE SIMULACIÓN:")
    print("A/Z - Aumentar/Disminuir Atención")
    print("S/X - Aumentar/Disminuir Relajación") 
    print("D/C - Aumentar/Disminuir Activación")
    print("F/V - Aumentar/Disminuir Calma")
    print("Q   - Salir")
    print("\n✨ ¡Experimenta con diferentes combinaciones!")
    
    # Crear interfaz
    interface = BCIVisualInterface(width=1200, height=800)
    
    # Crear simulador de teclado
    simulator = KeyboardBCISimulator(interface)
    
    # Bucle principal con simulación
    while interface.running:
        interface.handle_events()
        simulator.simulate_controls()
        interface.render_frame()
    
    interface.close()
    print("\n👋 ¡Sesión BCI finalizada!")

if __name__ == "__main__":
    main() 