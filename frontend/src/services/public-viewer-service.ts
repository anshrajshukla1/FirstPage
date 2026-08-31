import { get, post } from "@/api/client";
import { getVisitorSessionId } from "@/lib/visitor-session";
import type {
  Microsite,
  Reaction,
  ReactionSummary,
  ReactionType,
  Reply,
  TrackVisitRequest,
} from "@/types";

/**
 * Visitor-facing API. Every path lives under `/public/**`, which the backend
 * serves without authentication (see `SecurityConfig`).
 */

const base = (slug: string) => `/public/microsites/${slug}`;

/**
 * Loads a published microsite.
 *
 * For password-protected microsites the backend withholds `slides` and
 * `musicUrl` and returns `isPasswordProtected: true` — call
 * {@link unlockMicrosite} to obtain the content.
 */
export async function getPublicMicrosite(slug: string): Promise<Microsite> {
  return get<Microsite>(base(slug));
}

/** Verifies the password and returns the full microsite (slides included). */
export async function unlockMicrosite(
  slug: string,
  password: string,
): Promise<Microsite> {
  return post<Microsite, { password: string }>(`${base(slug)}/verify-password`, {
    password,
  });
}

export async function addReaction(
  slug: string,
  type: ReactionType,
): Promise<Reaction> {
  return post<Reaction, { type: ReactionType; visitorSessionId: string }>(
    `${base(slug)}/reactions`,
    { type, visitorSessionId: getVisitorSessionId() },
  );
}

export async function getReactionSummary(
  slug: string,
): Promise<ReactionSummary[]> {
  return get<ReactionSummary[]>(`${base(slug)}/reactions/summary`);
}

export async function sendReply(slug: string, message: string): Promise<Reply> {
  return post<Reply, { message: string; visitorSessionId: string }>(
    `${base(slug)}/replies`,
    { message, visitorSessionId: getVisitorSessionId() },
  );
}

/**
 * Tells the sender the recipient answered a proposal.
 *
 * <p>Silent on failure for the same reason the analytics call is: a network
 * hiccup must not turn the answer into an error message on the one page that
 * mattered.
 */
export async function answerProposal(
  slug: string,
  accepted: boolean,
): Promise<void> {
  try {
    await post<void, { accepted: boolean }>(`${base(slug)}/answer`, { accepted });
  } catch {
    // The answer is already on screen; nothing here is recoverable.
  }
}

/** Fire-and-forget analytics heartbeat — failures are intentionally ignored. */
export async function trackVisit(
  slug: string,
  data: TrackVisitRequest,
): Promise<void> {
  try {
    await post<void, TrackVisitRequest>(`${base(slug)}/track`, data);
  } catch {
    // Analytics must never break the viewing experience.
  }
}
