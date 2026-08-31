import { Category, SlideType } from "@/types";

/**
 * Starter pages, one per occasion.
 *
 * <p>A new microsite used to open on an empty editor with a blank prose box,
 * which is the single easiest place to abandon the product. Choosing an occasion
 * now produces a page that already reads as a page — four slides with real copy
 * the sender edits down, rather than a cursor blinking in an empty field.
 *
 * <p>The copy is written to be publishable as-is. Nothing says "replace this
 * text", because that is exactly the line that ends up shipped to a recipient.
 */

export interface SlideSeed {
  type: SlideType;
  title?: string;
  content?: string;
  /** Omitted for the prose types, which carry everything in title + content. */
  config?: Record<string, unknown>;
  /** One-line label for the wizard's preview of what will be created. */
  outline: string;
}

/** First name only — a template that greets someone by both names is a form. */
function firstName(recipientName: string): string {
  return recipientName.trim().split(/\s+/)[0] || "you";
}

type TemplateBuilder = (name: string) => SlideSeed[];

const TEMPLATES: Record<Category, TemplateBuilder> = {
  [Category.PROPOSAL]: (name) => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: `For ${name}`,
        headline: "There's something I've been meaning to ask.",
        subhead: "Take your time with this one.",
      },
      outline: "An opening that slows them down",
    },
    {
      type: SlideType.STORY,
      title: "Before the question",
      content:
        "I've been carrying this around for a while, trying to find the right way to say it.\n\nEvery version of the future I can picture has you in it — the ordinary Tuesdays more than the big days. That's how I knew.",
      outline: "Why you're asking",
    },
    {
      type: SlideType.PHOTOS,
      title: "Us, so far",
      config: { layout: "stack" },
      outline: "Photos, loose on a table",
    },
    {
      type: SlideType.PROPOSAL,
      config: {
        question: "Will you marry me?",
        yesLabel: "Yes",
        noLabel: "Ask me again",
        yesResponse:
          "Then it's settled. I'm going to be unbearable about this for weeks.",
        allowNo: true,
      },
      outline: "The question, and the answer",
    },
  ],

  [Category.BIRTHDAY]: (name) => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: "Today only",
        headline: `Happy birthday, ${name}.`,
        subhead: "There's more than this — keep going.",
      },
      outline: "The greeting, set large",
    },
    {
      type: SlideType.STORY,
      title: "A short list of things you did this year",
      content:
        "You moved. You kept the plant alive. You answered the phone the night I needed you to.\n\nThat's a good year, whatever else it felt like from the inside.",
      outline: "Their year, briefly",
    },
    {
      type: SlideType.PHOTOS,
      title: "Evidence",
      config: { layout: "grid" },
      outline: "A grid of photos",
    },
    {
      type: SlideType.SURPRISE,
      config: {
        prompt: "One more thing.",
        revealText:
          "Dinner's on me. Pick the place — anywhere except the one with the loud music.",
      },
      outline: "Something hidden until they tap",
    },
  ],

  [Category.APOLOGY]: (name) => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: `For ${name}`,
        headline: "I got this wrong.",
        subhead: "No excuses on this page.",
      },
      outline: "Opening, without hedging",
    },
    {
      type: SlideType.STORY,
      title: "What happened",
      content:
        "I've had time to think about it, and the version where I'm right doesn't hold up.\n\nI'm sorry — not for how it landed, for what I did.",
      outline: "The apology itself",
    },
    {
      type: SlideType.QUOTE,
      config: {
        quote: "I'd rather fix this than be right about it.",
        attribution: "",
      },
      outline: "One line, set large",
    },
    {
      type: SlideType.STORY,
      title: "If you're willing",
      content:
        "Take whatever time you need. I'll be here when you're ready, and I won't push.",
      outline: "Where it leaves things",
    },
  ],

  [Category.CRUSH]: () => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: "This is for you",
        headline: "I've been meaning to say something.",
        subhead: "",
      },
      outline: "A quiet opening",
    },
    {
      type: SlideType.STORY,
      title: "Here it is",
      content:
        "I like you. Straightforwardly, unhelpfully, and for a while now.\n\nI didn't want to keep sitting on it and calling that being cool about it.",
      outline: "The admission",
    },
    {
      type: SlideType.QUOTE,
      config: { quote: "Coffee? Sometime this week?", attribution: "" },
      outline: "The ask",
    },
    {
      type: SlideType.SURPRISE,
      config: {
        prompt: "One honest thing.",
        revealText: "If the answer's no, I'll be normal about it. Promise.",
      },
      outline: "A hidden line at the end",
    },
  ],

  [Category.ANNIVERSARY]: () => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: "Happy anniversary",
        headline: "Another year of this.",
        subhead: "Same person. Better at it.",
      },
      outline: "The opening line",
    },
    {
      type: SlideType.TIMELINE,
      title: "How we got here",
      config: {
        entries: [
          {
            label: "The first time",
            date: "",
            text: "You were late. I pretended not to mind.",
          },
          {
            label: "The move",
            date: "",
            text: "Two people, one van, and a sofa that didn't fit.",
          },
          {
            label: "Now",
            date: "",
            text: "Still the person I tell things to first.",
          },
        ],
      },
      outline: "Three moments, in order",
    },
    {
      type: SlideType.PHOTOS,
      title: "The archive",
      config: { layout: "stack" },
      outline: "Photos, loose on a table",
    },
    {
      type: SlideType.STORY,
      title: "Next year",
      content: "Same deal. You, me, and whatever it turns out to be.",
      outline: "A short close",
    },
  ],

  [Category.FRIENDSHIP]: (name) => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: "Unsolicited",
        headline: `You're a good friend, ${name}.`,
        subhead: "Someone had to put it in writing.",
      },
      outline: "The premise",
    },
    {
      type: SlideType.STORY,
      title: "Exhibit A",
      content:
        "You showed up when it wasn't convenient. Twice.\n\nI've never forgotten either time, and I've never properly said so.",
      outline: "The specific reason",
    },
    {
      type: SlideType.PHOTOS,
      title: "Receipts",
      config: { layout: "grid" },
      outline: "A grid of photos",
    },
    {
      type: SlideType.QUOTE,
      config: {
        quote: "Anyway — thanks. Don't make it weird.",
        attribution: "",
      },
      outline: "The sign-off",
    },
  ],

  [Category.FAREWELL]: () => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: "Before you go",
        headline: "It's going to be quieter without you.",
        subhead: "",
      },
      outline: "The opening",
    },
    {
      type: SlideType.STORY,
      title: "What you're leaving behind",
      content:
        "Half the things that work around here work because you set them up and never mentioned it.\n\nWe noticed. Late, but we noticed.",
      outline: "What they did here",
    },
    {
      type: SlideType.PHOTOS,
      title: "The last few years",
      config: { layout: "grid" },
      outline: "A grid of photos",
    },
    {
      type: SlideType.QUOTE,
      config: {
        quote: "Go be good somewhere else. Then come back and tell us about it.",
        attribution: "",
      },
      outline: "The send-off",
    },
  ],

  [Category.THANK_YOU]: () => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: "Thank you",
        headline: "You didn't have to.",
        subhead: "You did anyway, and it mattered.",
      },
      outline: "The opening",
    },
    {
      type: SlideType.STORY,
      title: "What it changed",
      content:
        "It would have been a much worse month without you in it.\n\nYou probably think it was a small thing. It wasn't, from where I was standing.",
      outline: "The specifics",
    },
    {
      type: SlideType.QUOTE,
      config: {
        quote: "I owe you one. I'm keeping track.",
        attribution: "",
      },
      outline: "One line, set large",
    },
  ],

  [Category.CONGRATULATIONS]: () => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: "Congratulations",
        headline: "You did it.",
        subhead: "Nobody's surprised except you.",
      },
      outline: "The headline",
    },
    {
      type: SlideType.STORY,
      title: "For the record",
      content:
        "I watched you work for this. It wasn't luck and it wasn't easy.\n\nRemember that the next time you're deciding whether you're any good at this.",
      outline: "Why it wasn't luck",
    },
    {
      type: SlideType.PHOTOS,
      title: "The proof",
      config: { layout: "grid" },
      outline: "A grid of photos",
    },
    {
      type: SlideType.QUOTE,
      config: { quote: "Now go celebrate it properly.", attribution: "" },
      outline: "The sign-off",
    },
  ],

  [Category.FAMILY]: () => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: "From all of us",
        headline: "A page for the family.",
        subhead: "",
      },
      outline: "The opening",
    },
    {
      type: SlideType.STORY,
      title: "Something we say too rarely",
      content:
        "We're not a family that says this out loud, so it's going in writing instead.\n\nThank you for holding the whole thing together, mostly without being asked.",
      outline: "The thing nobody says",
    },
    {
      type: SlideType.PHOTOS,
      title: "The kitchen table",
      config: { layout: "stack" },
      outline: "Photos, loose on a table",
    },
    {
      type: SlideType.QUOTE,
      config: { quote: "Same time next year.", attribution: "" },
      outline: "A short close",
    },
  ],

  [Category.GRADUATION]: (name) => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: "Congratulations",
        headline: `Cap, gown, done — ${name}.`,
        subhead: "",
      },
      outline: "The headline",
    },
    {
      type: SlideType.TIMELINE,
      title: "How it went",
      config: {
        entries: [
          {
            label: "Year one",
            date: "",
            text: "You called home more than you'll admit.",
          },
          {
            label: "The hard term",
            date: "",
            text: "You wanted to stop. You didn't.",
          },
          { label: "Today", date: "", text: "Done, and on your own terms." },
        ],
      },
      outline: "Three moments, in order",
    },
    {
      type: SlideType.STORY,
      title: "What we watched",
      content:
        "Nobody handed you this. You sat down with it, over and over, until it was finished.\n\nThat's the part worth being proud of.",
      outline: "What it took",
    },
    {
      type: SlideType.QUOTE,
      config: {
        quote: "You're ready for more of what's next than you think.",
        attribution: "",
      },
      outline: "The sign-off",
    },
  ],

  [Category.BABY_WELCOME]: (name) => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: "Welcome",
        headline: `Hello, ${name}.`,
        subhead: "You're the newest person here.",
      },
      outline: "The welcome",
    },
    {
      type: SlideType.STORY,
      title: "The day you arrived",
      content:
        "It rained, nobody slept, and the whole thing rearranged itself around you inside an afternoon.\n\nYou were worth every minute of it.",
      outline: "The day itself",
    },
    {
      type: SlideType.PHOTOS,
      title: "First week",
      config: { layout: "carousel" },
      outline: "Photos, one at a time",
    },
    {
      type: SlideType.SURPRISE,
      config: {
        prompt: "For you to read much later.",
        revealText:
          "By the time you can read this you'll have opinions about us. Keep them. We'll still be here.",
      },
      outline: "A letter for later",
    },
  ],

  [Category.CUSTOM]: (name) => [
    {
      type: SlideType.INTRO,
      config: {
        eyebrow: "",
        headline: `Made for ${name}.`,
        subhead: "",
      },
      outline: "An opening",
    },
    {
      type: SlideType.STORY,
      title: "The reason for this",
      content:
        "Some things are easier to write down than to say out loud. This is one of them.",
      outline: "The body text",
    },
    {
      type: SlideType.PHOTOS,
      title: "Pictures",
      config: { layout: "grid" },
      outline: "A grid of photos",
    },
  ],
};

/** The starter slides for an occasion, addressed to this recipient. */
export function templateFor(
  category: Category,
  recipientName: string,
): SlideSeed[] {
  return TEMPLATES[category](firstName(recipientName));
}

/** What the wizard promises before the page is created. */
export function templateOutline(
  category: Category,
  recipientName: string,
): string[] {
  return templateFor(category, recipientName).map((seed) => seed.outline);
}
