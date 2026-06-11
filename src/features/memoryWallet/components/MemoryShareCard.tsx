import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Lock, Sparkles, Heart, Camera, Calendar, Play } from 'lucide-react';
import { getMediaUrl } from '@/lib/api';

interface MemoryShareCardProps {
  title: string;
  relationshipName?: string;
  stats: {
    yearsTogether?: number;
    memories: number;
    trips?: number;
    events?: number;
    videos?: number;
  };
  photos: string[]; // array of media_urls for the collage
  onShare: () => void;
  onClose: () => void;
}

export function MemoryShareCard({
  title,
  relationshipName,
  stats,
  photos,
  onShare,
  onClose
}: MemoryShareCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Auto-breathing / cycling collage effect
  useEffect(() => {
    if (photos.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % Math.min(photos.length, 5)); // cycle top 5
    }, 4000);
    return () => clearInterval(interval);
  }, [photos]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md relative">
        
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
        
        <div className="relative bg-[#0b0e11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Header Close */}
          <div className="absolute top-4 right-4 z-20">
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white border border-white/10">
              ✕
            </button>
          </div>

          {/* Dynamic Image Canvas */}
          <div className="h-72 w-full relative overflow-hidden bg-black flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src={getMediaUrl(photos[activeImageIndex] || '')}
                alt="Memory Collage"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {/* Gradient Overlay for Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e11] via-[#0b0e11]/40 to-transparent"></div>
            
            {/* Context Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">Aurora Smart Card</span>
            </div>
            
            {/* Dynamic Title */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              {relationshipName && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{relationshipName}</span>
                </div>
              )}
              <h2 className="text-2xl font-bold text-white drop-shadow-lg leading-tight">{title}</h2>
            </div>
          </div>

          {/* Stats Section */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {stats.yearsTogether && (
                <div className="bg-[#161a20] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Heart className="w-5 h-5 text-pink-500 mb-2" />
                  <span className="text-xl font-bold text-white">{stats.yearsTogether}</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest">Years Together</span>
                </div>
              )}
              
              <div className="bg-[#161a20] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <Camera className="w-5 h-5 text-cyan-500 mb-2" />
                <span className="text-xl font-bold text-white">{stats.memories}</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Memories</span>
              </div>

              {stats.events && (
                <div className="bg-[#161a20] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Calendar className="w-5 h-5 text-purple-500 mb-2" />
                  <span className="text-xl font-bold text-white">{stats.events}</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest">Shared Events</span>
                </div>
              )}

              {stats.trips ? (
                <div className="bg-[#161a20] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-white mb-1">✈️</span>
                  <span className="text-xl font-bold text-white">{stats.trips}</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest">Adventures</span>
                </div>
              ) : stats.videos ? (
                <div className="bg-[#161a20] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Play className="w-5 h-5 text-emerald-500 mb-2" />
                  <span className="text-xl font-bold text-white">{stats.videos}</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest">Videos</span>
                </div>
              ) : null}
            </div>

            <button
              onClick={onShare}
              className="w-full relative group overflow-hidden rounded-xl bg-white text-black font-bold py-3.5 px-4 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Share2 className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Share Moment Card</span>
            </button>
            <p className="text-[10px] text-center text-white/40 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Encrypted Link Generation
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
