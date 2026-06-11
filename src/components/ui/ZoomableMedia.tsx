import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';

interface ZoomableMediaProps {
  children: React.ReactNode;
  className?: string;
}

export function ZoomableMedia({ children, className = '' }: ZoomableMediaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const controls = useAnimation();
  
  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const toggleZoom = async (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    
    if (isZoomed) {
      setIsZoomed(false);
      await controls.start({ scale: 1, x: 0, y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } });
      scale.set(1);
      x.set(0);
      y.set(0);
    } else {
      setIsZoomed(true);
      await controls.start({ scale: 2.5, transition: { type: 'spring', damping: 25, stiffness: 200 } });
      scale.set(2.5);
    }
  };

  // Custom double tap detection for mobile
  const lastTapRef = useRef<number>(0);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    if (tapLength < 300 && tapLength > 0) {
      toggleZoom(e);
      e.preventDefault(); // prevent zoom default
    }
    lastTapRef.current = currentTime;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomed) {
        toggleZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  const [constraints, setConstraints] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    if (isZoomed && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setConstraints({
        left: -(clientWidth / 2),
        right: clientWidth / 2,
        top: -(clientHeight / 2),
        bottom: clientHeight / 2
      });
    } else {
      setConstraints({ top: 0, bottom: 0, left: 0, right: 0 });
    }
  }, [isZoomed]);

  const handleWheel = (e: React.WheelEvent) => {
    if (isZoomed) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(1, scale.get() + delta), 5);
      
      if (newScale === 1) {
        toggleZoom();
      } else {
        scale.set(newScale);
        controls.set({ scale: newScale });
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden group w-full h-full ${isZoomed ? 'z-50 rounded-lg shadow-2xl ring-4 ring-[#FF4D8D]/50 bg-black' : ''} ${className}`}
      onDoubleClick={toggleZoom}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{ touchAction: 'none' }} // Prevent browser zoom on double tap
    >
      <motion.div
        drag={isZoomed}
        dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }}
        dragElastic={0}
        dragMomentum={false}
        animate={controls}
        style={{ scale, x, y, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isZoomed ? 'grab' : 'auto' }}
        whileDrag={{ cursor: 'grabbing' }}
        className="transform-gpu origin-center"
      >
        {children}
      </motion.div>

      {/* Floating Zoom Controls */}
      <div className={`absolute bottom-4 right-4 flex gap-2 transition-opacity duration-300 ${isZoomed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button
          onClick={toggleZoom}
          className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-black/80 transition-all border border-white/10 shadow-lg"
          title={isZoomed ? "Zoom Out" : "Zoom In"}
        >
          {isZoomed ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
