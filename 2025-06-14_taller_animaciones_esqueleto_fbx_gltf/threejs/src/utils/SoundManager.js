// Sistema de gestión de sonidos para animaciones
class SoundManager {
  constructor() {
    this.sounds = new Map()
    this.context = null
    this.initialized = false
    this.globalVolume = 0.8 // Volumen global
  }

  // Establecer volumen global
  setGlobalVolume(volume) {
    this.globalVolume = Math.max(0, Math.min(1, volume))
  }

  // Inicializar el contexto de audio
  async init() {
    if (this.initialized) return

    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)()
      this.initialized = true
      console.log('🔊 Audio context initialized')
    } catch (error) {
      console.warn('Audio context not supported:', error)
    }
  }

  // Cargar un sonido desde una URL
  async loadSound(name, url) {
    if (!this.context) await this.init()

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer)
      
      this.sounds.set(name, audioBuffer)
      console.log(`🎵 Sound loaded: ${name}`)
      return true
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error)
      return false
    }
  }

  // Crear sonidos sintéticos usando Web Audio API
  createSynthSound(name, type, frequency, duration) {
    if (!this.context) return

    const sampleRate = this.context.sampleRate
    const length = sampleRate * duration
    const audioBuffer = this.context.createBuffer(1, length, sampleRate)
    const data = audioBuffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      let sample = 0

      switch (type) {
        case 'footstep':
          // Sonido de paso: ruido + click
          sample = (Math.random() - 0.5) * 0.3 * Math.exp(-t * 10)
          if (t < 0.01) sample += Math.sin(2 * Math.PI * 100 * t) * 0.5 * Math.exp(-t * 50)
          break
        
        case 'jump':
          // Sonido de salto: sweep up
          const sweepFreq = frequency + (frequency * 2 * t)
          sample = Math.sin(2 * Math.PI * sweepFreq * t) * 0.3 * Math.exp(-t * 3)
          break
        
        case 'dance':
          // Sonido de baile: tono musical
          sample = Math.sin(2 * Math.PI * frequency * t) * 0.2 * Math.exp(-t * 2)
          sample += Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.1 * Math.exp(-t * 2)
          break
        
        case 'applause':
          // Sonido de aplauso: ruido filtrado
          sample = (Math.random() - 0.5) * 0.4 * (1 - Math.exp(-t * 5)) * Math.exp(-t * 0.5)
          break
        
        default:
          sample = Math.sin(2 * Math.PI * frequency * t) * 0.2 * Math.exp(-t * 2)
      }

      data[i] = sample
    }

    this.sounds.set(name, audioBuffer)
    console.log(`🎼 Synthetic sound created: ${name}`)
  }

  // Reproducir un sonido
  async playSound(name, volume = 1, playbackRate = 1) {
    if (!this.context || !this.sounds.has(name)) return

    // Reanudar el contexto si está suspendido
    if (this.context.state === 'suspended') {
      await this.context.resume()
    }

    try {
      const audioBuffer = this.sounds.get(name)
      const source = this.context.createBufferSource()
      const gainNode = this.context.createGain()
        source.buffer = audioBuffer
      source.playbackRate.value = playbackRate
      gainNode.gain.value = volume * this.globalVolume // Aplicar volumen global
      
      source.connect(gainNode)
      gainNode.connect(this.context.destination)
      
      source.start()
      
      console.log(`🔊 Playing sound: ${name}`)
    } catch (error) {
      console.warn(`Failed to play sound ${name}:`, error)
    }
  }

  // Precargar todos los sonidos necesarios
  async preloadSounds() {
    await this.init()

    // Crear sonidos sintéticos para diferentes tipos de animaciones
    this.createSynthSound('footstep', 'footstep', 100, 0.15)
    this.createSynthSound('jump', 'jump', 200, 0.5)
    this.createSynthSound('land', 'footstep', 80, 0.2)
    this.createSynthSound('dance_beat', 'dance', 440, 0.3)
    this.createSynthSound('dance_clap', 'applause', 800, 0.2)
    this.createSynthSound('stairs_step', 'footstep', 120, 0.12)
    this.createSynthSound('whoosh', 'jump', 150, 0.4)

    console.log('🎵 All sounds preloaded!')
  }
}

// Crear instancia global del manager de sonidos
export const soundManager = new SoundManager()

// Mapeo de animaciones a eventos de sonido
export const animationSoundEvents = {
  // Eventos para animación de salto
  'jump': [
    { time: 0.0, sound: 'whoosh', volume: 0.6 },
    { time: 0.3, sound: 'jump', volume: 0.8 },
    { time: 0.8, sound: 'land', volume: 0.7 }
  ],
  
  // Eventos para animación de baile
  'rumba': [
    { time: 0.0, sound: 'dance_beat', volume: 0.5 },
    { time: 0.5, sound: 'dance_clap', volume: 0.3 },
    { time: 1.0, sound: 'dance_beat', volume: 0.5 },
    { time: 1.5, sound: 'dance_clap', volume: 0.3 }
  ],
  
  // Eventos para subir escaleras
  'stairs': [
    { time: 0.0, sound: 'stairs_step', volume: 0.6 },
    { time: 0.3, sound: 'stairs_step', volume: 0.6 },
    { time: 0.6, sound: 'stairs_step', volume: 0.6 },
    { time: 0.9, sound: 'stairs_step', volume: 0.6 }
  ],
  
  // Eventos genéricos para caminar
  'walk': [
    { time: 0.0, sound: 'footstep', volume: 0.5 },
    { time: 0.5, sound: 'footstep', volume: 0.5 }
  ],
  
  // Eventos para correr
  'run': [
    { time: 0.0, sound: 'footstep', volume: 0.7, playbackRate: 1.2 },
    { time: 0.25, sound: 'footstep', volume: 0.7, playbackRate: 1.2 },
    { time: 0.5, sound: 'footstep', volume: 0.7, playbackRate: 1.2 },
    { time: 0.75, sound: 'footstep', volume: 0.7, playbackRate: 1.2 }
  ]
}

export default SoundManager
