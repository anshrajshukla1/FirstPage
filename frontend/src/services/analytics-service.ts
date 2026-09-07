import { get } from "@/api/client";

export interface DashboardAnalytics {
  totalMicrosites: number;
  totalViews: number;
  totalReactions: number;
  totalReplies: number;
}

export interface MicrositeAnalytics {
  micrositeId: string;
  title: string;
  status: string;
  totalViews: number;
  uniqueVisitors: number;
  avgTimeSpentSeconds: number;
  totalReplays: number;
  totalReactions: number;
  reactionsByType: { type: string; count: number }[];
  totalReplies: number;
  unreadReplies: number;
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  return get<DashboardAnalytics>("/analytics/dashboard");
}

export async function getMicrositeAnalytics(
  micrositeId: string,
): Promise<MicrositeAnalytics> {
  return get<MicrositeAnalytics>(`/analytics/microsites/${micrositeId}`);
}

import type { PaginatedResponse, Reply } from "@/types";

export async function getReplies(
  micrositeId: string,
  page: number = 0,
): Promise<PaginatedResponse<Reply>> {
  return get<PaginatedResponse<Reply>>(
    `/analytics/microsites/${micrositeId}/replies?page=${page}&size=50`,
  );
}
