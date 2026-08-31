import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Everything the browser will let a person Tab to. Used for both the initial
 * focus and the Tab cycle, so the two can never disagree.
 */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Actions row pinned to the bottom, outside the scrolling body. */
  footer?: ReactNode;
  /** Extra classes for the panel — usually a width override. */
  className?: string;
  /** Drop the corner ✕ for dialogs that must be answered rather than dismissed. */
  hideCloseButton?: boolean;
}

/**
 * A dialog that renders in a portal on `document.body`.
 *
 * <p>The portal is the point: dialogs used to be impossible inside the
 * dashboard card, whose `overflow-hidden` (needed for the thumbnail's hover
 * zoom) clipped anything layered on top. Escaping the card's stacking and
 * clipping context is what makes an in-page confirmation possible at all.
 *
 * <p>Carries the accessibility floor with it so no call site has to remember:
 * focus moves in on open and returns to the trigger on close, Tab is trapped,
 * Esc closes, the page behind stops scrolling, and the entrance is skipped for
 * anyone who asked for reduced motion.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  hideCloseButton = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const reduceMotion = useReducedMotion();

  // Held in a ref so the focus-management effect depends only on `open`. If it
  // depended on the callback, every parent re-render would tear the effect down
  // and yank focus back to the trigger mid-interaction.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    // React strips `autoFocus` of its browser behaviour inside a portal, so it
    // is honoured here explicitly — otherwise the first control in DOM order
    // always wins and a dialog can't choose its own safe default.
    const preferred =
      panel?.querySelector<HTMLElement>("[autofocus]") ??
      panel?.querySelector<HTMLElement>(FOCUSABLE);
    (preferred ?? panel)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const current = panelRef.current;
      if (!current) return;

      // offsetParent filters out anything hidden — a stale node would send
      // focus somewhere invisible and the trap would look broken.
      const focusable = Array.from(
        current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    // Capture phase, so a dialog opened from within another keyboard handler
    // still sees Escape first.
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={cn(
              "relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl outline-none sm:max-w-md sm:rounded-2xl",
              className,
            )}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
              <div className="min-w-0">
                <h2
                  id={titleId}
                  className="font-display text-lg font-semibold text-text-primary"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id={descriptionId}
                    className="mt-1 text-sm text-text-secondary"
                  >
                    {description}
                  </p>
                )}
              </div>

              {!hideCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="-mt-1 -mr-2 shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {children && (
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
                {children}
              </div>
            )}

            {footer && (
              <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface px-6 py-4 sm:flex-row sm:justify-end">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
