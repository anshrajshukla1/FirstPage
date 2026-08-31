import { useEffect, useState } from "react";
import { Reorder } from "motion/react";
import { GripVertical, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteMedia,
  reorderMedia,
  updateMediaCaption,
} from "@/services/slide-service";
import { Field, Select, TextInput } from "@/components/ui/field";
import { PHOTO_LAYOUTS } from "@/types/slide-config";
import { SlideType, type Media } from "@/types";
import {
  EditorSection,
  MediaPicker,
  useDraftConfig,
  type SlideEditorProps,
} from "./shared";

const LAYOUT_LABELS: Record<(typeof PHOTO_LAYOUTS)[number], string> = {
  grid: "Grid — all of them at once",
  stack: "Stack — loose prints on a table",
  carousel: "One at a time — they choose the pace",
};

/**
 * The photo slide's editor. Uploads, captions, order and deletions all take
 * effect immediately — a photo is a file on a server, not a draft field, and
 * pretending otherwise loses uploads when the sender navigates away.
 */
export function PhotosEditor({
  slide,
  micrositeId,
  draft,
  setDraft,
  onMediaChange,
}: SlideEditorProps) {
  const [config, set] = useDraftConfig(SlideType.PHOTOS, draft, setDraft);
  const [photos, setPhotos] = useState<Media[]>(slide.media);

  // The page refetches after every media change; take the server's list as truth.
  useEffect(() => setPhotos(slide.media), [slide.media]);

  const commitOrder = async (next: Media[]) => {
    setPhotos(next);
    try {
      await reorderMedia(
        micrositeId,
        next.map((photo) => photo.id),
      );
      onMediaChange();
    } catch {
      toast.error("Couldn't save the new order.");
      setPhotos(slide.media);
    }
  };

  const saveCaption = async (photo: Media, caption: string) => {
    if ((photo.caption ?? "") === caption) return;
    try {
      await updateMediaCaption(micrositeId, photo.id, caption);
      onMediaChange();
    } catch {
      toast.error("Couldn't save the caption.");
    }
  };

  const removePhoto = async (photo: Media) => {
    setPhotos((prev) => prev.filter((item) => item.id !== photo.id));
    try {
      await deleteMedia(micrositeId, photo.id);
      onMediaChange();
    } catch {
      toast.error("Couldn't remove the photo.");
      setPhotos(slide.media);
    }
  };

  return (
    <>
      <EditorSection title="Photos" hint="Drag to reorder. Captions are optional.">
        <Field label="Title" hint="Optional heading above the photos">
          {(props) => (
            <TextInput
              {...props}
              value={draft.title}
              onChange={(event) => setDraft({ title: event.target.value })}
              placeholder="That week in Goa"
            />
          )}
        </Field>

        <Field label="Arrangement">
          {(props) => (
            <Select
              {...props}
              value={config.layout}
              onChange={(event) =>
                set({ layout: event.target.value as typeof config.layout })
              }
            >
              {PHOTO_LAYOUTS.map((layout) => (
                <option key={layout} value={layout}>
                  {LAYOUT_LABELS[layout]}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <MediaPicker
          micrositeId={micrositeId}
          slideId={slide.id}
          onUploaded={onMediaChange}
        />

        {photos.length === 0 ? (
          <p className="text-sm text-text-muted">
            No photos yet. Add the ones you'd show them in person.
          </p>
        ) : (
          <Reorder.Group
            axis="y"
            values={photos}
            onReorder={setPhotos}
            className="flex flex-col gap-2"
          >
            {photos.map((photo) => (
              <Reorder.Item
                key={photo.id}
                value={photo}
                onDragEnd={() => void commitOrder(photos)}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 p-2"
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-text-muted" />
                <img
                  src={photo.url}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <CaptionInput
                  photo={photo}
                  onCommit={(caption) => void saveCaption(photo, caption)}
                />
                <button
                  onClick={() => void removePhoto(photo)}
                  aria-label="Remove this photo"
                  className="shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error focus-visible:ring-2 focus-visible:ring-error/30 focus-visible:outline-none"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </EditorSection>
    </>
  );
}

/** Kept local so typing a caption doesn't re-render the whole gallery. */
function CaptionInput({
  photo,
  onCommit,
}: {
  photo: Media;
  onCommit: (caption: string) => void;
}) {
  const [value, setValue] = useState(photo.caption ?? "");

  return (
    <TextInput
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => onCommit(value.trim())}
      onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
      placeholder="Caption (optional)"
      aria-label="Photo caption"
      className="py-2 text-xs"
    />
  );
}
