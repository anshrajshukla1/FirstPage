import { cn } from "@/lib/utils";
import { MicrositeStatus } from "@/types";

interface StatusBadgeProps {
  status: MicrositeStatus;
  className?: string;
}

const statusConfig: Record<
  MicrositeStatus,
  { label: string; className: string }
> = {
  [MicrositeStatus.DRAFT]: {
    label: "Draft",
    className: "bg-slate-500/10 text-slate-500",
  },
  [MicrositeStatus.PUBLISHED]: {
    label: "Published",
    className: "bg-emerald-500/10 text-emerald-500",
  },
  [MicrositeStatus.ARCHIVED]: {
    label: "Archived",
    className: "bg-amber-500/10 text-amber-500",
  },
  [MicrositeStatus.SCHEDULED]: {
    label: "Scheduled",
    className: "bg-sky-500/10 text-sky-500",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
