"use client";

import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/motion/button";
import { Input } from "@/components/motion/input";
import {
  AdminApiError,
  createAdminSession,
  getAdminSession,
} from "@/lib/admin-api";

export function AdminSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getAdminSession()
      .then(() => {
        if (!cancelled) router.replace("/admin");
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      await createAdminSession(email, password);
      router.replace("/admin");
    } catch (error) {
      if (error instanceof AdminApiError) {
        setMessage(error.message);
      } else {
        setMessage("Admin authentication is unavailable. Try again.");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[27rem] items-center px-4 py-12">
      <section className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8">
        <span className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-background text-foreground">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        </span>
        <h1 className="mt-7 text-2xl font-semibold tracking-[-0.025em] text-foreground">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Access the private AgentUI user directory.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Input
            id="admin-email"
            label="Email"
            type="email"
            autoComplete="username"
            required
            disabled={pending}
            value={email}
            onChange={setEmail}
            classNames={{ label: "px-0 text-xs", field: "rounded-xl bg-background" }}
          />
          <Input
            id="admin-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
            value={password}
            onChange={setPassword}
            classNames={{ label: "px-0 text-xs", field: "rounded-xl bg-background" }}
          />

          {message ? (
            <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {message}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-xl"
          >
            {pending ? <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : null}
            {pending ? "Signing in" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
          This session expires after 30 minutes of inactivity.
        </p>
      </section>
    </div>
  );
}
