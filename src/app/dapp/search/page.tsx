"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Hash, Users, Calendar, TrendingUp, Sparkles, Filter, ChevronRight, Play } from "lucide-react";
import api, { getMediaUrl } from "@/lib/api";
import { safeArray } from "@/lib/utils";
import { normalizeCommunityTaxonomy, type CommunityTopicTaxonomy } from "@/lib/communityTopics";
import { IconMap } from "@/lib/iconMapping";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSection } from "@/components/ui/PageSection";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AppImage } from "@/components/ui/AppImage";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";

type DiscoverPost = {
  id: number;
  content?: string;
  media_url?: string | null;
  media_type?: string | null;
  display_name?: string;
  avatar_url?: string | null;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  views_count?: number;
};

type Community = {
  id: number;
  name: string;
  icon?: string;
  member_count?: number;
  color_gradient?: string;
  topic_category_name?: string | null;
  topic_subcategory_name?: string | null;
  location_mode?: "ONLINE" | "OFFLINE";
  city?: string | null;
  state?: string | null;
  country?: string | null;
};

export default function SearchDiscoveryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ALL" | "PEOPLE" | "TAGS" | "COMMUNITIES" | "POSTS">("ALL");
  const [searchValue, setSearchValue] = useState("");
  const [trendingPosts, setTrendingPosts] = useState<DiscoverPost[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([]);
  const [recommendedPeople, setRecommendedPeople] = useState<any[]>([]);
  const [taxonomy, setTaxonomy] = useState<CommunityTopicTaxonomy>({ version: 1, categories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [feedRes, commRes, peopleRes, settingsRes] = await Promise.all([
          api.get("/discover/feed?type=trending&limit=20").catch(() => ({ data: { posts: [] } })),
          api.get("/discover/recommendations?category=communities&limit=20").catch(() => ({ data: { items: [] } })),
          api.get("/discover/recommendations?category=creators&limit=20").catch(() => ({ data: { items: [] } })),
          api.get("/settings/public").catch(() => ({ data: { data: { community_interest_taxonomy: { version: 1, categories: [] } } } })),
        ]);

        setTrendingPosts(Array.isArray(feedRes.data?.posts) ? feedRes.data.posts : []);
        setRecommendedCommunities(Array.isArray(commRes.data?.items) ? commRes.data.items : []);
        setRecommendedPeople(Array.isArray(peopleRes.data?.items) ? peopleRes.data.items : []);
        setTaxonomy(normalizeCommunityTaxonomy(settingsRes.data?.data?.community_interest_taxonomy || { version: 1, categories: [] }));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Advanced Sorting Function
  const advancedSort = (items: any[], q: string, getMatchStrings: (item: any) => string[], getEngagementScore: (item: any) => number) => {
    if (!q) return items;
    
    return [...items].sort((a, b) => {
      const aStrings = getMatchStrings(a);
      const bStrings = getMatchStrings(b);
      
      // 1. Exact Case Match
      const aExact = aStrings.some(s => s === q);
      const bExact = bStrings.some(s => s === q);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // 2. Case Insensitive Exact Match
      const aExactInsensitive = aStrings.some(s => s.toLowerCase() === q.toLowerCase());
      const bExactInsensitive = bStrings.some(s => s.toLowerCase() === q.toLowerCase());
      if (aExactInsensitive && !bExactInsensitive) return -1;
      if (!aExactInsensitive && bExactInsensitive) return 1;
      
      // 3. Prefix Match (Starts With)
      const aPrefix = aStrings.some(s => s.toLowerCase().startsWith(q.toLowerCase()));
      const bPrefix = bStrings.some(s => s.toLowerCase().startsWith(q.toLowerCase()));
      if (aPrefix && !bPrefix) return -1;
      if (!aPrefix && bPrefix) return 1;
      
      // 4. Substring Match
      const aSub = aStrings.some(s => s.toLowerCase().includes(q.toLowerCase()));
      const bSub = bStrings.some(s => s.toLowerCase().includes(q.toLowerCase()));
      if (aSub && !bSub) return -1;
      if (!aSub && bSub) return 1;
      
      // 5. Engagement/Interest Sorting (Likes > Comments > Other)
      return getEngagementScore(b) - getEngagementScore(a);
    }).filter((item) => {
      // Must at least substring match
      const strings = getMatchStrings(item);
      return strings.some(s => s.toLowerCase().includes(q.toLowerCase()));
    });
  };

  const trendingTags = useMemo(() => {
    const tags = taxonomy.categories.flatMap((category) =>
      category.subcategories
        .filter((subcategory) => category.enabled !== false && subcategory.enabled !== false && subcategory.hashtagEnabled !== false)
        .map((subcategory) => `#${subcategory.name.replace(/\s+/g, "")}`)
    );
    const uniqueTags = Array.from(new Set(tags));
    if (!searchValue.trim()) return uniqueTags.slice(0, 20);
    
    return advancedSort(
      uniqueTags, 
      searchValue, 
      (t) => [t], 
      () => 0 // Tags don't have engagement right now
    );
  }, [taxonomy.categories, searchValue]);

  const filteredCommunities = useMemo(() => {
    if (!searchValue.trim()) return recommendedCommunities.slice(0, activeTab === "ALL" ? 6 : undefined);
    return advancedSort(
      recommendedCommunities,
      searchValue,
      (c) => [c.name, c.topic_category_name || "", c.topic_subcategory_name || ""],
      (c) => c.member_count || 0
    );
  }, [recommendedCommunities, searchValue, activeTab]);

  const filteredPosts = useMemo(() => {
    if (!searchValue.trim()) return trendingPosts.slice(0, activeTab === "ALL" ? 6 : undefined);
    return advancedSort(
      trendingPosts,
      searchValue,
      (p) => [p.content || "", p.display_name || ""],
      (p) => ((p.likes_count || 0) * 2) + (p.comments_count || 0) + ((p.shares_count || 0) * 0.5)
    );
  }, [trendingPosts, searchValue, activeTab]);

  const filteredPeople = useMemo(() => {
    if (!searchValue.trim()) return recommendedPeople.slice(0, activeTab === "ALL" ? 6 : undefined);
    return advancedSort(
      recommendedPeople,
      searchValue,
      (p) => [p.display_name || "", p.username || ""],
      (p) => 0
    );
  }, [recommendedPeople, searchValue, activeTab]);

  const renderCommunityIcon = (icon?: string | null) => {
    if (!icon) return "🌐";
    if (String(icon).startsWith("http")) {
      return null;
    }
    const IconComponent = IconMap[icon];
    if (IconComponent) return <IconComponent className="w-5 h-5 text-foreground" />;
    return icon;
  };

  if (loading) {
    return <PageContainer size="xl"><div className="py-10 text-foreground/60">Loading discovery...</div></PageContainer>;
  }

  return (
    <PageContainer size="xl">
      <PageHeader
        title="Discovery"
        description="Trending topics, recommended communities, and posts surfaced from the real discovery engine."
      />

      <PageSection>
        <div className="relative w-full mb-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-secondary px-4 py-3">
            <Search className="w-5 h-5 text-foreground/40 shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search people, communities, hashtags, or events..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/35"
            />
            <GlowButton variant="secondary" className="shrink-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Search
            </GlowButton>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
          {["ALL", "PEOPLE", "TAGS", "COMMUNITIES", "POSTS"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition ${
                activeTab === tab
                  ? "bg-primary text-background border-primary"
                  : "bg-surface-secondary text-foreground/70 border-border hover:border-primary/40"
              }`}
            >
              {tab}
            </button>
          ))}
          <button className="px-4 py-2 rounded-full bg-surface-secondary text-foreground/80 border border-border flex items-center gap-2 text-sm font-semibold shrink-0">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {(activeTab === "ALL" || activeTab === "TAGS") && (
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Trending Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.length === 0 ? (
                  <div className="text-sm text-foreground/50">No tags matched your search.</div>
                ) : trendingTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-secondary px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface transition cursor-pointer">
                    <Hash className="w-4 h-4 text-primary" />
                    {tag}
                  </span>
                ))}
              </div>
            </GlassPanel>
          )}

          {(activeTab === "ALL" || activeTab === "PEOPLE") && (
            <GlassPanel className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-pink-500" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Discover People</h2>
                </div>
              </div>
              <div className="space-y-4">
                {filteredPeople.length === 0 ? (
                  <div className="text-sm text-foreground/50">No people matched your search.</div>
                ) : filteredPeople.map((person) => (
                  <div key={person.user_id} className="p-4 rounded-2xl bg-surface-secondary border border-border hover:border-primary/40 transition cursor-pointer" onClick={() => router.push(`/dapp/u/${person.username}`)}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-full bg-surface flex items-center justify-center border border-border shrink-0 overflow-hidden`}>
                        {person.avatar_url ? (
                          <AppImage src={person.avatar_url} containerClassName="w-full h-full" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-foreground">{(person.display_name || "U").charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground truncate">{person.display_name}</h3>
                        <p className="text-xs text-foreground/55 truncate">@{person.username}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {(activeTab === "ALL" || activeTab === "COMMUNITIES") && (
            <GlassPanel className={`p-6 ${activeTab === "COMMUNITIES" ? "lg:col-span-2" : ""}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Recommended Communities</h2>
                </div>
              </div>

              <div className={`grid gap-4 ${activeTab === "COMMUNITIES" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {filteredCommunities.length === 0 ? (
                  <div className="text-sm text-foreground/50">No communities matched your search.</div>
                ) : filteredCommunities.map((community) => (
                  <div key={community.id} className="p-4 rounded-2xl bg-surface-secondary border border-border hover:border-primary/40 transition">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${community.color_gradient || "from-surface-secondary to-surface"} flex items-center justify-center border border-border shrink-0 overflow-hidden`}>
                          {community.icon && String(community.icon).startsWith("http") ? (
                            <AppImage src={community.icon} containerClassName="w-full h-full" className="w-full h-full object-cover" />
                          ) : (
                            renderCommunityIcon(community.icon)
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-foreground truncate">{community.name}</h3>
                          <p className="text-xs text-foreground/55 truncate flex items-center gap-1">
                            <Users className="w-3 h-3" /> {community.member_count?.toLocaleString() || 0} members
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-foreground/30 shrink-0" />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {community.topic_category_name && <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{community.topic_category_name}</span>}
                      {community.topic_subcategory_name && <span className="text-[11px] px-2 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">{community.topic_subcategory_name}</span>}
                      {community.location_mode && <span className="text-[11px] px-2 py-1 rounded-full bg-background text-foreground/70 border border-border">{community.location_mode}</span>}
                    </div>
                    <GlowButton variant="secondary" className="mt-4 w-full" onClick={() => router.push(`/dapp/communities/${community.id}`)}>
                      Open Community
                    </GlowButton>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {(activeTab === "ALL" || activeTab === "POSTS") && (
            <GlassPanel className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Discover Posts</h2>
                </div>
              </div>

              <BentoGrid stagger={true} className="auto-rows-[minmax(250px,300px)]">
                {filteredPosts.length === 0 ? (
                  <div className="md:col-span-2 xl:col-span-3 text-sm text-foreground/50">No posts matched your search.</div>
                ) : filteredPosts.map((post, idx) => {
                  let colSpan: 1 | 2 | 3 | 4 = 1;
                  let rowSpan: 1 | 2 = 1;

                  if (idx === 0 || post.media_type?.startsWith("video")) {
                    colSpan = 2;
                    rowSpan = 2;
                  } else if (idx % 5 === 0) {
                    colSpan = 2;
                  } else if (idx % 4 === 0) {
                    rowSpan = 2;
                  }

                  return (
                    <BentoItem 
                      key={post.id} 
                      colSpan={colSpan}
                      rowSpan={rowSpan}
                      className="group cursor-pointer hover:border-primary/40 transition-all duration-300 overflow-hidden flex flex-col"
                      onClick={() => router.push(`/dapp/post/${post.id}`)}
                    >
                      <div className="relative w-full flex-1 overflow-hidden">
                        {post.media_url ? (
                          post.media_type?.startsWith("video") ? (
                            <video src={getMediaUrl(post.media_url)} className="w-full h-full object-cover bg-black group-hover:scale-105 transition-transform duration-500" loop muted playsInline />
                          ) : (
                            <AppImage src={post.media_url} containerClassName="w-full h-full" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          )
                        ) : (
                          <div className="w-full h-full bg-surface-secondary flex items-center justify-center group-hover:bg-surface-secondary/80 transition-colors">
                            <Play className="w-10 h-10 text-primary/60 group-hover:scale-110 transition-transform" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/30">
                            {(post.display_name || "U").charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs font-bold text-white drop-shadow-md truncate">{post.display_name || "Member"}</p>
                        </div>
                        {post.content && (
                          <p className="text-xs text-white/90 line-clamp-2 drop-shadow-md mb-2">{post.content}</p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] font-medium text-white/70">
                          <span className="flex items-center gap-1"><span className="text-pink-500">♥</span> {post.likes_count || 0}</span>
                          <span className="flex items-center gap-1">💬 {post.comments_count || 0}</span>
                          <span className="flex items-center gap-1">↗ {post.shares_count || 0}</span>
                        </div>
                      </div>
                    </BentoItem>
                  );
                })}
              </BentoGrid>
            </GlassPanel>
          )}
        </div>
      </PageSection>
    </PageContainer>
  );
}
