import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BellOff,
  CheckCheck,
  Eye,
  Heart,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/services/notification-service";
import { queryKeys } from "@/api/query-keys";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  markAllRead,
  markNotificationRead,
  setNotifications,
} from "@/store/slices/ui-slice";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ROUTES } from "@/constants/routes";
import { cn, formatRelativeTime } from "@/lib/utils";
import { NotificationType, type Notification } from "@/types";

/** One entry per `com.firstpage.entity.enums.NotificationType`. */
const ICONS: Record<NotificationType, { icon: React.ElementType; color: string }> =
  {
    [NotificationType.VIEWED]: { icon: Eye, color: "text-sky-500" },
    [NotificationType.REACTED]: { icon: Heart, color: "text-rose-500" },
    [NotificationType.REPLIED]: { icon: MessageCircle, color: "text-emerald-500" },
    [NotificationType.ACCEPTED]: { icon: Sparkles, color: "text-amber-500" },
  };

function NotificationRow({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const { icon: Icon, color } = ICONS[notification.type] ?? {
    icon: Bell,
    color: "text-primary",
  };

  const body = (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover",
        !notification.isRead && "bg-primary/[0.04]",
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", color)} />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug",
            notification.isRead
              ? "text-text-secondary"
              : "font-medium text-text-primary",
          )}
        >
          {notification.message}
        </p>
        <p className="mt-0.5 text-[11px] text-text-muted">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
      )}
    </div>
  );

  const handleClick = () => {
    if (!notification.isRead) onRead(notification.id);
  };

  // Engagement notifications belong to a microsite — send the owner to its
  // analytics. Ones without a microsite (deleted since) stay unclickable.
  return notification.micrositeId ? (
    <Link
      to={ROUTES.ANALYTICS(notification.micrositeId)}
      onClick={handleClick}
      className="block"
    >
      {body}
    </Link>
  ) : (
    <button onClick={handleClick} className="block w-full">
      {body}
    </button>
  );
}

export function NotificationBell() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const notifications = useAppSelector((state) => state.ui.notifications);
  const [open, setOpen] = useState(false);

  // Cheap COUNT poll drives the badge; the list is only fetched on open.
  const { data: unread } = useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
  });

  const { data: page, isLoading } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => getNotifications(0, 20),
    enabled: open,
  });

  useEffect(() => {
    if (page) dispatch(setNotifications(page.content));
  }, [page, dispatch]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // `notifications.all` is a prefix of `notifications.unread()`, so one
  // invalidation re-syncs both the list and the badge.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };

  const readOne = useMutation({
    mutationFn: markAsRead,
    onMutate: (id: string) => {
      dispatch(markNotificationRead(id));
    },
    onError: () => toast.error("Couldn't mark that as read"),
    onSettled: invalidate,
  });

  const readAll = useMutation({
    mutationFn: markAllAsRead,
    onMutate: () => {
      dispatch(markAllRead());
    },
    onError: () => toast.error("Couldn't mark all as read"),
    onSettled: invalidate,
  });

  const unreadCount = unread?.count ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
              onClick={() => setOpen(false)}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-text-primary">
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      readAll.mutate();
                    }}
                    disabled={readAll.isPending}
                    className="flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[360px] divide-y divide-border overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <LoadingSpinner />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <BellOff className="h-6 w-6 text-text-muted" />
                    <p className="text-sm text-text-secondary">
                      Nothing yet — you'll hear from us when someone opens your
                      page.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onRead={readOne.mutate}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
