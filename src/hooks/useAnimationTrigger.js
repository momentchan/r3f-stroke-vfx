import { create } from 'zustand';

export const useAnimationTrigger = create((set) => ({
    animationCount: 0,
    isInitialized: false,
    triggerAnimation: () => set((state) => ({ 
        animationCount: state.animationCount + 1,
        isInitialized: true 
    }))
}));
