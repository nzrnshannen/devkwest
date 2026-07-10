"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30 group-hover:ring-primary/50 transition-all">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Dev<span className="text-primary">Kwest</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {isAuthPage && (
            <Link
              href="/"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
          )}
          <Link href="/login" aria-label="Log in to your account">
            <Button
              variant={pathname === "/login" ? "primary" : "ghost"}
              size="sm"
            >
              Log In
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
