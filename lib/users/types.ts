export const APP_USERS = ["Lucas", "Vanessa"] as const;
export type AppUser = (typeof APP_USERS)[number];
