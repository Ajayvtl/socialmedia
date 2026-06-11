import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface DatingProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  gender: string;
  photos: string[];
  distanceKm?: number;
}

export function useDating() {
  const queryClient = useQueryClient();

  // Fetch match recommendations
  const recommendationsQuery = useQuery<DatingProfile[]>({
    queryKey: ["dating-recommendations"],
    queryFn: async () => {
      const res = await api.get("/dating/recommendations");
      return res.data;
    },
  });

  // Swipe action (like/pass) mutation
  const swipeMutation = useMutation({
    mutationFn: async (payload: { profileId: string; action: "like" | "pass" }) => {
      const res = await api.post(`/dating/profiles/${payload.profileId}/swipe`, { action: payload.action });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate recommendations lists to fetch next set
      queryClient.invalidateQueries({ queryKey: ["dating-recommendations"] });
    },
  });

  // Update bio/photos mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { bio: string; photos: string[] }) => {
      const res = await api.post("/dating/profiles/me", profileData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dating-recommendations"] });
    },
  });

  return {
    recommendations: recommendationsQuery.data || [],
    isLoading: recommendationsQuery.isLoading,
    error: recommendationsQuery.error,
    refetch: recommendationsQuery.refetch,
    swipe: swipeMutation.mutateAsync,
    isSwiping: swipeMutation.isPending,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
}
