import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export function useMessages(activeThreadId?: string) {
  const queryClient = useQueryClient();

  // Fetch all inbox threads
  const threadsQuery = useQuery<ChatThread[]>({
    queryKey: ["chat-threads"],
    queryFn: async () => {
      const res = await api.get("/messages/threads");
      return res.data;
    },
  });

  // Fetch messages within active chat thread
  const messagesQuery = useQuery<Message[]>({
    queryKey: ["chat-messages", activeThreadId],
    queryFn: async () => {
      if (!activeThreadId) return [];
      const res = await api.get(`/messages/threads/${activeThreadId}`);
      return res.data;
    },
    enabled: !!activeThreadId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { threadId: string; content: string }) => {
      const res = await api.post(`/messages/threads/${payload.threadId}`, { content: payload.content });
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both chat messages and thread list summaries
      queryClient.invalidateQueries({ queryKey: ["chat-messages", variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    },
  });

  return {
    threads: threadsQuery.data || [],
    isLoadingThreads: threadsQuery.isLoading,
    messages: messagesQuery.data || [],
    isLoadingMessages: messagesQuery.isLoading,
    refetchThreads: threadsQuery.refetch,
    refetchMessages: messagesQuery.refetch,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
  };
}
