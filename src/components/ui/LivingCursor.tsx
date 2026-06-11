'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Heart, Play, Maximize, Eye } from 'lucide-react';

export function LivingCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState<{ type: string; label: string } | null>(null);

  useEffect(() => {
    // Hide default cursor when we have a custom state
    if (cursorState) {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'auto';
    }
    
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [cursorState]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Find if we are hovering over an element with a data-cursor attribute
      const target = e.target as HTMLElement;
      const cursorEl = target.closest('[data-cursor]');
      
      if (cursorEl) {
        const type = cursorEl.getAttribute('data-cursor') || 'view';
        const label = cursorEl.getAttribute('data-cursor-label') || '';
        setCursorState({ type, label });
      } else {
        setCursorState(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!cursorState) return null;

  let Icon = Eye;
  let bgColor = 'bg-black/70';
  
  switch (cursorState.type) {
    case 'photo':
      Icon = Camera;
      bgColor = 'bg-cyan-500/80';
      break;
    case 'video':
      Icon = Play;
      bgColor = 'bg-purple-500/80';
      break;
    case 'family':
    case 'heart':
      Icon = Heart;
      bgColor = 'bg-pink-500/80';
      break;
    case 'expand':
      Icon = Maximize;
      bgColor = 'bg-emerald-500/80';
      break;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1, x: position.x - 20, y: position.y - 20 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
      >
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 text-white shadow-2xl ${bgColor}`}>
          <Icon className="w-3.5 h-3.5" />
          {cursorState.label && (
            <span className="text-[11px] font-bold tracking-widest uppercase whitespace-nowrap">
              {cursorState.label}
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
