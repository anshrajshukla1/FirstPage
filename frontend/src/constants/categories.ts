import { Category } from "@/types";

export interface CategoryMeta {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  [Category.LOVE]: {
    label: "Love",
    icon: "Heart",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    description: "Express your love with a personal touch",
  },
  [Category.FRIENDSHIP]: {
    label: "Friendship",
    icon: "Users",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    description: "Celebrate the bond of friendship",
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
  [Category.THANK_YOU]: {
    label: "Thank You",
    icon: "HandHeart",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Show your gratitude beautifully",
  },
  [Category.APOLOGY]: {
    label: "Apology",
    icon: "HeartHandshake",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description: "Say sorry in a meaningful way",
  },
  [Category.GRADUATION]: {
    label: "Graduation",
    icon: "GraduationCap",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    description: "Celebrate their achievement",
  },
  [Category.WEDDING]: {
    label: "Wedding",
    icon: "Gem",
    color: "text-fuchsia-500",
    bgColor: "bg-fuchsia-500/10",
    description: "A gift for the special day",
  },
  [Category.OTHER]: {
    label: "Other",
    icon: "Sparkles",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    description: "Create something unique",
  },
};
