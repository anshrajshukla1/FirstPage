import { Field, TextInput, Textarea } from "@/components/ui/field";
import { AIAssistant, EditorSection, type SlideEditorProps } from "./shared";

/** STORY and CUSTOM: a title and the message. The only editor with the AI draft. */
export function ProseEditor({ slide, draft, setDraft }: SlideEditorProps) {
  return (
    <>
      <EditorSection title="The message">
        <Field label="Title" hint="Optional — leave it out for a page of pure text">
          {(props) => (
            <TextInput
              {...props}
              value={draft.title}
              onChange={(event) => setDraft({ title: event.target.value })}
              placeholder="How we met"
              className="text-lg font-semibold"
            />
          )}
        </Field>

        <Field label="Text" hint="Leave a blank line between paragraphs.">
          {(props) => (
            <Textarea
              {...props}
              value={draft.content}
              onChange={(event) => setDraft({ content: event.target.value })}
              rows={12}
              placeholder="Write it the way you'd say it out loud."
            />
          )}
        </Field>
      </EditorSection>

      <AIAssistant
        slideType={slide.type}
        title={draft.title}
        onGenerated={(text) => setDraft({ content: text })}
      />
    </>
  );
}
