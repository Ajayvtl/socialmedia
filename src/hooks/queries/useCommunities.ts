import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Community {
  id: string;
  name: string;
  description: string;
  slug: string;
  membersCount: number;
  joined: boolean;
  rules?: string;
}

export function useCommunities() {
  const queryClient = useQueryClient();

  // Fetch all communities
  const communitiesQuery = useQuery<Community[]>({
    queryKey: ["communities"],
    queryFn: async () => {
      const res = await api.get("/communities");
      return res.data;
    },
  });

  // Join community mutation
  const joinMutation = useMutation({
    mutationFn: async (communityId: string) => {
      const res = await api.post(`/communities/${communityId}/join`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });

  // Create community mutation
  const createCommunityMutation = useMutation({
    mutationFn: async (communityData: { name: string; description: string; rules?: string }) => {
      const res = await api.post("/communities", communityData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });

  return {
    communities: communitiesQuery.data || [],
    isLoading: communitiesQuery.isLoading,
    error: communitiesQuery.error,
    refetch: communitiesQuery.refetch,
    joinCommunity: joinMutation.mutateAsync,
    isJoining: joinMutation.isPending,
    createCommunity: createCommunityMutation.mutateAsync,
    isCreating: createCommunityMutation.isPending,
  };
}
