import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryItem } from '../types/memoryWallet.types';
import { MemoryItemCard } from './MemoryItemCard';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { LivingBackground } from '@/components/ui/LivingBackground';

interface AutoStorybookProps {
  memories: MemoryItem[];
  title?: string;
  onMemoryClick?: (item: MemoryItem) => void;
  onShare?: (item: MemoryItem) => void;
  onFavorite?: (item: MemoryItem) => void;
}

export const AutoStorybook: React.FC<AutoStorybookProps> = ({ memories, title = "Memory Storybook", onMemoryClick, onShare, onFavorite }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Group memories into chapters (pages) based on location or dates
  const chapters = useMemo(() => {
    if (!memories.length) return [];
    
    // Simple heuristic: Group by location_name, or if none, chunks of 3
    const groups: { title: string; items: MemoryItem[] }[] = [];
    
    // First try grouping by location
    const byLocation = new Map<string, MemoryItem[]>();
    memories.forEach(m => {
      const loc = m.location_name || 'Uncharted Moments';
      if (!byLocation.has(loc)) byLocation.set(loc, []);
      byLocation.get(loc)!.push(m);
    });

    if (byLocation.size > 1) {
      Array.from(byLocation.entries()).forEach(([loc, items]) => {
        // split very large locations into multiple pages
        for (let i = 0; i < items.length; i += 4) {
          groups.push({
            title: i === 0 ? loc : `${loc} (Part ${Math.floor(i/4) + 2})`,
            items: items.slice(i, i + 4)
          });
        }
      });
    } else {
      // If everything is same location or no location, chunk chronologically
      const sorted = [...memories].sort((a, b) => new Date(a.memory_date || a.created_at).getTime() - new Date(b.memory_date || b.created_at).getTime());
      for (let i = 0; i < sorted.length; i += 4) {
        groups.push({
          title: `Chapter ${Math.floor(i/4) + 1}`,
          items: sorted.slice(i, i + 4)
        });
      }
    }

    return groups;
  }, [memories]);

  if (chapters.length === 0) return null;

  const nextPage = () => {
    if (currentPageIndex < chapters.length - 1) setCurrentPageIndex(p => p + 1);
  };

  const prevPage = () => {
    if (currentPageIndex > 0) setCurrentPageIndex(p => p - 1);
  };

  const currentChapter = chapters[currentPageIndex];

  return (
    <div className="w-full relative min-h-[60vh] bg-[#050816]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 md:p-8 flex items-center justify-between z-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-[#FF4D8D] to-[#8B5CF6] rounded-xl shadow-[0_0_15px_rgba(255,77,141,0.5)]">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-wide">{title}</h2>
            <p className="text-[#00E5FF] text-sm font-bold tracking-widest uppercase">Auto Storybook Mode</p>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-sm font-bold">
            Page {currentPageIndex + 1} of {chapters.length}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={prevPage} 
              disabled={currentPageIndex === 0}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:scale-105 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextPage} 
              disabled={currentPageIndex === chapters.length - 1}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FF4D8D]/20 hover:border-[#FF4D8D] hover:scale-105 hover:shadow-[0_0_15px_rgba(255,77,141,0.5)] transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Book Container with Page Turn Effect */}
      <div className="flex-1 relative z-10 p-6 md:p-12 overflow-hidden perspective-1000 flex items-center justify-center">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageIndex}
            initial={{ rotateY: 90, opacity: 0, transformOrigin: "left" }}
            animate={{ rotateY: 0, opacity: 1, transformOrigin: "left" }}
            exit={{ rotateY: -90, opacity: 0, transformOrigin: "left" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
            className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl flex flex-col"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Page Header (Chapter Title) */}
            <div className="mb-10 text-center relative">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2"></div>
              <span className="relative inline-block px-8 py-2 bg-[#0B0F19] rounded-full border border-white/10 text-white/80 font-serif text-2xl italic tracking-wider">
                {currentChapter.title}
              </span>
            </div>

            {/* Layout based on item count */}
            <div className={`grid gap-6 ${
              currentChapter.items.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 
              currentChapter.items.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
              currentChapter.items.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 
              'grid-cols-2 md:grid-cols-4'
            }`}>
              {currentChapter.items.map((item, idx) => (
                <motion.div 
                  key={item.id} 
                  className={`w-full ${currentChapter.items.length <= 2 ? 'aspect-square' : 'aspect-[4/5]'}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + (idx * 0.1), type: "spring" }}
                >
                  <MemoryItemCard 
                    item={item} 
                    onClick={() => onMemoryClick?.(item)}
                    onShare={onShare}
                    onFavorite={onFavorite}
                  />
                </motion.div>
              ))}
            </div>

            {/* Page Number Footer */}
            <div className="mt-12 text-center text-white/20 font-serif italic">
              — {currentPageIndex + 1} —
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};
