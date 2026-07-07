"use client";

import { useActionState, useState } from "react";
import { submitFeedback, type FeedbackState } from "@/lib/actions/feedback";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { motion } from "framer-motion";

const initialState: FeedbackState = {};

export function FeedbackForm() {
  const [state, formAction, pending] = useActionState(
    submitFeedback,
    initialState
  );
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    const email = formData.get("email") as string;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError(null);
    formAction(formData);
  };

  return (
    <section className="border-t border-border bg-card/30 px-6 py-20">
      <div className="mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Suggestions & Feedback</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Help us improve DevKwest. We read every message.
          </p>
        </motion.div>

        {state.success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center"
          >
            <p className="text-primary font-medium">
              Thanks for your feedback! We&apos;ll be in touch.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            action={handleSubmit}
            className="space-y-4 rounded-xl border border-border bg-card p-6"
          >
            <Input
              label="Email (optional)"
              name="email"
              type="email"
              placeholder="you@example.com"
              error={emailError ?? undefined}
            />
            <div className="space-y-2">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-muted-foreground"
              >
                Your feedback
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="Share your ideas, bugs, or feature requests..."
                className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
              />
            </div>

            {state.error && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {state.error}
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={pending}>
              <Send className="h-4 w-4" />
              Send Feedback
            </Button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
