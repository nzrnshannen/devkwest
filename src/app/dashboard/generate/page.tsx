import type { Metadata } from "next";
import { ProjectGenerator } from "@/components/generator/project-generator";

export const metadata: Metadata = {
  title: "Generate Project — ProjGen",
};

export default function GeneratePage() {
  return <ProjectGenerator />;
}
