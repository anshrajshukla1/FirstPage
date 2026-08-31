import { useEffect, useState } from "react";
import { KeyRound, Loader2, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Field, TextInput } from "./ui/field";
import { useMicrosite, useUpdateMicrosite } from "@/hooks/use-microsites";
import { describeMusicProvider, parseMusicUrl } from "@/lib/media-url";
import type { UpdateMicrositeRequest } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Settings for a page that already exists.
 *
 * <p>Everything here was collected once by the create wizard and then locked
 * away: there was no way to add a password to a page already sent, take one off,
 * change the music, or fix a misspelled recipient name. The endpoint and the
 * mutation hook both existed and nothing called them.
 *
 * <p>Only changed fields are sent. The update treats an omitted field as "leave
 * it alone", which is also what makes removing a password expressible — a blank
 * string clears it, and `undefined` means untouched.
 */

interface MicrositeSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Empty while no page is selected, which leaves the query idle. */
  micrositeId: string;
}

/** A labelled on/off row. Local because only this dialog needs one. */
function Toggle({
  label,
  hint,
  checked,
  onChange,
  icon,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-surface">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
          {icon}
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-text-muted">{hint}</span>
      </span>
    </label>
  );
}

export function MicrositeSettingsDialog({
  open,
  onClose,
  micrositeId,
}: MicrositeSettingsDialogProps) {
  // The editor already holds this query, so opening the dialog there is a cache
  // hit rather than a second fetch. Idle until a page is actually selected.
  const { data: microsite, isLoading } = useMicrosite(micrositeId || undefined);
  const updateMutation = useUpdateMicrosite(micrositeId);

  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isOneTimeView, setIsOneTimeView] = useState(false);
  /** Separate from the value: a protected page shows no password to edit. */
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reseeded each time it opens, so a cancelled edit doesn't persist in the
  // form and reappear on the next open.
  useEffect(() => {
    if (!open || !microsite) return;
    setTitle(microsite.title);
    setRecipientName(microsite.recipientName ?? "");
    setMusicUrl(microsite.musicUrl ?? "");
    setIsAnonymous(microsite.isAnonymous);
    setIsOneTimeView(microsite.isOneTimeView);
    setRequirePassword(microsite.isPasswordProtected);
    setPassword("");
    setError(null);
  }, [open, microsite]);

  const music = parseMusicUrl(musicUrl);
  const musicUnreadable = musicUrl.trim().length > 0 && music.provider === "NONE";

  const handleSave = async () => {
    if (!microsite) return;

    if (!title.trim()) {
      setError("A title is required.");
      return;
    }
    // Asking for a password on a page that has never had one, without giving
    // one, would silently leave the page open.
    if (requirePassword && !microsite.isPasswordProtected && !password) {
      setError("Enter a password, or turn the requirement off.");
      return;
    }
    if (musicUnreadable) {
      setError("That music link isn't a YouTube or audio URL.");
      return;
    }
    setError(null);

    const changes: UpdateMicrositeRequest = {};
    if (title.trim() !== microsite.title) changes.title = title.trim();
    if (recipientName.trim() !== (microsite.recipientName ?? "")) {
      changes.recipientName = recipientName.trim();
    }
    if (musicUrl.trim() !== (microsite.musicUrl ?? "")) {
      changes.musicUrl = musicUrl.trim();
    }
    if (isAnonymous !== microsite.isAnonymous) changes.isAnonymous = isAnonymous;
    if (isOneTimeView !== microsite.isOneTimeView) {
      changes.isOneTimeView = isOneTimeView;
    }

    if (!requirePassword && microsite.isPasswordProtected) {
      // Blank is the documented way to clear it.
      changes.password = "";
    } else if (requirePassword && password) {
      changes.password = password;
    }

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updateMutation.mutateAsync(changes);
      toast.success("Settings saved");
      onClose();
    } catch {
      // The mutation surfaces the API's own message; keep the dialog open so
      // nothing typed is lost.
      setError("Couldn't save those settings. Try again.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Page settings"
      description="Change these any time — even after the page has been sent."
      className="max-w-lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || isLoading || !microsite}
          >
            {updateMutation.isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            Save changes
          </Button>
        </>
      }
    >
      {isLoading || !microsite ? (
        <div className="flex items-center justify-center py-10 text-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label="Title" hint="Only you see this — it names the page in your dashboard.">
            {(props) => (
              <TextInput
                {...props}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="For Priya"
              />
            )}
          </Field>

          <Field label="Recipient's name" hint="Shown on the sealed page before they open it.">
            {(props) => (
              <TextInput
                {...props}
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Priya"
              />
            )}
          </Field>

          <Field
            label="Background music"
            hint={
              music.provider !== "NONE"
                ? `Detected: ${describeMusicProvider(music.provider)}`
                : "A YouTube link or a direct audio file URL. Leave empty for silence."
            }
            error={musicUnreadable ? "Not a YouTube or audio link." : undefined}
          >
            {(props) => (
              <TextInput
                {...props}
                value={musicUrl}
                onChange={(e) => setMusicUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            )}
          </Field>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Privacy
            </p>

            <Toggle
              icon={<KeyRound className="h-3.5 w-3.5" />}
              label="Require a password"
              hint={
                microsite.isPasswordProtected
                  ? "This page is protected. Turn this off to remove the password."
                  : "Anyone with the link can open the page unless you set one."
              }
              checked={requirePassword}
              onChange={(next) => {
                setRequirePassword(next);
                if (!next) setPassword("");
              }}
            />

            {requirePassword && (
              <div className="pl-3">
                <Field
                  label="Password"
                  hint={
                    microsite.isPasswordProtected
                      ? "Leave blank to keep the current password."
                      : "The recipient needs this to open the page."
                  }
                >
                  {(props) => (
                    <TextInput
                      {...props}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder={
                        microsite.isPasswordProtected ? "••••••••" : "Set a password"
                      }
                    />
                  )}
                </Field>
              </div>
            )}

            <Toggle
              icon={<UserRound className="h-3.5 w-3.5" />}
              label="Send anonymously"
              hint="The page says it was left by someone, and never names you."
              checked={isAnonymous}
              onChange={setIsAnonymous}
            />

            <Toggle
              label="Open once, then close"
              hint="The page stops working after it has been read a single time."
              checked={isOneTimeView}
              onChange={setIsOneTimeView}
            />
          </div>

          {error && (
            <p
              role="alert"
              className={cn(
                "rounded-xl border border-error/30 bg-error/5 px-3 py-2 text-xs text-error",
              )}
            >
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
