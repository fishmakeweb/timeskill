"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  context?: {
    todayScore?: number;
    streak?: number;
    gpa?: number;
    pendingTasks?: number;
  };
}

export default function AIAssistant({ context }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Xin chào! Tôi là AI Assistant của TimeSkill. Tôi có thể giúp gì cho bạn? Bạn có thể hỏi về:\n\n• Cách cải thiện điểm thói quen\n• Quản lý tasks hiệu quả\n• Cách tính GPA\n• Lời khuyên cá nhân hóa",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, context }),
      });

      if (response.ok) {
        const { reply } = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } else {
        const errorData = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `❌ ${errorData.error || "Có lỗi xảy ra. Vui lòng thử lại."}`,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Không thể kết nối đến AI. Vui lòng thử lại.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Làm sao để đạt 100 điểm?",
    "Cách sắp xếp tasks hiệu quả?",
    "GPA được tính như thế nào?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-r from-[#6961d5] to-[#8780e0] text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-pulse"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] md:w-96 animate-in slide-in-from-bottom-4">
          <Card className="shadow-2xl border-2 border-[#6961d5]">
            <CardHeader className="flex flex-row items-center justify-between bg-linear-to-r from-[#6961d5] to-[#8780e0] text-white rounded-t-lg p-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Assistant
              </CardTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:opacity-80 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-100 overflow-y-auto p-4 space-y-3 bg-linear-to-b from-gray-50 to-white">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                        msg.role === "user"
                          ? "bg-linear-to-r from-[#6961d5] to-[#8780e0] text-white"
                          : "bg-white border border-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[#6961d5] rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-[#6961d5] rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-[#6961d5] rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-800">
                          AI đang suy nghĩ...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length === 1 && !isLoading && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <p className="text-xs text-gray-800 mb-2">Câu hỏi gợi ý:</p>
                  <div className="space-y-2">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(q)}
                        className="w-full text-left text-sm p-2 rounded bg-white border border-gray-200 hover:border-[#6961d5] hover:bg-secondary transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Nhập câu hỏi..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    size="icon"
                    className="bg-[#6961d5] hover:bg-[#5751c0]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-700 mt-2">
                  Powered by AI • Trả lời có thể không hoàn toàn chính xác
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
