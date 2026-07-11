import { useState, useCallback } from "react";
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
  Wand2,
  Image as ImageIcon,
  Type,
  Quote,
  Clock,
  Film,
  Sparkles,
  ChevronRight,
  Palette,
  Settings2,
  X,
} from "lucide-react";
import { useMicrosite, useUpdateMicrosite, usePublishMicrosite } from "@/hooks/use-microsites";
import {
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
  generateAIContent,
} from "@/services/slide-service";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { Slide, SlideType, AnimationType } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ── Slide type config ──────────────────────────────────────────────────

const slideTypes: { value: SlideType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "TEXT" as SlideType, label: "Text", icon: Type, description: "A text block with title" },
  { value: "IMAGE" as SlideType, label: "Photo", icon: ImageIcon, description: "Fullscreen image" },
  { value: "GALLERY" as SlideType, label: "Gallery", icon: Film, description: "Photo carousel" },
  { value: "QUOTE" as SlideType, label: "Quote", icon: Quote, description: "Beautiful quote card" },
  { value: "LETTER" as SlideType, label: "Letter", icon: Type, description: "Handwritten style letter" },
  { value: "COUNTDOWN" as SlideType, label: "Countdown", icon: Clock, description: "Countdown timer" },
  { value: "VIDEO" as SlideType, label: "Video", icon: Film, description: "Embedded video" },
];

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
                    {slide.title || slide.type}
                  </p>
                  <p className="text-[10px] text-text-muted">{slide.type}</p>
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
}: {
  slide: Slide;
  micrositeId: string;
  onUpdate: () => void;
}) {
  const [title, setTitle] = useState(slide.title ?? "");
  const [content, setContent] = useState(slide.content ?? "");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSlide(micrositeId, slide.id, {
        title: title || undefined,
        content: content || undefined,
      });
      toast.success("Slide saved");
      onUpdate();
    } catch {
      toast.error("Failed to save");
    }
    setIsSaving(false);
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateAIContent({
        prompt: aiPrompt,
        context: `This is for a slide titled "${title}" of type "${slide.type}"`,
      });
      setContent(result.generatedContent);
      toast.success("AI content generated!");
    } catch {
      toast.error("AI generation failed");
    }
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {slide.type}
          </span>
          <span className="text-xs text-text-muted">
            Slide #{slide.orderIndex + 1}
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {isSaving ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          Save
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Slide Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this slide a title..."
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-lg font-semibold text-text-primary placeholder-text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your heartfelt message here..."
              rows={8}
              className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* AI Generation */}
          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-text-primary">
                AI Content Assistant
              </h4>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAIGenerate()}
                placeholder="e.g., Write a heartfelt birthday message for my best friend..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
              />
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Generate
              </button>
            </div>
          </div>
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
              Add a Slide
            </h3>
            <button onClick={onClose} className="rounded-lg p-1 text-text-muted hover:bg-surface">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {slideTypes.map((st) => {
              const Icon = st.icon;
              return (
                <motion.button
                  key={st.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onAdd(st.value)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{st.label}</p>
                    <p className="text-[10px] text-text-muted">{st.description}</p>
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
  const updateMutation = useUpdateMicrosite(id!);
  const publishMutation = usePublishMicrosite();

  const { data: slides = [], isLoading: slidesLoading } = useQuery({
    queryKey: ["slides", id],
    queryFn: () => getSlides(id!),
    enabled: !!id,
  });

  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const activeSlide = slides.find((s) => s.id === activeSlideId) ?? null;

  // Auto-select first slide
  if (!activeSlideId && slides.length > 0) {
    setActiveSlideId(slides[0].id);
  }

  const invalidateSlides = () => {
    queryClient.invalidateQueries({ queryKey: ["slides", id] });
  };

  const handleAddSlide = async (type: SlideType) => {
    if (!id) return;
    try {
      const newSlide = await createSlide(id, { type });
      invalidateSlides();
      setActiveSlideId(newSlide.id);
      setShowAddModal(false);
      toast.success("Slide added");
    } catch {
      toast.error("Failed to add slide");
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!id || !window.confirm("Delete this slide?")) return;
    try {
      await deleteSlide(id, slideId);
      if (activeSlideId === slideId) {
        setActiveSlideId(slides.find((s) => s.id !== slideId)?.id ?? null);
      }
      invalidateSlides();
      toast.success("Slide deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleReorder = useCallback(
    async (newOrder: Slide[]) => {
      if (!id) return;
      try {
        await reorderSlides(id, newOrder.map((s) => s.id));
        invalidateSlides();
      } catch {
        // Silently fail — UI already shows the new order
      }
    },
    [id],
  );

  const handlePublish = async () => {
    if (!id) return;
    try {
      await publishMutation.mutateAsync(id);
      toast.success("Published! Your page is live 🎉");
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
              microsite.status === "PUBLISHED"
                ? "bg-success/10 text-success"
                : microsite.status === "DRAFT"
                ? "bg-amber-500/10 text-amber-600"
                : "bg-border text-text-muted"
            )}>
              {microsite.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(`/${microsite.slug}`, "_blank")}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface"
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

        {/* Main editor area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Slide panel */}
          <SlidePanel
            slides={slides}
            activeSlideId={activeSlideId}
            onSelect={setActiveSlideId}
            onAdd={() => setShowAddModal(true)}
            onDelete={handleDeleteSlide}
            onReorder={handleReorder}
          />

          {/* Slide editor */}
          {activeSlide ? (
            <SlideEditor
              key={activeSlide.id}
              slide={activeSlide}
              micrositeId={id!}
              onUpdate={invalidateSlides}
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
    </>
  );
}
