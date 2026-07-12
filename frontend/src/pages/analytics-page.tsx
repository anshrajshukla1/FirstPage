import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  Users,
  Heart,
  MessageCircle,
  Clock,
  Repeat,
  ArrowLeft,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { getMicrositeAnalytics, getDashboardAnalytics } from "@/services/analytics-service";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { PageHeader } from "@/components/common/page-header";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { MicrositeAnalytics } from "@/services/analytics-service";

// ── Stat Card ──────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-border bg-surface/50 p-5"
    >
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", color)}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-text-secondary">{label}</p>
          <p className="font-display text-2xl font-bold text-text-primary">{value}</p>
          {subtitle && (
            <p className="text-[10px] text-text-muted">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Reaction Bar ───────────────────────────────────────────────────────

const reactionEmojis: Record<string, string> = {
  HEART: "❤️",
  LAUGH: "😂",
  CRY: "😢",
  FIRE: "🔥",
  STAR: "⭐",
  CLAP: "👏",
};

function ReactionBar({ reactions }: { reactions: { type: string; count: number }[] }) {
  const total = reactions.reduce((sum, r) => sum + r.count, 0);
  if (total === 0) {
    return (
      <p className="text-sm text-text-muted">No reactions yet</p>
    );
  }

  return (
    <div className="space-y-2">
      {reactions.map((r) => (
        <div key={r.type} className="flex items-center gap-3">
          <span className="text-lg">{reactionEmojis[r.type] ?? "💜"}</span>
          <div className="flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(r.count / total) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full rounded-full bg-primary"
              />
            </div>
          </div>
          <span className="text-xs font-medium text-text-secondary">{r.count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Microsite Analytics Page ───────────────────────────────────────────

function MicrositeAnalyticsView({ data }: { data: MicrositeAnalytics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Eye className="h-5 w-5 text-sky-500" />}
          label="Total Views"
          value={data.totalViews}
          color="bg-sky-500/10"
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-indigo-500" />}
          label="Unique Visitors"
          value={data.uniqueVisitors}
          color="bg-indigo-500/10"
        />
        <StatCard
          icon={<Heart className="h-5 w-5 text-rose-500" />}
          label="Reactions"
          value={data.totalReactions}
          color="bg-rose-500/10"
        />
        <StatCard
          icon={<MessageCircle className="h-5 w-5 text-emerald-500" />}
          label="Replies"
          value={data.totalReplies}
          subtitle={data.unreadReplies > 0 ? `${data.unreadReplies} unread` : undefined}
          color="bg-emerald-500/10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Time & Replays */}
        <div className="rounded-2xl border border-border bg-surface/50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Engagement</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock className="h-4 w-4" />
                Avg. Time Spent
              </div>
              <span className="font-medium text-text-primary">
                {Math.round(data.avgTimeSpentSeconds)}s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Repeat className="h-4 w-4" />
                Total Replays
              </div>
              <span className="font-medium text-text-primary">{data.totalReplays}</span>
            </div>
          </div>
        </div>

        {/* Reactions Breakdown */}
        <div className="rounded-2xl border border-border bg-surface/50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Reactions Breakdown</h3>
          <ReactionBar reactions={data.reactionsByType} />
        </div>
      </div>
    </div>
  );
}

// ── Main Analytics Page ────────────────────────────────────────────────

export function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();

  // Per-microsite analytics
  const { data: micrositeData, isLoading: micrositeLoading } = useQuery({
    queryKey: ["analytics", "microsite", id],
    queryFn: () => getMicrositeAnalytics(id!),
    enabled: !!id,
  });

  // Dashboard-level analytics (when no ID)
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: getDashboardAnalytics,
    enabled: !id,
  });

  const isLoading = id ? micrositeLoading : dashboardLoading;

  return (
    <>
      <Helmet>
        <title>
          {id ? `Analytics: ${micrositeData?.title ?? "..."}` : "Analytics"} — FirstPage
        </title>
      </Helmet>

      <div className="space-y-6">
        <PageHeader
          title={id ? micrositeData?.title ?? "Microsite Analytics" : "Analytics Overview"}
          subtitle={id ? "Detailed performance metrics" : "How your pages are performing"}
          backTo={ROUTES.DASHBOARD}
        />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : id && micrositeData ? (
          <MicrositeAnalyticsView data={micrositeData} />
        ) : dashboardData ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<BarChart3 className="h-5 w-5 text-primary" />}
              label="Total Microsites"
              value={dashboardData.totalMicrosites}
              color="bg-primary/10"
            />
            <StatCard
              icon={<Eye className="h-5 w-5 text-sky-500" />}
              label="Total Views"
              value={dashboardData.totalViews}
              color="bg-sky-500/10"
            />
            <StatCard
              icon={<Heart className="h-5 w-5 text-rose-500" />}
              label="Total Reactions"
              value={dashboardData.totalReactions}
              color="bg-rose-500/10"
            />
            <StatCard
              icon={<MessageCircle className="h-5 w-5 text-emerald-500" />}
              label="Total Replies"
              value={dashboardData.totalReplies}
              color="bg-emerald-500/10"
            />
          </div>
        ) : (
          <div className="text-center py-20 text-text-muted">
            <TrendingUp className="mx-auto mb-3 h-10 w-10" />
            <p>No analytics data yet. Publish a microsite to start tracking!</p>
          </div>
        )}
      </div>
    </>
  );
}
