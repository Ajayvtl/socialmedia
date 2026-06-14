import React, { useState, useEffect } from 'react';
import { MemoryItem } from '../types/memoryWallet.types';
import { X, Calendar, MapPin, Users, Heart, Share2, ZoomIn } from 'lucide-react';
import { ZoomableMedia } from '@/components/ui/ZoomableMedia';
import { getMediaUrl } from '@/lib/api';
import { SpatialPhoto } from '@/components/ui/SpatialPhoto';

interface MemoryFocusModalProps {
  item: MemoryItem | null;
  onClose: () => void;
  onShare?: (item: MemoryItem) => void;
  onFavorite?: (item: MemoryItem) => void;
}

export const MemoryFocusModal: React.FC<MemoryFocusModalProps> = ({ item, onClose, onShare, onFavorite }) => {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (item) {
      setIsFav(!!item.is_favorite);
    }
  }, [item]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8" onClick={onClose}>
      <button 
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        className="w-full max-w-6xl h-full max-h-[85vh] bg-[#050816] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Media Viewer */}
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          <ZoomableMedia className="w-full h-full flex items-center justify-center">
            {item.memory_type === 'video' ? (
              <video 
                src={getMediaUrl(item.url || '')} 
                controls 
                controlsList="nodownload"
                autoPlay 
                className="max-w-full max-h-full object-contain"
              />
            ) : item.depth_map_url ? (
              <div className="w-full h-full flex items-center justify-center">
                <SpatialPhoto 
                  src={getMediaUrl(item.url || item.thumbnail_url || '')} 
                  depthSrc={getMediaUrl(item.depth_map_url)} 
                  className="w-full h-full max-w-full max-h-full"
                />
              </div>
            ) : (
              <img 
                src={getMediaUrl(item.url || item.thumbnail_url || '')} 
                alt={item.title || ''} 
                className="max-w-full max-h-full object-contain"
              />
            )}
          </ZoomableMedia>
          <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-none z-10">
             <div className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white/80 text-xs font-bold flex items-center gap-1">
               <ZoomIn className="w-3 h-3" /> Double tap to zoom
             </div>
          </div>
        </div>

        {/* Right Side: Context & Metadata */}
        <div className="w-full md:w-[350px] lg:w-[400px] bg-[#0B0F19] p-6 md:p-8 flex flex-col shrink-0 overflow-y-auto custom-scrollbar border-l border-white/5 relative z-20">
          
          {item.relationship_name && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <Heart className="w-12 h-12 text-[#FF4D8D]" fill="#FF4D8D" />
              </div>
              <p className="text-[10px] text-[#FF4D8D] font-bold uppercase tracking-widest mb-1">{item.relationship_type || 'Connection'}</p>
              <h3 className="text-xl font-black text-white mb-2">{item.relationship_name}</h3>
              <p className="text-white/50 text-xs mb-3">View your complete chronological journey together in the Family Graph.</p>
              <button 
                onClick={() => {
                  onClose();
                }}
                className="text-xs font-bold text-[#00E5FF] hover:text-white transition-colors"
              >
                View Relationship Timeline →
              </button>
            </div>
          )}

          <h2 className="text-2xl font-black text-white mb-2">{item.title || "Memory"}</h2>
          {item.caption && <p className="text-white/60 text-sm mb-6">{item.caption}</p>}
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-[#FF4D8D]/20 flex items-center justify-center text-[#FF4D8D]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Date Added</p>
                <p className="text-sm text-white font-medium">
                  {new Date(item.memory_date || item.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {item.location_name && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Location</p>
                  <p className="text-sm text-white font-medium">{item.location_name}</p>
                </div>
              </div>
            )}

            {item.circle_id && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Connected Circle</p>
                  <p className="text-sm text-white font-medium">Memory Circle #{item.circle_id}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-8 flex gap-3">
             <button 
               onClick={() => { setIsFav(!isFav); onFavorite?.(item); }}
               className={`flex-1 py-3 border rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${isFav ? 'bg-[#FF4D8D]/20 border-[#FF4D8D]/50 text-[#FF4D8D]' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'}`}
             >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-[#FF4D8D]' : ''}`} /> {isFav ? 'Favorited' : 'Favorite'}
             </button>
             <button 
               onClick={() => onShare?.(item)}
               className="flex-1 py-3 bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] hover:opacity-90 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-opacity shadow-lg"
             >
                <Share2 className="w-5 h-5" /> Share
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
