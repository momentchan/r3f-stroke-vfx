import * as THREE from 'three';
import { SVGLoader } from 'three-stdlib';
import HanziWriter from 'hanzi-writer';
import { useEffect, useState, useMemo, useRef } from "react";
import { useFrame, useThree } from '@react-three/fiber';
import useGlobalStore from '../r3f-gist/utility/useGlobalStore';
import React from "react";
import Stroke from './Stroke';
import ThreeCustomShaderMaterial from 'three-custom-shader-material';
import transmissionVertex from '../shader/stroke-transmission/vertex.glsl';
import { useControlVariables } from '../hooks/useCharacterVariables';
import { useStrokeTimings } from '../hooks/useStrokeTimings';
import { useAnimationTrigger } from '../hooks/useAnimationTrigger';

export function StrokeCharacter({ char }) {
  const { isMobile } = useGlobalStore();
  const { viewport, camera } = useThree();
  const [strokes, setStrokes] = useState([]);
  const [center, setCenter] = useState([0, 0]);
  const [bounds, setBounds] = useState({ min: [0, 0], max: [0, 0] });

  const {
    geometryControls,
    transmissionControls,
    noiseControls,
    animationControls,
  } = useControlVariables();

  const strokeTimings = useStrokeTimings(
    strokes,
    animationControls.totalDuration,
    animationControls.minStrokeDuration
  );

  const { animationCount } = useAnimationTrigger();

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

  const materialMap = {
    'default': (i) => (
      <ThreeCustomShaderMaterial
        key={`default-material-${i}`}
        baseMaterial={THREE.MeshPhysicalMaterial}
        uniforms={{
          uTime: { value: 0 },
          uNoiseScale: { value: noiseControls.scale },
          uNoiseStrength: { value: 1 },
          uNoiseStrengthMultiplier: { value: noiseControls.strength },
          uSpeed: { value: noiseControls.speed }
        }}
        vertexShader={transmissionVertex}
        {...transmissionControls}
        wireframe={randomWireframes[i] || transmissionControls.wireframe}
        toneMapped={false}
        silent
        side={THREE.DoubleSide}
      />
    )
  };

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
    strokeRefs.current.forEach((ref) => {
      if (ref?.mesh?.material?.uniforms) {
        ref.mesh.material.uniforms.uTime.value = state.clock.elapsedTime;
      }
    });
  });

  return (
    <group scale={[geometryControls.scale, geometryControls.scale, geometryControls.scale]}>
      {geometries.geometries.map((geometry, index) => (
        <Stroke
          key={index}
          ref={(el) => (strokeRefs.current[index] = el)}
          geometry={geometry}
          material={materialMap.default(index)}
          targetPosition={[center[0], center[1], dynamicOffsets[index]]}
          center={center}
          index={index}
          animationTrigger={animationCount}
          duration={strokeTimings[index].duration}
          delay={strokeTimings[index].delay}
          totalStrokes={strokes.length}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}