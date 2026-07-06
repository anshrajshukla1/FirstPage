import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Eye,
  Heart,
  MoreVertical,
  Trash2,
  ExternalLink,
  Pencil,
  Layers,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CategoryBadge } from "@/components/common/category-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { getMyMicrosites, deleteMicrosite } from "@/services/microsite-service";
import { queryKeys } from "@/api/query-keys";
import { ROUTES } from "@/constants/routes";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { MicrositeListItem } from "@/types";
import { useState } from "react";
import toast from "react-hot-toast";

// ── Stats Card ─────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
}

function StatCard({ icon, label, value, trend, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex items-center gap-4 rounded-2xl border border-border bg-surface/50 p-5"
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl",
          color,
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-text-secondary">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="font-display text-2xl font-bold text-text-primary">
            {value}
          </p>
          {trend && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-success">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Microsite Card ─────────────────────────────────────────────────────

interface MicrositeCardProps {
  microsite: MicrositeListItem;
  index: number;
  onDelete: (id: string) => void;
}

function MicrositeCard({ microsite, index, onDelete }: MicrositeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface/50 transition-shadow hover:shadow-xl"
    >
      {/* Preview / Thumbnail */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
        {microsite.previewImageUrl ? (
          <img
            src={microsite.previewImageUrl}
            alt={microsite.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Layers className="h-10 w-10 text-primary/30" />
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute left-3 top-3">
          <StatusBadge status={microsite.status} />
        </div>

        {/* Actions menu */}
        <div className="absolute right-3 top-3">
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 text-text-secondary backdrop-blur-sm transition-colors hover:bg-background hover:text-text-primary"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
                  <Link
                    to={ROUTES.EDIT(microsite.id)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <a
                    href={`/${microsite.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Live
                  </a>
                  <button
                    onClick={() => {
                      onDelete(microsite.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="mb-2">
          <CategoryBadge category={microsite.category} />
        </div>
        <h3 className="font-display text-base font-semibold text-text-primary line-clamp-1">
          {microsite.title}
        </h3>
        <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {microsite.viewCount} views
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            {microsite.slideCount} slides
          </span>
          <span className="ml-auto">
            {formatRelativeTime(microsite.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKeys.microsites.all, 0, 20],
    queryFn: () => getMyMicrosites(0, 20),
  });

  const deletemutation = useMutation({
    mutationFn: deleteMicrosite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.microsites.all });
      toast.success("Microsite deleted");
    },
    onError: () => {
      toast.error("Failed to delete microsite");
    },
  });

  const microsites = data?.content ?? [];
  const totalViews = microsites.reduce((sum, m) => sum + m.viewCount, 0);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this microsite?")) {
      deletemutation.mutate(id);
    }
  };

  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  return (
    <>
      <Helmet>
        <title>Dashboard — FirstPage</title>
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title={`Welcome back, ${firstName} 👋`}
          subtitle="Here's what's happening with your microsites"
          actions={
            <Link
              to={ROUTES.CREATE}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Create New
            </Link>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<Layers className="h-5 w-5 text-primary" />}
            label="Total Microsites"
            value={data?.totalElements ?? 0}
            color="bg-primary/10"
          />
          <StatCard
            icon={<Eye className="h-5 w-5 text-sky-500" />}
            label="Total Views"
            value={totalViews}
            trend="+12%"
            color="bg-sky-500/10"
          />
          <StatCard
            icon={<Heart className="h-5 w-5 text-rose-500" />}
            label="Total Reactions"
            value={0}
            color="bg-rose-500/10"
          />
        </div>

        {/* Microsites Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={<Layers className="h-7 w-7" />}
            title="Something went wrong"
            description="We couldn't load your microsites. Please try again."
          />
        ) : microsites.length === 0 ? (
          <EmptyState
            icon={<Layers className="h-7 w-7" />}
            title="No microsites yet"
            description="Create your first personal page and share it with someone special."
            action={
              <Link
                to={ROUTES.CREATE}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4" />
                Create Your First Page
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {microsites.map((microsite, i) => (
              <MicrositeCard
                key={microsite.id}
                microsite={microsite}
                index={i}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
