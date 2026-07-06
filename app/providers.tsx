"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { DataProvider } from "@/lib/data/provider";
import { UserProvider } from "@/lib/users/provider";
import { AppShell } from "@/components/app-shell";
import { Onboarding } from "@/components/onboarding";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      theme={(resolvedTheme as "light" | "dark") ?? "dark"}
      toastOptions={{
        style: {
          borderRadius: "16px",
          backdropFilter: "blur(12px)",
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Auth routes render bare (no sidebar/onboarding), just theme + toasts.
  const bare = pathname === "/login" || pathname.startsWith("/auth");

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {bare ? (
        children
      ) : (
        <UserProvider>
          <DataProvider>
            <AppShell>{children}</AppShell>
            <Onboarding />
          </DataProvider>
        </UserProvider>
      )}
      <ThemedToaster />
    </ThemeProvider>
  );
}
