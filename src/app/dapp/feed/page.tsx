"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import ConnectionsList from "@/app/dapp/profile/ConnectionsList";
import {
  Heart, MessageCircle, Share2, Gift, MoreHorizontal, Play, Sparkles,
  Search, Bell, Plus, Users, MapPin, Star, Zap, X, ChevronRight, Coins, Gem, ArrowRight, Bookmark, Copy, Send, Image as ImageIcon, User, Smile, BadgeCheck, List, Calendar, Mic, Loader2, BarChart2, UserPlus, UserCheck, Link2, Check, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import api, { getMediaUrl } from "@/lib/api";
import EmojiPicker, { Theme } from 'emoji-picker-react';
import toast from 'react-hot-toast';
import { safeArray, safeObject } from "@/lib/utils";
import { ZoomableMedia } from "@/components/ui/ZoomableMedia";

const getGradient = (name: string) => {
  const gradients = [
    "from-[#00E5FF] to-[#8B5CF6]", "from-[#FF4D8D] to-[#8B5CF6]",
    "from-[#FACC15] to-[#FF4D8D]", "from-[#00D97E] to-[#00E5FF]",
    "from-indigo-400 to-purple-500", "from-cyan-400 to-blue-500"
  ];
  return gradients[(name || "U").length % gradients.length];
};

function FeedVideo({ src, postId }: { src: string, postId: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewLogged = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => { });
          if (!viewLogged.current) {
            viewLogged.current = true;
            api.post(`/posts/${postId}/view`).catch(() => { });
          }
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.5 }
    );
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <ZoomableMedia>
      <video
        ref={videoRef}
        src={src}
        controls
        controlsList="nodownload"
        playsInline
        preload="metadata"
        className="w-full max-h-[80vh] object-cover bg-black rounded-lg"
        muted={true}
      />
    </ZoomableMedia>
  );
}

import { useAuth } from "@/context/AuthContext";

export default function FeedPage() {
  const { user } = useAuth();
  const [socialProfile, setSocialProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"For You" | "Following" | "Connections" | "Nearby" | "Communities" | "Events">("For You");
  const [isLoading, setIsLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [expandedPost, setExpandedPost] = useState<any>(null);
  const [insightsPost, setInsightsPost] = useState<any>(null);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<number[]>([]);
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [commentsData, setCommentsData] = useState<Record<number, any[]>>({});
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [showPostEmojiPicker, setShowPostEmojiPicker] = useState(false);
  const [customEmojis, setCustomEmojis] = useState<any[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaUploadType, setMediaUploadType] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [postUploadProgress, setPostUploadProgress] = useState(0);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);
  const [dbStories, setDbStories] = useState<any[]>([]);
  const [storyUploadProgress, setStoryUploadProgress] = useState(0);
  const [activeStoryGroup, setActiveStoryGroup] = useState<any | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: number; name: string; replyToUser?: string } | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [storyVideoDuration, setStoryVideoDuration] = useState<number | null>(null);

  useEffect(() => {
    setStoryVideoDuration(null);
  }, [activeStoryIndex, activeStoryGroup]);

  useEffect(() => {
    if (!activeStoryGroup) return;
    
    const s = activeStoryGroup.stories[activeStoryIndex];
    if (s?.mediaType?.startsWith('video')) {
      return; // Video handles its own auto-advance via onEnded
    }

    const timer = setTimeout(() => {
      if (activeStoryIndex < activeStoryGroup.stories.length - 1) {
        setActiveStoryIndex(i => i + 1);
      } else {
        setActiveStoryGroup(null);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeStoryGroup, activeStoryIndex]);

  const handleFileSelect = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaUploadType(file.type.split('/')[0]); // image, video, audio
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setMediaPreview(null);
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaUploadType("");
    setShowPoll(false);
    setPollOptions(['', '']);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleComments = async (postId: number) => {
    if (expandedComments === postId) {
      setExpandedComments(null);
      return;
    }
    setExpandedComments(postId);
    if (!commentsData[postId]) {
      try {
        const res = await api.get(`/posts/${postId}/comments`);
        setCommentsData(prev => ({ ...prev, [postId]: res.data.data }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const submitComment = async (postId: number) => {
    if (!newComment.trim()) return;
    const tempId = Date.now();
    const commentContent = newComment;
    const newCommentObj = {
      id: tempId,
      content: commentContent,
      display_name: socialProfile?.display_name || user?.email?.split('@')[0] || "You",
      avatar_url: socialProfile?.avatar_url || null,
      created_at: new Date().toISOString(),
      is_liked: false,
      likes_count: 0
    };
    
    // Optimistic Update
    setCommentsData(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCommentObj]
    }));
    setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
    setNewComment("");

    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: commentContent });
      // Replace temp ID with real ID
      setCommentsData(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).map((c: any) => c.id === tempId ? { ...c, id: res.data.commentId } : c)
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to post comment");
      // Revert optimistic update
      setCommentsData(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c: any) => c.id !== tempId)
      }));
      setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: Math.max(0, (p.comments_count || 1) - 1) } : p));
    }
  };

  const toggleBookmark = (postId: number) => {
    setBookmarkedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Aurora Network',
          text: 'Check out this post on Aurora!',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      alert("Native share is not supported on this device.");
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts/feed');
      if (res.data?.data) setPosts(res.data.data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await api.get('/posts/stories/all');
      if (res.data?.data) {
        setDbStories(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch stories", err);
    }
  };

  const uploadStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/media/upload', formData, {
        // headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setStoryUploadProgress(percentCompleted);
        }
      });
      if (uploadRes.data?.data?.url) {
        await api.post('/posts/stories', {
          content: '',
          mediaUrl: uploadRes.data.data.url,
          mediaType: uploadRes.data.data.type || 'image'
        });
        fetchStories();
      }
    } catch (err) {
      console.error("Failed to upload story", err);
    } finally {
      setStoryUploadProgress(0);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await api.get('/connections/list');
      setConnections(res.data?.data || []);
    } catch (err) { console.error('Failed to fetch connections', err); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const items = res.data?.data?.items || [];
      setNotifications(items);
      setUnreadNotifs(res.data?.data?.pagination?.unread || items.filter((n: any) => !n.is_read || n.is_read === 0).length);
    } catch (err) { console.error('Failed to fetch notifications', err); }
  };

  const markNotifsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadNotifs(0);
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (err) { console.error('Failed to mark read', err); }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await api.get('/connections/pending');
      setPendingRequests(res.data?.data || []);
    } catch (err) { console.error('Failed to fetch pending requests', err); }
  };

  const handleAcceptConnection = async (requesterId: number) => {
    try {
      await api.post(`/connections/accept/${requesterId}`);
      toast.success('Connection accepted!');
      fetchPendingRequests();
      fetchConnections();
    } catch (err) { toast.error('Failed to accept'); }
  };

  const handleRejectConnection = async (requesterId: number) => {
    try {
      await api.delete(`/connections/${requesterId}`);
      toast.success('Request declined');
      fetchPendingRequests();
    } catch (err) { toast.error('Failed to decline'); }
  };

  useEffect(() => {
    fetchPosts();
    fetchStories();
    fetchConnections();
    fetchPendingRequests();
    fetchNotifications();

    api.get('/social-profile').then(res => {
      if (res.data?.data) setSocialProfile(res.data.data);
    }).catch(console.error);

    // Polling for notifications
    const notifInterval = setInterval(fetchNotifications, 15000);

    api.get('/emojis').then(res => setCustomEmojis(res.data?.data || [])).catch(console.error);

    // Close dropdown on outside click
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setShowNotifMenu(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      clearInterval(notifInterval);
    };
  }, []);

  const renderContent = (text: string) => {
    if (!text) return null;

    // Handle Event Share JSON parsing
    try {
      const parsed = JSON.parse(text);
      if (parsed.type === "EVENT_SHARE" && parsed.event_id) {
        return (
          <div className="bg-[#050816]/50 border border-[#8B5CF6]/30 rounded-[20px] overflow-hidden mt-3 mb-2 hover:border-[#8B5CF6]/60 transition-all cursor-pointer shadow-lg group relative" onClick={() => window.location.href = `/dapp/events/${parsed.event_id}`}>
            {parsed.cover_image ? (
              <img src={getMediaUrl(parsed.cover_image)} alt={parsed.title} className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-[#121633] to-[#050816] flex items-center justify-center">
                <Calendar className="w-12 h-12 text-[#8B5CF6]/40 group-hover:text-[#8B5CF6]/80 transition-colors" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/60 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10 pointer-events-none">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FF4D8D]/20 text-[#FF4D8D] border border-[#FF4D8D]/30 text-[10px] font-bold uppercase tracking-wide mb-2 backdrop-blur-md">
                <Calendar className="w-3 h-3" /> Event Invite
              </div>
              <h4 className="text-xl font-bold text-white leading-tight mb-1">{parsed.title}</h4>
              <p className="text-xs text-white/70 flex items-center gap-1.5 font-medium">
                <Play className="w-3 h-3 text-[#00E5FF]" /> Starts: {new Date(parsed.start_time).toLocaleString()}
              </p>
            </div>
          </div>
        );
      }
    } catch (e) {
      // Not JSON, continue with normal text rendering
    }

    const parts = text.split(/(:\w+:)/g);
    return (
      <>
        {parts.map((part, i) => {
          if (part.startsWith(':') && part.endsWith(':')) {
            const shortcode = part.slice(1, -1);
            const ce = customEmojis.find(e => e.shortcode === shortcode);
            if (ce) return <img key={i} src={ce.image_url} alt={shortcode} title={shortcode} className="inline-block w-6 h-6 object-contain mx-0.5 align-middle" />;
          }
          if (part.includes('@')) {
            const words = part.split(/(\s+)/);
            return words.map((word, wIdx) => {
              if (word.startsWith('@') && word.length > 1) {
                return <span key={wIdx} className="text-[#00E5FF] font-semibold">{word}</span>;
              }
              return <span key={wIdx}>{word}</span>;
            });
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  const submitPost = async () => {
    if (!postContent.trim() && !mediaFile) return;
    setIsPosting(true);
    try {
      let mediaUrl: string | null = null;
      let mediaType: string = 'text';

      let isAiGenerated = false;

      // Step 1: Handle Polls or Media
      if (showPoll) {
        const validOptions = pollOptions.filter(opt => opt.trim() !== '');
        if (validOptions.length >= 2) {
          mediaType = 'poll';
          mediaUrl = JSON.stringify(validOptions);
        } else {
          setShowPoll(false); // Cancel invalid poll
        }
      } else if (mediaFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', mediaFile);
        const uploadRes = await api.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setPostUploadProgress(percentCompleted);
          }
        });
        if (uploadRes.data?.data?.url) {
          mediaUrl = uploadRes.data.data.url;
          mediaType = uploadRes.data.data.type || 'image';
          isAiGenerated = uploadRes.data.data.isAiGenerated || false;
        }
        setIsUploading(false);
      }

      // Step 2: Create post with media URL
      const res = await api.post('/posts', { content: postContent || '', mediaUrl, mediaType, isAiGenerated });
      if (res.data?.postId) {
        setPosts([{
          id: res.data.postId,
          user_email: "You",
          content: postContent,
          media_url: mediaUrl,
          media_type: mediaType,
          is_ai_generated: isAiGenerated,
          created_at: new Date().toISOString(),
          likes_count: 0,
          comments_count: 0
        }, ...posts]);
        setPostContent("");
        clearMedia();
      }
    } catch (err) {
      console.error("Failed to post", err);
      setIsUploading(false);
    } finally {
      setIsPosting(false);
    }
  };

  // Merge dynamic stories
  const renderedStories = useMemo(() => {
    const grouped = new Map<string, any>();
    let myGroup = null;

    dbStories.forEach(s => {
      const uId = s.user_email || s.user_id || 'unknown';
      const isOwner = (s.user_email === user?.email) || (String(s.user_id) === String(user?.id));

      if (!grouped.has(uId)) {
        grouped.set(uId, {
          id: `group-${uId}`,
          name: s.display_name || s.profile_username || s.user_email?.split('@')[0] || "User",
          avatar: s.avatar_url,
          userId: s.user_id,
          isOwner: isOwner,
          stories: []
        });
      }
      grouped.get(uId).stories.push({
        id: s.id,
        mediaUrl: s.media_url,
        mediaType: s.media_type,
        content: s.content,
        created_at: s.created_at,
        isOwner: isOwner,
      });
    });

    // Extract my group
    for (const [uId, group] of Array.from(grouped.entries())) {
      if (group.isOwner) {
        myGroup = group;
        grouped.delete(uId);
        break;
      }
    }

    return [
      { name: "My Moments", isAdd: true, id: 'add', group: myGroup, avatar: myGroup?.avatar },
      ...Array.from(grouped.values())
    ];
  }, [dbStories, user]);

  const handleShare = (postId?: number) => {
    setShareModalOpen(true);
  };

  const handleLikePost = async (postId: number) => {
    // Optimistic Update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newIsLiked = !p.is_liked;
        return { ...p, is_liked: newIsLiked, likes_count: Math.max(0, (p.likes_count || 0) + (newIsLiked ? 1 : -1)) };
      }
      return p;
    }));
    
    try {
      const res = await api.post(`/posts/${postId}/like`);
      const isLiked = res.data.isLiked;
      // Sync with server if needed
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, is_liked: isLiked };
        }
        return p;
      }));
    } catch (e) {
      console.error("Failed to like post", e);
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (postId: number) => {
    if (!newComment.trim()) return;
    const tempId = Date.now();
    let content = newComment;
    if (replyTo?.replyToUser) {
      content = `@${replyTo.replyToUser} ${content}`;
    }
    
    const newCommentObj = {
      id: tempId,
      content,
      display_name: socialProfile?.display_name || user?.email?.split('@')[0] || "You",
      avatar_url: socialProfile?.avatar_url || null,
      created_at: new Date().toISOString(),
      is_liked: false,
      likes_count: 0
    };

    // Optimistic Update
    setCommentsData(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCommentObj]
    }));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
    setNewComment("");
    setReplyTo(null);

    try {
      const res = await api.post(`/posts/${postId}/comments`, { content, parentId: replyTo?.id || null });
      // Refresh real comments in background
      api.get(`/posts/${postId}/comments`).then(res => {
         setCommentsData(prev => ({ ...prev, [postId]: res.data.data }));
      });
    } catch (e) {
      console.error("Failed to add comment", e);
      toast.error("Failed to post comment");
    }
  };

  const handleLikeComment = async (postId: number, commentId: number) => {
    // Optimistic Update
    setCommentsData(prev => {
      const postComments = prev[postId] || [];
      return {
        ...prev,
        [postId]: postComments.map((c: any) => {
          if (c.id === commentId) {
            const newIsLiked = !c.is_liked;
            return { ...c, is_liked: newIsLiked, likes_count: Math.max(0, (c.likes_count || 0) + (newIsLiked ? 1 : -1)) };
          }
          return c;
        })
      };
    });

    try {
      const res = await api.post(`/posts/comments/${commentId}/like`);
      const isLiked = res.data.isLiked;
      // Sync with server if needed
      setCommentsData(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map((c: any) => c.id === commentId ? { ...c, is_liked: isLiked } : c)
        };
      });
    } catch (e) {
      console.error("Failed to like comment", e);
      toast.error("Failed to like comment");
    }
  };

  const [showReportModal, setShowReportModal] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");

  const submitReport = async () => {
    if (!reportReason || !showReportModal) return;
    try {
      await api.post(`/reports/copyright`, { targetType: 'post', targetId: showReportModal, reason: reportReason });
      toast.success("Copyright report submitted successfully. An admin will review it shortly.");
      setShowReportModal(null);
      setReportReason("");
    } catch (e) {
      toast.error("Failed to submit copyright report.");
    }
  };

  const reportCopyright = async (postId: number) => {
    setActiveDropdown(null);
    setShowReportModal(postId);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 h-screen overflow-y-auto hide-scrollbar flex justify-center gap-6 max-w-[1600px] mx-auto pb-32">

      {/* 1. CENTER COLUMN: FEED & CONTENT (60%) */}
      <div className="flex-1 flex flex-col max-w-3xl min-w-0 relative">

        {/* STICKY HEADER GROUP (Top Bar + Tabs + Stories) */}
        <div className="sticky top-0 z-30 bg-[#050816]/95 backdrop-blur-3xl px-4 md:px-4 lg:px-6 border-b border-white/5 shadow-md flex flex-col -mx-4 md:mx-0 mb-4 rounded-b-2xl md:rounded-2xl md:mt-2">

          {/* Top Bar: Modern Social Header */}
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <div className="font-black text-2xl tracking-tighter bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-transparent bg-clip-text">
              AURORA
            </div>

            {/* Global Search */}
            <div className="hidden md:flex flex-1 max-w-sm mx-6 bg-white/5 border border-white/10 rounded-full px-4 py-2 items-center gap-2 focus-within:border-[#00E5FF] transition-colors">
              <Search className="w-4 h-4 text-white/40" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm text-white placeholder-white/40 w-full" />
            </div>

            <div className="flex items-center gap-4">
              <button className="text-white/80 hover:text-white transition-colors relative md:hidden"><Search className="w-6 h-6" /></button>
              <button className="text-white/80 hover:text-white transition-colors relative"><Plus className="w-6 h-6" /></button>
              <div className="relative">
                <button
                  className="text-white/80 hover:text-white transition-colors relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotifMenu(!showNotifMenu);
                    if (!showNotifMenu && unreadNotifs > 0) markNotifsRead();
                  }}
                >
                  <Bell className="w-6 h-6" />
                  {unreadNotifs > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4D8D] text-[9px] font-bold flex items-center justify-center rounded-full border-[2px] border-[#050816]">{unreadNotifs}</span>}
                </button>

                {/* Notifications Dropdown */}
                {showNotifMenu && (
                  <div className="absolute top-10 right-0 w-80 bg-[#161a20] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <h3 className="font-bold text-white">Notifications</h3>
                      <span className="text-xs text-[#00E5FF] cursor-pointer hover:underline" onClick={markNotifsRead}>Mark all read</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto hide-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-white/40 text-sm flex flex-col items-center">
                          <Bell className="w-8 h-8 mb-2 opacity-50" />
                          <p>No new notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif: any) => {
                          let metaObj: any = null;
                          if (notif.meta) {
                            try {
                              metaObj = typeof notif.meta === 'string' ? JSON.parse(notif.meta) : notif.meta;
                            } catch (e) { }
                          }
                          const isConnectionReq = notif.type === 'connection_request';

                          return (
                            <div key={notif.id} className={`p-4 border-b border-white/5 flex gap-3 hover:bg-white/[0.02] transition-colors cursor-pointer ${notif.is_read ? 'opacity-70' : 'bg-[#00E5FF]/5'}`}>
                              {isConnectionReq && metaObj ? (
                                <Link href={`/dapp/u/${metaObj.senderUsername}`} className="shrink-0" onClick={e => e.stopPropagation()}>
                                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-[#0b0e11] hover:scale-105 transition-transform">
                                    {metaObj.senderAvatar ? (
                                      <img src={getMediaUrl(metaObj.senderAvatar)} alt="Sender" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-sm font-bold text-[#00E5FF]">{metaObj.senderName?.[0]?.toUpperCase() || 'U'}</span>
                                    )}
                                  </div>
                                </Link>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF4D8D] to-[#8B5CF6] flex shrink-0 items-center justify-center mt-1">
                                  <Bell className="w-5 h-5 text-white" />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div>
                                    {isConnectionReq && metaObj ? (
                                      <p className="text-sm text-white font-medium mb-1">
                                        <Link href={`/dapp/u/${metaObj.senderUsername}`} className="hover:underline text-[#00E5FF] font-bold" onClick={e => e.stopPropagation()}>
                                          {metaObj.senderName}
                                        </Link>{" "}
                                        sent a request
                                      </p>
                                    ) : (
                                      <p className="text-sm text-white font-medium mb-1">{notif.title}</p>
                                    )}
                                    <p className="text-xs text-white/60 line-clamp-2">{notif.message}</p>
                                    <p className="text-[10px] text-[#00E5FF] mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                  </div>

                                  {isConnectionReq && metaObj && (
                                    <div className="flex gap-1.5 ml-2 mt-1 shrink-0">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAcceptConnection(metaObj.senderId);
                                        }}
                                        className="w-7 h-7 bg-[#0ecb81]/20 hover:bg-[#0ecb81] text-[#0ecb81] hover:text-[#050816] rounded-full flex items-center justify-center transition-all border border-[#0ecb81]/30"
                                        title="Accept"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRejectConnection(metaObj.senderId);
                                        }}
                                        className="w-7 h-7 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-full flex items-center justify-center transition-all border border-red-500/30"
                                        title="Decline"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link href="/dapp/inbox" className="text-white/80 hover:text-white transition-colors relative">
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00E5FF] rounded-full border-[2px] border-[#050816]"></span>
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 text-sm font-medium overflow-x-auto hide-scrollbar w-full pb-1 pt-4">
            {["For You", "Following", "Connections", "Nearby", "Communities", "Events"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`transition-all pb-2 relative whitespace-nowrap ${activeTab === tab ? 'text-white font-bold' : 'text-white/50 hover:text-white/80'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] rounded-full shadow-[0_0_10px_#00E5FF]"></div>}
              </button>
            ))}
          </div>

          {/* Stories Area (Fixed) */}
          <div className="flex gap-3 overflow-x-auto hide-scrollbar scroll-smooth py-4">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 shrink-0" style={{ minWidth: 76 }}>
                  <div className="w-[68px] h-[68px] rounded-full bg-white/10 animate-pulse"></div>
                  <div className="w-12 h-2 bg-white/10 rounded-full animate-pulse"></div>
                </div>
              ))
            ) : (
              renderedStories.map((story, i) => (
                <div key={i} onClick={() => {
                  if (story.isAdd) {
                    if (story.group) { setActiveStoryGroup(story.group); setActiveStoryIndex(0); }
                    else storyInputRef.current?.click();
                  }
                  else { setActiveStoryGroup(story); setActiveStoryIndex(0); }
                }} className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group relative" style={{ minWidth: 76 }}>
                  <div className={`relative rounded-full shrink-0 ${story.isAdd && !story.group ? 'p-[2px] border-2 border-dashed border-white/30' : 'p-[3px] bg-gradient-to-tr from-[#00E5FF] via-[#8B5CF6] to-[#FF4D8D]'}`}>
                    <div className="bg-[#050816] p-[2px] rounded-full">
                      <div className={`w-[60px] h-[60px] rounded-full bg-gradient-to-br ${getGradient(story.name)} flex items-center justify-center text-white font-bold text-xl overflow-hidden`}>
                        {(() => {
                          let coverMedia = null;
                          let isVideo = false;
                          const storiesArr = story.group ? story.group.stories : story.stories;
                          if (storiesArr && storiesArr.length > 0) {
                            for (let idx = storiesArr.length - 1; idx >= 0; idx--) {
                              if (storiesArr[idx].mediaUrl) {
                                coverMedia = getMediaUrl(storiesArr[idx].mediaUrl);
                                isVideo = storiesArr[idx].mediaType?.startsWith('video');
                                break;
                              }
                            }
                          }
                          if (coverMedia) {
                            if (isVideo) return <video src={coverMedia} className="w-full h-full object-cover" />;
                            return <img src={coverMedia} className="w-full h-full object-cover" />;
                          }
                          return story.avatar ? <img src={getMediaUrl(story.avatar)} className="w-full h-full object-cover" /> : (story.isAdd ? <User className="w-6 h-6 text-white/50" /> : story.name[0]);
                        })()}
                      </div>
                    </div>
                    {story.isAdd && storyUploadProgress > 0 && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center backdrop-blur-sm z-20">
                        <div className="w-8 h-8 relative flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="16" cy="16" r="14" className="stroke-white/20" strokeWidth="3" fill="none" />
                            <circle cx="16" cy="16" r="14" className="stroke-[#00E5FF] transition-all duration-300" strokeWidth="3" fill="none" strokeDasharray="88" strokeDashoffset={88 - (88 * storyUploadProgress) / 100} />
                          </svg>
                          <span className="absolute text-[9px] text-white font-bold">{storyUploadProgress}%</span>
                        </div>
                      </div>
                    )}
                    {story.isAdd && storyUploadProgress === 0 && (
                      <div
                        onClick={(e) => { e.stopPropagation(); storyInputRef.current?.click(); }}
                        className="absolute bottom-0 right-0 w-5 h-5 bg-[#00E5FF] rounded-full flex items-center justify-center border-[2px] border-[#050816] hover:scale-110 transition-transform z-10"
                      >
                        <Plus className="w-3 h-3 text-[#050816] font-bold" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-white/70 group-hover:text-white transition-colors font-medium truncate max-w-[70px] text-center">{story.name}</span>
                </div>
              ))
            )}
            <input ref={storyInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={uploadStory} disabled={storyUploadProgress > 0} />
          </div>
        </div>

        {/* Content Area Based on Tab */}
        <div className="space-y-6 pb-20 mt-2">

          {(activeTab === "For You" || activeTab === "Following") && (
            <>
              {/* Create Post Input */}
              {/* Hidden file input */}
              <input ref={fileInputRef} type="file" className="hidden" onChange={onFileChange} />

              <div className="bg-white/[0.05] backdrop-blur-[24px] border border-white/[0.08] rounded-[28px] p-4 md:p-5 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10 flex items-center justify-center bg-[#0b0e11]">
                    {socialProfile?.avatar_url ? (
                      <img src={getMediaUrl(socialProfile.avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getGradient(socialProfile?.display_name || socialProfile?.username || 'U')} flex items-center justify-center font-bold text-white text-lg`}>
                        {(socialProfile?.display_name || socialProfile?.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="What's on your mind?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none resize-none h-12 py-2"
                    />
                  </div>
                </div>

                {/* Media Preview */}
                {mediaFile && (
                  <div className="mt-3 relative">
                    <button onClick={clearMedia} className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"><X className="w-4 h-4" /></button>
                    {mediaUploadType === 'image' && mediaPreview && (
                      <img src={mediaPreview} alt="Preview" className="w-full max-h-[300px] object-cover rounded-2xl border border-white/10" />
                    )}
                    {mediaUploadType === 'video' && mediaPreview && (
                      <video src={mediaPreview} controls playsInline className="w-full max-h-[300px] rounded-2xl border border-white/10" />
                    )}
                    {mediaUploadType === 'audio' && (
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                        <Mic className="w-6 h-6 text-[#FF4D8D]" />
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium truncate">{mediaFile.name}</p>
                          <p className="text-xs text-white/50">{(mediaFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Poll Input Area */}
                {showPoll && !mediaFile && (
                  <div className="mt-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-white flex items-center gap-2"><List className="w-4 h-4 text-[#FACC15]" /> Create Poll</span>
                      <button onClick={() => setShowPoll(false)} className="text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-2">
                      {pollOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...pollOptions];
                              newOpts[idx] = e.target.value;
                              setPollOptions(newOpts);
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FACC15]/50"
                          />
                          {pollOptions.length > 2 && (
                            <button onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))} className="text-white/40 hover:text-red-400 p-2 shrink-0">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {pollOptions.length < 4 && (
                      <button
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        className="mt-3 text-xs font-semibold text-[#FACC15] hover:text-[#FACC15]/80 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Option
                      </button>
                    )}
                  </div>
                )}

                {/* Action Bar (Aligned with post box styles) */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <div className="flex-1 flex items-center gap-4 md:gap-6 overflow-x-auto hide-scrollbar mr-4">
                    <button onClick={() => { setShowPoll(false); handleFileSelect('image/*'); }} className="flex items-center gap-2 text-white/80 hover:text-[#00E5FF] transition-colors text-sm font-medium hover:scale-110 whitespace-nowrap"><ImageIcon className="w-6 h-6" /> Photo</button>
                    <button onClick={() => { setShowPoll(false); handleFileSelect('video/*'); }} className="flex items-center gap-2 text-white/80 hover:text-[#FF4D8D] transition-colors text-sm font-medium hover:scale-110 whitespace-nowrap"><Play className="w-6 h-6" /> Video</button>
                    <button onClick={() => { setShowPoll(false); handleFileSelect('audio/*'); }} className="flex items-center gap-2 text-white/80 hover:text-[#00D97E] transition-colors text-sm font-medium hover:scale-110 whitespace-nowrap"><Mic className="w-6 h-6" /> Audio</button>
                    <button onClick={() => { setMediaFile(null); setShowPoll(!showPoll); }} className="flex items-center gap-2 text-white/80 hover:text-[#FACC15] transition-colors text-sm font-medium hover:scale-110 whitespace-nowrap"><List className="w-6 h-6" /> Poll</button>

                    <div className="relative z-50">
                      <button onClick={(e) => { e.stopPropagation(); setShowPostEmojiPicker(!showPostEmojiPicker); }} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium hover:scale-110 whitespace-nowrap"><Smile className="w-6 h-6" /> Emoji</button>
                      {showPostEmojiPicker && (
                        <div className="absolute top-full mt-2 left-0 md:left-auto md:right-0 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden border border-white/10 w-[300px] z-50 bg-[#050816]" onClick={e => e.stopPropagation()}>
                          <EmojiPicker
                            theme={Theme.DARK}
                            width="100%"
                            customEmojis={customEmojis.map(e => ({ id: e.shortcode, names: [e.shortcode], imgUrl: e.image_url }))}
                            onEmojiClick={(emojiData: any) => {
                              const insert = emojiData.isCustom ? `:${emojiData.id}:` : emojiData.emoji;
                              setPostContent(prev => prev + insert);
                              setShowPostEmojiPicker(false);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={submitPost}
                    disabled={isPosting || isUploading || (!postContent.trim() && !mediaFile)}
                    className="px-8 shrink-0 bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-white text-sm font-bold py-2.5 rounded-full hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    {isUploading && postUploadProgress > 0 && (
                      <div className="absolute inset-0 bg-black/20" style={{ width: `${100 - postUploadProgress}%`, right: 0, left: 'auto', transition: 'width 0.3s' }}></div>
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {(isPosting || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isUploading ? `Uploading ${postUploadProgress}%` : isPosting ? 'Posting...' : 'Post'}
                    </span>
                  </button>
                </div>
              </div>

              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/[0.05] backdrop-blur-[24px] border border-white/[0.08] rounded-[28px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="w-32 h-3 bg-white/10 rounded-full animate-pulse"></div>
                        <div className="w-16 h-2 bg-white/10 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="w-full aspect-[4/5] rounded-2xl bg-white/5 animate-pulse mb-4"></div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                      <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                      <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {posts.length > 0 ? posts.map(post => (
                    <div key={post.id} className="bg-[#0B0F19] border border-white/5 rounded-2xl p-5 shadow-lg hover:border-white/10 transition-colors relative">
                      {/* Clickable Overlay for Post Expansion */}
                      <div className="absolute inset-0 z-0 cursor-pointer" onClick={() => setExpandedPost(post)}></div>

                      <div className="flex justify-between items-start mb-4 relative z-[60] pointer-events-auto">
                        <Link href={`/dapp/u/${post.profile_username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                          {post.avatar_url ? (
                            <img src={getMediaUrl(post.avatar_url)} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                          ) : (
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10 text-white font-bold text-sm`}>
                              {(post.display_name || post.user_email || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="text-[15px] font-semibold text-white flex items-center gap-1.5 hover:underline decoration-[#5bbcff]">
                              {post.display_name || post.user_email?.split('@')[0] || 'Unknown'}
                              {post.badge_type && post.badge_type !== 'none' && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ml-1 tracking-wider font-bold ${post.badge_type === 'business' ? 'bg-[#FACC15]/20 text-[#FACC15]' :
                                    post.badge_type === 'premium' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' :
                                      'bg-[#00E5FF]/20 text-[#00E5FF]'
                                  }`}>
                                  {post.badge_type}
                                </span>
                              )}
                              {(!post.badge_type || post.badge_type === 'none') && <BadgeCheck className="w-4 h-4 text-[#00E5FF]" />}
                            </h3>
                            <p className="text-xs text-white/40">{new Date(post.created_at).toLocaleString()}</p>
                          </div>
                        </Link>
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === post.id ? null : post.id); }} className="text-white/40 hover:text-white p-2 transition-colors rounded-full hover:bg-white/5"><MoreHorizontal className="w-5 h-5" /></button>

                          {/* Post Context Menu */}
                          {activeDropdown === post.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#050816]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1 animate-in slide-in-from-top-2" onClick={e => e.stopPropagation()}>
                              {(String(post.user_id) === String(user?.id) || post.user_email === user?.email) && (
                                <>
                                  <button onClick={() => { setActiveDropdown(null); alert("Edit coming soon"); }} className="w-full px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors text-left">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                                    Edit Post
                                  </button>
                                  <button onClick={async () => {
                                    setActiveDropdown(null);
                                    if (confirm("Are you sure you want to delete this post?")) {
                                      try {
                                        await api.delete(`/posts/${post.id}`);
                                        setPosts(posts.filter(p => p.id !== post.id));
                                        toast.success("Post deleted");
                                      } catch (e) {
                                        console.error(e);
                                        toast.error("Failed to delete post");
                                      }
                                    }
                                  }} className="w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 transition-colors text-left">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    Delete Post
                                  </button>
                                </>
                              )}
                              <div className="h-px w-full bg-white/10 my-1"></div>
                              <button onClick={() => { setActiveDropdown(null); alert("Report clicked"); }} className="w-full px-4 py-3 text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 flex items-center gap-3 transition-colors text-left">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                                Report Post
                              </button>
                              <button onClick={() => reportCopyright(post.id)} className="w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 transition-colors text-left">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
                                Report Copyright
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {post.hidden_reason ? (
                        <div className="w-full h-32 md:h-48 bg-black/40 rounded-2xl flex items-center justify-center border border-white/10 relative z-10 pointer-events-auto text-white/60 p-6 text-center mb-4">
                          <div className="flex flex-col items-center gap-2">
                            <X className="w-8 h-8 opacity-50" />
                            <p className="font-bold">Content Hidden</p>
                            <p className="text-sm">{post.hidden_reason}</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-white/90 mb-4 whitespace-pre-wrap relative z-10 pointer-events-auto">
                            {renderContent(post.content)}
                          </div>
                          {post.media_url && (
                            <div className="w-full rounded-md overflow-hidden mb-4 bg-black/20 flex items-center justify-center relative z-10 pointer-events-auto max-h-[80vh]">
                              {post.is_ai_generated ? (
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 z-20 shadow-lg" title="AI Generated">
                                  <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
                                  <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider">AI Created</span>
                                </div>
                              ) : null}
                              {post.media_type === 'video' ? (
                                <FeedVideo src={getMediaUrl(post.media_url)} postId={post.id} />
                              ) : post.media_type === 'audio' ? (
                                <div className="flex items-center gap-3 p-4 bg-white/5 w-full">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4D8D] to-[#8B5CF6] flex items-center justify-center shrink-0 shadow-lg"><Mic className="w-5 h-5 text-white" /></div>
                                  <audio src={getMediaUrl(post.media_url)} controls preload="metadata" className="flex-1 h-10" />
                                </div>
                              ) : post.media_type === 'poll' ? (
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 w-full">
                                  {(() => {
                                    try {
                                      const opts = JSON.parse(post.media_url);
                                      return (opts as string[]).map((opt, i) => (
                                        <button key={i} className="w-full relative overflow-hidden bg-black/40 hover:bg-black/60 border border-white/10 rounded-xl p-3 text-left transition-colors group/poll">
                                          <div className="absolute inset-y-0 left-0 bg-[#FACC15]/20 w-0 group-hover/poll:w-[30%] transition-all duration-500 rounded-xl"></div>
                                          <div className="relative flex justify-between text-sm text-white/90">
                                            <span>{opt}</span>
                                            <span className="opacity-0 group-hover/poll:opacity-100 text-[#FACC15] font-bold">Vote</span>
                                          </div>
                                        </button>
                                      ));
                                    } catch (e) {
                                      return <p className="text-white/50">Poll data unavailable</p>;
                                    }
                                  })()}
                                </div>
                              ) : (
                                <img src={getMediaUrl(post.media_url)} alt="Post media" className="w-full max-h-[80vh] object-contain" loading="lazy" />
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center justify-between mb-4 relative z-10 pointer-events-auto">
                        <div className="flex items-center gap-6">
                          <button onClick={() => handleLikePost(post.id)} className={`flex items-center gap-2 transition-colors ${post.is_liked ? 'text-[#FF4D8D]' : 'text-white/80 hover:text-[#FF4D8D]'}`}>
                            <Heart className={`w-6 h-6 transition-transform hover:scale-110 ${post.is_liked ? 'fill-[#FF4D8D] text-[#FF4D8D]' : ''}`} />
                            <span className="font-bold">{post.likes_count || 0}</span>
                          </button>
                          <button onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)} className="flex items-center gap-2 text-white/80 hover:text-[#00E5FF] transition-colors">
                            <MessageCircle className="w-6 h-6 transition-transform hover:scale-110" />
                            <span className="font-bold">{post.comments_count || 0}</span>
                          </button>
                          <button onClick={() => handleShare(post.id)} className="flex items-center gap-2 text-white/80 hover:text-[#00D97E] transition-colors">
                            <Share2 className="w-6 h-6 transition-transform hover:scale-110" />
                            <span className="font-bold">{post.shares_count || 0}</span>
                          </button>
                          <button onClick={() => { alert('Send Gift coming soon!') }} className="flex items-center gap-2 text-white/80 hover:text-[#8B5CF6] transition-colors">
                            <Gift className="w-6 h-6 transition-transform hover:scale-110" />
                          </button>
                        </div>
                        <button onClick={() => toggleBookmark(post.id)} className="text-white/80 hover:text-[#FACC15] transition-colors hover:scale-110">
                          <Bookmark className={`w-6 h-6 ${bookmarkedPosts.includes(post.id) ? 'fill-[#FACC15] text-[#FACC15]' : ''}`} />
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedComments === post.id && (
                        <div className="mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2 relative z-10 pointer-events-auto">
                          <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto hide-scrollbar">
                            {(commentsData[post.id] || []).filter((c: any) => !c.parent_id).length > 0 ? (
                              (commentsData[post.id] || []).filter((c: any) => !c.parent_id).map((comment: any) => (
                                <div key={comment.id} className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#0b0e11] overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                                    {comment.avatar_url ? <img src={getMediaUrl(comment.avatar_url)} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-white/50" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-2 flex-1 border border-white/5">
                                      <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-xs font-bold text-white/80 hover:underline cursor-pointer"><Link href={`/dapp/u/${comment.username}`}>{comment.display_name || comment.user_email?.split('@')[0]}</Link></h4>
                                        <span className="text-[10px] text-white/40">{new Date(comment.created_at).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-sm text-white/90 whitespace-pre-wrap">{renderContent(comment.content)}</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1.5 ml-2">
                                      <button onClick={() => handleLikeComment(post.id, comment.id)} className={`text-[10px] flex items-center gap-1 transition-colors ${comment.is_liked ? 'text-[#FF4D8D]' : 'text-white/60 hover:text-[#FF4D8D]'}`}>
                                        <Heart className={`w-3 h-3 ${comment.is_liked ? 'fill-[#FF4D8D] text-[#FF4D8D]' : ''}`} /> {comment.likes_count || 0}
                                      </button>
                                      <button onClick={() => { setReplyTo({ id: comment.id, name: comment.display_name || comment.user_email?.split('@')[0] }); document.getElementById(`inline-comment-input-${post.id}`)?.focus(); }} className="text-[10px] text-white/60 hover:text-white transition-colors">Reply</button>
                                    </div>

                                    {/* Inline Replies */}
                                    {(commentsData[post.id] || []).filter((c: any) => c.parent_id === comment.id).map((reply: any) => (
                                      <div key={reply.id} className="flex gap-3 mt-3 relative pl-6">
                                        {/* Visual step/tree line */}
                                        <div className="absolute left-[-18px] top-[-16px] bottom-3 w-5 border-l-2 border-b-2 border-white/10 rounded-bl-lg pointer-events-none"></div>

                                        <div className="w-6 h-6 rounded-full bg-[#0b0e11] overflow-hidden shrink-0 border border-white/10 flex items-center justify-center z-10">
                                          {reply.avatar_url ? <img src={getMediaUrl(reply.avatar_url)} className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-white/50" />}
                                        </div>
                                        <div className="flex-1 z-10">
                                          <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-2 flex-1 border border-white/5">
                                            <div className="flex justify-between items-start mb-1">
                                              <h4 className="text-xs font-bold text-white/80 hover:underline cursor-pointer"><Link href={`/dapp/u/${reply.username}`}>{reply.display_name || reply.user_email?.split('@')[0]}</Link></h4>
                                              <span className="text-[10px] text-white/40">{new Date(reply.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-white/90 whitespace-pre-wrap">{renderContent(reply.content)}</p>
                                          </div>
                                          <div className="flex items-center gap-4 mt-1.5 ml-2">
                                            <button onClick={() => handleLikeComment(post.id, reply.id)} className={`text-[10px] flex items-center gap-1 transition-colors ${reply.is_liked ? 'text-[#FF4D8D]' : 'text-white/60 hover:text-[#FF4D8D]'}`}>
                                              <Heart className={`w-3 h-3 ${reply.is_liked ? 'fill-[#FF4D8D] text-[#FF4D8D]' : ''}`} /> {reply.likes_count || 0}
                                            </button>
                                            <button onClick={() => {
                                              setReplyTo({
                                                id: comment.id,
                                                name: reply.display_name || reply.username || reply.user_email?.split('@')[0],
                                                replyToUser: reply.username || reply.user_email?.split('@')[0]
                                              });
                                              document.getElementById(`inline-comment-input-${post.id}`)?.focus();
                                            }} className="text-[10px] text-white/60 hover:text-white transition-colors">Reply</button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-white/40 text-xs text-center py-2">No comments yet. Be the first!</p>
                            )}
                          </div>
                          <div className="flex gap-2 items-start">
                            <div className="w-8 h-8 rounded-full bg-[#0b0e11] overflow-hidden shrink-0 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                              {socialProfile?.avatar_url ? (
                                <img src={getMediaUrl(socialProfile.avatar_url)} className="w-full h-full object-cover" />
                              ) : (
                                (socialProfile?.display_name || socialProfile?.username || 'U')[0].toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                              {replyTo && (
                                <div className="flex items-center justify-between bg-white/5 px-3 py-1.5 rounded-2xl text-xs text-white/60 mb-1">
                                  <span>Replying to <span className="font-bold text-white">{replyTo.name}</span></span>
                                  <button onClick={() => setReplyTo(null)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                </div>
                              )}
                              <div className="flex-1 bg-black/20 border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 focus-within:border-[#00E5FF] transition-colors h-10">
                                <input
                                  id={`inline-comment-input-${post.id}`}
                                  type="text"
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newComment.trim()) {
                                      handleComment(post.id);
                                    }
                                  }}
                                  placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-white/40"
                                />
                                <div className="relative flex items-center">
                                  <button onClick={() => setShowEmojiPicker(showEmojiPicker === post.id ? null : post.id)} className="text-white/40 hover:text-[#FACC15] transition-colors mr-2">
                                    <Smile className="w-4 h-4" />
                                  </button>
                                  {showEmojiPicker === post.id && (
                                    <div className="absolute bottom-10 right-0 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden border border-white/10 w-[280px]">
                                      <EmojiPicker
                                        theme={Theme.DARK}
                                        customEmojis={customEmojis.map(e => ({ id: e.shortcode, names: [e.shortcode], imgUrl: e.image_url }))}
                                        onEmojiClick={(emojiData: any) => {
                                          const insert = emojiData.isCustom ? `:${emojiData.id}:` : emojiData.emoji;
                                          setNewComment(prev => prev + insert);
                                          setShowEmojiPicker(null);
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                <button onClick={() => handleComment(post.id)} disabled={!newComment.trim()} className="text-[#00E5FF] hover:text-[#FF4D8D] disabled:opacity-50 transition-colors">
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  )) : (
                    <div className="text-center py-10">
                      <p className="text-white/40 mb-2">No posts yet.</p>
                      <p className="text-white/60 text-sm">Be the first to share something!</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeTab === "Nearby" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white/[0.05] border border-white/10 rounded-2xl overflow-hidden shadow-lg group cursor-pointer relative pb-4">
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#00E5FF]/20 to-[#8B5CF6]/20 relative">
                    <img src={`https://i.pravatar.cc/300?img=${i + 10}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050816] to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-bold text-white text-lg">User {i} <BadgeCheck className="inline w-4 h-4 text-[#00E5FF]" /></h3>
                      <p className="text-sm text-[#00E5FF] font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> 2.{i} miles away</p>
                    </div>
                  </div>
                  <div className="px-4 mt-3 flex justify-between">
                    <button className="bg-white/10 hover:bg-[#FF4D8D] text-white rounded-full p-2 transition-colors"><Heart className="w-5 h-5" /></button>
                    <button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full px-4 py-2 text-xs font-bold transition-colors shadow-[0_0_15px_rgba(139,92,246,0.5)]">Say Hi</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Events" && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex gap-4 hover:border-white/20 transition-colors cursor-pointer group">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#8B5CF6] shrink-0 flex flex-col items-center justify-center text-white shadow-lg">
                    <span className="text-xs uppercase font-bold opacity-80">Jun</span>
                    <span className="text-3xl font-black">{10 + i}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#00E5FF] transition-colors">Summer Tech Mixer 2026</h3>
                    <p className="text-sm text-white/50 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> Downtown Innovation Center</p>
                    <p className="text-xs text-white/40 mt-2 flex items-center gap-1"><Users className="w-3 h-3" /> {120 * i} attending</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <button className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors border border-white/10">RSVP</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Connections" && (
            <ConnectionsList />
          )}

          {/* Custom Cards in Feed Area (Avatar/Creator) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Link href="/dapp/avatar" className="bg-gradient-to-br from-[#050816] to-[#121633] border border-[#8B5CF6]/30 rounded-[28px] p-5 relative overflow-hidden flex flex-col justify-between min-h-[220px] group cursor-pointer hover:border-[#8B5CF6]/60 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="absolute right-0 bottom-0 w-3/4 opacity-40 mix-blend-screen pointer-events-none group-hover:scale-110 transition-transform duration-500 flex items-center justify-end">
                <User className="w-32 h-32 text-[#00E5FF] translate-x-4 translate-y-4" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white">3D Avatar</h3>
                  <span className="bg-[#8B5CF6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Lv. 8</span>
                </div>
                <div className="w-2/3">
                  <div className="flex justify-between text-[10px] text-white/60 mb-1">
                    <span>XP 1200 / 2000</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] w-[60%]"></div>
                  </div>
                </div>
              </div>
              <button className="w-fit mt-6 bg-white/10 group-hover:bg-[#8B5CF6] border border-white/20 group-hover:border-transparent text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md transition-all relative z-10">
                Customize
              </button>
            </Link>

            <div className="bg-white/[0.05] backdrop-blur-[24px] border border-white/[0.08] rounded-[28px] p-5 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">Creator Hub</h3>
                <span className="text-xs text-[#00E5FF] font-medium">Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-2 flex-1">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-center hover:bg-white/10 transition-colors cursor-pointer">
                  <p className="text-[10px] text-white/50 uppercase mb-1 font-semibold">Followers</p>
                  <p className="font-bold text-white text-lg">24.5K</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-center hover:bg-white/10 transition-colors cursor-pointer">
                  <p className="text-[10px] text-white/50 uppercase mb-1 font-semibold">Revenue</p>
                  <p className="font-bold text-white text-lg">$5.6K</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-center hover:bg-white/10 transition-colors cursor-pointer">
                  <p className="text-[10px] text-white/50 uppercase mb-1 font-semibold">Views</p>
                  <p className="font-bold text-white text-lg">152K</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-center hover:bg-white/10 transition-colors cursor-pointer">
                  <p className="text-[10px] text-white/50 uppercase mb-1 font-semibold">Subscribers</p>
                  <p className="font-bold text-white text-lg">1.2K</p>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#FF4D8D] to-[#FACC15] flex items-center justify-center text-white"><ImageIcon className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className="text-xs text-white/50 uppercase">Top Post</p>
                  <p className="text-sm font-bold text-white">Sunset Photography</p>
                  <p className="text-[10px] text-white/40">May 18, 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT COLUMN: WIDGETS (40%) */}
      <div className="hidden lg:flex flex-col gap-6 w-[400px] shrink-0">

        {/* Dating Card Widget */}
        <Link href="/dapp/dating" className="bg-white/[0.05] backdrop-blur-[24px] border border-white/[0.08] rounded-[28px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative group cursor-pointer hover:border-[#FF4D8D]/50 transition-all">
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <span className="text-white text-sm font-bold shadow-md">Dating for you</span>
            <span className="text-[#FF4D8D] text-sm font-bold drop-shadow-[0_0_5px_#FF4D8D]">95% Match</span>
          </div>

          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur rounded-full p-1.5 z-10 hover:bg-white/20 transition">
            <MoreHorizontal className="w-4 h-4 text-white" />
          </div>

          <div className="relative h-[450px] bg-gradient-to-b from-[#1E293B] to-[#0F172A] flex flex-col items-center justify-center pt-10">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FF4D8D] to-[#8B5CF6] flex items-center justify-center mb-4 text-white text-5xl font-bold shadow-[0_0_30px_rgba(255,77,141,0.4)] group-hover:scale-110 transition-transform duration-500">M</div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/40 to-transparent"></div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">Michael, 28 <div className="w-4 h-4 bg-[#00E5FF] rounded-full shadow-[0_0_5px_#00E5FF] flex items-center justify-center"><Sparkles className="w-2.5 h-2.5 text-[#050816]" /></div></h2>
            <p className="text-white/70 text-xs flex items-center gap-1 mb-3"><MapPin className="w-3 h-3" /> New York, USA</p>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] text-white">Travel</span>
              <span className="px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] text-white">Photography</span>
              <span className="px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] text-white">Fitness</span>
              <span className="px-2 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] text-white/60">+3</span>
            </div>
          </div>

          {/* Dating Actions - Floating Overlap */}
          <div className="absolute top-[40%] right-4 flex flex-col gap-3 z-20">
            <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#FF5A5A] hover:border-[#FF5A5A] transition-all group/btn shadow-lg">
              <X className="w-5 h-5 text-[#FF5A5A] group-hover/btn:text-white" />
            </button>
            <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#FACC15] hover:border-[#FACC15] transition-all group/btn shadow-lg">
              <Star className="w-5 h-5 text-[#FACC15] group-hover/btn:text-white" />
            </button>
            <button className="w-14 h-14 rounded-full bg-[#00D97E]/20 backdrop-blur-md border border-[#00D97E]/50 flex items-center justify-center hover:bg-[#00D97E] hover:scale-110 transition-all group/btn shadow-[0_0_15px_rgba(0,217,126,0.3)]">
              <Heart className="w-6 h-6 text-[#00D97E] fill-[#00D97E] group-hover/btn:text-white group-hover/btn:fill-white" />
            </button>
            <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#8B5CF6] hover:border-[#8B5CF6] transition-all group/btn shadow-lg">
              <Zap className="w-5 h-5 text-[#8B5CF6] fill-[#8B5CF6] group-hover/btn:text-white group-hover/btn:fill-white" />
            </button>
          </div>
        </Link>

        {/* Connections & Pending Requests Widget */}
        <div className="bg-white/[0.05] backdrop-blur-[24px] border border-white/[0.08] rounded-[28px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2"><Link2 className="w-5 h-5 text-[#00E5FF]" /> Connections</h3>
            <Link href="/dapp/profile" className="text-xs text-[#8B5CF6] hover:text-[#C084FC] cursor-pointer font-medium">View all</Link>
          </div>

          {/* Pending Requests */}
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest text-[#FF4D8D] font-bold mb-3 flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Pending Requests ({pendingRequests.length})</p>
            {pendingRequests.length > 0 ? (
              <>
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map((req: any) => (
                    <div key={req.id} className="flex items-center justify-between">
                      <Link href={`/dapp/u/${req.username}`} className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-[#0b0e11] flex items-center justify-center">
                          {req.avatar_url ? (
                            <img src={getMediaUrl(req.avatar_url)} alt={req.username} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-white/50" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight hover:underline decoration-[#00E5FF]">{req.display_name || req.username}</p>
                          <p className="text-[10px] text-white/40">@{req.username}</p>
                        </div>
                      </Link>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleAcceptConnection(req.requester_id)} className="px-2.5 py-1 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] text-[10px] font-bold hover:bg-[#00E5FF]/40 transition-colors border border-[#00E5FF]/30"><UserCheck className="w-3 h-3" /></button>
                        <button onClick={() => handleRejectConnection(req.requester_id)} className="px-2.5 py-1 rounded-lg bg-white/5 text-white/40 text-[10px] font-bold hover:bg-red-500/20 hover:text-red-400 transition-colors border border-white/10"><X className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                {pendingRequests.length > 3 && <p className="text-[10px] text-[#8B5CF6] mt-2 cursor-pointer text-center">+{pendingRequests.length - 3} more requests</p>}
              </>
            ) : (
              <p className="text-[10px] text-white/40 italic">No pending requests</p>
            )}
          </div>

          {/* Connected People */}
          <div className="border-t border-white/5 my-3"></div>
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-[#00E5FF] font-bold flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Your Network ({connections.length})</p>
            {connections.length > 0 ? (
              <>
                {connections.slice(0, 5).map((conn: any) => (
                  <Link key={conn.connection_id} href={`/dapp/u/${conn.username}`} className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-[#0b0e11] flex items-center justify-center">
                      {conn.avatar_url ? (
                        <img src={getMediaUrl(conn.avatar_url)} alt={conn.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full rounded-full bg-gradient-to-br ${getGradient(conn.display_name || conn.username)} flex items-center justify-center font-bold text-white text-sm`}>
                          {(conn.display_name || conn.username || 'U')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-[#00E5FF] transition-colors truncate flex items-center gap-1">
                        {conn.display_name || conn.username}
                        {conn.badge_type && conn.badge_type !== 'none' && <BadgeCheck className="w-3 h-3 text-[#00E5FF] shrink-0" />}
                      </p>
                      <p className="text-[10px] text-white/40 truncate">@{conn.username}</p>
                    </div>
                  </Link>
                ))}
                {connections.length > 5 && (
                  <Link href="/dapp/profile" className="flex items-center justify-center gap-1 text-[10px] text-[#8B5CF6] hover:text-[#C084FC] font-bold pt-1 transition-colors">
                    See all {connections.length} connections <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-xs text-white/40">No connections yet</p>
                <Link href="/dapp/search" className="text-[10px] text-[#00E5FF] font-bold mt-1 inline-block">Discover people</Link>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Header Card */}
        <div className="bg-white/[0.05] backdrop-blur-[24px] border border-white/[0.08] rounded-[28px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-lg">Wallet</h3>
            <MoreHorizontal className="w-5 h-5 text-white/40" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-tr from-[#1E293B] to-[#0F172A] border border-white/5 rounded-2xl p-4 shadow-inner flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FACC15]/20 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.3)]"><Coins className="w-5 h-5 text-[#FACC15] fill-[#FACC15]" /></div>
              <div>
                <p className="text-[10px] text-white/50 uppercase">Coins</p>
                <p className="font-bold text-white text-lg">12,450</p>
              </div>
            </div>
            <div className="bg-gradient-to-tr from-[#8B5CF6]/20 to-[#FF4D8D]/20 border border-[#8B5CF6]/30 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-screen"></div>
              <div className="w-10 h-10 rounded-full bg-[#C084FC]/30 flex items-center justify-center shadow-[0_0_15px_rgba(192,132,252,0.5)] z-10"><Gem className="w-5 h-5 text-white fill-white" /></div>
              <div className="z-10">
                <p className="text-[10px] text-white/80 uppercase">Gems</p>
                <p className="font-bold text-white text-lg drop-shadow">850</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center px-2">
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#00E5FF]/20 group-hover:border-[#00E5FF]/50 transition-colors"><Coins className="w-5 h-5 text-[#00E5FF]" /></div>
              <span className="text-[10px] text-white/70">Buy Coins</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#FF4D8D]/20 group-hover:border-[#FF4D8D]/50 transition-colors"><Gift className="w-5 h-5 text-[#FF4D8D]" /></div>
              <span className="text-[10px] text-white/70">Send Gift</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#8B5CF6]/20 group-hover:border-[#8B5CF6]/50 transition-colors"><Star className="w-5 h-5 text-[#8B5CF6]" /></div>
              <span className="text-[10px] text-white/70">Subscriptions</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors"><Sparkles className="w-5 h-5 text-[#FACC15]" /></div>
              <span className="text-[10px] text-white/70">Store</span>
            </div>
          </div>
        </div>

        {/* Messages Preview */}
        <Link href="/dapp/inbox" className="bg-white/[0.05] backdrop-blur-[24px] border border-white/[0.08] rounded-[28px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/[0.08] transition-colors cursor-pointer block">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-lg">Messages</h3>
            <span className="text-xs text-[#8B5CF6] hover:text-[#C084FC] cursor-pointer font-medium">View all</span>
          </div>
          <div className="space-y-4">
            {[
              { name: "Emma Johnson", msg: "Hey! How are you?", time: "2m", unread: 2 },
              { name: "Sophia Williams", msg: "That sounds great!", time: "15m", unread: 1 },
              { name: "Daniel Kim", msg: "See you at the event!", time: "1h", unread: 0 },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(m.name)} flex items-center justify-center text-white font-bold text-sm`}>
                    {m.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">{m.name}</p>
                    <p className={`text-xs ${m.unread > 0 ? 'text-white font-medium' : 'text-white/50'}`}>{m.msg}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-white/40">{m.time}</span>
                  {m.unread > 0 && <span className="w-4 h-4 bg-[#FF4D8D] rounded-full text-[9px] font-bold flex items-center justify-center text-white">{m.unread}</span>}
                </div>
              </div>
            ))}
          </div>
        </Link>

        {/* Communities & Events Split Row */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white/[0.05] backdrop-blur-[24px] border border-white/[0.08] rounded-[28px] p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-sm">Communities</h3>
              <span className="text-[10px] text-[#8B5CF6] cursor-pointer font-medium">View all</span>
            </div>
            <div className="space-y-4">
              {[
                { n: "Travel Lovers", m: "12.4K" },
                { n: "Photography Hub", m: "8.7K" },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center"><Users className="w-4 h-4 text-white" /></div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#00E5FF] transition-colors">{c.n}</p>
                      <p className="text-[9px] text-white/50">{c.m} Members</p>
                    </div>
                  </div>
                  <button className="text-[9px] font-bold text-white bg-white/10 hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] px-2 py-1 rounded-md transition-colors">Join</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white/[0.05] backdrop-blur-[24px] border border-white/[0.08] rounded-[28px] p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-sm">Events Near You</h3>
              <span className="text-[10px] text-[#8B5CF6] cursor-pointer font-medium">View all</span>
            </div>
            <div className="space-y-4">
              {[
                { n: "Sunset Rooftop Party", d: "May 20 - 7:00 PM" },
                { n: "Music Festival 2026", d: "May 25 - May 27" },
              ].map((e, i) => (
                <div key={i} className="flex gap-2 group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#FF4D8D] to-[#FACC15] flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5 text-white" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-white group-hover:text-[#00E5FF] transition-colors leading-tight">{e.n}</p>
                    <p className="text-[8px] text-white/60 mt-0.5">{e.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal Integration (Centered Modal) */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShareModalOpen(false)}>
          <div className="bg-[#050816] border border-white/10 w-full sm:w-[400px] rounded-3xl p-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-6 text-center">Share this Post</h3>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar mb-6 pb-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getGradient('Friend ' + i)} flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform`}>
                    {('Friend ' + i)[0]}
                  </div>
                  <span className="text-xs text-white/70">Friend {i + 1}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-6">
              <button className="flex items-center justify-center gap-2 bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/30 text-[#C084FC] rounded-xl py-3 transition-colors" onClick={() => setShareModalOpen(false)}>
                <Send className="w-5 h-5" /> <span className="text-sm font-bold">Send via Messages</span>
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 transition-colors" onClick={() => { alert('Link Copied!'); setShareModalOpen(false); }}>
                  <Copy className="w-4 h-4" /> <span className="text-sm font-medium">Copy Link</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 transition-colors" onClick={handleNativeShare}>
                  <Share2 className="w-4 h-4" /> <span className="text-sm font-medium">More Apps</span>
                </button>
              </div>
            </div>

            <button onClick={() => setShareModalOpen(false)} className="mt-4 w-full text-white/40 hover:text-white text-sm py-2 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expanded Post Full Screen Modal */}
      {expandedPost && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black overflow-y-auto hide-scrollbar animate-in slide-in-from-bottom-10">
          {/* Header */}
          <div className="sticky top-0 z-[101] flex items-center justify-between p-4 bg-black/80 backdrop-blur-xl border-b border-white/10">
            <button onClick={() => setExpandedPost(null)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <span className="font-bold text-white">Post</span>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          {/* Content */}
          <div className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-6 pb-20">
            <div className="flex items-center gap-3 mb-6">
              {expandedPost.avatar_url ? (
                <img src={expandedPost.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white/10" />
              ) : (
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getGradient(expandedPost.user_email || 'U')} flex items-center justify-center border-2 border-white/10 shadow-lg`}>
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1">
                  {expandedPost.display_name || expandedPost.user_email?.split('@')[0] || 'Unknown'}
                  {expandedPost.badge_type && expandedPost.badge_type !== 'none' && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ml-1 tracking-wider font-bold ${expandedPost.badge_type === 'business' ? 'bg-[#FACC15]/20 text-[#FACC15]' :
                        expandedPost.badge_type === 'premium' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' :
                          'bg-[#00E5FF]/20 text-[#00E5FF]'
                      }`}>
                      {expandedPost.badge_type}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-white/40">{new Date(expandedPost.created_at).toLocaleString()}</p>
              </div>
            </div>

            <p className="text-lg text-white/90 mb-6 whitespace-pre-wrap leading-relaxed">{expandedPost.content}</p>

            {expandedPost.media_url && (
              <div className="w-full rounded-2xl overflow-hidden mb-6 bg-black/40 flex items-center justify-center relative">
                {expandedPost.media_type === 'video' ? (
                  <FeedVideo src={getMediaUrl(expandedPost.media_url)} postId={expandedPost.id} />
                ) : expandedPost.media_type === 'audio' ? (
                  <div className="flex items-center gap-3 p-4 bg-white/5 w-full">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4D8D] to-[#8B5CF6] flex items-center justify-center shrink-0 shadow-lg"><Mic className="w-5 h-5 text-white" /></div>
                    <audio src={getMediaUrl(expandedPost.media_url)} controls preload="metadata" className="flex-1 h-10" />
                  </div>
                ) : (
                  <img src={getMediaUrl(expandedPost.media_url)} className="w-full max-h-[80vh] object-contain" alt="Post media" loading="lazy" />
                )}
              </div>
            )}

            <div className="flex items-center justify-between py-4 border-y border-white/10 mb-6">
              <div className="flex items-center gap-8">
                <button onClick={() => handleLikePost(expandedPost.id)} className={`flex items-center gap-2 transition-colors text-sm font-medium ${expandedPost.is_liked ? 'text-[#FF4D8D]' : 'text-white/80 hover:text-[#FF4D8D]'}`}>
                  <Heart className={`w-6 h-6 ${expandedPost.is_liked ? 'fill-[#FF4D8D] text-[#FF4D8D]' : ''}`} /> {expandedPost.likes_count || 0}
                </button>
                <button className="flex items-center gap-2 text-[#00E5FF] transition-colors text-sm font-medium">
                  <MessageCircle className="w-6 h-6 fill-[#00E5FF]/20" /> {expandedPost.comments_count || 0}
                </button>
                <button onClick={() => { setExpandedPost(null); setShareModalOpen(true); }} className="flex items-center gap-2 text-white/80 hover:text-[#00E5FF] transition-colors text-sm font-medium">
                  <Share2 className="w-6 h-6" />
                </button>
                <button onClick={() => { alert('Send Gift coming soon!') }} className="flex items-center gap-2 text-white/80 hover:text-[#8B5CF6] transition-colors text-sm font-medium">
                  <Gift className="w-6 h-6" />
                </button>
              </div>
              <button className="text-white/80 hover:text-[#FACC15] transition-colors">
                <Bookmark className={`w-6 h-6 ${bookmarkedPosts.includes(expandedPost.id) ? 'fill-[#FACC15] text-[#FACC15]' : ''}`} />
              </button>
            </div>

            <h4 className="font-bold text-white mb-4">Comments</h4>
            <div className="space-y-4">
              <div className="flex gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-white/10 shrink-0 border border-white/20"></div>
                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-2 flex gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    {replyTo && (
                      <div className="flex items-center justify-between bg-white/5 px-2 py-1 rounded-md text-xs text-white/60">
                        <span>Replying to <span className="font-bold text-white">{replyTo.name}</span></span>
                        <button onClick={() => setReplyTo(null)} className="hover:text-white"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                    <input
                      id="comment-input"
                      type="text"
                      placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                      className="flex-1 bg-transparent text-sm text-white px-2 focus:outline-none h-10"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newComment.trim()) {
                          handleComment(expandedPost.id);
                        }
                      }}
                    />
                    <button onClick={() => handleComment(expandedPost.id)} disabled={!newComment.trim()} className="p-2 rounded-xl bg-[#00E5FF] text-black disabled:opacity-50 disabled:bg-white/10 disabled:text-white/40"><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
              {(commentsData[expandedPost.id] || []).filter((c: any) => !c.parent_id).map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0b0e11] overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                    {comment.avatar_url ? <img src={getMediaUrl(comment.avatar_url)} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white/50" />}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-white hover:underline cursor-pointer decoration-[#00E5FF]"><Link href={`/dapp/u/${comment.username}`}>{comment.display_name || comment.user_email?.split('@')[0]}</Link></span>
                        <span className="text-xs text-white/40">{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-white/85 whitespace-pre-wrap">{renderContent(comment.content)}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-2">
                      <button onClick={() => handleLikeComment(expandedPost.id, comment.id)} className={`text-xs flex items-center gap-1 transition-colors ${comment.is_liked ? 'text-[#FF4D8D]' : 'text-white/60 hover:text-[#FF4D8D]'}`}>
                        <Heart className={`w-3.5 h-3.5 ${comment.is_liked ? 'fill-[#FF4D8D] text-[#FF4D8D]' : ''}`} /> {comment.likes_count || 0}
                      </button>
                      <button onClick={() => { setReplyTo({ id: comment.id, name: comment.display_name || comment.user_email?.split('@')[0] }); document.getElementById('comment-input')?.focus(); }} className="text-xs text-white/60 hover:text-white transition-colors">Reply</button>
                    </div>

                    {/* Replies */}
                    {(commentsData[expandedPost.id] || []).filter((c: any) => c.parent_id === comment.id).map((reply: any) => (
                      <div key={reply.id} className="flex gap-3 mt-4">
                        <div className="w-8 h-8 rounded-full bg-[#0b0e11] overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                          {reply.avatar_url ? <img src={getMediaUrl(reply.avatar_url)} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-white/50" />}
                        </div>
                        <div className="flex-1">
                          <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-sm text-white hover:underline cursor-pointer decoration-[#00E5FF]"><Link href={`/dapp/u/${reply.username}`}>{reply.display_name || reply.user_email?.split('@')[0]}</Link></span>
                              <span className="text-xs text-white/40">{new Date(reply.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-white/85 whitespace-pre-wrap">{renderContent(reply.content)}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-2 ml-2">
                            <button onClick={() => handleLikeComment(expandedPost.id, reply.id)} className={`text-xs flex items-center gap-1 transition-colors ${reply.is_liked ? 'text-[#FF4D8D]' : 'text-white/60 hover:text-[#FF4D8D]'}`}>
                              <Heart className={`w-3.5 h-3.5 ${reply.is_liked ? 'fill-[#FF4D8D] text-[#FF4D8D]' : ''}`} /> {reply.likes_count || 0}
                            </button>
                            <button onClick={() => {
                              setReplyTo({
                                id: comment.id,
                                name: reply.display_name || reply.username || reply.user_email?.split('@')[0],
                                replyToUser: reply.username || reply.user_email?.split('@')[0]
                              });
                              document.getElementById('comment-input')?.focus();
                            }} className="text-xs text-white/60 hover:text-white transition-colors">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(!commentsData[expandedPost.id] || commentsData[expandedPost.id].length === 0) && (
                <div className="text-center py-8 text-white/40 text-sm">No comments yet. Be the first to reply!</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Insights Modal */}
      {insightsPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setInsightsPost(null)}>
          <div className="bg-[#050816] border border-white/10 w-full max-w-md rounded-3xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E5FF] via-[#8B5CF6] to-[#FF4D8D]"></div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><BarChart2 className="w-6 h-6 text-[#00E5FF]" /> Post Insights</h3>
              <button onClick={() => setInsightsPost(null)} className="text-white/50 hover:text-white p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-[#0B0F19] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <Heart className="w-5 h-5 text-[#FF4D8D] mb-1.5" />
                <p className="text-lg font-bold text-white">{insightsPost.likes_count || 0}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-0.5">Likes</p>
              </div>
              <div className="bg-[#0B0F19] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <MessageCircle className="w-5 h-5 text-[#00E5FF] mb-1.5" />
                <p className="text-lg font-bold text-white">{insightsPost.comments_count || 0}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-0.5">Replies</p>
              </div>
              <div className="bg-[#0B0F19] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <Share2 className="w-5 h-5 text-[#8B5CF6] mb-1.5" />
                <p className="text-lg font-bold text-white">{insightsPost.shares_count || 0}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-0.5">Shares</p>
              </div>
              <div className="bg-[#0B0F19] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <Users className="w-5 h-5 text-[#FACC15] mb-1.5" />
                <p className="text-lg font-bold text-white">{insightsPost.views_count || 0}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-0.5">Views</p>
              </div>
            </div>

            {/* Visual Graph of Engagement */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-white mb-3">Engagement Breakdown</h4>
              <div className="flex items-end gap-2 h-32 w-full p-4 bg-white/5 border border-white/10 rounded-2xl">
                {[
                  { label: 'Likes', val: insightsPost.likes_count || 0, color: 'bg-[#FF4D8D]' },
                  { label: 'Replies', val: insightsPost.comments_count || 0, color: 'bg-[#00E5FF]' },
                  { label: 'Shares', val: insightsPost.shares_count || 0, color: 'bg-[#8B5CF6]' },
                  { label: 'Views', val: insightsPost.views_count || 0, color: 'bg-[#FACC15]' }
                ].map((bar, idx) => {
                  const maxVal = Math.max(insightsPost.views_count || 0, insightsPost.likes_count || 0, 10);
                  const heightPct = Math.max(10, Math.min(100, (bar.val / maxVal) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                      <div className="absolute -top-8 bg-black/80 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {bar.val} {bar.label}
                      </div>
                      <div className={`w-full max-w-[40px] rounded-t-sm ${bar.color} transition-all duration-700 ease-out`} style={{ height: `${heightPct}%` }}></div>
                      <span className="text-[10px] text-white/50 mt-2 block">{bar.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-center text-white/40">Data is updated in real-time as users interact with your post.</p>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {activeStoryGroup && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black" onClick={() => setActiveStoryGroup(null)}>
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
                    animation: idx === activeStoryIndex ? `story-progress ${s.mediaType?.startsWith('video') ? (storyVideoDuration || 5) : 5}s linear forwards` : 'none'
                  }}
                ></div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-4 pt-8 absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(activeStoryGroup.name)} overflow-hidden border-2 border-white/20 flex items-center justify-center text-white font-bold`}>
                {activeStoryGroup.avatar ? <img src={activeStoryGroup.avatar} className="w-full h-full object-cover" /> : activeStoryGroup.name[0]}
              </div>
              <div>
                <h3 className="text-white font-bold text-sm shadow-black drop-shadow-md">{activeStoryGroup.name}</h3>
                <p className="text-white/60 text-xs shadow-black drop-shadow-md">Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-[250] pointer-events-auto">
              {(activeStoryGroup.stories[activeStoryIndex]?.isOwner || activeStoryGroup.isOwner) && (
                <button onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await api.delete(`/posts/stories/${activeStoryGroup.stories[activeStoryIndex].id}`);
                    const updatedStories = activeStoryGroup.stories.filter((_: any, idx: number) => idx !== activeStoryIndex);
                    if (updatedStories.length === 0) {
                      setActiveStoryGroup(null);
                    } else {
                      setActiveStoryGroup({ ...activeStoryGroup, stories: updatedStories });
                      setActiveStoryIndex(Math.min(activeStoryIndex, updatedStories.length - 1));
                    }
                    fetchStories();
                  } catch (err) {
                    console.error("Failed to delete story", err);
                  }
                }} className="text-white/80 hover:text-red-500 p-2 rounded-full transition-colors bg-black/40 hover:bg-black/80" title="Delete Story">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); setActiveStoryGroup(null); }} className="text-white p-2 hover:bg-white/10 rounded-full bg-black/40"><X className="w-6 h-6" /></button>
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
                    <ZoomableMedia className="w-full h-full">
                      <video 
                        src={getMediaUrl(s.mediaUrl)} 
                        autoPlay 
                        controls 
                        controlsList="nodownload"
                        className="w-full h-full object-contain" 
                        onLoadedMetadata={(e) => setStoryVideoDuration(e.currentTarget.duration)}
                        onEnded={() => {
                          if (activeStoryIndex < activeStoryGroup.stories.length - 1) setActiveStoryIndex(activeStoryIndex + 1);
                          else setActiveStoryGroup(null);
                        }}
                      />
                    </ZoomableMedia>
                  ) : (
                    <ZoomableMedia className="w-full h-full">
                      <img src={getMediaUrl(s.mediaUrl)} className="w-full h-full object-contain" />
                    </ZoomableMedia>
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
    </div>
  );
}
