"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSchemaArchitectureProject } from "@/lib/generator/data";
import type { GeneratedProject, ProjectStatus, UserProject } from "@/types";
import type { UserProjectInsert } from "@/types/database";
import { z } from "zod";

const createProjectSchema = z.object({
  career: z.string().min(1),
  language: z.string().min(1),
  framework: z.string().min(1),
  project_title: z.string().min(1),
  time_estimate: z.string().min(1),
});

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["to_do", "on_hold", "in_progress", "completed"]),
  github_url: z.string().url().optional().or(z.literal("")),
  live_url: z.string().url().optional().or(z.literal("")),
});

export type ProjectActionState = {
  error?: string;
  success?: boolean;
};

export async function createProject(
  project: GeneratedProject
): Promise<ProjectActionState> {
  const parsed = createProjectSchema.safeParse(project);
  if (!parsed.success) {
    return { error: "Invalid project data" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const insertData: UserProjectInsert = {
    user_id: user.id,
    ...parsed.data,
    project_name: parsed.data.project_title,
    status: "to_do",
  };

  const { error } = await supabase.from("user_projects").insert(insertData);

  if (error) {
    console.error("Failed to create project:", error);

    if (error.message.includes("schema cache") || error.message.includes("column")) {
      return {
        error: `Database schema mismatch: ${error.message}`,
      };
    }

    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/board");
  revalidatePath("/dashboard/generate");
  return { success: true };
}

// Form-compatible server action wrapper for client `useActionState` usage.
export async function createProjectForm(
  _prevState: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  try {
    const project: GeneratedProject = {
      career: String(formData.get("career") ?? ""),
      language: String(formData.get("language") ?? ""),
      framework: String(formData.get("framework") ?? ""),
      project_title: String(formData.get("project_title") ?? ""),
      time_estimate: String(formData.get("time_estimate") ?? ""),
      ai_assisted: (formData.get("ai_assisted") ?? "false") === "true",
    } as GeneratedProject;

    return await createProject(project);
  } catch (err: any) {
    return { error: err?.message ?? "Unknown error" };
  }
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
  urls?: { github_url?: string; live_url?: string }
): Promise<ProjectActionState> {
  const parsed = updateStatusSchema.safeParse({
    id,
    status,
    github_url: urls?.github_url ?? "",
    live_url: urls?.live_url ?? "",
  });

  if (!parsed.success) {
    return { error: "Invalid update data" };
  }

  if (status === "completed") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    const { data: existing } = await supabase
      .from("user_projects")
      .select("project_title")
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    const isSchema = existing?.project_title
      ? isSchemaArchitectureProject(existing.project_title)
      : false;

    const hasGithub = parsed.data.github_url && parsed.data.github_url.length > 0;
    const hasLive = parsed.data.live_url && parsed.data.live_url.length > 0;

    if (isSchema) {
      if (!hasGithub) {
        return {
          error:
            "Schema projects require a GitHub repository URL with SQL migrations and an ERD in the README.",
        };
      }
    } else if (!hasGithub && !hasLive) {
      return { error: "Provide at least a GitHub or Live deployment URL" };
    }

    const updateData: Record<string, string | null> = { status };
    if (parsed.data.github_url) {
      updateData.github_url = parsed.data.github_url;
    }
    if (parsed.data.live_url) {
      updateData.live_url = parsed.data.live_url;
    }

    const { error } = await supabase
      .from("user_projects")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/board");
    return { success: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updateData: Record<string, string | null> = { status };
  if (parsed.data.github_url) {
    updateData.github_url = parsed.data.github_url;
  }
  if (parsed.data.live_url) {
    updateData.live_url = parsed.data.live_url;
  }

  const { error } = await supabase
    .from("user_projects")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/board");
  return { success: true };
}

export async function getProjects(filters?: {
  year?: number;
  month?: number | null;
  language?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("user_projects")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters?.year) {
    const startDate = filters.month
      ? new Date(filters.year, filters.month - 1, 1).toISOString()
      : new Date(filters.year, 0, 1).toISOString();
    const endDate = filters.month
      ? new Date(filters.year, filters.month, 0, 23, 59, 59).toISOString()
      : new Date(filters.year, 11, 31, 23, 59, 59).toISOString();
    query = query.gte("created_at", startDate).lte("created_at", endDate);
  }

  if (filters?.language) {
    query = query.eq("language", filters.language);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch projects:", error.message);
    return [];
  }

  return (data ?? []) as UserProject[];
}

export async function softDeleteProject(
  id: string
): Promise<ProjectActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("user_projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/board");
  return { success: true };
}

export async function getDeletedProjects(): Promise<UserProject[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("user_projects")
    .select("*")
    .eq("user_id", user.id)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch deleted projects:", error.message);
    return [];
  }

  return (data ?? []) as UserProject[];
}

export async function getAnalytics(filters?: {
  year?: number;
  month?: number | null;
  language?: string | null;
}) {
  const projects = await getProjects(filters);

  const completed = projects.filter((p) => p.status === "completed");
  const toDo = projects.filter((p) => p.status === "to_do");
  const onHold = projects.filter((p) => p.status === "on_hold");
  const inProgress = projects.filter((p) => p.status === "in_progress");

  const languageMap = new Map<string, number>();
  completed.forEach((p) => {
    languageMap.set(p.language, (languageMap.get(p.language) ?? 0) + 1);
  });

  const languageBreakdown = Array.from(languageMap.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);

  const totalRolled = projects.length;
  const successRate =
    totalRolled > 0 ? Math.round((completed.length / totalRolled) * 100) : 0;

  return {
    totalCompleted: completed.length,
    totalToDo: toDo.length,
    totalOnHold: onHold.length,
    totalInProgress: inProgress.length,
    languageBreakdown,
    successRate,
    hasActiveProjects: toDo.length > 0 || onHold.length > 0 || inProgress.length > 0,
  };
}
