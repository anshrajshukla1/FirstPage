import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence, Reorder } from "motion/react";
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  ArrowLeft,
  Send,
  Sparkles,
  ChevronRight,
  Settings,
  X,
} from "lucide-react";
import { useMicrosite, usePublishMicrosite } from "@/hooks/use-microsites";
import {
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
} from "@/services/slide-service";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MicrositeSettingsDialog } from "@/components/microsite-settings-dialog";
import {
  SLIDE_EDITORS,
  SLIDE_TYPE_ORDER,
  type SlideDraft,
} from "@/components/slide-editors";
import { slideKeys } from "@/api/query-keys";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { MicrositeStatus, SlideType, type Slide } from "@/types";
import { defaultSlideConfig } from "@/types/slide-config";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ── Slide Panel (left sidebar) ─────────────────────────────────────────

function SlidePanel({
  slides,
  activeSlideId,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: {
  slides: Slide[];
  activeSlideId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onReorder: (newOrder: Slide[]) => void;
}) {
  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface/30">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">Slides</h3>
        <button
          onClick={onAdd}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <Reorder.Group
          axis="y"
          values={slides}
          onReorder={onReorder}
          className="space-y-1.5"
        >
          {slides.map((slide, index) => (
            <Reorder.Item key={slide.id} value={slide}>
              <motion.button
                onClick={() => onSelect(slide.id)}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all",
                  activeSlideId === slide.id
                    ? "bg-primary/10 border border-primary/30 shadow-sm"
                    : "hover:bg-surface-hover border border-transparent"
                )}
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-text-muted opacity-0 group-hover:opacity-100" />
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-bold text-text-secondary">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-text-primary">
                    {slide.title || SLIDE_EDITORS[slide.type].label}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {SLIDE_EDITORS[slide.type].label}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(slide.id); }}
                  className="shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-text-muted hover:text-error" />
                </button>
              </motion.button>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {slides.length === 0 && (
          <div className="flex flex-col items-center py-10 text-center">
            <Sparkles className="mb-2 h-8 w-8 text-text-muted" />
            <p className="text-xs text-text-muted">No slides yet</p>
            <button
              onClick={onAdd}
              className="mt-3 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white"
            >
              Add First Slide
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Slide Editor (main content) ────────────────────────────────────────

function SlideEditor({
  slide,
  micrositeId,
  onUpdate,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  slide: Slide;
  micrositeId: string;
  onUpdate: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const entry = SLIDE_EDITORS[slide.type];
  const draftKey = `firstpage_draft_${slide.id}`;

  const getInitialDraft = (): SlideDraft => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore invalid JSON
      }
    }
    return {
      title: slide.title ?? "",
      content: slide.content ?? "",
      config: slide.config,
    };
  };

  const [draft, setDraftState] = useState<SlideDraft>(getInitialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(!!localStorage.getItem(draftKey));

  // Sync back to slide state if the selected slide changes
  useEffect(() => {
    setDraftState(getInitialDraft());
    setDirty(!!localStorage.getItem(draftKey));
  }, [slide.id]);

  // Persist draft on changes
  useEffect(() => {
    if (dirty) {
      localStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [draft, dirty, draftKey]);

  const setDraft = (patch: Partial<SlideDraft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSlide(micrositeId, slide.id, {
        // Empty is a real choice - sending undefined would leave the old text in
        // place and make clearing a field impossible.
        title: draft.title,
        content: draft.content,
        config: draft.config,
      });
      setDirty(false);
      localStorage.removeItem(draftKey);
      toast.success("Slide saved");
      onUpdate();
    } catch {
      toast.error("Couldn't save the slide. Try again.");
    }
    setIsSaving(false);
  };

  const EditorComponent = entry.Editor;

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col rounded-2xl border border-border bg-background shadow-sm">
      {/* Editor header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <entry.icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{entry.label}</h3>
            <p className="text-xs text-text-muted">{entry.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="hidden sm:inline-block text-xs text-text-muted mr-2">Unsaved changes</span>
          )}
          <Button variant="secondary" size="sm" onClick={onPrev} disabled={!hasPrev}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={onNext} disabled={!hasNext}>
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
          <Button size="sm" onClick={handleSave} busy={isSaving}>
            {!isSaving && <Save className="h-3 w-3" />}
            Save
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <EditorComponent
            slide={slide}
            micrositeId={micrositeId}
            draft={draft}
            setDraft={setDraft}
            onMediaChange={onUpdate}
          />
        </div>
      </div>
    </div>
  );
}

// ── Add Slide Modal ────────────────────────────────────────────────────

function AddSlideModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: SlideType) => void;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">
              Add a slide
            </h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1 text-text-muted hover:bg-surface"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {SLIDE_TYPE_ORDER.map((type) => {
              const { label, description, icon: Icon } = SLIDE_EDITORS[type];
              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onAdd(type)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {label}
                    </p>
                    <p className="text-[10px] text-text-muted">{description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Editor Page ───────────────────────────────────────────────────

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: microsite, isLoading: micrositeLoading } = useMicrosite(id);
  const publishMutation = usePublishMicrosite();

  const { data: slides = [], isLoading: slidesLoading } = useQuery({
    queryKey: slideKeys.list(id ?? ""),
    queryFn: () => getSlides(id!),
    enabled: !!id,
  });

  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeSlide = slides.find((s) => s.id === activeSlideId) ?? null;

  // Keep a valid slide selected: pick the first one on load, and recover if the
  // active slide disappears (deleted elsewhere, refetch, etc.).
  useEffect(() => {
    if (slides.length === 0) {
      setActiveSlideId(null);
    } else if (!slides.some((s) => s.id === activeSlideId)) {
      setActiveSlideId(slides[0].id);
    }
  }, [slides, activeSlideId]);

  const invalidateSlides = () => {
    queryClient.invalidateQueries({ queryKey: slideKeys.list(id ?? "") });
  };

  const handleAddSlide = async (type: SlideType) => {
    if (!id) return;
    try {
      const newSlide = await createSlide(id, {
        type,
        config: defaultSlideConfig(type),
      });
      /*
       * Seed the cache before selecting the slide. Invalidating first would
       * leave the recovery effect above running against the pre-add list,
       * finding the new id missing, and snapping the editor back to slide 1 —
       * which is exactly the jump this fixes.
       */
      queryClient.setQueryData<Slide[]>(slideKeys.list(id), (prev) => [
        ...(prev ?? []),
        newSlide,
      ]);
      setActiveSlideId(newSlide.id);
      setShowAddModal(false);
      void queryClient.invalidateQueries({ queryKey: slideKeys.list(id) });
    } catch {
      toast.error("Couldn't add the slide. Try again.");
    }
  };

  const handleDeleteSlide = async () => {
    const slideId = pendingDeleteId;
    if (!id || !slideId) return;
    setIsDeleting(true);
    try {
      await deleteSlide(id, slideId);
      if (activeSlideId === slideId) {
        setActiveSlideId(slides.find((s) => s.id !== slideId)?.id ?? null);
      }
      invalidateSlides();
      setPendingDeleteId(null);
      toast.success("Slide deleted");
    } catch {
      toast.error("Couldn't delete the slide. Try again.");
    }
    setIsDeleting(false);
  };

  const handleReorder = useCallback(
    async (newOrder: Slide[]) => {
      if (!id) return;
      try {
        await reorderSlides(id, newOrder.map((s) => s.id));
      } catch {
        toast.error("Could not save the new order");
      } finally {
        // Refetch either way so the UI can't drift from the server's order.
        invalidateSlides();
      }
    },
    [id],
  );

  const handlePublish = async () => {
    if (!id) return;
    try {
      await publishMutation.mutateAsync(id);
      // The link is the point of publishing, so hand it over on the dashboard
      // rather than leaving the sender in the editor with a toast.
      navigate(ROUTES.DASHBOARD, { state: { justPublished: id } });
    } catch {
      toast.error("Cannot publish — add at least one slide");
    }
  };

  if (micrositeLoading || slidesLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!microsite) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <p className="text-text-secondary">Microsite not found</p>
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="mt-4 text-primary hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit: {microsite.title} — FirstPage</title>
      </Helmet>

      <div className="flex h-[calc(100vh-64px)] flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-text-secondary hover:bg-surface"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <ChevronRight className="h-3 w-3 text-text-muted" />
            <h1 className="truncate text-sm font-semibold text-text-primary">
              {microsite.title}
            </h1>
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              microsite.status === MicrositeStatus.PUBLISHED
                ? "bg-success/10 text-success"
                : microsite.status === MicrositeStatus.DRAFT
                ? "bg-amber-500/10 text-amber-600"
                : "bg-border text-text-muted"
            )}>
              {microsite.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              title="Password, anonymity, music and the recipient's name"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface"
            >
              <Settings className="h-3 w-3" /> Settings
            </button>
            <button
              onClick={() =>
                window.open(ROUTES.PUBLIC_VIEWER(microsite.slug), "_blank")
              }
              disabled={microsite.status !== MicrositeStatus.PUBLISHED}
              title={
                microsite.status === MicrositeStatus.PUBLISHED
                  ? "Open the live page"
                  : "Publish first — the public page is only served once published"
              }
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Eye className="h-3 w-3" /> Preview
            </button>
            <button
              onClick={handlePublish}
              disabled={publishMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {publishMutation.isPending ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              Publish
            </button>
          </div>
        </div>

        {/* Viewed Once Banner */}
        {microsite.isOneTimeView && microsite.hasBeenViewed && (
          <div className="flex items-center justify-center gap-2 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-700">
            <Eye className="h-4 w-4" />
            This microsite was set to one-time view and has already been opened by the recipient.
          </div>
        )}

        {/* Main editor area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Slide panel */}
          <SlidePanel
            slides={slides}
            activeSlideId={activeSlideId}
            onSelect={setActiveSlideId}
            onAdd={() => setShowAddModal(true)}
            onDelete={setPendingDeleteId}
            onReorder={handleReorder}
          />

          {/* Slide editor */}
          {activeSlide ? (
            <SlideEditor
              key={activeSlide.id}
              slide={activeSlide}
              micrositeId={id!}
              onUpdate={invalidateSlides}
              onPrev={() => {
                const idx = slides.findIndex((s) => s.id === activeSlideId);
                if (idx > 0) setActiveSlideId(slides[idx - 1].id);
              }}
              onNext={() => {
                const idx = slides.findIndex((s) => s.id === activeSlideId);
                if (idx < slides.length - 1) setActiveSlideId(slides[idx + 1].id);
              }}
              hasPrev={slides.findIndex((s) => s.id === activeSlideId) > 0}
              hasNext={slides.findIndex((s) => s.id === activeSlideId) < slides.length - 1}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <Sparkles className="mb-3 h-12 w-12 text-text-muted" />
              <p className="text-lg font-medium text-text-primary">
                Start building your page
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Add slides to create your story
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4" /> Add First Slide
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Slide Modal */}
      <AddSlideModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSlide}
      />

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this slide?"
        description="Its text and photos go with it. The rest of the page is untouched."
        confirmLabel="Delete slide"
        destructive
        busy={isDeleting}
        onConfirm={handleDeleteSlide}
        onCancel={() => setPendingDeleteId(null)}
      />

      <MicrositeSettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        micrositeId={id ?? ""}
      />
    </>
  );
}
