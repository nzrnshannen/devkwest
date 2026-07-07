import {
  isSchemaArchitectureProject,
  TIME_ESTIMATES_SCHEMA,
} from "./schema-projects";

export {
  isSchemaArchitectureProject,
  SCHEMA_COMPLETION_GUIDE,
  TIME_ESTIMATES_SCHEMA,
  SCHEMA_ARCHITECTURE_TITLES,
} from "./schema-projects";

export function getTimeEstimatesForProject(
  projectTitle: string,
  aiAssisted: boolean
): readonly string[] {
  if (isSchemaArchitectureProject(projectTitle)) {
    return TIME_ESTIMATES_SCHEMA;
  }
  return aiAssisted ? TIME_ESTIMATES_AI : TIME_ESTIMATES_STANDARD;
}

export function isValidTimeEstimateForProject(
  projectTitle: string,
  aiAssisted: boolean,
  timeEstimate: string
): boolean {
  return getTimeEstimatesForProject(projectTitle, aiAssisted).includes(
    timeEstimate
  );
}

export const RANDOMIZE = "randomize" as const;

export const CAREERS = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Data Engineer",
  "ML Engineer",
  "Game Developer",
] as const;

export const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C#",
  "Ruby",
  "Swift",
  "Kotlin",
] as const;

export const FRAMEWORKS: Record<string, string[]> = {
  JavaScript: ["React", "Vue", "Angular", "Svelte", "Next.js"],
  TypeScript: ["Next.js", "NestJS", "Remix", "Angular", "T3 Stack"],
  Python: ["Django", "FastAPI", "Flask", "Streamlit", "PyTorch"],
  Go: ["Gin", "Echo", "Fiber", "gRPC", "Cobra CLI"],
  Rust: ["Actix", "Axum", "Rocket", "Tauri", "Yew"],
  Java: ["Spring Boot", "Quarkus", "Micronaut", "Android SDK", "Vert.x"],
  "C#": [".NET", "Blazor", "Unity", "ASP.NET Core", "MAUI"],
  Ruby: ["Rails", "Sinatra", "Hanami", "Hotwire", "Sidekiq App"],
  Swift: ["SwiftUI", "UIKit", "Vapor", "Combine", "Core Data App"],
  Kotlin: ["Spring Boot", "Ktor", "Jetpack Compose", "Exposed", "Arrow"],
};

export const TIME_ESTIMATES_AI = [
  "2 hours",
  "4 hours",
  "1 day",
  "2 days",
  "3 days",
  "1 week",
] as const;

export const TIME_ESTIMATES_STANDARD = [
  "3 days",
  "1 week",
  "2 weeks",
  "3 weeks",
  "1 month",
  "6 weeks",
  "2 months",
] as const;

/** @deprecated Use TIME_ESTIMATES_AI or generateProject() instead */
export const TIME_ESTIMATES = TIME_ESTIMATES_AI;

export const PROJECT_TITLES: Record<string, string[]> = {
  "Frontend Developer": [
    "Interactive Dashboard UI",
    "Real-time Chat Interface",
    "E-commerce Product Page",
    "Portfolio Website Builder",
    "Weather App with Animations",
    "Kanban Task Manager",
    "Music Player UI",
    "Recipe Finder App",
  ],
  "Backend Developer": [
    "REST API for Book Library",
    "Authentication Microservice",
    "Database Schema & Migration Scripts",
    "Auth & Session Schema Design",
    "Rate Limiter Service",
    "URL Shortener API",
    "Webhook Processor",
    "File Upload Service",
  ],
  "Full-Stack Developer": [
    "Blog Platform with CMS",
    "Team Collaboration Tool",
    "Expense Tracker SaaS",
    "Event Booking System",
    "Social Media Clone",
    "Learning Management System",
    "Inventory Management App",
    "Subscription Billing Platform",
  ],
  "Mobile Developer": [
    "Habit Tracker App",
    "Fitness Workout Logger",
    "Offline Notes App",
    "QR Code Scanner",
    "Local Events Finder",
    "Budget Tracker",
    "Meditation Timer",
    "Photo Gallery Organizer",
  ],
  "DevOps Engineer": [
    "CI/CD Pipeline Setup",
    "Docker Compose Stack",
    "Kubernetes Deployment",
    "Infrastructure as Code",
    "Monitoring Dashboard",
    "Log Aggregation System",
    "Auto-scaling Setup",
    "Blue-Green Deployment",
  ],
  "Data Engineer": [
    "ETL Pipeline Builder",
    "Data Warehouse Schema",
    "Database Schema & Migration Design",
    "Entity-Relationship Data Model",
    "PostgreSQL Migration & ERD Package",
    "Multi-Tenant Database Architecture",
    "Normalized Schema for E-Commerce",
    "Real-time Stream Processor",
    "Data Quality Monitor",
  ],
  "ML Engineer": [
    "Sentiment Analysis API",
    "Image Classifier App",
    "Recommendation Engine",
    "Chatbot with Fine-tuning",
    "Anomaly Detection System",
    "Text Summarizer",
    "Price Prediction Model",
    "Document Q&A System",
  ],
  "Game Developer": [
    "2D Platformer Game",
    "Puzzle Game Engine",
    "Multiplayer Lobby System",
    "Procedural Map Generator",
    "Score Leaderboard API",
    "Turn-based Strategy Game",
    "Endless Runner Clone",
    "Tower Defense Game",
  ],
};

export type QuestFieldValue = typeof RANDOMIZE | string;

export interface QuestSelections {
  career: QuestFieldValue;
  language: QuestFieldValue;
  framework: QuestFieldValue;
  time_estimate: QuestFieldValue;
}

export const DEFAULT_QUEST_SELECTIONS: QuestSelections = {
  career: RANDOMIZE,
  language: RANDOMIZE,
  framework: RANDOMIZE,
  time_estimate: RANDOMIZE,
};

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function isRandomize(value: QuestFieldValue): boolean {
  return value === RANDOMIZE;
}

export function getAllFrameworks(): string[] {
  const set = new Set<string>();
  Object.values(FRAMEWORKS).forEach((fws) => fws.forEach((fw) => set.add(fw)));
  return Array.from(set).sort();
}

export function getFrameworksForLanguage(language: string): string[] {
  return FRAMEWORKS[language] ?? [];
}

export function getLanguagesForFramework(framework: string): string[] {
  return Object.entries(FRAMEWORKS)
    .filter(([, fws]) => fws.includes(framework))
    .map(([lang]) => lang);
}

export function toQuestOptions(
  items: readonly string[],
  randomLabel = "🎲 Randomize"
): { value: string; label: string }[] {
  return [
    { value: RANDOMIZE, label: randomLabel },
    ...items.map((item) => ({ value: item, label: item })),
  ];
}

function resolveLanguageAndFramework(selections: QuestSelections): {
  language: string;
  framework: string;
} {
  const langFixed = !isRandomize(selections.language);
  const fwFixed = !isRandomize(selections.framework);

  if (langFixed && fwFixed) {
    const language = selections.language;
    const frameworks = getFrameworksForLanguage(language);
    const framework = frameworks.includes(selections.framework)
      ? selections.framework
      : pickRandom(frameworks.length ? frameworks : ["Custom"]);
    return { language, framework };
  }

  if (langFixed) {
    const language = selections.language;
    const frameworks = getFrameworksForLanguage(language);
    const framework = pickRandom(frameworks.length ? frameworks : ["Custom"]);
    return { language, framework };
  }

  if (fwFixed) {
    const framework = selections.framework;
    const compatibleLangs = getLanguagesForFramework(framework);
    const language = compatibleLangs.length
      ? pickRandom(compatibleLangs)
      : pickRandom(LANGUAGES);
    return { language, framework };
  }

  const language = pickRandom(LANGUAGES);
  const frameworks = getFrameworksForLanguage(language);
  const framework = pickRandom(frameworks.length ? frameworks : ["Custom"]);
  return { language, framework };
}

/**
 * Generates a quest by respecting manual locks and randomizing only fields
 * still set to RANDOMIZE.
 */
export function generateProject(
  aiAssisted = true,
  selections: QuestSelections = DEFAULT_QUEST_SELECTIONS
) {
  const career = isRandomize(selections.career)
    ? pickRandom(CAREERS)
    : selections.career;

  const { language, framework } = resolveLanguageAndFramework(selections);

  const titles = PROJECT_TITLES[career] ?? ["Side Project"];
  const project_title = pickRandom(titles);

  const estimates = getTimeEstimatesForProject(project_title, aiAssisted);
  const time_estimate = isRandomize(selections.time_estimate)
    ? pickRandom(estimates)
    : selections.time_estimate;

  return {
    career,
    language,
    framework,
    project_title,
    time_estimate,
    ai_assisted: aiAssisted,
    is_schema_project: isSchemaArchitectureProject(project_title),
  };
}

/** Build quest selections from a resolved project (for dropdown display). */
export function projectToSelections(project: {
  career: string;
  language: string;
  framework: string;
  time_estimate: string;
}): QuestSelections {
  return {
    career: project.career,
    language: project.language,
    framework: project.framework,
    time_estimate: project.time_estimate,
  };
}

/** Merge dropdown edits into a valid GeneratedProject for submission. */
export function buildProjectFromSelections(
  selections: QuestSelections,
  aiAssisted: boolean,
  projectTitle: string
): { project: ReturnType<typeof generateProject> | null; error?: string } {
  if (
    isRandomize(selections.career) ||
    isRandomize(selections.language) ||
    isRandomize(selections.framework) ||
    isRandomize(selections.time_estimate)
  ) {
    return { project: null, error: "Roll the dice or lock every field before accepting." };
  }

  const frameworks = getFrameworksForLanguage(selections.language);
  if (!frameworks.includes(selections.framework)) {
    return {
      project: null,
      error: `${selections.framework} is not available for ${selections.language}.`,
    };
  }

  if (!isValidTimeEstimateForProject(projectTitle, aiAssisted, selections.time_estimate)) {
    const hint = isSchemaArchitectureProject(projectTitle)
      ? "Schema projects use day-based estimates (2 days – 2 weeks)."
      : "Selected time estimate is not valid for the current development mode.";
    return { project: null, error: hint };
  }

  if (!CAREERS.includes(selections.career as (typeof CAREERS)[number])) {
    return { project: null, error: "Invalid career track selected." };
  }

  return {
    project: {
      career: selections.career,
      language: selections.language,
      framework: selections.framework,
      project_title: projectTitle,
      time_estimate: selections.time_estimate,
      ai_assisted: aiAssisted,
      is_schema_project: isSchemaArchitectureProject(projectTitle),
    },
  };
}
