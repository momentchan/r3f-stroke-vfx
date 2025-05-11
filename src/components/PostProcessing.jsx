import { Bloom, DepthOfField, EffectComposer, FXAA, N8AO, SSAO, ToneMapping, SMAA } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useControls } from 'leva'


export function PostProcessing() {
  const n8aoControls = useControls('N8AO', {
    distanceFalloff: { value: 1, min: 0, max: 10 },
    aoRadius: { value: 1, min: 0, max: 10 },
    intensity: { value: 4, min: 0, max: 10 }
  })

  const bloomControls = useControls('Bloom', {
    luminanceThreshold: { value: 0.3, min: 0, max: 2 },
    intensity: { value: 2, min: 0, max: 3 },
    radius: { value: 0.2, min: 0, max: 1 }
  })

  const dofControls = useControls('Depth of Field', {
    focusDistance: { value: 0.2, min: 0, max: 1, step: 0.01 },
    focalLength: { value: 0.2, min: 0, max: 1, step: 0.01 },
    bokehScale: { value: 3, min: 0, max: 10 },
  })

  return (
    <>
      <EffectComposer enableNormalPass={false} multisampling={4}>
        {/* <Bloom {...bloomControls} /> */}
        <DepthOfField {...dofControls}/>
        <N8AO {...n8aoControls} />
        {/* <ToneMapping /> */}
      </EffectComposer>
    </>
  )
}
