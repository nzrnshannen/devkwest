"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CardSpotlightProps {
  children: React.ReactNode;
  className?: string;
}

export function CardSpotlight({ children, className }: CardSpotlightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-6",
        "hover:border-primary/50 transition-colors duration-300",
        className
      )}
    >
      <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-emerald-500/10" />
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
