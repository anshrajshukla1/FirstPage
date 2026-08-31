import {
  cloneElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  /** Red label, and a separator above it. */
  destructive?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  /** The control that opens the menu. Receives ref, onClick and aria wiring. */
  trigger: ReactElement<{
    ref?: React.Ref<HTMLElement>;
    onClick?: (event: React.MouseEvent) => void;
    "aria-haspopup"?: string;
    "aria-expanded"?: boolean;
    "aria-controls"?: string;
  }>;
  items: MenuItem[];
  /** Which end of the trigger the menu lines up with. */
  align?: "start" | "end";
}

const MENU_WIDTH = 208; // w-52
const GAP = 6;
const VIEWPORT_MARGIN = 8;

/**
 * A menu that renders in a portal and is positioned from the trigger's own
 * bounding box.
 *
 * <p>This is the fix for the clipped dashboard card menu. The card sets
 * `overflow-hidden` because the thumbnail's hover zoom must be cropped to the
 * card, and an absolutely-positioned child is clipped by that no matter its
 * z-index. Portalling to `document.body` leaves the clip in place for the
 * thumbnail while letting the menu extend past the card's edge.
 *
 * <p>Closes on outside click, Esc, scroll and resize — a fixed-position element
 * anchored to a computed rect goes stale the moment the page moves, and a menu
 * floating away from its button looks worse than one that simply closed.
 */
export function DropdownMenu({
  trigger,
  items,
  align = "end",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const reduceMotion = useReducedMotion();

  // Measured before paint so the menu never renders at 0,0 first.
  useLayoutEffect(() => {
    if (!open) return;

    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const left =
      align === "end" ? rect.right - MENU_WIDTH : rect.left;
    const maxLeft = window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN;
    setPosition({
      top: rect.bottom + GAP,
      left: Math.max(VIEWPORT_MARGIN, Math.min(left, maxLeft)),
    });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;

    menuRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

      const options = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ??
          [],
      ).filter((option) => !option.hasAttribute("disabled"));
      if (options.length === 0) return;

      event.preventDefault();
      const index = options.indexOf(document.activeElement as HTMLElement);
      const next =
        event.key === "ArrowDown"
          ? (index + 1) % options.length
          : (index - 1 + options.length) % options.length;
      options[next].focus();
    }

    function close() {
      setOpen(false);
    }

    // `true` on scroll so a scroll inside any nested container is caught, not
    // just the document.
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const triggerElement = cloneElement(trigger, {
    ref: triggerRef,
    onClick: (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      trigger.props.onClick?.(event);
      setOpen((previous) => !previous);
    },
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
  });

  return (
    <>
      {triggerElement}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              id={menuId}
              role="menu"
              className="fixed z-100 w-52 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-xl shadow-slate-900/10"
              style={{ top: position.top, left: position.left }}
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: reduceMotion ? 0 : 0.14 }}
            >
              {items.map((item, index) => (
                <div key={item.label}>
                  {item.destructive && index > 0 && (
                    <div className="my-1 h-px bg-border" />
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      setOpen(false);
                      item.onSelect();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                      item.destructive
                        ? "text-error hover:bg-error/10"
                        : "text-text-primary hover:bg-surface-hover",
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
