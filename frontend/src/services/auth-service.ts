import { post, get, put } from "@/api/client";
import type { User, SyncUserRequest, UpdateProfileRequest } from "@/types";

export async function syncUserApi(data: SyncUserRequest): Promise<User> {
  return post<User, SyncUserRequest>("/users/sync", data);
}

export async function getCurrentUser(): Promise<User> {
  return get<User>("/users/me");
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  return put<User, UpdateProfileRequest>("/users/me", data);
}
