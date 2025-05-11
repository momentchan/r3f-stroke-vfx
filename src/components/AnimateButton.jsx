import React from 'react';
import { useAnimationTrigger } from '../hooks/useAnimationTrigger';

export function AnimateButton() {
    const { triggerAnimation } = useAnimationTrigger();

    return (
        <button
            onClick={triggerAnimation}
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                padding: '10px 20px',
                backgroundColor: '#333',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                zIndex: 1000,
            }}
        >
            Replay Animation
        </button>
    );
}
