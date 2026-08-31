import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { getCategoryMeta } from "@/constants/categories";

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  // Falls back rather than crashing if the backend adds a category first.
  const meta = getCategoryMeta(category);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        meta.bgColor,
        meta.color,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
