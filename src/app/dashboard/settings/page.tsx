import type { Metadata } from "next";
import { DeleteAccountForm } from "@/components/auth/delete-account-form";

export const metadata: Metadata = {
  title: "Settings — DevKwest",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage account actions here.
        </p>
      </div>

      <DeleteAccountForm />
    </div>
  );
}
