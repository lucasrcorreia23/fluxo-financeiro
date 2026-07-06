"use client";

import { ChevronDown, User } from "lucide-react";
import { Select } from "@/components/ui/field";
import { APP_USERS } from "@/lib/users/types";
import { useUser } from "@/lib/users/provider";
import { cn } from "@/lib/utils";

export function UserSwitcher({ className }: { className?: string }) {
  const { ready, currentUser, loggedInUser, setCurrentUser } = useUser();

  if (!ready) {
    return (
      <div
        className={cn(
          "h-10 w-full animate-pulse rounded-xl bg-white/5",
          className,
        )}
      />
    );
  }

  return (
    <div className={cn("relative", className)}>
      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
      <Select
        aria-label="Selecionar usuário"
        value={currentUser}
        onChange={(e) => setCurrentUser(e.target.value as typeof currentUser)}
        className="pl-9 text-sm font-medium"
      >
        {APP_USERS.map((user) => (
          <option key={user} value={user}>
            {user}
            {user === loggedInUser ? " (você)" : ""}
          </option>
        ))}
      </Select>
    </div>
  );
}
