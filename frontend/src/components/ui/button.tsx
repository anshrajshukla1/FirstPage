import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * The button styles that were previously copy-pasted at every call site, in one
 * place. Values are taken from the existing dashboard and editor buttons so
 * nothing shifts visually — this is a consolidation, not a redesign.
 */
const buttonStyles = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover",
        secondary:
          "border border-border bg-surface text-text-primary hover:bg-surface-hover",
        ghost: "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
        danger: "bg-error text-white shadow-lg shadow-error/25 hover:bg-error/90",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonStyles> & {
    /** Shows a spinner and blocks input — for actions that hit the network. */
    busy?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  busy = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
