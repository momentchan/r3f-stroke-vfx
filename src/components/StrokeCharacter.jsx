import * as THREE from 'three';
import { SVGLoader } from 'three-stdlib';
import HanziWriter from 'hanzi-writer';
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useControls } from 'leva';
import { useFrame, useThree } from '@react-three/fiber';
import useGlobalStore from '../r3f-gist/utility/useGlobalStore';
import React from "react";
import Stroke from './Stroke';
import ThreeCustomShaderMaterial from 'three-custom-shader-material';
import strokeVertex from '../shader/stroke.glsl';

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
      ...(isMobile ? {} : { wireframe: false }),
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
    { disabled: isMobile }
  );

  const noiseControls = useControls('Noise', {
    scale: { value: 0.01, min: 0.001, max: 0.1 },
    strength: { value: 100, min: 0, max: 500 },
    speed: { value: 0.5, min: 0, max: 2 }
  });

  const animationControls = useControls('Animation', {
    duration: { value: 1000, min: 100, max: 5000, step: 100 },
    delay: { value: 200, min: 0, max: 1000, step: 50 }
  });

  const frustum = useMemo(() => new THREE.Frustum(), []);
  const projScreenMatrix = useMemo(() => new THREE.Matrix4(), []);

  // Add random wireframe states for each stroke
  const randomWireframes = useMemo(() =>
    Array.from({ length: 100 }, () => Math.random() > 0.5),
    []);

  // Add ref for stroke materials
  const strokeRefs = useRef([]);

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

  // Create shared materials array for all strokes
  const sharedMaterials = useMemo(() => 
    Array.from({ length: 100 }, (_, i) => (
      <ThreeCustomShaderMaterial
        key={`shared-material-${i}`}
        baseMaterial={THREE.MeshPhysicalMaterial}
        uniforms={{
          uTime: { value: 0 },
          uNoiseScale: { value: noiseControls.scale },
          uNoiseStrength: { value: 1 },
          uSpeed: { value: noiseControls.speed }
        }}
        vertexShader={strokeVertex}
        {...materialControls}
        wireframe={randomWireframes[i] || materialControls.wireframe}
        toneMapped={false}
        silent
      />
    ))
  , [materialControls, noiseControls, randomWireframes]);

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

  useFrame((state) => {
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);

    strokeRefs.current.forEach((ref) => {
      if (ref?.mesh?.material?.uniforms) {
        ref.mesh.material.uniforms.uTime.value = state.clock.elapsedTime;
      }
    });
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
      {/* {(
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
      )} */}
      {geometries.geometries.map((geometry, index) => (
        <Stroke
          key={index}
          ref={(el) => (strokeRefs.current[index] = el)}
          geometry={geometry}
          material={sharedMaterials[index]}
          targetPosition={[center[0], center[1], dynamicOffsets[index]]}
          center={center}
          index={index}
          char={char}
          duration={animationControls.duration}
          delay={animationControls.delay}
          totalStrokes={strokes.length}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}