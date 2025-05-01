import { OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from '@react-three/fiber'
import Utilities from "./r3f-gist/utility/Utilities";
import { useEffect, useState } from "react";
import { useControls } from 'leva';
import { StrokeCharacter } from './components/StrokeCharacter';
import { PostProcessing } from './components/PostProcessing';
import { SceneEnvironment } from './components/SceneEnvironment';

export default function App() {
    const [char, setChar] = useState('駿');

    const { cameraType, zoom, position } = useControls('Camera', {
        cameraType: {
            value: 'perspective',
            options: ['perspective', 'orthographic']
        },
        zoom: {
            value: 50,
            min: 10,
            max: 200,
        },
        position: {
            value: 20,
            min: 1,
            max: 20,
        }
    });

    return <>
        <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
            {cameraType === 'perspective' ? (
                <PerspectiveCamera
                    makeDefault
                    fov={45}
                    near={0.1}
                    far={200}
                    position={[0, 0, position]}
                />
            ) : (
                <OrthographicCamera
                    makeDefault
                    zoom={zoom}
                    near={0.1}
                    far={200}
                    position={[0, 0, position]}
                />
            )}
            <color attach="background" args={['#141622']} />

            <OrbitControls makeDefault />
            <SceneEnvironment />
            <StrokeCharacter char={char} />
            <Utilities />
            <PostProcessing />
        </Canvas>
    </>
}