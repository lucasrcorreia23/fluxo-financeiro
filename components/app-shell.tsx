"use client";

import { motion } from "framer-motion";
import {
  Heart,
  LayoutDashboard,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { UserSwitcher } from "./user-switcher";
import { AccountButton } from "./auth/account-button";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/gastos", label: "Gastos", icon: Wallet },
  { href: "/desejos", label: "Desejos", icon: Heart },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/insights", label: "Insights", icon: TrendingUp },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Brand() {
  return (
    <Link href="/" className="px-2 text-lg font-semibold tracking-tight">
      Fluxo
    </Link>
  );
}

function TopBar({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <Brand />
      <ThemeToggle />
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-2 border-r border-[var(--color-border)] bg-[var(--color-surface)]/40 px-4 py-6 backdrop-blur-xl lg:flex">
      <TopBar />
      <nav className="mt-6 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "text-white"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/25"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-3 px-2">
        <div>
          <span className="mb-2 block text-xs text-[var(--color-muted)]">Usuário</span>
          <UserSwitcher />
        </div>
        <AccountButton />
      </div>
    </aside>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center gap-1 py-1"
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-xl transition-colors",
                  active
                    ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/25"
                    : "text-[var(--color-muted)]",
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-[var(--color-foreground)]" : "text-[var(--color-muted)]",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-full">
      <Sidebar pathname={pathname} />
      {/* mobile top bar */}
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-background)]/70 px-4 py-3 backdrop-blur-xl lg:hidden">
        <TopBar />
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <span className="mb-2 block text-xs text-[var(--color-muted)]">Usuário</span>
            <UserSwitcher />
          </div>
          <AccountButton />
        </div>
      </header>
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12">
          {children}
        </div>
      </main>
      <BottomNav pathname={pathname} />
    </div>
  );
}
