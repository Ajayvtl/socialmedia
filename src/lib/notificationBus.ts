import { eventBus } from "./eventBus";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "dating" | "community" | "event";
  timestamp: Date;
  read: boolean;
  link?: string;
}

class NotificationBus {
  private notifications: AppNotification[] = [];
  private listeners: ((notifications: AppNotification[]) => void)[] = [];

  /**
   * Subscribes to notification state updates
   */
  subscribe(callback: (notifications: AppNotification[]) => void): () => void {
    this.listeners.push(callback);
    callback([...this.notifications]); // Immediate state push

    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Trigger state updates to all subscribers
   */
  private emit() {
    this.listeners.forEach((callback) => callback([...this.notifications]));
  }

  /**
   * Receives and processes a new live notification
   */
  notify(notification: Omit<AppNotification, "id" | "timestamp" | "read">) {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    // Keep memory cache within 100 entries limit
    this.notifications = [newNotif, ...this.notifications].slice(0, 100);
    this.emit();

    // Fire generic eventBus notification
    eventBus.publish("NOTIFICATION_RECEIVED", newNotif);
  }

  /**
   * Marks a specific notification as read
   */
  markAsRead(id: string) {
    this.notifications = this.notifications.map((notif) =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    this.emit();
    eventBus.publish("NOTIFICATION_READ", id);
  }

  /**
   * Marks all notifications as read
   */
  markAllAsRead() {
    this.notifications = this.notifications.map((notif) => ({ ...notif, read: true }));
    this.emit();
    eventBus.publish("NOTIFICATIONS_ALL_READ");
  }

  /**
   * Deletes a notification
   */
  deleteNotification(id: string) {
    this.notifications = this.notifications.filter((notif) => notif.id !== id);
    this.emit();
  }

  /**
   * Gets list of current notifications
   */
  getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  /**
   * Gets unread notifications count
   */
  getUnreadCount(): number {
    return this.notifications.filter((notif) => !notif.read).length;
  }
}

export const notificationBus = new NotificationBus();
export default notificationBus;
