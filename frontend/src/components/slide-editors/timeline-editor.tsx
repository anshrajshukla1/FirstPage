import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { SlideType } from "@/types";
import { Button } from "@/components/ui/button";
import { Field, TextInput, Textarea } from "@/components/ui/field";
import type { TimelineEntry } from "@/types/slide-config";
import { EditorSection, useDraftConfig, type SlideEditorProps } from "./shared";

const EMPTY: TimelineEntry = { label: "", date: "", text: "" };

/**
 * Moments in order. Reordering is buttons rather than drag: the rows contain
 * text inputs, and a drag handle competing with text selection inside them is
 * worse than two arrows.
 */
export function TimelineEditor({ draft, setDraft }: SlideEditorProps) {
  const [config, set] = useDraftConfig(SlideType.TIMELINE, draft, setDraft);
  const entries = config.entries;

  const patch = (index: number, changes: Partial<TimelineEntry>) =>
    set({
      entries: entries.map((entry, i) =>
        i === index ? { ...entry, ...changes } : entry,
      ),
    });

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    set({ entries: next });
  };

  return (
    <EditorSection title="Timeline" hint="Each moment gets a number on the page.">
      <Field label="Title" hint="Optional heading above the timeline">
        {(props) => (
          <TextInput
            {...props}
            value={draft.title}
            onChange={(event) => setDraft({ title: event.target.value })}
            placeholder="How we got here"
          />
        )}
      </Field>

      {entries.length === 0 && (
        <p className="text-sm text-text-muted">
          No moments yet. Start with the one you both bring up most.
        </p>
      )}

      <ol className="flex flex-col gap-4">
        {entries.map((entry, index) => (
          <li
            key={index}
            className="rounded-xl border border-border bg-surface/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">
                Moment {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move moment ${index + 1} earlier`}
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === entries.length - 1}
                  aria-label={`Move moment ${index + 1} later`}
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() =>
                    set({ entries: entries.filter((_, i) => i !== index) })
                  }
                  aria-label={`Remove moment ${index + 1}`}
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-error/10 hover:text-error focus-visible:ring-2 focus-visible:ring-error/30 focus-visible:outline-none"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Field label="What happened">
                {(props) => (
                  <TextInput
                    {...props}
                    value={entry.label}
                    onChange={(event) => patch(index, { label: event.target.value })}
                    placeholder="We met at Rohan's party"
                  />
                )}
              </Field>

              <Field
                label="When"
                hint="A date, or however you remember it — “that summer” works."
              >
                {(props) => (
                  <TextInput
                    {...props}
                    value={entry.date}
                    onChange={(event) => patch(index, { date: event.target.value })}
                    placeholder="2019-08-14"
                  />
                )}
              </Field>

              <Field label="More about it" hint="Optional">
                {(props) => (
                  <Textarea
                    {...props}
                    value={entry.text}
                    onChange={(event) => patch(index, { text: event.target.value })}
                    rows={3}
                    placeholder="You spilled a drink on me and apologised for ten minutes."
                  />
                )}
              </Field>
            </div>
          </li>
        ))}
      </ol>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => set({ entries: [...entries, { ...EMPTY }] })}
        className="self-start"
      >
        <Plus className="h-3.5 w-3.5" />
        Add a moment
      </Button>
    </EditorSection>
  );
}
