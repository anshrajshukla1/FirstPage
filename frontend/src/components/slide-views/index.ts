import type { ComponentType } from "react";
import { SlideType } from "@/types";
import type { SlideViewProps } from "./shared";
import { CountdownView } from "./countdown-view";
import { IntroView } from "./intro-view";
import { PhotosView } from "./photos-view";
import { ProposalView } from "./proposal-view";
import { ProseView } from "./prose-view";
import { QuoteView } from "./quote-view";
import { SurpriseView } from "./surprise-view";
import { TimelineView } from "./timeline-view";
import { VideoView } from "./video-view";

/**
 * Every slide type's rendering, in one lookup.
 *
 * <p>The viewer used to render title-plus-prose for all ten types, which is why
 * a countdown showed no timer and a proposal showed no question. A `Record` keyed
 * on `SlideType` makes a missing view a compile error rather than a blank slide.
 */
export const SLIDE_VIEWS: Record<SlideType, ComponentType<SlideViewProps>> = {
  [SlideType.INTRO]: IntroView,
  [SlideType.STORY]: ProseView,
  [SlideType.PHOTOS]: PhotosView,
  [SlideType.VIDEO]: VideoView,
  [SlideType.QUOTE]: QuoteView,
  [SlideType.TIMELINE]: TimelineView,
  [SlideType.COUNTDOWN]: CountdownView,
  [SlideType.SURPRISE]: SurpriseView,
  [SlideType.PROPOSAL]: ProposalView,
  [SlideType.CUSTOM]: ProseView,
};

export type { SlideViewProps } from "./shared";
