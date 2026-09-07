// ── Enums ──────────────────────────────────────────────────────────────
// NOTE: These are `as const` objects + union types rather than TS `enum`s
// because tsconfig enables `erasableSyntaxOnly`. Values MUST stay in sync
// with the backend enums in `com.firstpage.entity.enums`.

export const Category = {
  CRUSH: "CRUSH",
  FRIENDSHIP: "FRIENDSHIP",
  APOLOGY: "APOLOGY",
  BIRTHDAY: "BIRTHDAY",
  ANNIVERSARY: "ANNIVERSARY",
  FAREWELL: "FAREWELL",
  PROPOSAL: "PROPOSAL",
  THANK_YOU: "THANK_YOU",
  CONGRATULATIONS: "CONGRATULATIONS",
  FAMILY: "FAMILY",
  GRADUATION: "GRADUATION",
  BABY_WELCOME: "BABY_WELCOME",
  CUSTOM: "CUSTOM",
} as const;
export type Category = (typeof Category)[keyof typeof Category];

export const MicrositeStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  SCHEDULED: "SCHEDULED",
  ARCHIVED: "ARCHIVED",
} as const;
export type MicrositeStatus =
  (typeof MicrositeStatus)[keyof typeof MicrositeStatus];

export const SlideType = {
  INTRO: "INTRO",
  STORY: "STORY",
  PHOTOS: "PHOTOS",
  VIDEO: "VIDEO",
  QUOTE: "QUOTE",
  TIMELINE: "TIMELINE",
  COUNTDOWN: "COUNTDOWN",
  SURPRISE: "SURPRISE",
  PROPOSAL: "PROPOSAL",
  CUSTOM: "CUSTOM",
} as const;
export type SlideType = (typeof SlideType)[keyof typeof SlideType];

export const MediaType = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
  VOICE_NOTE: "VOICE_NOTE",
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const ReactionType = {
  HEART: "HEART",
  CRY: "CRY",
  LAUGH: "LAUGH",
  SHOCK: "SHOCK",
  TOUCHED: "TOUCHED",
} as const;
export type ReactionType = (typeof ReactionType)[keyof typeof ReactionType];

export const NotificationType = {
  VIEWED: "VIEWED",
  REACTED: "REACTED",
  REPLIED: "REPLIED",
  ACCEPTED: "ACCEPTED",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const AnimationType = {
  FADE: "FADE",
  SLIDE_UP: "SLIDE_UP",
  SLIDE_LEFT: "SLIDE_LEFT",
  ZOOM: "ZOOM",
  BOUNCE: "BOUNCE",
  TYPEWRITER: "TYPEWRITER",
  PARALLAX: "PARALLAX",
  NONE: "NONE",
} as const;
export type AnimationType = (typeof AnimationType)[keyof typeof AnimationType];

export const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

// ── Core Models ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  role: Role;
  lastLoginAt: string;
  createdAt: string;
}

export interface Media {
  id: string;
  type: MediaType;
  url: string;
  caption: string | null;
  orderIndex: number;
}

export interface Slide {
  id: string;
  orderIndex: number;
  type: SlideType;
  title: string | null;
  content: string | null;
  /**
   * Type-specific settings — a countdown's target date, a proposal's question.
   * Arrives as untyped JSON from a `jsonb` column; read it through
   * `parseSlideConfig` in `@/types/slide-config` rather than casting.
   */
  config: Record<string, unknown>;
  animationType: AnimationType;
  backgroundType: string | null;
  media: Media[];
}

/** How the client should play `musicUrl`. Derived server-side on every read. */
export const MusicProvider = {
  YOUTUBE: "YOUTUBE",
  AUDIO: "AUDIO",
  NONE: "NONE",
} as const;
export type MusicProvider = (typeof MusicProvider)[keyof typeof MusicProvider];

export interface Microsite {
  id: string;
  title: string;
  slug: string;
  recipientName: string;
  category: Category;
  status: MicrositeStatus;
  themeId: string | null;
  isAnonymous: boolean;
  isOneTimeView: boolean;
  hasBeenViewed: boolean;
  isPasswordProtected: boolean;
  musicUrl: string | null;
  /**
   * A YouTube watch URL can't play in an `<audio>` element, so the player is
   * chosen from this rather than guessed from the URL on the client.
   */
  musicProvider: MusicProvider;
  /** YouTube video id, or the direct file URL for `AUDIO`. */
  musicTrackId: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  slides: Slide[];
  slideCount: number;
  viewCount: number;
}

export interface MicrositeListItem {
  id: string;
  title: string;
  slug: string;
  category: Category;
  status: MicrositeStatus;
  isOneTimeView: boolean;
  hasBeenViewed: boolean;
  isPasswordProtected: boolean;
  previewImageUrl: string | null;
  slideCount: number;
  viewCount: number;
  /** Null until a recipient opens it. The sender's actual payoff. */
  lastViewedAt: string | null;
  createdAt: string;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  /** Free-form grouping label from the backend (NOT a `Category`). */
  category: string;
  /** Raw CSS custom-property block, e.g. `--bg:#fff;--fg:#000;`. */
  cssVariables: string;
  previewImageUrl: string | null;
  isPremium: boolean;
}

export interface Reaction {
  id: string;
  type: ReactionType;
  createdAt: string;
}

export interface ReactionSummary {
  type: ReactionType;
  count: number;
}

export interface Reply {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface VisitorAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  avgTimeSpent: number;
  viewsByDevice: Record<string, number>;
  viewsByCountry: Record<string, number>;
  slideAnalytics: SlideAnalytics[];
}

export interface SlideAnalytics {
  slideId: string;
  slideTitle: string | null;
  views: number;
  avgTimeSpent: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  micrositeId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AIGenerateResponse {
  generatedContent: string;
  provider: string;
  promptType: string;
}

// ── API Response Wrapper ──────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/** Mirrors Spring Data's `Page<T>` JSON shape. */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ── Request DTOs ──────────────────────────────────────────────────────

export interface CreateMicrositeRequest {
  title: string;
  recipientName: string;
  category: Category;
  themeId?: string;
  isAnonymous?: boolean;
  isOneTimeView?: boolean;
  musicUrl?: string;
  password?: string;
}

export interface UpdateMicrositeRequest {
  title?: string;
  recipientName?: string;
  themeId?: string;
  isAnonymous?: boolean;
  isOneTimeView?: boolean;
  musicUrl?: string;
  /** Blank clears the password; omitted leaves it unchanged. */
  password?: string;
}

export interface SyncUserRequest {
  firebaseUid: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
}

export interface UpdateProfileRequest {
  displayName?: string;
  photoUrl?: string;
}

export interface CreateSlideRequest {
  type: SlideType;
  title?: string;
  content?: string;
  config?: Record<string, unknown>;
  animationType?: AnimationType;
  backgroundType?: string;
}

export interface UpdateSlideRequest {
  title?: string;
  content?: string;
  /** Merged key-by-key server-side, so a partial update keeps the rest. */
  config?: Record<string, unknown>;
  animationType?: AnimationType;
  backgroundType?: string;
}

export interface VerifyPasswordRequest {
  password: string;
}

export interface TrackVisitRequest {
  currentSlideIndex?: number;
  timeSpentSeconds?: number;
}
