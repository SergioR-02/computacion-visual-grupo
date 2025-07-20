import React, { useRef, useEffect, useState } from 'react';
import { Cuboid as Cube, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

const ThreeDViewer = ({ category }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef();
  const rendererRef = useRef();
  const cameraRef = useRef();
  const meshRef = useRef();
  const frameRef = useRef();
  const [isLoading, setIsLoading] = useState(false);

  const categoryModels = {
    trash_gray: {
      objPath: '/models/trash_can/Trash_gray/Trash_Bin_on_Wheels_0705233925_texture_obj/Trash_Bin_on_Wheels_0705233925_texture.obj',
      mtlPath: '/models/trash_can/Trash_gray/Trash_Bin_on_Wheels_0705233925_texture_obj/Trash_Bin_on_Wheels_0705233925_texture.mtl'
    },
    trash_white: {
      objPath: '/models/trash_can/Trash_white/Trash_Bin_on_Wheels_0706000745_texture_obj/Trash_Bin_on_Wheels_0706000745_texture.obj',
      mtlPath: '/models/trash_can/Trash_white/Trash_Bin_on_Wheels_0706000745_texture_obj/Trash_Bin_on_Wheels_0706000745_texture.mtl'
    },
    trash_green: {
      objPath: '/models/trash_can/Trash_green/Trash_0705231552_texture_obj/Trash_0705231552_texture.obj',
      mtlPath: '/models/trash_can/Trash_green/Trash_0705231552_texture_obj/Trash_0705231552_texture.mtl'
    },
    // Mantener los modelos anteriores para compatibilidad
    plastico: () => new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8),
    vidrio: () => new THREE.CylinderGeometry(0.25, 0.4, 1.5, 6),
    papel: () => new THREE.BoxGeometry(1, 0.1, 1.4),
    metal: () => new THREE.CylinderGeometry(0.35, 0.35, 0.8, 16)
  };

  const categoryColors = {
    trash_gray: 0x6b7280,
    trash_white: 0xf8fafc,
    trash_green: 0x10b981,
    // Mantener los colores anteriores para compatibilidad
    plastico: 0x10b981,
    vidrio: 0x3b82f6,
    papel: 0xf59e0b,
    metal: 0x6b7280
  };

  const initScene = () => {
    if (!mountRef.current) return;

    // Eliminar canvas existente si ya hay uno
    if (rendererRef.current && rendererRef.current.domElement) {
      mountRef.current.removeChild(rendererRef.current.domElement);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(2, 2, 3); // Posición más cercana para mejor visualización
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Luz ambiente más intensa
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Luz direccional más intensa
    directionalLight.position.set(3, 4, 3); // Posición optimizada
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Agregar una segunda luz para mejor iluminación
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-3, 2, -3);
    scene.add(fillLight);

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

    // Verificar si es una caneca de basura (modelo OBJ)
    if (categoryModels[category] && typeof categoryModels[category] === 'object' && categoryModels[category].objPath) {
      const { objPath, mtlPath } = categoryModels[category];
      
      const mtlLoader = new MTLLoader();
      mtlLoader.load(
        mtlPath,
        (materials) => {
          materials.preload();
          
          const objLoader = new OBJLoader();
          objLoader.setMaterials(materials);
          objLoader.load(
            objPath,
            (object) => {
              // Calcular el bounding box para centrar el modelo
              const box = new THREE.Box3().setFromObject(object);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              
              // Centrar el objeto horizontalmente
              object.position.x = -center.x;
              object.position.z = -center.z;
              
              // Ajustar escala basada en el tamaño del modelo
              const maxDimension = Math.max(size.x, size.y, size.z);
              const targetSize = 2.5; // Tamaño objetivo más pequeño para mejor visualización
              const scale = targetSize / maxDimension;
              object.scale.setScalar(scale);
              
              // Posicionar el modelo en el suelo (ajustado para la nueva escala)
              object.position.y = -center.y * scale - 0.5;
              
              // Habilitar sombras para todos los meshes del objeto
              object.traverse((child) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });
              
              sceneRef.current.add(object);
              meshRef.current = object;
              setIsLoading(false);
              
              console.log(`Modelo cargado - Tamaño original: ${size.x.toFixed(2)}x${size.y.toFixed(2)}x${size.z.toFixed(2)}, Escala aplicada: ${scale.toFixed(3)}`);
            },
            (progress) => {
              console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
              console.error('Error loading OBJ model:', error);
              // Fallback a geometría básica en caso de error
              createBasicGeometry(category);
            }
          );
        },
        (progress) => {
          console.log('Loading MTL progress:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          console.error('Error loading MTL material:', error);
          // Fallback a geometría básica en caso de error
          createBasicGeometry(category);
        }
      );
    } else {
      // Usar geometría básica para categorías que no son canecas
      createBasicGeometry(category);
    }
  };

  const createBasicGeometry = (category) => {
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
        // Solo rotar sobre el eje Y para mantener el modelo derecho
        meshRef.current.rotation.y += 0.01;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    frameRef.current = requestAnimationFrame(animate);
  };

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(2, 2, 3); // Posición consistente con la inicial
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(cameraRef.current.position.z - 0.3, 0.8); // Permitir zoom más cercano
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(cameraRef.current.position.z + 0.3, 8); // Reducir zoom máximo
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
      // Forzar una redimensión después de cargar el modelo
      setTimeout(() => {
        if (mountRef.current && cameraRef.current && rendererRef.current) {
          const width = mountRef.current.clientWidth;
          const height = mountRef.current.clientHeight;
          
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
          
          // Reiniciar la posición de la cámara para el nuevo modelo
          cameraRef.current.position.set(2, 2, 3);
          cameraRef.current.lookAt(0, 0, 0);
        }
      }, 100);
    }
  }, [category]);
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-3 lg:p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1 lg:p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
            <Cube className="h-3 lg:h-4 w-3 lg:w-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs lg:text-sm font-semibold text-white">Modelo 3D</h3>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={resetView}
            className="p-1 lg:p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
            title="Resetear vista"
          >
            <RotateCcw className="h-3 w-3 text-slate-300" />
          </button>
          <button
            onClick={zoomIn}
            className="p-1 lg:p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
            title="Acercar"
          >
            <ZoomIn className="h-3 w-3 text-slate-300" />
          </button>
          <button
            onClick={zoomOut}
            className="p-1 lg:p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
            title="Alejar"
          >
            <ZoomOut className="h-3 w-3 text-slate-300" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[200px]">
        <div ref={mountRef} className="w-full h-full rounded-xl overflow-hidden" />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 rounded-xl">
            <div className="text-center">
              <div className="animate-spin h-4 lg:h-6 w-4 lg:w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-slate-300 text-xs">Cargando...</p>
            </div>
          </div>
        )}

        {!category && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <Cube className="h-6 lg:h-8 w-6 lg:w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Sin modelo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeDViewer;
