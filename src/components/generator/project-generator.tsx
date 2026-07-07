"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CAREERS,
  LANGUAGES,
  RANDOMIZE,
  DEFAULT_QUEST_SELECTIONS,
  generateProject,
  projectToSelections,
  buildProjectFromSelections,
  toQuestOptions,
  getAllFrameworks,
  getFrameworksForLanguage,
  getTimeEstimatesForProject,
  isSchemaArchitectureProject,
  SCHEMA_COMPLETION_GUIDE,
  isRandomize,
  type QuestSelections,
} from "@/lib/generator/data";
import { createProject, createProjectForm, ProjectActionState } from "@/lib/actions/projects";
import { useActionState } from "react";
import type { GeneratedProject } from "@/types";
import { Button } from "@/components/ui/button";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { SparklesCore } from "@/components/ui/moving-border";
import { Select } from "@/components/ui/input";
import {
  Dices,
  Briefcase,
  Code2,
  Layers,
  Clock,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Hammer,
  Settings2,
  ChevronDown,
  ChevronUp,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProjectGenerator() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRolling, setIsRolling] = useState(false);
  const [aiAssisted, setAiAssisted] = useState(true);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [selections, setSelections] = useState<QuestSelections>(
    DEFAULT_QUEST_SELECTIONS
  );
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionState, formAction, actionPending] = useActionState(
    createProjectForm,
    {} as ProjectActionState
  );

  const timeEstimates = useMemo(() => {
    const title = project?.project_title ?? "";
    if (title && isSchemaArchitectureProject(title)) {
      return [...getTimeEstimatesForProject(title, aiAssisted)];
    }
    return aiAssisted
      ? ["2 hours", "4 hours", "1 day", "2 days", "3 days", "1 week"]
      : ["3 days", "1 week", "2 weeks", "3 weeks", "1 month", "6 weeks", "2 months"];
  }, [aiAssisted, project?.project_title]);

  const isSchemaQuest = project
    ? isSchemaArchitectureProject(project.project_title)
    : false;

  const frameworkOptions = useMemo(() => {
    if (!isRandomize(selections.language)) {
      return getFrameworksForLanguage(selections.language);
    }
    return getAllFrameworks();
  }, [selections.language]);

  const hasAnyManualLock = useMemo(
    () =>
      Object.values(selections).some((v) => !isRandomize(v)),
    [selections]
  );

  const updateSelection = (field: keyof QuestSelections, value: string) => {
    setSelections((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "language" && !isRandomize(value) && !isRandomize(next.framework)) {
        const valid = getFrameworksForLanguage(value);
        if (!valid.includes(next.framework)) {
          next.framework = RANDOMIZE;
        }
      }

      return next;
    });

    if (project && !isRandomize(value)) {
      setProject((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, [field]: value };
        if (field === "language") {
          const fw = selections.framework;
          if (!isRandomize(fw) && getFrameworksForLanguage(value).includes(fw)) {
            updated.framework = fw;
          }
        }
        return updated;
      });
    }

    setError(null);
  };

  const handleRoll = () => {
    setIsRolling(true);
    setAccepted(false);
    setError(null);

    setTimeout(() => {
      const result = generateProject(aiAssisted, selections);
      setProject(result);
      setSelections(projectToSelections(result));
      setIsRolling(false);
    }, 800);
  };

  const handleToggleAi = () => {
    setAiAssisted((prev) => !prev);
    setProject(null);
    setSelections(DEFAULT_QUEST_SELECTIONS);
    setAccepted(false);
    setError(null);
  };

  const handleAccept = () => {
    const title = project?.project_title ?? "Custom Quest";
    const { project: payload, error: buildError } = buildProjectFromSelections(
      selections,
      aiAssisted,
      title
    );

    if (buildError || !payload) {
      setError(buildError ?? "Invalid quest configuration.");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("career", payload.career);
      fd.set("language", payload.language);
      fd.set("framework", payload.framework);
      fd.set("project_title", payload.project_title);
      fd.set("time_estimate", payload.time_estimate);
      fd.set("ai_assisted", payload.ai_assisted ? "true" : "false");

      await formAction(fd);

      if (actionState.error) {
        setError(actionState.error);
        return;
      }

      setAccepted(true);
      setTimeout(() => router.push("/dashboard/board"), 1500);
    });
  };

  const handleReroll = () => {
    setProject(null);
    handleRoll();
  };

  const showQuestPanel = configureOpen || project !== null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate Project</h1>
        <p className="text-muted-foreground mt-1">
          Roll a full random quest or configure options for a custom mixed challenge
        </p>
      </div>

      {/* Development mode */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-card/50 p-4">
        <div className="flex-1">
          <p className="font-medium text-sm">Development Mode</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {aiAssisted
              ? "AI-assisted track — shorter deadlines (hours to days)"
              : "Standard track — realistic deadlines (days to months)"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={aiAssisted}
          onClick={handleToggleAi}
          className={cn(
            "relative inline-flex h-10 w-[220px] shrink-0 items-center rounded-lg border p-1 transition-colors cursor-pointer",
            aiAssisted
              ? "border-primary/40 bg-primary/10"
              : "border-border bg-secondary/50"
          )}
        >
          <span
            className={cn(
              "absolute h-8 w-[104px] rounded-md transition-all duration-200",
              aiAssisted
                ? "left-1 bg-primary shadow-sm shadow-primary/30"
                : "left-[107px] bg-muted"
            )}
          />
          <span
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-1.5 text-xs font-medium transition-colors",
              aiAssisted ? "text-primary-foreground" : "text-muted-foreground"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Assisted
          </span>
          <span
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-1.5 text-xs font-medium transition-colors",
              !aiAssisted ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Hammer className="h-3.5 w-3.5" />
            Standard
          </span>
        </button>
      </div>

      <div className="relative flex flex-col items-center py-8">
        <SparklesCore className="opacity-30" />

        <motion.button
          onClick={handleRoll}
          disabled={isRolling || isPending}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative z-10 flex h-32 w-32 items-center justify-center rounded-2xl",
            "bg-gradient-to-br from-green-600 to-emerald-700 shadow-2xl shadow-primary/30",
            "hover:shadow-primary/50 transition-shadow cursor-pointer",
            isRolling && "animate-dice-roll"
          )}
        >
          <Dices className="h-16 w-16 text-white" />
        </motion.button>

        <p className="mt-4 text-sm text-muted-foreground">
          {isRolling
            ? "Rolling..."
            : hasAnyManualLock
              ? "Rolling with your locked quest options..."
              : "Click the dice for a fully random quest!"}
        </p>

        {/* Quest card */}
        <div className="mt-8 w-full max-w-2xl">
          <BackgroundGradient containerClassName="w-full">
            <CardSpotlight className="border-0 bg-transparent p-6">
              {/* Card header with Configure toggle */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Quest Generator</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Custom Quest Mode — mix manual picks with random rolls
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfigureOpen((o) => !o)}
                  className="shrink-0"
                >
                  <Settings2 className="h-4 w-4" />
                  Configure Quest Options
                  {configureOpen ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {showQuestPanel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    {project && (
                      <div className="mb-4 text-center">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            project.ai_assisted
                              ? "bg-primary/15 text-primary"
                              : "bg-secondary text-muted-foreground"
                          )}
                        >
                          {project.ai_assisted ? "AI-Assisted" : "Standard Dev"}
                        </span>
                        <h3 className="text-xl font-bold mt-3">
                          {project.project_title}
                        </h3>
                        {isSchemaQuest && (
                          <div className="mt-3 rounded-lg border border-primary/25 bg-primary/5 p-3 text-left">
                            <div className="flex items-center gap-2 text-primary text-xs font-medium mb-1">
                              <Database className="h-3.5 w-3.5" />
                              Schema / Data Architecture Quest
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              <span className="font-medium text-foreground">Completion: </span>
                              {SCHEMA_COMPLETION_GUIDE}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Time estimates are day-based — schema design requires careful planning.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <QuestField
                        icon={Briefcase}
                        label="Career Track"
                        name="career"
                        value={selections.career}
                        options={toQuestOptions(CAREERS)}
                        onChange={(v) => updateSelection("career", v)}
                      />
                      <QuestField
                        icon={Code2}
                        label="Programming Language"
                        name="language"
                        value={selections.language}
                        options={toQuestOptions(LANGUAGES)}
                        onChange={(v) => updateSelection("language", v)}
                      />
                      <QuestField
                        icon={Layers}
                        label="Framework"
                        name="framework"
                        value={selections.framework}
                        options={toQuestOptions(frameworkOptions)}
                        onChange={(v) => updateSelection("framework", v)}
                      />
                      <QuestField
                        icon={Clock}
                        label="Time Estimate"
                        name="time_estimate"
                        value={selections.time_estimate}
                        options={toQuestOptions(timeEstimates)}
                        onChange={(v) => updateSelection("time_estimate", v)}
                      />
                    </div>

                    {!project && configureOpen && (
                      <p className="mt-4 text-xs text-muted-foreground text-center">
                        Lock any fields above, leave others on 🎲 Randomize, then roll the dice.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!showQuestPanel && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Open Configure Quest Options to lock specific criteria, or roll for a fully random challenge.
                </p>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
              )}

              {project && !isRolling && (
                <div className="mt-6">
                  {accepted ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Quest accepted! Redirecting to board...</span>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        onClick={handleAccept}
                        className="flex-1"
                        isLoading={isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Accept Quest
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleReroll}
                        disabled={isPending}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Re-roll
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardSpotlight>
          </BackgroundGradient>
        </div>
      </div>
    </div>
  );
}

function QuestField({
  icon: Icon,
  label,
  name,
  value,
  options,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <Select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
        className="text-sm"
      />
    </div>
  );
}
