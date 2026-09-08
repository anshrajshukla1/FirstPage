import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, QrCode } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "./modal";
import { Button } from "./button";

/**
 * Returns the base URL for shareable microsite links.
 * Uses VITE_APP_URL (the frontend URL) so shared links always point to
 * the Vercel deployment, not the Render backend.
 */
function shareOrigin(): string {
  const appUrl = import.meta.env.VITE_APP_URL;
  if (appUrl) return appUrl.replace(/\/+$/, "");
  // Fallback: current page origin (works in local dev automatically)
  return window.location.origin;
}

export function buildShareUrl(slug: string): string {
  return `${shareOrigin()}/s/${slug}`;
}

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  slug: string;
  /** Shown above the link so the sender can confirm they're sharing the right page. */
  title: string;
}

/**
 * Hands the sender a link to paste and a QR to point a phone at — the two ways
 * this gets delivered in practice. Deliberately not the native share sheet: on
 * desktop it doesn't exist, and copying is what people do anyway.
 */
export function ShareSheet({ open, onClose, slug, title }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const url = buildShareUrl(slug);

  // Reset per opening, so a re-share doesn't start out claiming "Copied".
  useEffect(() => {
    if (open) {
      setCopied(false);
      setShowQr(false);
    }
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard access is refused on insecure origins and in some webviews.
      toast.error("Couldn't copy. Select the link and copy it manually.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share this page"
      description={`Anyone with the link can open “${title}”.`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={url}
            aria-label="Shareable link"
            onFocus={(event) => event.currentTarget.select()}
            className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 font-mono text-xs text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
          <Button onClick={handleCopy} className="w-28">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>

        {showQr ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-white p-5">
            <QRCodeCanvas
              value={url}
              size={168}
              // Generous margin: scanners need the quiet zone to lock on.
              marginSize={2}
              level="M"
              title={`QR code for ${title}`}
            />
            <p className="text-xs text-slate-500">Point a phone camera at this</p>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setShowQr(true)}>
            <QrCode className="h-4 w-4" />
            Show QR code
          </Button>
        )}
      </div>
    </Modal>
  );
}
