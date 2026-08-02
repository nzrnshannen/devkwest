"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface GridTrailProps {
  className?: string;
  cellSize?: number;
}

export function GridTrail({ className, cellSize = 50 }: GridTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridSize, setGridSize] = useState({ columns: 0, rows: 0 });

  useEffect(() => {
    const calculateGrid = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      
      const columns = Math.ceil(clientWidth / cellSize);
      const rows = Math.ceil(clientHeight / cellSize);
      
      setGridSize({ columns, rows });
    };

    calculateGrid();
    window.addEventListener("resize", calculateGrid);
    return () => window.removeEventListener("resize", calculateGrid);
  }, [cellSize]);

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("grid-cell")) {
      target.style.transition = "background-color 0s";
      target.style.backgroundColor = "rgba(34, 197, 94, 0.35)"; // DevKwest Primary color with opacity
      
      // Use setTimeout to allow the browser to paint the highlight before starting the fade out
      setTimeout(() => {
        target.style.transition = "background-color 1.5s ease-out";
        target.style.backgroundColor = "transparent";
      }, 50);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden pointer-events-auto", className)}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize.columns}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
      }}
      onMouseOver={handleMouseOver}
    >
      {Array.from({ length: gridSize.columns * gridSize.rows }).map((_, i) => (
        <div 
          key={i} 
          className="grid-cell border-[0.5px] border-primary/[0.04]"
        />
      ))}
    </div>
  );
}
