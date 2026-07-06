import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { CATEGORY_META } from "@/constants/categories";

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const meta = CATEGORY_META[category];

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
