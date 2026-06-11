"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AtSign,
  Bell,
  Calendar,
  CheckCircle2,
  Gift,
  Heart,
  Loader2,
  MessageCircle,
  Settings2,
  UserPlus,
  Users,
  ExternalLink,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { safeObject } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";

type NotificationTab = "ALL" | "MESSAGES" | "SOCIAL" | "EVENTS";

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: number | boolean;
  action_url?: string | null;
  meta?: unknown;
  created_at: string;
};

const tabLabels: Record<NotificationTab, string> = {
  ALL: "All Activity",
  MESSAGES: "Messages",
  SOCIAL: "Social",
  EVENTS: "Events",
};

const typeMeta = {
  connection_request: { icon: UserPlus, color: "text-primary", bg: "bg-primary/10", tab: "SOCIAL" as const },
  connection_accepted: { icon: Users, color: "text-success", bg: "bg-success/10", tab: "SOCIAL" as const },
  MESSAGE: { icon: MessageCircle, color: "text-secondary", bg: "bg-secondary/10", tab: "MESSAGES" as const },
  NEW_POST: { icon: Bell, color: "text-primary", bg: "bg-primary/10", tab: "SOCIAL" as const },
  NEW_COMMENT: { icon: AtSign, color: "text-warning", bg: "bg-warning/10", tab: "SOCIAL" as const },
  POST_LIKE: { icon: Heart, color: "text-danger", bg: "bg-danger/10", tab: "SOCIAL" as const },
  EVENT: { icon: Calendar, color: "text-secondary", bg: "bg-secondary/10", tab: "EVENTS" as const },
  EVENT_REMINDER: { icon: Calendar, color: "text-secondary", bg: "bg-secondary/10", tab: "EVENTS" as const },
  GIFT: { icon: Gift, color: "text-warning", bg: "bg-warning/10", tab: "SOCIAL" as const },
};

function normalizeTab(type: string): NotificationTab {
  const meta = typeMeta[type as keyof typeof typeMeta];
  return meta?.tab || "SOCIAL";
}

function getNotificationMessage(item: NotificationItem) {
  if (item.type === "MESSAGE") {
    return "You have a new message.";
  }
  return item.message;
}

function getNotificationIcon(item: NotificationItem) {
  return typeMeta[item.type as keyof typeof typeMeta] || { icon: Bell, color: "text-primary", bg: "bg-primary/10" };
}

function formatTime(createdAt: string) {
  const date = new Date(createdAt);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.max(1, Math.round(diffMs / 60000));

  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NotificationTab>("ALL");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [decisionState, setDecisionState] = useState<Record<number, "accepted" | "declined">>({});

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      const items: NotificationItem[] = Array.isArray(data.data?.items) ? data.data.items : [];
      setNotifications(items.filter((item) => !item.is_read));
      setUnreadCount(Number(data.data?.pagination?.unread || 0));
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const visibleNotifications = useMemo(() => {
    return notifications.filter((notif) => activeTab === "ALL" || normalizeTab(notif.type) === activeTab);
  }, [activeTab, notifications]);

  const markRead = async (notificationId: number) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setDecisionState((prev) => {
        if (!prev[notificationId]) return prev;
        const next = { ...prev };
        delete next[notificationId];
        return next;
      });
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put("/notifications/read-all");
      setNotifications([]);
      setUnreadCount(0);
      setDecisionState({});
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const openNotification = async (item: NotificationItem) => {
    const meta = safeObject<any>(item.meta);
    await markRead(item.id);
    if (item.type === "connection_request" && meta?.senderUsername) {
      router.push(`/dapp/u/${meta.senderUsername}`);
      return;
    }
    if (item.action_url) {
      router.push(item.action_url);
    }
  };

  const handleConnectionDecision = async (item: NotificationItem, accepted: boolean) => {
    const meta = safeObject<any>(item.meta);
    if (!meta?.senderId) return;

    try {
      if (accepted) {
        await api.post(`/connections/accept/${meta.senderId}`);
      } else {
        await api.delete(`/connections/${meta.senderId}`);
      }
      await api.put(`/notifications/${item.id}/read`);
      setDecisionState((prev) => ({ ...prev, [item.id]: accepted ? "accepted" : "declined" }));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      window.setTimeout(() => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== item.id));
        setDecisionState((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      }, 1200);
    } catch (error) {
      toast.error(accepted ? "Failed to accept request" : "Failed to decline request");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <AnimatedContainer animation="slideUp" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <Bell className="w-8 h-8 text-primary" /> Notification Center
          </h1>
          <p className="text-foreground/60">Unread notifications disappear after you act on them.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full border border-border bg-surface-secondary text-sm font-semibold text-foreground">
            {unreadCount} unread
          </div>
          <GlowButton
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={markAllRead}
            disabled={markingAll || unreadCount === 0}
          >
            {markingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Mark All Read
          </GlowButton>
        </div>
      </AnimatedContainer>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-2 bg-surface-secondary p-1 rounded-2xl w-fit border border-border">
            {(Object.keys(tabLabels) as NotificationTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl font-bold text-sm transition ${
                  activeTab === tab ? "bg-surface text-foreground shadow-soft" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : visibleNotifications.length === 0 ? (
            <GlassPanel className="p-10 rounded-3xl border border-border text-center">
              <Bell className="w-10 h-10 text-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">No unread notifications</h3>
              <p className="text-sm text-foreground/60">You are caught up for now.</p>
            </GlassPanel>
          ) : (
            <AnimatedContainer animation="fade" className="space-y-3">
              {visibleNotifications.map((notif) => {
                const { icon: Icon, color, bg } = getNotificationIcon(notif);
                const meta = safeObject<any>(notif.meta);
                const message = getNotificationMessage(notif);
                const actionState = decisionState[notif.id];

                return (
                  <GlassPanel
                    key={notif.id}
                    className="p-4 rounded-2xl flex items-start gap-4 transition border-border hover:border-foreground/30"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-border ${bg}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => openNotification(notif)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openNotification(notif);
                        }
                      }}
                      className="flex-1 text-left min-w-0 cursor-pointer"
                    >
                      <p className="text-sm font-bold text-foreground">{notif.title}</p>
                      <p className="text-xs text-foreground/60 mt-1 line-clamp-2">{message}</p>
                      <span className="text-xs text-foreground/45 mt-2 inline-block">
                        {formatTime(notif.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {notif.action_url && notif.type !== "connection_request" && (
                        <button
                          type="button"
                          onClick={() => openNotification(notif)}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground hover:border-foreground/30 transition"
                        >
                          Open <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {notif.type === "connection_request" && meta?.senderId && (
                        actionState ? (
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              actionState === "accepted"
                                ? "bg-success/10 text-success"
                                : "bg-danger/10 text-danger"
                            }`}
                          >
                            {actionState === "accepted" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            {actionState === "accepted" ? "Accepted" : "Declined"}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleConnectionDecision(notif, true)}
                              className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/20 transition"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConnectionDecision(notif, false)}
                              className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/20 transition"
                            >
                              Decline
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </GlassPanel>
                );
              })}
            </AnimatedContainer>
          )}
        </div>

        <div className="w-full lg:w-[400px] shrink-0">
          <GlassPanel className="p-6 rounded-3xl border border-border sticky top-24">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" /> Alert Preferences
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-foreground/60">
                This page now uses the live notifications API. Read items are removed from the active list.
              </p>
              <div className="rounded-2xl bg-surface-secondary border border-border p-4">
                <p className="text-xs uppercase tracking-wider text-foreground/45 font-bold mb-2">Behavior</p>
                <ul className="space-y-2 text-sm text-foreground/75">
                  <li>Unread notifications stay visible until opened or actioned.</li>
                  <li>Message notifications no longer show a message preview.</li>
                  <li>Connection requests can be accepted or declined inline.</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-surface-secondary border border-border p-4">
                <p className="text-xs uppercase tracking-wider text-foreground/45 font-bold mb-2">Quick Actions</p>
                <div className="flex flex-col gap-2">
                  <GlowButton variant="ghost" size="sm" className="w-full" onClick={markAllRead} disabled={unreadCount === 0}>
                    Mark all unread as read
                  </GlowButton>
                  <Link
                    href="/dapp/inbox"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:border-foreground/30 transition"
                  >
                    Go to inbox
                  </Link>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
