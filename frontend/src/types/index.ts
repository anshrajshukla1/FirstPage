// ── Enums ──────────────────────────────────────────────────────────────

export enum Category {
  LOVE = "LOVE",
  FRIENDSHIP = "FRIENDSHIP",
  BIRTHDAY = "BIRTHDAY",
  ANNIVERSARY = "ANNIVERSARY",
  THANK_YOU = "THANK_YOU",
  APOLOGY = "APOLOGY",
  GRADUATION = "GRADUATION",
  WEDDING = "WEDDING",
  OTHER = "OTHER",
}

export enum MicrositeStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  SCHEDULED = "SCHEDULED",
}

export enum SlideType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  GALLERY = "GALLERY",
  VIDEO = "VIDEO",
  QUOTE = "QUOTE",
  LETTER = "LETTER",
  TIMELINE = "TIMELINE",
  COUNTDOWN = "COUNTDOWN",
}

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
}

export enum ReactionType {
  HEART = "HEART",
  LAUGH = "LAUGH",
  CRY = "CRY",
  FIRE = "FIRE",
  CLAP = "CLAP",
  STAR = "STAR",
}

export enum NotificationType {
  VIEW = "VIEW",
  REACTION = "REACTION",
  REPLY = "REPLY",
  SYSTEM = "SYSTEM",
}

export enum AnimationType {
  FADE_IN = "FADE_IN",
  SLIDE_UP = "SLIDE_UP",
  SLIDE_LEFT = "SLIDE_LEFT",
  SLIDE_RIGHT = "SLIDE_RIGHT",
  ZOOM_IN = "ZOOM_IN",
  FLIP = "FLIP",
  BOUNCE = "BOUNCE",
  NONE = "NONE",
}

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

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
  animationType: AnimationType;
  backgroundType: string | null;
  media: Media[];
}

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
  musicUrl: string | null;
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
  previewImageUrl: string | null;
  slideCount: number;
  viewCount: number;
  createdAt: string;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  category: Category;
  cssVariables: Record<string, string>;
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
  slideIndex: number;
  viewCount: number;
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

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
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
  scheduledAt?: string;
}

export interface UpdateMicrositeRequest {
  title?: string;
  recipientName?: string;
  category?: Category;
  themeId?: string;
  isAnonymous?: boolean;
  isOneTimeView?: boolean;
  musicUrl?: string;
  scheduledAt?: string;
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
