import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useSpring } from '@react-spring/three';

export default forwardRef(function Stroke({ 
    geometry, 
    material, 
    targetPosition, 
    index, 
    char, // Add character prop
    duration = 1000, 
    delay = 200, 
    ...props 
}, ref) {
    const meshRef = useRef();
    const [spring, api] = useSpring(() => ({
        strength: 1,
        delay: index * delay,
        config: {
            duration: duration,
            easing: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 // cubic easing
        },
        onChange: ({ value }) => {
            if (meshRef.current?.material?.uniforms) {
                meshRef.current.material.uniforms.uNoiseStrength.value = value.strength;
            }
        }
    }));

    useEffect(() => {
        api.start({ 
            strength: 0,
            delay: index * delay,
            config: { 
                duration: duration,
                easing: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
            }
        });
    }, [duration, delay, index]);

    // Reset and retrigger animation when character changes
    useEffect(() => {
        api.start({ 
            strength: 1,
            immediate: true
        });
        api.start({ 
            strength: 0,
            delay: index * delay,
            config: { 
                duration: duration,
                easing: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
            }
        });
    }, [char]); // Watch for character changes

    useImperativeHandle(ref, () => ({
        mesh: meshRef.current
    }));

    return (
        <mesh
            ref={meshRef}
            position={targetPosition}
            geometry={geometry}
            {...props}
        >
            {material}
        </mesh>
    );
});