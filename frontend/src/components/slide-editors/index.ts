import type { ComponentType, ElementType } from "react";
import {
  Clock,
  Film,
  Gift,
  Heart,
  Image as ImageIcon,
  Milestone,
  Quote,
  Sparkles,
  Type,
  Wand2,
} from "lucide-react";
import { SlideType } from "@/types";
import type { SlideEditorProps } from "./shared";
import { CountdownEditor } from "./countdown-editor";
import { IntroEditor } from "./intro-editor";
import { PhotosEditor } from "./photos-editor";
import { ProposalEditor } from "./proposal-editor";
import { ProseEditor } from "./prose-editor";
import { QuoteEditor } from "./quote-editor";
import { SurpriseEditor } from "./surprise-editor";
import { TimelineEditor } from "./timeline-editor";
import { VideoEditor } from "./video-editor";

interface SlideTypeEntry {
  Editor: ComponentType<SlideEditorProps>;
  label: string;
  /** One line in the "Add a slide" list saying what this type is for. */
  description: string;
  icon: ElementType;
}

/**
 * Every slide type's editor, label and icon in one place.
 *
 * <p>This replaces the single title-plus-prose form that used to serve all ten
 * types — the reason a countdown had no date picker and a photo slide had no
 * uploader.
 */
export const SLIDE_EDITORS: Record<SlideType, SlideTypeEntry> = {
  [SlideType.INTRO]: {
    Editor: IntroEditor,
    label: "Opening",
    description: "How the page starts",
    icon: Sparkles,
  },
  [SlideType.STORY]: {
    Editor: ProseEditor,
    label: "Story",
    description: "Something you want to tell them",
    icon: Type,
  },
  [SlideType.PHOTOS]: {
    Editor: PhotosEditor,
    label: "Photos",
    description: "Pictures, with captions",
    icon: ImageIcon,
  },
  [SlideType.VIDEO]: {
    Editor: VideoEditor,
    label: "Video",
    description: "A clip from a link",
    icon: Film,
  },
  [SlideType.QUOTE]: {
    Editor: QuoteEditor,
    label: "Quote",
    description: "One line, set large",
    icon: Quote,
  },
  [SlideType.TIMELINE]: {
    Editor: TimelineEditor,
    label: "Timeline",
    description: "Moments in the order they happened",
    icon: Milestone,
  },
  [SlideType.COUNTDOWN]: {
    Editor: CountdownEditor,
    label: "Countdown",
    description: "Time left until a moment",
    icon: Clock,
  },
  [SlideType.SURPRISE]: {
    Editor: SurpriseEditor,
    label: "Surprise",
    description: "Hidden until they open it",
    icon: Gift,
  },
  [SlideType.PROPOSAL]: {
    Editor: ProposalEditor,
    label: "The question",
    description: "Ask, and wait for the answer",
    icon: Heart,
  },
  [SlideType.CUSTOM]: {
    Editor: ProseEditor,
    label: "Anything else",
    description: "A title and free text",
    icon: Wand2,
  },
};

/** The order slide types are offered in — roughly how a page reads. */
export const SLIDE_TYPE_ORDER: SlideType[] = [
  SlideType.INTRO,
  SlideType.STORY,
  SlideType.PHOTOS,
  SlideType.QUOTE,
  SlideType.TIMELINE,
  SlideType.VIDEO,
  SlideType.COUNTDOWN,
  SlideType.SURPRISE,
  SlideType.PROPOSAL,
  SlideType.CUSTOM,
];

export type { SlideDraft, SlideEditorProps } from "./shared";
