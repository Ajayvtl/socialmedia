"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface SpatialPhotoProps {
  src: string;
  depthSrc: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  active?: boolean; // If true, parallax is active (for performance saving)
}

function ParallaxPlane({ src, depthSrc, active }: { src: string; depthSrc: string; active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Custom shader for depth-based parallax
  const { vertexShader, fragmentShader } = useMemo(() => {
    return {
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uImage;
        uniform sampler2D uDepthMap;
        uniform vec2 uMouse;
        uniform float uIntensity;
        varying vec2 vUv;

        void main() {
          // Sample depth map (assumes grayscale, where closer is white)
          vec4 depthColor = texture2D(uDepthMap, vUv);
          float depthValue = depthColor.r;

          // Parallax calculation
          // Invert depth mapping if needed based on the MiDaS output. Usually white is foreground.
          vec2 parallaxOffset = uMouse * uIntensity * depthValue;
          
          vec2 newUv = vUv + parallaxOffset;
          
          // Clamp UVs to prevent repeating artifacts at edges
          newUv = clamp(newUv, 0.0, 1.0);

          vec4 finalColor = texture2D(uImage, newUv);
          gl_FragColor = finalColor;
        }
      `
    };
  }, []);

  const [imageTex, depthTex] = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const iTex = loader.load(src);
    const dTex = loader.load(depthSrc);
    // Keep color space correct
    iTex.colorSpace = THREE.SRGBColorSpace;
    return [iTex, dTex];
  }, [src, depthSrc]);

  const uniforms = useMemo(() => ({
    uImage: { value: imageTex },
    uDepthMap: { value: depthTex },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uIntensity: { value: 0.03 } // Parallax strength
  }), [imageTex, depthTex]);

  const { size, viewport } = useThree();
  const scale = [viewport.width, viewport.height, 1];

  // Map mouse or device gyro to parallax
  const targetMouse = useRef(new THREE.Vector2(0, 0));
  
  useEffect(() => {
    if (!active) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1
      targetMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      // Gamma is left-to-right (approx -90 to 90)
      // Beta is front-to-back (approx -180 to 180)
      if (e.gamma !== null && e.beta !== null) {
        let x = e.gamma / 45; // clamp
        let y = (e.beta - 45) / 45; // assume standard holding angle
        targetMouse.current.x = Math.max(-1, Math.min(1, x));
        targetMouse.current.y = -Math.max(-1, Math.min(1, y));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("deviceorientation", handleDeviceOrientation);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [active]);

  useFrame((state, delta) => {
    if (!active || !materialRef.current) return;
    // Smooth dampening
    materialRef.current.uniforms.uMouse.value.lerp(targetMouse.current, delta * 5);
  });

  return (
    <mesh ref={meshRef} scale={scale as any}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export function SpatialPhoto({ src, depthSrc, width = "100%", height = "400px", className = "", active = true }: SpatialPhotoProps) {
  return (
    <div style={{ width, height }} className={`relative overflow-hidden ${className}`}>
      <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
        <ParallaxPlane src={src} depthSrc={depthSrc} active={active} />
      </Canvas>
    </div>
  );
}
