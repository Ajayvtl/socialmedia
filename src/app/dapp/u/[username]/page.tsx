"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, MapPin, Heart, User, CheckCircle2, Lock, UserPlus, Clock, UserCheck, Send, Calendar, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import api, { getMediaUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { safeObject } from "@/lib/utils";

export default function PublicProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const username = params.username as string;
  const [profile, setProfile] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('none');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "connections" | "posts" | "events">("about");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/social-profile/u/${username}`);
        setProfile(res.data.data);
        if (res.data.data?.user_id) {
          const statusRes = await api.get(`/connections/status/${res.data.data.user_id}`);
          setConnectionStatus(statusRes.data.status);
        }
      } catch (err) {
        toast.error("Profile not found");
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchProfile();
  }, [username]);

  const isPrivate = profile ? (profile.is_private === 1 || profile.is_private === true) : false;
  const isSelf = profile ? (user?.id === profile.user_id) : false;
  const canView = profile ? (!isPrivate || isSelf || connectionStatus === 'accepted') : false;

  useEffect(() => {
    const fetchUserConnections = async () => {
      if (!profile?.user_id || !canView) return;
      setConnectionsLoading(true);
      try {
        const res = await api.get(`/connections/list?userId=${profile.user_id}`);
        setConnections(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch user connections", err);
      } finally {
        setConnectionsLoading(false);
      }
    };
    fetchUserConnections();
  }, [profile?.user_id, canView]);

  useEffect(() => {
    setPosts([]);
    setEvents([]);
    setPostsLoaded(false);
    setEventsLoaded(false);
  }, [profile?.user_id]);

  const fetchProfileContent = async (type: "posts" | "events") => {
    if (!profile?.user_id || !canView) return;

    const isPosts = type === "posts";
    if (isPosts) {
      if (postsLoading || postsLoaded) return;
      setPostsLoading(true);
    } else {
      if (eventsLoading || eventsLoaded) return;
      setEventsLoading(true);
    }

    try {
      const { data } = await api.get(`/social-profile/u/${username}/content?type=${type}&limit=20&offset=0`);
      const items = Array.isArray(data?.data) ? data.data : [];
      if (isPosts) {
        setPosts(items);
        setPostsLoaded(true);
      } else {
        setEvents(items);
        setEventsLoaded(true);
      }
    } catch (err) {
      console.error(`Failed to fetch profile ${type}`, err);
    } finally {
      if (isPosts) {
        setPostsLoading(false);
      } else {
        setEventsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!profile?.user_id || !canView) {
      setPosts([]);
      setEvents([]);
      setPostsLoaded(false);
      setEventsLoaded(false);
      return;
    }

    if (activeTab === "posts" && !postsLoaded && !postsLoading) {
      fetchProfileContent("posts");
    }
    if (activeTab === "events" && !eventsLoaded && !eventsLoading) {
      fetchProfileContent("events");
    }
  }, [profile?.user_id, canView, activeTab, postsLoaded, eventsLoaded, postsLoading, eventsLoading]);

  useEffect(() => {
    if (!canView && (activeTab === "posts" || activeTab === "events")) {
      setActiveTab("about");
    }
  }, [canView, activeTab]);

  const formatDate = (value: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (value: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const renderPostBody = (post: any) => {
    const parsed = safeObject<any>(post.content);
    if (parsed?.type === "EVENT_SHARE" && parsed?.event_id) {
      const isPublicEvent = String(post.event_visibility || "PUBLIC").toUpperCase() === "PUBLIC";
      const eventTitle = post.event_title || parsed.title || "Event";
      const eventCover = post.event_cover_image || parsed.cover_image || null;
      const eventStartTime = post.event_start_time || parsed.start_time || "";

      if (!isPublicEvent) {
        return (
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.025] overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/45">
                <Lock className="w-3.5 h-3.5" />
                Private Event Shared
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold text-white/45">
                Hidden details
              </span>
            </div>
            <div className="px-4 py-4">
              <h4 className="text-base font-bold text-white">Private event</h4>
              <p className="mt-2 text-sm text-white/55">
                This event is private, so only the share indicator is shown here.
              </p>
            </div>
          </div>
        );
      }

      return (
        <div
          onClick={() => window.location.href = `/dapp/events/${parsed.event_id}`}
          className="mt-4 rounded-3xl overflow-hidden border border-[#2b3139] bg-[#0b0e11] cursor-pointer hover:border-[#5bbcff]/40 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          {eventCover ? (
            <img
              src={getMediaUrl(eventCover)}
              alt={eventTitle}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-[#10151e] via-[#0b0e11] to-[#050816]">
              <Calendar className="w-12 h-12 text-[#5bbcff]/40" />
            </div>
          )}
          <div className="p-4 md:p-5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#5bbcff]/25 bg-[#5bbcff]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5bbcff] mb-3 backdrop-blur-sm">
              <Calendar className="w-3 h-3" />
              Event Share
            </div>
            <h4 className="text-lg font-bold text-white leading-tight">{eventTitle}</h4>
            <p className="text-sm text-white/60 mt-1 line-clamp-2">
              {eventStartTime ? formatDateTime(eventStartTime) : "Event details available"}
            </p>
          </div>
        </div>
      );
    }

    return (
      <p className="text-[#f5f5f5] text-base leading-relaxed whitespace-pre-wrap font-light mt-3">
        {post.content || "No content available."}
      </p>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5bbcff]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center p-4">
        <div className="w-20 h-20 bg-[#161a20] rounded-full flex items-center justify-center border border-[#2b3139] mb-4">
          <User className="w-8 h-8 text-[#848e9c]" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">User Not Found</h1>
        <p className="text-[#848e9c]">The account @{username} doesn't exist or is unavailable.</p>
      </div>
    );
  }

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      if (connectionStatus === 'none') {
        await api.post(`/connections/request/${profile.user_id}`);
        setConnectionStatus('pending_sent');
        toast.success("Connection request sent");
      } else if (connectionStatus === 'pending_received') {
        await api.post(`/connections/accept/${profile.user_id}`);
        setConnectionStatus('accepted');
        toast.success("Connection accepted");
      } else if (connectionStatus === 'accepted' || connectionStatus === 'pending_sent') {
        if (confirm("Are you sure you want to remove this connection?")) {
          await api.delete(`/connections/${profile.user_id}`);
          setConnectionStatus('none');
          toast.success("Connection removed");
        }
      }
    } catch(e: any) {
      toast.error(e.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-[calc(100vh-80px)]">
      {/* 2026 Glassmorphism Redesign style header */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[#2b3139] bg-[#161a20]/80 backdrop-blur-xl shadow-2xl p-8 md:p-12 mb-8 transition-all duration-300 hover:shadow-[0_0_40px_rgba(91,188,255,0.15)] flex flex-col md:flex-row items-center md:items-center gap-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#5bbcff]/10 via-[#8B5CF6]/10 to-transparent rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
        
        <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-[#123a62] bg-[#0b1930] flex items-center justify-center shadow-[0_0_40px_rgba(91,188,255,0.2)] shrink-0 transition-transform duration-300 hover:scale-105 overflow-hidden z-10">
          {profile.avatar_url ? (
            <img src={getMediaUrl(profile.avatar_url)} alt={username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl font-bold text-[#5bbcff]">{profile.email ? profile.email[0].toUpperCase() : 'U'}</span>
          )}
        </div>
        
        <div className="flex-1 w-full text-center md:text-left flex flex-col md:flex-row md:justify-between md:items-center gap-6 z-10">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
                {profile.display_name || profile.first_name || profile.email || 'Anonymous'}
                <CheckCircle2 className="w-7 h-7 text-[#0ecb81] fill-current/20" />
                {isPrivate && <Lock className="w-5 h-5 text-white/50 ml-1" />}
              </h1>
              {profile.family_relationship && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 text-xs md:text-sm font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                  <Heart className="w-4 h-4 fill-pink-500/50" />
                  {profile.family_relationship}
                </span>
              )}
            </div>
            <p className="text-[#5bbcff] font-medium text-xl mt-2 tracking-wide">@{username}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-5 text-sm text-[#848e9c]">
                {profile.location && (
                  <div className="flex items-center gap-1.5 bg-[#111418] px-3 py-1.5 rounded-full border border-[#2b3139] shadow-inner">
                    <MapPin className="w-4 h-4 text-[#f0b90b]" />
                    {profile.location}
                  </div>
                )}
                {profile.gender && (
                  <div className="flex items-center gap-1.5 bg-[#111418] px-3 py-1.5 rounded-full border border-[#2b3139] shadow-inner">
                    <User className="w-4 h-4 text-[#a066ff]" />
                    {profile.gender}
                  </div>
                )}
              </div>
            </div>
 
            {!isSelf && (
              <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end w-full md:w-auto">
                <button 
                  onClick={handleConnect}
                  disabled={actionLoading}
                  className={`px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2.5 transition-all shadow-lg ${
                    connectionStatus === 'accepted' ? 'bg-white/5 border border-white/10 text-white hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400' :
                    connectionStatus === 'pending_sent' ? 'bg-white/10 text-white' :
                    connectionStatus === 'pending_received' ? 'bg-[#0ecb81] text-[#0b1930] hover:bg-[#0b9c64]' :
                    'bg-gradient-to-r from-[#5bbcff] to-[#0ecb81] text-[#0b1930] hover:opacity-90 shadow-[0_0_20px_rgba(91,188,255,0.3)]'
                  }`}
                >
                  {actionLoading && <Loader2 className="w-5 h-5 animate-spin"/>}
                  {!actionLoading && (
                    <>
                      {connectionStatus === 'accepted' && <UserCheck className="w-5 h-5" />}
                      {connectionStatus === 'pending_sent' && <Clock className="w-5 h-5" />}
                      {connectionStatus === 'pending_received' && <CheckCircle2 className="w-5 h-5" />}
                      {connectionStatus === 'none' && <UserPlus className="w-5 h-5" />}
                      
                      {connectionStatus === 'accepted' ? 'Connected' :
                       connectionStatus === 'pending_sent' ? 'Requested' :
                       connectionStatus === 'pending_received' ? 'Accept Request' :
                       'Connect'}
                    </>
                  )}
                </button>

                <Link
                  href={`/dapp/inbox?user=${profile.user_id}&name=${encodeURIComponent(profile.display_name || profile.username)}&avatar=${encodeURIComponent(profile.avatar_url || '')}`}
                  className="px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#ec4899] text-white hover:opacity-90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                >
                  <Send className="w-5 h-5" />
                  Message
                </Link>
              </div>
            )}
          </div>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 hidden md:block">
          {/* Left Column for sticky stats/info on desktop */}
          <div className="sticky top-24 rounded-[2rem] border border-[#2b3139] bg-[#161a20]/60 backdrop-blur-md p-6 space-y-6">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#5bbcff] font-bold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Connections</span>
                  <span className="text-white font-bold">{profile.connections_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Posts</span>
                  <span className="text-white font-bold">{profile.posts_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Events</span>
                  <span className="text-white font-bold">{profile.events_count || 0}</span>
                </div>
              </div>
            </div>
            {profile.bio && (
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-[#5bbcff] font-bold mb-3">About Me</h3>
                <p className="text-white/70 text-sm leading-relaxed line-clamp-4">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-3 space-y-6">
          <div className="rounded-[2rem] border border-[#2b3139] bg-[#161a20]/60 backdrop-blur-md p-6 md:p-10 hover:bg-[#161a20]/80 transition-colors">
            {canView ? (
              <>
                <div className="flex flex-wrap gap-3 border-b border-[#2b3139] mb-6">
                  <button 
                    onClick={() => setActiveTab("about")}
                    className={`pb-3 text-sm font-bold tracking-wider uppercase transition-colors relative ${
                      activeTab === "about" ? "text-[#5bbcff]" : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    About
                    {activeTab === "about" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5bbcff]" />
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab("connections")}
                    className={`pb-3 text-sm font-bold tracking-wider uppercase transition-colors relative ${
                      activeTab === "connections" ? "text-[#5bbcff]" : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    Connections ({profile.connections_count ?? connections.length})
                    {activeTab === "connections" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5bbcff]" />
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab("posts")}
                    className={`pb-3 text-sm font-bold tracking-wider uppercase transition-colors relative ${
                      activeTab === "posts" ? "text-[#5bbcff]" : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    Posts ({profile.posts_count ?? posts.length})
                    {activeTab === "posts" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5bbcff]" />
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab("events")}
                    className={`pb-3 text-sm font-bold tracking-wider uppercase transition-colors relative ${
                      activeTab === "events" ? "text-[#5bbcff]" : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    Events ({profile.events_count ?? events.length})
                    {activeTab === "events" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5bbcff]" />
                    )}
                  </button>
                </div>

                {activeTab === "about" && (
                  <div>
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[#5bbcff] font-bold mb-5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#5bbcff] animate-pulse"></span>
                      About Me
                    </h2>
                    <p className="text-[#f5f5f5] text-lg leading-relaxed whitespace-pre-wrap font-light">
                      {profile.bio || "No bio available."}
                    </p>
                  </div>
                )}

                {activeTab === "connections" && (
                  <div>
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[#5bbcff] font-bold mb-5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#5bbcff] animate-pulse"></span>
                      Connections
                    </h2>
                    {connectionsLoading ? (
                      <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-[#5bbcff]"/></div>
                    ) : connections.length === 0 ? (
                      <p className="text-white/40 text-sm">No connections yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {connections.map((conn) => (
                          <Link 
                            key={conn.connection_id}
                            href={`/dapp/u/${conn.username}`}
                            className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-[#5bbcff]/30 transition-all hover:bg-white/[0.03]"
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10 flex items-center justify-center bg-[#0b0e11]">
                              {conn.avatar_url ? (
                                <img src={getMediaUrl(conn.avatar_url)} alt={conn.username} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[#2b3139] flex items-center justify-center font-bold text-white text-sm">
                                  {conn.username?.[0].toUpperCase() || "U"}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">{conn.display_name || conn.username}</h4>
                              <p className="text-[10px] text-white/50 truncate">@{conn.username}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "posts" && (
                  <div>
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[#5bbcff] font-bold mb-5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#5bbcff] animate-pulse"></span>
                      Public Posts
                    </h2>
                    {postsLoading ? (
                      <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-[#5bbcff]"/></div>
                    ) : posts.length === 0 ? (
                      <p className="text-white/40 text-sm">No public posts yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {posts.map((post) => {
                          const parsed = safeObject<any>(post.content);
                          const isEventShare = parsed?.type === "EVENT_SHARE" && parsed?.event_id;

                          return (
                            <div key={post.id} className="rounded-3xl border border-white/5 bg-white/[0.02] p-4 md:p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-white/10 bg-[#0b0e11] flex items-center justify-center">
                                  {profile.avatar_url ? (
                                    <img src={getMediaUrl(profile.avatar_url)} alt={username} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-[#2b3139] flex items-center justify-center font-bold text-white text-sm">
                                      {username?.[0]?.toUpperCase() || "U"}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-bold text-white truncate">{profile.display_name || profile.first_name || profile.email || 'Anonymous'}</h4>
                                  <p className="text-[10px] text-white/50 truncate">@{username} - {formatDate(post.created_at)}</p>
                                </div>
                              </div>

                              {!isEventShare && (
                                <>
                                  <p className="text-[#f5f5f5] text-base leading-relaxed whitespace-pre-wrap font-light mt-3">
                                    {post.content || "No content available."}
                                  </p>

                                  {post.media_url && (
                                    <div className="mt-4 rounded-2xl overflow-hidden border border-white/5 bg-black/20">
                                      {String(post.media_type).startsWith("video") ? (
                                        <video
                                          src={getMediaUrl(post.media_url)}
                                          controls
                                          className="w-full max-h-[420px] object-cover bg-black"
                                        />
                                      ) : (
                                        <img
                                          src={getMediaUrl(post.media_url)}
                                          alt="Post media"
                                          className="w-full max-h-[420px] object-cover"
                                        />
                                      )}
                                    </div>
                                  )}
                                </>
                              )}

                              {isEventShare && renderPostBody(post)}

                              <div className="mt-4 flex items-center gap-4 text-xs text-white/50">
                                <span className="inline-flex items-center gap-1.5">
                                  <Heart className="w-3.5 h-3.5" />
                                  {post.likes_count || 0}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {post.comments_count || 0}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "events" && (
                  <div>
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[#5bbcff] font-bold mb-5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#5bbcff] animate-pulse"></span>
                      Public Events
                    </h2>
                    {eventsLoading ? (
                      <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-[#5bbcff]"/></div>
                    ) : events.length === 0 ? (
                      <p className="text-white/40 text-sm">No public events yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {events.map((event) => (
                          String(event.visibility || "PUBLIC").toUpperCase() === "PUBLIC" ? (
                            <Link
                              key={event.id}
                              href={`/dapp/events/${event.id}`}
                              className="block rounded-3xl border border-white/5 bg-white/[0.02] p-4 md:p-5 hover:border-[#5bbcff]/30 hover:bg-white/[0.04] transition-all shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                            >
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-36 h-40 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-[#0b0e11]">
                                  {event.cover_image ? (
                                    <img src={getMediaUrl(event.cover_image)} alt={event.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#10151e] to-[#050816] flex items-center justify-center">
                                      <Calendar className="w-10 h-10 text-[#5bbcff]/40" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-white/45">
                                    <span className="rounded-full border border-white/10 px-2 py-1">{event.event_type || "EVENT"}</span>
                                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-emerald-300">{event.visibility || "PUBLIC"}</span>
                                  </div>
                                  <h3 className="text-lg md:text-xl font-bold text-white mt-3 leading-tight">{event.title}</h3>
                                  <p className="text-sm text-white/60 mt-2 line-clamp-2">
                                    {event.description || event.event_purpose || "Event details are available on the event page."}
                                  </p>
                                  <div className="flex flex-wrap gap-3 mt-4 text-xs text-white/45">
                                    {event.location && (
                                      <span className="inline-flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {event.location}
                                      </span>
                                    )}
                                    {event.start_time && (
                                      <span className="inline-flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatDateTime(event.start_time)}
                                      </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5">
                                      <UserCheck className="w-3.5 h-3.5" />
                                      {event.attendees_count || 0} going
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <div
                              key={event.id}
                              className="rounded-3xl border border-white/5 bg-white/[0.02] p-4 md:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                            >
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-36 h-40 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-[#0b0e11] relative">
                                  {event.cover_image ? (
                                    <img src={getMediaUrl(event.cover_image)} alt={event.title} className="w-full h-full object-cover opacity-70" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#10151e] to-[#050816] flex items-center justify-center">
                                      <Lock className="w-10 h-10 text-white/30" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/40 to-transparent" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-white/45">
                                    <span className="rounded-full border border-white/10 px-2 py-1">{event.event_type || "EVENT"}</span>
                                    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-amber-300">PRIVATE</span>
                                  </div>
                                  <h3 className="text-lg md:text-xl font-bold text-white mt-3 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-white/40" />
                                    Private event hidden
                                  </h3>
                                  <p className="text-sm text-white/60 mt-2">
                                    This event is private and is not opened from the public profile.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="relative flex flex-col items-center justify-center py-20 px-6 text-center overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 shadow-2xl">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-8 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border border-white/5 animate-[spin_15s_linear_infinite_reverse]" />
                  <Lock className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-3 drop-shadow-md">
                  This Profile is Private
                </h3>
                
                <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">
                  Only approved connections can see what <strong className="text-white/80">@{username}</strong> shares. Send a connection request to unlock their bio, posts, and network.
                </p>

                {connectionStatus === 'none' && (
                  <button 
                    onClick={handleConnect}
                    disabled={actionLoading}
                    className="mt-8 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                    Request to Connect
                  </button>
                )}
                {connectionStatus === 'pending_sent' && (
                  <div className="mt-8 px-8 py-3 bg-white/5 border border-white/10 text-white/70 font-bold rounded-full flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Request Pending
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
