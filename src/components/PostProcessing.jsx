import { Bloom, DepthOfField, EffectComposer, FXAA, N8AO, SSAO, ToneMapping, SMAA } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useControlVariables } from '../hooks/useCharacterVariables'


export function PostProcessing() {
  const {
    shaderControls,
    n8aoControls,
    bloomControls,
    dofControls,
  } = useControlVariables(true);

  return (
    <>
      <EffectComposer enableNormalPass={false} multisampling={4}>
        {/* <Bloom {...bloomControls} /> */}
        {/* <DepthOfField {...dofControls}/> */}
        {shaderControls.type !== 'custom' &&   <DepthOfField {...dofControls} />}
        {shaderControls.type !== 'custom' && <N8AO {...n8aoControls} />}
        {/* <ToneMapping /> */}
      </EffectComposer>
    </>
  )
}
