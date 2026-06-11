import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  walletAddress?: string;
  referralCode?: string;
  isVerified?: boolean;
}

export function useUser(userId?: string) {
  const queryClient = useQueryClient();
  const activeId = userId || "me";

  // Fetch user profile data
  const userProfileQuery = useQuery<UserProfile>({
    queryKey: ["user-profile", activeId],
    queryFn: async () => {
      const res = await api.get(`/users/${activeId}`);
      return res.data;
    },
  });

  // Update profile settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (userData: Partial<UserProfile>) => {
      const res = await api.put("/users/me", userData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", "me"] });
    },
  });

  return {
    profile: userProfileQuery.data || null,
    isLoading: userProfileQuery.isLoading,
    error: userProfileQuery.error,
    refetch: userProfileQuery.refetch,
    updateProfile: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,
  };
}
