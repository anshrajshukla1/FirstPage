import { z } from "zod";
import { SlideType } from "./index";

/**
 * The shape of `slides.config` for each slide type.
 *
 * <p>Until now every slide type shared one `title` + `content` pair, so a
 * countdown had nowhere to keep its target date and a proposal had nowhere to
 * keep its question. The column is `jsonb` on the server and arrives as
 * untyped JSON, so it is parsed rather than cast — a page written by an older
 * build, or hand-edited in the database, must still render.
 *
 * <p>Optional strings default to `""` rather than `undefined` so every editor
 * can drive a controlled input without a null dance.
 */

const introConfig = z.object({
  /** Small line above the headline — "a letter for", "eight years of". */
  eyebrow: z.string().default(""),
  headline: z.string().default(""),
  subhead: z.string().default(""),
});

/** STORY and CUSTOM keep their prose in `title` + `content`. */
const proseConfig = z.object({});

export const PHOTO_LAYOUTS = ["grid", "stack", "carousel"] as const;
export type PhotoLayout = (typeof PHOTO_LAYOUTS)[number];

const photosConfig = z.object({
  layout: z.enum(PHOTO_LAYOUTS).default("grid"),
});

const videoConfig = z.object({
  url: z.string().default(""),
  /** Optional still shown before playback starts. */
  poster: z.string().default(""),
});

const quoteConfig = z.object({
  quote: z.string().default(""),
  attribution: z.string().default(""),
});

const timelineEntry = z.object({
  label: z.string().default(""),
  /** ISO date, or free text like "that summer" — people don't always know. */
  date: z.string().default(""),
  text: z.string().default(""),
});

const timelineConfig = z.object({
  entries: z.array(timelineEntry).default([]),
});

const countdownConfig = z.object({
  /** ISO datetime the timer counts down to. */
  targetAt: z.string().default(""),
  completedMessage: z.string().default(""),
});

const surpriseConfig = z.object({
  prompt: z.string().default(""),
  revealText: z.string().default(""),
  /** Id of one of the slide's uploaded media items, revealed with the text. */
  revealMediaId: z.string().default(""),
});

const proposalConfig = z.object({
  question: z.string().default(""),
  yesLabel: z.string().default("Yes"),
  noLabel: z.string().default("Not yet"),
  /** Shown after Yes — the moment the whole page exists for. */
  yesResponse: z.string().default(""),
  allowNo: z.boolean().default(true),
});

export const SLIDE_CONFIG_SCHEMAS = {
  [SlideType.INTRO]: introConfig,
  [SlideType.STORY]: proseConfig,
  [SlideType.PHOTOS]: photosConfig,
  [SlideType.VIDEO]: videoConfig,
  [SlideType.QUOTE]: quoteConfig,
  [SlideType.TIMELINE]: timelineConfig,
  [SlideType.COUNTDOWN]: countdownConfig,
  [SlideType.SURPRISE]: surpriseConfig,
  [SlideType.PROPOSAL]: proposalConfig,
  [SlideType.CUSTOM]: proseConfig,
} as const;

export type SlideConfigFor<T extends SlideType> = z.infer<
  (typeof SLIDE_CONFIG_SCHEMAS)[T]
>;

export type IntroConfig = z.infer<typeof introConfig>;
export type PhotosConfig = z.infer<typeof photosConfig>;
export type VideoConfig = z.infer<typeof videoConfig>;
export type QuoteConfig = z.infer<typeof quoteConfig>;
export type TimelineConfig = z.infer<typeof timelineConfig>;
export type TimelineEntry = z.infer<typeof timelineEntry>;
export type CountdownConfig = z.infer<typeof countdownConfig>;
export type SurpriseConfig = z.infer<typeof surpriseConfig>;
export type ProposalConfig = z.infer<typeof proposalConfig>;

/**
 * Reads stored config into the shape the editor and viewer expect, filling
 * defaults for anything absent.
 *
 * <p>Never throws. A slide whose config can't be understood falls back to an
 * empty one, because a recipient seeing a half-built page is better than an
 * error boundary swallowing the whole gift.
 */
export function parseSlideConfig<T extends SlideType>(
  type: T,
  raw: unknown,
): SlideConfigFor<T> {
  const schema = SLIDE_CONFIG_SCHEMAS[type];
  const result = schema.safeParse(raw ?? {});
  return (result.success ? result.data : schema.parse({})) as SlideConfigFor<T>;
}

/** The config a freshly created slide of this type starts with. */
export function defaultSlideConfig<T extends SlideType>(
  type: T,
): SlideConfigFor<T> {
  return SLIDE_CONFIG_SCHEMAS[type].parse({}) as SlideConfigFor<T>;
}
