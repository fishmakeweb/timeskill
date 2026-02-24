"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardAIChatContext } from "@/components/DashboardAIChat";

interface Props {
  context: DashboardAIChatContext;
  /** Set to true once dashboard data has finished loading */
  dataLoaded: boolean;
  /** Called when user clicks "Trò chuyện với AI" */
  onOpenChat: () => void;
}

export default function DashboardAIGreeting({
  context,
  dataLoaded,
  onOpenChat,
}: Props) {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Trigger once when data is ready; never re-fetch on re-renders
    if (!dataLoaded || hasFetched.current) return;
    hasFetched.current = true;

    const fetchGreeting = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/greet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...context,
            hour: new Date().getHours(),
          }),
        });
        const data = res.ok ? await res.json() : null;
        setGreeting(
          data?.greeting ??
            `Chào ${context.userName ?? "bạn"}! Hôm nay bạn muốn đạt được gì? Mình sẵn sàng đồng hành nhé 🌟`,
        );
      } catch {
        setGreeting(
          `Chào ${context.userName ?? "bạn"}! Hôm nay bạn muốn đạt được gì? Mình sẵn sàng đồng hành nhé 🌟`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGreeting();
  }, [dataLoaded, context]);

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {loading || !greeting ? (
          <div className="flex items-center gap-1.5 h-5">
            <span className="text-white/70 text-sm">AI đang nghĩ</span>
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-white/60 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </div>
        ) : (
          <p className="text-white/90 text-sm leading-relaxed">{greeting}</p>
        )}
      </div>

      {/* Chat button */}
      {greeting && !loading && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onOpenChat}
          className="shrink-0 h-7 px-2 text-white/80 hover:text-white hover:bg-white/20 text-xs gap-1"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Trò chuyện
        </Button>
      )}
    </div>
  );
}
