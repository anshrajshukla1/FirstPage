import { Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";

export function RootLayout() {
  // Initialize theme and auth listeners at the root
  useTheme();
  useAuth();

  return (
    <HelmetProvider>
      <Outlet />
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "!bg-surface !text-text-primary !border !border-border !shadow-lg !rounded-xl !text-sm",
          duration: 4000,
        }}
      />
    </HelmetProvider>
  );
}
