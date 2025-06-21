"use client"

import { useState, useRef, useEffect, Component } from "react"
import type { ReactNode } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Float } from "@react-three/drei"
import "./WasteClassifier.css"

// Error Boundary para el Canvas 3D
class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log("Canvas Error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="canvas-error">
            <div className="error-content">
              <div className="error-icon">⚠️</div>
              <h3>Error de Visualización 3D</h3>
              <p>No se pudo cargar la vista 3D. La funcionalidad principal sigue disponible.</p>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// Iconos SVG como componentes
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5,3 19,12 5,21" />
  </svg>
)

const SquareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </svg>
)

const ZapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
  </svg>
)

const RecycleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 19H6.5a2.5 2.5 0 0 1 0-5H14" />
    <path d="M14 5h.5a2.5 2.5 0 0 1 0 5H7" />
    <path d="M9 12v6" />
    <path d="M15 6v6" />
  </svg>
)

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
)

// Tipos de basura
const wasteTypes = [
  {
    id: "plastic",
    name: "Plástico PET",
    description:
      "Botella de plástico identificada. Este material es 100% reciclable y debe depositarse en el contenedor amarillo. El PET puede transformarse en fibras textiles, nuevas botellas o envases.",
    color: "#06B6D4",
    category: "Reciclable",
    icon: RecycleIcon,
    confidence: 94,
    tips: "Retira la tapa y etiqueta antes de reciclar",
    impact: "Ahorra 2kg de CO₂ al reciclar",
  },
  {
    id: "organic",
    name: "Residuo Orgánico",
    description:
      "Material orgánico biodegradable detectado. Perfecto para compostaje doméstico o contenedor marrón. Se convertirá en abono natural en 3-6 meses.",
    color: "#10B981",
    category: "Compostable",
    icon: LeafIcon,
    confidence: 89,
    tips: "Evita mezclar con aceites o carnes",
    impact: "Reduce 1.5kg de residuos al mes",
  },
  {
    id: "paper",
    name: "Papel Reciclable",
    description:
      "Documento o cartón identificado. Debe ir en el contenedor azul. El papel puede reciclarse hasta 7 veces manteniendo su calidad estructural.",
    color: "#8B5CF6",
    category: "Reciclable",
    icon: RecycleIcon,
    confidence: 92,
    tips: "Retira grapas y elementos plásticos",
    impact: "Salva 17 árboles por tonelada",
  },
  {
    id: "glass",
    name: "Vidrio",
    description:
      "Envase de vidrio detectado. Material infinitamente reciclable sin pérdida de calidad. Depositar en contenedor verde limpio y sin tapas.",
    color: "#F59E0B",
    category: "Reciclable",
    icon: RecycleIcon,
    confidence: 96,
    tips: "Separa por colores si es posible",
    impact: "Ahorra 30% de energía al reciclar",
  },
]

// Componente 3D
function Enhanced3DWaste({ wasteType }: { wasteType: (typeof wasteTypes)[0] }) {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group>
        <mesh position={[0, 0, 0]}>
          {wasteType.id === "plastic" && <cylinderGeometry args={[0.8, 0.6, 2.5, 8]} />}
          {wasteType.id === "organic" && <sphereGeometry args={[1.2, 8, 6]} />}
          {wasteType.id === "paper" && <boxGeometry args={[1.8, 0.1, 2.4]} />}
          {wasteType.id === "glass" && <cylinderGeometry args={[0.7, 0.9, 2.2, 6]} />}
          <meshStandardMaterial color={wasteType.color} metalness={0.3} roughness={0.4} />
        </mesh>

        {[...Array(3)].map((_, i) => (
          <mesh key={i} position={[Math.sin(i * 2) * 2, Math.cos(i * 2) * 1, Math.sin(i) * 1.5]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color={wasteType.color} emissive={wasteType.color} emissiveIntensity={0.1} />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

export default function WasteClassifier() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [captureMode, setCaptureMode] = useState(false)
  const [currentWaste, setCurrentWaste] = useState(wasteTypes[0])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        const randomWaste = wasteTypes[Math.floor(Math.random() * wasteTypes.length)]
        setCurrentWaste(randomWaste)
      }, 6000)
      return () => clearInterval(interval)
    }
  }, [isStreaming])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        setIsAnalyzing(true)
        setTimeout(() => {
          setIsAnalyzing(false)
          setCaptureMode(true)
        }, 2500)
      }
    }
  }

  const backToLive = () => {
    setCaptureMode(false)
  }

  const IconComponent = currentWaste.icon

  return (
    <div className="waste-classifier">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-icon">
              <ZapIcon />
            </div>
            <h1 className="header-title">AI Waste Classifier</h1>
          </div>
          <p className="header-subtitle">Clasificación inteligente de residuos con IA avanzada</p>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="main-container">
        <div className="main-grid">
          {/* Sección 3D - Izquierda */}
          <div className="card">
            <div className="card-content">
              <div className="section-3d">
                <div className="canvas-container">
                  <CanvasErrorBoundary>
                    <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
                      <ambientLight intensity={0.6} />
                      <pointLight position={[10, 10, 10]} intensity={1} />
                      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8B5CF6" />
                      <Enhanced3DWaste wasteType={currentWaste} />
                      <OrbitControls enableZoom={true} enablePan={false} maxDistance={10} minDistance={3} />
                    </Canvas>
                  </CanvasErrorBoundary>
                </div>

                <div className="overlay-3d">
                  <div className="overlay-content">
                    <div className="overlay-header">
                      <IconComponent />
                      <span className="overlay-title">{currentWaste.name}</span>
                    </div>
                    <div className="overlay-status">
                      <div className="status-dot"></div>
                      <span className="status-text">Detectado - {currentWaste.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Cámara - Centro */}
          <div className="card">
            <div className="card-content">
              <div className="camera-section">
                {!isStreaming && !captureMode && (
                  <div className="camera-placeholder">
                    <div className="placeholder-content">
                      <div className="placeholder-icon">
                        <CameraIcon />
                      </div>
                      <h3 className="placeholder-title">Iniciar Análisis</h3>
                      <p className="placeholder-description">
                        Activa tu cámara para comenzar la clasificación automática de residuos
                      </p>
                      <button onClick={startCamera} className="btn btn-primary btn-lg">
                        <PlayIcon />
                        Activar Cámara
                      </button>
                    </div>
                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`video-element ${captureMode ? "video-hidden" : "video-visible"}`}
                />

                <canvas
                  ref={canvasRef}
                  className={`canvas-element ${captureMode ? "video-visible" : "video-hidden"}`}
                />

                {isAnalyzing && (
                  <div className="analyzing-overlay">
                    <div className="analyzing-content">
                      <div className="analyzing-spinner"></div>
                      <h3 className="analyzing-title">Analizando...</h3>
                      <p className="analyzing-description">Procesando imagen con IA</p>
                    </div>
                  </div>
                )}

                {isStreaming && (
                  <div className="camera-controls">
                    <button
                      onClick={captureMode ? backToLive : captureImage}
                      className={`btn btn-lg ${captureMode ? "btn-secondary" : "btn-primary"}`}
                    >
                      <CameraIcon />
                      {captureMode ? "Volver a Live" : "Capturar"}
                    </button>
                    <button onClick={stopCamera} className="btn btn-danger btn-lg">
                      <SquareIcon />
                      Detener
                    </button>
                  </div>
                )}

                {isStreaming && (
                  <div className="live-indicator">
                    <div className="live-badge">
                      <div className="live-dot"></div>
                      <span className="live-text">EN VIVO</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección Información - Derecha */}
          <div className="info-section">
            {/* Información principal */}
            <div className="info-card">
              <div className="info-header">
                <div className="badge badge-primary">{currentWaste.category}</div>
                <div className="confidence-display">
                  <div className="confidence-value">{currentWaste.confidence}%</div>
                  <div className="confidence-label">Confianza</div>
                </div>
              </div>

              <h3 className="info-title">{currentWaste.name}</h3>
              <p className="info-description">{currentWaste.description}</p>

              <div className="info-tips">
                <div className="tip-box">
                  <div className="tip-label">💡 Consejo</div>
                  <div className="tip-content">{currentWaste.tips}</div>
                </div>

                <div className="impact-box">
                  <div className="impact-label">🌱 Impacto</div>
                  <div className="impact-content">{currentWaste.impact}</div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </main>
    </div>
  )
}
