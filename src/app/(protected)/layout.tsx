"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import AIAssistant from "@/components/AIAssistant";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  useEffect(() => {
    // Middleware (proxy.ts) already gates the route. This is a client-side
    // fallback for when the JWT session actually expires mid-session.
    // We use window.location (hard redirect) so the new request goes through
    // middleware and gets a fresh cookie check.
    if (status === "unauthenticated") {
      window.location.replace("/auth/signin");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex h-screen bg-background">
        <div className="hidden md:flex w-64 flex-col border-r border-border bg-card">
          <div className="px-6 py-5 border-b border-border">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex-1 px-3 py-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <Skeleton className="h-14 w-full" />
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Don't render children while unauthenticated — prevents cascading 401s
  // from all the page's data-fetching hooks firing before the redirect lands.
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      {/* AI Assistant bubble */}
      <AIAssistant />
    </div>
  );
}
