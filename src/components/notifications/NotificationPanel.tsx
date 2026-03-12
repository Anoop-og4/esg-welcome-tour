import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NotificationItem from "./NotificationItem";
import { dummyNotifications, type Notification, type NotificationType } from "./notificationData";

type ReadFilter = "all" | "unread" | "read";
const typeFilters: { label: string; value: NotificationType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "System", value: "system" },
  { label: "Alert", value: "alert" },
  { label: "Message", value: "message" },
  { label: "Activity", value: "activity" },
];

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (readFilter === "unread" && n.read) return false;
      if (readFilter === "read" && !n.read) return false;
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      return true;
    });
  }, [notifications, readFilter, typeFilter]);

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[400px] rounded-xl border border-border bg-card p-0 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="default" className="h-5 rounded-full px-1.5 text-[10px]">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="border-b border-border px-4 py-2">
          {/* Read/Unread filter */}
          <div className="flex items-center gap-1 mb-2">
            {(["all", "unread", "read"] as ReadFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setReadFilter(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  readFilter === f
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Type filter */}
          <div className="flex items-center gap-1 flex-wrap">
            <Filter size={10} className="text-muted-foreground mr-1" />
            {typeFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  typeFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <ScrollArea className="h-[360px]">
          <div className="p-2 space-y-0.5">
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                filtered.map((n) => (
                  <NotificationItem key={n.id} notification={n} onMarkRead={markRead} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Bell size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                  <p className="text-xs text-muted-foreground/70">
                    {readFilter === "unread" ? "All caught up!" : "Nothing matches your filters."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 text-center">
          <span className="text-[10px] text-muted-foreground">
            Showing {filtered.length} of {notifications.length} notifications
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
