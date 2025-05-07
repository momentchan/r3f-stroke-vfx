import * as THREE from 'three';
import { SVGLoader } from 'three-stdlib';
import HanziWriter from 'hanzi-writer';
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useControls } from 'leva';
import { MeshTransmissionMaterial } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import useGlobalStore from '../r3f-gist/utility/useGlobalStore';
import React from "react";
import Stroke from './Stroke';

export function StrokeCharacter({ char }) {
  const { isMobile } = useGlobalStore();
  const { viewport, camera } = useThree();
  const [strokes, setStrokes] = useState([]);
  const [center, setCenter] = useState([0, 0]);
  const [bounds, setBounds] = useState({ min: [0, 0], max: [0, 0] });

  const geometryControls = useControls('Geometry', {
    depth: { value: 400, min: 1, max: 500 },
    zOffset: { value: 1000, min: 0, max: 5000 },
    bevelThickness: { value: 5, min: 0, max: 20 },
    bevelSize: { value: 1, min: 0, max: 10 },
    bevelSegments: { value: 3, min: 1, max: 10, step: 1 },
    curveSegments: { value: 32, min: 1, max: 64, step: 1 },
    scale: { value: 0.01, min: 0.001, max: 0.1, step: 0.001 }
  });

  const materialControls = useControls(
    'Material',
    {
      color: '#1c1c1c',
      ...(isMobile ? {} : { wireframe: false }), // Only show wireframe control on PC
      transmission: { value: 1, min: 0, max: 1 },
      thickness: { value: 0.1, min: 0, max: 3 },
      roughness: { value: 0.1, min: 0, max: 1 },
      ior: { value: 1.5, min: 1, max: 3 },
      chromaticAberration: { value: 0.1, min: 0, max: 1 },
      samples: { value: isMobile ? 4 : 8, min: 1, max: 32, step: 1 },
      resolution: { value: isMobile ? 256 : 512, min: 256, max: 2048, step: 256 }
    },
    { disabled: isMobile }
  );

  const { showGizmos } = useControls('Debug', {
    showGizmos: false,
  });

  const frustum = useMemo(() => new THREE.Frustum(), []);
  const projScreenMatrix = useMemo(() => new THREE.Matrix4(), []);

  // Add random wireframe states for each stroke
  const randomWireframes = useMemo(() =>
    Array.from({ length: 100 }, () => Math.random() > 0.5),
    []);

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

      setBounds({ min: [minX, minY], max: [maxX, maxY] });
      setCenter([-(maxX + minX) / 2, -(maxY + minY) / 2]);
    });
  }, [char]);

  // Optimize material creation
  const sharedMaterial = useMemo(() => (
    <MeshTransmissionMaterial
      {...materialControls}
      wireframe={false}
      toneMapped={false}
      transparent={false}
      backside={false}
    />
  ), [materialControls]);

  // Optimize geometry creation with disposal
  const geometries = useMemo(() => {
    const pool = strokes.map(svgPath => {
      const parsed = new SVGLoader().parse(`<path d='${svgPath}' />`);
      const shapes = parsed.paths[0].toShapes(true);
      const geometry = new THREE.ExtrudeGeometry(shapes[0], {
        depth: geometryControls.depth,
        bevelEnabled: true,
        bevelThickness: geometryControls.bevelThickness,
        bevelSize: geometryControls.bevelSize,
        bevelSegments: geometryControls.bevelSegments,
        curveSegments: geometryControls.curveSegments,
      });
      geometry.computeBoundingBox();
      return geometry;
    });

    return {
      geometries: pool,
      dispose: () => pool.forEach(geo => geo.dispose())
    };
  }, [strokes, geometryControls]);

  // Cleanup
  useEffect(() => {
    return () => {
      geometries.dispose();
    };
  }, [geometries]);

  // Memoize dynamic offsets
  const dynamicOffsets = useMemo(() =>
    Array.from({ length: strokes.length }, (_, i) =>
      Math.sin(i * 0.8) * geometryControls.zOffset
    ),
    [strokes.length, geometryControls.zOffset]
  );

  // Frustum culling check
  useFrame(() => {
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);
  });

  // Update frustum check
  const isInView = useCallback((geometry, position) => {
    if (!geometry.boundingSphere) return true;

    const sphere = geometry.boundingSphere.clone();
    sphere.center.set(
      position[0] * geometryControls.scale,
      position[1] * geometryControls.scale,
      position[2] * geometryControls.scale
    );
    return frustum.intersectsSphere(sphere);
  }, [frustum, geometryControls.scale]);

  return (
    <group scale={[geometryControls.scale, geometryControls.scale, geometryControls.scale]}>
      { (
        <>
          <mesh position={[0, 0, 0]}>
            <boxGeometry 
              args={[
                bounds.max[0] - bounds.min[0], 
                bounds.max[1] - bounds.min[1], 
                10
              ]} 
            />
            <meshBasicMaterial color="yellow" wireframe transparent opacity={0.5} />
          </mesh>
        </>
      )}
      {geometries.geometries.map((geometry, index) => (
        <Stroke
          key={index}
          geometry={geometry}
          material={isMobile ? sharedMaterial : (
            <MeshTransmissionMaterial
              {...materialControls}
              wireframe={randomWireframes[index] || materialControls.wireframe}
              toneMapped={false}
            />
          )}
          targetPosition={[center[0], center[1], dynamicOffsets[index]]}
          center={center}
          index={index}
          totalStrokes={strokes.length}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}