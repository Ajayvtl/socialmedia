import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity?: number;
  rsvpCount: number;
  rsvpStatus?: "going" | "maybe" | "declined" | null;
}

export function useEvents() {
  const queryClient = useQueryClient();

  // Fetch events list
  const eventsQuery = useQuery<EventRecord[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await api.get("/events");
      return res.data;
    },
  });

  // RSVP to an event
  const rsvpMutation = useMutation({
    mutationFn: async (payload: { eventId: string; status: "going" | "maybe" | "declined" }) => {
      const res = await api.post(`/events/${payload.eventId}/rsvp`, { status: payload.status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: Omit<EventRecord, "id" | "rsvpCount" | "rsvpStatus">) => {
      const res = await api.post("/events", eventData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
    rsvp: rsvpMutation.mutateAsync,
    isRsvping: rsvpMutation.isPending,
    createEvent: createEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
  };
}
