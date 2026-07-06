export const APP_USERS = ["Lucas", "Vanessa"] as const;
export type AppUser = (typeof APP_USERS)[number];

/** Qual pessoa (member) cada conta do Supabase representa. */
export const MEMBER_BY_EMAIL: Record<string, AppUser> = {
  "lucasr.rc72@gmail.com": "Lucas",
  "vanessa.serafimw@gmail.com": "Vanessa",
};

/** Resolve a pessoa a partir do email logado; cai em "Lucas" se desconhecido. */
export function memberFromEmail(email: string | null | undefined): AppUser {
  if (!email) return "Lucas";
  return MEMBER_BY_EMAIL[email.trim().toLowerCase()] ?? "Lucas";
}
