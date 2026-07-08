import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { DashboardMain } from "@/components/layout/dashboard-main";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar userEmail={user.email} />
        <DashboardMain>{children}</DashboardMain>
      </div>
    </SidebarProvider>
  );
}
