// Declaraciones de tipos para React Three Fiber
// Extiende los elementos JSX para incluir los componentes de Three.js

import { Object3DNode } from '@react-three/fiber';
import * as THREE from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    // Geometrías
    boxGeometry: Object3DNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>;
    sphereGeometry: Object3DNode<
      THREE.SphereGeometry,
      typeof THREE.SphereGeometry
    >;
    coneGeometry: Object3DNode<THREE.ConeGeometry, typeof THREE.ConeGeometry>;
    bufferGeometry: Object3DNode<
      THREE.BufferGeometry,
      typeof THREE.BufferGeometry
    >;

    // Materiales
    meshPhongMaterial: Object3DNode<
      THREE.MeshPhongMaterial,
      typeof THREE.MeshPhongMaterial
    >;
    pointsMaterial: Object3DNode<
      THREE.PointsMaterial,
      typeof THREE.PointsMaterial
    >;

    // Objetos 3D
    mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
    points: Object3DNode<THREE.Points, typeof THREE.Points>;
    group: Object3DNode<THREE.Group, typeof THREE.Group>;

    // Luces
    ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
    directionalLight: Object3DNode<
      THREE.DirectionalLight,
      typeof THREE.DirectionalLight
    >;
    pointLight: Object3DNode<THREE.PointLight, typeof THREE.PointLight>;
  }
}
