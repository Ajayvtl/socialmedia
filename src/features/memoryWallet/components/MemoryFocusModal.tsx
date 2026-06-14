import React, { useState, useEffect } from 'react';
import { MemoryItem } from '../types/memoryWallet.types';
import { X, Calendar, MapPin, Users, Heart, Share2, ZoomIn, Plus, UserPlus, Loader2 } from 'lucide-react';
import { ZoomableMedia } from '@/components/ui/ZoomableMedia';
import api, { getMediaUrl } from '@/lib/api';
import { SpatialPhoto } from '@/components/ui/SpatialPhoto';
import toast from 'react-hot-toast';

interface MemoryFocusModalProps {
  item: MemoryItem | null;
  onClose: () => void;
  onShare?: (item: MemoryItem) => void;
  onFavorite?: (item: MemoryItem) => void;
}

interface SharedData {
  memory: any;
  people: any[];
  stats: {
    people_count: number;
  };
}

export const MemoryFocusModal: React.FC<MemoryFocusModalProps> = ({ item, onClose, onShare, onFavorite }) => {
  const [isFav, setIsFav] = useState(false);
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [loadingShared, setLoadingShared] = useState(false);
  const [availableConnections, setAvailableConnections] = useState<any[]>([]);
  const [isTagSelectorOpen, setIsTagSelectorOpen] = useState(false);

  useEffect(() => {
    if (item) {
      setIsFav(!!item.is_favorite);
      loadSharedData();
      loadConnections();
    }
  }, [item]);

  const loadSharedData = async () => {
    if (!item) return;
    try {
      setLoadingShared(true);
      const res = await api.get(`/shared-memories/${item.id}/shared`);
      setSharedData(res.data?.data || null);
    } catch (e) {
      console.error("Failed to load shared memory data:", e);
    } finally {
      setLoadingShared(false);
    }
  };

  const loadConnections = async () => {
    try {
      const res = await api.get('/family-graph/me');
      const data = res.data?.data;
      const list = [
        ...(data?.relationships || []).map((r: any) => ({
          id: r.related_user_id || r.id,
          name: r.related_name || r.display_name || r.name,
          avatar: r.avatar_url,
          relationship: r.relationship_type
        })),
        ...(data?.connections || []).map((c: any) => ({
          id: c.connection_id || c.id,
          name: c.display_name || c.username,
          avatar: c.avatar_url,
          relationship: 'connection'
        }))
      ].filter((p, index, self) => p.id && self.findIndex(o => o.id === p.id) === index);
      setAvailableConnections(list);
    } catch (e) {
      console.error("Failed to load connections:", e);
    }
  };

  const handleTagPerson = async (userId: number) => {
    if (!item) return;
    try {
      await api.post(`/shared-memories/${item.id}/tags`, {
        user_ids: [userId]
      });
      toast.success("Tagged in memory!");
      setIsTagSelectorOpen(false);
      loadSharedData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to tag user");
    }
  };

  const handleRemoveTag = async (userId: number) => {
    if (!item) return;
    try {
      await api.delete(`/shared-memories/${item.id}/tags/${userId}`);
      toast.success("Tag removed");
      loadSharedData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove tag");
    }
  };

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
        <div className="w-full md:w-[400px] lg:w-[450px] bg-[#0B0F19] p-6 md:p-8 flex flex-col shrink-0 overflow-y-auto custom-scrollbar border-l border-white/5 relative z-20">
          
          {item.relationship_name && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <Heart className="w-12 h-12 text-[#FF4D8D]" fill="#FF4D8D" />
              </div>
              <p className="text-[10px] text-[#FF4D8D] font-bold uppercase tracking-widest mb-1">{item.relationship_type || 'Connection'}</p>
              <h3 className="text-xl font-black text-white mb-2">{item.relationship_name}</h3>
              <p className="text-white/50 text-xs mb-3">View your complete chronological journey together in the Family Graph.</p>
              <button 
                onClick={onClose}
                className="text-xs font-bold text-[#00E5FF] hover:text-white transition-colors"
              >
                View Relationship Timeline →
              </button>
            </div>
          )}

          <h2 className="text-2xl font-black text-white mb-2">{item.title || "Memory"}</h2>
          {item.caption && <p className="text-white/60 text-sm mb-6">{item.caption}</p>}
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-full bg-[#FF4D8D]/20 flex items-center justify-center text-[#FF4D8D]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Date Added</p>
                <p className="text-xs text-white font-medium">
                  {new Date(item.memory_date || item.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {item.location_name && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Location</p>
                  <p className="text-xs text-white font-medium">{item.location_name}</p>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* SPRINT 3: SHARED MEMORY ECOSYSTEM (TAGS ONLY)            */}
          {/* ======================================================== */}
          <div className="border-t border-white/10 pt-6 mt-2 space-y-6">
            
            {/* Tagged People Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#00E5FF]" /> People in this Memory
                </h3>
                
                <div className="relative">
                  <button 
                    onClick={() => setIsTagSelectorOpen(!isTagSelectorOpen)}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-1 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#00E5FF]" /> Tag Person
                  </button>

                  {isTagSelectorOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0E1322] border border-white/10 rounded-xl shadow-xl p-2 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                      <p className="text-[10px] text-white/40 font-bold px-2 py-1 uppercase tracking-wider">Select member to tag</p>
                      {availableConnections.length === 0 ? (
                        <p className="text-xs text-white/50 px-2 py-3">No connections found</p>
                      ) : (
                        availableConnections.map((person) => {
                          const isAlreadyTagged = sharedData?.people?.some(p => p.user_id === person.id);
                          return (
                            <button
                              key={person.id}
                              disabled={isAlreadyTagged}
                              onClick={() => handleTagPerson(person.id)}
                              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${isAlreadyTagged ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}
                            >
                              {person.avatar ? (
                                <img src={getMediaUrl(person.avatar)} className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">
                                  {person.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">{person.name}</p>
                                <p className="text-[9px] text-white/40 capitalize">{person.relationship}</p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tagged list */}
              {loadingShared ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-4 h-4 text-[#00E5FF] animate-spin" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sharedData?.people && sharedData.people.length > 0 ? (
                    sharedData.people.map((person) => (
                      <div 
                        key={person.user_id} 
                        className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/80 group/tag"
                      >
                        {person.avatar_url ? (
                          <img src={getMediaUrl(person.avatar_url)} className="w-4 h-4 rounded-full object-cover" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-[#00E5FF]/20 flex items-center justify-center font-bold text-[8px] text-[#00E5FF]">
                            {person.display_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <span className="font-medium">{person.display_name || person.username}</span>
                        <button 
                          onClick={() => handleRemoveTag(person.user_id)}
                          className="hover:text-red-400 opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                          title="Remove Tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/40 italic">No one tagged yet. Tag family members to link them in this memory.</p>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="mt-auto pt-8 border-t border-white/5 flex gap-3">
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
