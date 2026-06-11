import api from "./api";

export type TelemetryEventName = 
  | "PAGE_VIEW"
  | "POST_VIEW"
  | "POST_LIKE"
  | "POST_SAVE"
  | "PROFILE_VIEW"
  | "COMMUNITY_VIEW"
  | "COMMUNITY_JOIN"
  | "EVENT_VIEW"
  | "EVENT_RSVP"
  | "SEARCH"
  | "MESSAGE_SENT"
  | "MATCH_CREATED"
  | "CREATOR_FOLLOW"
  | "CREATOR_SUBSCRIBE";

export interface TelemetryEvent {
  eventName: TelemetryEventName;
  timestamp: string;
  url: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

const queue: TelemetryEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
const FLUSH_INTERVAL_MS = 5000; // 5 seconds interval
const BATCH_LIMIT = 20;

export const telemetryService = {
  /**
   * Tracks a user interaction event safely across browser environments
   */
  track(eventName: TelemetryEventName, metadata?: Record<string, any>) {
    if (typeof window === "undefined") return;

    const event: TelemetryEvent = {
      eventName,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer || undefined,
      metadata,
    };

    // Logging in development modes for visibility
    if (process.env.NODE_ENV === "development") {
      console.log(`[Telemetry] Tracked event: ${eventName}`, event);
    }

    queue.push(event);

    // Trigger flush if batch limit reached or scheduled timer expires
    if (queue.length >= BATCH_LIMIT) {
      this.flush();
    } else if (!flushTimeout) {
      flushTimeout = setTimeout(() => this.flush(), FLUSH_INTERVAL_MS);
    }
  },

  /**
   * Flushes queued analytics events to the server tracking endpoint
   */
  async flush() {
    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushTimeout = null;
    }

    if (queue.length === 0) return;

    const batch = [...queue];
    queue.length = 0; // Clear queue immediately to avoid duplicates during async dispatch

    try {
      await api.post("/analytics/track-batch", { events: batch });
    } catch (error) {
      console.error("[Telemetry] Failed to dispatch tracking batch", error);
      // Re-queue items if transmission fails
      queue.unshift(...batch);
    }
  }
};
