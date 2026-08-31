import { SlideType } from "@/types";
import { Field, TextInput, Textarea } from "@/components/ui/field";
import {
  EditorSection,
  Toggle,
  useDraftConfig,
  type SlideEditorProps,
} from "./shared";

/** The question, the two buttons, and what happens when they say yes. */
export function ProposalEditor({ draft, setDraft }: SlideEditorProps) {
  const [config, set] = useDraftConfig(SlideType.PROPOSAL, draft, setDraft);

  return (
    <EditorSection
      title="The question"
      hint="This is the largest thing on the page. Ask it in as few words as you can."
    >
      <Field label="Question">
        {(props) => (
          <Textarea
            {...props}
            value={config.question}
            onChange={(event) => set({ question: event.target.value })}
            rows={2}
            placeholder="Will you marry me?"
            className="text-lg font-semibold"
          />
        )}
      </Field>

      <Field label="Anything to add first" hint="Optional — shown under the question">
        {(props) => (
          <Textarea
            {...props}
            value={draft.content}
            onChange={(event) => setDraft({ content: event.target.value })}
            rows={4}
            placeholder="I've been carrying this around for a while."
          />
        )}
      </Field>

      <Field label="Yes button">
        {(props) => (
          <TextInput
            {...props}
            value={config.yesLabel}
            onChange={(event) => set({ yesLabel: event.target.value })}
            placeholder="Yes"
          />
        )}
      </Field>

      <Field label="After they say yes">
        {(props) => (
          <Textarea
            {...props}
            value={config.yesResponse}
            onChange={(event) => set({ yesResponse: event.target.value })}
            rows={3}
            placeholder="Then let's go tell everyone."
          />
        )}
      </Field>

      <Toggle
        label="Show a second button"
        hint="It slips away a few times, then lets itself be pressed."
        checked={config.allowNo}
        onChange={(allowNo) => set({ allowNo })}
      />

      {config.allowNo && (
        <Field label="Second button">
          {(props) => (
            <TextInput
              {...props}
              value={config.noLabel}
              onChange={(event) => set({ noLabel: event.target.value })}
              placeholder="Not yet"
            />
          )}
        </Field>
      )}
    </EditorSection>
  );
}
