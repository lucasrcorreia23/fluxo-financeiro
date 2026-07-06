import { cn } from "@/lib/utils";

const base =
  "w-full rounded-xl bg-white/5 border border-[var(--color-border)] px-3.5 py-2.5 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] transition-colors focus:border-indigo-400/60 focus:bg-white/[0.07] focus:outline-none";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-xs font-medium text-[var(--color-muted)]",
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  // Default autocomplete off so browser autofill doesn't inject stray digits
  // into money/number fields (callers can still override via props).
  return <input autoComplete="off" data-1p-ignore className={cn(base, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, "resize-none", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(base, "cursor-pointer appearance-none pr-9", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}
