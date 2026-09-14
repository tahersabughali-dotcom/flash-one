export type PlatformRole = "member" | "admin";

export const AUTH_PATHS = {
  login: "/login",
  register: "/register",
  app: "/app",
  admin: "/admin",
} as const;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;
export const MAX_NAME_LENGTH = 120;
