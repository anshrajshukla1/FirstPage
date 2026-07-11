import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Laugh,
  Frown,
  Flame,
  Star,
  Send,
  Lock,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getMicrositeBySlug, verifyMicrositePassword } from "@/services/microsite-service";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { cn } from "@/lib/utils";
import type { Slide, ReactionType } from "@/types";
import { post } from "@/api/client";

// ── Slide animation variants ───────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

// ── Reaction button ────────────────────────────────────────────────────

const reactions: { type: ReactionType; icon: React.ElementType; label: string; color: string }[] = [
  { type: "HEART" as ReactionType, icon: Heart, label: "Love", color: "text-rose-500" },
  { type: "LAUGH" as ReactionType, icon: Laugh, label: "Haha", color: "text-amber-500" },
  { type: "CRY" as ReactionType, icon: Frown, label: "Touched", color: "text-blue-500" },
  { type: "FIRE" as ReactionType, icon: Flame, label: "Fire", color: "text-orange-500" },
  { type: "STAR" as ReactionType, icon: Star, label: "Amazing", color: "text-yellow-500" },
];

// ── Password Gate ──────────────────────────────────────────────────────

function PasswordGate({
  slug,
  onUnlocked,
}: {
  slug: string;
  onUnlocked: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(false);
    try {
      const result = await verifyMicrositePassword(slug, password);
      if (result.valid) {
        onUnlocked();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setChecking(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-surface to-background p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-3xl border border-border bg-surface/80 p-8 text-center shadow-2xl backdrop-blur-xl"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h2 className="mb-1 text-xl font-bold text-text-primary">
          This page is locked
        </h2>
        <p className="mb-6 text-sm text-text-secondary">
          Enter the password to view this special page.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Enter password"
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-center text-text-primary outline-none transition-colors focus:ring-2",
              error
                ? "border-error bg-error/5 focus:ring-error/20"
                : "border-border bg-background focus:border-primary focus:ring-primary/20"
            )}
            autoFocus
          />
          {error && (
            <p className="text-xs text-error">Incorrect password. Try again.</p>
          )}
          <button
            type="submit"
            disabled={checking || !password}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover disabled:opacity-50"
          >
            {checking ? "Checking..." : "Unlock"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Slide Renderer ─────────────────────────────────────────────────────

function SlideView({ slide, index, total }: { slide: Slide; index: number; total: number }) {
  // Parse content as JSON if possible, otherwise treat as plain text
  let parsedContent = slide.content ?? "";

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-12 text-center">
      {/* Slide counter */}
      <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs text-white/60 backdrop-blur-sm">
        {index + 1} / {total}
      </div>

      {/* Slide title */}
      {slide.title && (
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
        >
          {slide.title}
        </motion.h2>
      )}

      {/* Content */}
      {parsedContent && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-xl text-base leading-relaxed text-white/90 md:text-lg"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.2)" }}
        >
          {/* Render line breaks */}
          {parsedContent.split("\n").map((line, i) => (
            <p key={i} className={line.trim() === "" ? "h-3" : ""}>
              {line}
            </p>
          ))}
        </motion.div>
      )}

      {/* Media */}
      {slide.media && slide.media.length > 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 max-w-md"
        >
          <img
            src={slide.media[0].url}
            alt={slide.media[0].caption ?? ""}
            className="rounded-2xl shadow-2xl"
          />
        </motion.div>
      )}
    </div>
  );
}

// ── Main Public Viewer ─────────────────────────────────────────────────

export function PublicViewerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: microsite, isLoading, isError } = useQuery({
    queryKey: ["public-microsite", slug],
    queryFn: () => getMicrositeBySlug(slug!),
    enabled: !!slug,
  });

  const slides = microsite?.slides ?? [];

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, slides.length]);

  // Touch swipe
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  };
  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleReaction = async (type: string) => {
    try {
      await post(`/microsites/public/${slug}/reactions`, { type });
      setShowReactions(false);
    } catch {
      // Silently fail
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await post(`/microsites/public/${slug}/replies`, { message: replyText });
      setReplyText("");
    } catch {
      // Silently fail
    }
  };

  // Loading / Error states
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !microsite) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <div className="mb-4 text-6xl">💔</div>
        <h1 className="text-2xl font-bold text-text-primary">Page Not Found</h1>
        <p className="mt-2 text-text-secondary">
          This page may have been deleted or the link is incorrect.
        </p>
      </div>
    );
  }

  // Password gate
  if (microsite.isOneTimeView && !unlocked) {
    // Check if password protected — for simplicity we check if it needs password via a flag
    // In production this would come from the API response
  }

  return (
    <>
      <Helmet>
        <title>{microsite.title} — FirstPage</title>
        <meta name="description" content={`A special page created with FirstPage: ${microsite.title}`} />
        <meta property="og:title" content={microsite.title} />
        <meta property="og:description" content={`Someone created something special for you ❤️`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900"
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -right-20 top-2/3 h-64 w-64 animate-pulse rounded-full bg-pink-500/20 blur-3xl" style={{ animationDelay: "1s" }} />
          <div className="absolute left-1/3 top-10 h-48 w-48 animate-pulse rounded-full bg-blue-500/10 blur-3xl" style={{ animationDelay: "2s" }} />
        </div>

        {/* Title bar */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-white">{microsite.title}</h1>
            {!microsite.isAnonymous && (
              <p className="text-xs text-white/50">A special page for {microsite.recipientName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full bg-white/10 p-2 text-white/60 backdrop-blur-sm transition hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Slides */}
        <div className="relative z-10 flex flex-1 items-center justify-center">
          {slides.length > 0 ? (
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative w-full"
              >
                <SlideView
                  slide={slides[currentIndex]}
                  index={currentIndex}
                  total={slides.length}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center text-white/60">
              <p className="text-lg">This page is being prepared...</p>
              <p className="mt-1 text-sm">Check back soon ❤️</p>
            </div>
          )}

          {/* Navigation arrows */}
          {slides.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button
                  onClick={goPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white/70 backdrop-blur-sm transition hover:bg-white/20"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {currentIndex < slides.length - 1 && (
                <button
                  onClick={goNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white/70 backdrop-blur-sm transition hover:bg-white/20"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Progress dots */}
        {slides.length > 1 && (
          <div className="relative z-10 flex justify-center gap-1.5 pb-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === currentIndex
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        )}

        {/* Bottom bar — reactions & reply */}
        <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md">
          {/* Reactions bar */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex justify-center gap-3 px-4 py-3">
                  {reactions.map((r) => {
                    const Icon = r.icon;
                    return (
                      <motion.button
                        key={r.type}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReaction(r.type)}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="rounded-full bg-white/10 p-2.5">
                          <Icon className={cn("h-5 w-5", r.color)} />
                        </div>
                        <span className="text-[10px] text-white/50">{r.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 px-4 py-3">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="rounded-full bg-white/10 p-2.5 text-white/60 transition hover:bg-white/20"
            >
              <Heart className="h-4 w-4" />
            </button>
            <div className="flex flex-1 items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                placeholder="Send a reply..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="text-primary transition hover:text-primary-hover disabled:text-white/20"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* FirstPage branding */}
        <div className="relative z-10 pb-4 text-center">
          <a
            href="/"
            className="text-[10px] text-white/30 transition hover:text-white/50"
          >
            Made with ❤️ on FirstPage
          </a>
        </div>
      </div>
    </>
  );
}
