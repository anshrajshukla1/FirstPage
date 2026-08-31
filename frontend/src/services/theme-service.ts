import { get } from "@/api/client";
import type { Theme } from "@/types";

export async function getThemes(): Promise<Theme[]> {
  return get<Theme[]>("/public/themes");
}

export async function getFreeThemes(): Promise<Theme[]> {
  return get<Theme[]>("/public/themes/free");
}

export async function getTheme(id: string): Promise<Theme> {
  return get<Theme>(`/public/themes/${id}`);
}
