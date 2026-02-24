"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Droplets,
  Moon,
  Flame,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Zap,
} from "lucide-react";
import {
  calculateStreak,
  generateInsights,
  getWeeklyData,
} from "@/lib/habitCalculations";

const HABIT_GOALS = { exercise: 30, water: 8, sleep: 8, calories: 2000 };

const HABIT_CONFIG = [
  {
    key: "exercise",
    label: "Tập thể dục",
    icon: Activity,
    unit: "phút",
    goal: HABIT_GOALS.exercise,
    color: "text-orange-500",
    bg: "bg-orange-500",
    lightBg: "bg-orange-50 dark:bg-orange-950/20",
  },
  {
    key: "water",
    label: "Uống nước",
    icon: Droplets,
    unit: "ly",
    goal: HABIT_GOALS.water,
    color: "text-blue-500",
    bg: "bg-blue-500",
    lightBg: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    key: "sleep",
    label: "Giấc ngủ",
    icon: Moon,
    unit: "giờ",
    goal: HABIT_GOALS.sleep,
    color: "text-purple-500",
    bg: "bg-purple-500",
    lightBg: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    key: "calories",
    label: "Calo tiêu thụ",
    icon: Flame,
    unit: "kcal",
    goal: HABIT_GOALS.calories,
    color: "text-red-500",
    bg: "bg-red-500",
    lightBg: "bg-red-50 dark:bg-red-950/20",
  },
];

interface HabitEntry {
  _id?: string;
  date: string;
  exercise: number;
  water: number;
  sleep: number;
  calories: number;
  score: number;
}

export default function HabitsPage() {
  const [todayHabit, setTodayHabit] = useState<HabitEntry | null>(null);
  const [weekHabits, setWeekHabits] = useState<HabitEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    exercise: 0,
    water: 0,
    sleep: 0,
    calories: 0,
  });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    const today = new Date().toISOString().split("T")[0];

    // Parallel-fetch habits, water, sleep and weekly data
    const [todayRes, waterRes, sleepRes, weekRes] = await Promise.all([
      fetch(`/api/habits?date=${today}`),
      fetch(`/api/water?date=${today}`),
      fetch("/api/sleep?limit=1"),
      fetch("/api/habits?days=7"),
    ]);

    // Base habit values from the habits collection
    let habitData = { exercise: 0, water: 0, sleep: 0, calories: 0 };
    let existingHabit: HabitEntry | null = null;
    if (todayRes.ok) {
      const data = await todayRes.json();
      if (data.length > 0) {
        existingHabit = data[0];
        habitData = {
          exercise: data[0].exercise,
          water: data[0].water,
          sleep: data[0].sleep,
          calories: data[0].calories,
        };
      }
    }

    // Sync water: override with ml → glasses from dedicated water API
    // 250 ml ≈ 1 standard glass
    if (waterRes.ok) {
      const waterData = await waterRes.json();
      if (waterData?.totalMl > 0) {
        habitData.water = Math.round(waterData.totalMl / 250);
      }
    }

    // Sync sleep: override with durationHours from most recent sleep log if it's from today
    if (sleepRes.ok) {
      const sleepLogs = await sleepRes.json();
      if (Array.isArray(sleepLogs) && sleepLogs.length > 0) {
        const latestLog = sleepLogs[0];
        const logDate = new Date(latestLog.wakeTime ?? latestLog.date ?? "");
        const todayMidnight = new Date(today);
        const tomorrowMidnight = new Date(today);
        tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
        if (logDate >= todayMidnight && logDate < tomorrowMidnight) {
          habitData.sleep = Math.round(latestLog.durationHours * 10) / 10;
        }
      }
    }

    setTodayHabit(existingHabit);
    setFormData(habitData);

    if (weekRes.ok) {
      const data = await weekRes.json();
      setWeekHabits(data);
      setStreak(calculateStreak(data));
      setInsights(generateInsights(data));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const method = todayHabit ? "PUT" : "POST";
      const url = todayHabit ? `/api/habits/${todayHabit._id}` : "/api/habits";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, date: today }),
      });
      if (res.ok) {
        toast.success("Đã lưu thói quen!");
        fetchHabits();
      } else toast.error("Lỗi lưu dữ liệu");
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const getProgressPct = (key: keyof typeof formData) =>
    Math.min(100, Math.round((formData[key] / HABIT_GOALS[key]) * 100));

  const allGoalsMet = HABIT_CONFIG.every(
    (h) => formData[h.key as keyof typeof formData] >= h.goal,
  );

  const weeklyData = HABIT_CONFIG.map((h) => {
    const weekData = getWeeklyData(weekHabits as HabitEntry[]);
    const avg =
      weekData.length > 0
        ? weekData.reduce(
            (s, v) => s + (v[h.key as keyof typeof v] as number),
            0,
          ) / weekData.length
        : 0;
    return { ...h, avg: Math.round(avg) };
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#6961d5]" />
            Thói Quen Hằng Ngày
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Theo dõi sức khỏe và thói quen của bạn
          </p>
        </div>
        {streak > 0 && (
          <Badge className="bg-orange-500 gap-1">
            <Flame className="w-3 h-3" /> {streak} ngày
          </Badge>
        )}
      </div>

      <Tabs defaultValue="today">
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="today">Hôm nay</TabsTrigger>
          <TabsTrigger value="week">Tuần này</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            {HABIT_CONFIG.map((h) => {
              const Icon = h.icon;
              const pct = getProgressPct(h.key as keyof typeof formData);
              const val = formData[h.key as keyof typeof formData];
              return (
                <Card key={h.key} className={`${h.lightBg} border-0`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${h.color}`} />
                        <span className="text-sm font-medium">{h.label}</span>
                      </div>
                      {pct >= 100 && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className={`text-2xl font-bold ${h.color}`}>
                        {val}
                      </span>
                      <span className="text-xs text-muted-foreground mb-1">
                        / {h.goal} {h.unit}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {pct}% mục tiêu
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#6961d5]" />
                Cập nhật hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {HABIT_CONFIG.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.key}>
                    <Label className="flex items-center gap-2 mb-1.5">
                      <Icon className={`w-4 h-4 ${h.color}`} />
                      {h.label}{" "}
                      <span className="text-muted-foreground text-xs">
                        (mục tiêu: {h.goal} {h.unit})
                      </span>
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData[h.key as keyof typeof formData]}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          [h.key]: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                );
              })}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#6961d5] hover:bg-[#5a52c0]"
              >
                {saving
                  ? "Đang lưu..."
                  : todayHabit
                    ? "Cập nhật"
                    : "Lưu hôm nay"}
              </Button>
              {allGoalsMet && (
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Tuyệt vời! Bạn đã đạt tất cả mục tiêu hôm nay!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4 mt-4">
          {insights.length > 0 && (
            <Card className="border-[#6961d5]/20 bg-secondary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#6961d5]" />
                  Nhận xét tuần này
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {insights.map((insight, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-[#6961d5]">&#8226;</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            {weeklyData.map((h) => {
              const Icon = h.icon;
              const pct = Math.min(100, Math.round((h.avg / h.goal) * 100));
              return (
                <Card key={h.key}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${h.color}`} />
                      <span className="text-xs font-medium">{h.label}</span>
                    </div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className={`text-xl font-bold ${h.color}`}>
                        {h.avg}
                      </span>
                      <span className="text-xs text-muted-foreground mb-0.5">
                        {h.unit} TB
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {pct}% mục tiêu
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#6961d5]" />
                Lịch sử 7 ngày
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weekHabits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có dữ liệu tuần này
                </p>
              ) : (
                <div className="space-y-2">
                  {weekHabits.map((h) => {
                    const met = HABIT_CONFIG.filter(
                      (c) => (h[c.key as keyof HabitEntry] as number) >= c.goal,
                    ).length;
                    return (
                      <div key={h._id} className="flex items-center gap-3">
                        <div className="text-xs text-muted-foreground w-12 flex-shrink-0">
                          {new Date(h.date).toLocaleDateString("vi-VN", {
                            weekday: "short",
                          })}
                        </div>
                        <div className="flex-1 grid grid-cols-4 gap-1">
                          {HABIT_CONFIG.map((c) => {
                            const val = h[c.key as keyof HabitEntry] as number;
                            return (
                              <div
                                key={c.key}
                                className={`h-2 rounded-full ${val >= c.goal ? c.bg : "bg-muted"}`}
                              />
                            );
                          })}
                        </div>
                        <Badge
                          variant={met === 4 ? "default" : "secondary"}
                          className="text-[10px] h-5 flex-shrink-0"
                        >
                          {met}/4
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
