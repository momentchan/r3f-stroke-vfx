import * as THREE from 'three';
import { SVGLoader } from 'three-stdlib';
import HanziWriter from 'hanzi-writer';
import { useEffect, useState } from "react";
import { useControls } from 'leva';
import { MeshTransmissionMaterial } from '@react-three/drei';

export function StrokeCharacter({ char }) {
    const [strokes, setStrokes] = useState([]);
    const [center, setCenter] = useState([0, 0]);
    
    const geometryControls = useControls('Geometry', {
        depth: { value: 200, min: 1, max: 500 },
        zOffset: { value: 500, min: 0, max: 5000 },
        bevelThickness: { value: 5, min: 0, max: 20 },
        bevelSize: { value: 1, min: 0, max: 10 },
        bevelSegments: { value: 3, min: 1, max: 10, step: 1 },
        curveSegments: { value: 32, min: 1, max: 64, step: 1 },
        scale: { value: 0.01, min: 0.001, max: 0.1, step: 0.001 }
    });

    const materialControls = useControls('Material', {
        color: '#ffffff',
        opacity: { value: 1, min: 0, max: 1 },
        clearcoat: { value: 1, min: 0, max: 1 },
        clearcoatRoughness: { value: 0.1, min: 0, max: 1 },
        transmission: { value: 1, min: 0, max: 1 },
        thickness: { value: 0.1, min: 0, max: 3 },
        roughness: { value: 0.1, min: 0, max: 1 },
        ior: { value: 1.5, min: 1, max: 3 },
        chromaticAberration: { value: 0.1, min: 0, max: 1 },
        anisotropy: { value: 0.1, min: 0, max: 1 },
        anisotropicBlur: { value: 0.1, min: 0, max: 1 },
        distortion: { value: 0.5, min: 0, max: 1 },
        distortionScale: { value: 0.5, min: 0.1, max: 1 },
        temporalDistortion: { value: 0.1, min: 0, max: 1 },
        samples: { value: 8, min: 1, max: 32, step: 1 },
        resolution: { value: 512, min: 256, max: 2048, step: 256 },
        transmissionSampler: true
    });

    useEffect(() => {
      HanziWriter.loadCharacterData(char).then(data => {
        setStrokes(data.strokes);
        
        // Calculate overall bounding box
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        data.strokes.forEach(svgPath => {
          const parsed = new SVGLoader().parse(`<path d='${svgPath}' />`);
          const shapes = parsed.paths[0].toShapes(true);
          const geometry = new THREE.ShapeGeometry(shapes[0]);
          geometry.computeBoundingBox();
          
          minX = Math.min(minX, geometry.boundingBox.min.x);
          maxX = Math.max(maxX, geometry.boundingBox.max.x);
          minY = Math.min(minY, geometry.boundingBox.min.y);
          maxY = Math.max(maxY, geometry.boundingBox.max.y);
        });
        
        setCenter([-(maxX + minX) / 2, -(maxY + minY) / 2]);
      });
    }, [char]);
  
    return (
      <>
        {/* <mesh 
          rotation-x={-Math.PI / 2}
          position={[0, -2, 0]}
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial 
            color="#444444"
            roughness={1}
            metalness={0}
          />
        </mesh> */}
        <group scale={[geometryControls.scale, geometryControls.scale, geometryControls.scale]} position={[0, 0, 0]}>
          {strokes.map((svgPath, index) => {
            try {
              const parsed = new SVGLoader().parse(`<path d='${svgPath}' />`);
              const shapes = parsed.paths[0].toShapes(true);
              const shape = shapes[0];

              const extrudeSettings = {
                depth: geometryControls.depth,
                bevelEnabled: true,
                bevelThickness: geometryControls.bevelThickness,
                bevelSize: geometryControls.bevelSize,
                bevelSegments: geometryControls.bevelSegments,
                curveSegments: geometryControls.curveSegments,
              };

              const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
              const dynamicOffset = Math.sin(index * 0.8) * geometryControls.zOffset;

              return (
                <mesh 
                  key={index} 
                  geometry={geometry} 
                  position={[center[0], center[1], dynamicOffset]}
                  castShadow
                  receiveShadow
                  shadowMapType={THREE.PCFSoftShadowMap}
                >
                  <MeshTransmissionMaterial 
                    {...materialControls}
                    toneMapped={false}
                    backside={false}
                    transparent={true}
                  />
                </mesh>
              );
            } catch (err) {
              console.error(`Error parsing stroke ${index}:`, err);
              return null;
            }
          })}
        </group>
      </>
    );
}