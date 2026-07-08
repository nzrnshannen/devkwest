"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Select } from "@/components/ui/input";
import { getYears, getMonths } from "@/lib/utils";
import { LANGUAGES } from "@/lib/generator/data";
import type { AnalyticsData } from "@/types";
import { motion } from "framer-motion";

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
  filters: {
    year: number;
    month: number | null;
    language: string | null;
  };
}

export function AnalyticsDashboard({
  analytics,
  filters,
}: AnalyticsDashboardProps) {
  const years = getYears();
  const months = getMonths();

  return (
    <div className="space-y-6">
      {/* Alert Banner — pinned to top, full width */}
      {!analytics.hasActiveProjects && (
        <Link href="/dashboard/generate" className="block w-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-alert-glow group flex w-full items-center gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 hover:bg-amber-500/15 transition-colors cursor-pointer"
          >
            <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-amber-200">
                No projects pending to be made today.
              </p>
              <p className="text-sm text-amber-400/80">
                Click here to let the system generate it for you!
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </motion.div>
        </Link>
      )}

      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your project generation and completion metrics
        </p>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-4" method="get">
        <Select
          label="Year"
          name="year"
          defaultValue={String(filters.year)}
          options={years.map((y) => ({ value: String(y), label: String(y) }))}
          className="w-32"
        />
        <Select
          label="Month"
          name="month"
          defaultValue={filters.month ? String(filters.month) : ""}
          options={[
            { value: "", label: "All months" },
            ...months.map((m) => ({
              value: String(m.value),
              label: m.label,
            })),
          ]}
          className="w-40"
        />
        <Select
          label="Language"
          name="language"
          defaultValue={filters.language ?? ""}
          options={[
            { value: "", label: "All languages" },
            ...LANGUAGES.map((l) => ({ value: l, label: l })),
          ]}
          className="w-40"
        />
        <div className="flex items-end">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Completed Projects"
          value={analytics.totalCompleted}
          subtitle="Total finished"
          color="text-emerald-400"
        />
        <StatCard
          title="In Progress"
          value={analytics.totalInProgress}
          subtitle="Currently building"
          color="text-blue-400"
        />
        <StatCard
          title="Pending"
          value={analytics.totalPending}
          subtitle="Waiting to start"
          color="text-amber-400"
        />
        <StatCard
          title="Success Rate"
          value={`${analytics.successRate}%`}
          subtitle="Completed vs rolled"
          color="text-purple-400"
        />
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSpotlight>
          <h3 className="font-semibold mb-4">Breakdown by Language</h3>
          {analytics.languageBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No completed projects yet. Roll the dice to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.languageBreakdown.map((item) => {
                const maxCount = analytics.languageBreakdown[0]?.count ?? 1;
                const width = (item.count / maxCount) * 100;
                return (
                  <div key={item.language}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.language}</span>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardSpotlight>

        <CardSpotlight>
          <h3 className="font-semibold mb-4">Success Rate vs Rolled Deadlines</h3>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${analytics.successRate * 2.51} 251`}
                  initial={{ strokeDasharray: "0 251" }}
                  animate={{
                    strokeDasharray: `${analytics.successRate * 2.51} 251`,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{analytics.successRate}%</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Projects completed within their rolled time estimates
            </p>
          </div>
        </CardSpotlight>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
}) {
  const shouldGlow = 
    (title === "In Progress" || title === "Completed Projects" || title === "Pending") && 
    value !== 0;

  return (
    <CardSpotlight>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${color} ${shouldGlow ? "animate-faint-glow" : ""}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </CardSpotlight>
  );
}
