import React, { useState, useEffect } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlowButton } from '@/components/ui/GlowButton';
import { Search, Loader2, X, Check, Users } from 'lucide-react';
import api, { getMediaUrl } from '@/lib/api';
import toast from 'react-hot-toast';

interface InviteModalProps {
  communityId: string | number;
  communityName: string;
  onClose: () => void;
}

export default function InviteModal({ communityId, communityName, onClose }: InviteModalProps) {
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    api.get('/connections/list')
      .then(res => {
        setConnections(res.data.data || []);
      })
      .catch(err => {
        toast.error('Failed to load connections');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredConnections = connections.filter(c => 
    c.display_name?.toLowerCase().includes(search.toLowerCase()) || 
    c.username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedIds.length === filteredConnections.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredConnections.map(c => c.user_id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSend = async () => {
    if (selectedIds.length === 0) return;
    setIsSending(true);
    try {
      const link = `${window.location.origin}/dapp/communities/${communityId}`;
      const message = `Hey! I'd love for you to check out and join this community: ${communityName}\n${link}`;
      
      await api.post('/messages/send-bulk', {
        receiverIds: selectedIds,
        content: message
      });
      
      toast.success('Invitations sent successfully!');
      onClose();
    } catch (err) {
      toast.error('Failed to send invitations');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <GlassPanel className="p-0 animate-in zoom-in-95 max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border/50 bg-surface/50">
          <div>
            <h3 className="font-bold text-xl text-foreground tracking-tight">Invite Connections</h3>
            <p className="text-xs text-foreground/60 mt-0.5">Share {communityName} with your network</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-foreground/60 hover:text-foreground hover:bg-surface-secondary rounded-full transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        {/* Search & Actions */}
        <div className="p-4 border-b border-border/30 flex flex-col gap-3 shrink-0 bg-surface/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <input 
              type="text" 
              placeholder="Search connections..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-foreground/50 shadow-inner"
            />
          </div>
          {filteredConnections.length > 0 && (
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-semibold text-foreground/60">{filteredConnections.length} connections found</span>
              <button 
                onClick={handleSelectAll}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
              >
                {selectedIds.length === filteredConnections.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}
        </div>
        
        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-gradient-to-b from-transparent to-surface/30">
          {isLoading ? (
            <div className="flex justify-center items-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary"/></div>
          ) : filteredConnections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-foreground/40 text-sm space-y-3">
              <Users className="w-10 h-10 text-border" />
              <p>No connections found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConnections.map((conn) => {
                const isSelected = selectedIds.includes(conn.user_id);
                return (
                  <div 
                    key={conn.user_id}
                    onClick={() => toggleSelect(conn.user_id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-primary/5 border-primary/30' : 'bg-transparent border-transparent hover:bg-surface'}`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-[#8B5CF6] flex items-center justify-center text-white font-bold overflow-hidden border border-border shadow-sm">
                        {conn.avatar_url ? <img src={getMediaUrl(conn.avatar_url)} className="w-full h-full object-cover" alt=""/> : (conn.display_name ? conn.display_name[0].toUpperCase() : 'U')}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground text-sm truncate">{conn.display_name || conn.username}</h4>
                      <p className="text-xs text-foreground/50 truncate mt-0.5">@{conn.username}</p>
                    </div>
                    
                    <div className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary shadow-md scale-110' : 'bg-surface border-border'}`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-surface/50 shrink-0">
          <GlowButton 
            variant="primary" 
            onClick={handleSend} 
            disabled={selectedIds.length === 0 || isSending}
            className="w-full py-3"
          >
            {isSending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Sending...
              </span>
            ) : selectedIds.length > 0 ? (
              `Send ${selectedIds.length} Invitation${selectedIds.length > 1 ? 's' : ''}`
            ) : (
              'Select Connections'
            )}
          </GlowButton>
        </div>
        
      </GlassPanel>
    </div>
  );
}
