import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryItem } from '../types/memoryWallet.types';
import { AppImage } from '@/components/ui/AppImage';
import { Play, Pause, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { ZoomableMedia } from '@/components/ui/ZoomableMedia';
import { SpatialPhoto } from '@/components/ui/SpatialPhoto';

interface LifePlaybackProps {
  memories: MemoryItem[];
  onMemoryClick?: (memory: MemoryItem) => void;
}

export const LifePlayback: React.FC<LifePlaybackProps> = ({ memories, onMemoryClick }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeYear, setActiveYear] = useState<number | null>(null);

  // Group memories by year
  const memoriesByYear = useMemo(() => {
    const grouped = new Map<number, MemoryItem[]>();
    memories.forEach(m => {
      const dateStr = m.memory_date || m.created_at;
      if (!dateStr) return;
      const year = new Date(dateStr).getFullYear();
      if (!grouped.has(year)) grouped.set(year, []);
      grouped.get(year)!.push(m);
    });
    return grouped;
  }, [memories]);

  const sortedYears = useMemo(() => {
    return Array.from(memoriesByYear.keys()).sort((a, b) => a - b);
  }, [memoriesByYear]);

  // Set initial active year
  React.useEffect(() => {
    if (sortedYears.length > 0 && activeYear === null) {
      setActiveYear(sortedYears[sortedYears.length - 1]);
    }
  }, [sortedYears, activeYear]);

  // Playback Logic
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && sortedYears.length > 0) {
      interval = setInterval(() => {
        setActiveYear(current => {
          if (!current) return sortedYears[0];
          const currentIndex = sortedYears.indexOf(current);
          if (currentIndex < sortedYears.length - 1) {
            return sortedYears[currentIndex + 1];
          } else {
            setIsPlaying(false);
            return current;
          }
        });
      }, 3000); // 3 seconds per year
    }
    return () => clearInterval(interval);
  }, [isPlaying, sortedYears]);

  if (sortedYears.length === 0) return null;

  const activeMemories = activeYear ? memoriesByYear.get(activeYear) || [] : [];

  return (
    <div className="w-full bg-[#0B0F19] border border-white/5 rounded-3xl overflow-hidden mb-8 shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E5FF] via-[#8B5CF6] to-[#FF4D8D]"></div>
      
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              Life Journey Timeline
              <span className="text-xs font-bold px-2 py-1 bg-white/10 text-[#00E5FF] rounded-lg tracking-wider">PLAYBACK</span>
            </h2>
            <p className="text-white/50 text-sm mt-1">Scrub through the years to see your living memories.</p>
          </div>

          <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-2xl border border-white/10">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-white hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                {activeYear}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{activeMemories.length} Memories</span>
            </div>
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="relative pt-6 pb-8 px-4">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-white/10 rounded-full -translate-y-1/2"></div>
          <div className="flex justify-between items-center relative z-10">
            {sortedYears.map((year, idx) => {
              const isActive = year === activeYear;
              return (
                <div key={year} className="flex flex-col items-center group cursor-pointer" onClick={() => { setActiveYear(year); setIsPlaying(false); }}>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${isActive ? 'bg-[#FF4D8D] border-[#FF4D8D] scale-150 shadow-[0_0_15px_rgba(255,77,141,0.6)]' : 'bg-[#0B0F19] border-white/30 group-hover:border-white/60 group-hover:scale-125'}`} />
                  <span className={`absolute mt-6 text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}>
                    {year}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress Bar Fill */}
          <div 
            className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-[#00E5FF] to-[#FF4D8D] rounded-full -translate-y-1/2 transition-all duration-500"
            style={{ 
              width: `${sortedYears.indexOf(activeYear!) / (sortedYears.length - 1 || 1) * 100}%`,
              marginLeft: '16px',
              marginRight: '16px',
              maxWidth: 'calc(100% - 32px)'
            }}
          ></div>
        </div>

        {/* Memories Display */}
        <div className="mt-4 bg-black/20 rounded-2xl p-4 min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeYear}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar"
            >
              {activeMemories.map(item => (
                <div key={item.id} onClick={() => onMemoryClick && onMemoryClick(item)} className="min-w-[200px] max-w-[200px] aspect-[4/5] shrink-0 snap-start relative group rounded-2xl overflow-hidden border border-white/10 cursor-pointer">
                  {item.memory_type === 'video' || item.memory_type === 'photo' ? (
                     item.depth_map_url ? (
                       <SpatialPhoto 
                         src={item.thumbnail_url || item.url || ''} 
                         depthSrc={item.depth_map_url} 
                         className="w-full h-full"
                         intensity={0.03} // Subtle intensity for small cards
                       />
                     ) : (
                       <ZoomableMedia className="w-full h-full">
                         <AppImage src={item.thumbnail_url || item.url || ''} alt={item.title || ''} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       </ZoomableMedia>
                     )
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-sm font-bold text-white line-clamp-2">{item.title || item.location_name || "Memory"}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
