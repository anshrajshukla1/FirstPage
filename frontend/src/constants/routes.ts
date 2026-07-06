export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  CREATE: "/dashboard/create",
  EDIT: (id: string) => `/dashboard/microsites/${id}`,
  ANALYTICS: (id: string) => `/dashboard/analytics/${id}`,
  SETTINGS: "/dashboard/settings",
  PUBLIC_VIEWER: (slug: string) => `/${slug}`,
} as const;

export const NAV_ITEMS = [
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { label: "Create", path: ROUTES.CREATE, icon: "Plus" },
  { label: "Settings", path: ROUTES.SETTINGS, icon: "Settings" },
] as const;
