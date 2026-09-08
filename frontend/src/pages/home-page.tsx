import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Heart,
  Users,
  Cake,
  CalendarHeart,
  Sparkles,
  Palette,
  Share2,
  Wand2,
  ArrowRight,
  Play,
  Star,
  GraduationCap,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { useAppSelector } from "@/store/store";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useRef } from "react";

// ── Animated background blobs ──────────────────────────────────────────

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/15 blur-[140px]"
        animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-secondary/15 blur-[140px]"
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-1/2 h-[400px] w-[400px] rounded-full bg-accent/8 blur-[120px]"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ── Floating hearts ────────────────────────────────────────────────────

function FloatingElements() {
  const items = [
    { icon: "❤️", x: "10%", y: "20%", delay: 0, duration: 5 },
    { icon: "✨", x: "85%", y: "15%", delay: 1, duration: 6 },
    { icon: "💜", x: "75%", y: "70%", delay: 2, duration: 4.5 },
    { icon: "🌟", x: "20%", y: "75%", delay: 0.5, duration: 5.5 },
    { icon: "💝", x: "50%", y: "10%", delay: 1.5, duration: 7 },
    { icon: "✨", x: "90%", y: "50%", delay: 3, duration: 6.5 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block">
      {items.map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-xl opacity-40"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -25, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          {item.icon}
        </motion.span>
      ))}
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────

function Navbar() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-transparent bg-background/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          
          <Link
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30"
          >
            {isAuthenticated ? "Dashboard" : "Get Started"}
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ── Use case cards ─────────────────────────────────────────────────────

const useCases = [
  {
    icon: Heart,
    title: "Love",
    description: "Tell your special person how much they mean to you",
    color: "from-rose-500 to-pink-500",
    bgGlow: "bg-rose-500/10",
  },
  {
    icon: Users,
    title: "Friendship",
    description: "Celebrate the friends who make life beautiful",
    color: "from-sky-500 to-cyan-500",
    bgGlow: "bg-sky-500/10",
  },
  {
    icon: Cake,
    title: "Birthday",
    description: "Create an unforgettable birthday surprise",
    color: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/10",
  },
  {
    icon: CalendarHeart,
    title: "Anniversary",
    description: "Relive your favorite memories together",
    color: "from-pink-500 to-fuchsia-500",
    bgGlow: "bg-pink-500/10",
  },
  {
    icon: GraduationCap,
    title: "Graduation",
    description: "Celebrate their incredible achievement",
    color: "from-indigo-500 to-violet-500",
    bgGlow: "bg-indigo-500/10",
  },
  {
    icon: Sparkles,
    title: "Any Occasion",
    description: "From thank-you's to apologies — make it personal",
    color: "from-emerald-500 to-teal-500",
    bgGlow: "bg-emerald-500/10",
  },
];

// ── How it works ───────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    icon: Wand2,
    title: "Tell us about them",
    description:
      "Choose a category, write your message, or let AI craft the perfect words for you.",
  },
  {
    number: "02",
    icon: Palette,
    title: "Make it beautiful",
    description:
      "Pick a stunning theme, add photos, videos, and music. Customize every detail.",
  },
  {
    number: "03",
    icon: Share2,
    title: "Share the magic",
    description:
      "Get a unique link to share. Watch them experience your creation in real time.",
  },
];

// ── Page Component ─────────────────────────────────────────────────────

export function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  // Signed-in visitors shouldn't be bounced through /login just to be
  // redirected back out again.
  const ctaTarget = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN;

  return (
    <>
      <Helmet>
        <title>FirstPage — Create Beautiful Personal Microsites</title>
        <meta
          name="description"
          content="Create beautiful, interactive personal websites for the people who matter most. Express love, celebrate friendship, and make every occasion unforgettable."
        />
      </Helmet>

      <div ref={containerRef} className="min-h-screen bg-background">
        <Navbar />

        {/* ── Hero Section ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-16">
          <HeroBackground />
          <FloatingElements />

          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-20 text-center md:px-8 md:pt-28 lg:pt-32"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Personal Pages
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl font-display text-4xl font-extrabold leading-tight tracking-tight text-text-primary md:text-6xl lg:text-7xl"
            >
              Create beautiful,{" "}
              <span className="text-gradient">interactive</span> personal
              websites for the people who{" "}
              <span className="relative inline-block">
                matter most
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  <motion.path
                    d="M2 8 Q50 2 100 8 Q150 14 198 6"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6 max-w-2xl text-base text-text-secondary md:text-lg lg:text-xl"
            >
              From love letters to birthday surprises — craft stunning
              microsites with AI, beautiful themes, and interactive elements.
              Share a link, create a memory.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link
                to={ctaTarget}
                className="group flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-2xl hover:shadow-primary/30"
              >
                {isAuthenticated ? "Go to your dashboard" : "Get Started — It's Free"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {/* Native anchor scroll — no JS needed, and it deep-links. */}
              <a
                href="#how-it-works"
                className="flex items-center gap-2 rounded-2xl border border-border px-6 py-3.5 text-base font-medium text-text-secondary transition-all hover:bg-surface hover:text-text-primary"
              >
                <Play className="h-4 w-4" />
                See how it works
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[
                  "bg-rose-400",
                  "bg-sky-400",
                  "bg-amber-400",
                  "bg-emerald-400",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-background",
                      bg,
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-xs text-text-muted">
                  Loved by <span className="font-semibold text-text-secondary">2,000+</span> creators
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Use Cases Section ─────────────────────────────────────── */}
        <section className="relative py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-14 text-center"
            >
              <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">
                For every <span className="text-gradient">occasion</span>
              </h2>
              <p className="mt-4 text-base text-text-secondary md:text-lg">
                Beautiful templates for life&apos;s most meaningful moments
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {useCases.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-6 transition-shadow hover:shadow-xl"
                  >
                    <div
                      className={cn(
                        "absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-[60px] transition-opacity group-hover:opacity-100",
                        item.bgGlow,
                      )}
                    />
                    <div
                      className={cn(
                        "relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                        item.color,
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="relative font-display text-lg font-semibold text-text-primary">
                      {item.title}
                    </h3>
                    <p className="relative mt-1.5 text-sm text-text-secondary">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="relative overflow-hidden bg-surface/50 py-20 md:py-28 scroll-mt-16"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-14 text-center"
            >
              <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">
                Three steps to{" "}
                <span className="text-gradient">something amazing</span>
              </h2>
              <p className="mt-4 text-base text-text-secondary md:text-lg">
                Create your first page in under 5 minutes
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="relative flex flex-col items-center text-center"
                  >
                    {/* Connector line */}
                    {i < steps.length - 1 && (
                      <div className="absolute left-[calc(50%+40px)] top-8 hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-primary/30 to-transparent md:block" />
                    )}

                    <div className="relative mb-5">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white shadow-lg shadow-primary/25">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-semibold text-text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm text-text-secondary">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA Section ───────────────────────────────────────────── */}
        <section className="relative py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto max-w-3xl px-4 text-center md:px-8"
          >
            <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">
              Ready to create something{" "}
              <span className="text-gradient">unforgettable</span>?
            </h2>
            <p className="mt-4 text-base text-text-secondary md:text-lg">
              Join thousands of creators making the people they love smile.
            </p>
            <Link
              to={ctaTarget}
              className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-2xl hover:shadow-primary/30"
            >
              {isAuthenticated ? "Open your dashboard" : "Start Creating"}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <footer className="border-t border-border bg-surface/30 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
            <Logo size="sm" />
            <p className="text-sm text-text-muted">
              &copy; {new Date().getFullYear()} FirstPage. Made with ❤️
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
