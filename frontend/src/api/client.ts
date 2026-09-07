import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse } from "@/types";
import { getVisitorSessionId } from "@/lib/visitor-session";

// ── Typed error ────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  details?: string;
}

// ── Axios instance ─────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ── Token getter (lazy import to avoid circular deps) ──────────────────

let getToken: (() => string | null) | undefined;

export function setTokenGetter(fn: () => string | null) {
  getToken = fn;
}

// ── Request interceptor ────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken?.();
    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Lets the backend count unique visitors and attribute anonymous
      // reactions/replies without a cookie or login.
      config.headers["X-Visitor-Session"] = getVisitorSessionId();
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Response interceptor ───────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const apiError: ApiError = {
      status: error.response?.status ?? 500,
      message:
        (error.response?.data as any)?.detail ??
        error.response?.data?.message ??
        error.message ??
        "An unexpected error occurred",
    };

    // Only force a logout when the *authenticated* session was rejected.
    // A 401 from a public endpoint must not sign the user out.
    const wasAuthenticated = Boolean(error.config?.headers?.Authorization);
    if (apiError.status === 401 && wasAuthenticated) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(apiError);
  },
);

// ── Typed helpers ──────────────────────────────────────────────────────

export async function get<T>(url: string): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url);
  return response.data.data;
}

export async function post<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, data);
  return response.data.data;
}

export async function put<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, data);
  return response.data.data;
}

export async function patch<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await apiClient.patch<ApiResponse<T>>(url, data);
  return response.data.data;
}

export async function del<T>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url);
  return response.data.data;
}

export default apiClient;
