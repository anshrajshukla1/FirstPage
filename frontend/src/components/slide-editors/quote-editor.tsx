import { SlideType } from "@/types";
import { Field, TextInput, Textarea } from "@/components/ui/field";
import { EditorSection, useDraftConfig, type SlideEditorProps } from "./shared";

/** A quote card. No title, no prose — the quote is the whole slide. */
export function QuoteEditor({ draft, setDraft }: SlideEditorProps) {
  const [config, set] = useDraftConfig(SlideType.QUOTE, draft, setDraft);

  return (
    <EditorSection
      title="Quote"
      hint="Set large on its own page, so keep it to a line or two."
    >
      <Field label="Quote">
        {(props) => (
          <Textarea
            {...props}
            value={config.quote}
            onChange={(event) => set({ quote: event.target.value })}
            rows={4}
            placeholder="You are the best thing that's ever happened to me."
            className="text-lg"
          />
        )}
      </Field>

      <Field label="Who said it" hint="Optional — a name, a film, or you">
        {(props) => (
          <TextInput
            {...props}
            value={config.attribution}
            onChange={(event) => set({ attribution: event.target.value })}
            placeholder="Dad, every single birthday"
          />
        )}
      </Field>
    </EditorSection>
  );
}
