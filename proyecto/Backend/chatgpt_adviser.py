"""
Módulo para consultar ChatGPT sobre productos clasificados
Proporciona consejos e información sobre el impacto ambiental
"""

import openai
from dotenv import load_dotenv
import os
import json

# Cargar variables de entorno
load_dotenv()

class ChatGPTAdviser:
    def __init__(self):
        """Inicializar el asesor de ChatGPT"""
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.model = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
        
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY no encontrada en variables de entorno")
        
        # Configurar cliente OpenAI
        openai.api_key = self.api_key
        self.client = openai.OpenAI(api_key=self.api_key)
        
        print(f"✅ ChatGPT Adviser inicializado con modelo: {self.model}")
    
    def get_product_advice(self, category, original_class, confidence):
        """
        Obtener consejos e información sobre el impacto ambiental del producto
        
        Args:
            category (str): Categoría del producto (plástico, vidrio, etc.)
            original_class (str): Clase original detectada por el modelo
            confidence (float): Nivel de confianza de la detección
            
        Returns:
            dict: Diccionario con consejos e información sobre impacto ambiental
        """
        try:
            # Crear prompt específico para el producto
            prompt = self._create_prompt(category, original_class, confidence)
            
            # Realizar consulta a ChatGPT
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Eres un experto en reciclaje y sostenibilidad ambiental. Proporciona consejos prácticos y precisos sobre el manejo de residuos, siempre en español."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            # Extraer contenido de la respuesta
            content = response.choices[0].message.content
            
            # Parsear la respuesta (intentar extraer JSON si es posible)
            advice_data = self._parse_response(content)
            
            return {
                'success': True,
                'advice': advice_data,
                'raw_response': content
            }
            
        except Exception as e:
            print(f"❌ Error consultando ChatGPT: {e}")
            return {
                'success': False,
                'error': str(e),
                'advice': self._get_fallback_advice(category)
            }
    
    def _create_prompt(self, category, original_class, confidence):
        """Crear prompt específico para el producto"""
        return f"""
        He detectado un producto clasificado como "{category}" (detectado originalmente como "{original_class}" con {confidence:.2%} de confianza).
        
        Por favor, proporciona información estructurada sobre:
        1. CONSEJOS DE RECICLAJE: Instrucciones específicas sobre cómo reciclar correctamente este tipo de material
        2. IMPACTO AMBIENTAL: Cuál es el impacto ambiental de este material y qué sucede si no se recicla adecuadamente
        3. DATOS INTERESANTES: Datos curiosos o estadísticas relevantes sobre este tipo de material
        4. ALTERNATIVAS SOSTENIBLES: Sugerencias de alternativas más ecológicas para el futuro
        
        Mantén la respuesta concisa pero informativa, máximo 300 palabras en total.
        """
    
    def _parse_response(self, content):
        """Parsear la respuesta de ChatGPT para extraer información estructurada"""
        try:
            # Intentar encontrar secciones en la respuesta
            sections = {}
            
            # Buscar secciones comunes
            section_keywords = {
                'consejos': ['CONSEJOS', 'RECICLAJE', 'CÓMO RECICLAR'],
                'impacto': ['IMPACTO', 'AMBIENTAL', 'MEDIO AMBIENTE'],
                'datos': ['DATOS', 'CURIOSOS', 'ESTADÍSTICAS', 'INTERESANTES'],
                'alternativas': ['ALTERNATIVAS', 'SOSTENIBLES', 'ECOLÓGICAS']
            }
            
            lines = content.split('\n')
            current_section = None
            current_content = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Buscar encabezados de sección
                line_upper = line.upper()
                found_section = False
                
                for section_key, keywords in section_keywords.items():
                    if any(keyword in line_upper for keyword in keywords):
                        # Guardar sección anterior
                        if current_section and current_content:
                            sections[current_section] = ' '.join(current_content)
                        
                        current_section = section_key
                        current_content = []
                        found_section = True
                        break
                
                if not found_section and current_section:
                    # Limpiar marcadores de lista
                    clean_line = line.replace('•', '').replace('-', '').replace('*', '').strip()
                    if clean_line and not clean_line.startswith(('1.', '2.', '3.', '4.')):
                        current_content.append(clean_line)
            
            # Guardar última sección
            if current_section and current_content:
                sections[current_section] = ' '.join(current_content)
            
            # Si no se encontraron secciones, usar el contenido completo
            if not sections:
                sections = {
                    'consejos': content[:150] + '...' if len(content) > 150 else content,
                    'impacto': 'Información sobre impacto ambiental incluida en los consejos.',
                    'datos': 'Consulta adicional requerida para datos específicos.',
                    'alternativas': 'Buscar alternativas sostenibles según el tipo de material.'
                }
            
            return sections
            
        except Exception as e:
            print(f"❌ Error parseando respuesta: {e}")
            return {
                'consejos': content[:200] + '...' if len(content) > 200 else content,
                'impacto': 'Error procesando información de impacto',
                'datos': 'Error procesando datos adicionales',
                'alternativas': 'Error procesando alternativas'
            }
    
    def _get_fallback_advice(self, category):
        """Obtener consejos de respaldo si falla la consulta a ChatGPT"""
        fallback_advice = {
            'plastic': {
                'consejos': 'Limpia el envase antes de reciclarlo. Retira etiquetas si es posible y deposítalo en el contenedor amarillo.',
                'impacto': 'El plástico puede tardar hasta 1000 años en descomponerse. Su reciclaje reduce la contaminación marina.',
                'datos': 'Solo el 9% del plástico mundial ha sido reciclado. Reciclar una botella de plástico ahorra energía para encender una bombilla 6 horas.',
                'alternativas': 'Usa botellas reutilizables, bolsas de tela, y productos con menos embalaje plástico.'
            },
            'glass': {
                'consejos': 'Retira tapas y etiquetas. Deposita en contenedor verde. No mezcles con cristal roto de ventanas.',
                'impacto': 'El vidrio es 100% reciclable infinitas veces sin perder calidad. Ahorra energía y reduce emisiones.',
                'datos': 'Reciclar vidrio ahorra 30% de energía comparado con producir vidrio nuevo.',
                'alternativas': 'Reutiliza frascos para almacenamiento, elige productos en envases de vidrio retornable.'
            },
            'paper': {
                'consejos': 'Separa papeles limpios y secos. Retira grapas y cinta adhesiva. Deposita en contenedor azul.',
                'impacto': 'Reciclar papel salva árboles, reduce consumo de agua y energía en 50%.',
                'datos': 'Una tonelada de papel reciclado salva 17 árboles y 26,000 litros de agua.',
                'alternativas': 'Usa papel digital, reutiliza hojas por ambos lados, elige productos con papel reciclado.'
            },
            'metal': {
                'consejos': 'Limpia latas y envases metálicos. Retira etiquetas de papel. Deposita en contenedor amarillo.',
                'impacto': 'El metal es infinitamente reciclable. Su reciclaje reduce la minería y emisiones de CO2.',
                'datos': 'Reciclar aluminio ahorra 95% de energía comparado con producir aluminio nuevo.',
                'alternativas': 'Elige productos con menos embalaje, reutiliza latas para organización.'
            }
        }
        
        return fallback_advice.get(category, {
            'consejos': 'Consulta las guías locales de reciclaje para este tipo de material.',
            'impacto': 'El reciclaje adecuado reduce el impacto ambiental y conserva recursos naturales.',
            'datos': 'Cada pequeña acción de reciclaje contribuye a un planeta más sostenible.',
            'alternativas': 'Busca alternativas reutilizables y productos con menor impacto ambiental.'
        })
    
    def test_connection(self):
        """Probar conexión con OpenAI API"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": "Di 'Conexión exitosa' en español"}
                ],
                max_tokens=10
            )
            
            return {
                'success': True,
                'message': 'Conexión exitosa con OpenAI API',
                'response': response.choices[0].message.content
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Función de prueba
if __name__ == "__main__":
    try:
        adviser = ChatGPTAdviser()
        
        # Probar conexión
        test_result = adviser.test_connection()
        print(f"Prueba de conexión: {test_result}")
        
        # Probar obtención de consejos
        advice = adviser.get_product_advice('plastic', 'water_bottle', 0.92)
        print(f"Consejos obtenidos: {advice}")
        
    except Exception as e:
        print(f"Error en prueba: {e}") 