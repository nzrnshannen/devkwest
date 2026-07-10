import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { LandingPageContent } from "@/components/landing/landing-page-content";

export default async function LandingPage() {
  const user = await getUser();
  if (user) redirect("/dashboard");

  return <LandingPageContent />;
}
