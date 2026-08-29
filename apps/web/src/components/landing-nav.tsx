"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useAuth } from "@/contexts/auth-context";

export function LandingNav() {
  const { user, loading } = useAuth();

  return (
    <nav className="border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size="md" />
          <span className="font-mono text-base sm:text-lg font-bold tracking-tight">
            INFRA-SCOPE
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          {!loading && user ? (
            <Link href="/dashboard">
              <Button size="sm" className="font-mono text-xs sm:text-sm rounded-sm">
                Dashboard &rarr;
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-mono text-xs sm:text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="font-mono text-xs sm:text-sm rounded-sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
