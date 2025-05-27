/**
 * @fileoverview Detector de visión por computadora usando TensorFlow.js
 * @module VisionDetector
 */

import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export class VisionDetector {
  constructor(renderer, renderTarget) {
    this.renderer = renderer;
    this.renderTarget = renderTarget;
    this.model = null;
    this.isModelLoaded = false;
    this.detectionResults = [];

    // Cargar modelo
    this.loadModel();
  }

  async loadModel() {
    try {
      this.model = await cocoSsd.load();
      this.isModelLoaded = true;
      console.log('Modelo de visión cargado correctamente');
    } catch (error) {
      console.error('Error al cargar el modelo de visión:', error);
    }
  }

  async detectObjects(renderTarget) {
    if (!this.isModelLoaded) return;

    try {
      // Obtener imagen del render target
      const imageData = this.getImageData(renderTarget);

      // Convertir a tensor
      const tensor = tf.browser.fromPixels(imageData)
        .cast('int32');  // Convertir a int32

      // Realizar detección
      const predictions = await this.model.detect(tensor);

      // Limpiar tensor
      tensor.dispose();

      // Procesar resultados
      this.detectionResults = predictions.filter(pred =>
        pred.class === 'person' && pred.score > 0.5
      );

      return this.detectionResults;
    } catch (error) {
      console.error('Error en la detección:', error);
      return [];
    }
  }

  getImageData(renderTarget) {
    // Crear canvas temporal
    const canvas = document.createElement('canvas');
    canvas.width = renderTarget.width;
    canvas.height = renderTarget.height;
    const context = canvas.getContext('2d');

    // Obtener datos del render target
    const pixels = new Uint8Array(renderTarget.width * renderTarget.height * 4);
    this.renderer.readRenderTargetPixels(
      renderTarget,
      0,
      0,
      renderTarget.width,
      renderTarget.height,
      pixels
    );

    // Crear ImageData
    const imageData = new ImageData(
      new Uint8ClampedArray(pixels),
      renderTarget.width,
      renderTarget.height
    );

    // Dibujar en canvas
    context.putImageData(imageData, 0, 0);

    return imageData;
  }

  isPlayerDetected() {
    return this.detectionResults.length > 0;
  }

  getDetectionConfidence() {
    if (this.detectionResults.length === 0) return 0;
    return this.detectionResults[0].score;
  }

  getDetectionBoundingBox() {
    if (this.detectionResults.length === 0) return null;
    return this.detectionResults[0].bbox;
  }
} 