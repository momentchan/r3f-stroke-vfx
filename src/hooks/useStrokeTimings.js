import { useMemo } from 'react';

export function useStrokeTimings(strokes, totalDuration, minStrokeDuration) {
  return useMemo(() => {
    const total = Math.max(
      totalDuration,
      strokes.length * minStrokeDuration
    );
    const count = strokes.length || 1;
    const basePerStroke = Math.max(
      total / count,
      minStrokeDuration
    );
    
    const randomDurations = Array.from({ length: count }, () => 
      basePerStroke * (0.8 + Math.random() * 0.4)
    );

    let currentDelay = 0;
    return randomDurations.map((duration) => {
      const timing = {
        duration: Math.max(duration, minStrokeDuration),
        delay: currentDelay
      };
      currentDelay += duration * 0.7;
      return timing;
    });
  }, [strokes.length, totalDuration, minStrokeDuration]);
}
