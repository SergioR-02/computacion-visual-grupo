/**
 * 🧪 IA Visual Colaborativa - Script JavaScript
 * =============================================
 * 
 * Script principal para cargar y visualizar detecciones YOLO
 * 
 * Funcionalidades:
 * - Carga automática de imágenes disponibles
 * - Visualización de resultados JSON
 * - Etiquetas flotantes sobre detecciones
 * - Tabla de detalles
 * - Estadísticas en tiempo real
 */

class DetectionViewer {    constructor() {
        this.currentData = null;
        this.showLabels = true;
        this.baseImagePath = '../results/images/';
        this.baseJsonPath = '../results/json/';
        
        this.initializeElements();
        this.bindEvents();
        this.loadAvailableImages();
    }

    initializeElements() {
        // UI Elements
        this.imageSelect = document.getElementById('imageSelect');
        this.loadBtn = document.getElementById('loadBtn');
        this.showLabelsCheckbox = document.getElementById('showLabels');
        this.detectionImage = document.getElementById('detectionImage');
        this.imagePlaceholder = document.getElementById('imagePlaceholder');
        this.imageWrapper = document.getElementById('imageWrapper');
        this.labelOverlay = document.getElementById('labelOverlay');
        this.detectionsTableBody = document.getElementById('detectionsTableBody');
        this.jsonViewer = document.getElementById('jsonViewer');
        this.toggleJsonBtn = document.getElementById('toggleJson');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Stats elements
        this.totalDetections = document.getElementById('totalDetections');
        this.highConfidence = document.getElementById('highConfidence');
        this.uniqueClasses = document.getElementById('uniqueClasses');
    }

    bindEvents() {
        this.loadBtn.addEventListener('click', () => this.loadDetection());
        this.showLabelsCheckbox.addEventListener('change', (e) => {
            this.showLabels = e.target.checked;
            this.updateLabelsVisibility();
        });
        this.toggleJsonBtn.addEventListener('click', () => this.toggleJsonViewer());
        this.imageSelect.addEventListener('change', () => {
            this.loadBtn.disabled = !this.imageSelect.value;
        });
    }    async loadAvailableImages() {
        try {
            // Lista de imágenes disponibles en el proyecto
            const images = [
                'detection_20250620_230254.jpg',
                'detection_20250620_231141.jpg',
                'detection_20250620_234304.jpg'
            ];
            
            this.populateImageSelect(images);
        } catch (error) {
            console.error('Error loading available images:', error);
            this.showError('Error al cargar las imágenes disponibles');
        }
    }

    populateImageSelect(images) {
        this.imageSelect.innerHTML = '<option value="">Selecciona una imagen...</option>';
        
        images.forEach(image => {
            const option = document.createElement('option');
            option.value = image;
            option.textContent = this.formatImageName(image);
            this.imageSelect.appendChild(option);
        });
    }

    formatImageName(filename) {
        // Extrae información del nombre del archivo para mostrar
        const parts = filename.replace('detection_', '').replace('.jpg', '').split('_');
        if (parts.length >= 2) {
            const date = parts[0];
            const time = parts[1];
            return `Detección ${date} ${time.slice(0,2)}:${time.slice(2,4)}:${time.slice(4,6)}`;
        }
        return filename;
    }

    async loadDetection() {
        const selectedImage = this.imageSelect.value;
        if (!selectedImage) return;

        this.showLoading(true);

        try {
            // Cargar datos JSON
            const jsonFilename = selectedImage.replace('.jpg', '.json');
            const jsonData = await this.loadJsonData(jsonFilename);
            
            // Cargar imagen
            await this.loadImage(selectedImage);
            
            // Procesar y mostrar datos
            this.currentData = jsonData;
            this.displayDetectionData(jsonData);
            this.updateStats(jsonData);
            this.createDetectionOverlay(jsonData);
            
            this.showSuccess('Detección cargada exitosamente');
            
        } catch (error) {
            console.error('Error loading detection:', error);
            this.showError('Error al cargar la detección: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }    async loadJsonData(filename) {
        try {
            // Intentar cargar el archivo JSON real
            const jsonPath = `${this.baseJsonPath}${filename}`;
            const response = await fetch(jsonPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const jsonData = await response.json();
            return jsonData;
            
        } catch (error) {
            console.warn(`No se pudo cargar ${filename}, usando datos de ejemplo:`, error);
            
            // Datos de ejemplo como fallback
            const mockData = {
                "timestamp": "2025-06-20T23:02:54.430942",
                "image_path": "data/foto_calle.jpeg",
                "image_size": {
                    "width": 1200,
                    "height": 535,
                    "channels": 3
                },
                "model_info": {
                    "model_name": "YOLOv8",
                    "confidence_threshold": 0.5
                },
                "detections_count": 11,
                "detections": [
                    {
                        "class": "person",
                        "confidence": 0.876,
                        "bbox": {
                            "x1": 131,
                            "y1": 152,
                            "x2": 250,
                            "y2": 447,
                            "width": 118,
                            "height": 295,
                            "center_x": 191,
                            "center_y": 300
                        }
                    },
                    {
                        "class": "person",
                        "confidence": 0.821,
                        "bbox": {
                            "x1": 544,
                            "y1": 225,
                            "x2": 647,
                            "y2": 481,
                            "width": 103,
                            "height": 256,
                            "center_x": 595,
                            "center_y": 353
                        }
                    },
                    {
                        "class": "car",
                        "confidence": 0.943,
                        "bbox": {
                            "x1": 350,
                            "y1": 200,
                            "x2": 500,
                            "y2": 350,
                            "width": 150,
                            "height": 150,
                            "center_x": 425,
                            "center_y": 275
                        }
                    },
                    {
                        "class": "bicycle",
                        "confidence": 0.672,
                        "bbox": {
                            "x1": 100,
                            "y1": 300,
                            "x2": 180,
                            "y2": 400,
                            "width": 80,
                            "height": 100,
                            "center_x": 140,
                            "center_y": 350
                        }
                    },
                    {
                        "class": "traffic light",
                        "confidence": 0.789,
                        "bbox": {
                            "x1": 800,
                            "y1": 50,
                            "x2": 830,
                            "y2": 120,
                            "width": 30,
                            "height": 70,
                            "center_x": 815,
                            "center_y": 85
                        }
                    }
                ]
            };
            
            return mockData;
        }
    }loadImage(filename) {
        return new Promise((resolve, reject) => {
            // Usar la imagen real del directorio results
            const imagePath = `${this.baseImagePath}${filename}`;
            
            this.detectionImage.onload = () => {
                this.detectionImage.style.display = 'block';
                this.imagePlaceholder.style.display = 'none';
                resolve();
            };
            
            this.detectionImage.onerror = () => {
                // Si no se puede cargar la imagen real, mostrar error
                console.error(`No se pudo cargar la imagen: ${imagePath}`);
                reject(new Error(`Error al cargar la imagen: ${filename}`));
            };
            
            this.detectionImage.src = imagePath;
        });
    }

    displayDetectionData(data) {
        // Limpiar tabla
        this.detectionsTableBody.innerHTML = '';
        
        if (!data.detections || data.detections.length === 0) {
            this.detectionsTableBody.innerHTML = '<tr class="no-data"><td colspan="5">No hay detecciones para mostrar</td></tr>';
            return;
        }
        
        // Llenar tabla con detecciones
        data.detections.forEach((detection, index) => {
            const row = document.createElement('tr');
            row.className = 'fade-in';
            row.style.animationDelay = `${index * 0.1}s`;
            
            const confidenceClass = this.getConfidenceClass(detection.confidence);
            const area = detection.bbox.width * detection.bbox.height;
            
            row.innerHTML = `
                <td><strong>${detection.class}</strong></td>
                <td><span class="confidence-badge ${confidenceClass}">${(detection.confidence * 100).toFixed(1)}%</span></td>
                <td>(${detection.bbox.center_x}, ${detection.bbox.center_y})</td>
                <td>${detection.bbox.width} × ${detection.bbox.height}</td>
                <td>${area.toLocaleString()} px²</td>
            `;
            
            this.detectionsTableBody.appendChild(row);
        });
        
        // Actualizar JSON viewer
        this.jsonViewer.textContent = JSON.stringify(data, null, 2);
    }

    updateStats(data) {
        const detections = data.detections || [];
        const total = detections.length;
        const highConf = detections.filter(d => d.confidence > 0.8).length;
        const uniqueClassesSet = new Set(detections.map(d => d.class));
        
        // Animación de contador
        this.animateCounter(this.totalDetections.querySelector('h3'), total);
        this.animateCounter(this.highConfidence.querySelector('h3'), highConf);
        this.animateCounter(this.uniqueClasses.querySelector('h3'), uniqueClassesSet.size);
    }

    animateCounter(element, targetValue) {
        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    createDetectionOverlay(data) {
        // Limpiar overlay anterior
        this.labelOverlay.innerHTML = '';
        
        if (!this.showLabels || !data.detections) return;
        
        const img = this.detectionImage;
        const imgRect = img.getBoundingClientRect();
        const containerRect = this.imageWrapper.getBoundingClientRect();
        
        // Calcular factor de escala
        const scaleX = img.offsetWidth / data.image_size.width;
        const scaleY = img.offsetHeight / data.image_size.height;
        
        data.detections.forEach((detection, index) => {
            const bbox = detection.bbox;
            
            // Crear bounding box
            const bboxElement = document.createElement('div');
            bboxElement.className = 'detection-bbox fade-in';
            bboxElement.style.animationDelay = `${index * 0.1}s`;
            bboxElement.style.left = `${bbox.x1 * scaleX}px`;
            bboxElement.style.top = `${bbox.y1 * scaleY}px`;
            bboxElement.style.width = `${bbox.width * scaleX}px`;
            bboxElement.style.height = `${bbox.height * scaleY}px`;
            
            // Crear etiqueta
            const label = document.createElement('div');
            label.className = 'detection-label fade-in';
            label.style.animationDelay = `${index * 0.1}s`;
            label.textContent = `${detection.class} (${(detection.confidence * 100).toFixed(1)}%)`;
            label.style.left = `${bbox.x1 * scaleX}px`;
            label.style.top = `${(bbox.y1 * scaleY) - 25}px`;
            
            this.labelOverlay.appendChild(bboxElement);
            this.labelOverlay.appendChild(label);
        });
    }

    updateLabelsVisibility() {
        this.labelOverlay.style.display = this.showLabels ? 'block' : 'none';
    }

    toggleJsonViewer() {
        const isVisible = this.jsonViewer.style.display !== 'none';
        this.jsonViewer.style.display = isVisible ? 'none' : 'block';
        this.toggleJsonBtn.innerHTML = isVisible 
            ? '<i class="fas fa-eye"></i> Mostrar JSON'
            : '<i class="fas fa-eye-slash"></i> Ocultar JSON';
    }

    getConfidenceClass(confidence) {
        if (confidence >= 0.8) return 'confidence-high';
        if (confidence >= 0.6) return 'confidence-medium';
        return 'confidence-low';
    }

    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            max-width: 400px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = 'var(--success-color)';
        } else {
            notification.style.background = 'var(--danger-color)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DetectionViewer();
});

// Manejar redimensionamiento de ventana para recalcular overlays
window.addEventListener('resize', () => {
    const viewer = window.detectionViewer;
    if (viewer && viewer.currentData) {
        viewer.createDetectionOverlay(viewer.currentData);
    }
});
