export const SCHEMA_COMPLETION_GUIDE =
  "Submit a GitHub repository containing SQL migration scripts, an entity-relationship diagram (ERD) in the README, and optional seed scripts.";

/** Day-based estimates — schema design needs careful planning even with AI assistance */
export const TIME_ESTIMATES_SCHEMA = [
  "2 days",
  "3 days",
  "5 days",
  "1 week",
  "2 weeks",
] as const;

/**
 * Titles that represent database schema / data architecture quests.
 * These use day-based time estimates and GitHub-only completion.
 */
export const SCHEMA_ARCHITECTURE_TITLES = new Set([
  "Data Warehouse Schema",
  "Database Schema & Migration Design",
  "Entity-Relationship Data Model",
  "PostgreSQL Migration & ERD Package",
  "Multi-Tenant Database Architecture",
  "Database Schema & Migration Scripts",
  "Auth & Session Schema Design",
  "Normalized Schema for E-Commerce",
]);

export function isSchemaArchitectureProject(projectTitle: string): boolean {
  return SCHEMA_ARCHITECTURE_TITLES.has(projectTitle);
}
