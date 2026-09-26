"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  LoaderCircle,
  LogOut,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ActionSwapCascadeIcon } from "@/components/motion/action-swap-cascade";
import { Button } from "@/components/motion/button";
import { Input } from "@/components/motion/input";
import { SPRING_LAYOUT } from "@/lib/ease";
import {
  AdminApiError,
  type AdminSession,
  type AdminUserSummary,
  deleteAdminSession,
  getAdminSession,
  getAdminUsers,
} from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "ready" | "unavailable";
type SessionState = "checking" | "ready" | "unavailable";
type Provider = "all" | "google" | "github";

const PAGE_SIZE = 25;
const LOADING_ROWS = ["one", "two", "three"] as const;
const PROVIDERS: Array<{ value: Provider; label: string }> = [
  { value: "all", label: "All users" },
  { value: "google", label: "Google" },
  { value: "github", label: "GitHub" },
];

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function initials(name: string, email: string) {
  const source = name.trim() || email;
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ProviderBadge({ provider }: { provider: "google" | "github" }) {
  return (
    <span className="inline-flex h-6 items-center rounded-md border border-border bg-background px-2 text-[11px] font-medium capitalize text-muted-foreground">
      {provider}
    </span>
  );
}

function UserAvatar({ user, size = 40 }: { user: AdminUserSummary; size?: 40 | 44 }) {
  if (user.image) {
    return (
      <Image
        src={user.image}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className="shrink-0 rounded-full bg-muted object-cover"
      />
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initials(user.name, user.email)}
    </span>
  );
}

function CopyEmailButton({
  email,
  copied,
  onCopy,
}: {
  email: string;
  copied: boolean;
  onCopy: (email: string) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      pressScale={0.88}
      onClick={() => onCopy(email)}
      aria-label={copied ? `${email} copied` : `Copy ${email}`}
      title={copied ? "Copied" : "Copy email"}
      className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
    >
      <ActionSwapCascadeIcon value={copied ? "copied" : "copy"} className="size-4">
        {copied ? (
          <Check className="size-4 text-(--color-success)" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
      </ActionSwapCascadeIcon>
    </Button>
  );
}

function ProviderFilter({
  value,
  onChange,
}: {
  value: Provider;
  onChange: (value: Provider) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <fieldset className="inline-flex min-w-0 max-w-full self-start items-center gap-0.5 overflow-x-auto rounded-xl border border-border bg-muted/50 p-1">
      <legend className="sr-only">Filter by provider</legend>
      {PROVIDERS.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.value)}
            className="relative isolate inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-3 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {active ? (
              <motion.span
                layoutId="admin-provider-indicator"
                initial={false}
                transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
                className="absolute inset-0 rounded-lg border border-border-strong bg-background shadow-sm"
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}

function DirectoryLoading() {
  return (
    <div role="status" aria-label="Loading users" className="divide-y divide-border">
      {LOADING_ROWS.map((row) => (
        <div key={row} className="flex h-[76px] items-center gap-3 px-5">
          <div className="size-10 shrink-0 rounded-full bg-muted motion-safe:animate-pulse" />
          <div className="grid gap-2">
            <div className="h-3 w-32 rounded bg-muted motion-safe:animate-pulse" />
            <div className="h-2.5 w-48 max-w-[55vw] rounded bg-muted motion-safe:animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<Provider>("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([]);
  const [copyFeedback, setCopyFeedback] = useState<"copied" | "error" | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const sessionRequest = useRef(0);
  const usersRequest = useRef(0);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkSession = useCallback(async () => {
    const request = ++sessionRequest.current;
    setSessionState("checking");
    try {
      const session = await getAdminSession();
      if (request !== sessionRequest.current) return;
      setAdmin(session);
      setSessionState("ready");
    } catch (error) {
      if (request !== sessionRequest.current) return;
      if (error instanceof AdminApiError && error.status === 401) {
        router.replace("/admin/sign-in");
        return;
      }
      setSessionState("unavailable");
    }
  }, [router]);

  const loadUsers = useCallback(
    async (pageCursor: string | null) => {
      const request = ++usersRequest.current;
      setState("loading");
      try {
        const page = await getAdminUsers({
          cursor: pageCursor,
          provider,
          query,
        });
        if (request !== usersRequest.current) return;
        setUsers(page.items);
        setTotal(page.total);
        setNextCursor(page.nextCursor);
        setHasLoaded(true);
        setState("ready");
      } catch (error) {
        if (request !== usersRequest.current) return;
        if (error instanceof AdminApiError && error.status === 401) {
          router.replace("/admin/sign-in");
          return;
        }
        setState("unavailable");
      }
    },
    [provider, query, router],
  );

  useEffect(() => {
    void checkSession();
    return () => {
      sessionRequest.current += 1;
      usersRequest.current += 1;
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, [checkSession]);

  useEffect(() => {
    if (!admin) return;
    void loadUsers(cursor);
    return () => {
      usersRequest.current += 1;
    };
  }, [admin, cursor, loadUsers]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = queryDraft.trim();
    setCursor(null);
    setCursorHistory([]);
    if (next === query && cursor === null) void loadUsers(null);
    else setQuery(next);
  };

  const changeProvider = (next: Provider) => {
    if (next === provider) return;
    setProvider(next);
    setCursor(null);
    setCursorHistory([]);
  };

  const clearFilters = () => {
    setQueryDraft("");
    setQuery("");
    setProvider("all");
    setCursor(null);
    setCursorHistory([]);
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setCopyFeedback("copied");
    } catch {
      setCopiedEmail(null);
      setCopyFeedback("error");
    }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => {
      setCopiedEmail(null);
      setCopyFeedback(null);
    }, 1800);
  };

  const nextPage = () => {
    if (!nextCursor || state !== "ready") return;
    setCursorHistory((history) => [...history, cursor]);
    setCursor(nextCursor);
  };

  const previousPage = () => {
    if (cursorHistory.length === 0 || state !== "ready") return;
    const previous = cursorHistory.at(-1) ?? null;
    setCursorHistory((history) => history.slice(0, -1));
    setCursor(previous);
  };

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(null);
    try {
      await deleteAdminSession();
      usersRequest.current += 1;
      sessionRequest.current += 1;
      router.replace("/admin/sign-in");
    } catch {
      setSignOutError("Could not sign out. Check your connection and try again.");
      setSigningOut(false);
    }
  };

  if (sessionState !== "ready") {
    return (
      <div className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Users</h1>
        <div className="mt-10 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-border px-6 text-center">
          {sessionState === "checking" ? (
            <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" />
              Checking admin session
            </div>
          ) : (
            <>
              <AlertCircle className="size-5 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold text-foreground">Admin service unavailable</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Your session could not be checked. Try again when the service responds.
              </p>
              <Button size="sm" onClick={() => void checkSession()} className="mt-5">
                Retry
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  const filtered = query !== "" || provider !== "all";
  const showRows = users.length > 0;
  const loadingRows = state === "loading" && (!hasLoaded || !showRows);
  const unavailableWithoutRows = state === "unavailable" && !showRows;
  const firstItem = cursorHistory.length * PAGE_SIZE + 1;
  const lastItem = cursorHistory.length * PAGE_SIZE + users.length;

  return (
    <div className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-5xl px-4 py-10 sm:px-6 lg:py-12">
      <header className="flex flex-col gap-6 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">Users</h1>
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-muted px-2 text-xs font-semibold tabular-nums text-foreground">
              {hasLoaded ? total : "—"}
              {hasLoaded ? (
                <span className="sr-only">{total === 1 ? " registered user" : " registered users"}</span>
              ) : null}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            A private directory of Google and GitHub sign-ins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex min-w-0 items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="max-w-48 truncate" title={admin?.email}>{admin?.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={signingOut}
            onClick={() => void signOut()}
            className="h-9 gap-2"
          >
            {signingOut ? (
              <LoaderCircle className="size-3.5 motion-safe:animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="size-3.5" aria-hidden="true" />
            )}
            {signingOut ? "Signing out" : "Sign out"}
          </Button>
        </div>
      </header>

      {signOutError ? (
        <p role="alert" className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {signOutError}
        </p>
      ) : null}

      <section aria-label="User directory" className="pt-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="border-b border-border px-4 py-5 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Directory</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Find an account, verify its provider, or copy its email.
                </p>
              </div>
              {state === "loading" && hasLoaded ? (
                <span role="status" className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <LoaderCircle className="size-3.5 motion-safe:animate-spin" aria-hidden="true" />
                  Updating
                </span>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <form onSubmit={submitSearch} className="flex min-w-0 flex-1 items-center gap-2 lg:max-w-md">
                <Input
                  label="Search users"
                  type="search"
                  value={queryDraft}
                  onChange={setQueryDraft}
                  placeholder="Name or email"
                  leftIcon={<Search aria-hidden="true" />}
                  className="min-w-0 flex-1"
                  classNames={{
                    label: "sr-only",
                    field: "h-10 rounded-xl bg-background",
                    input: "text-base sm:text-sm",
                  }}
                />
                <Button type="submit" size="sm" className="h-10 shrink-0 rounded-xl px-4">
                  Search
                </Button>
              </form>
              <ProviderFilter value={provider} onChange={changeProvider} />
            </div>
          </div>

          {state === "unavailable" && showRows ? (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-3 text-xs text-foreground">
              <span>Could not update. Showing the last loaded results.</span>
              <button type="button" onClick={() => void loadUsers(cursor)} className="font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Retry
              </button>
            </div>
          ) : null}

          <div
            aria-busy={state === "loading"}
            className={cn(
              "transition-opacity duration-150",
              state === "loading" && hasLoaded && showRows && "pointer-events-none opacity-50",
            )}
          >
            {loadingRows ? (
              <DirectoryLoading />
            ) : unavailableWithoutRows ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <AlertCircle className="size-5 text-muted-foreground" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold text-foreground">User records are unavailable</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  The directory could not be loaded. Try again when the service responds.
                </p>
                <Button size="sm" onClick={() => void loadUsers(cursor)} className="mt-5">
                  Retry
                </Button>
              </div>
            ) : !showRows ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <UsersRound className="size-5 text-muted-foreground" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {filtered ? "No matching users" : "No users yet"}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  {filtered
                    ? "Try a different search or provider."
                    : "Google and GitHub sign-ins will appear here."}
                </p>
                {filtered ? (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-5">
                    Clear filters
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <div className="hidden lg:block">
                  <table className="w-full table-fixed text-left text-sm">
                    <thead className="border-b border-border bg-muted/30 text-[11px] text-muted-foreground">
                      <tr>
                        <th scope="col" className="w-[35%] px-5 py-3 font-medium">User</th>
                        <th scope="col" className="w-[16%] px-4 py-3 font-medium">Provider</th>
                        <th scope="col" className="w-[20%] px-4 py-3 font-medium">Joined</th>
                        <th scope="col" className="w-[21%] px-4 py-3 font-medium">Last sign-in</th>
                        <th scope="col" className="w-[8%] px-4 py-3 text-right font-medium">Copy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((user) => (
                        <tr key={user.id} className="transition-colors hover:bg-muted/35">
                          <td className="px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <UserAvatar user={user} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate font-medium text-foreground" title={user.name}>{user.name}</span>
                                  {user.emailVerified ? (
                                    <CheckCircle2 className="size-3.5 shrink-0 text-(--color-success)" aria-label="Verified email" />
                                  ) : null}
                                </div>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground" title={user.email}>{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {user.providers.length ? user.providers.map((item) => <ProviderBadge key={item} provider={item} />) : <span className="text-muted-foreground">—</span>}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs tabular-nums text-muted-foreground">{formatDate(user.createdAt)}</td>
                          <td className="px-4 py-4 text-xs tabular-nums text-muted-foreground">{formatDate(user.lastSignInAt)}</td>
                          <td className="px-4 py-4 text-right">
                            <CopyEmailButton email={user.email} copied={copiedEmail === user.email} onCopy={(email) => void copyEmail(email)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-border lg:hidden">
                  {users.map((user) => (
                    <article key={user.id} className="px-4 py-5 sm:px-5">
                      <div className="flex items-start gap-3">
                        <UserAvatar user={user} size={44} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="truncate text-sm font-medium text-foreground" title={user.name}>{user.name}</h3>
                            {user.emailVerified ? <CheckCircle2 className="size-3.5 shrink-0 text-(--color-success)" aria-label="Verified email" /> : null}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground" title={user.email}>{user.email}</p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {user.providers.length ? user.providers.map((item) => <ProviderBadge key={item} provider={item} />) : <span className="text-xs text-muted-foreground">No provider</span>}
                          </div>
                        </div>
                        <CopyEmailButton email={user.email} copied={copiedEmail === user.email} onCopy={(email) => void copyEmail(email)} />
                      </div>
                      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs">
                        <div>
                          <dt className="text-muted-foreground">Joined</dt>
                          <dd className="mt-1 tabular-nums text-foreground">{formatDate(user.createdAt)}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Last sign-in</dt>
                          <dd className="mt-1 tabular-nums text-foreground">{formatDate(user.lastSignInAt)}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>

          {showRows || copyFeedback || cursorHistory.length > 0 || nextCursor ? (
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
              <span>
                {showRows && state !== "unavailable"
                  ? `Showing ${firstItem}–${lastItem} of ${total}`
                  : state === "unavailable" && showRows
                    ? "Last loaded results"
                    : ""}
              </span>
              <div role="status" className={cn("text-xs", copyFeedback === "error" ? "text-destructive" : "text-muted-foreground")}>
                {copyFeedback === "copied" ? "Email copied" : copyFeedback === "error" ? "Could not copy. Try again." : ""}
              </div>
              {cursorHistory.length > 0 || nextCursor ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={cursorHistory.length === 0 || state !== "ready"}
                    onClick={previousPage}
                    className="h-8 gap-1 px-2"
                  >
                    <ChevronLeft className="size-3.5" aria-hidden="true" />
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!nextCursor || state !== "ready"}
                    onClick={nextPage}
                    className="h-8 gap-1 px-2"
                  >
                    Next
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              ) : null}
            </footer>
          ) : null}
        </div>
      </section>
    </div>
  );
}
