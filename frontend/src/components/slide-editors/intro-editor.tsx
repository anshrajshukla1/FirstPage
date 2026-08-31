import { SlideType } from "@/types";
import { Field, TextInput } from "@/components/ui/field";
import { Textarea } from "@/components/ui/field";
import { EditorSection, useDraftConfig, type SlideEditorProps } from "./shared";

/** The opening slide: what it says, and the small line above it. */
export function IntroEditor({ draft, setDraft }: SlideEditorProps) {
  const [config, set] = useDraftConfig(SlideType.INTRO, draft, setDraft);

  return (
    <EditorSection
      title="Opening"
      hint="The first thing they see. Short lines land harder here."
    >
      <Field label="Above the headline" hint="Optional — “a letter for”, “eight years of”">
        {(props) => (
          <TextInput
            {...props}
            value={config.eyebrow}
            onChange={(event) => set({ eyebrow: event.target.value })}
            placeholder="a letter for"
          />
        )}
      </Field>

      <Field label="Headline">
        {(props) => (
          <Textarea
            {...props}
            value={config.headline}
            onChange={(event) => set({ headline: event.target.value })}
            rows={2}
            placeholder="Happy birthday, Maya"
            className="text-lg font-semibold"
          />
        )}
      </Field>

      <Field label="Below the headline" hint="Optional — one quiet line">
        {(props) => (
          <TextInput
            {...props}
            value={config.subhead}
            onChange={(event) => set({ subhead: event.target.value })}
            placeholder="Twelve years of putting up with me"
          />
        )}
      </Field>
    </EditorSection>
  );
}
