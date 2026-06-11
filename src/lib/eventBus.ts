type EventCallback = (data: any) => void;

class EventBus {
  private listeners: Record<string, EventCallback[]> = {};

  /**
   * Subscribes to a specific global event
   */
  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe trigger
    return () => {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    };
  }

  /**
   * Publishes an event to all registered listeners
   */
  publish(event: string, data?: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in event callback for event ${event}:`, err);
      }
    });
  }

  /**
   * Clear all subscribers
   */
  clear() {
    this.listeners = {};
  }
}

export const eventBus = new EventBus();
export default eventBus;
