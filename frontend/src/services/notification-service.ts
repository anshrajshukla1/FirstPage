import { get, post } from "@/api/client";

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  micrositeId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  content: NotificationItem[];
  totalElements: number;
  totalPages: number;
}

export async function getNotifications(
  page = 0,
  size = 20,
): Promise<PaginatedNotifications> {
  return get<PaginatedNotifications>(
    `/notifications?page=${page}&size=${size}`,
  );
}

export async function getUnreadCount(): Promise<{ count: number }> {
  return get<{ count: number }>("/notifications/unread-count");
}

export async function markAsRead(id: string): Promise<void> {
  return post<void, undefined>(`/notifications/${id}/read`, undefined);
}

export async function markAllAsRead(): Promise<void> {
  return post<void, undefined>("/notifications/read-all", undefined);
}
