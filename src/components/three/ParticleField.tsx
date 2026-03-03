"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useMemo, useRef, useState } from "react"
import * as THREE from "three"

function generateParticleData(count: number): [Float32Array, Float32Array] {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const baseColors = [
    [0.23, 0.51, 0.96], // electric
    [0.13, 0.77, 0.37], // neon
    [0.55, 0.36, 0.96], // violet
  ]

  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 20
    pos[i * 3 + 1] = (Math.random() - 0.5) * 10
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20

    const c = baseColors[Math.floor(Math.random() * baseColors.length)]
    col[i * 3] = c[0]
    col[i * 3 + 1] = c[1]
    col[i * 3 + 2] = c[2]
  }
  return [pos, col]
}

function Particles() {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 200

  const [particleData] = useState(() => generateParticleData(count))
  const positions = particleData[0]
  const colors = particleData[1]

  const positionAttr = useMemo(() => new THREE.BufferAttribute(positions, 3), [positions])
  const colorAttr = useMemo(() => new THREE.BufferAttribute(colors, 3), [colors])

  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <primitive attach="attributes-position" object={positionAttr} />
        <primitive attach="attributes-color" object={colorAttr} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

export default function ParticleField() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-30">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <Particles />
        </Suspense>
      </Canvas>
    </div>
  )
}
