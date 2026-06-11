import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface FeedPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likesCount: number;
  commentsCount: number;
  liked: boolean;
  createdAt: string;
}

export function useFeed() {
  const queryClient = useQueryClient();

  // Fetch social feed posts
  const feedQuery = useQuery<FeedPost[]>({
    queryKey: ["feed"],
    queryFn: async () => {
      const res = await api.get("/feed");
      return res.data;
    },
  });

  // Like a post mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await api.post(`/feed/posts/${postId}/like`);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate feed cache to fetch latest states
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { title: string; content: string }) => {
      const res = await api.post("/feed/posts", postData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  return {
    posts: feedQuery.data || [],
    isLoading: feedQuery.isLoading,
    error: feedQuery.error,
    refetch: feedQuery.refetch,
    likePost: likeMutation.mutateAsync,
    isLiking: likeMutation.isPending,
    createPost: createPostMutation.mutateAsync,
    isCreating: createPostMutation.isPending,
  };
}
