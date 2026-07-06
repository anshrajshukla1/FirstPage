import { get, post, put, del, patch } from "@/api/client";
import type {
  Microsite,
  MicrositeListItem,
  PaginatedResponse,
  CreateMicrositeRequest,
  UpdateMicrositeRequest,
} from "@/types";

export async function getMicrosites(
  page = 0,
  size = 12,
): Promise<PaginatedResponse<MicrositeListItem>> {
  return get<PaginatedResponse<MicrositeListItem>>(
    `/microsites?page=${page}&size=${size}`,
  );
}

export async function getMicrosite(id: string): Promise<Microsite> {
  return get<Microsite>(`/microsites/${id}`);
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

export async function publishMicrosite(id: string): Promise<Microsite> {
  return patch<Microsite>(`/microsites/${id}/publish`);
}
