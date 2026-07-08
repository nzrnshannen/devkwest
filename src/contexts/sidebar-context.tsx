"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  isHovered: boolean;
  setIsHovered: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <SidebarContext.Provider value={{ isHovered, setIsHovered }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
