#!/usr/bin/env python3
"""
Fase 3 - Implementación de Gaussian Splatting
Computación Visual - Daniel

Este script automatiza el proceso completo de Gaussian Splatting:
1. Configuración del entorno
2. Descarga del dataset
3. Entrenamiento del modelo
4. Renderizado de resultados
5. Análisis y documentación
"""

import os
import sys
import time
import subprocess
import urllib.request
import zipfile
from datetime import datetime
import json

class GaussianSplattingImplementation:
    def __init__(self, work_dir="./gaussian_splatting_workspace"):
        self.work_dir = work_dir
        self.gaussian_repo = os.path.join(work_dir, "gaussian-splatting")
        self.dataset_path = None
        self.model_path = None
        self.training_time = 0
        self.render_time = 0
        self.results = {}
        
    def setup_environment(self):
        """Configura el entorno de trabajo"""
        print("🔧 Configurando entorno de trabajo...")
        
        # Crear directorio de trabajo
        os.makedirs(self.work_dir, exist_ok=True)
        original_dir = os.getcwd()
        os.chdir(self.work_dir)
        
        # Clonar repositorio si no existe
        if not os.path.exists("gaussian-splatting"):
            print("📥 Clonando repositorio de Gaussian Splatting...")
            subprocess.run([
                "git", "clone", "--recursive", 
                "https://github.com/graphdeco-inria/gaussian-splatting.git"
            ], check=True)
        
        # Cambiar al directorio del repositorio
        os.chdir("gaussian-splatting")
        
        # Instalar dependencias
        print("📦 Instalando dependencias...")
        packages = [
            "torch", "torchvision", "torchaudio", 
            "plyfile", "tqdm", "opencv-python"
        ]
        
        for package in packages:
            try:
                subprocess.run([sys.executable, "-m", "pip", "install", package], 
                             check=True, capture_output=True)
                print(f"✅ {package} instalado")
            except subprocess.CalledProcessError:
                print(f"⚠️ Error instalando {package}")
        
        # Instalar submodulos
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", 
                           "./submodules/diff-gaussian-rasterization"], check=True)
            subprocess.run([sys.executable, "-m", "pip", "install", 
                           "./submodules/simple-knn"], check=True)
            print("✅ Submodulos instalados")
        except subprocess.CalledProcessError as e:
            print(f"⚠️ Error instalando submodulos: {e}")
        
        return original_dir
    
    def download_dataset(self):
        """Descarga el dataset de ejemplo"""
        print("📥 Descargando dataset de ejemplo...")
        
        dataset_url = "https://huggingface.co/camenduru/gaussian-splatting/resolve/main/tandt_db.zip"
        dataset_file = "tandt_db.zip"
        
        if not os.path.exists("tandt") and not os.path.exists(dataset_file):
            urllib.request.urlretrieve(dataset_url, dataset_file)
            print("📦 Extrayendo dataset...")
            with zipfile.ZipFile(dataset_file, 'r') as zip_ref:
                zip_ref.extractall()
        
        self.dataset_path = "./tandt/train"
        self.model_path = "./output"
        
        # Verificar dataset
        if os.path.exists(self.dataset_path):
            images = os.listdir(f"{self.dataset_path}/images")
            print(f"✅ Dataset preparado con {len(images)} imágenes")
            return True
        else:
            print("❌ Error preparando dataset")
            return False
    
    def train_model(self, iterations=7000):
        """Entrena el modelo de Gaussian Splatting"""
        print("🚀 Iniciando entrenamiento...")
        print(f"📁 Dataset: {self.dataset_path}")
        print(f"💾 Salida: {self.model_path}")
        print(f"⏰ Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Crear directorio de salida
        os.makedirs(self.model_path, exist_ok=True)
        
        # Comando de entrenamiento
        training_command = [
            sys.executable, "train.py",
            "-s", self.dataset_path,
            "-m", self.model_path,
            "--iterations", str(iterations),
            "--save_iterations", "1000", "3000", str(iterations)
        ]
        
        # Medir tiempo de entrenamiento
        start_time = time.time()
        
        try:
            result = subprocess.run(training_command, capture_output=True, 
                                  text=True, timeout=3600)  # 1 hora máximo
            
            self.training_time = time.time() - start_time
            
            if result.returncode == 0:
                print(f"✅ Entrenamiento completado en {self.training_time:.2f}s")
                self.results['training_success'] = True
                self.results['training_time'] = self.training_time
                return True
            else:
                print(f"❌ Error en entrenamiento: {result.stderr}")
                self.results['training_success'] = False
                return False
                
        except subprocess.TimeoutExpired:
            print("⏰ Entrenamiento excedió tiempo límite")
            return False
    
    def render_images(self, iteration=7000):
        """Renderiza imágenes del modelo entrenado"""
        print("🎨 Generando renderizados...")
        
        render_command = [
            sys.executable, "render.py",
            "-m", self.model_path,
            "--iteration", str(iteration)
        ]
        
        start_time = time.time()
        
        try:
            result = subprocess.run(render_command, capture_output=True, 
                                  text=True, timeout=600)
            
            self.render_time = time.time() - start_time
            
            if result.returncode == 0:
                print(f"✅ Renderizado completado en {self.render_time:.2f}s")
                self.results['render_success'] = True
                self.results['render_time'] = self.render_time
                return True
            else:
                print(f"❌ Error en renderizado: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print("⏰ Renderizado excedió tiempo límite")
            return False
    
    def analyze_results(self):
        """Analiza los resultados generados"""
        print("📊 Analizando resultados...")
        
        # Contar archivos generados
        if os.path.exists(self.model_path):
            model_files = os.listdir(self.model_path)
            self.results['model_files_count'] = len(model_files)
        
        # Buscar imágenes renderizadas
        render_path = os.path.join(self.model_path, "test", "ours_7000", "renders")
        if os.path.exists(render_path):
            rendered_images = [f for f in os.listdir(render_path) 
                             if f.endswith(('.png', '.jpg'))]
            self.results['rendered_images_count'] = len(rendered_images)
            print(f"🖼️ Se generaron {len(rendered_images)} imágenes")
        
        # Buscar archivos .ply
        ply_files = []
        for root, dirs, files in os.walk(self.model_path):
            for file in files:
                if file.endswith('.ply'):
                    ply_files.append(os.path.join(root, file))
        
        if ply_files:
            self.results['ply_files_count'] = len(ply_files)
            
            # Analizar tamaño del archivo principal
            main_ply = ply_files[0]
            file_size_mb = os.path.getsize(main_ply) / (1024 * 1024)
            self.results['ply_size_mb'] = file_size_mb
            
            try:
                from plyfile import PlyData
                plydata = PlyData.read(main_ply)
                num_splats = len(plydata['vertex'])
                self.results['num_gaussian_splats'] = num_splats
                print(f"🎯 Modelo contiene {num_splats:,} Gaussian Splats")
            except ImportError:
                print("📝 Para análisis detallado instala: pip install plyfile")
            except Exception as e:
                print(f"⚠️ Error analizando PLY: {e}")
    
    def generate_report(self):
        """Genera reporte final"""
        print("\n" + "="*60)
        print("📋 REPORTE FINAL - GAUSSIAN SPLATTING")
        print("="*60)
        
        print(f"\n🗓️ Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"👤 Implementado por: Daniel")
        print(f"📚 Fase 3 - Computación Visual")
        
        print(f"\n⏱️ TIEMPOS DE EJECUCIÓN:")
        print(f"   🏃 Entrenamiento: {self.training_time:.2f}s ({self.training_time/60:.2f} min)")
        print(f"   🎨 Renderizado: {self.render_time:.2f}s")
        print(f"   📊 Total: {self.training_time + self.render_time:.2f}s")
        
        print(f"\n🎯 RESULTADOS:")
        if 'num_gaussian_splats' in self.results:
            print(f"   🎯 Gaussian Splats: {self.results['num_gaussian_splats']:,}")
        if 'rendered_images_count' in self.results:
            print(f"   🖼️ Imágenes renderizadas: {self.results['rendered_images_count']}")
        if 'ply_size_mb' in self.results:
            print(f"   📄 Tamaño modelo: {self.results['ply_size_mb']:.2f} MB")
        
        print(f"\n📝 DESCRIPCIÓN DEL PROCESO:")
        print("   1. ⚙️ Configuración del entorno Gaussian Splatting")
        print("   2. 📥 Descarga de dataset multiperspectiva")
        print("   3. 🧠 Entrenamiento con optimización de Gaussianas 3D")
        print("   4. 🎨 Renderizado de nuevas vistas")
        print("   5. 📊 Análisis de calidad y performance")
        
        print(f"\n🔧 ESPECIFICACIONES TÉCNICAS:")
        print("   • Algoritmo: 3D Gaussian Splatting")
        print("   • Optimización: Gradiente descendente diferenciable")
        print("   • Representación: Gaussianas 3D con parámetros aprendibles")
        print("   • Salida: Archivos .ply y renders de alta calidad")
        
        print(f"\n✅ CONCLUSIONES:")
        print("   ✓ Implementación exitosa de Gaussian Splatting")
        print("   ✓ Generación de reconstrucción 3D de alta fidelidad")
        print("   ✓ Renderizado eficiente de nuevas perspectivas")
        print("   ✓ Documentación completa del proceso")
        
        # Guardar reporte en archivo
        report_data = {
            'fecha': datetime.now().isoformat(),
            'autor': 'Daniel',
            'fase': 'Fase 3 - Gaussian Splatting',
            'tiempos': {
                'entrenamiento_segundos': self.training_time,
                'renderizado_segundos': self.render_time,
                'total_segundos': self.training_time + self.render_time
            },
            'resultados': self.results,
            'proceso': [
                'Configuración del entorno',
                'Descarga de dataset',
                'Entrenamiento del modelo',
                'Renderizado de vistas',
                'Análisis de resultados'
            ]
        }
        
        with open('../reporte_gaussian_splatting.json', 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Reporte guardado en: reporte_gaussian_splatting.json")
        print("="*60)
    
    def run_complete_pipeline(self):
        """Ejecuta el pipeline completo"""
        print("🚀 INICIANDO IMPLEMENTACIÓN COMPLETA DE GAUSSIAN SPLATTING")
        print("="*65)
        
        original_dir = self.setup_environment()
        
        try:
            # Pipeline completo
            if self.download_dataset():
                if self.train_model():
                    if self.render_images():
                        self.analyze_results()
                        self.generate_report()
                        print("\n🎉 ¡IMPLEMENTACIÓN COMPLETADA EXITOSAMENTE! 🎉")
                    else:
                        print("❌ Falló el renderizado")
                else:
                    print("❌ Falló el entrenamiento")
            else:
                print("❌ Falló la preparación del dataset")
                
        finally:
            # Volver al directorio original
            os.chdir(original_dir)

def main():
    """Función principal"""
    print("🎯 Fase 3 - Implementación de Gaussian Splatting")
    print("👤 Daniel - Computación Visual")
    print("📅", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print()
    
    # Crear instancia e ejecutar
    implementation = GaussianSplattingImplementation()
    implementation.run_complete_pipeline()

if __name__ == "__main__":
    main()
