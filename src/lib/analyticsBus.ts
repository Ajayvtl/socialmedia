import { telemetryService, TelemetryEventName } from "./telemetryService";
import { eventBus } from "./eventBus";

export interface AnalyticsEvent {
  eventType: TelemetryEventName;
  entityType?: "post" | "user" | "community" | "event" | "dating_profile" | "creator";
  entityId?: string | number;
  metadata?: Record<string, any>;
  timestamp?: number;
}

class AnalyticsBus {
  /**
   * Tracks and queues analytics events
   */
  track(event: AnalyticsEvent) {
    const payload = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    };

    // Queue in client batched telemetryService
    telemetryService.track(payload.eventType, {
      entityType: payload.entityType,
      entityId: payload.entityId,
      ...payload.metadata,
    });

    // Publish to eventBus for local listener updates
    eventBus.publish("ANALYTICS_EVENT_TRACKED", payload);
  }

  /**
   * Explicitly flush all queued telemetry requests to endpoint
   */
  flush() {
    telemetryService.flush();
  }
}

export const analyticsBus = new AnalyticsBus();
export default analyticsBus;
