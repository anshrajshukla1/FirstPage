import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import {
  getMyMicrosites,
  getMicrosite,
  getMicrositeCount,
  createMicrosite,
  updateMicrosite,
  deleteMicrosite,
  publishMicrosite,
  unpublishMicrosite,
  archiveMicrosite,
} from "@/services/microsite-service";
import type {
  CreateMicrositeRequest,
  UpdateMicrositeRequest,
  MicrositeStatus,
} from "@/types";

// ── Queries ──────────────────────────────────────────────────────────

export function useMyMicrosites(
  page = 0,
  size = 12,
  status?: MicrositeStatus,
) {
  return useQuery({
    queryKey: [...queryKeys.microsites.all, page, size, status],
    queryFn: () => getMyMicrosites(page, size, status),
  });
}

export function useMicrosite(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.microsites.detail(id ?? ""),
    queryFn: () => getMicrosite(id!),
    enabled: !!id,
  });
}

export function useMicrositeCount() {
  return useQuery({
    queryKey: [...queryKeys.microsites.all, "count"],
    queryFn: getMicrositeCount,
  });
}

// ── Mutations ────────────────────────────────────────────────────────

export function useCreateMicrosite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMicrositeRequest) => createMicrosite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.microsites.all });
    },
  });
}

export function useUpdateMicrosite(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMicrositeRequest) => updateMicrosite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.microsites.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.microsites.all });
    },
  });
}

export function useDeleteMicrosite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMicrosite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.microsites.all });
    },
  });
}

export function usePublishMicrosite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishMicrosite(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.microsites.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.microsites.all });
    },
  });
}

export function useUnpublishMicrosite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unpublishMicrosite(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.microsites.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.microsites.all });
    },
  });
}

export function useArchiveMicrosite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveMicrosite(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.microsites.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.microsites.all });
    },
  });
}
