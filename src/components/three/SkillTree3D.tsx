"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Line, Html } from "@react-three/drei"
import { Suspense, useRef, useState, useMemo } from "react"
import * as THREE from "three"

interface SkillNode {
  id: string
  title: string
  technology?: string | null
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"
  position: [number, number, number]
  connections: string[]
}

interface NodeSphereProps {
  node: SkillNode
  onClick: (node: SkillNode) => void
  isSelected: boolean
}

function NodeSphere({ node, onClick, isSelected }: NodeSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const color = {
    PENDING: "#475569",
    IN_PROGRESS: "#3b82f6",
    COMPLETED: "#22c55e",
    SKIPPED: "#374151",
  }[node.status]

  const emissiveIntensity = hovered || isSelected ? 0.6 : 0.2

  useFrame((state) => {
    if (!meshRef.current) return
    if (node.status === "IN_PROGRESS") {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08
      meshRef.current.scale.setScalar(scale)
    }
    if (node.status === "COMPLETED") {
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onClick={() => onClick(node)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        castShadow
      >
        <sphereGeometry args={[node.status === "COMPLETED" ? 0.35 : 0.28, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      {isSelected && (
        <mesh>
          <torusGeometry args={[0.45, 0.04, 16, 64]} />
          <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} />
        </mesh>
      )}
      {hovered && (
        <Html distanceFactor={8} center>
          <div className="bg-base-800 border border-base-600 px-2 py-1 rounded-lg text-xs font-mono text-text-primary whitespace-nowrap pointer-events-none shadow-card">
            {node.title}
          </div>
        </Html>
      )}
    </group>
  )
}

function ConnectionLine({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const points = useMemo(
    () => [new THREE.Vector3(...from), new THREE.Vector3(...to)],
    [from, to]
  )
  return <Line points={points} color="#28304a" lineWidth={1.5} opacity={0.6} transparent />
}

function SkillTreeScene({ nodes, onNodeClick, selectedNodeId }: {
  nodes: SkillNode[]
  onNodeClick: (node: SkillNode) => void
  selectedNodeId?: string
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#3b82f6" />
      <pointLight position={[5, -5, 5]} intensity={1} color="#22c55e" />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#8b5cf6" />

      {nodes.map((node) =>
        node.connections.map((targetId) => {
          const target = nodes.find((n) => n.id === targetId)
          if (!target) return null
          return (
            <ConnectionLine
              key={`${node.id}-${targetId}`}
              from={node.position}
              to={target.position}
            />
          )
        })
      )}

      {nodes.map((node) => (
        <NodeSphere
          key={node.id}
          node={node}
          onClick={onNodeClick}
          isSelected={selectedNodeId === node.id}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  )
}

interface LearningGoal {
  id: string
  title: string
  technology?: string | null
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"
}

export default function SkillTree3D({ goals }: { goals: LearningGoal[] }) {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null)

  const nodes: SkillNode[] = useMemo(() => {
    return goals.map((goal, i) => {
      const angle = (i / goals.length) * Math.PI * 2
      const radius = 3 + Math.floor(i / 6) * 2
      const height = -Math.floor(i / 6) * 2
      return {
        id: goal.id,
        title: goal.title,
        technology: goal.technology,
        status: goal.status,
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        connections: goals
          .filter((_, j) => j === i + 1)
          .map((g) => g.id),
      }
    })
  }, [goals])

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      COMPLETED: { bg: "bg-neon-500/15", text: "text-neon-400", label: "Completado" },
      IN_PROGRESS: { bg: "bg-electric-500/15", text: "text-electric-400", label: "En progreso" },
      PENDING: { bg: "bg-base-600", text: "text-text-tertiary", label: "Pendiente" },
      SKIPPED: { bg: "bg-base-600", text: "text-text-tertiary", label: "Omitido" },
    }
    const s = map[status] || map.PENDING
    return <span className={`${s.bg} ${s.text} px-2 py-0.5 rounded-md text-xs font-mono border border-base-600`}>{s.label}</span>
  }

  return (
    <div className="relative w-full h-full min-h-100">
      <Canvas
        camera={{ position: [0, 3, 12], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <Suspense fallback={null}>
          <SkillTreeScene
            nodes={nodes}
            onNodeClick={setSelectedNode}
            selectedNodeId={selectedNode?.id}
          />
        </Suspense>
      </Canvas>

      {selectedNode && (
        <div className="absolute right-4 top-4 w-72 bg-base-800 border border-base-600 rounded-xl p-4 shadow-card animate-slide-in-right">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-text-code bg-base-700 px-2 py-1 rounded">
              {selectedNode.technology || "General"}
            </span>
            <button onClick={() => setSelectedNode(null)} className="text-text-tertiary hover:text-text-primary">
              ✕
            </button>
          </div>
          <h3 className="font-sans text-sm font-semibold text-text-primary mb-2">{selectedNode.title}</h3>
          {statusBadge(selectedNode.status)}
        </div>
      )}

      <div className="absolute bottom-4 left-4 flex gap-3">
        {[
          { status: "COMPLETED", color: "bg-neon-500", label: "Completado" },
          { status: "IN_PROGRESS", color: "bg-electric-500", label: "En progreso" },
          { status: "PENDING", color: "bg-base-600", label: "Pendiente" },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
            <span className="font-mono text-xs text-text-tertiary">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
