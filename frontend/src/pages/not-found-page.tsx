import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import { Home, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — FirstPage</title>
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Animated 404 illustration */}
          <motion.div
            className="relative mx-auto mb-8 flex h-48 w-48 items-center justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative">
              <span className="font-display text-8xl font-extrabold text-gradient">
                404
              </span>
            </div>
          </motion.div>

          <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
            Page not found
          </h1>
          <p className="mt-3 max-w-md text-text-secondary">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to={ROUTES.HOME}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-surface hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
