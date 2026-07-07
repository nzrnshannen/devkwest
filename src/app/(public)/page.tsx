import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { HeroSection } from "@/components/landing/hero-section";
import { FeedbackForm } from "@/components/landing/feedback-form";

export default async function LandingPage() {
  const user = await getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-background bg-grid-white">
      <HeroSection />
      <FeedbackForm />
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} DevKwest. Built for developers who ship.</p>
      </footer>
    </main>
  );
}
