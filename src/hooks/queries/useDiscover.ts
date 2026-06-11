import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface DiscoverFeedPost {
  id: string;
  user_id: number;
  content: string;
  media_url?: string;
  media_type: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  display_name: string;
  avatar_url?: string;
  is_liked: boolean;
}

export interface DiscoverEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  attendees_count: number;
}

export interface RecommendedCommunity {
  id: string;
  name: string;
  description: string;
  slug: string;
  membersCount: number;
  activity_score: number;
}

export interface RecommendedCreator {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  authority_score: number;
}

export function useDiscover() {
  // 1. Fetch Trending Feed
  const trendingFeedQuery = useQuery<DiscoverFeedPost[]>({
    queryKey: ["discover-feed", "trending"],
    queryFn: async () => {
      const res = await api.get("/discover/feed?type=trending");
      return res.data.posts;
    },
  });

  // 2. Fetch Personalized Feed
  const personalizedFeedQuery = useQuery<DiscoverFeedPost[]>({
    queryKey: ["discover-feed", "personalized"],
    queryFn: async () => {
      const res = await api.get("/discover/feed?type=personalized");
      return res.data.posts;
    },
  });

  // 3. Fetch Nearby Events
  const nearbyQuery = useQuery<DiscoverEvent[]>({
    queryKey: ["discover-nearby"],
    queryFn: async () => {
      const res = await api.get("/discover/nearby");
      return res.data.events;
    },
  });

  // 4. Fetch Recommended Communities
  const recommendedCommunitiesQuery = useQuery<RecommendedCommunity[]>({
    queryKey: ["discover-recommendations", "communities"],
    queryFn: async () => {
      const res = await api.get("/discover/recommendations?category=communities");
      return res.data.items;
    },
  });

  // 5. Fetch Recommended Creators
  const recommendedCreatorsQuery = useQuery<RecommendedCreator[]>({
    queryKey: ["discover-recommendations", "creators"],
    queryFn: async () => {
      const res = await api.get("/discover/recommendations?category=creators");
      return res.data.items;
    },
  });

  return {
    trendingPosts: trendingFeedQuery.data || [],
    isLoadingTrending: trendingFeedQuery.isLoading,
    personalizedPosts: personalizedFeedQuery.data || [],
    isLoadingPersonalized: personalizedFeedQuery.isLoading,
    nearbyEvents: nearbyQuery.data || [],
    isLoadingNearby: nearbyQuery.isLoading,
    recommendedCommunities: recommendedCommunitiesQuery.data || [],
    isLoadingCommunities: recommendedCommunitiesQuery.isLoading,
    recommendedCreators: recommendedCreatorsQuery.data || [],
    isLoadingCreators: recommendedCreatorsQuery.isLoading,
    refetchAll: () => {
      trendingFeedQuery.refetch();
      personalizedFeedQuery.refetch();
      nearbyQuery.refetch();
      recommendedCommunitiesQuery.refetch();
      recommendedCreatorsQuery.refetch();
    },
  };
}
export default useDiscover;
