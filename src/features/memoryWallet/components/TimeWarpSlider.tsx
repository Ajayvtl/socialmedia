'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeWarpSliderProps {
  years: number[];
  currentYear: number;
  onChange: (year: number) => void;
}

export function TimeWarpSlider({ years, currentYear, onChange }: TimeWarpSliderProps) {
  const sortedYears = [...years].sort((a, b) => a - b);
  
  if (sortedYears.length < 2) return null; // Need at least two years to warp time

  const minYear = sortedYears[0];
  const maxYear = sortedYears[sortedYears.length - 1];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl z-40">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#848e9c]">Time Warp</span>
          <motion.div
            key={currentYear}
            initial={{ y: -10, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="px-4 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full"
          >
            <span className="text-xl font-bold text-white tracking-widest drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              {currentYear}
            </span>
          </motion.div>
        </div>

        <div className="relative flex items-center h-8">
          <input
            type="range"
            min={minYear}
            max={maxYear}
            step={1}
            value={currentYear}
            onChange={handleSliderChange}
            className="w-full h-2 bg-white/10 rounded-full appearance-none outline-none cursor-ew-resize relative z-10"
            style={{
              background: `linear-gradient(to right, #06b6d4 0%, #a855f7 ${((currentYear - minYear) / (maxYear - minYear)) * 100}%, rgba(255,255,255,0.1) ${((currentYear - minYear) / (maxYear - minYear)) * 100}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
          
          <style dangerouslySetInnerHTML={{
            __html: `
              input[type='range']::-webkit-slider-thumb {
                appearance: none;
                width: 24px;
                height: 24px;
                background: white;
                border-radius: 50%;
                border: 4px solid #a855f7;
                cursor: ew-resize;
                box-shadow: 0 0 20px rgba(168,85,247,0.8);
                transition: transform 0.1s;
              }
              input[type='range']::-webkit-slider-thumb:hover {
                transform: scale(1.2);
              }
            `
          }} />

          {/* Timeline markers */}
          <div className="absolute inset-0 flex justify-between items-center pointer-events-none px-2 opacity-40">
            {sortedYears.map((year, i) => (
              <div 
                key={year} 
                className="flex flex-col items-center"
                style={{ position: 'absolute', left: `${((year - minYear) / (maxYear - minYear)) * 100}%`, transform: 'translateX(-50%)' }}
              >
                <div className={`w-1 h-1 rounded-full ${currentYear >= year ? 'bg-white' : 'bg-white/30'}`} />
                {/* Only show years that don't crowd too much, or first/last */}
                {(i === 0 || i === sortedYears.length - 1 || sortedYears.length <= 5) && (
                  <span className="text-[9px] mt-2 text-white/50">{year}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
