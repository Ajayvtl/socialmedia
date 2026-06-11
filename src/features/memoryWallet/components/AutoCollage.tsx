import React, { useMemo } from 'react';
import { MemoryItem } from '../types/memoryWallet.types';
import { useCollageTemplates } from '../hooks/useMemoryWallet';
import { MemoryItemCard } from './MemoryItemCard';
import { motion } from 'framer-motion';

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
    
    // Sort templates by priority desc
    const sorted = [...templates].sort((a, b) => b.priority - a.priority);
    
    // Find the first template that fits the memory count
    const match = sorted.find(t => memories.length >= t.min_items && memories.length <= t.max_items);
    
    return match || sorted[sorted.length - 1]; // Fallback to lowest priority if no match
  }, [templates, memories.length]);

  if (isLoading) {
    return <div className="w-full h-32 flex items-center justify-center text-white/50 animate-pulse">Loading Auto Collage...</div>;
  }

  if (!selectedTemplate || memories.length === 0) {
    // Fallback to standard grid if no templates or memories
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {memories.map(m => (
          <div key={m.id} className="w-full aspect-[4/5]">
            <MemoryItemCard item={m} onClick={() => onMemoryClick?.(m)} onShare={onShare} onFavorite={onFavorite} />
          </div>
        ))}
      </div>
    );
  }

  // Apply template logic
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

  // Grid / Bento Box approach
  const gridClass = config.cssClass || "grid grid-cols-2 md:grid-cols-4 gap-4";
  const itemsConfig = config.items || [];

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {memories.map((m, idx) => {
        // Find matching item config, fallback to default span if out of configured items
        const itemLayout = itemsConfig[idx % itemsConfig.length] || { colSpan: 'col-span-1', rowSpan: 'row-span-1' };
        
        return (
          <motion.div 
            key={m.id} 
            className={`${itemLayout.colSpan} ${itemLayout.rowSpan} overflow-hidden rounded-2xl w-full h-full min-h-[200px]`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300 }}
          >
            {/* We override the inner wrapper aspect ratio if necessary by passing custom styles, but MemoryItemCard manages its own */}
            <div className="w-full h-full relative">
               <MemoryItemCard item={m} onClick={() => onMemoryClick?.(m)} onShare={onShare} onFavorite={onFavorite} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
