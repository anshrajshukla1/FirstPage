import { useState } from "react";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  LayoutDashboard,
  Plus,
  Settings,
  Search,
  Menu,
  X,
  LogOut,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { NotificationBell } from "@/components/common/notification-bell";
import { ProtectedRoute } from "@/components/common/protected-route";
import { useAppSelector, useAppDispatch } from "@/store/store";
import { toggleSidebar, setSidebarOpen } from "@/store/slices/ui-slice";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

// ── Navigation items ───────────────────────────────────────────────────

const navItems = [
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Create", path: ROUTES.CREATE, icon: Plus },
  { label: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", path: ROUTES.SETTINGS, icon: Settings },
];

// ── Sidebar ────────────────────────────────────────────────────────────

function Sidebar() {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showSignoutModal, setShowSignoutModal] = useState(false);

  const isExpanded = isMobile ? sidebarOpen : true;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isExpanded || !isMobile) && (
          <motion.aside
            initial={isMobile ? { x: -280 } : false}
            animate={{ x: 0 }}
            exit={isMobile ? { x: -280 } : undefined}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-border bg-background",
              "lg:sticky lg:z-auto",
            )}
          >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-5">
              <Logo size="sm" />
              {isMobile && (
                <button
                  onClick={() => dispatch(setSidebarOpen(false))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === ROUTES.DASHBOARD
                    ? location.pathname === ROUTES.DASHBOARD
                    : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => isMobile && dispatch(setSidebarOpen(false))}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-primary" : "text-text-muted group-hover:text-text-primary",
                      )}
                    />
                    {item.label}
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4 text-primary/50" />
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* User section */}
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.displayName}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {user?.displayName?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                )}
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {user?.displayName ?? "User"}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {user?.email ?? ""}
                  </p>
                </div>
                <button
                  onClick={() => setShowSignoutModal(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={showSignoutModal}
        title="Sign out?"
        description="Are you sure you want to sign out of FirstPage?"
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setShowSignoutModal(false);
          logout();
        }}
        onCancel={() => setShowSignoutModal(false)}
      />
    </>
  );
}

// ── Top Bar ────────────────────────────────────────────────────────────

function TopBar() {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // The query lives in the URL so the dashboard can read it and the result
  // stays shareable/back-button-able. There is no server-side search
  // endpoint, so the dashboard filters the page it already has.
  const query = searchParams.get("q") ?? "";

  const onSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("q", value);
    else params.delete("q");

    const search = params.toString();
    const target = `${ROUTES.DASHBOARD}${search ? `?${search}` : ""}`;
    // Searching from a sub-page (editor, analytics) jumps back to the list,
    // which is the only place results are rendered.
    navigate(target, { replace: location.pathname === ROUTES.DASHBOARD });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      {isMobile && (
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      {/* Search */}
      <div className="hidden flex-1 md:block">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search microsites..."
            aria-label="Search microsites"
            className="h-9 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        
      </div>
    </header>
  );
}

// ── Mobile Bottom Nav ──────────────────────────────────────────────────

function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-background/90 backdrop-blur-md md:hidden">
      {navItems.slice(0, 4).map((item) => {
        const Icon = item.icon;
        const isActive =
          item.path === ROUTES.DASHBOARD
            ? location.pathname === ROUTES.DASHBOARD
            : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-0.5"
          >
            <Icon
              className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-primary" : "text-text-muted",
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium",
                isActive ? "text-primary" : "text-text-muted",
              )}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}

// ── Dashboard Layout ───────────────────────────────────────────────────

export function DashboardLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 py-6 pb-20 md:px-6 md:pb-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        {isMobile && <MobileBottomNav />}
      </div>
    </ProtectedRoute>
  );
}
