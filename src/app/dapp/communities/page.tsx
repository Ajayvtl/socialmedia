"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api, { getMediaUrl } from "@/lib/api";
import { safeArray } from "@/lib/utils";
import { normalizeCommunityTaxonomy, buildCommunityTagHints, type CommunityTopicCategory, type CommunityTopicSubcategory, type CommunityTopicTaxonomy, getCommunityMapEmbedUrl } from "@/lib/communityTopics";
import { IconMap } from "@/lib/iconMapping";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSection } from "@/components/ui/PageSection";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AuroraInput } from "@/components/ui/AuroraInput";
import { AuroraSelect } from "@/components/ui/AuroraSelect";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppImage } from "@/components/ui/AppImage";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { Users, Hash, Plus, ShieldCheck, Globe, MapPin, Sparkles, Camera } from "lucide-react";
import toast from "react-hot-toast";

type Community = {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color_gradient?: string;
  member_count?: number;
  role?: string;
  is_private?: number;
  topic_category_id?: string | null;
  topic_category_name?: string | null;
  topic_subcategory_id?: string | null;
  topic_subcategory_name?: string | null;
  location_mode?: "ONLINE" | "OFFLINE";
  city?: string | null;
  state?: string | null;
  country?: string | null;
  area?: string | null;
  map_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  tags?: string | string[] | null;
  slug?: string | null;
};

type SocialProfile = {
  location?: string | null;
  country?: string | null;
  dob?: string | null;
};

function slugify(value: string, prefix: string) {
  const raw = String(value || "").trim().toLowerCase();
  const slug = raw.replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${prefix}-${slug || "item"}`;
}

function parseAge(dob?: string | null) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function categoryGradient(seed: string) {
  const gradients = [
    "from-[#00E5FF]/20 to-[#8B5CF6]/20",
    "from-[#FF4D8D]/20 to-[#8B5CF6]/20",
    "from-[#FACC15]/20 to-[#FF4D8D]/20",
    "from-[#00D97E]/20 to-[#00E5FF]/20",
    "from-indigo-400/20 to-purple-500/20",
    "from-cyan-400/20 to-blue-500/20",
  ];
  const index = Math.abs(seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % gradients.length;
  return gradients[index];
}

function renderCommunityIcon(icon: string | null | undefined, className = "w-5 h-5") {
  if (!icon) return "🌐";
  if (String(icon).startsWith("http")) {
    return null;
  }
  const IconComponent = IconMap[icon];
  if (IconComponent) return <IconComponent className={className} />;
  return icon;
}

function scoreSubcategory(subcategory: CommunityTopicSubcategory, profile: SocialProfile, age: number | null) {
  const name = subcategory.name.toLowerCase();
  const location = `${profile.location || ""} ${profile.country || ""}`.toLowerCase();
  switch (subcategory.ageGroup) {
    case "age": {
      if (age === null) return 0;
      const ageRanges: Record<string, [number, number]> = {
        "18 - 24": [18, 24],
        "18-24": [18, 24],
        "25 - 34": [25, 34],
        "25-34": [25, 34],
        "35 - 44": [35, 44],
        "35-44": [35, 44],
        "45+": [45, 120],
      };
      const range = ageRanges[subcategory.name] || ageRanges[name];
      if (!range) return 0;
      return age >= range[0] && age <= range[1] ? 100 : 0;
    }
    case "city":
      return location.includes(name) ? 85 : 0;
    case "country":
      return location.includes(name) || String(profile.country || "").toLowerCase().includes(name) ? 90 : 0;
    default:
      return 0;
  }
}

export default function CommunitiesPage() {
  const router = useRouter();
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [suggestedCommunities, setSuggestedCommunities] = useState<Community[]>([]);
  const [taxonomy, setTaxonomy] = useState<CommunityTopicTaxonomy>({ version: 1, categories: [] });
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_private: false,
    location_mode: "ONLINE" as "ONLINE" | "OFFLINE",
    topic_category_id: "",
    topic_subcategory_id: "",
    area: "",
    city: "",
    state: "",
    country: "",
    map_url: "",
    latitude: "",
    longitude: "",
    avatar_url: "",
    cover_url: ""
  });
  const [manualTags, setManualTags] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const fetchCommunities = async () => {
    try {
      const [myRes, suggestedRes, publicSettingsRes, profileRes, countriesRes, statesRes, citiesRes] = await Promise.all([
        api.get("/communities/my"),
        api.get("/communities/suggested"),
        api.get("/settings/public"),
        api.get("/social-profile").catch(() => ({ data: { data: null } })),
        api.get("/settings/countries").catch(() => ({ data: { data: [] } })),
        api.get("/settings/states").catch(() => ({ data: { data: [] } })),
        api.get("/settings/cities").catch(() => ({ data: { data: [] } })),
      ]);
      setMyCommunities(myRes.data.data || []);
      setSuggestedCommunities(suggestedRes.data.data || []);
      setTaxonomy(normalizeCommunityTaxonomy(publicSettingsRes.data?.data?.community_interest_taxonomy || { version: 1, categories: [] }));
      setProfile(profileRes.data?.data || null);
      setCountries(Array.isArray(countriesRes.data?.data) ? countriesRes.data.data : []);
      setStates(Array.isArray(statesRes.data?.data) ? statesRes.data.data : []);
      setCities(Array.isArray(citiesRes.data?.data) ? citiesRes.data.data : []);
    } catch (err) {
      console.error("Failed to fetch communities", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const profileAge = useMemo(() => parseAge(profile?.dob), [profile?.dob]);

  const topicSuggestions = useMemo(() => {
    const flattened = taxonomy.categories.flatMap((category) =>
      category.subcategories.map((subcategory) => ({
        category,
        subcategory,
        score: scoreSubcategory(subcategory, profile || {}, profileAge),
      }))
    );

    return flattened
      .filter((item) => item.category.enabled !== false && item.subcategory.enabled !== false)
      .sort((a, b) => b.score - a.score);
  }, [taxonomy.categories, profile, profileAge]);

  const selectedCategory = useMemo(
    () => taxonomy.categories.find((category) => category.id === form.topic_category_id) || topicSuggestions[0]?.category || taxonomy.categories[0] || null,
    [taxonomy.categories, form.topic_category_id, topicSuggestions]
  );

  const selectedSubcategory = useMemo(
    () =>
      selectedCategory?.subcategories.find((subcategory) => subcategory.id === form.topic_subcategory_id) ||
      selectedCategory?.subcategories[0] ||
      null,
    [selectedCategory, form.topic_subcategory_id]
  );

  useEffect(() => {
    if (!showCreateModal) return;
    if (!form.topic_category_id && selectedCategory) {
      setForm((prev) => ({
        ...prev,
        topic_category_id: selectedCategory.id,
        topic_subcategory_id: selectedCategory.subcategories[0]?.id || "",
      }));
      return;
    }
    if (selectedCategory && selectedCategory.subcategories.length > 0) {
      const subcategoryExists = selectedCategory.subcategories.some((subcategory) => subcategory.id === form.topic_subcategory_id);
      if (!subcategoryExists) {
        setForm((prev) => ({ ...prev, topic_subcategory_id: selectedCategory.subcategories[0].id }));
      }
    }
  }, [showCreateModal, selectedCategory, form.topic_category_id, form.topic_subcategory_id]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "image");

    setIsUploadingMedia(true);
    const toastId = toast.loading(`Uploading ${target}...`);
    try {
      const res = await api.post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const newUrl = res.data.data.url;
      setForm(prev => ({ ...prev, [target === 'avatar' ? 'avatar_url' : 'cover_url']: newUrl }));
      toast.success(`${target} uploaded successfully!`, { id: toastId });
    } catch (err) {
      toast.error("Failed to upload image", { id: toastId });
    } finally {
      setIsUploadingMedia(false);
      e.target.value = '';
    }
  };

  const handleJoin = async (id: number) => {
    try {
      await api.post(`/communities/${id}/join`);
      toast.success("Joined community!");
      fetchCommunities();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to join");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");

    const category = taxonomy.categories.find((item) => item.id === form.topic_category_id) || null;
    const subcategory = category?.subcategories.find((item) => item.id === form.topic_subcategory_id) || null;
    const tags = [
      ...buildCommunityTagHints(category, subcategory),
      ...manualTags.split(",").map((item) => item.trim()).filter(Boolean),
    ];

    setIsCreating(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        tags,
        is_private: form.is_private,
        icon: category?.icon || "🌐",
        color_gradient: categoryGradient(category?.id || form.name),
        topic_category_id: category?.id || null,
        topic_category_name: category?.name || null,
        topic_subcategory_id: subcategory?.id || null,
        topic_subcategory_name: subcategory?.name || null,
        location_mode: form.location_mode,
        area: form.location_mode === "OFFLINE" ? form.area.trim() || null : null,
        city: form.location_mode === "OFFLINE" ? form.city.trim() || null : null,
        state: form.location_mode === "OFFLINE" ? form.state.trim() || null : null,
        country: form.location_mode === "OFFLINE" ? form.country.trim() || null : null,
        map_url: form.location_mode === "OFFLINE" ? form.map_url.trim() || null : null,
        latitude: form.location_mode === "OFFLINE" && form.latitude.trim() ? Number(form.latitude) : null,
        longitude: form.location_mode === "OFFLINE" && form.longitude.trim() ? Number(form.longitude) : null,
        avatar_url: form.avatar_url || null,
        cover_url: form.cover_url || null,
      };

      await api.post("/communities", payload);
      toast.success("Community created!");
      setShowCreateModal(false);
      setForm({
        name: "",
        description: "",
        is_private: false,
        location_mode: "ONLINE",
        topic_category_id: "",
        topic_subcategory_id: "",
        area: "",
        city: "",
        state: "",
        country: "",
        map_url: "",
        latitude: "",
        longitude: "",
        avatar_url: "",
        cover_url: ""
      });
      setManualTags("");
      fetchCommunities();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create");
    } finally {
      setIsCreating(false);
    }
  };

  const mapEmbedUrl = useMemo(() => {
    if (!showCreateModal) return "";
    return getCommunityMapEmbedUrl(form.map_url, form.latitude, form.longitude);
  }, [form.latitude, form.longitude, form.map_url, showCreateModal]);

  const selectedCategoryLabel = selectedCategory?.name || "No category selected";
  const selectedSubcategoryLabel = selectedSubcategory?.name || "No subcategory selected";
  const locationSummary = form.location_mode === "ONLINE"
    ? "Online community"
    : [form.area, form.city, form.state, form.country].filter(Boolean).join(", ") || "Offline location not set";

  if (isLoading) {
    return <PageContainer size="xl"><div className="py-10 text-foreground/60">Loading communities...</div></PageContainer>;
  }

  return (
    <PageContainer size="xl">
      <PageHeader
        title="Communities"
        description="Discover tribes, join discussions, and create new communities using topic-aware taxonomy and location rules."
        actions={<GlowButton variant="primary" onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-2" /> Create Community</GlowButton>}
      />

      <PageSection>
        <BentoGrid>
          <BentoItem colSpan={2} className="p-6 bg-gradient-to-br from-surface to-surface-secondary">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-success" />
              <h2 className="text-xl font-bold text-foreground">My Hubs</h2>
            </div>
            <div className="space-y-4">
              {myCommunities.length === 0 ? (
                <EmptyState title="No communities yet" description="Create your first community or join one from suggestions." />
              ) : (
                myCommunities.map((community) => (
                  <GlassPanel key={community.id} onClick={() => router.push(`/dapp/communities/${community.id}`)} className="p-4 flex items-center justify-between hover:border-primary/50 transition-colors cursor-pointer rounded-2xl">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${community.color_gradient || "from-surface-secondary to-surface"} flex items-center justify-center text-2xl border border-border shrink-0 overflow-hidden`}>
                        {community.icon && String(community.icon).startsWith("http") ? (
                          <AppImage src={community.icon} containerClassName="w-full h-full" className="w-full h-full object-cover" />
                        ) : (
                          renderCommunityIcon(community.icon, "w-5 h-5 text-foreground")
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground truncate">{community.name}</h3>
                        <p className="text-xs text-foreground/60 flex items-center gap-1 truncate">
                          <Users className="w-3 h-3 shrink-0" /> {community.member_count?.toLocaleString()} members
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs font-bold px-3 py-1 rounded-full bg-surface-secondary border border-border text-foreground">
                        {community.role}
                      </div>
                      {community.topic_category_name && (
                        <span className="text-[11px] text-foreground/50 truncate max-w-[140px]">{community.topic_category_name}</span>
                      )}
                    </div>
                  </GlassPanel>
                ))
              )}
            </div>
          </BentoItem>

          <BentoItem colSpan={2} className="p-6 flex flex-col justify-between border-primary/20 bg-surface/50">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-2"><Globe className="w-5 h-5 text-primary" /> Topic Signals</h2>
              <p className="text-sm text-foreground/60">The create flow can auto-suggest topics from your profile location and age.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-surface border border-border">
                <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">Age</p>
                <p className="text-3xl font-bold text-primary">{profileAge ? `${profileAge}` : "N/A"}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-border">
                <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm font-semibold text-secondary truncate">{profile?.location || profile?.country || "Not set"}</p>
              </div>
            </div>
          </BentoItem>

          <BentoItem colSpan={4} className="p-0 border-none bg-transparent mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Hash className="w-5 h-5 text-secondary" /> Discover & Join</h2>
              <span className="text-xs text-foreground/50">{suggestedCommunities.length} suggestions</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestedCommunities.length === 0 ? (
                <div className="md:col-span-3">
                  <EmptyState title="No suggestions yet" description="Create categories and subcategories to improve discovery, or check back after more activity." />
                </div>
              ) : (
                suggestedCommunities.map((community) => {
                  const parsedTags = safeArray<string>(community.tags);
                  return (
                    <GlassPanel
                      key={community.id}
                      onClick={() => router.push(`/dapp/communities/${community.id}`)}
                      className="p-5 flex flex-col justify-between min-h-[220px] cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div>
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${community.color_gradient || "from-surface-secondary to-surface"} flex items-center justify-center text-3xl border border-border mb-4 overflow-hidden`}>
                          {community.icon && String(community.icon).startsWith("http") ? (
                            <AppImage src={community.icon} containerClassName="w-full h-full" className="w-full h-full object-cover" />
                          ) : (
                            renderCommunityIcon(community.icon, "w-6 h-6 text-foreground")
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-1">{community.name}</h3>
                        <p className="text-sm text-foreground/60 flex items-center gap-1 mb-3">
                          <Users className="w-3 h-3" /> {community.member_count?.toLocaleString()}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {community.topic_category_name && (
                            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                              {community.topic_category_name}
                            </span>
                          )}
                          {community.topic_subcategory_name && (
                            <span className="text-xs px-2 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20">
                              {community.topic_subcategory_name}
                            </span>
                          )}
                          {community.location_mode && (
                            <span className="text-xs px-2 py-1 rounded bg-surface-secondary text-foreground border border-border">
                              {community.location_mode}
                            </span>
                          )}
                        </div>

                        {parsedTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {parsedTags.map((tag) => (
                              <span key={tag} className="text-xs px-2 py-1 rounded bg-surface-secondary text-primary border border-border">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <GlowButton
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoin(community.id);
                        }}
                        className="w-full mt-auto"
                      >
                        Join Community
                      </GlowButton>
                    </GlassPanel>
                  );
                })
              )}
            </div>
          </BentoItem>
        </BentoGrid>
      </PageSection>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <GlassPanel className="w-full max-w-5xl p-6 my-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Create Community</h2>
                <p className="text-sm text-foreground/55">Choose a topic category and let the system suggest a discovery-friendly structure.</p>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-foreground/50 hover:text-foreground">Close</button>
            </div>

            <form onSubmit={handleCreate} className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
              <div className="space-y-4">
                <AuroraInput
                  label="Community Name"
                  placeholder="e.g. Web3 Builders Delhi"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-secondary/30 p-3 rounded-xl border border-border">
                    <label className="block text-xs font-semibold mb-2 text-foreground/80">Avatar Image</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {form.avatar_url ? <img src={getMediaUrl(form.avatar_url)} className="w-full h-full object-cover" alt="Avatar"/> : <Camera className="w-5 h-5 text-foreground/40"/>}
                      </div>
                      <label className={`cursor-pointer px-3 py-2 text-xs font-bold rounded-lg border border-border transition-all flex items-center gap-1.5 ${isUploadingMedia ? 'opacity-50 pointer-events-none' : 'hover:bg-surface-secondary hover:border-primary/50 text-foreground'}`}>
                        <Camera className="w-3.5 h-3.5"/> {isUploadingMedia ? 'Uploading...' : 'Upload Avatar'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'avatar')} />
                      </label>
                    </div>
                  </div>
                  <div className="bg-surface-secondary/30 p-3 rounded-xl border border-border">
                    <label className="block text-xs font-semibold mb-2 text-foreground/80">Cover Image</label>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-12 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {form.cover_url ? <img src={getMediaUrl(form.cover_url)} className="w-full h-full object-cover" alt="Cover"/> : <Camera className="w-5 h-5 text-foreground/40"/>}
                      </div>
                      <label className={`cursor-pointer px-3 py-2 text-xs font-bold rounded-lg border border-border transition-all flex items-center gap-1.5 ${isUploadingMedia ? 'opacity-50 pointer-events-none' : 'hover:bg-surface-secondary hover:border-primary/50 text-foreground'}`}>
                        <Camera className="w-3.5 h-3.5"/> {isUploadingMedia ? 'Uploading...' : 'Upload Cover'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'cover')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground/90">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="mt-1 w-full min-h-[110px] rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                    placeholder="What is this community about?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AuroraSelect
                    label="Topic Category"
                    value={form.topic_category_id}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, topic_category_id: String(value), topic_subcategory_id: "" }))}
                    options={taxonomy.categories.map((category) => ({ label: category.name, value: category.id }))}
                    placeholder="Select a category"
                  />
                  <AuroraSelect
                    label="Topic Subcategory"
                    value={form.topic_subcategory_id}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, topic_subcategory_id: String(value) }))}
                    options={(selectedCategory?.subcategories || []).map((subcategory) => ({ label: subcategory.name, value: subcategory.id }))}
                    placeholder="Select a subcategory"
                    searchable={false}
                  />
                </div>

                <div className="rounded-2xl border border-border p-4 bg-surface/40">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Location Mode</p>
                      <p className="text-xs text-foreground/50">Use online or define offline area, city, state, country, and map.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="sm" variant={form.location_mode === "ONLINE" ? "primary" : "outline"} onClick={() => setForm((prev) => ({ ...prev, location_mode: "ONLINE" }))}>
                        Online
                      </Button>
                      <Button type="button" size="sm" variant={form.location_mode === "OFFLINE" ? "primary" : "outline"} onClick={() => setForm((prev) => ({ ...prev, location_mode: "OFFLINE" }))}>
                        Offline
                      </Button>
                    </div>
                  </div>

                  {form.location_mode === "OFFLINE" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AuroraInput label="Area" placeholder="Optional, leave blank for city-wise" value={form.area} onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))} />
                      <AuroraSelect
                        label="Country"
                        value={form.country}
                        onValueChange={(val) => setForm((prev) => ({ ...prev, country: String(val), state: "", city: "" }))}
                        options={countries.filter(c => c.is_enabled !== false).map(c => ({ label: c.name, value: c.name }))}
                        placeholder="Select Country"
                      />
                      <AuroraSelect
                        label="State"
                        value={form.state}
                        onValueChange={(val) => setForm((prev) => ({ ...prev, state: String(val), city: "" }))}
                        options={states.filter(s => s.is_enabled !== false && (!form.country || s.country === form.country)).map(s => ({ label: s.name, value: s.name }))}
                        placeholder="Select State"
                      />
                      <AuroraSelect
                        label="City"
                        value={form.city}
                        onValueChange={(val) => setForm((prev) => ({ ...prev, city: String(val) }))}
                        options={cities.filter(c => c.is_enabled !== false && (!form.state || c.state === form.state) && (!form.country || c.country === form.country)).map(c => ({ label: c.name, value: c.name }))}
                        placeholder="Select City"
                      />
                      <AuroraInput label="Google Maps Link" placeholder="https://maps.google.com/..." value={form.map_url} onChange={(e) => setForm((prev) => ({ ...prev, map_url: e.target.value }))} />
                      <AuroraInput label="Latitude" placeholder="e.g. 28.6139" value={form.latitude} onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))} />
                      <AuroraInput label="Longitude" placeholder="e.g. 77.2090" value={form.longitude} onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AuroraInput
                    label="Manual Tags"
                    description="Comma separated extra hashtags. Topic tags are added automatically."
                    placeholder="#builders, #startup, #community"
                    value={manualTags}
                    onChange={(e) => setManualTags(e.target.value)}
                  />
                  <label className="flex items-center gap-2 pt-8 text-sm text-foreground/70">
                    <input
                      type="checkbox"
                      checked={form.is_private}
                      onChange={(e) => setForm((prev) => ({ ...prev, is_private: e.target.checked }))}
                    />
                    Private community
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <GlassPanel className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-foreground/50">Suggested for you</p>
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground truncate">{selectedCategoryLabel}</p>
                    <p className="text-xs text-foreground/55 truncate">{selectedSubcategoryLabel}</p>
                    <p className="text-xs text-foreground/50">{locationSummary}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {buildCommunityTagHints(selectedCategory, selectedSubcategory).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </GlassPanel>

                {mapEmbedUrl && (
                  <GlassPanel className="p-3">
                    <p className="text-xs uppercase tracking-wider text-foreground/50 mb-3 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Map Preview
                    </p>
                    <p className="text-xs break-all">{mapEmbedUrl}</p>
                    <div>{mapEmbedUrl}</div>
                    <iframe
                      title="Community map preview"
                      src={mapEmbedUrl}
                      className="w-full h-[260px] rounded-2xl border border-border"
                      loading="lazy"
                    />
                  </GlassPanel>
                )}

                <GlassPanel className="p-4">
                  <p className="text-xs uppercase tracking-wider text-foreground/50 mb-3">Suggested Topics</p>
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {topicSuggestions.length === 0 ? (
                      <EmptyState
                        title="No topic suggestions yet"
                        description="Add categories and subcategories in the developer taxonomy panel first."
                      />
                    ) : (
                      topicSuggestions.slice(0, 10).map(({ category, subcategory, score }) => (
                        <button
                          key={`${category.id}-${subcategory.id}`}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, topic_category_id: category.id, topic_subcategory_id: subcategory.id }))}
                          className="w-full rounded-xl border border-border px-3 py-3 text-left hover:border-primary/50 hover:bg-surface-secondary/40 transition flex items-center justify-between gap-3"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-foreground truncate">{category.name} / {subcategory.name}</span>
                            <span className="block text-[11px] text-foreground/50 truncate">{subcategory.name || "custom"}</span>
                          </span>
                          <span className="text-xs font-semibold text-primary shrink-0">{score > 0 ? `${score}%` : "Suggested"}</span>
                        </button>
                      ))
                    )}
                  </div>
                </GlassPanel>
              </div>

              <div className="xl:col-span-2 flex justify-end gap-3 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <GlowButton type="submit" variant="primary" disabled={isCreating || isUploadingMedia}>
                  {isCreating ? "Creating..." : "Create Community"}
                </GlowButton>
              </div>
            </form>
          </GlassPanel>
        </div>
      )}
    </PageContainer>
  );
}
