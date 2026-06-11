"use client";
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import { Play, Eye, Heart, Compass, Search } from 'lucide-react';

export const CustomCursor = () => {
  const { variant, text } = useCursor();
  const [isVisible, setIsVisible] = useState(false);

  // Use motion values for raw mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth the mouse position with spring physics
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only show on non-touch devices
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setIsVisible(true);
      document.body.style.cursor = 'none'; // Hide default cursor globally
      
      const handleMouseMove = (e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      };

      // Add a class to interactive elements to hide their cursor too
      const style = document.createElement('style');
      style.id = 'living-cursor-styles';
      style.innerHTML = `
        * { cursor: none !important; }
      `;
      document.head.appendChild(style);

      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        document.body.style.cursor = 'auto';
        const styleEl = document.getElementById('living-cursor-styles');
        if (styleEl) styleEl.remove();
      };
    }
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  const variants = {
    default: {
      width: 12,
      height: 12,
      backgroundColor: 'rgba(255, 255, 255, 1)',
      border: '0px solid rgba(255,255,255,0)',
      x: '-50%',
      y: '-50%',
      mixBlendMode: 'difference' as const,
    },
    view: {
      width: 72,
      height: 72,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(4px)',
      x: '-50%',
      y: '-50%',
      mixBlendMode: 'normal' as const,
    },
    play: {
      width: 80,
      height: 80,
      backgroundColor: 'rgba(0, 229, 255, 0.15)',
      border: '1px solid rgba(0, 229, 255, 0.6)',
      backdropFilter: 'blur(8px)',
      x: '-50%',
      y: '-50%',
      mixBlendMode: 'normal' as const,
    },
    love: {
      width: 64,
      height: 64,
      backgroundColor: 'rgba(255, 77, 141, 0.15)',
      border: '1px solid rgba(255, 77, 141, 0.6)',
      backdropFilter: 'blur(4px)',
      x: '-50%',
      y: '-50%',
      mixBlendMode: 'normal' as const,
    },
    explore: {
      width: 72,
      height: 72,
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
      border: '1px solid rgba(139, 92, 246, 0.6)',
      backdropFilter: 'blur(4px)',
      x: '-50%',
      y: '-50%',
      mixBlendMode: 'normal' as const,
    },
    zoom: {
      width: 64,
      height: 64,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(2px)',
      x: '-50%',
      y: '-50%',
      mixBlendMode: 'normal' as const,
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center overflow-hidden"
      style={{
        x: smoothX,
        y: smoothY,
      }}
      variants={variants}
      animate={variant}
      transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.5 }}
    >
      <motion.div 
        className="flex flex-col items-center justify-center text-white"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: variant === 'default' ? 0 : 1, scale: variant === 'default' ? 0.5 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {variant === 'view' && <Eye className="w-5 h-5 mb-0.5" />}
        {variant === 'play' && <Play className="w-5 h-5 mb-0.5" />}
        {variant === 'love' && <Heart className="w-5 h-5 mb-0.5 fill-current text-[#FF4D8D]" />}
        {variant === 'explore' && <Compass className="w-5 h-5 mb-0.5" />}
        {variant === 'zoom' && <Search className="w-5 h-5 mb-0.5" />}
        {text && <span className="text-[10px] font-bold tracking-wider uppercase whitespace-nowrap">{text}</span>}
      </motion.div>
    </motion.div>
  );
};
