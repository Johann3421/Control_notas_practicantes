"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useRef } from "react"
import * as THREE from "three"

function Sphere({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
    if (glowRef.current) {
      const scale = 1.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      glowRef.current.scale.setScalar(scale)
    }
  })

  // Progress from 0-1 maps to opacity/emissive
  const progressColor = new THREE.Color().lerpColors(
    new THREE.Color("#1e263d"),
    new THREE.Color("#22c55e"),
    progress
  )

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={progressColor}
          emissive={progressColor}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
          wireframe={false}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.15}
          transparent
          opacity={0.15}
        />
      </mesh>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={1.5} color="#3b82f6" />
      <pointLight position={[-3, -1, 2]} intensity={0.8} color="#22c55e" />
    </group>
  )
}

export default function ProgressSphere3D({ progress }: { progress: number }) {
  return (
    <div className="w-40 h-40">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <Sphere progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  )
}
