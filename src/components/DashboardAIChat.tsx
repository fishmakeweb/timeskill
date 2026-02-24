"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface DashboardAIChatContext {
  todayScore?: number | null;
  streak?: number;
  gpa?: number | null;
  pendingTasks?: number;
  waterPercent?: number;
  userName?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  context: DashboardAIChatContext;
}

function buildQuickSuggestions(ctx: DashboardAIChatContext): string[] {
  const suggestions: string[] = [];
  if (ctx.todayScore == null)
    suggestions.push("Nhắc mình check-in thói quen hôm nay");
  if ((ctx.pendingTasks ?? 0) > 0)
    suggestions.push(`Mình có ${ctx.pendingTasks} task, ưu tiên làm gì trước?`);
  if ((ctx.waterPercent ?? 0) < 50)
    suggestions.push("Mình uống nước ít quá, cần uống bao nhiêu nữa?");
  if ((ctx.streak ?? 0) === 0)
    suggestions.push("Làm sao để bắt đầu xây dựng streak?");
  if (ctx.gpa == null) suggestions.push("Cách tính GPA như thế nào?");
  if (suggestions.length < 3)
    suggestions.push("Cách đạt 100 điểm thói quen?", "Gợi ý lịch học hiệu quả");
  return suggestions.slice(0, 3);
}

export default function DashboardAIChat({ open, onClose, context }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [greetLoading, setGreetLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const didGreet = useRef(false);

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, greetLoading]);

  const fetchGreeting = useCallback(async () => {
    setGreetLoading(true);
    setMessages([]);
    try {
      const res = await fetch("/api/ai/greet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...context,
          hour: new Date().getHours(),
        }),
      });
      const data = res.ok
        ? await res.json()
        : { greeting: "👋 Chào bạn! Mình có thể giúp gì hôm nay?" };
      setMessages([{ role: "assistant", content: data.greeting }]);
    } catch {
      setMessages([
        {
          role: "assistant",
          content: "👋 Chào bạn! Mình có thể giúp gì hôm nay?",
        },
      ]);
    } finally {
      setGreetLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [context]);

  // Fetch greeting once when panel first opens
  useEffect(() => {
    if (open && !didGreet.current) {
      didGreet.current = true;
      fetchGreeting();
    }
    if (!open) {
      didGreet.current = false;
    }
  }, [open, fetchGreeting]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          context: {
            todayScore: context.todayScore,
            streak: context.streak,
            gpa: context.gpa,
            pendingTasks: context.pendingTasks,
          },
        }),
      });
      const data = res.ok
        ? await res.json()
        : { reply: "❌ Có lỗi xảy ra, bạn thử lại nhé." };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? data.error },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Không thể kết nối. Vui lòng thử lại.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const quickSuggestions = buildQuickSuggestions(context);
  const showSuggestions = messages.length === 1 && !loading && !greetLoading;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:w-105 p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-4 py-3 bg-linear-to-r from-[#6961d5] to-[#8b82e8] text-white shrink-0">
          <SheetTitle className="flex items-center gap-2 text-white text-base">
            <Sparkles className="w-5 h-5" />
            AI Gợi Ý
            <Badge className="ml-auto bg-white/20 text-white text-[10px] border-0">
              TimeSkill AI
            </Badge>
          </SheetTitle>
          <p className="text-white/70 text-xs">
            Trợ lý cá nhân hóa theo dữ liệu của bạn
          </p>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {greetLoading ? (
            <div className="flex justify-start pt-2">
              <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 0.15, 0.3].map((delay) => (
                      <span
                        key={delay}
                        className="w-2 h-2 rounded-full bg-[#6961d5] animate-bounce"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    AI đang phân tích dữ liệu của bạn...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-[#6961d5] text-white rounded-tr-sm"
                      : "bg-secondary text-foreground rounded-tl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 0.15, 0.3].map((delay) => (
                    <span
                      key={delay}
                      className="w-2 h-2 rounded-full bg-[#6961d5] animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        {showSuggestions && (
          <div className="px-4 pb-2 space-y-1.5 shrink-0">
            <p className="text-[11px] text-muted-foreground">💡 Gợi ý nhanh:</p>
            {quickSuggestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border bg-background hover:border-[#6961d5] hover:bg-[#6961d5]/5 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Refresh greeting */}
        {messages.length > 0 && !greetLoading && (
          <div className="px-4 pb-1 shrink-0">
            <button
              onClick={fetchGreeting}
              disabled={greetLoading}
              className="text-[11px] text-muted-foreground hover:text-[#6961d5] flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Bắt đầu cuộc trò chuyện mới
            </button>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-border shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              placeholder="Nhập câu hỏi..."
              disabled={loading || greetLoading}
              className="flex-1 text-sm"
            />
            <Button
              size="icon"
              onClick={() => sendMessage()}
              disabled={loading || greetLoading || !input.trim()}
              className="bg-[#6961d5] hover:bg-[#5a52c0] shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            Powered by AI · Câu trả lời có thể không hoàn toàn chính xác
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
