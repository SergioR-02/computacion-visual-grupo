import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function ColoredObjects({ color, filter, textureURL }) {
  const texture = useTexture(textureURL !== "none" ? textureURL : "../../public/image.png");


  const shaderRef = useRef();

  useFrame(() => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uFilterType.value = filter;
    }
  });

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uFilterType: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform int uFilterType;
      varying vec2 vUv;

      vec3 applyFilter(vec3 color) {
        if (uFilterType == 1) {
          return vec3(color.r * 0.566 + color.g * 0.433, color.r * 0.558 + color.g * 0.442, color.b);
        } else if (uFilterType == 2) {
          float gray = dot(color, vec3(0.299, 0.587, 0.114));
          return vec3(gray);
        }
        return color;
      }

      void main() {
        vec3 baseColor = vec3(vUv, 1.0);
        vec3 filtered = applyFilter(baseColor);
        gl_FragColor = vec4(filtered, 1.0);
      }
    `
  });

  return (
    <>
      {/* Cubo con color y sombra */}
      <mesh position={[-2, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Esfera metálica */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color={color} metalness={1} roughness={0.2} />
      </mesh>

      {/* Esfera con textura */}
      <mesh position={[2, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        {texture ? (
          <meshStandardMaterial map={texture} />
        ) : (
          <meshStandardMaterial color={color} />
        )}
      </mesh>


      {/* Suelo receptor de sombras */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>

      {/* Plano con shader (no afecta a sombras) */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <primitive object={shaderMaterial} ref={shaderRef} attach="material" />
      </mesh>
    </>
  );
}

export default function SceneCanvas({ color, filter, textureURL }) {
  return (
    <Canvas
      camera={{ position: [0, 3, 5] }}
      shadows
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <ColoredObjects color={color} filter={filter} textureURL={textureURL} />
      <OrbitControls />
    </Canvas>
  );
}
