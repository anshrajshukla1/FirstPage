import { SlideType } from "@/types";
import { Field, TextInput } from "@/components/ui/field";
import { parseVideoUrl } from "@/lib/media-url";
import { EditorSection, useDraftConfig, type SlideEditorProps } from "./shared";

const PROVIDER_LABELS: Record<string, string> = {
  YOUTUBE: "YouTube video detected.",
  VIMEO: "Vimeo video detected.",
  FILE: "Direct video file detected.",
};

/** One video, from a link. Detection is echoed back as the sender types. */
export function VideoEditor({ draft, setDraft }: SlideEditorProps) {
  const [config, set] = useDraftConfig(SlideType.VIDEO, draft, setDraft);
  const source = parseVideoUrl(config.url);
  const unrecognised = config.url.trim().length > 0 && source.provider === "NONE";

  return (
    <EditorSection title="Video">
      <Field label="Title" hint="Optional heading above the video">
        {(props) => (
          <TextInput
            {...props}
            value={draft.title}
            onChange={(event) => setDraft({ title: event.target.value })}
            placeholder="Watch this bit"
          />
        )}
      </Field>

      <Field
        label="Video link"
        hint={
          unrecognised
            ? undefined
            : (PROVIDER_LABELS[source.provider] ??
              "A YouTube or Vimeo link, or a direct .mp4 URL.")
        }
        error={
          unrecognised
            ? "That link isn't a YouTube, Vimeo or .mp4 address."
            : undefined
        }
      >
        {(props) => (
          <TextInput
            {...props}
            value={config.url}
            onChange={(event) => set({ url: event.target.value })}
            placeholder="https://youtube.com/watch?v=…"
            inputMode="url"
          />
        )}
      </Field>

      <Field
        label="Cover image"
        hint="Optional — what they see before pressing play. YouTube provides its own."
      >
        {(props) => (
          <TextInput
            {...props}
            value={config.poster}
            onChange={(event) => set({ poster: event.target.value })}
            placeholder="https://…/still.jpg"
            inputMode="url"
          />
        )}
      </Field>
    </EditorSection>
  );
}
