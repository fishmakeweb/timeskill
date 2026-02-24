"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Droplets,
  Plus,
  Trash2,
  Target,
  TrendingUp,
  Flame,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const QUICK_AMOUNTS = [150, 200, 250, 300, 500];

interface WaterEntry {
  time: string;
  amount: number;
}

interface WaterLog {
  totalMl: number;
  goalMl: number;
  entries: WaterEntry[];
}

interface WeekData {
  date: string;
  totalMl: number;
  goalMl: number;
}

export default function WaterPage() {
  const [log, setLog] = useState<WaterLog>({
    totalMl: 0,
    goalMl: 2000,
    entries: [],
  });
  const [weekData, setWeekData] = useState<WeekData[]>([]);
  const [customAmount, setCustomAmount] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, weekRes] = await Promise.all([
        fetch(`/api/water?date=${today}`),
        fetch(`/api/water?start=${getDateDaysAgo(6)}&end=${today}`),
      ]);

      if (todayRes.ok) {
        setLog(await todayRes.json());
      }
      if (weekRes.ok) {
        setWeekData(await weekRes.json());
      }
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addWater = async (amount: number) => {
    if (amount <= 0) return;
    setAdding(true);
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (res.ok) {
        const updated = await res.json();
        setLog(updated);
        const percent = Math.round((updated.totalMl / updated.goalMl) * 100);
        if (percent >= 100) {
          toast.success("🎉 Xuất sắc! Bạn đã đạt mục tiêu nước hôm nay!", {
            duration: 4000,
          });
        } else {
          toast.success(
            `💧 +${amount}ml — Tổng: ${updated.totalMl}ml (${percent}%)`,
          );
        }
        setCustomAmount("");
      } else {
        toast.error("Không thể ghi log nước");
      }
    } finally {
      setAdding(false);
    }
  };

  const removeLastEntry = async () => {
    const res = await fetch("/api/water", { method: "DELETE" });
    if (res.ok) {
      const updated = await res.json();
      setLog(updated);
      toast.success("Đã xóa lần uống cuối");
    } else {
      toast.error("Không thể xóa");
    }
  };

  const updateGoal = async () => {
    const goal = parseInt(newGoal);
    if (!goal || goal < 500 || goal > 10000) {
      toast.error("Mục tiêu phải từ 500 đến 10000 ml");
      return;
    }

    const res = await fetch("/api/water", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalMl: goal }),
    });

    if (res.ok) {
      const updated = await res.json();
      setLog(updated);
      setGoalDialogOpen(false);
      setNewGoal("");
      toast.success(`✅ Mục tiêu cập nhật: ${goal}ml/ngày`);
    }
  };

  const percent = Math.min(100, Math.round((log.totalMl / log.goalMl) * 100));
  const remaining = Math.max(0, log.goalMl - log.totalMl);
  const streak = weekData.filter((d) => d.totalMl >= d.goalMl).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Droplets className="w-7 h-7 text-blue-500" />
            Nước Uống Hôm Nay
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: vi })}
          </p>
        </div>
        <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Target className="w-4 h-4 mr-1" />
              Đặt mục tiêu
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Đặt mục tiêu nước uống</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Mục tiêu hàng ngày (ml)</Label>
                <Input
                  type="number"
                  placeholder={`Hiện tại: ${log.goalMl}ml`}
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  min={500}
                  max={10000}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Khuyến nghị: 2000–3000ml/ngày
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[1500, 2000, 2500, 3000].map((g) => (
                  <Button
                    key={g}
                    variant="outline"
                    size="sm"
                    onClick={() => setNewGoal(String(g))}
                  >
                    {g}ml
                  </Button>
                ))}
              </div>
              <Button onClick={updateGoal} className="w-full">
                Lưu mục tiêu
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Progress Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-5xl font-bold text-blue-500">
                {log.totalMl}
              </div>
              <div className="text-muted-foreground text-sm">
                / <span className="font-medium">{log.goalMl}</span> ml mục tiêu
              </div>
            </div>
            <div className="text-right">
              <Badge
                variant={percent >= 100 ? "default" : "secondary"}
                className={`text-lg px-4 py-2 ${percent >= 100 ? "bg-blue-500 hover:bg-blue-500" : ""}`}
              >
                {percent}%
              </Badge>
              {remaining > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Còn {remaining}ml
                </p>
              )}
            </div>
          </div>

          <Progress value={percent} className="h-4 rounded-full" />

          {percent >= 100 && (
            <div className="mt-3 text-center text-sm font-medium text-blue-600 dark:text-blue-400">
              🎉 Hoàn thành mục tiêu hôm nay! Tuyệt vời!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Add Buttons */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">💧 Thêm nhanh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {QUICK_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                className="flex flex-col h-auto py-3 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                onClick={() => addWater(amount)}
                disabled={adding}
              >
                <Droplets className="w-4 h-4 text-blue-500 mb-1" />
                <span className="text-xs font-semibold">{amount}ml</span>
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Lượng tùy chỉnh (ml)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addWater(parseInt(customAmount) || 0);
                }
              }}
              min={1}
              max={5000}
            />
            <Button
              onClick={() => addWater(parseInt(customAmount) || 0)}
              disabled={!customAmount || adding}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Thống kê tuần
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Đạt mục tiêu
              </span>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-bold">{streak}/7 ngày</span>
              </div>
            </div>
            {weekData.length > 0 && (
              <div className="space-y-1.5">
                {[...weekData]
                  .reverse()
                  .slice(0, 5)
                  .map((d, i) => {
                    const pct = Math.min(
                      100,
                      Math.round((d.totalMl / (d.goalMl || 2000)) * 100),
                    );
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20 shrink-0">
                          {format(new Date(d.date), "EEE, dd/MM", {
                            locale: vi,
                          })}
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-12 text-right">
                          {d.totalMl}ml
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Log */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">📋 Lịch sử hôm nay</CardTitle>
              {log.entries.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={removeLastEntry}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Xóa cuối
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {log.entries.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Droplets className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Chưa có lần uống nào</p>
                <p className="text-xs mt-1">Hãy uống nước ngay!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {[...log.entries].reverse().map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <Droplets className="w-3 h-3 text-blue-400" />
                      <span className="text-sm font-medium">
                        {entry.amount} ml
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.time), "HH:mm")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="py-4 px-5">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Mẹo:</strong> Uống 1 ly nước ngay sau khi thức dậy giúp
            khởi động hệ tiêu hóa và tăng tỉnh táo. Đặt nhắc nhở mỗi 1-2 giờ để
            duy trì thói quen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}
