import type { Metadata } from "next";
import { getAnalytics } from "@/lib/actions/projects";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export const metadata: Metadata = {
  title: "Analytics — ProjGen",
};

interface PageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
    language?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentYear = new Date().getFullYear();

  const filters = {
    year: params.year ? parseInt(params.year, 10) : currentYear,
    month: params.month ? parseInt(params.month, 10) : null,
    language: params.language || null,
  };

  const analytics = await getAnalytics(filters);

  return <AnalyticsDashboard analytics={analytics} filters={filters} />;
}
