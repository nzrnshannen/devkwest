"use client";

import { useState, useTransition } from "react";
import type { UserProject, ProjectStatus } from "@/types";
import { updateProjectStatus } from "@/lib/actions/projects";
import {
  isSchemaArchitectureProject,
  SCHEMA_COMPLETION_GUIDE,
} from "@/lib/generator/data";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import {
  Clock,
  Code2,
  ExternalLink,
  Github,
  GripVertical,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";

const COLUMNS: { id: ProjectStatus; title: string; color: string }[] = [
  { id: "to_do", title: "To-Do", color: "border-amber-500/30" },
  { id: "on_hold", title: "On-Hold", color: "border-yellow-500/30" },
  { id: "in_progress", title: "In Progress", color: "border-blue-500/30" },
  { id: "completed", title: "Completed", color: "border-emerald-500/30" },
];

interface KanbanBoardProps {
  projects: UserProject[];
}

export function KanbanBoard({ projects: initialProjects }: KanbanBoardProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [completionModal, setCompletionModal] = useState<{
    projectId: string;
    projectTitle: string;
    isSchemaProject: boolean;
  } | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const getColumnProjects = (status: ProjectStatus) =>
    projects.filter((p) => p.status === status);

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (targetStatus: ProjectStatus) => {
    if (!draggedId) return;

    const project = projects.find((p) => p.id === draggedId);
    if (!project || project.status === targetStatus) {
      setDraggedId(null);
      return;
    }

    if (targetStatus === "completed") {
      setCompletionModal({
        projectId: draggedId,
        projectTitle: project.project_title,
        isSchemaProject: isSchemaArchitectureProject(project.project_title),
      });
      setDraggedId(null);
      return;
    }

    moveProject(draggedId, targetStatus);
    setDraggedId(null);
  };

  const moveProject = (
    id: string,
    status: ProjectStatus,
    urls?: { github_url?: string; live_url?: string }
  ) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              github_url: urls?.github_url ?? p.github_url,
              live_url: urls?.live_url ?? p.live_url,
            }
          : p
      )
    );

    startTransition(async () => {
      const result = await updateProjectStatus(id, status, urls);
      if (result.error) {
        setProjects(initialProjects);
        setModalError(result.error);
      }
    });
  };

  const handleComplete = () => {
    if (!completionModal) return;

    const isSchema = completionModal.isSchemaProject;

    if (isSchema) {
      if (!githubUrl.trim()) {
        setModalError(
          "Schema projects require a GitHub repository URL with SQL migrations and an ERD in the README."
        );
        return;
      }
    } else if (!githubUrl && !liveUrl) {
      setModalError("Provide at least a GitHub or Live deployment URL");
      return;
    }

    moveProject(completionModal.projectId, "completed", {
      github_url: githubUrl || undefined,
      live_url: liveUrl || undefined,
    });

    setCompletionModal(null);
    setGithubUrl("");
    setLiveUrl("");
    setModalError(null);
  };

  const handleMoveClick = (projectId: string, targetStatus: ProjectStatus) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    if (targetStatus === "completed") {
      setCompletionModal({
        projectId,
        projectTitle: project.project_title,
        isSchemaProject: isSchemaArchitectureProject(project.project_title),
      });
      return;
    }

    moveProject(projectId, targetStatus);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Project Board</h1>
        <p className="text-muted-foreground mt-1">
          Drag cards between columns or use the action buttons to update status
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
            className={cn(
              "rounded-xl border-2 border-dashed p-4 min-h-[400px] transition-colors",
              column.color,
              draggedId && "bg-muted/20"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{column.title}</h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {getColumnProjects(column.id).length}
              </span>
            </div>

            <div className="space-y-3">
              {getColumnProjects(column.id).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDragStart={() => handleDragStart(project.id)}
                  onMove={handleMoveClick}
                  isDragging={draggedId === project.id}
                />
              ))}

              {getColumnProjects(column.id).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No projects here
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!completionModal}
        onClose={() => {
          setCompletionModal(null);
          setGithubUrl("");
          setLiveUrl("");
          setModalError(null);
        }}
        title={
          completionModal?.isSchemaProject
            ? "Complete Schema Project"
            : "Complete Project"
        }
      >
        {completionModal?.isSchemaProject ? (
          <>
            <p className="text-sm text-muted-foreground mb-3">
              Mark <strong>{completionModal.projectTitle}</strong> as completed by
              submitting your schema deliverables repository.
            </p>
            <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 mb-4 text-xs text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground mb-1">Required deliverables</p>
              <p>{SCHEMA_COMPLETION_GUIDE}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            Almost there! Provide at least one URL to mark{" "}
            <strong>{completionModal?.projectTitle}</strong> as completed.
          </p>
        )}

        <div className="space-y-4">
          <Input
            label={
              completionModal?.isSchemaProject
                ? "GitHub Repository URL (required)"
                : "GitHub Repository URL"
            }
            placeholder="https://github.com/username/repo"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            required={completionModal?.isSchemaProject}
          />
          {!completionModal?.isSchemaProject && (
            <Input
              label="Live Deployment URL"
              placeholder="https://your-app.vercel.app"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
            />
          )}
          {completionModal?.isSchemaProject && (
            <p className="text-xs text-muted-foreground">
              A live deployment URL is not required for schema and data architecture
              projects — your GitHub repo is the completion artifact.
            </p>
          )}

          {modalError && (
            <p className="text-sm text-red-400">{modalError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleComplete}
              className="flex-1"
              isLoading={isPending}
            >
              Mark Complete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCompletionModal(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ProjectCard({
  project,
  onDragStart,
  onMove,
  isDragging,
}: {
  project: UserProject;
  onDragStart: () => void;
  onMove: (id: string, status: ProjectStatus) => void;
  isDragging: boolean;
}) {
  const nextStatus: Record<ProjectStatus, ProjectStatus | null> = {
    pending: "in_progress",
    in_progress: "completed",
    completed: null,
  };

  const next = nextStatus[project.status];

  return (
    <motion.div
      layout
      draggable
      onDragStart={onDragStart}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <CardSpotlight className="p-4">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">
              {project.project_title}
            </h3>
            {isSchemaArchitectureProject(project.project_title) && (
              <span className="inline-block mt-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary">
                Schema / Data Architecture
              </span>
            )}
            <div className="mt-2 space-y-1">
              <Tag icon={Code2} label={project.language} />
              <Tag icon={Layers} label={project.framework} />
              <Tag icon={Clock} label={project.time_estimate} />
            </div>

            {project.status === "completed" && (
              <div className="mt-2 flex gap-2">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Github className="h-3 w-3" /> GitHub
                  </a>
                )}
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> Live
                  </a>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              {formatDate(project.created_at)}
            </p>

            {next && (
              <button
                onClick={() => onMove(project.id, next)}
                className="mt-2 text-xs text-primary hover:underline cursor-pointer"
              >
                Move to{" "}
                {next === "in_progress"
                  ? "In Progress"
                  : "Completed"}
              </button>
            )}
          </div>
        </div>
      </CardSpotlight>
    </motion.div>
  );
}

function Tag({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </div>
  );
}
