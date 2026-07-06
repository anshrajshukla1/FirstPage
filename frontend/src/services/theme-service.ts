import { get } from "@/api/client";
import type { Theme } from "@/types";

export async function getThemes(): Promise<Theme[]> {
  return get<Theme[]>("/themes");
}

export async function getTheme(id: string): Promise<Theme> {
  return get<Theme>(`/themes/${id}`);
}
