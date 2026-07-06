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
  PartyPopper,
  Baby,
  Gift,
  MessageHeart,
  ArrowLeft,
  ArrowRight,
  Wand2,
  Lock,
  EyeOff,
  Music,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { useCreateMicrosite } from "@/hooks/use-microsites";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { Category, CreateMicrositeRequest } from "@/types";

// ── Category data ──────────────────────────────────────────────────────

const categories: {
  value: Category;
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  glow: string;
}[] = [
  { value: "CRUSH" as Category, label: "Love", description: "Express your feelings", icon: Heart, gradient: "from-rose-500 to-pink-500", glow: "shadow-rose-500/20" },
  { value: "FRIENDSHIP" as Category, label: "Friendship", description: "Celebrate your bond", icon: Users, gradient: "from-sky-500 to-cyan-500", glow: "shadow-sky-500/20" },
  { value: "BIRTHDAY" as Category, label: "Birthday", description: "Make it unforgettable", icon: Cake, gradient: "from-amber-500 to-orange-500", glow: "shadow-amber-500/20" },
  { value: "ANNIVERSARY" as Category, label: "Anniversary", description: "Relive the memories", icon: CalendarHeart, gradient: "from-pink-500 to-fuchsia-500", glow: "shadow-pink-500/20" },
  { value: "GRADUATION" as Category, label: "Graduation", description: "Celebrate achievement", icon: GraduationCap, gradient: "from-indigo-500 to-violet-500", glow: "shadow-indigo-500/20" },
  { value: "APOLOGY" as Category, label: "Apology", description: "Make things right", icon: HandHeart, gradient: "from-slate-500 to-zinc-500", glow: "shadow-slate-500/20" },
  { value: "THANK_YOU" as Category, label: "Thank You", description: "Show gratitude", icon: Sparkles, gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/20" },
  { value: "CONGRATULATIONS" as Category, label: "Congrats", description: "Celebrate their win", icon: PartyPopper, gradient: "from-yellow-500 to-lime-500", glow: "shadow-yellow-500/20" },
  { value: "BABY_WELCOME" as Category, label: "Baby Welcome", description: "New arrival joy", icon: Baby, gradient: "from-blue-400 to-sky-400", glow: "shadow-blue-400/20" },
  { value: "FAREWELL" as Category, label: "Farewell", description: "A heartfelt goodbye", icon: MessageHeart, gradient: "from-purple-500 to-violet-500", glow: "shadow-purple-500/20" },
  { value: "PROPOSAL" as Category, label: "Proposal", description: "Pop the question", icon: Gift, gradient: "from-red-500 to-rose-500", glow: "shadow-red-500/20" },
  { value: "CUSTOM" as Category, label: "Custom", description: "Your unique occasion", icon: Wand2, gradient: "from-gray-500 to-slate-500", glow: "shadow-gray-500/20" },
];

// ── Steps ──────────────────────────────────────────────────────────────

type Step = "category" | "details" | "options";

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

  const handleCreate = async () => {
    if (!selectedCategory || !title.trim()) return;

    const data: CreateMicrositeRequest = {
      title: title.trim(),
      recipientName: recipientName.trim(),
      category: selectedCategory,
      isAnonymous,
      isOneTimeView,
      musicUrl: musicUrl.trim() || undefined,
    };

    try {
      const result = await createMutation.mutateAsync(data);
      navigate(`${ROUTES.DASHBOARD}/edit/${result.id}`);
    } catch (err) {
      console.error("Failed to create microsite:", err);
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
          {(["category", "details", "options"] as Step[]).map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-300",
                  step === s || (["category", "details", "options"].indexOf(step) > i)
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
                  onClick={() => setStep("options")}
                  disabled={!title.trim()}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover disabled:opacity-50 disabled:shadow-none"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Options ───────────────────────────────────── */}
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

                {/* Music URL */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface/50 p-4">
                  <div className="flex items-center gap-3">
                    <Music className="h-5 w-5 text-text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Background Music</p>
                      <p className="text-xs text-text-muted">YouTube or audio URL</p>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={musicUrl}
                    onChange={(e) => setMusicUrl(e.target.value)}
                    placeholder="Paste URL"
                    className="w-32 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text-primary outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setStep("details")}
                  className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating...
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
