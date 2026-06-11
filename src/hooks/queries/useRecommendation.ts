import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

export interface RecommendationItem {
  id: string;
  type: "post" | "dating" | "community" | "event" | "creator";
  base_score: number;
  final_score: number;
}

export function useRecommendation(options?: { provider?: "sql" | "llm" | "embedding"; limit?: number }) {
  const provider = options?.provider || "sql";
  const limit = options?.limit || 5;

  // 1. Fetch communities recommendations
  const communityRecsQuery = useQuery<RecommendationItem[]>({
    queryKey: ["recommendations", "community", provider, limit],
    queryFn: async () => {
      const res = await api.get(`/recommendations/communities?provider=${provider}&limit=${limit}`);
      return res.data;
    },
  });

  // 2. Fetch creators recommendations
  const creatorRecsQuery = useQuery<RecommendationItem[]>({
    queryKey: ["recommendations", "creator", provider, limit],
    queryFn: async () => {
      const res = await api.get(`/recommendations/creators?provider=${provider}&limit=${limit}`);
      return res.data;
    },
  });

  // 3. Fetch events recommendations
  const eventRecsQuery = useQuery<RecommendationItem[]>({
    queryKey: ["recommendations", "event", provider, limit],
    queryFn: async () => {
      const res = await api.get(`/recommendations/events?provider=${provider}&limit=${limit}`);
      return res.data;
    },
  });

  // 4. Fetch AI Copilot Summary mutation
  const aiSummaryMutation = useMutation({
    mutationFn: async (payload: { entityType: string; entityId: string }) => {
      const res = await api.post("/recommendations/ai-summary", payload);
      return res.data.summary as string;
    },
  });

  return {
    recommendedCommunities: communityRecsQuery.data || [],
    isLoadingCommunities: communityRecsQuery.isLoading,
    recommendedCreators: creatorRecsQuery.data || [],
    isLoadingCreators: creatorRecsQuery.isLoading,
    recommendedEvents: eventRecsQuery.data || [],
    isLoadingEvents: eventRecsQuery.isLoading,
    getAISummary: aiSummaryMutation.mutateAsync,
    isGeneratingSummary: aiSummaryMutation.isPending,
  };
}
export default useRecommendation;
