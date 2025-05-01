import { Bloom, EffectComposer, FXAA, N8AO, SSAO, ToneMapping } from '@react-three/postprocessing'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useControls } from 'leva'

export function PostProcessing() {
  const { gl } = useThree()
  
  const n8aoControls = useControls('N8AO', {
    distanceFalloff: { value: 1, min: 0, max: 10 },
    aoRadius: { value: 1, min: 0, max: 10 },
    intensity: { value: 4, min: 0, max: 10 }
  })

  const bloomControls = useControls('Bloom', {
    luminanceThreshold: { value: 0, min: 0, max: 2 },
    intensity: { value: 0.3, min: 0, max: 3 },
    radius: { value: 0.3, min: 0, max: 1 }
  })

  useEffect(() => {
    gl.setClearColor('#000000')
  }, [gl])

  return (
    <EffectComposer disableNormalPass multisampling={8}>
      <N8AO {...n8aoControls} />
      {/* <Bloom {...bloomControls} /> */}
      <FXAA/>
      {/* <ToneMapping /> */}
    </EffectComposer>
  )
}
