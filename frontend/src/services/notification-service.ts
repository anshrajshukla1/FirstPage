import { get, post } from "@/api/client";
import type { Notification, PaginatedResponse } from "@/types";

/** Newest first — the backend sorts by `createdAt` DESC by default. */
export async function getNotifications(
  page = 0,
  size = 20,
): Promise<PaginatedResponse<Notification>> {
  return get<PaginatedResponse<Notification>>(
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
