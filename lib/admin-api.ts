import { AUTH_BASE_URL, type ApiError } from "@/lib/auth-client";

export type AdminSession = {
  email: string;
  expiresAt: string;
};

export type AdminUserSummary = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string | null;
  providers: Array<"google" | "github">;
};

export type AdminUsersPage = {
  items: AdminUserSummary[];
  nextCursor: string | null;
  total: number;
};

export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${AUTH_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    credentials: "include",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    let body: ApiError | undefined;
    try {
      body = (await response.json()) as ApiError;
    } catch {
      body = undefined;
    }
    throw new AdminApiError(
      response.status,
      body?.error.code ?? "SERVICE_UNAVAILABLE",
      body?.error.message ?? "The admin service is unavailable.",
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function createAdminSession(email: string, password: string) {
  const body = await adminRequest<{ admin: AdminSession }>("/api/v1/admin/session", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return body.admin;
}

export async function getAdminSession() {
  const body = await adminRequest<{ admin: AdminSession }>("/api/v1/admin/session");
  return body.admin;
}

export async function deleteAdminSession() {
  await adminRequest<void>("/api/v1/admin/session", { method: "DELETE" });
}

export async function getAdminUsers(options: {
  cursor?: string | null;
  provider?: "google" | "github" | "all";
  query?: string;
}) {
  const params = new URLSearchParams({ limit: "25" });
  if (options.cursor) params.set("cursor", options.cursor);
  if (options.provider && options.provider !== "all") params.set("provider", options.provider);
  if (options.query) params.set("query", options.query);
  return adminRequest<AdminUsersPage>(`/api/v1/admin/users?${params}`);
}
