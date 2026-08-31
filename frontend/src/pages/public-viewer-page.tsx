import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Laugh,
  Frown,
  Sparkles,
  Zap,
  Send,
  Lock,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  addReaction,
  answerProposal,
  getPublicMicrosite,
  sendReply,
  trackVisit,
  unlockMicrosite,
} from "@/services/public-viewer-service";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { BackgroundMusic } from "@/components/background-music";
import { EnvelopeSeal } from "@/components/envelope-seal";
import { SLIDE_VIEWS } from "@/components/slide-views";
import { Motif } from "@/design/motifs";
import {
  PACE_SECONDS,
  loadOccasionFont,
  occasionFor,
  occasionStyle,
  type Occasion,
} from "@/design/occasions";
import { cn } from "@/lib/utils";
import { MusicProvider, ReactionType, type Microsite } from "@/types";
import type { ApiError } from "@/api/client";

/**
 * The page a recipient opens.
 *
 * <p>Two things used to be wrong here beyond the styling. Every slide type was
 * rendered as a title and a paragraph, so a countdown never counted and a
 * proposal was a purple text block; slides now dispatch through `SLIDE_VIEWS`.
 * And every occasion — proposal, apology, birthday — was painted on the same
 * indigo gradient; the palette, typeface and motif now come from the occasion
 * resolved off `microsite.category`, applied as scoped custom properties so the
 * signed-in app's own theme is untouched.
 */

// ── Occasion-scoped chrome ─────────────────────────────────────────────
// Surfaces are mixed from the occasion's own foreground rather than white, so a
// control reads the same on cream paper as it does on oxblood.

const CHIP: React.CSSProperties = {
  background: "color-mix(in srgb, var(--oc-fg) 8%, transparent)",
  color: "var(--oc-fg)",
};

const HAIRLINE = "color-mix(in srgb, var(--oc-fg) 14%, transparent)";

const displayFont: React.CSSProperties = {
  fontFamily: "var(--oc-display)",
  fontWeight: "var(--oc-display-weight)" as unknown as number,
  letterSpacing: "var(--oc-display-tracking)",
};

/** Small horizontal offset only — a 300px fly-in reads as a slideshow toy. */
const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 40 : -40, opacity: 0 }),
};

// ── Reactions ──────────────────────────────────────────────────────────
// Must stay in sync with `com.firstpage.entity.enums.ReactionType`.

const reactions: { type: ReactionType; icon: React.ElementType; label: string }[] =
  [
    { type: ReactionType.HEART, icon: Heart, label: "Love" },
    { type: ReactionType.LAUGH, icon: Laugh, label: "Haha" },
    { type: ReactionType.CRY, icon: Frown, label: "Tears" },
    { type: ReactionType.SHOCK, icon: Zap, label: "Wow" },
    { type: ReactionType.TOUCHED, icon: Sparkles, label: "Touched" },
  ];

// ── Password Gate ──────────────────────────────────────────────────────

function PasswordGate({
  slug,
  occasion,
  onUnlocked,
}: {
  slug: string;
  occasion: Occasion;
  onUnlocked: (microsite: Microsite) => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      // On success the backend returns the fully unlocked microsite.
      onUnlocked(await unlockMicrosite(slug, password));
    } catch (err) {
      setError((err as ApiError)?.message ?? "That password doesn't match. Try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
          style={CHIP}
        >
          <Lock className="h-5 w-5" style={{ color: "var(--oc-accent)" }} />
        </div>
        <h1 className="text-2xl" style={displayFont}>
          {occasion.seal.kicker}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--oc-muted)" }}>
          It's password-protected. Ask whoever sent it.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            placeholder="Password"
            aria-label="Password"
            className="w-full rounded-xl border px-4 py-3 text-center outline-none transition-colors focus-visible:ring-2"
            style={{
              ...CHIP,
              borderColor: error ? "var(--oc-accent)" : HAIRLINE,
            }}
            autoFocus
          />
          {error && (
            <p className="text-xs" style={{ color: "var(--oc-accent)" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={checking || !password}
            className="w-full rounded-xl py-3 text-xs uppercase tracking-[0.24em] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40"
            style={{ background: "var(--oc-accent)", color: "var(--oc-bg)" }}
          >
            {checking ? "Checking" : "Open"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Public Viewer ─────────────────────────────────────────────────

export function PublicViewerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [sentReaction, setSentReaction] = useState<ReactionType | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySent, setReplySent] = useState(false);
  /** The seal starts closed; the tap that opens it is what lets music play. */
  const [opened, setOpened] = useState(false);
  const [muted, setMuted] = useState(false);
  /** Set once the password gate is cleared; holds the unlocked payload. */
  const [unlocked, setUnlocked] = useState<Microsite | null>(null);

  const {
    data: fetched,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["public-microsite", slug],
    queryFn: () => getPublicMicrosite(slug!),
    enabled: !!slug,
    retry: false,
  });

  // The unlocked payload supersedes the locked metadata-only response.
  const microsite = unlocked ?? fetched;
  const locked = Boolean(microsite?.isPasswordProtected) && !unlocked;
  const slides = locked ? [] : (microsite?.slides ?? []);
  const occasion = occasionFor(microsite?.category);
  const hasMusic =
    Boolean(microsite?.musicTrackId) &&
    microsite?.musicProvider !== MusicProvider.NONE;

  // One display face, fetched only for the occasion this page actually is.
  useEffect(() => {
    if (microsite) loadOccasionFont(occasion);
  }, [microsite, occasion]);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((i) => (i >= slides.length - 1 ? i : i + 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((i) => (i <= 0 ? i : i - 1));
  }, []);

  // Keyboard navigation. Inert until the page is open, so Space presses the seal
  // instead of skipping the slide behind it.
  useEffect(() => {
    if (locked || !opened) return;
    const handleKey = (e: KeyboardEvent) => {
      // Don't hijack arrows/space while the visitor is typing a reply.
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
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
  }, [goNext, goPrev, locked, opened]);

  // ── Analytics ────────────────────────────────────────────────────────
  // Report the furthest slide reached plus dwell time. `arrivedAt` is a ref so
  // re-renders don't restart the clock.
  const arrivedAt = useRef(Date.now());
  const furthestIndex = useRef(0);
  // The id, not the object: a refetch hands back a new object and would
  // otherwise tear the heartbeat down and report a fresh visit.
  const micrositeId = microsite?.id;

  useEffect(() => {
    furthestIndex.current = Math.max(furthestIndex.current, currentIndex);
  }, [currentIndex]);

  // Time spent staring at a closed seal isn't reading time.
  useEffect(() => {
    if (opened) arrivedAt.current = Date.now();
  }, [opened]);

  useEffect(() => {
    /*
     * Nothing to report until the page exists and has actually been opened. A
     * mistyped link used to fire the heartbeat anyway — four POSTs to /track for
     * a slug that had just 404'd — and the cleanup ran on every dependency
     * change, so a closed seal logged reading time nobody spent.
     */
    if (!slug || locked || !opened || !micrositeId) return;

    const report = () => {
      void trackVisit(slug, {
        currentSlideIndex: furthestIndex.current,
        timeSpentSeconds: Math.round((Date.now() - arrivedAt.current) / 1000),
      });
    };

    // Report periodically so a closed tab still leaves a usable data point,
    // and once more when the page is actually hidden.
    const interval = window.setInterval(report, 15_000);
    const onHidden = () => document.visibilityState === "hidden" && report();
    document.addEventListener("visibilitychange", onHidden);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onHidden);
      report();
    };
  }, [slug, locked, opened, micrositeId]);

  // Touch swipe
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!opened) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const handleReaction = async (type: ReactionType) => {
    if (!slug) return;
    setShowReactions(false);
    try {
      await addReaction(slug, type);
      setSentReaction(type);
      toast.success("Sent — they'll see it.");
    } catch (err) {
      toast.error((err as ApiError)?.message ?? "Could not send that reaction.");
    }
  };

  const handleReply = async () => {
    const message = replyText.trim();
    if (!slug || !message) return;
    try {
      await sendReply(slug, message);
      setReplyText("");
      setReplySent(true);
      toast.success("Reply sent.");
    } catch (err) {
      toast.error((err as ApiError)?.message ?? "Could not send your reply.");
    }
  };

  // ── Loading / Error states ───────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !microsite) {
    // The backend distinguishes "gone forever" from "never existed"; surfacing
    // that keeps a consumed one-time page from looking like a broken link.
    const apiError = error as ApiError | null;
    const consumed = apiError?.message?.includes("one-time");
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-2xl font-semibold text-text-primary">
          {consumed ? "This one has already been opened" : "Nothing here"}
        </h1>
        <p className="mt-2 max-w-sm text-text-secondary">
          {consumed
            ? "It was set to open once, and it has been. Ask whoever sent it to make another."
            : "This link may have been deleted, unpublished, or typed slightly wrong."}
        </p>
      </div>
    );
  }

  const SlideBody = slides.length > 0 ? SLIDE_VIEWS[slides[currentIndex].type] : null;

  return (
    <>
      <Helmet>
        <title>{microsite.title} — FirstPage</title>
        <meta
          name="description"
          content={`${microsite.title} — made for ${microsite.recipientName} on FirstPage.`}
        />
        <meta property="og:title" content={microsite.title} />
        <meta
          property="og:description"
          content={`Someone made this for ${microsite.recipientName}.`}
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={occasionStyle(occasion)}
        className="relative flex min-h-screen flex-col overflow-hidden"
      >
        <Motif occasion={occasion} />

        {hasMusic && (
          <BackgroundMusic
            provider={microsite.musicProvider}
            trackId={microsite.musicTrackId}
            playing={opened}
            muted={muted}
            duckOn={currentIndex}
          />
        )}

        <AnimatePresence mode="wait">
          {locked && slug ? (
            <motion.div
              key="gate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              <PasswordGate
                slug={slug}
                occasion={occasion}
                onUnlocked={setUnlocked}
              />
            </motion.div>
          ) : !opened ? (
            <motion.div
              key="seal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: PACE_SECONDS[occasion.pace] * 0.6 }}
              className="relative z-10 flex flex-1 flex-col"
            >
              <EnvelopeSeal
                occasion={occasion}
                recipientName={microsite.recipientName}
                isAnonymous={microsite.isAnonymous}
                hasMusic={hasMusic}
                onOpen={() => setOpened(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: PACE_SECONDS[occasion.pace] * 0.8 }}
              className="relative z-10 flex min-h-screen flex-1 flex-col"
            >
              {/* Title bar */}
              <div className="flex items-start justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <h1 className="truncate text-base" style={displayFont}>
                    {microsite.title}
                  </h1>
                  {!microsite.isAnonymous && (
                    <p
                      className="mt-0.5 truncate text-[0.7rem] uppercase tracking-[0.2em]"
                      style={{ color: "var(--oc-muted)" }}
                    >
                      For {microsite.recipientName}
                    </p>
                  )}
                </div>
                {hasMusic && (
                  <button
                    onClick={() => setMuted((m) => !m)}
                    aria-label={muted ? "Turn the music on" : "Turn the music off"}
                    className="shrink-0 rounded-full p-2.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2"
                    style={CHIP}
                  >
                    {muted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Slides */}
              <div className="relative flex flex-1 items-stretch justify-center">
                {SlideBody ? (
                  <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                      key={slides[currentIndex].id}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        duration: PACE_SECONDS[occasion.pace] * 0.45,
                        ease: "easeOut",
                      }}
                      className="w-full"
                    >
                      <SlideBody
                        slide={slides[currentIndex]}
                        occasion={occasion}
                        onProposalAnswer={(accepted) => {
                          if (slug) void answerProposal(slug, accepted);
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <p className="text-lg" style={displayFont}>
                      Still being written
                    </p>
                    <p className="text-sm" style={{ color: "var(--oc-muted)" }}>
                      Nothing has been added to this page yet.
                    </p>
                  </div>
                )}

                {/* Navigation arrows */}
                {slides.length > 1 && (
                  <>
                    {currentIndex > 0 && (
                      <button
                        onClick={goPrev}
                        aria-label="Previous"
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-3 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 sm:left-4"
                        style={CHIP}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}
                    {currentIndex < slides.length - 1 && (
                      <button
                        onClick={goNext}
                        aria-label="Next"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-3 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 sm:right-4"
                        style={CHIP}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Progress */}
              {slides.length > 1 && (
                <div
                  className="flex justify-center gap-1.5 pb-4"
                  role="tablist"
                  aria-label="Slides"
                >
                  {slides.map((slide, i) => (
                    <button
                      key={slide.id}
                      role="tab"
                      aria-selected={i === currentIndex}
                      aria-label={`Slide ${i + 1} of ${slides.length}`}
                      onClick={() => {
                        setDirection(i > currentIndex ? 1 : -1);
                        setCurrentIndex(i);
                      }}
                      className={cn(
                        "h-1 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2",
                        i === currentIndex ? "w-7" : "w-1.5",
                      )}
                      style={{
                        background:
                          i === currentIndex
                            ? "var(--oc-accent)"
                            : "color-mix(in srgb, var(--oc-fg) 28%, transparent)",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Reactions & reply */}
              <div
                className="border-t"
                style={{
                  borderColor: HAIRLINE,
                  background: "color-mix(in srgb, var(--oc-bg) 82%, transparent)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex justify-center gap-2 px-4 py-3 sm:gap-4">
                        {reactions.map((r) => {
                          const Icon = r.icon;
                          const chosen = sentReaction === r.type;
                          return (
                            <button
                              key={r.type}
                              onClick={() => handleReaction(r.type)}
                              className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2"
                            >
                              <span
                                className="rounded-full p-2.5"
                                style={
                                  chosen
                                    ? {
                                        background: "var(--oc-accent)",
                                        color: "var(--oc-bg)",
                                      }
                                    : CHIP
                                }
                              >
                                <Icon
                                  className={cn("h-5 w-5", chosen && "fill-current")}
                                />
                              </span>
                              <span
                                className="text-[10px] uppercase tracking-[0.16em]"
                                style={{ color: "var(--oc-muted)" }}
                              >
                                {r.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2 px-4 py-3">
                  <button
                    onClick={() => setShowReactions((s) => !s)}
                    aria-label="React"
                    aria-expanded={showReactions}
                    className="rounded-full p-2.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2"
                    style={
                      sentReaction
                        ? { background: "var(--oc-accent)", color: "var(--oc-bg)" }
                        : CHIP
                    }
                  >
                    <Heart
                      className={cn("h-4 w-4", sentReaction && "fill-current")}
                    />
                  </button>

                  <div
                    className="flex flex-1 items-center gap-2 rounded-full px-4 py-2"
                    style={CHIP}
                  >
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleReply();
                      }}
                      maxLength={1000}
                      aria-label="Write back"
                      placeholder={replySent ? "Sent." : "Write back…"}
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: "var(--oc-fg)" }}
                    />
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      aria-label="Send"
                      className="transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-30"
                      style={{ color: "var(--oc-accent)" }}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pb-4 pt-3 text-center">
                <a
                  href="/"
                  className="text-[10px] uppercase tracking-[0.2em] transition-opacity hover:opacity-100"
                  style={{ color: "var(--oc-muted)", opacity: 0.7 }}
                >
                  Made on FirstPage
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
