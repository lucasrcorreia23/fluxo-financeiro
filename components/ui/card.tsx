import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass rounded-3xl p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-[var(--color-muted)]">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
