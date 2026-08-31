import { Category } from "@/types";

export interface CategoryMeta {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

/**
 * Keys mirror `com.firstpage.entity.enums.Category` exactly — all 13 values.
 * Adding a value on the backend without adding it here will fall back to
 * `FALLBACK_CATEGORY_META` at render time.
 */
export const CATEGORY_META: Record<Category, CategoryMeta> = {
  [Category.CRUSH]: {
    label: "Crush",
    icon: "Heart",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    description: "Tell them how you really feel",
  },
  [Category.FRIENDSHIP]: {
    label: "Friendship",
    icon: "Users",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    description: "Celebrate the bond of friendship",
  },
  [Category.APOLOGY]: {
    label: "Apology",
    icon: "HeartHandshake",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description: "Say sorry in a meaningful way",
  },
  [Category.BIRTHDAY]: {
    label: "Birthday",
    icon: "Cake",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    description: "Make their birthday unforgettable",
  },
  [Category.ANNIVERSARY]: {
    label: "Anniversary",
    icon: "CalendarHeart",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    description: "Mark your milestones together",
  },
  [Category.FAREWELL]: {
    label: "Farewell",
    icon: "Plane",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    description: "A goodbye worth remembering",
  },
  [Category.PROPOSAL]: {
    label: "Proposal",
    icon: "Gem",
    color: "text-fuchsia-500",
    bgColor: "bg-fuchsia-500/10",
    description: "Pop the question in style",
  },
  [Category.THANK_YOU]: {
    label: "Thank You",
    icon: "HandHeart",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Show your gratitude beautifully",
  },
  [Category.CONGRATULATIONS]: {
    label: "Congratulations",
    icon: "PartyPopper",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "Cheer their big win",
  },
  [Category.FAMILY]: {
    label: "Family",
    icon: "House",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    description: "For the people who raised you",
  },
  [Category.GRADUATION]: {
    label: "Graduation",
    icon: "GraduationCap",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    description: "Celebrate their achievement",
  },
  [Category.BABY_WELCOME]: {
    label: "Baby Welcome",
    icon: "Baby",
    color: "text-lime-500",
    bgColor: "bg-lime-500/10",
    description: "Welcome the newest arrival",
  },
  [Category.CUSTOM]: {
    label: "Custom",
    icon: "Sparkles",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    description: "Create something entirely your own",
  },
};

export const FALLBACK_CATEGORY_META: CategoryMeta = CATEGORY_META[Category.CUSTOM];

/** Stable display order for pickers. */
export const CATEGORY_LIST: Category[] = Object.keys(CATEGORY_META) as Category[];

export function getCategoryMeta(category: Category | string): CategoryMeta {
  return CATEGORY_META[category as Category] ?? FALLBACK_CATEGORY_META;
}
