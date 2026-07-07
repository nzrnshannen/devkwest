import type { Metadata } from "next";
import { getProjects } from "@/lib/actions/projects";
import { KanbanBoard } from "@/components/board/kanban-board";

export const metadata: Metadata = {
  title: "Board — ProjGen",
};

export default async function BoardPage() {
  const projects = await getProjects();
  return <KanbanBoard projects={projects} />;
}
