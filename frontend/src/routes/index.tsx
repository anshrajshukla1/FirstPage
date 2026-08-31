import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/root-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { HomePage } from "@/pages/home-page";
import { LoginPage } from "@/pages/login-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { CreateMicrositePage } from "@/pages/create-microsite-page";
import { EditorPage } from "@/pages/editor-page";
import { PublicViewerPage } from "@/pages/public-viewer-page";
import { AnalyticsPage } from "@/pages/analytics-page";
import { NotFoundPage } from "@/pages/not-found-page";

// Placeholder for upcoming pages
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
        🚧
      </div>
      <h2 className="font-display text-xl font-bold text-text-primary">
        {title}
      </h2>
      <p className="mt-2 text-sm text-text-secondary">
        This page is coming soon. Stay tuned!
      </p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public routes
      {
        path: "/",
        element: <HomePage />,
      },

      // Auth routes
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
        ],
      },

      // Dashboard routes (protected)
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/dashboard/create",
            element: <CreateMicrositePage />,
          },
          {
            path: "/dashboard/microsites/:id",
            element: <EditorPage />,
          },
          {
            path: "/dashboard/analytics",
            element: <AnalyticsPage />,
          },
          {
            path: "/dashboard/analytics/:id",
            element: <AnalyticsPage />,
          },
          {
            path: "/dashboard/settings",
            element: <ComingSoon title="Settings" />,
          },
        ],
      },

      // Public microsite viewer (no auth required)
      {
        path: "/p/:slug",
        element: <PublicViewerPage />,
      },

      // 404
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
