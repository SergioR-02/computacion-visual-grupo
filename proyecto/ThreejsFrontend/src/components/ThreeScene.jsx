import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

const ThreeScene = () => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const beeRef = useRef(null)
  const mixerRef = useRef(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return
    isInitialized.current = true

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      10,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 13
    cameraRef.current = camera

    // Setup scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3)
    scene.add(ambientLight)

    const topLight = new THREE.DirectionalLight(0xffffff, 1)
    topLight.position.set(500, 500, 500)
    scene.add(topLight)

    // Model positions for different sections
    const arrPositionModel = [
      {
        id: 'banner',
        position: { x: 0, y: -1, z: 0 },
        rotation: { x: 0, y: 1.5, z: 0 }
      },
      {
        id: 'intro',
        position: { x: 1, y: -1, z: -5 },
        rotation: { x: 0.5, y: -0.5, z: 0 }
      },
      {
        id: 'description',
        position: { x: -1, y: -1, z: -5 },
        rotation: { x: 0, y: 0.5, z: 0 }
      },
      {
        id: 'contact',
        position: { x: 0.8, y: -1, z: 0 },
        rotation: { x: 0.3, y: -0.5, z: 0 }
      }
    ]

    // Model movement based on scroll
    const modelMove = () => {
      if (!beeRef.current) return
        const sections = document.querySelectorAll('.section')
      let currentSection = 'banner' // default

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= window.innerHeight / 3) {
          currentSection = section.id
        }
      })

      const position_active = arrPositionModel.findIndex(
        (val) => val.id === currentSection
      )

      if (position_active >= 0) {
        const new_coordinates = arrPositionModel[position_active]
        gsap.to(beeRef.current.position, {
          x: new_coordinates.position.x,
          y: new_coordinates.position.y,
          z: new_coordinates.position.z,
          duration: 1,
          ease: 'power1.out'
        })
        gsap.to(beeRef.current.rotation, {
          x: new_coordinates.rotation.x,
          y: new_coordinates.rotation.y,
          z: new_coordinates.rotation.z,
          duration: 1,
          ease: 'power1.out'
        })
      }
    }    // Load 3D model
    const loader = new GLTFLoader()
    loader.load(
      '/bonsai_tree.glb',
      function (gltf) {
        // Clear any existing objects
        scene.children.forEach(child => {
          if (child.type === 'Group' || child.type === 'Mesh') {
            scene.remove(child)
          }
        })
          const bee = gltf.scene
          // Set initial position and scale
        bee.position.set(0, -1, 0)
        bee.rotation.set(0, 1.5, 0)
        bee.scale.set(0.1, 0.1, 0.1) // Reduce model size even more
        
        beeRef.current = bee
        scene.add(bee)

        // Setup animation mixer
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(bee)
          mixerRef.current = mixer
          mixer.clipAction(gltf.animations[0]).play()
        }
        
        // Initial model movement after a short delay
        setTimeout(() => {
          modelMove()
        }, 100)
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded')
      },
      function (error) {
        console.error('Error loading 3D model:', error)
      }
    )

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
      if (mixerRef.current) {
        mixerRef.current.update(0.02)
      }
    }
    animate()

    // Event listeners
    const handleScroll = () => {
      modelMove()
    }

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      isInitialized.current = false
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      
      if (beeRef.current) {
        scene.remove(beeRef.current)
        beeRef.current = null
      }
      
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
        mixerRef.current = null
      }
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      
      renderer.dispose()
      scene.clear()
    }
  }, [])

  return <div id="container3D" ref={containerRef} />
}

export default ThreeScene
