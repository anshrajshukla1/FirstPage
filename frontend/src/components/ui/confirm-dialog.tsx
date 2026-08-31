import { Modal } from "./modal";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button, and Cancel takes the initial focus. */
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Replaces `window.confirm`, which broke the illusion twice — it renders a
 * chrome-styled alert bearing the origin, outside the product's voice, and
 * can't say "Delete" on the button.
 *
 * <p>On a destructive action the safe choice takes focus, so Enter on a dialog
 * you didn't read cancels rather than deletes. Modal renders the buttons in
 * DOM order Cancel → Confirm and reverses them visually on mobile
 * (`flex-col-reverse`), which keeps that focus order intact.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      hideCloseButton
      className="sm:max-w-sm"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={busy}
            autoFocus={destructive}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            busy={busy}
            autoFocus={!destructive}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
