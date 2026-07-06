import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--color-border)] px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-indigo-300">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-[var(--color-muted)]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
