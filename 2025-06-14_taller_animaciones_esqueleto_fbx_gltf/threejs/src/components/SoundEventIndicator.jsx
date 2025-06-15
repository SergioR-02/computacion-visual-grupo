import React, { useState, useEffect } from 'react'
import './SoundEventIndicator.css'

function SoundEventIndicator({ soundEvent, onComplete }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (soundEvent) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete && onComplete()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [soundEvent, onComplete])

  if (!visible || !soundEvent) return null

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'footstep':
      case 'stairs_step':
        return '👣'
      case 'jump':
        return '🦘'
      case 'land':
        return '💥'
      case 'dance_beat':
        return '🎵'
      case 'dance_clap':
        return '👏'
      case 'whoosh':
        return '💨'
      default:
        return '🔊'
    }
  }

  return (
    <div className={`sound-event-indicator ${visible ? 'visible' : ''}`}>
      <div className="sound-icon">
        {getEventIcon(soundEvent.type)}
      </div>      <div className="sound-name">
        {soundEvent.type.replace('_', ' ').toUpperCase()}
      </div>
    </div>
  )
}

export default SoundEventIndicator
