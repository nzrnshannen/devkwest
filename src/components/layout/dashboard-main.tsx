"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";
import { ReactNode } from "react";

export function DashboardMain({ children }: { children: ReactNode }) {
  const { isHovered } = useSidebar();

  const paddingClass = isHovered ? "lg:pl-64" : "lg:pl-20";

  return (
    <main
      className={cn(
        "transition-all duration-300 ease-in-out",
        paddingClass
      )}
    >
      <div className="p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
    </main>
  );
}
