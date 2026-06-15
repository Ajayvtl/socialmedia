"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { getMediaUrl } from "@/lib/api";
import toast from "react-hot-toast";
import { safeArray } from "@/lib/utils";
import { getCommunityMapEmbedUrl } from "@/lib/communityTopics";
import { IconMap } from "@/lib/iconMapping";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { Users, Link as LinkIcon, QrCode, ShieldAlert, Trash2, ArrowLeft, Image as ImageIcon, Video, Send, Camera, UserPlus, MapPin, Search } from "lucide-react";
import ImageCropperModal from "@/components/ui/ImageCropperModal";
import { getCroppedImg } from "@/lib/cropImage";
import RichTextEditor from "@/components/ui/RichTextEditor";
import InviteModal from "@/components/communities/InviteModal";
import CreateEventModal from "@/components/events/CreateEventModal";
import EventCard from "@/components/events/EventCard";
import { Calendar } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

export default function CommunityDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [community, setCommunity] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'events'>('feed');
  const [isLoading, setIsLoading] = useState(true);
  
  const [showQR, setShowQR] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', rules: '', icon: '', slug: '', avatar_url: '', cover_url: '', is_private: 0, message_permission: 'MEMBER' });
  const [customEmojis, setCustomEmojis] = useState<any[]>([]);
  const [emojiSearch, setEmojiSearch] = useState("");

  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [imageTarget, setImageTarget] = useState<'avatar' | 'cover'>('avatar');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCommunityData();
    }
  }, [id]);

  useEffect(() => {
    if (showEditModal) {
      api.get("/emojis")
        .then(res => setCustomEmojis(res.data?.data || []))
        .catch(err => console.error("Failed to load custom emojis", err));
    }
  }, [showEditModal]);

  const fetchCommunityData = async () => {
    try {
      const [cRes, mRes, pRes, eRes] = await Promise.all([
        api.get(`/communities/${id}`),
        api.get(`/communities/${id}/members`),
        api.get(`/posts/community/${id}`),
        api.get(`/events?community_id=${id}`)
      ]);
      setCommunity(cRes.data.data);
      setMembers(mRes.data.data);
      setPosts(pRes.data.data || []);
      setEvents(eRes.data.data || []);
      
      const cData = cRes.data.data;
      setEditForm({
        name: cData.name || '',
        description: cData.description || '',
        rules: cData.rules || '',
        icon: cData.icon || '🌐',
        slug: cData.slug || '',
        avatar_url: cData.avatar_url || '',
        cover_url: cData.cover_url || '',
        is_private: cData.is_private ? 1 : 0,
        message_permission: cData.message_permission || 'MEMBER',
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load community");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await api.post(`/communities/${id}/join`);
      toast.success("Joined community!");
      fetchCommunityData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to join");
    } finally {
      setIsJoining(false);
    }
  };

  const handlePost = async () => {
    if (!postContent.trim()) return;
    setIsPosting(true);
    try {
      await api.post("/posts", {
        content: postContent,
        communityId: community.id
      });
      setPostContent("");
      toast.success("Posted to community!");
      fetchCommunityData(); // Refresh posts
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.delete(`/communities/${community.id}/members/${userId}`);
      toast.success("Member removed");
      fetchCommunityData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/communities/${community.id}/members/${userId}/role`, { role: newRole });
      toast.success("Role updated successfully");
      fetchCommunityData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleUpdateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/communities/${community.id}`, editForm);
      toast.success("Community updated!");
      setShowEditModal(false);
      fetchCommunityData();
      if (editForm.slug && editForm.slug !== id && editForm.slug !== community.slug) {
        router.push(`/dapp/communities/${editForm.slug}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update community");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImageSrc(reader.result?.toString() || null);
        setImageTarget(target);
        setCropperOpen(true);
      });
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // reset
  };

  const handleCropComplete = async (croppedAreaPixels: any) => {
    if (!selectedImageSrc) return;
    setCropperOpen(false);
    setUploadingImage(true);
    const toastId = toast.loading(`Uploading ${imageTarget}...`);
    try {
      const croppedBlob = await getCroppedImg(selectedImageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Crop failed");
      
      const file = new File([croppedBlob], `${imageTarget}.jpg`, { type: "image/jpeg" });
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "image");

      const res = await api.post("/media/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const newUrl = res.data.data.url;
      setEditForm(prev => ({
        ...prev,
        [imageTarget === 'avatar' ? 'avatar_url' : 'cover_url']: newUrl
      }));
      toast.success(`${imageTarget === 'avatar' ? 'Avatar' : 'Cover image'} uploaded successfully!`, { id: toastId });
    } catch (error) {
      toast.error("Failed to upload image", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!confirm("Are you sure you want to permanently delete this community? This action cannot be undone.")) return;
    try {
      await api.delete(`/communities/${community.id}`);
      toast.success("Community deleted");
      router.push('/dapp/communities');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete community");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-foreground">Loading community...</div>;
  if (!community) return <div className="p-8 text-center text-foreground">Community not found.</div>;

  const isAdmin = community.my_role === 'ADMIN';
  const isMember = !!community.my_role;
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/dapp/communities/${community.slug || community.id}` : '';
  const parsedTags = safeArray<string>(community.tags);
  const mapEmbedUrl = getCommunityMapEmbedUrl(community.map_url, community.latitude, community.longitude);
  const renderCommunityIcon = (icon?: string | null) => {
    if (!icon) return "🌐";
    if (String(icon).startsWith("http") || String(icon).startsWith("/") || String(icon).includes("/uploads/")) {
      return <img src={getMediaUrl(icon)} alt="Icon" className="w-8 h-8 object-contain inline-block" />;
    }
    const IconComponent = IconMap[String(icon)];
    if (IconComponent) return <IconComponent className="w-6 h-6 text-foreground" />;
    return <span className="text-2xl leading-none">{icon}</span>;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24 overflow-x-hidden">
      <button onClick={() => router.push('/dapp/communities')} className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-5 h-5"/> Back to Communities
      </button>

      {/* Header Profile */}
      <AnimatedContainer animation="slideUp">
        <GlassPanel className="relative overflow-hidden border-0 -mx-4 md:mx-0 !rounded-none md:!rounded-3xl shadow-2xl">
          {community.cover_url ? (
            <img src={getMediaUrl(community.cover_url)} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Cover" />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${community.color_gradient || 'from-surface-secondary to-surface'} opacity-20`}></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          
          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 pt-16 md:pt-8">
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${community.color_gradient || 'from-surface-secondary to-surface'} flex items-center justify-center text-6xl shadow-xl border border-border shrink-0 overflow-hidden`}>
              {community.avatar_url ? <img src={getMediaUrl(community.avatar_url)} className="w-full h-full object-cover" alt="Avatar"/> : renderCommunityIcon(community.icon)}
            </div>
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
              <h1 className="text-4xl font-extrabold text-foreground mb-2">{community.name}</h1>
              {community.description && (
                <div className="text-foreground/80 mb-4 prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(community.description)}}></div>
              )}
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                <span className="flex items-center gap-1 text-sm bg-surface-secondary px-3 py-1 rounded-full text-foreground/80 border border-border">
                  <Users className="w-4 h-4"/> {community.member_count} Members
                </span>
                {community.topic_category_name && (
                  <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                    {community.topic_category_name}
                  </span>
                )}
                {community.topic_subcategory_name && (
                  <span className="text-sm bg-secondary/10 text-secondary px-3 py-1 rounded-full border border-secondary/20">
                    {community.topic_subcategory_name}
                  </span>
                )}
                {community.location_mode && (
                  <span className="text-sm bg-surface-secondary text-foreground px-3 py-1 rounded-full border border-border">
                    {community.location_mode}
                  </span>
                )}
                {parsedTags.map((tag: string) => (
                  <span key={tag} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Mobile Only: See Community Info */}
              <div className="lg:hidden mb-6 flex justify-center">
                <button 
                  onClick={() => setShowAboutModal(true)}
                  className="text-primary hover:text-primary/80 transition-colors text-sm font-semibold flex items-center gap-1"
                >
                  See Community Info
                </button>
              </div>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {!isMember && (
                  <GlowButton variant="primary" onClick={handleJoin} disabled={isJoining}>
                    {isJoining ? "Joining..." : "Join Community"}
                  </GlowButton>
                )}
                <GlowButton variant="secondary" onClick={() => {
                  navigator.clipboard.writeText(joinUrl);
                  toast.success("Link copied!");
                }}>
                  <LinkIcon className="w-4 h-4 mr-2"/> Copy Link
                </GlowButton>
                {isMember && (
                  <>
                    <GlowButton variant="secondary" onClick={() => setShowInviteModal(true)}>
                      <UserPlus className="w-4 h-4 mr-2"/> Invite
                    </GlowButton>
                    <GlowButton variant="secondary" onClick={() => setShowCreateEventModal(true)}>
                      <Calendar className="w-4 h-4 mr-2"/> Host Event
                    </GlowButton>
                  </>
                )}
                <GlowButton variant="secondary" onClick={() => setShowQR(!showQR)}>
                  <QrCode className="w-4 h-4 mr-2"/> QR Code
                </GlowButton>
                {isAdmin && (
                  <GlowButton variant="secondary" onClick={() => setShowEditModal(true)}>
                    Manage Community
                  </GlowButton>
                )}
                <button className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors ml-auto text-sm px-4">
                  <ShieldAlert className="w-4 h-4"/> Report
                </button>
              </div>
            </div>
          </div>
        </GlassPanel>
      </AnimatedContainer>

      {(community.location_mode === "OFFLINE" || mapEmbedUrl) && (
        <GlassPanel className="p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Community Location
              </h2>
              <p className="text-sm text-foreground/55">
                {[community.area, community.city, community.state, community.country].filter(Boolean).join(", ") || "Location details are attached to this community."}
              </p>
            </div>
            {mapEmbedUrl && (
              <a
                href={String(community.map_url ||  `https://www.google.com/maps?q=${community.latitude},${community.longitude}`)}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Open map
              </a>
            )}
          </div>

          {mapEmbedUrl ? (
            
            <iframe
              title="Community location map"
              src={mapEmbedUrl}
              className="w-full h-[320px] rounded-2xl border border-border"
              loading="lazy"
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-foreground/55">
              No map link or coordinates were added for this community.
            </div>
          )}
        </GlassPanel>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
          <GlassPanel className="p-8 animate-in zoom-in-95 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-foreground">Manage Community</h3>
              <button onClick={() => setShowEditModal(false)} className="text-foreground/60 hover:text-foreground">X</button>
            </div>
            
            <form onSubmit={handleUpdateCommunity} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-foreground/80">Community Name</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-surface border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-foreground transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2 text-foreground/80">Branded URL (Slug)</label>
                  <input 
                    type="text" 
                    value={editForm.slug}
                    onChange={e => setEditForm({...editForm, slug: e.target.value})}
                    placeholder="e.g. my-awesome-hub"
                    className="w-full bg-surface border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-foreground transition-all"
                  />
                  <p className="text-xs text-primary mt-1.5 font-medium">Normally requires 10,000 members. Unlocked for testing.</p>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-foreground/80">Icon (Emoji fallback or Custom Emoji)</label>
                  <div className="flex gap-3 items-center mb-3">
                    <div className="w-12 h-12 rounded-xl bg-surface border border-border/50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm text-2xl">
                      {editForm.icon ? renderCommunityIcon(editForm.icon) : "🌐"}
                    </div>
                    <input 
                      type="text" 
                      value={editForm.icon}
                      onChange={e => setEditForm({...editForm, icon: e.target.value})}
                      placeholder="Enter an emoji or select from pre-installed pack below"
                      className="w-full bg-surface border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-foreground transition-all text-sm"
                    />
                  </div>
                  
                  {customEmojis.length > 0 && (
                    <div className="bg-surface-secondary/40 p-4 rounded-2xl border border-border/50 mt-2">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Pre-installed Emojis Pack</p>
                        <div className="relative">
                          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/50" />
                          <input
                            type="text"
                            placeholder="Search emojis..."
                            value={emojiSearch}
                            onChange={(e) => setEmojiSearch(e.target.value)}
                            className="bg-surface border border-border/50 text-xs rounded-lg pl-7 pr-3 py-1.5 focus:outline-none focus:border-primary text-foreground w-40"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {customEmojis.filter(e => e.shortcode.toLowerCase().includes(emojiSearch.toLowerCase())).map((emoji) => (
                          <button
                            key={emoji.id}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, icon: emoji.image_url })}
                            className={`p-2 rounded-xl border transition flex flex-col items-center justify-center hover:border-primary/50 ${
                              editForm.icon === emoji.image_url ? "border-primary bg-primary/10" : "border-border/30 bg-surface/40"
                            }`}
                            title={emoji.shortcode}
                          >
                            <img src={getMediaUrl(emoji.image_url)} alt={emoji.shortcode} className="w-7 h-7 object-contain mx-auto" />
                            <span className="text-[8px] text-foreground/40 mt-1 truncate max-w-full w-full text-center">:{emoji.shortcode}:</span>
                          </button>
                        ))}
                        {customEmojis.filter(e => e.shortcode.toLowerCase().includes(emojiSearch.toLowerCase())).length === 0 && (
                          <div className="col-span-full py-4 text-center text-xs text-foreground/50">No emojis found matching "{emojiSearch}"</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-surface-secondary/50 p-4 rounded-2xl border border-border/50">
                  <label className="block text-sm font-bold mb-3 text-foreground/80">Avatar Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-surface border border-border/50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {editForm.avatar_url ? <img src={getMediaUrl(editForm.avatar_url)} className="w-full h-full object-cover" alt="Avatar"/> : <Camera className="w-6 h-6 text-foreground/40"/>}
                    </div>
                    <label className="cursor-pointer px-4 py-2.5 bg-surface border border-border/50 rounded-xl text-sm font-bold text-foreground hover:bg-surface-secondary hover:border-primary/50 transition-all flex items-center gap-2 flex-1 justify-center whitespace-nowrap">
                      <Camera className="w-4 h-4"/> Upload Avatar
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'avatar')} />
                    </label>
                  </div>
                </div>

                <div className="bg-surface-secondary/50 p-4 rounded-2xl border border-border/50">
                  <label className="block text-sm font-bold mb-3 text-foreground/80">Cover Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-16 rounded-2xl bg-surface border border-border/50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {editForm.cover_url ? <img src={getMediaUrl(editForm.cover_url)} className="w-full h-full object-cover" alt="Cover"/> : <ImageIcon className="w-6 h-6 text-foreground/40"/>}
                    </div>
                    <label className="cursor-pointer px-4 py-2.5 bg-surface border border-border/50 rounded-xl text-sm font-bold text-foreground hover:bg-surface-secondary hover:border-primary/50 transition-all flex items-center gap-2 flex-1 justify-center whitespace-nowrap">
                      <ImageIcon className="w-4 h-4"/> Upload Cover
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'cover')} />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground/80">Description (HTML Supported)</label>
                <RichTextEditor 
                  value={editForm.description}
                  onChange={(val) => setEditForm({...editForm, description: val})}
                  placeholder="Describe your community..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground/80">Guidelines & T&C (HTML Supported)</label>
                <RichTextEditor 
                  value={editForm.rules}
                  onChange={(val) => setEditForm({...editForm, rules: val})}
                  placeholder="Set the rules for your community members..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-secondary/50 p-4 rounded-2xl border border-border/50 flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">Privacy Setting</label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editForm.is_private === 1}
                      onChange={(e) => setEditForm({...editForm, is_private: e.target.checked ? 1 : 0})}
                      className="w-5 h-5 rounded border-border/50 text-primary focus:ring-primary/50 bg-surface"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">Private Community</span>
                      <span className="text-xs text-foreground/50">Only approved members can join and view content.</span>
                    </div>
                  </label>
                </div>
                
                <div className="bg-surface-secondary/50 p-4 rounded-2xl border border-border/50 flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">Messaging Permissions</label>
                  <select 
                    value={editForm.message_permission}
                    onChange={(e) => setEditForm({...editForm, message_permission: e.target.value})}
                    className="w-full bg-surface border border-border/50 focus:border-primary rounded-xl px-4 py-2.5 text-foreground text-sm"
                  >
                    <option value="MEMBER">All Members</option>
                    <option value="ADMIN">Admins Only</option>
                  </select>
                  <span className="text-xs text-foreground/50">Who can post messages in the community feed.</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border mt-6">
                <button 
                  type="button" 
                  onClick={handleDeleteCommunity}
                  className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4"/> Delete Community
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground">Cancel</button>
                  <GlowButton type="submit" variant="primary">Save Changes</GlowButton>
                </div>
              </div>
            </form>
          </GlassPanel>
        </div>
      )}

      {/* Cropper Modal */}
      {cropperOpen && selectedImageSrc && (
        <ImageCropperModal
          imageSrc={selectedImageSrc}
          onClose={() => {
            setCropperOpen(false);
            setSelectedImageSrc(null);
          }}
          onCropComplete={handleCropComplete}
          aspect={imageTarget === 'avatar' ? 1 : 21/9}
          cropShape={imageTarget === 'avatar' ? 'round' : 'rect'}
        />
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setShowQR(false)}>
          <GlassPanel className="p-8 text-center animate-in zoom-in-95 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-foreground">Scan to Join</h3>
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <p className="text-sm text-foreground/60 break-all mb-6">{joinUrl}</p>
            <GlowButton onClick={() => setShowQR(false)} className="w-full">Close</GlowButton>
          </GlassPanel>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-border mb-6">
            <button 
              onClick={() => setActiveTab('feed')}
              className={`pb-3 px-4 font-bold transition-colors border-b-2 ${activeTab === 'feed' ? 'border-primary text-primary' : 'border-transparent text-foreground/60 hover:text-foreground'}`}
            >
              Feed
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`pb-3 px-4 font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'events' ? 'border-primary text-primary' : 'border-transparent text-foreground/60 hover:text-foreground'}`}
            >
              Events {events.length > 0 && <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">{events.length}</span>}
            </button>
          </div>

          {activeTab === 'feed' ? (
            <>
              {/* Composer */}
          {isMember ? (
            <GlassPanel className="p-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-secondary border border-border shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <textarea 
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share something with the community..."
                    className="w-full bg-transparent text-foreground placeholder:text-foreground/40 resize-none outline-none min-h-[60px]"
                  />
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex gap-2 text-primary">
                      <button className="p-2 hover:bg-primary/10 rounded-full transition-colors"><ImageIcon className="w-5 h-5"/></button>
                      <button className="p-2 hover:bg-primary/10 rounded-full transition-colors"><Video className="w-5 h-5"/></button>
                    </div>
                    <GlowButton onClick={handlePost} disabled={isPosting || !postContent.trim()} className="px-6 py-2">
                      <Send className="w-4 h-4 mr-2"/> Post
                    </GlowButton>
                  </div>
                </div>
              </div>
            </GlassPanel>
          ) : (
            <div className="p-8 text-center text-foreground/60 bg-surface-secondary/50 rounded-2xl border border-border">
              <h3 className="text-xl font-bold text-foreground mb-2">Join the Conversation</h3>
              <p className="mb-4">You must be a member to post in this community.</p>
              <GlowButton variant="primary" onClick={handleJoin} disabled={isJoining}>
                {isJoining ? "Joining..." : "Join Community"}
              </GlowButton>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground px-2">Community Posts</h3>
            {posts.length === 0 ? (
              <div className="p-8 text-center text-foreground/60 bg-surface-secondary/50 rounded-2xl border border-border">
                No posts yet. Be the first to share!
              </div>
            ) : (
              posts.map(post => (
                <GlassPanel key={post.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {post.avatar_url ? (
                      <img src={post.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-secondary border border-border flex items-center justify-center">
                        <Users className="w-5 h-5 text-foreground/40"/>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{post.display_name}</h4>
                      <p className="text-xs text-foreground/50">{new Date(post.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {post.media_type === 'event' ? (() => {
                    try {
                      const parsed = JSON.parse(post.content);
                      return (
                        <div className="bg-surface-secondary/50 border border-primary/30 rounded-xl overflow-hidden mt-3 mb-2 hover:border-primary/60 transition-all cursor-pointer shadow-sm group relative" onClick={() => window.location.href = `/dapp/events/${parsed.event_id}`}>
                          {parsed.cover_image ? (
                            <img src={getMediaUrl(parsed.cover_image)} alt={parsed.title} className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-surface to-surface-secondary flex items-center justify-center">
                              <Calendar className="w-8 h-8 text-primary/40 group-hover:text-primary/80 transition-colors" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 z-10 pointer-events-none">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold uppercase tracking-wide mb-1 backdrop-blur-md">
                              <Calendar className="w-3 h-3" /> Event Invite
                            </div>
                            <h4 className="text-lg font-bold text-foreground leading-tight mb-1">{parsed.title}</h4>
                            <p className="text-xs text-foreground/70 font-medium">
                              Starts: {new Date(parsed.start_time).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    } catch (e) {
                      return <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>;
                    }
                  })() : (
                    <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
                  )}
                </GlassPanel>
              ))
            )}
          </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-foreground px-2">Community Events</h3>
                {isMember && (
                  <GlowButton variant="primary" onClick={() => setShowCreateEventModal(true)} className="py-1.5 text-sm">
                    Host Event
                  </GlowButton>
                )}
              </div>
              {events.length === 0 ? (
                <div className="p-8 text-center text-foreground/60 bg-surface-secondary/50 rounded-2xl border border-border">
                  No upcoming events.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((event: any) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          {community.rules && (
            <GlassPanel className="p-4">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary"/> Guidelines & T&C
              </h3>
              <div 
                className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(community.rules)}}
              >
              </div>
            </GlassPanel>
          )}

          <GlassPanel className="p-4">
            <h3 className="font-bold text-lg text-foreground mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><Users className="w-5 h-5 text-primary"/> Members ({members.length})</span>
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {members.map(member => (
                <div key={member.user_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-secondary transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface border border-border shrink-0 overflow-hidden">
                      {member.avatar_url ? <img src={getMediaUrl(member.avatar_url)} className="w-full h-full object-cover" alt=""/> : <Users className="w-4 h-4 text-foreground/40 mx-auto mt-2"/>}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground truncate max-w-[120px]">
                        {member.display_name || member.profile_username || member.user_email?.split('@')[0]}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                        member.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                        member.role === 'MODERATOR' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-surface-secondary text-foreground/60'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                  {isAdmin && member.role !== 'ADMIN' && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                        className="bg-surface border border-border/50 text-[10px] text-foreground rounded px-1.5 py-1 outline-none focus:border-primary"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="MODERATOR">Moderator</option>
                      </select>
                      <button 
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Mobile About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setShowAboutModal(false)}>
          <GlassPanel className="w-full h-[80vh] rounded-t-3xl rounded-b-none animate-in slide-in-from-bottom-full overflow-hidden flex flex-col border-b-0" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-[#2b3139] shrink-0">
              <h3 className="text-foreground font-bold text-lg">Community Info</h3>
              <button onClick={() => setShowAboutModal(false)} className="text-foreground/50 hover:text-foreground transition-colors p-2 bg-surface rounded-full">
                X
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-8 pb-24">
              {community.rules && (
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-primary"/> Guidelines & T&C
                  </h3>
                  <div 
                    className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(community.rules)}}
                  >
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-bold text-lg text-foreground mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Users className="w-5 h-5 text-primary"/> Members ({members.length})</span>
                </h3>
                <div className="space-y-4">
                  {members.map(member => (
                    <div key={member.user_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {member.avatar_url ? (
                          <img src={getMediaUrl(member.avatar_url)} alt={member.display_name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center">
                            <Users className="w-4 h-4 text-foreground/40"/>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {member.display_name || member.profile_username || member.user_email}
                          </p>
                          <p className="text-xs text-foreground/60 font-bold tracking-widest uppercase">{member.role}</p>
                        </div>
                      </div>
                      {isAdmin && member.role !== 'ADMIN' && (
                        <div className="flex items-center gap-2">
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                            className="bg-surface border border-border/50 text-[10px] text-foreground rounded px-1.5 py-1 outline-none focus:border-primary"
                          >
                            <option value="MEMBER">Member</option>
                            <option value="MODERATOR">Moderator</option>
                          </select>
                          <button 
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      )}

      {showInviteModal && community && (
        <InviteModal 
          communityId={community.id}
          communityName={community.name}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {showCreateEventModal && (
        <CreateEventModal 
          communityId={community.id}
          onClose={() => setShowCreateEventModal(false)}
          onSuccess={() => {
             setShowCreateEventModal(false);
             toast.success("Community Event published successfully!");
          }}
        />
      )}
    </div>
  );
}
