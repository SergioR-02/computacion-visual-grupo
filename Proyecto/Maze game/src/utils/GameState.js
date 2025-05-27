/**
 * @fileoverview Gestor del estado del juego
 * @module GameState
 */

export class GameState {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = 0;
    this.collectedKeys = 0;
    this.totalKeys = 3;
    this.hasWon = false;
    this.hasLost = false;
  }

  startGame() {
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.collectedKeys = 0;
    this.hasWon = false;
    this.hasLost = false;
  }

  pauseGame() {
    if (this.isRunning) {
      this.isPaused = true;
      this.isRunning = false;
    }
  }

  resumeGame() {
    if (this.isPaused) {
      this.isPaused = false;
      this.isRunning = true;
    }
  }

  endGame(isVictory) {
    this.isRunning = false;
    this.isPaused = false;
    if (isVictory) {
      this.hasWon = true;
    } else {
      this.hasLost = true;
    }
  }

  collectKey() {
    if (this.isRunning) {
      this.collectedKeys++;
    }
  }

  hasAllKeys() {
    return this.collectedKeys >= this.totalKeys;
  }

  getCollectedKeys() {
    return this.collectedKeys;
  }

  getTotalKeys() {
    return this.totalKeys;
  }

  /**
   * Establece el número total de llaves en el laberinto
   * @param {number} total - Número total de llaves
   */
  setTotalKeys(total) {
    this.totalKeys = total;
  }

  getElapsedTime() {
    if (!this.isRunning && !this.isPaused) return 0;
    return (Date.now() - this.startTime) / 1000;
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = 0;
    this.collectedKeys = 0;
    this.hasWon = false;
    this.hasLost = false;
  }

  isGameOver() {
    return this.hasWon || this.hasLost;
  }

  isVictory() {
    return this.hasWon;
  }

  isDefeat() {
    return this.hasLost;
  }
} 