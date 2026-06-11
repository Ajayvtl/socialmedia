import React, { useMemo } from 'react';
import { MemoryItem } from '../types/memoryWallet.types';
import { useCollageTemplates } from '../hooks/useMemoryWallet';
import { MemoryItemCard } from './MemoryItemCard';
import { motion } from 'framer-motion';
import { BentoGrid, BentoItem } from '@/components/ui/BentoGrid';

interface AutoCollageProps {
  memories: MemoryItem[];
  onMemoryClick?: (item: MemoryItem) => void;
  onShare?: (item: MemoryItem) => void;
  onFavorite?: (item: MemoryItem) => void;
}

export const AutoCollage: React.FC<AutoCollageProps> = ({ memories, onMemoryClick, onShare, onFavorite }) => {
  const { data: templates = [], isLoading } = useCollageTemplates();

  const selectedTemplate = useMemo(() => {
    if (templates.length === 0 || memories.length === 0) return null;
    const sorted = [...templates].sort((a, b) => b.priority - a.priority);
    const match = sorted.find(t => memories.length >= t.min_items && memories.length <= t.max_items);
    return match || sorted[sorted.length - 1];
  }, [templates, memories.length]);

  if (isLoading) {
    return <div className="w-full h-32 flex items-center justify-center text-white/50 animate-pulse">Loading Auto Collage...</div>;
  }

  // Smart Bento Grid Generator based on memory types
  const renderBentoCollage = () => {
    return (
      <BentoGrid stagger={true} className="auto-rows-[minmax(200px,280px)]">
        {memories.map((m, idx) => {
          // Intelligent sizing logic
          let colSpan: 1 | 2 | 3 | 4 = 1;
          let rowSpan: 1 | 2 = 1;

          // Video or primary memories take up more space
          if (m.memory_type === 'video' || idx === 0) {
            colSpan = 2;
            rowSpan = 2;
          } else if (idx % 5 === 0) {
            colSpan = 2; // Landscape block
            rowSpan = 1;
          } else if (idx % 4 === 0) {
            colSpan = 1;
            rowSpan = 2; // Portrait block
          }

          return (
            <BentoItem 
              key={m.id} 
              colSpan={colSpan} 
              rowSpan={rowSpan} 
              className="p-0 border-0 bg-transparent shadow-none"
            >
              <div className="w-full h-full relative">
                 <MemoryItemCard item={m} onClick={() => onMemoryClick?.(m)} onShare={onShare} onFavorite={onFavorite} />
              </div>
            </BentoItem>
          );
        })}
      </BentoGrid>
    );
  };

  if (!selectedTemplate || memories.length === 0) {
    // If no templates match, use the smart auto bento grid
    return renderBentoCollage();
  }

  // Apply template logic if a specific admin template is matched
  const config = typeof selectedTemplate.layout_config === 'string' 
    ? JSON.parse(selectedTemplate.layout_config) 
    : selectedTemplate.layout_config;

  const isMasonry = config.type === 'masonry';

  if (isMasonry) {
    return (
      <div className={config.cssClass || "columns-2 md:columns-3 gap-4 space-y-4"}>
        {memories.map((m, idx) => (
          <motion.div 
            key={m.id} 
            className="break-inside-avoid mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <MemoryItemCard item={m} onClick={() => onMemoryClick?.(m)} onShare={onShare} onFavorite={onFavorite} />
          </motion.div>
        ))}
      </div>
    );
  }

  return renderBentoCollage();
};
