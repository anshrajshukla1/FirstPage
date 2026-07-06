import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeMap = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-12 w-12",
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-3xl",
};

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25",
          sizeMap[size],
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[60%] w-[60%]"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h6v6H4z" className="text-white" />
          <path d="M14 4h6v6h-6z" className="text-white/70" />
          <path d="M4 14h6v6H4z" className="text-white/70" />
          <path d="M14 14h6v6h-6z" className="text-white/40" />
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            "font-display font-bold tracking-tight text-text-primary",
            textSizeMap[size],
          )}
        >
          First
          <span className="text-gradient">Page</span>
        </span>
      )}
    </div>
  );
}
