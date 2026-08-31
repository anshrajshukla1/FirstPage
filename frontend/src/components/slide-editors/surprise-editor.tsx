import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteMedia } from "@/services/slide-service";
import { Field, TextInput, Textarea } from "@/components/ui/field";
import { SlideType } from "@/types";
import {
  EditorSection,
  MediaPicker,
  useDraftConfig,
  type SlideEditorProps,
} from "./shared";

/** Something held back until the recipient presses Reveal. */
export function SurpriseEditor({
  slide,
  micrositeId,
  draft,
  setDraft,
  onMediaChange,
}: SlideEditorProps) {
  const [config, set] = useDraftConfig(SlideType.SURPRISE, draft, setDraft);

  const revealImage =
    slide.media.find((item) => item.id === config.revealMediaId) ?? null;

  const removeImage = async () => {
    if (!revealImage) return;
    try {
      await deleteMedia(micrositeId, revealImage.id);
      set({ revealMediaId: "" });
      onMediaChange();
    } catch {
      toast.error("Couldn't remove the picture.");
    }
  };

  return (
    <EditorSection
      title="Surprise"
      hint="They see the teaser first, and choose when to open the rest."
    >
      <Field label="Teaser" hint="What's on screen before they press Reveal.">
        {(props) => (
          <TextInput
            {...props}
            value={config.prompt}
            onChange={(event) => set({ prompt: event.target.value })}
            placeholder="I got you something."
          />
        )}
      </Field>

      <Field label="The reveal">
        {(props) => (
          <Textarea
            {...props}
            value={config.revealText}
            onChange={(event) => set({ revealText: event.target.value })}
            rows={5}
            placeholder="Two tickets. Saturday. Wear the good shoes."
          />
        )}
      </Field>

      {revealImage ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 p-3">
          <img
            src={revealImage.url}
            alt=""
            className="h-16 w-16 rounded-lg object-cover"
          />
          <p className="flex-1 text-xs text-text-muted">
            Shown with the reveal.
          </p>
          <button
            onClick={() => void removeImage()}
            aria-label="Remove the revealed picture"
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error focus-visible:ring-2 focus-visible:ring-error/30 focus-visible:outline-none"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <MediaPicker
          micrositeId={micrositeId}
          slideId={slide.id}
          multiple={false}
          label="Add a picture to the reveal"
          onUploaded={(uploaded) => {
            // The config points at one specific upload, so record which.
            if (uploaded[0]) set({ revealMediaId: uploaded[0].id });
            onMediaChange();
          }}
        />
      )}
    </EditorSection>
  );
}
