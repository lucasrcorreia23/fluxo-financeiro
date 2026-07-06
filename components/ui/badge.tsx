import { cn } from "@/lib/utils";

type Tone = "neutral" | "green" | "amber" | "red" | "indigo" | "fuchsia";

const TONES: Record<Tone, string> = {
  neutral: "bg-white/5 text-[var(--color-muted)] border-[var(--color-border)]",
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  fuchsia: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  pulse,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TONES[tone],
        pulse && "animate-[pulse-ring_2s_cubic-bezier(0.4,0,0.6,1)_infinite]",
        className,
      )}
    >
      {children}
    </span>
  );
}
