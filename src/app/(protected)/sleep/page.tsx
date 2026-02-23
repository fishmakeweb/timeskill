"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Trash2, TrendingUp, Clock, Star } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface SleepLog {
  _id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationHours: number;
  quality: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

const QUALITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Rất tệ 😫", color: "text-red-500" },
  2: { label: "Tệ 😔", color: "text-orange-500" },
  3: { label: "Bình thường 😐", color: "text-yellow-500" },
  4: { label: "Tốt 😊", color: "text-blue-500" },
  5: { label: "Xuất sắc 😴✨", color: "text-green-500" },
};

export default function SleepPage() {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bedtime: "",
    wakeTime: "",
    quality: 3,
    notes: "",
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sleep?limit=14");
      if (res.ok) {
        setLogs(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    // Set default times
    const now = new Date();
    const wakeHour = now.getHours() < 12 ? now : new Date();
    setFormData((prev) => ({
      ...prev,
      wakeTime: formatLocalDatetime(wakeHour),
      bedtime: formatLocalDatetime(new Date(now.getTime() - 8 * 3600 * 1000)),
    }));
  }, [fetchLogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bedtime || !formData.wakeTime) {
      toast.error("Vui lòng nhập giờ đi ngủ và thức dậy");
      return;
    }

    const bedtime = new Date(formData.bedtime);
    const wakeTime = new Date(formData.wakeTime);
    const durationHours = (wakeTime.getTime() - bedtime.getTime()) / 3600000;

    if (durationHours <= 0 || durationHours > 24) {
      toast.error("Thời gian không hợp lệ. Giờ thức dậy phải sau giờ đi ngủ.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedtime: bedtime.toISOString(),
          wakeTime: wakeTime.toISOString(),
          quality: formData.quality,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        toast.success(`😴 Đã ghi: ${durationHours.toFixed(1)} giờ ngủ!`);
        setFormData({ bedtime: "", wakeTime: "", quality: 3, notes: "" });
        fetchLogs();
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Không thể lưu");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deletLog = async (id: string) => {
    if (!confirm("Xóa bản ghi này?")) return;
    const res = await fetch(`/api/sleep/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Đã xóa");
      setLogs((prev) => prev.filter((l) => l._id !== id));
    }
  };

  // Stats
  const avgDuration =
    logs.length > 0
      ? (logs.reduce((s, l) => s + l.durationHours, 0) / logs.length).toFixed(1)
      : null;
  const avgQuality =
    logs.length > 0
      ? (logs.reduce((s, l) => s + l.quality, 0) / logs.length).toFixed(1)
      : null;
  const goodNights = logs.filter((l) => l.durationHours >= 7).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Moon className="w-7 h-7 text-indigo-500" />
          Theo Dõi Giấc Ngủ
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Log giấc ngủ và theo dõi chất lượng nghỉ ngơi
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Clock className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-indigo-500">
              {avgDuration ?? "—"}
            </div>
            <p className="text-xs text-muted-foreground">Giờ TB/đêm</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-yellow-500">
              {avgQuality ?? "—"}
            </div>
            <p className="text-xs text-muted-foreground">Chất lượng TB</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-500">
              {goodNights}
            </div>
            <p className="text-xs text-muted-foreground">Đêm đủ 7h+ (2 tuần)</p>
          </CardContent>
        </Card>
      </div>

      {/* Log Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">+ Ghi lại giấc ngủ</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1 mb-1.5">
                  <Moon className="w-3.5 h-3.5" />
                  Giờ đi ngủ
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.bedtime}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, bedtime: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label className="flex items-center gap-1 mb-1.5">
                  <Sun className="w-3.5 h-3.5" />
                  Giờ thức dậy
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.wakeTime}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, wakeTime: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {formData.bedtime && formData.wakeTime && (
              <div className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
                ⏱️ Thời gian ngủ:{" "}
                <strong>
                  {(() => {
                    const h =
                      (new Date(formData.wakeTime).getTime() -
                        new Date(formData.bedtime).getTime()) /
                      3600000;
                    return h > 0 ? `${h.toFixed(1)} giờ` : "Không hợp lệ";
                  })()}
                </strong>
              </div>
            )}

            <div>
              <Label className="mb-2 block">
                Chất lượng giấc ngủ:{" "}
                <span className={QUALITY_LABELS[formData.quality].color}>
                  {QUALITY_LABELS[formData.quality].label}
                </span>
              </Label>
              <Slider
                value={[formData.quality]}
                onValueChange={([v]) =>
                  setFormData((p) => ({
                    ...p,
                    quality: v as 1 | 2 | 3 | 4 | 5,
                  }))
                }
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Rất tệ</span>
                <span>Xuất sắc</span>
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">Ghi chú (tùy chọn)</Label>
              <Textarea
                placeholder="Ví dụ: Ngủ không ngon, hay mộng mị..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, notes: e.target.value }))
                }
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Đang lưu..." : "💾 Lưu giấc ngủ"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sleep History */}
      {logs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              📊 Lịch sử 2 tuần gần nhất
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.map((log) => (
              <div key={log._id} className="flex items-center gap-3 py-2">
                {/* Duration badge */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    log.durationHours >= 7
                      ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                      : log.durationHours >= 6
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                  }`}
                >
                  {log.durationHours.toFixed(1)}h
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {format(new Date(log.wakeTime), "EEE dd/MM", {
                        locale: vi,
                      })}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${QUALITY_LABELS[log.quality].color}`}
                    >
                      {"⭐".repeat(log.quality)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(log.bedtime), "HH:mm")} →{" "}
                    {format(new Date(log.wakeTime), "HH:mm")}
                    {log.notes && (
                      <span className="ml-2 italic">· {log.notes}</span>
                    )}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => deletLog(log._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {logs.length === 0 && (
        <Card className="text-center py-10">
          <Moon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Chưa có dữ liệu giấc ngủ</p>
          <p className="text-sm text-muted-foreground">
            Hãy bắt đầu ghi log ngay!
          </p>
        </Card>
      )}
    </div>
  );
}

function formatLocalDatetime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
