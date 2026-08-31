import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const CONTROL_BASE =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

interface FieldProps {
  label: string;
  /** One line under the control saying what to put in it, not selling it. */
  hint?: string;
  error?: string;
  /** Renders the label for screen readers only — for self-evident controls. */
  srOnlyLabel?: boolean;
  className?: string;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
  }) => ReactNode;
}

/**
 * Label, control, hint and error in the arrangement the per-type slide editors
 * need, with the id and `aria-describedby` wiring done once here instead of at
 * each of the ten call sites.
 */
export function Field({
  label,
  hint,
  error,
  srOnlyLabel = false,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  // Error wins: when both are present, pointing at the hint as well buries the
  // thing that actually needs fixing.
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className={cn(
          "text-sm font-medium text-text-primary",
          srOnlyLabel && "sr-only",
        )}
      >
        {label}
      </label>

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}

      {error ? (
        <p id={errorId} className="text-xs text-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-xs text-text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: ComponentProps<"input">) {
  return <input className={cn(CONTROL_BASE, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea className={cn(CONTROL_BASE, "resize-y", className)} {...props} />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(CONTROL_BASE, "cursor-pointer", className)} {...props} />
  );
}
