"use client";

import { useActionState, useState } from "react";
import { deleteAccount } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DeleteAccountState = {
  error: string;
};

const initialState: DeleteAccountState = {
  error: "",
};

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteAccount, initialState);
  const [confirmation, setConfirmation] = useState("");

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-red-500/20 bg-red-500/5 p-6"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-red-300">Delete account</h2>
        <p className="text-sm text-muted-foreground">
          This permanently deletes your Supabase auth user and all related profile and project data.
        </p>
      </div>

      <Input
        label="Type DELETE to confirm"
        name="confirmation"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        placeholder="DELETE"
        error={confirmation !== "DELETE" && confirmation.length > 0 ? "Type DELETE to confirm account deletion" : state.error || undefined}
      />

      <Button type="submit" variant="danger" isLoading={pending} disabled={confirmation !== "DELETE"}>
        Permanently delete my account
      </Button>
    </form>
  );
}
