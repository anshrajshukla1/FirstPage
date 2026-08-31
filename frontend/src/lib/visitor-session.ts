/**
 * Stable, anonymous identifier for a microsite visitor.
 *
 * The backend uses this to collapse repeat visits into a single "unique
 * visitor" and to attribute reactions/replies. It is a random UUID — no
 * personal data — persisted in localStorage so a reload keeps the same identity.
 */

const STORAGE_KEY = "firstpage:visitor-session";

let cached: string | null = null;

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older/embedded browsers without crypto.randomUUID.
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getVisitorSessionId(): string {
  if (cached) return cached;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      cached = stored;
      return stored;
    }
    const created = createId();
    localStorage.setItem(STORAGE_KEY, created);
    cached = created;
    return created;
  } catch {
    // Private mode / storage blocked — keep a per-tab id in memory so the
    // session is at least stable for the length of the visit.
    cached ??= createId();
    return cached;
  }
}
