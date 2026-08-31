import { SlideType } from "@/types";
import { Field, TextInput } from "@/components/ui/field";
import { EditorSection, useDraftConfig, type SlideEditorProps } from "./shared";

/** ISO instant → the `YYYY-MM-DDTHH:mm` a `datetime-local` input expects. */
function toLocalInput(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  // toISOString would shift to UTC and show the wrong wall-clock time.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * A countdown. Only two fields, and neither is prose: the number is the slide,
 * and the message replaces it when the moment arrives.
 */
export function CountdownEditor({ draft, setDraft }: SlideEditorProps) {
  const [config, set] = useDraftConfig(SlideType.COUNTDOWN, draft, setDraft);

  const localValue = toLocalInput(config.targetAt);
  const inPast =
    config.targetAt !== "" && new Date(config.targetAt).getTime() < Date.now();

  return (
    <EditorSection title="Countdown">
      <Field
        label="Counting down to"
        hint={inPast ? undefined : "Their time zone, their clock."}
        error={
          inPast
            ? "That moment has passed — the page will show the message below instead."
            : undefined
        }
      >
        {(props) => (
          <TextInput
            {...props}
            type="datetime-local"
            value={localValue}
            onChange={(event) => {
              const raw = event.target.value;
              if (!raw) {
                set({ targetAt: "" });
                return;
              }
              const parsed = new Date(raw);
              set({
                targetAt: Number.isNaN(parsed.getTime())
                  ? ""
                  : parsed.toISOString(),
              });
            }}
          />
        )}
      </Field>

      <Field
        label="When it reaches zero"
        hint="What replaces the timer at the moment itself."
      >
        {(props) => (
          <TextInput
            {...props}
            value={config.completedMessage}
            onChange={(event) => set({ completedMessage: event.target.value })}
            placeholder="It's today. Happy birthday."
          />
        )}
      </Field>
    </EditorSection>
  );
}
