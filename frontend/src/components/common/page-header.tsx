import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  actions?: React.ReactNode;
  /** When set, renders a back link above the title. */
  backTo?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  subtitle,
  className,
  actions,
  backTo,
  backLabel = "Back",
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {backTo && (
        <Link
          to={backTo}
          className="mb-2 inline-flex w-fit items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary md:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="mt-3 flex items-center gap-2 md:mt-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
