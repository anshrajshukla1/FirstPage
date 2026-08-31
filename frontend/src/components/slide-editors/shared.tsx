import { useRef, useState, type ReactNode } from "react";
import { ImagePlus, Loader2, Sparkles, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { uploadMedia, generateAIContent } from "@/services/slide-service";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import type { Media, Slide, SlideType } from "@/types";
import { parseSlideConfig, type SlideConfigFor } from "@/types/slide-config";

/**
 * The three things a slide editor can change. `config` holds the per-type
 * settings; `title` and `content` are only used by the types that still have
 * prose, which is why a countdown editor shows neither.
 */
export interface SlideDraft {
  title: string;
  content: string;
  config: Record<string, unknown>;
}

export interface SlideEditorProps {
  slide: Slide;
  micrositeId: string;
  draft: SlideDraft;
  /** Patches the draft the page holds; saving is the page's job, not the editor's. */
  setDraft: (patch: Partial<SlideDraft>) => void;
  /**
   * Uploads and deletes take effect immediately rather than on Save, so the
   * editor asks the page to refetch the slide instead of holding media in the
   * draft.
   */
  onMediaChange: () => void;
}

/** Reads the draft's config as its typed shape and patches it in place. */
export function useDraftConfig<T extends SlideType>(
  type: T,
  draft: SlideDraft,
  setDraft: (patch: Partial<SlideDraft>) => void,
) {
  const config = parseSlideConfig(type, draft.config);

  const set = (patch: Partial<SlideConfigFor<T>>) =>
    setDraft({
      config: { ...config, ...patch } as Record<string, unknown>,
    });

  return [config, set] as const;
}

/** A titled group of fields, so every editor is laid out the same way. */
export function EditorSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

/** A labelled on/off row — used where a checkbox reads better than a select. */
export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:ring-2 focus-visible:ring-primary/20"
      />
      <span>
        <span className="block text-sm font-medium text-text-primary">
          {label}
        </span>
        {hint && <span className="block text-xs text-text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/**
 * The AI assistant, unchanged in behaviour but now only shown on the two types
 * that hold prose. It writes into whichever field the caller points it at.
 */
export function AIAssistant({
  slideType,
  title,
  onGenerated,
}: {
  slideType: string;
  title: string;
  onGenerated: (text: string) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    try {
      const result = await generateAIContent({
        prompt,
        context: `This is for a slide titled "${title}" of type "${slideType}"`,
      });
      onGenerated(result.generatedContent);
      toast.success("Draft written — edit it however you like");
    } catch {
      toast.error("Couldn't write a draft. Try again.");
    }
    setBusy(false);
  };

  return (
    <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-text-primary">
          Stuck? Ask for a draft
        </h4>
      </div>
      <div className="flex gap-2">
        <TextInput
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && generate()}
          placeholder="A birthday note for my oldest friend, warm but not soppy"
          aria-label="What should the draft say?"
        />
        <Button
          size="sm"
          onClick={generate}
          busy={busy}
          disabled={!prompt.trim()}
          className="shrink-0"
        >
          {!busy && <Sparkles className="h-3 w-3" />}
          Write it
        </Button>
      </div>
    </div>
  );
}

/**
 * The file picker shared by the photo and surprise editors.
 *
 * <p>Uploads go straight to the server with the slide id attached — that id is
 * what makes the photo appear on the slide rather than floating unattached to
 * the microsite.
 */
export function MediaPicker({
  micrositeId,
  slideId,
  multiple = true,
  label = "Add photos",
  onUploaded,
}: {
  micrositeId: string;
  slideId: string;
  multiple?: boolean;
  label?: string;
  onUploaded: (uploaded: Media[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const list = Array.from(files);
    setProgress({ done: 0, total: list.length });
    const uploaded: Media[] = [];

    // One at a time: a phone gallery selection can be twenty photos, and firing
    // twenty parallel multipart uploads is how the request queue stalls.
    for (const file of list) {
      try {
        uploaded.push(await uploadMedia(micrositeId, file, "IMAGE", undefined, slideId));
      } catch {
        toast.error(`Couldn't upload ${file.name}`);
      }
      setProgress((prev) => (prev ? { ...prev, done: prev.done + 1 } : null));
    }

    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
    if (uploaded.length > 0) onUploaded(uploaded);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(event) => void handleFiles(event.target.files)}
        className="sr-only"
        id={`upload-${slideId}`}
      />
      <label
        htmlFor={`upload-${slideId}`}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-surface/50 px-5 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-text-primary focus-within:ring-2 focus-within:ring-primary/20"
      >
        {progress ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading {progress.done + 1} of {progress.total}
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" />
            {label}
          </>
        )}
      </label>
    </div>
  );
}

export { Field, TextInput };
