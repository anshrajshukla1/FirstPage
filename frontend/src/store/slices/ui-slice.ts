import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Notification } from "@/types";

// ── State ──────────────────────────────────────────────────────────────

export type ThemeMode = "light" | "dark";

export interface UiState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("fp-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const initialState: UiState = {
  theme: getInitialTheme(),
  sidebarOpen: false,
  notifications: [],
  unreadCount: 0,
};

// ── Slice ──────────────────────────────────────────────────────────────

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("fp-theme", state.theme);
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
      localStorage.setItem("fp-theme", state.theme);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead(state) {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setNotifications,
  addNotification,
  markNotificationRead,
  markAllRead,
} = uiSlice.actions;

export default uiSlice.reducer;
