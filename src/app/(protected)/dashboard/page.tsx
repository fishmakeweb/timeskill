"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { calculateStreak } from "@/lib/habitCalculations";
import { sortTasksByPriority } from "@/lib/taskUtils";
import {
  Droplets,
  Moon,
  CheckSquare,
  GraduationCap,
  Flame,
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
  Sun,
  Sunset,
  Coffee,
  Sparkles,
  ClipboardList,
} from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Chào buổi sáng", icon: Coffee };
  if (h < 17) return { text: "Chào buổi chiều", icon: Sun };
  if (h < 21) return { text: "Chào buổi tối", icon: Sunset };
  return { text: "Chúc ngủ ngon", icon: Moon };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [gpa, setGpa] = useState<number | null>(null);
  const [waterToday, setWaterToday] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];

    await Promise.allSettled([
      fetch(`/api/habits?date=${today}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          if (data.length > 0) setTodayScore(data[0].score);
        }),

      fetch(
        `/api/habits?start=${new Date(Date.now() - 30 * 864e5).toISOString().split("T")[0]}&end=${today}`,
      )
        .then((r) => (r.ok ? r.json() : []))
        .then((habits) => setStreak(calculateStreak(habits))),

      fetch("/api/tasks")
        .then((r) => (r.ok ? r.json() : []))
        .then((tasks) =>
          setUpcomingTasks(sortTasksByPriority(tasks).slice(0, 5)),
        ),

      fetch("/api/gpa")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.gpa != null) setGpa(data.gpa);
        }),

      fetch(`/api/water?date=${today}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            setWaterToday(data.totalMl ?? 0);
            setWaterGoal(data.goalMl ?? 2000);
          }
        }),
    ]);
    setLoading(false);
  };

  const { text: greetText, icon: GreetIcon } = getGreeting();
  const pendingTasks = upcomingTasks.filter(
    (t) => t.status !== "completed",
  ).length;
  const waterPercent = Math.min(
    100,
    Math.round((waterToday / waterGoal) * 100),
  );

  const stats = [
    {
      label: "Điểm hôm nay",
      value: todayScore !== null ? `${todayScore}` : "—",
      sub: "/ 100 điểm",
      icon: Star,
      color: "text-[#6961d5]",
      bg: "bg-[#6961d5]/10",
      link: "/habits",
    },
    {
      label: "Streak 🔥",
      value: `${streak}`,
      sub: "ngày liên tiếp",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      link: "/habits",
    },
    {
      label: "Tasks chờ xử lý",
      value: `${pendingTasks}`,
      sub: "nhiệm vụ",
      icon: CheckSquare,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      link: "/tasks",
    },
    {
      label: "GPA hiện tại",
      value: gpa !== null ? gpa.toFixed(2) : "—",
      sub: "điểm trung bình",
      icon: GraduationCap,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/30",
      link: "/courses",
    },
  ];

  const quickActions = [
    {
      label: "Log nước uống",
      icon: Droplets,
      href: "/water",
      color: "text-blue-500",
    },
    {
      label: "Thêm nhiệm vụ",
      icon: Plus,
      href: "/tasks",
      color: "text-[#6961d5]",
    },
    {
      label: "Check-in thói quen",
      icon: ClipboardList,
      href: "/habits",
      color: "text-orange-500",
    },
    {
      label: "Thêm môn học",
      icon: TrendingUp,
      href: "/courses",
      color: "text-green-500",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Greeting Banner */}
      <Card className="border-0 bg-linear-to-r from-[#6961d5] to-[#8b82e8] text-white shadow-lg">
        <CardContent className="py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <GreetIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{greetText}!</span>
            </div>
            <h1 className="text-2xl font-bold">
              {session?.user?.name ?? "Bạn"} 👋
            </h1>
            <p className="text-white/80 text-sm mt-1">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2">
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => {
                /* AI chat opens via layout */
              }}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              AI Gợi Ý
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-5 pb-4">
                  <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.sub}
                  </p>
                  <p className="text-xs font-medium text-foreground mt-1">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Water Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="w-4 h-4 text-blue-500" />
              Nước uống hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-blue-500">
                {waterToday}
              </span>
              <span className="text-muted-foreground text-sm">
                / {waterGoal} ml
              </span>
            </div>
            <Progress value={waterPercent} className="h-3" />
            <div className="flex items-center justify-between">
              <Badge
                variant={waterPercent >= 100 ? "default" : "secondary"}
                className="text-xs"
              >
                {waterPercent >= 100
                  ? "🎉 Đạt mục tiêu!"
                  : `${waterPercent}% mục tiêu`}
              </Badge>
              <Link href="/water">
                <Button variant="ghost" size="sm" className="text-xs">
                  Log thêm <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">⚡ Hành động nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}>
                    <Button
                      variant="outline"
                      className="w-full h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
                    >
                      <Icon className={`w-5 h-5 ${action.color}`} />
                      <span className="text-center leading-tight">
                        {action.label}
                      </span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">📅 Nhiệm vụ sắp tới</CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="text-xs">
                  Xem tất cả <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Chưa có nhiệm vụ nào</p>
                <Link href="/tasks">
                  <Button size="sm" variant="outline" className="mt-3 text-xs">
                    Thêm nhiệm vụ
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {upcomingTasks.map((task) => (
                  <li
                    key={task.id ?? task._id}
                    className="flex items-center justify-between py-1"
                  >
                    <span
                      className={`text-sm flex-1 mr-2 ${
                        task.status === "completed"
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </span>
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "default"
                          : task.priority === "medium"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs shrink-0"
                    >
                      {task.priority === "high"
                        ? "Cao"
                        : task.priority === "medium"
                          ? "TB"
                          : "Thấp"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Điều hướng nhanh
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: "/habits",
              icon: "📊",
              label: "Thói Quen",
              desc: "Theo dõi hàng ngày",
              color: "from-[#6961d5] to-[#8b82e8]",
            },
            {
              href: "/tasks",
              icon: "✅",
              label: "Nhiệm Vụ",
              desc: "Quản lý deadline",
              color: "from-blue-500 to-blue-600",
            },
            {
              href: "/courses",
              icon: "🎓",
              label: "GPA",
              desc: "Theo dõi điểm số",
              color: "from-green-500 to-green-600",
            },
            {
              href: "/notes",
              icon: "📝",
              label: "Ghi Chú",
              desc: "Học tập + AI Quiz",
              color: "from-orange-500 to-orange-600",
            },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden">
                <CardContent className="p-0">
                  <div
                    className={`bg-linear-to-br ${item.color} p-4 text-white`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-semibold mt-1">{item.label}</h3>
                    <p className="text-white/80 text-xs">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
