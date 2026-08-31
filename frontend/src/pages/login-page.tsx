import { Helmet } from "react-helmet-async";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useAuth } from "@/hooks/use-auth";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginPage() {
  const { signInWithGoogle, isLoading, error } = useAuth();

  return (
    <>
      <Helmet>
        <title>Sign In — FirstPage</title>
      </Helmet>

      <div className="space-y-6 text-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Sign in to create and manage your personal pages
          </p>
        </div>

        {/* Sign-in failures used to be console-only, so the button just looked inert. */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-error/30 bg-error/5 px-3 py-2.5 text-left text-sm text-error"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={signInWithGoogle}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-surface-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <GoogleIcon className="h-5 w-5" />
              Sign in with Google
            </>
          )}
        </button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 pt-2"
        >
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">Why sign in?</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <ul className="space-y-2 text-left text-sm text-text-secondary">
            {[
              "Create unlimited personal microsites",
              "Use AI to generate beautiful content",
              "Track views, reactions & analytics",
              "Share with a unique personal link",
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-2"
              >
                <span className="mt-0.5 text-success">✓</span>
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <p className="text-xs text-text-muted">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </>
  );
}
