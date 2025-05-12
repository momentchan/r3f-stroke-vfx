import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useSpring } from '@react-spring/three';
import { EasingFunctions } from '../r3f-gist/utility/easing';
import { CustomShaderMaterial } from '../r3f-gist/shader/CustomShaderMaterial';
import { useControlVariables } from '../hooks/useCharacterVariables';
import customVertex from '../shader/stroke-custom/vertex.glsl';
import customFragment from '../shader/stroke-custom/fragment.glsl';
import * as THREE from 'three';

export default forwardRef(function Stroke({
    geometry,
    material,
    targetPosition,
    index,
    animationTrigger,
    duration = 1000,
    delay = 200,
    ...props
}, ref) {

    const {
        customControls,
        noiseControls,
        shaderControls
    } = useControlVariables(true);

    const meshRef = useRef();
    const [spring, api] = useSpring(() => ({
        strength: 0,
        config: {
            duration: duration * 1.5, // Extended duration for fade out
            easing: EasingFunctions.easeOutQuint // Slow at the end
        },
        onChange: ({ value }) => {
            if (meshRef.current?.material?.uniforms) {
                meshRef.current.material.uniforms.uNoiseStrength.value = value.strength;
            }
        }
    }));

    // Only trigger animation when button is pressed
    useEffect(() => {
        if (animationTrigger > 0) { // Only run if animationTrigger has changed from initial 0
            const animate = async () => {
                await api.start({ strength: 1, immediate: true });
                await api.start({
                    strength: 0,
                    delay,
                    config: {
                        duration: duration * 1.5,
                        easing: EasingFunctions.easeOutQuint
                    }
                });
            };
            animate();
        }
    }, [animationTrigger]); // Only depend on animationTrigger

    useImperativeHandle(ref, () => ({
        mesh: meshRef.current,
        reset: () => api.start({ strength: 0, immediate: true }),
        animate: (dur, del) => api.start({
            strength: 0,
            delay: del,
            config: { duration: dur, easing: EasingFunctions.easeInOutQuint }
        })
    }));

    return (
        <mesh
            ref={meshRef}
            position={targetPosition}
            geometry={geometry}
            {...props}
        >
            {shaderControls.type === 'dissolve' ?
                <CustomShaderMaterial
                    uniforms={{
                        uNoiseScale: noiseControls.scale,
                        uNoiseStrength: 1,
                        uNoiseStrengthMultiplier: noiseControls.strength,
                        uSpeed: noiseControls.speed,
                        uAlpha: customControls.alpha,
                        uTime: 0,
                    }}
                    vertexShader={customVertex}
                    fragmentShader={customFragment}
                    transparent={true}
                    side={THREE.DoubleSide}
                /> :
                material}
        </mesh>
    );
});