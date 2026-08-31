import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Users,
  Cake,
  CalendarHeart,
  GraduationCap,
  Sparkles,
  HandHeart,
  HeartHandshake,
  House,
  PartyPopper,
  Baby,
  Gem,
  Plane,
  ArrowLeft,
  ArrowRight,
  Wand2,
  Lock,
  EyeOff,
  Music,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/page-header";
import { useCreateMicrosite } from "@/hooks/use-microsites";
import { createSlide } from "@/services/slide-service";
import { ROUTES } from "@/constants/routes";
import { CATEGORY_META } from "@/constants/categories";
import { templateFor, templateOutline } from "@/design/templates";
import { cn } from "@/lib/utils";
import { describeMusicProvider, parseMusicUrl } from "@/lib/media-url";
import { Category, MusicProvider, type CreateMicrositeRequest } from "@/types";
import type { ApiError } from "@/api/client";

// ── Category data ──────────────────────────────────────────────────────
// Labels and descriptions come from CATEGORY_META (the single source of truth
// shared with the badges); only the picker-specific artwork lives here. Keys
// cover all 13 backend `Category` values, so the object is exhaustive by type.

const CATEGORY_ART: Record<Category, { icon: React.ElementType; gradient: string; glow: string }> = {
  [Category.CRUSH]: { icon: Heart, gradient: "from-rose-500 to-pink-500", glow: "shadow-rose-500/20" },
  [Category.FRIENDSHIP]: { icon: Users, gradient: "from-sky-500 to-cyan-500", glow: "shadow-sky-500/20" },
  [Category.APOLOGY]: { icon: HeartHandshake, gradient: "from-violet-500 to-purple-500", glow: "shadow-violet-500/20" },
  [Category.BIRTHDAY]: { icon: Cake, gradient: "from-amber-500 to-orange-500", glow: "shadow-amber-500/20" },
  [Category.ANNIVERSARY]: { icon: CalendarHeart, gradient: "from-pink-500 to-fuchsia-500", glow: "shadow-pink-500/20" },
  [Category.FAREWELL]: { icon: Plane, gradient: "from-cyan-500 to-teal-500", glow: "shadow-cyan-500/20" },
  [Category.PROPOSAL]: { icon: Gem, gradient: "from-fuchsia-500 to-rose-500", glow: "shadow-fuchsia-500/20" },
  [Category.THANK_YOU]: { icon: HandHeart, gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/20" },
  [Category.CONGRATULATIONS]: { icon: PartyPopper, gradient: "from-yellow-500 to-lime-500", glow: "shadow-yellow-500/20" },
  [Category.FAMILY]: { icon: House, gradient: "from-orange-500 to-amber-500", glow: "shadow-orange-500/20" },
  [Category.GRADUATION]: { icon: GraduationCap, gradient: "from-indigo-500 to-violet-500", glow: "shadow-indigo-500/20" },
  [Category.BABY_WELCOME]: { icon: Baby, gradient: "from-blue-400 to-sky-400", glow: "shadow-blue-400/20" },
  [Category.CUSTOM]: { icon: Wand2, gradient: "from-slate-500 to-zinc-500", glow: "shadow-slate-500/20" },
};

const categories = (Object.keys(CATEGORY_ART) as Category[]).map((value) => ({
  value,
  label: CATEGORY_META[value].label,
  description: CATEGORY_META[value].description,
  ...CATEGORY_ART[value],
}));

// ── Steps ──────────────────────────────────────────────────────────────

type Step = "category" | "details" | "start" | "options";

const STEP_ORDER: Step[] = ["category", "details", "start", "options"];

export function CreateMicrositePage() {
  const navigate = useNavigate();
  const createMutation = useCreateMicrosite();

  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [password, setPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isOneTimeView, setIsOneTimeView] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");
  /** Starting from the occasion's page beats starting from a blank one. */
  const [startFrom, setStartFrom] = useState<"template" | "blank">("template");
  /*
   * The starter slides are POSTed after the create mutation has already
   * resolved, so `isPending` is false while they are still going out. Without
   * this the button unlocks halfway through and a second press creates a
   * duplicate page.
   */
  const [seeding, setSeeding] = useState(false);

  // Parsed with the same rules the server uses, so what the form promises is
  // what the page will actually play.
  const musicProvider = parseMusicUrl(musicUrl).provider;
  const musicSource = musicProvider !== MusicProvider.NONE;

  const busy = createMutation.isPending || seeding;

  const outline = selectedCategory
    ? templateOutline(selectedCategory, recipientName)
    : [];

  const handleCreate = async () => {
    if (!selectedCategory || !title.trim()) return;

    const data: CreateMicrositeRequest = {
      title: title.trim(),
      recipientName: recipientName.trim(),
      category: selectedCategory,
      password: password.trim() || undefined,
      isAnonymous,
      isOneTimeView,
      musicUrl: musicUrl.trim() || undefined,
    };

    try {
      const result = await createMutation.mutateAsync(data);

      if (startFrom === "template") {
        setSeeding(true);
        /*
         * Sequentially, because `orderIndex` is assigned server-side from the
         * current slide count — four parallel POSTs would race for the same
         * index and land the page in an arbitrary order.
         */
        for (const seed of templateFor(selectedCategory, recipientName)) {
          await createSlide(result.id, {
            type: seed.type,
            title: seed.title,
            content: seed.content,
            config: seed.config,
          });
        }
      }

      navigate(ROUTES.EDIT(result.id));
    } catch (err) {
      setSeeding(false);
      toast.error(
        (err as ApiError)?.message ?? "Could not create your page. Try again.",
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Create — FirstPage</title>
      </Helmet>

      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
        <PageHeader
          title="Create a FirstPage"
          subtitle="Choose a category, add details, and start creating magic."
          backTo={ROUTES.DASHBOARD}
        />

        {/* Progress bar */}
        <div className="mb-8 flex items-center gap-2">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-300",
                  step === s || STEP_ORDER.indexOf(step) > i
                    ? "bg-primary"
                    : "bg-border"
                )}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Category ──────────────────────────────────── */}
          {step === "category" && (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-1 text-xl font-semibold text-text-primary">
                What's the occasion?
              </h2>
              <p className="mb-6 text-sm text-text-secondary">
                Pick a category to get started with the right templates and AI prompts.
              </p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <motion.button
                      key={cat.value}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCategory(cat.value);
                        // Auto-advance after a brief delay
                        setTimeout(() => setStep("details"), 300);
                      }}
                      className={cn(
                        "group relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "border-border bg-surface/50 hover:border-primary/30 hover:shadow-md",
                        isSelected && cat.glow
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                          cat.gradient
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{cat.label}</p>
                        <p className="text-xs text-text-secondary">{cat.description}</p>
                      </div>
                      {isSelected && (
                        <motion.div
                          layoutId="selected-check"
                          className="absolute right-3 top-3 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Details ───────────────────────────────────── */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg"
            >
              <h2 className="mb-1 text-xl font-semibold text-text-primary">
                Tell us more
              </h2>
              <p className="mb-6 text-sm text-text-secondary">
                Give your page a name and tell us who it's for.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Page Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Happy Birthday Sarah! 🎂"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Recipient's Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g., Sarah"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-1 text-xs text-text-muted">
                    This name will appear in the page content. Leave blank if anonymous.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setStep("category")}
                  className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={() => setStep("start")}
                  disabled={!title.trim()}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover disabled:opacity-50 disabled:shadow-none"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Start from ────────────────────────────────── */}
          {step === "start" && selectedCategory && (
            <motion.div
              key="start"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg"
            >
              <h2 className="mb-1 text-xl font-semibold text-text-primary">
                Start from
              </h2>
              <p className="mb-6 text-sm text-text-secondary">
                A written page is easier to edit than an empty one. Either way,
                everything stays editable.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setStartFrom("template")}
                  aria-pressed={startFrom === "template"}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-colors",
                    startFrom === "template"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-surface/50 hover:bg-surface",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Wand2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        The {CATEGORY_META[selectedCategory].label.toLowerCase()}{" "}
                        page
                      </p>
                      <p className="text-xs text-text-muted">
                        {outline.length} slides, already written
                      </p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5 pl-8">
                    {outline.map((line, i) => (
                      <li
                        key={line}
                        className="flex items-baseline gap-2 text-xs text-text-secondary"
                      >
                        <span className="text-[10px] text-text-muted">
                          {i + 1}
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </button>

                <button
                  onClick={() => setStartFrom("blank")}
                  aria-pressed={startFrom === "blank"}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                    startFrom === "blank"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-surface/50 hover:bg-surface",
                  )}
                >
                  <FileText className="h-5 w-5 text-text-secondary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      A blank page
                    </p>
                    <p className="text-xs text-text-muted">
                      Add every slide yourself
                    </p>
                  </div>
                </button>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setStep("details")}
                  className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={() => setStep("options")}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Options ───────────────────────────────────── */}
          {step === "options" && (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg"
            >
              <h2 className="mb-1 text-xl font-semibold text-text-primary">
                Final touches
              </h2>
              <p className="mb-6 text-sm text-text-secondary">
                Optional settings — you can change these later.
              </p>

              <div className="space-y-4">
                {/* Password */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface/50 p-4">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Password Protect</p>
                      <p className="text-xs text-text-muted">Require a password to view</p>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Optional"
                    className="w-32 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text-primary outline-none focus:border-primary"
                  />
                </div>

                {/* Anonymous */}
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors",
                    isAnonymous ? "border-primary bg-primary/5" : "border-border bg-surface/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <EyeOff className="h-5 w-5 text-text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Stay Anonymous</p>
                      <p className="text-xs text-text-muted">Hide your identity from the recipient</p>
                    </div>
                  </div>
                  <div className={cn(
                    "h-5 w-9 rounded-full transition-colors",
                    isAnonymous ? "bg-primary" : "bg-border"
                  )}>
                    <div className={cn(
                      "h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                      isAnonymous ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                </button>

                {/* One-time view */}
                <button
                  onClick={() => setIsOneTimeView(!isOneTimeView)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors",
                    isOneTimeView ? "border-primary bg-primary/5" : "border-border bg-surface/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">One-Time View</p>
                      <p className="text-xs text-text-muted">Page disappears after first view</p>
                    </div>
                  </div>
                  <div className={cn(
                    "h-5 w-9 rounded-full transition-colors",
                    isOneTimeView ? "bg-primary" : "bg-border"
                  )}>
                    <div className={cn(
                      "h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                      isOneTimeView ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                </button>

                {/*
                 * Music. A URL needs room to be read back, so this field is full
                 * width rather than the 128px box it used to share with a label —
                 * and the detected provider is echoed underneath, because a link
                 * that silently resolves to nothing is how the old page ended up
                 * playing no music at all.
                 */}
                <div className="rounded-xl border border-border bg-surface/50 p-4">
                  <div className="flex items-center gap-3">
                    <Music className="h-5 w-5 text-text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Background music
                      </p>
                      <p className="text-xs text-text-muted">
                        Starts when they open the page
                      </p>
                    </div>
                  </div>
                  <input
                    type="url"
                    inputMode="url"
                    value={musicUrl}
                    onChange={(e) => setMusicUrl(e.target.value)}
                    placeholder="https://youtu.be/…"
                    aria-label="YouTube or audio URL"
                    aria-invalid={musicUrl.trim().length > 0 && !musicSource}
                    className={cn(
                      "mt-3 w-full rounded-lg border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:ring-2",
                      musicUrl.trim().length > 0 && !musicSource
                        ? "border-error focus:ring-error/20"
                        : "border-border focus:border-primary focus:ring-primary/20",
                    )}
                  />
                  <p
                    className={cn(
                      "mt-2 text-xs",
                      musicUrl.trim().length > 0 && !musicSource
                        ? "text-error"
                        : "text-text-muted",
                    )}
                  >
                    {musicUrl.trim().length > 0 && !musicSource
                      ? "That link can't be played. Use a YouTube link or a direct .mp3 / .m4a / .ogg URL."
                      : describeMusicProvider(musicProvider)}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setStep("start")}
                  className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover disabled:opacity-50"
                >
                  {busy ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {startFrom === "template" ? "Writing your page…" : "Creating…"}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Create FirstPage
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
