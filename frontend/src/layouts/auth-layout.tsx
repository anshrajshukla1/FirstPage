import { Outlet, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { useAppSelector } from "@/store/store";
import { ROUTES } from "@/constants/routes";

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Redirect authenticated users to dashboard
  if (!isLoading && isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]"
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[120px]"
          animate={{
            x: [0, -60, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Theme toggle */}
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        <div className="glass rounded-2xl p-8 shadow-xl">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}
