import { Environment, Lightformer } from "@react-three/drei"
import { useControls } from 'leva'

export function SceneEnvironment() {
    const envControls = useControls('Environment', {
        intensity: { value: 1000, min: 0, max: 10000 },
        envResolution: { value: 512, min: 128, max: 512, step: 128 }
    })

    return (
        <>
            <ambientLight intensity={2000} />
            {/* <directionalLight position={[10, 10, 5]} intensity={10000} castShadow /> */}
            <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={1000000} castShadow />
            <Environment preset="city"/>
            {/* <Environment resolution={envControls.envResolution} background={false}>
                <group rotation={[-Math.PI / 3, 0, 1]}>
                    <Lightformer form="circle" intensity={envControls.intensity} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
                    <Lightformer form="circle" intensity={envControls.intensity * 0.5} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
                    <Lightformer form="circle" intensity={envControls.intensity * 0.5} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
                    <Lightformer form="circle" intensity={envControls.intensity * 0.5} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
                </group>
            </Environment> */}
        </>
    )
}
