import React, { useRef, useEffect, useState } from 'react';
import { Cuboid as Cube, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import * as THREE from 'three';

const ThreeDViewer = ({ category }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef();
  const rendererRef = useRef();
  const cameraRef = useRef();
  const meshRef = useRef();
  const frameRef = useRef();
  const [isLoading, setIsLoading] = useState(false);

  const categoryModels = {
    plastico: () => new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8),
    vidrio: () => new THREE.CylinderGeometry(0.25, 0.4, 1.5, 6),
    papel: () => new THREE.BoxGeometry(1, 0.1, 1.4),
    metal: () => new THREE.CylinderGeometry(0.35, 0.35, 0.8, 16)
  };

  const categoryColors = {
    plastico: 0x10b981,
    vidrio: 0x3b82f6,
    papel: 0xf59e0b,
    metal: 0x6b7280
  };

  const initScene = () => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const groundGeometry = new THREE.PlaneGeometry(5, 5);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.1 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);
  };

  const createModel = (category) => {
    if (!sceneRef.current) return;

    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
    }

    setIsLoading(true);

    setTimeout(() => {
      const geometry = categoryModels[category]?.() || new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({
        color: categoryColors[category] || 0x10b981,
        shininess: 100
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      sceneRef.current.add(mesh);
      meshRef.current = mesh;
      setIsLoading(false);
    }, 500);
  };

  const animate = () => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
        meshRef.current.rotation.x += 0.005;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    frameRef.current = requestAnimationFrame(animate);
  };

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 3);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(cameraRef.current.position.z - 0.5, 1);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(cameraRef.current.position.z + 0.5, 10);
    }
  };

  useEffect(() => {
    initScene();
    animate();

    const handleResize = () => {
      if (mountRef.current && cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (category) {
      createModel(category);
    }
  }, [category]);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 flex flex-col h-96">
      <div className="flex items-center justify-between mb-4 ">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
            <Cube className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Modelo 3D</h3>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={resetView}
            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
            title="Resetear vista"
          >
            <RotateCcw className="h-3 w-3 text-slate-300" />
          </button>
          <button
            onClick={zoomIn}
            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
            title="Acercar"
          >
            <ZoomIn className="h-3 w-3 text-slate-300" />
          </button>
          <button
            onClick={zoomOut}
            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
            title="Alejar"
          >
            <ZoomOut className="h-3 w-3 text-slate-300" />
          </button>
        </div>
      </div>

      <div className="relative flex-1">
        <div ref={mountRef} className="w-full h-full rounded-xl overflow-hidden" />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 rounded-xl">
            <div className="text-center">
              <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-slate-300 text-xs">Cargando...</p>
            </div>
          </div>
        )}

        {!category && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <Cube className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Sin modelo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeDViewer;
