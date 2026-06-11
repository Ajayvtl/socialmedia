import React, { useRef } from 'react';
import { MemoryItem } from '../types/memoryWallet.types';
import { AppImage } from '@/components/ui/AppImage';
import { Play, FileText, Lock, Globe, Users, Star, MoreVertical, Edit2, Trash2, Share2 } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Props {
  item: MemoryItem;
  onClick?: () => void;
  onEdit?: (item: MemoryItem) => void;
  onShare?: (item: MemoryItem) => void;
  onDelete?: (item: MemoryItem) => void;
  onFavorite?: (item: MemoryItem) => void;
}

export const MemoryItemCard: React.FC<Props> = ({ item, onClick, onEdit, onShare, onDelete, onFavorite }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isFav, setIsFav] = React.useState(item.is_favorite);
  const ref = useRef<HTMLDivElement>(null);

  // Motion values for tracking mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for fluid animation
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Map mouse coordinates to rotation (subtle 3D tilt)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  
  // Dynamic Glare
  const glareOpacity = useTransform(mouseXSpring, [-0.5, 0.5], [0, 0.5]);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);

  const getVisibilityIcon = () => {
    switch (item.visibility) {
      case 'private': return <Lock className="w-3.5 h-3.5" />;
      case 'circle': return <Users className="w-3.5 h-3.5" />;
      case 'vault': return <Globe className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative aspect-square rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] md:cursor-none hover:border-[var(--color-primary)] transition-colors shadow-lg hover:shadow-2xl"
      data-cursor={item.memory_type === 'video' ? 'video' : 'photo'}
      data-cursor-label={item.memory_type === 'video' ? 'Play Video' : 'View Memory'}
      animate={{
        boxShadow: [
          "0px 4px 20px rgba(0, 0, 0, 0.1)",
          "0px 4px 25px rgba(0, 229, 255, 0.15)",
          "0px 4px 20px rgba(0, 0, 0, 0.1)"
        ]
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        boxShadow: { duration: 4 + Math.random() * 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
      }}
      whileHover={{ scale: 1.05, zIndex: 10, transition: { duration: 0.2 } }}
    >
      {/* Glare Effect */}
      <motion.div 
        className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay"
        style={{
          opacity: glareOpacity,
          background: `linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.8) 25%, transparent 30%)`,
          x: glareX,
        }}
      />

      {/* Media Content */}
      <div className="w-full h-full relative" style={{ transform: "translateZ(20px)" }}>
        {(item.memory_type === 'photo' || item.memory_type === 'video') ? (
          <AppImage
            src={item.thumbnail_url || item.url || ''}
            alt={item.title || 'Memory'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-surface-hover)]">
            <FileText className="w-12 h-12 text-[var(--color-text-muted)] mb-2" />
            <span className="text-xs text-[var(--color-text-secondary)] font-medium capitalize">
              {item.memory_type.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Video Indicator */}
      {item.memory_type === 'video' && (
        <div className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-sm rounded-full" style={{ transform: "translateZ(30px)" }}>
          <Play className="w-4 h-4 text-white fill-white" />
        </div>
      )}

      {/* Top Action Bar (Always visible on mobile, hover on desktop) */}
      <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/60 to-transparent z-30 pointer-events-auto" style={{ transform: "translateZ(30px)" }}>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFav(!isFav); onFavorite?.(item); }}
          className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors"
        >
          <Star className={`w-4 h-4 ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`} />
        </button>
        
        <div className="flex flex-col gap-2 relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors text-white"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {/* Dropdown Menu (controlled by click state) */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl flex flex-col p-1 z-50">
              <div 
                className="px-3 py-2 text-xs font-medium text-white hover:bg-[var(--color-surface-hover)] rounded-lg flex items-center gap-2 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onEdit?.(item); }}
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Details
              </div>
              <div 
                className="px-3 py-2 text-xs font-medium text-white hover:bg-[var(--color-surface-hover)] rounded-lg flex items-center gap-2 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onShare?.(item); }}
              >
                <Share2 className="w-3.5 h-3.5" /> Share as Post
              </div>
              <div 
                className="px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete?.(item); }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Memory
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay Details (Always visible on mobile, hover on desktop) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
        {item.title && (
          <h4 className="text-white font-medium text-sm line-clamp-1 mb-1">{item.title}</h4>
        )}
        <div className="flex items-center gap-3 text-xs text-white/70">
          <div className="flex items-center gap-1">
            {getVisibilityIcon()}
            <span className="capitalize">{item.visibility}</span>
          </div>
          {item.memory_date && (
            <span>{new Date(item.memory_date).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
