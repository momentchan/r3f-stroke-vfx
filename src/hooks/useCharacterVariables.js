import { useControls } from 'leva';

export function useControlVariables() {
  const geometryControls = useControls('Geometry', {
    depth: { value: 400, min: 1, max: 500 },
    zOffset: { value: 1000, min: 0, max: 5000 },
    bevelThickness: { value: 5, min: 0, max: 20 },
    bevelSize: { value: 1, min: 0, max: 10 },
    bevelSegments: { value: 3, min: 1, max: 10, step: 1 },
    curveSegments: { value: 32, min: 1, max: 64, step: 1 },
    scale: { value: 0.01, min: 0.001, max: 0.1, step: 0.001 }
  });

  const noiseControls = useControls('Noise', {
    scale: { value: 0.00046, min: 0.000, max: 0.001 },
    strength: { value: 500, min: 0, max: 500 },
    speed: { value: 0.5, min: 0, max: 2 }
  });

  const animationControls = useControls('Animation', {
    totalDuration: { value: 5000, min: 500, max: 10000, step: 100 },
    minStrokeDuration: { value: 500, min: 100, max: 2000, step: 100 },
  });

  const shaderControls = useControls('Material Type', {
    type: {
      value: 'custom',
      options: ['default', 'custom']
    }
  }, { order: 1 });

  const transmissionControls = useControls(
    'Transmission Material',
    {
      color: '#1c1c1c',
      wireframe: { value: false },
      metalness: { value: 0.5, min: 0, max: 1 },
      roughness: { value: 0.1, min: 0, max: 1 },
      transmission: { value: 1, min: 0, max: 1 },
      thickness: { value: 1.5, min: 0, max: 5 },
      attenuationDistance: { value: 0.5, min: 0, max: 2 },
      attenuationColor: '#ffffff',
      clearcoat: { value: 1, min: 0, max: 1 },
      clearcoatRoughness: { value: 0.1, min: 0, max: 1 },
      envMapIntensity: { value: 2, min: 0, max: 5 },
      ior: { value: 1.5, min: 1, max: 2.333 },
      sheen: { value: 0.1, min: 0, max: 1 },
      sheenRoughness: { value: 0.3, min: 0, max: 1 },
      sheenColor: '#ff0000',
      specularIntensity: { value: 1, min: 0, max: 2 },
      specularColor: '#ffffff'
    },
    {
      order: 2,
      render: (get) => get('Material Type.type') === 'default'
    }
  );

  const customControls = useControls('Custom Material', {
    alpha: { value: 0.5, min: 0, max: 1, step: 0.01 },
    color: '#ffffff',
    fresnelColor: '#ffffff',
    fogColor: '#00839d',
    fresnelPower: { value: 2, min: 0, max: 5, step: 0.1 },
    fogDensity: { value: 0.003, min: 0, max: 0.01, step: 0.001 },
  }, {
    order: 2,
    render: (get) => get('Material Type.type') === 'custom'
  });


  const n8aoControls = useControls('N8AO', {
    distanceFalloff: { value: 1, min: 0, max: 10 },
    aoRadius: { value: 1, min: 0, max: 10 },
    intensity: { value: 4, min: 0, max: 10 }
  }, {
    order: 2,
    render: (get) => get('Material Type.type') === 'default'
  }
  )

  const bloomControls = useControls('Bloom', {
    luminanceThreshold: { value: 0.3, min: 0, max: 2 },
    intensity: { value: .5, min: 0, max: 3 },
    radius: { value: 0.2, min: 0, max: 1 }
  })

  const dofControls = useControls('Depth of Field', {
    focusDistance: { value: 0.2, min: 0, max: 1, step: 0.01 },
    focalLength: { value: 0.2, min: 0, max: 1, step: 0.01 },
    bokehScale: { value: 3, min: 0, max: 10 },
  })

  return {
    n8aoControls,
    bloomControls,
    dofControls,
    geometryControls,
    noiseControls,
    animationControls,
    shaderControls,
    customControls,
    transmissionControls,
  };
}
