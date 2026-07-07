"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { register, type AuthState } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react";

const initialState: AuthState = {};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
};

const emptyForm: FormValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);

  const updateField = (field: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (clientErrors[field]) {
      setClientErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const clearPasswordFields = () => {
    setFormValues((prev) => ({
      ...prev,
      password: "",
      confirm_password: "",
    }));
  };

  // Server-side password mismatch: keep profile fields, clear passwords only
  useEffect(() => {
    const isPasswordMismatch =
      state.fieldErrors?.confirm_password === "Passwords do not match" ||
      state.error === "Passwords do not match";

    if (isPasswordMismatch) {
      clearPasswordFields();
    }
  }, [state.fieldErrors, state.error]);

  const handleSubmit = (formData: FormData) => {
    const errors: Record<string, string> = {};

    const firstName = formValues.first_name.trim();
    const lastName = formValues.last_name.trim();
    const email = formValues.email.trim();
    const { password, confirm_password: confirmPassword } = formValues;

    if (!firstName) errors.first_name = "First name is required";
    if (!lastName) errors.last_name = "Last name is required";
    if (!email) {
      errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      errors.confirm_password = "Passwords do not match";
      clearPasswordFields();
    }

    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    setClientErrors({});
    formData.set("first_name", firstName);
    formData.set("last_name", lastName);
    formData.set("email", email);
    formData.set("password", password);
    formData.set("confirm_password", confirmPassword);
    formAction(formData);
  };

  const fieldError = (field: string) =>
    clientErrors[field] ?? state.fieldErrors?.[field];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 box-glow">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
              <Code2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join DevKwest and start building your portfolio
            </p>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="first_name"
                type="text"
                placeholder="Jane"
                required
                value={formValues.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
                error={fieldError("first_name")}
              />
              <Input
                label="Last Name"
                name="last_name"
                type="text"
                placeholder="Doe"
                required
                value={formValues.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
                error={fieldError("last_name")}
              />
            </div>
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              value={formValues.email}
              onChange={(e) => updateField("email", e.target.value)}
              error={fieldError("email")}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={formValues.password}
              onChange={(e) => updateField("password", e.target.value)}
              error={fieldError("password")}
            />
            <Input
              label="Re-type Password"
              name="confirm_password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={formValues.confirm_password}
              onChange={(e) => updateField("confirm_password", e.target.value)}
              error={fieldError("confirm_password")}
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
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
