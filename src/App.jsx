import { OrbitControls, OrthographicCamera, PerspectiveCamera, GizmoHelper, GizmoViewport } from "@react-three/drei";
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber'
import Utilities from "./r3f-gist/utility/Utilities";
import { useEffect, useState, useRef } from "react";
import { useControls } from 'leva';
import { StrokeCharacter } from './components/StrokeCharacter';
import { PostProcessing } from './components/PostProcessing';
import { SceneEnvironment } from './components/SceneEnvironment';
import Debug from './r3f-gist/utility/Debug';
import GlobalStates from "./r3f-gist/utility/GlobalStates";

function DebugCameraHelper({ camera }) {
    const helper = useRef();

    useEffect(() => {
        if (camera && helper.current) {
            helper.current.matrix = camera.matrix;
            helper.current.matrixWorld = camera.matrixWorld;
            helper.current.matrixAutoUpdate = false;
            helper.current.update();
        }
    });

    if (!camera) return null;

    return <primitive object={new THREE.CameraHelper(camera)} ref={helper} />;
}

export default function App() {
    const [char, setChar] = useState('駿');
    const mainCamera = useRef();
    const debugCameraRef = useRef();

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

    const fogControls = useControls('Fog', {
        color: '#141622',
        density: { value: 0.01, min: 0, max: 0.1, step: 0.01 }
    });

    const { showGizmos, debugCameraPosition } = useControls('Debug', {
        showGizmos: false,
        debugCameraPosition: {
            value: [10, 10, 10],
            step: 1,
        }
    });

    return <>
        <GlobalStates />
        <Canvas shadows gl={{ preserveDrawingBuffer: true, antialias: false }}>
            {/* Main Camera */}
            {cameraType === 'perspective' ? (
                <PerspectiveCamera
                    ref={mainCamera}
                    makeDefault={!showGizmos}
                    fov={45}
                    near={0.1}
                    far={100}
                    position={[0, 0, position]}
                />
            ) : (
                <OrthographicCamera
                    ref={mainCamera}
                    makeDefault={!showGizmos}
                    zoom={zoom}
                    near={0.1}
                    far={200}
                    position={[0, 0, position]}
                />
            )}

            {/* Debug Camera */}
            {showGizmos && (
                <>
                    <PerspectiveCamera
                        ref={debugCameraRef}
                        makeDefault
                        position={debugCameraPosition}
                        fov={75}
                    />
                    {mainCamera.current && <DebugCameraHelper camera={mainCamera.current} />}
                </>
            )}

            <fogExp2 attach="fog" args={[fogControls.color, fogControls.density]} />

            <OrbitControls makeDefault />
            {showGizmos && (
                <>
                    <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                        <GizmoViewport labelColor="white" axisHeadScale={1} />
                    </GizmoHelper>
                </>
            )}
            <SceneEnvironment />
            <StrokeCharacter char={char} />
            <Utilities />
            <PostProcessing />
        </Canvas>
    </>
}