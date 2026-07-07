"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const feedbackSchema = z.object({
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  message: z.string().min(10, "Please provide at least 10 characters of feedback"),
});

export type FeedbackState = {
  error?: string;
  success?: boolean;
};

export async function submitFeedback(
  _prevState: FeedbackState,
  formData: FormData
): Promise<FeedbackState> {
  const parsed = feedbackSchema.safeParse({
    email: formData.get("email") || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("feedback").insert({
    email: parsed.data.email || null,
    message: parsed.data.message,
  });

  if (error) {
    console.error("Feedback submission error:", error.message);
    return {
      error: "Unable to send feedback right now. Please try again later.",
    };
  }

  return { success: true };
}
