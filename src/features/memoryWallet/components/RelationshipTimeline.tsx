import React, { useEffect, useState } from 'react';
import api, { getMediaUrl } from '@/lib/api';
import { Loader2, Calendar, MapPin, Heart, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { MemoryItem } from '../types/memoryWallet.types';
import { MemoryFocusModal } from './MemoryFocusModal';
import { AppImage } from '@/components/ui/AppImage';
import { ZoomableMedia } from '@/components/ui/ZoomableMedia';
import { MemoryShareModal } from './MemoryShareModal';
import { useUpdateMemoryItem } from '../hooks/useMemoryWallet';

interface RelationshipTimelineProps {
  person: any;
  onBack: () => void;
}

export const RelationshipTimeline: React.FC<RelationshipTimelineProps> = ({ person, onBack }) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [shareMemory, setShareMemory] = useState<MemoryItem | null>(null);
  const { mutate: updateItem } = useUpdateMemoryItem();

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true);
        // We fetch all memories and filter locally for now to avoid needing a new endpoint,
        // or we can hit a hypothetical endpoint. Assuming we have all memories via standard endpoint.
        // Wait, we need the active vault ID.
        const vaultsRes = await api.get('/memory-wallet/vaults');
        const activeVault = vaultsRes.data?.data?.[0];
        
        if (activeVault) {
          const itemsRes = await api.get('/memory-wallet/items', { params: { vaultId: activeVault.id } });
          const allItems: MemoryItem[] = itemsRes.data?.data || [];
          
          // Filter by relationship_id or if it's an upline/user, maybe by tagged users (not implemented yet).
          // For now, if person has an id, we check if relationship_id matches.
          // Or we just show some matched memories. 
          const matched = allItems.filter(m => m.relationship_id === person.id || m.title?.toLowerCase().includes(person.layerType?.toLowerCase() || ''));
          
          // Sort chronologically ascending for a timeline
          matched.sort((a, b) => new Date(a.memory_date || a.created_at).getTime() - new Date(b.memory_date || b.created_at).getTime());
          
          setMemories(matched);
        }
      } catch (err) {
        console.error("Failed to load relationship memories", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (person) fetchMemories();
  }, [person]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FF4D8D] animate-spin mb-4" />
        <p className="text-white/60 text-sm">Extracting shared memories...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#050816] relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,77,141,0.15)_0%,_transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-white/10 z-10 bg-[#050816]/80 backdrop-blur-md">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="w-12 h-12 rounded-full border-2 border-[#FF4D8D] overflow-hidden bg-gradient-to-tr from-[#00E5FF] to-[#FF4D8D] flex items-center justify-center shrink-0">
          {person.avatar_url || person.img ? (
            <img src={getMediaUrl(person.avatar_url || person.img)} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-xl">{(person.display_name || person.username || person.related_name || 'U')[0].toUpperCase()}</span>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">{person.display_name || person.username || person.related_name}</h2>
          <p className="text-[#FF4D8D] font-bold text-sm uppercase tracking-widest">{person.layerType || 'Connection'}</p>
        </div>
        <div className="ml-auto text-right hidden md:block">
           <p className="text-white/50 text-xs uppercase tracking-widest font-bold">Shared Memories</p>
           <p className="text-2xl font-black text-white">{memories.length}</p>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 relative z-10">
        {memories.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <Heart className="w-16 h-16 text-white/20 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No Shared Memories Yet</h3>
            <p className="text-white/50">Upload photos and tag them with {person.display_name || 'this person'} to build your chronological relationship timeline.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto relative">
            {/* The Vertical Line */}
            <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF4D8D] via-[#8B5CF6] to-[#00E5FF] opacity-30 rounded-full transform md:-translate-x-1/2"></div>
            
            <div className="space-y-12">
              {memories.map((memory, idx) => {
                const isEven = idx % 2 === 0;
                const date = new Date(memory.memory_date || memory.created_at);
                
                return (
                  <div key={memory.id} className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''} gap-8 group`}>
                    
                    {/* Timeline Node */}
                    <div className="absolute left-[15px] md:left-1/2 w-7 h-7 rounded-full bg-[#050816] border-4 border-[#FF4D8D] transform -translate-x-1/2 mt-6 z-10 group-hover:scale-150 group-hover:border-[#00E5FF] transition-all shadow-[0_0_15px_rgba(255,77,141,0.6)]"></div>
                    
                    {/* Content Card */}
                    <div className="w-full md:w-1/2 pl-16 md:pl-0">
                      <div className={`bg-white/5 border border-white/10 rounded-3xl p-5 hover:bg-white/10 transition-colors cursor-pointer shadow-xl backdrop-blur-sm ${isEven ? 'md:mr-12' : 'md:ml-12'}`} onClick={() => setSelectedMemory(memory)}>
                        
                        <div className="flex items-center gap-2 mb-4 text-[#00E5FF]">
                          <Calendar className="w-4 h-4" />
                          <span className="font-bold text-sm">{date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                        </div>

                        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4 bg-black/50 relative border border-white/5">
                           {(memory.memory_type === 'video' || memory.memory_type === 'photo') ? (
                             <AppImage src={memory.thumbnail_url || memory.url || ''} alt={memory.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-white/20" /></div>
                           )}
                           {memory.memory_type === 'video' && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                               <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur flex items-center justify-center border border-white/20"><div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div></div>
                             </div>
                           )}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{memory.title || "Shared Moment"}</h3>
                        {memory.caption && <p className="text-white/60 text-sm line-clamp-2 mb-3">{memory.caption}</p>}
                        
                        {memory.location_name && (
                          <div className="flex items-center gap-1.5 text-white/40 text-xs font-medium">
                            <MapPin className="w-3.5 h-3.5" /> {memory.location_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <MemoryFocusModal 
        item={selectedMemory} 
        onClose={() => setSelectedMemory(null)} 
        onShare={(item) => setShareMemory(item)}
        onFavorite={(item) => updateItem({ itemId: item.id, data: { is_favorite: !item.is_favorite } })}
      />
      <MemoryShareModal item={shareMemory} onClose={() => setShareMemory(null)} />
    </div>
  );
};
