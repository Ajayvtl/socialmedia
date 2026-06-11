import { eventBus } from "./eventBus";

export interface UserPresence {
  userId: string;
  username: string;
  status: "online" | "idle" | "offline";
  lastActive: Date;
  customStatus?: string;
}

class PresenceBus {
  private activeUsers: Record<string, UserPresence> = {};
  private typingUsers: Record<string, Set<string>> = {}; // chatId -> Set of userIds
  private listeners: ((users: Record<string, UserPresence>) => void)[] = [];

  /**
   * Subscribes to global presence list modifications
   */
  subscribe(callback: (users: Record<string, UserPresence>) => void): () => void {
    this.listeners.push(callback);
    callback({ ...this.activeUsers });

    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private emit() {
    this.listeners.forEach((callback) => callback({ ...this.activeUsers }));
  }

  /**
   * Records presence state modifications (e.g. from websocket signals)
   */
  updatePresence(userId: string, presence: Partial<UserPresence>) {
    const existing = this.activeUsers[userId] || {
      userId,
      username: "",
      status: "offline",
      lastActive: new Date(),
    };

    const updated: UserPresence = {
      ...existing,
      ...presence,
      lastActive: new Date(),
    } as UserPresence;

    this.activeUsers[userId] = updated;
    this.emit();

    eventBus.publish("PRESENCE_CHANGED", updated);
  }

  /**
   * Removes presence data for a user
   */
  removeUser(userId: string) {
    if (this.activeUsers[userId]) {
      const offlinePresence = { ...this.activeUsers[userId], status: "offline" as const };
      delete this.activeUsers[userId];
      this.emit();
      eventBus.publish("PRESENCE_CHANGED", offlinePresence);
    }
  }

  /**
   * Dispatches user typing status notifications in a chat
   */
  setTyping(chatId: string, userId: string, isTyping: boolean) {
    if (!this.typingUsers[chatId]) {
      this.typingUsers[chatId] = new Set();
    }

    if (isTyping) {
      this.typingUsers[chatId].add(userId);
    } else {
      this.typingUsers[chatId].delete(userId);
    }

    eventBus.publish("TYPING_STATUS_CHANGED", {
      chatId,
      userIds: Array.from(this.typingUsers[chatId]),
    });
  }

  /**
   * Gets all typing user IDs in a specific chat
   */
  getTypingUsers(chatId: string): string[] {
    return this.typingUsers[chatId] ? Array.from(this.typingUsers[chatId]) : [];
  }

  /**
   * Retrieves active users dictionary
   */
  getActivePresences(): Record<string, UserPresence> {
    return { ...this.activeUsers };
  }
}

export const presenceBus = new PresenceBus();
export default presenceBus;
