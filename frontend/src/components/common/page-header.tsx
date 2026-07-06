import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  className,
  actions,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
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
      {actions && <div className="mt-3 flex items-center gap-2 md:mt-0">{actions}</div>}
    </div>
  );
}
