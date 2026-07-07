"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react";

const initialState: AuthState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 box-glow">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
              <Code2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send a password reset link.
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />

            {state.error && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {state.error}
              </p>
            )}

            {state.success && (
              <p className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                {state.success}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={pending}>
              Send reset link
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
