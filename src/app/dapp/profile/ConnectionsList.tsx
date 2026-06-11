import { useState, useEffect, useMemo } from "react";
import api, { getMediaUrl } from "@/lib/api";
import Link from "next/link";
import { User, ShieldCheck, Link2, Search, X, UserCheck, UserMinus, Play, Sparkles, Users } from "lucide-react";
import toast from "react-hot-toast";
import FamilyRelationshipModal from "@/components/family-graph/FamilyRelationshipModal";

const getGradient = (name: string) => {
  const gradients = [
    "from-[#00E5FF] to-[#8B5CF6]", 
    "from-[#FF4D8D] to-[#8B5CF6]", 
    "from-[#FACC15] to-[#FF4D8D]", 
    "from-[#00D97E] to-[#00E5FF]",
    "from-indigo-400 to-purple-500", 
    "from-cyan-400 to-blue-500"
  ];
  return gradients[(name || "U").length % gradients.length];
};

export default function ConnectionsList() {
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [dbStories, setDbStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [relationships, setRelationships] = useState<any[]>([]);

  // Story Viewer State
  const [activeStoryGroup, setActiveStoryGroup] = useState<any | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Family Graph Modal State
  const [relationshipModalOpen, setRelationshipModalOpen] = useState(false);
  const [selectedUserForGraph, setSelectedUserForGraph] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchConnections(),
          fetchPending(),
          fetchStories(),
          fetchRelationships()
        ]);
      } catch (err) {
        console.error("Error loading connections data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!activeStoryGroup) return;
    const timer = setTimeout(() => {
      if (activeStoryIndex < activeStoryGroup.stories.length - 1) {
        setActiveStoryIndex(i => i + 1);
      } else {
        setActiveStoryGroup(null);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeStoryGroup, activeStoryIndex]);

  const fetchConnections = async () => {
    try {
      const res = await api.get("/connections/list");
      setConnections(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch connections", error);
    }
  };

  const fetchPending = async () => {
    try {
      const res = await api.get("/connections/pending");
      setPendingRequests(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch pending requests", error);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await api.get("/posts/stories/all");
      setDbStories(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch stories", error);
    }
  };

  const fetchRelationships = async () => {
    try {
      const res = await api.get("/family-graph/me");
      setRelationships(res.data?.data?.relationships || []);
    } catch (error) {
      console.error("Failed to fetch relationships", error);
    }
  };

  // Map stories into groups by userId
  const storyGroups = useMemo(() => {
    const groups = new Map<number, any>();
    dbStories.forEach(s => {
      const authorId = Number(s.user_id);
      if (!authorId) return;
      if (!groups.has(authorId)) {
        groups.set(authorId, {
          name: s.display_name || s.profile_username || s.user_email?.split('@')[0] || "User",
          avatar: s.avatar_url,
          userId: authorId,
          stories: []
        });
      }
      groups.get(authorId).stories.push({
        id: s.id,
        mediaUrl: s.media_url,
        mediaType: s.media_type,
        content: s.content,
        created_at: s.created_at
      });
    });
    return groups;
  }, [dbStories]);

  const handleAccept = async (id: number) => {
    try {
      await api.post(`/connections/accept/${id}`);
      setPendingRequests(prev => prev.filter((r) => r.requester_id !== id));
      fetchConnections();
      toast.success("Connection accepted");
    } catch (err) {
      toast.error("Failed to accept");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.delete(`/connections/${id}`);
      setPendingRequests(prev => prev.filter((r) => r.requester_id !== id));
      toast.success("Request rejected");
    } catch (err) {
      toast.error("Failed to reject");
    }
  };

  const handleRemoveConnection = async (id: number) => {
    try {
      await api.delete(`/connections/${id}`);
      setConnections(prev => prev.filter(c => c.user_id !== id));
      toast.success("Connection removed");
    } catch (error) {
      toast.error("Failed to remove connection");
    }
  };

  // Live filter pending and connections list
  const filteredPending = useMemo(() => {
    if (!searchQuery.trim()) return pendingRequests;
    const q = searchQuery.toLowerCase();
    return pendingRequests.filter(
      r => (r.display_name || "").toLowerCase().includes(q) || (r.username || "").toLowerCase().includes(q)
    );
  }, [pendingRequests, searchQuery]);

  const filteredConnections = useMemo(() => {
    if (!searchQuery.trim()) return connections;
    const q = searchQuery.toLowerCase();
    return connections.filter(
      c => (c.display_name || "").toLowerCase().includes(q) || (c.username || "").toLowerCase().includes(q)
    );
  }, [connections, searchQuery]);

  if (loading) {
    return <div className="text-white/50 text-sm p-10 text-center animate-pulse">Loading connections directory...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Premium Glassmorphic Search Header */}
      <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search connections or pending requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050816]/60 border border-white/10 rounded-2xl px-5 py-3.5 pl-12 text-sm text-white focus:outline-none focus:border-[#00E5FF] transition-all placeholder-white/40 shadow-inner"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Pending Requests Section */}
      {filteredPending.length > 0 && (
        <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider inline-flex items-center gap-2 text-[#FF4D8D]">
            <User className="w-5 h-5 text-[#FF4D8D]" />
            Pending Requests ({filteredPending.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPending.map((req) => {
              const userStoryGroup = storyGroups.get(Number(req.requester_id));
              const hasStories = userStoryGroup && userStoryGroup.stories.length > 0;

              return (
                <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-[#FF4D8D]/30 transition-all hover:bg-white/[0.03]">
                  <div className="flex items-center gap-3 min-w-0">
                    
                    {/* Avatar with dynamic active story ring */}
                    <div 
                      onClick={() => {
                        if (hasStories) {
                          setActiveStoryGroup(userStoryGroup);
                          setActiveStoryIndex(0);
                        }
                      }}
                      className={`relative shrink-0 rounded-full cursor-pointer transition-transform duration-300 active:scale-95 ${
                        hasStories 
                          ? "p-[3px] bg-gradient-to-tr from-[#00E5FF] via-[#8B5CF6] to-[#FF4D8D]" 
                          : "p-[1px] border border-white/10"
                      }`}
                    >
                      <div className="bg-[#050816] p-[2px] rounded-full">
                        <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center bg-[#0b0e11]">
                          {req.avatar_url ? (
                            <img src={getMediaUrl(req.avatar_url)} alt={req.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full rounded-full bg-gradient-to-br ${getGradient(req.display_name || req.username)} flex items-center justify-center font-bold text-white text-base`}>
                              {(req.display_name || req.username || "U")[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      {hasStories && (
                        <span className="absolute -bottom-1 -right-1 bg-[#FF4D8D] text-white text-[8px] font-extrabold px-1 rounded-full border border-[#050816] shadow-sm animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>

                    <Link href={`/dapp/u/${req.username}`} className="min-w-0">
                      <h4 className="text-sm font-bold text-white hover:underline truncate flex items-center gap-1">
                        {req.display_name || req.username}
                      </h4>
                      <p className="text-[10px] text-white/50 truncate">@{req.username}</p>
                    </Link>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => handleAccept(req.requester_id)} 
                      className="p-2 rounded-xl bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/20 transition-all font-bold"
                      title="Accept Request"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleReject(req.requester_id)} 
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                      title="Decline Request"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connections List Section */}
      <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-4">
        <h2 className="text-base font-bold uppercase tracking-wider inline-flex items-center gap-2 text-[#00E5FF]">
          <Link2 className="w-5 h-5 text-[#00E5FF]" />
          Your Network ({filteredConnections.length})
        </h2>
        
        {filteredConnections.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl text-white/40 text-sm flex flex-col items-center justify-center gap-2">
            <User className="w-8 h-8 opacity-40" />
            <p>No connections found.</p>
            <p className="text-xs text-white/30">Try a different search query or explore and connect with new members!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnections.map((conn) => {
              const userStoryGroup = storyGroups.get(Number(conn.user_id));
              const hasStories = userStoryGroup && userStoryGroup.stories.length > 0;
              const relationship = relationships.find((r) => r.related_user_id === conn.user_id);

              return (
                <div key={conn.connection_id} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-[#00E5FF]/30 transition-all hover:bg-white/[0.03]">
                  <div className="flex items-center gap-3 min-w-0">
                    
                    {/* Avatar with dynamic active story ring */}
                    <div 
                      onClick={() => {
                        if (hasStories) {
                          setActiveStoryGroup(userStoryGroup);
                          setActiveStoryIndex(0);
                        }
                      }}
                      className={`relative shrink-0 rounded-full cursor-pointer transition-transform duration-300 active:scale-95 ${
                        hasStories 
                          ? "p-[3px] bg-gradient-to-tr from-[#00E5FF] via-[#8B5CF6] to-[#FF4D8D]" 
                          : "p-[1px] border border-white/10"
                      }`}
                    >
                      <div className="bg-[#050816] p-[2px] rounded-full">
                        <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center bg-[#0b0e11]">
                          {conn.avatar_url ? (
                            <img src={getMediaUrl(conn.avatar_url)} alt={conn.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full rounded-full bg-gradient-to-br ${getGradient(conn.display_name || conn.username)} flex items-center justify-center font-bold text-white text-base`}>
                              {(conn.display_name || conn.username || "U")[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      {hasStories && (
                        <span className="absolute -bottom-1 -right-1 bg-[#00E5FF] text-black text-[8px] font-extrabold px-1 rounded-full border border-[#050816] shadow-sm animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>

                    <Link href={`/dapp/u/${conn.username}`} className="min-w-0">
                      <h4 className="text-sm font-bold text-white hover:underline truncate flex items-center gap-1">
                        {conn.display_name || conn.username}
                        {conn.badge_type && conn.badge_type !== "none" && (
                          <ShieldCheck className={`w-3.5 h-3.5 ${conn.badge_type === "gold" ? "text-[#f0b90b]" : conn.badge_type === "premium" ? "text-[#8B5CF6]" : "text-[#00E5FF]"}`} />
                        )}
                      </h4>
                      <p className="text-[10px] text-white/50 truncate">@{conn.username}</p>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {relationship ? (
                      <span className="text-[10px] uppercase font-bold px-3 py-1.5 bg-gradient-to-r from-[#FF4D8D]/20 to-[#8B5CF6]/20 text-white rounded-xl border border-[#FF4D8D]/30 shadow-[0_0_10px_rgba(255,77,141,0.1)] flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#FF4D8D]" />
                        {relationship.relationship_type.replace('_', ' ')}
                      </span>
                    ) : (
                      <button 
                        onClick={() => { setSelectedUserForGraph({ id: conn.user_id, name: conn.display_name || conn.username }); setRelationshipModalOpen(true); }}
                        className="text-xs px-3 py-1.5 rounded-xl border border-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all font-medium flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Family
                      </button>
                    )}
                    <button 
                      onClick={() => handleRemoveConnection(conn.user_id)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-white/10 text-white/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Story Viewer Modal */}
      {activeStoryGroup && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-md" onClick={() => setActiveStoryGroup(null)}>
           <style>{`
             @keyframes story-progress {
               from { width: 0%; }
               to { width: 100%; }
             }
           `}</style>
           
           {/* Progress Bars */}
           <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
             {activeStoryGroup.stories.map((s: any, idx: number) => (
               <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                 <div 
                   key={`progress-${idx}-${activeStoryIndex === idx ? 'active' : 'inactive'}`}
                   className="h-full bg-white" 
                   style={{
                     width: idx < activeStoryIndex ? '100%' : '0%',
                     animation: idx === activeStoryIndex ? 'story-progress 5s linear forwards' : 'none'
                   }}
                 ></div>
               </div>
             ))}
           </div>

           <div className="flex justify-between items-center p-4 pt-8 absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
             <div className="flex items-center gap-3 pointer-events-auto">
               <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(activeStoryGroup.name)} overflow-hidden border-2 border-white/20 flex items-center justify-center text-white font-bold`}>
                 {activeStoryGroup.avatar ? <img src={getMediaUrl(activeStoryGroup.avatar)} className="w-full h-full object-cover"/> : activeStoryGroup.name[0]}
               </div>
               <div>
                 <h3 className="text-white font-bold text-sm shadow-black drop-shadow-md">{activeStoryGroup.name}</h3>
                 <p className="text-white/60 text-xs shadow-black drop-shadow-md">Active now</p>
               </div>
             </div>
             <div className="flex items-center gap-2 pointer-events-auto">
               <button onClick={(e) => { e.stopPropagation(); setActiveStoryGroup(null); }} className="text-white p-2 hover:bg-white/10 rounded-full bg-black/40"><X className="w-6 h-6"/></button>
             </div>
           </div>
           
           {/* Main Viewer area, divided into prev/next click areas */}
           <div className="flex-1 flex relative overflow-hidden" onClick={e => e.stopPropagation()}>
             {/* Click Prev */}
             <div className="absolute top-0 bottom-0 left-0 w-1/3 z-10 cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                if (activeStoryIndex > 0) setActiveStoryIndex(activeStoryIndex - 1);
             }}></div>
             
             {/* Click Next */}
             <div className="absolute top-0 bottom-0 right-0 w-2/3 z-10 cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                if (activeStoryIndex < activeStoryGroup.stories.length - 1) setActiveStoryIndex(activeStoryIndex + 1);
                else setActiveStoryGroup(null);
             }}></div>

             <div className="w-full h-full flex items-center justify-center">
               {(() => {
                 const s = activeStoryGroup.stories[activeStoryIndex];
                 if (!s) return null;
                 return s.mediaUrl ? (
                    s.mediaType?.startsWith('video') ? (
                      <video src={getMediaUrl(s.mediaUrl)} autoPlay controls className="w-full h-full object-contain" />
                    ) : (
                      <img src={getMediaUrl(s.mediaUrl)} className="w-full h-full object-contain" />
                    )
                 ) : (
                   <div className={`w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br ${getGradient(activeStoryGroup.name)}`}>
                     <p className="text-white text-3xl font-bold text-center">{s.content}</p>
                   </div>
                 );
               })()}
             </div>
           </div>
        </div>
      )}

      {/* Family Relationship Modal */}
      <FamilyRelationshipModal 
        isOpen={relationshipModalOpen}
        onClose={() => setRelationshipModalOpen(false)}
        targetUser={selectedUserForGraph}
        onSuccess={fetchRelationships}
      />
    </div>
  );
}
