"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Coffee,
  Brain,
  CheckCircle2,
} from "lucide-react";

type Phase = "work" | "short-break" | "long-break";

const PHASE_LABELS: Record<Phase, string> = {
  work: "🧠 Tập Trung",
  "short-break": "☕ Nghỉ Ngắn",
  "long-break": "🛋️ Nghỉ Dài",
};

const PHASE_COLORS: Record<Phase, string> = {
  work: "text-[#6961d5]",
  "short-break": "text-green-500",
  "long-break": "text-blue-500",
};

const PHASE_BG: Record<Phase, string> = {
  work: "from-[#6961d5] to-[#8b82e8]",
  "short-break": "from-green-500 to-green-600",
  "long-break": "from-blue-500 to-blue-600",
};

export default function FocusPage() {
  const [settings, setSettings] = useState({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakAfter: 4,
  });
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(settings.work * 60);
  const [running, setRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getPhaseDuration = useCallback(
    (p: Phase) => {
      if (p === "work") return settings.work * 60;
      if (p === "short-break") return settings.shortBreak * 60;
      return settings.longBreak * 60;
    },
    [settings],
  );

  // Reset timer when phase changes
  useEffect(() => {
    setSecondsLeft(getPhaseDuration(phase));
    setRunning(false);
  }, [phase, getPhaseDuration]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);

            // Play notification sound (if available)
            try {
              new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...")
                .play()
                .catch(() => {});
            } catch {}

            // Auto advance
            if (phase === "work") {
              const next = completedPomodoros + 1;
              setCompletedPomodoros(next);
              if (next % settings.longBreakAfter === 0) {
                setPhase("long-break");
              } else {
                setPhase("short-break");
              }
            } else {
              setPhase("work");
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phase, completedPomodoros, settings.longBreakAfter]);

  const toggleTimer = () => setRunning((r) => !r);

  const resetTimer = () => {
    setRunning(false);
    setSecondsLeft(getPhaseDuration(phase));
  };

  const resetAll = () => {
    setRunning(false);
    setPhase("work");
    setCompletedPomodoros(0);
    setSecondsLeft(settings.work * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const totalSeconds = getPhaseDuration(phase);
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const circumference = 2 * Math.PI * 90; // r=90

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Timer className="w-7 h-7 text-[#6961d5]" />
          Chế Độ Tập Trung
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Pomodoro Timer — học tập hiệu quả hơn với chu kỳ tập trung / nghỉ ngơi
        </p>
      </div>

      {/* Phase Selector */}
      <div className="flex gap-2">
        {(["work", "short-break", "long-break"] as Phase[]).map((p) => (
          <Button
            key={p}
            variant={phase === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPhase(p)}
            className={phase === p ? "flex-1" : "flex-1 text-muted-foreground"}
          >
            {p === "work"
              ? "Tập trung"
              : p === "short-break"
                ? "Nghỉ ngắn"
                : "Nghỉ dài"}
          </Button>
        ))}
      </div>

      {/* Timer Circle */}
      <Card className="overflow-hidden">
        <div className={`bg-linear-to-br ${PHASE_BG[phase]} p-8`}>
          <div className="flex flex-col items-center">
            <p className="text-white/90 font-medium mb-6">
              {PHASE_LABELS[phase]}
            </p>

            {/* SVG Circle Timer */}
            <div className="relative w-52 h-52">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={
                    circumference - (progress / 100) * circumference
                  }
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white tabular-nums">
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </span>
                <span className="text-white/70 text-sm mt-1">
                  {running ? "Đang chạy..." : "Sẵn sàng"}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-6">
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 text-white hover:bg-white/20 rounded-full"
                onClick={resetTimer}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                className="h-16 w-16 rounded-full bg-white hover:bg-white/90 text-[#6961d5] shadow-lg"
                onClick={toggleTimer}
              >
                {running ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-0.5" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 text-white hover:bg-white/20 rounded-full"
                onClick={resetAll}
              >
                <RotateCcw className="w-5 h-5 opacity-60" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">
          Pomodoros hôm nay:
        </span>
        {Array.from({ length: Math.max(completedPomodoros, 4) }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i < completedPomodoros ? "bg-[#6961d5]" : "bg-muted"
            }`}
          />
        ))}
        {completedPomodoros > 0 && (
          <Badge className="ml-2 bg-[#6961d5]">{completedPomodoros} 🍅</Badge>
        )}
      </div>

      {/* Settings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">⚙️ Cài đặt thời gian</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? "Ẩn" : "Chỉnh sửa"}
            </Button>
          </div>
        </CardHeader>
        {showSettings && (
          <CardContent className="space-y-5">
            <div>
              <Label className="flex justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-[#6961d5]" />
                  Tập trung
                </span>
                <span className="font-bold text-[#6961d5]">
                  {settings.work} phút
                </span>
              </Label>
              <Slider
                value={[settings.work]}
                onValueChange={([v]) => setSettings((p) => ({ ...p, work: v }))}
                min={5}
                max={60}
                step={5}
              />
            </div>
            <div>
              <Label className="flex justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-green-500" />
                  Nghỉ ngắn
                </span>
                <span className="font-bold text-green-500">
                  {settings.shortBreak} phút
                </span>
              </Label>
              <Slider
                value={[settings.shortBreak]}
                onValueChange={([v]) =>
                  setSettings((p) => ({ ...p, shortBreak: v }))
                }
                min={1}
                max={15}
                step={1}
              />
            </div>
            <div>
              <Label className="flex justify-between mb-2">
                <span className="flex items-center gap-1.5">🛋️ Nghỉ dài</span>
                <span className="font-bold text-blue-500">
                  {settings.longBreak} phút
                </span>
              </Label>
              <Slider
                value={[settings.longBreak]}
                onValueChange={([v]) =>
                  setSettings((p) => ({ ...p, longBreak: v }))
                }
                min={5}
                max={30}
                step={5}
              />
            </div>
            <div>
              <Label className="flex justify-between mb-2">
                <span>Nghỉ dài sau mỗi</span>
                <span className="font-bold">
                  {settings.longBreakAfter} Pomodoros
                </span>
              </Label>
              <Slider
                value={[settings.longBreakAfter]}
                onValueChange={([v]) =>
                  setSettings((p) => ({ ...p, longBreakAfter: v }))
                }
                min={2}
                max={8}
                step={1}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tips */}
      <Card className="border-[#6961d5]/20 bg-secondary/50">
        <CardContent className="py-4 px-5">
          <h3 className="font-semibold text-sm mb-2">💡 Kỹ thuật Pomodoro</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#6961d5] flex-shrink-0 mt-0.5" />
              Chọn 1 nhiệm vụ cụ thể trước khi bắt đầu
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#6961d5] flex-shrink-0 mt-0.5" />
              Tắt điện thoại, đóng tab mạng xã hội
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#6961d5] flex-shrink-0 mt-0.5" />
              Giờ nghỉ: đứng dậy, nhìn xa, uống nước
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#6961d5] flex-shrink-0 mt-0.5" />
              Sau 4 pomodoros = nghỉ dài 15–30 phút
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
