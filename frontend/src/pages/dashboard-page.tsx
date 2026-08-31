import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  Clock,
  TrendingUp,
  Settings,
  Share2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CategoryBadge } from "@/components/common/category-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { DropdownMenu, type MenuItem } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ShareSheet } from "@/components/ui/share-sheet";
import { MicrositeSettingsDialog } from "@/components/microsite-settings-dialog";
import { getMyMicrosites, deleteMicrosite } from "@/services/microsite-service";
import { getDashboardAnalytics } from "@/services/analytics-service";
import { queryKeys } from "@/api/query-keys";
import { ROUTES } from "@/constants/routes";
import { cn, formatRelativeTime } from "@/lib/utils";
import { MicrositeStatus, type MicrositeListItem } from "@/types";
import { useEffect, useState } from "react";
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
  onDelete: (microsite: MicrositeListItem) => void;
  onShare: (microsite: MicrositeListItem) => void;
  onSettings: (microsite: MicrositeListItem) => void;
}

function MicrositeCard({
  microsite,
  index,
  onDelete,
  onShare,
  onSettings,
}: MicrositeCardProps) {
  const navigate = useNavigate();
  const published = microsite.status === MicrositeStatus.PUBLISHED;

  const menuItems: MenuItem[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-3.5 w-3.5" />,
      onSelect: () => navigate(ROUTES.EDIT(microsite.id)),
    },
    {
      label: "Share",
      icon: <Share2 className="h-3.5 w-3.5" />,
      // A draft has no public page yet, so a link would 404 on the recipient.
      disabled: !published,
      onSelect: () => onShare(microsite),
    },
    {
      label: "View live",
      icon: <ExternalLink className="h-3.5 w-3.5" />,
      disabled: !published,
      onSelect: () =>
        window.open(
          ROUTES.PUBLIC_VIEWER(microsite.slug),
          "_blank",
          "noopener,noreferrer",
        ),
    },
    {
      label: "Settings",
      icon: <Settings className="h-3.5 w-3.5" />,
      onSelect: () => onSettings(microsite),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      destructive: true,
      onSelect: () => onDelete(microsite),
    },
  ];

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

        {/*
          The menu is portalled out of this card: the thumbnail's hover zoom
          needs `overflow-hidden` above, which would otherwise crop it.
        */}
        <div className="absolute right-3 top-3">
          <DropdownMenu
            items={menuItems}
            trigger={
              <button
                aria-label={`Actions for ${microsite.title}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 text-text-secondary backdrop-blur-sm transition-colors hover:bg-background hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            }
          />
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
            <Layers className="h-3 w-3" />
            {microsite.slideCount} slides
          </span>
          <span className="ml-auto">
            {formatRelativeTime(microsite.createdAt)}
          </span>
        </div>

        {/*
          The one thing a sender comes back to check. A view count answers a
          question nobody asked; whether it has been opened, and when, is the
          whole reason they made the page.
        */}
        {microsite.status === MicrositeStatus.PUBLISHED && (
          <div className="mt-2.5 flex items-center gap-1.5 border-t border-border pt-2.5 text-xs">
            {microsite.lastViewedAt ? (
              <>
                <Eye className="h-3 w-3 shrink-0 text-primary" />
                <span className="font-medium text-text-primary">
                  Opened {formatRelativeTime(microsite.lastViewedAt)}
                </span>
                {microsite.viewCount > 1 && (
                  <span className="text-text-muted">
                    · {microsite.viewCount} visitors
                  </span>
                )}
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 shrink-0 text-text-muted" />
                <span className="text-text-muted">Not opened yet</span>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  const [pendingDelete, setPendingDelete] = useState<MicrositeListItem | null>(
    null,
  );
  const [sharing, setSharing] = useState<MicrositeListItem | null>(null);
  const [settingsFor, setSettingsFor] = useState<MicrositeListItem | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKeys.microsites.all, 0, 20],
    queryFn: () => getMyMicrosites(0, 20),
  });

  const deletemutation = useMutation({
    mutationFn: deleteMicrosite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.microsites.all });
      toast.success("Page deleted");
      setPendingDelete(null);
    },
    onError: () => {
      toast.error("Couldn't delete the page. Try again.");
    },
  });

  const allMicrosites = data?.content ?? [];
  // Filtered client-side: the backend has no search endpoint, and the
  // dashboard already holds the page it would search.
  const microsites = query
    ? allMicrosites.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.slug.toLowerCase().includes(query),
      )
    : allMicrosites;

  const { data: analytics } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: getDashboardAnalytics,
  });

  /*
   * Publishing navigates here with the id it just published, because the link
   * is the whole point of publishing and the editor is the wrong place to hand
   * it over. Cleared from history state immediately so a back-navigation or a
   * refresh doesn't reopen the sheet.
   */
  const justPublished = (location.state as { justPublished?: string } | null)
    ?.justPublished;

  useEffect(() => {
    if (!justPublished) return;
    const match = allMicrosites.find((m) => m.id === justPublished);
    if (!match) return;
    setSharing(match);
    navigate(ROUTES.DASHBOARD, { replace: true, state: null });
  }, [justPublished, allMicrosites, navigate]);

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
            value={analytics?.totalMicrosites ?? data?.totalElements ?? 0}
            color="bg-primary/10"
          />
          <StatCard
            icon={<Eye className="h-5 w-5 text-sky-500" />}
            label="Total Views"
            value={analytics?.totalViews ?? 0}
            color="bg-sky-500/10"
          />
          <StatCard
            icon={<Heart className="h-5 w-5 text-rose-500" />}
            label="Total Reactions"
            value={analytics?.totalReactions ?? 0}
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
          query ? (
            <EmptyState
              icon={<Layers className="h-7 w-7" />}
              title="No matches"
              description={`Nothing in your pages matches "${searchParams.get("q")}".`}
            />
          ) : (
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
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {microsites.map((microsite, i) => (
              <MicrositeCard
                key={microsite.id}
                microsite={microsite}
                index={i}
                onDelete={setPendingDelete}
                onShare={setSharing}
                onSettings={setSettingsFor}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this page?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” and everything on it will be removed. Anyone holding the link will see a page that no longer exists.`
            : undefined
        }
        confirmLabel="Delete page"
        destructive
        busy={deletemutation.isPending}
        onConfirm={() => pendingDelete && deletemutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />

      {sharing && (
        <ShareSheet
          open
          onClose={() => setSharing(null)}
          slug={sharing.slug}
          title={sharing.title}
        />
      )}

      {/*
        Kept mounted while a page is selected so the dialog can animate out.
        The card list only carries summary fields, so the dialog loads the full
        page itself from the id.
      */}
      <MicrositeSettingsDialog
        open={settingsFor !== null}
        onClose={() => setSettingsFor(null)}
        micrositeId={settingsFor?.id ?? ""}
      />
    </>
  );
}
