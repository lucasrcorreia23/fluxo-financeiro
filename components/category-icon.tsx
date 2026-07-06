import {
  CreditCard,
  HeartPulse,
  Home,
  PartyPopper,
  Repeat,
  Shapes,
  Smartphone,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  home: Home,
  zap: Zap,
  smartphone: Smartphone,
  "heart-pulse": HeartPulse,
  repeat: Repeat,
  "credit-card": CreditCard,
  utensils: Utensils,
  "party-popper": PartyPopper,
  shapes: Shapes,
};

export function CategoryIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = MAP[icon] ?? Shapes;
  return <Icon className={className} strokeWidth={2} aria-hidden />;
}
