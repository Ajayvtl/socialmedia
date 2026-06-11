"use client";

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMediaUrl } from '@/lib/api';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D map;
uniform sampler2D depthMap;
uniform vec2 mouse;
uniform float intensity;

varying vec2 vUv;

void main() {
  // Read depth from the red channel
  float depth = texture2D(depthMap, vUv).r;
  
  // Calculate offset based on depth and mouse position. 
  // depth - 0.5 centers the pivot so mid-depth pixels don't move.
  vec2 offset = mouse * intensity * (depth - 0.5);
  
  // Prevent edge bleeding by clamping UVs
  vec2 uv = clamp(vUv + offset, 0.0, 1.0);
  
  gl_FragColor = texture2D(map, uv);
}
`;

interface ParallaxMaterialProps {
  imageTex: THREE.Texture;
  depthTex: THREE.Texture;
  intensity?: number;
}

const ParallaxPlane: React.FC<ParallaxMaterialProps> = ({ imageTex, depthTex, intensity = 0.05 }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    map: { value: imageTex },
    depthMap: { value: depthTex },
    mouse: { value: new THREE.Vector2(0, 0) },
    intensity: { value: intensity }
  }), [imageTex, depthTex, intensity]);

  useFrame((state) => {
    if (materialRef.current) {
      // Smoothly interpolate mouse for fluid, cinematic movement
      materialRef.current.uniforms.mouse.value.lerp(
        new THREE.Vector2(
          (state.pointer.x * 0.5), // Scale down slightly to avoid extreme warping
          (state.pointer.y * 0.5)
        ),
        0.1 // Lerp factor
      );
    }
  });

  return (
    <mesh>
      {/* Plane should cover the viewport roughly. We use 2,2 for [-1, 1] range standard Orthographic Camera */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

interface SpatialPhotoProps {
  src: string;
  depthSrc: string;
  className?: string;
  intensity?: number;
}

export const SpatialPhoto: React.FC<SpatialPhotoProps> = ({ src, depthSrc, className = "w-full h-full", intensity = 0.06 }) => {
  const [imageTex, setImageTex] = useState<THREE.Texture | null>(null);
  const [depthTex, setDepthTex] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Check WebGL and hardware concurrency to fallback on low-end devices
  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
      
      if (!gl || lowPower) {
        setIsSupported(false);
      }
    } catch (e) {
      setIsSupported(false);
    }
  }, []);

  // Load textures manually to handle CORS and state
  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    
    loader.load(
      getMediaUrl(src), 
      (tex) => setImageTex(tex),
      undefined,
      () => setError(true)
    );
    
    loader.load(
      getMediaUrl(depthSrc), 
      (tex) => setDepthTex(tex),
      undefined,
      () => setError(true)
    );
  }, [src, depthSrc]);

  if (error || (!imageTex && !depthTex) || !isSupported) {
    // Fallback to normal image if still loading, failed, or unsupported device
    return <img src={getMediaUrl(src)} className={`object-cover ${className}`} alt="Spatial Fallback" />;
  }

  if (!imageTex || !depthTex) {
    return <div className={`bg-black/20 animate-pulse ${className}`} />;
  }

  return (
    <div className={className}>
      <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}>
        <ParallaxPlane imageTex={imageTex} depthTex={depthTex} intensity={intensity} />
      </Canvas>
    </div>
  );
};
