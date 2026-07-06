import { get, post, put, del } from "@/api/client";
import type {
  Microsite,
  MicrositeListItem,
  PaginatedResponse,
  CreateMicrositeRequest,
  UpdateMicrositeRequest,
  MicrositeStatus,
} from "@/types";

// ── CRUD Operations ──────────────────────────────────────────────────

export async function getMyMicrosites(
  page = 0,
  size = 12,
  status?: MicrositeStatus,
): Promise<PaginatedResponse<MicrositeListItem>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.set("status", status);
  return get<PaginatedResponse<MicrositeListItem>>(`/microsites/me?${params}`);
}

export async function getMicrositeCount(): Promise<{ total: number }> {
  return get<{ total: number }>("/microsites/me/count");
}

export async function getMicrosite(id: string): Promise<Microsite> {
  return get<Microsite>(`/microsites/${id}`);
}

export async function getMicrositeBySlug(slug: string): Promise<Microsite> {
  return get<Microsite>(`/microsites/public/${slug}`);
}

export async function createMicrosite(
  data: CreateMicrositeRequest,
): Promise<Microsite> {
  return post<Microsite, CreateMicrositeRequest>("/microsites", data);
}

export async function updateMicrosite(
  id: string,
  data: UpdateMicrositeRequest,
): Promise<Microsite> {
  return put<Microsite, UpdateMicrositeRequest>(`/microsites/${id}`, data);
}

export async function deleteMicrosite(id: string): Promise<void> {
  return del<void>(`/microsites/${id}`);
}

// ── Lifecycle Operations ─────────────────────────────────────────────

export async function publishMicrosite(id: string): Promise<Microsite> {
  return post<Microsite, undefined>(`/microsites/${id}/publish`, undefined);
}

export async function unpublishMicrosite(id: string): Promise<Microsite> {
  return post<Microsite, undefined>(`/microsites/${id}/unpublish`, undefined);
}

export async function archiveMicrosite(id: string): Promise<Microsite> {
  return post<Microsite, undefined>(`/microsites/${id}/archive`, undefined);
}

// ── Password Verification (public) ──────────────────────────────────

export async function verifyMicrositePassword(
  slug: string,
  password: string,
): Promise<{ valid: boolean }> {
  return post<{ valid: boolean }, { password: string }>(
    `/microsites/public/${slug}/verify-password`,
    { password },
  );
}
