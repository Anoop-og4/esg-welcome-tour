import { motion } from "framer-motion";
import { AlertTriangle, Bell, MessageSquare, Activity, Monitor } from "lucide-react";
import type { Notification, NotificationType } from "./notificationData";

const typeConfig: Record<NotificationType, { icon: typeof Bell; colorClass: string; bgClass: string }> = {
  system: { icon: Monitor, colorClass: "text-info", bgClass: "bg-info/10" },
  alert: { icon: AlertTriangle, colorClass: "text-destructive", bgClass: "bg-destructive/10" },
  message: { icon: MessageSquare, colorClass: "text-primary", bgClass: "bg-primary/10" },
  activity: { icon: Activity, colorClass: "text-accent-foreground", bgClass: "bg-accent/20" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export default function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onMarkRead(notification.id)}
      className={`group flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
        notification.read
          ? "opacity-70 hover:bg-muted/50"
          : "bg-primary/[0.04] hover:bg-primary/[0.08]"
      }`}
    >
      {/* Icon */}
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bgClass}`}>
        <Icon size={14} className={config.colorClass} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-tight ${notification.read ? "font-medium text-muted-foreground" : "font-semibold text-foreground"}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${config.bgClass} ${config.colorClass}`}>
            {notification.type}
          </span>
          <span className="text-[10px] text-muted-foreground">{timeAgo(notification.createdAt)}</span>
        </div>
      </div>
    </motion.button>
  );
}
