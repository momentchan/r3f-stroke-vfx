import { Environment, Float, Lightformer } from "@react-three/drei"
import { useControls } from 'leva'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Gradient, LayerMaterial } from "lamina"
import * as THREE from 'three'

function Lightformers({ positions = [2, 0, 2, 0, 2, 0, 2, 0] }) {
  const {
    accentColor,
    gradientColorA, gradientColorB, gradientContrast, gradientStart, gradientEnd
  } = useControls('Environment', {
    accentColor: { value: '#ff0055' },
    gradientColorA: { value: '#829abd', label: 'Gradient Color A' },
    gradientColorB: { value: '#4c6069', label: 'Gradient Color B' },
    gradientContrast: { value: 2.58, min: 0, max: 5, step: 0.01 },
    gradientStart: { value: 1.21, min: -10, max: 10, step: 0.01 },
    gradientEnd: { value: -.7, min: -10, max: 10, step: 0.01 }
  })

  const movingGroup = useRef()
  useFrame((_, delta) => {
    if (movingGroup.current) {
      movingGroup.current.position.z += delta * 10
      if (movingGroup.current.position.z > 20) movingGroup.current.position.z = -60
    }
  })

  return (
    <>
      {/* Ceiling */}
      <Lightformer intensity={0.75} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[5, 5, 1]} />
      {/* Moving group of circles */}
      <group rotation={[0, 0.5, 0]}>
        <group ref={movingGroup}>
          {positions.map((x, i) => (
            <Lightformer
              key={i}
              form="circle"
              intensity={2}
              rotation={[Math.PI / 2, 0, 0]}
              position={[x, 4, i * 4]}
              scale={[3, 1, 1]}
            />
          ))}
        </group>
      </group>
      {/* Sides */}
      <Lightformer intensity={4} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.1, 1]} />
      <Lightformer rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
      <Lightformer rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} />
      {/* Accent (controlled color) */}
      <Float speed={5} floatIntensity={2} rotationIntensity={2}>
        <Lightformer form="ring" color={accentColor} intensity={1} scale={10} position={[-15, 4, -18]} target={[0, 0, 0]} />
      </Float>
      {/* Background */}
      <mesh scale={100}>
        <sphereGeometry args={[1, 64, 64]} />
        <LayerMaterial side={THREE.BackSide}>
          <Gradient
            colorA={gradientColorA}
            colorB={gradientColorB}
            alpha={1}
            contrast={gradientContrast}
            start={gradientStart}
            end={gradientEnd}
            axes='y'
          />
        </LayerMaterial>
      </mesh>
    </>
  )
}

export function SceneEnvironment() {
  return (
    <>
      <ambientLight intensity={1} />
      <Environment background frames={Infinity} blur={1}>
        <Lightformers />
      </Environment>
    </>
  )
}
