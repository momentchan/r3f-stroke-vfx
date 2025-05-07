import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/three';

export default function Stroke({ geometry, material, targetPosition, center, index, totalStrokes, ...props }) {
    const [isVisible, setIsVisible] = useState(false);
    
    const { position } = useSpring({
        position: isVisible ? targetPosition : [center[0], center[1], 0],
        config: { mass: 1, tension: 180, friction: 20 }
    });
    
    useEffect(() => {
        const delay = index * 400;
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        
        return () => clearTimeout(timer);
    }, [index]);

    if (!isVisible) return null;

    return (
        <animated.mesh
            position={position}
            geometry={geometry} 
            {...props}
        >
            {material}
        </animated.mesh>
    );
}