import { post, get } from "@/api/client";
import apiClient from "@/api/client";
import type { Slide, Media, CreateSlideRequest, UpdateSlideRequest } from "@/types";

// ── Slide CRUD ──────────────────────────────────────────────────────

export async function getSlides(micrositeId: string): Promise<Slide[]> {
  return get<Slide[]>(`/microsites/${micrositeId}/slides`);
}

export async function createSlide(
  micrositeId: string,
  data: CreateSlideRequest,
): Promise<Slide> {
  return post<Slide, CreateSlideRequest>(
    `/microsites/${micrositeId}/slides`,
    data,
  );
}

export async function updateSlide(
  micrositeId: string,
  slideId: string,
  data: UpdateSlideRequest,
): Promise<Slide> {
  const response = await apiClient.put<{ data: Slide }>(
    `/microsites/${micrositeId}/slides/${slideId}`,
    data,
  );
  return response.data.data;
}

export async function deleteSlide(
  micrositeId: string,
  slideId: string,
): Promise<void> {
  await apiClient.delete(`/microsites/${micrositeId}/slides/${slideId}`);
}

export async function reorderSlides(
  micrositeId: string,
  slideIds: string[],
): Promise<Slide[]> {
  return post<Slide[], { slideIds: string[] }>(
    `/microsites/${micrositeId}/slides/reorder`,
    { slideIds },
  );
}

// ── Media Upload ─────────────────────────────────────────────────────

export async function uploadMedia(
  micrositeId: string,
  file: File,
  type: "IMAGE" | "VIDEO" | "AUDIO" | "VOICE_NOTE",
  caption?: string,
  /**
   * Attaches the upload to one slide. Without it the media hangs off the
   * microsite only and never appears in `SlideResponse.media`, which is why
   * photo slides used to come back empty.
   */
  slideId?: string,
): Promise<Media> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  if (caption) formData.append("caption", caption);
  if (slideId) formData.append("slideId", slideId);

  const response = await apiClient.post<{ data: Media }>(
    `/microsites/${micrositeId}/media`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data.data;
}

export async function getMedia(micrositeId: string): Promise<Media[]> {
  return get<Media[]>(`/microsites/${micrositeId}/media`);
}

/** Captions are written after the upload, once the sender sees the photo. */
export async function updateMediaCaption(
  micrositeId: string,
  mediaId: string,
  caption: string,
): Promise<Media> {
  const response = await apiClient.patch<{ data: Media }>(
    `/microsites/${micrositeId}/media/${mediaId}`,
    { caption },
  );
  return response.data.data;
}

/** `mediaIds` in display order. Only the listed items move. */
export async function reorderMedia(
  micrositeId: string,
  mediaIds: string[],
): Promise<Media[]> {
  return post<Media[], { mediaIds: string[] }>(
    `/microsites/${micrositeId}/media/reorder`,
    { mediaIds },
  );
}

export async function deleteMedia(
  micrositeId: string,
  mediaId: string,
): Promise<void> {
  await apiClient.delete(`/microsites/${micrositeId}/media/${mediaId}`);
}

// ── AI Generation ────────────────────────────────────────────────────

export interface AIGenerateRequest {
  prompt: string;
  context?: string;
  category?: string;
  tone?: string;
}

export interface AIGenerateResponse {
  generatedContent: string;
  provider: string;
  promptType: string;
}

export async function generateAIContent(
  data: AIGenerateRequest,
): Promise<AIGenerateResponse> {
  return post<AIGenerateResponse, AIGenerateRequest>("/ai/generate", data);
}
