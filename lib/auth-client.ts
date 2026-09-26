import { createAuthClient } from "better-auth/react";

const configuredAuthBaseUrl =
  process.env.NEXT_PUBLIC_AUTH_BASE_URL ??
  (process.env.NODE_ENV === "production" ? "https://api.agentui.pro" : "http://localhost:3001");

function parseAuthBaseUrl(value: string) {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    (process.env.NODE_ENV === "production" && url.protocol !== "https:")
  ) {
    throw new Error("NEXT_PUBLIC_AUTH_BASE_URL must be an absolute origin, using HTTPS in production");
  }
  return url.origin;
}

export const AUTH_BASE_URL = parseAuthBaseUrl(configuredAuthBaseUrl);

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
});

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  lastSignInAt: string | null;
  providers: Array<"google" | "github">;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
};

export async function fetchCurrentUser(signal?: AbortSignal): Promise<PublicUser | null> {
  const response = await fetch(`${AUTH_BASE_URL}/api/v1/auth/me`, {
    credentials: "include",
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error("AUTH_UNAVAILABLE");
  const body = (await response.json()) as { user: PublicUser | null };
  return body.user;
}
