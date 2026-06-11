'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LivingBackgroundProps {
  theme?: 'ocean' | 'sunset' | 'forest' | 'aurora' | 'memory';
  intensity?: 'subtle' | 'medium' | 'high';
}

export function LivingBackground({ theme = 'aurora', intensity = 'subtle' }: LivingBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Determine colors based on theme
  let colors = {
    c1: '#0ea5e9', // cyan
    c2: '#8b5cf6', // violet
    c3: '#10b981', // emerald
  };

  if (theme === 'ocean') {
    colors = { c1: '#0284c7', c2: '#0369a1', c3: '#0891b2' };
  } else if (theme === 'sunset') {
    colors = { c1: '#f97316', c2: '#e11d48', c3: '#db2777' };
  } else if (theme === 'forest') {
    colors = { c1: '#059669', c2: '#15803d', c3: '#047857' };
  } else if (theme === 'memory') {
    colors = { c1: '#6366f1', c2: '#d946ef', c3: '#ec4899' };
  }

  // Opacity based on intensity
  const opacity = intensity === 'subtle' ? 0.15 : intensity === 'medium' ? 0.3 : 0.5;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#0b0e11]">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full mix-blend-screen filter blur-[120px]"
        style={{ backgroundColor: colors.c1, opacity }}
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -60, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full mix-blend-screen filter blur-[120px]"
        style={{ backgroundColor: colors.c2, opacity }}
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 40, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] rounded-full mix-blend-screen filter blur-[120px]"
        style={{ backgroundColor: colors.c3, opacity }}
      />

      {/* Subtle grain overlay for premium texture */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
