export type ProjectStatus = "to_do" | "on_hold" | "in_progress" | "completed";

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
}

export interface UserProject {
  id: string;
  user_id: string;
  career: string;
  language: string;
  framework: string;
  project_title: string;
  time_estimate: string;
  status: ProjectStatus;
  github_url: string | null;
  live_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GeneratedProject {
  career: string;
  language: string;
  framework: string;
  project_title: string;
  time_estimate: string;
  ai_assisted?: boolean;
  is_schema_project?: boolean;
}

export interface AnalyticsFilters {
  year: number;
  month: number | null;
  language: string | null;
}

export interface AnalyticsData {
  totalCompleted: number;
  totalToDo: number;
  totalOnHold: number;
  totalInProgress: number;
  languageBreakdown: { language: string; count: number }[];
  successRate: number;
  hasActiveProjects: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
