"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export interface WeeklyDay {
  date: string;
  label: string;
  habitScore: number;
  tasksCreated: number;
  waterMl: number;
  waterPercent: number;
}

interface TooltipEntry {
  dataKey: string;
  value: number;
  payload: WeeklyDay;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const habitScore =
    payload.find((p) => p.dataKey === "habitScore")?.value ?? 0;
  const waterEntry = payload.find((p) => p.dataKey === "waterPercent");
  const waterPercent = waterEntry?.value ?? 0;
  const waterMl = waterEntry?.payload?.waterMl ?? 0;
  const tasksCreated = waterEntry?.payload?.tasksCreated ?? 0;

  return (
    <div className="rounded-lg border border-border bg-card shadow-lg p-3 text-xs space-y-1.5 min-w-[140px]">
      <p className="font-semibold text-foreground">{label}</p>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#6961d5]" />
          Điểm thói quen
        </span>
        <span className="font-medium text-foreground">{habitScore}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
          Nước uống
        </span>
        <span className="font-medium text-foreground">
          {waterPercent}% ({waterMl} ml)
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#34d399]" />
          Tasks tạo
        </span>
        <span className="font-medium text-foreground">{tasksCreated}</span>
      </div>
    </div>
  );
}

interface WeeklyActivityChartProps {
  data: WeeklyDay[];
  loading?: boolean;
}

export default function WeeklyActivityChart({
  data,
  loading,
}: WeeklyActivityChartProps) {
  const avgScore =
    data.length > 0
      ? Math.round(
          data.reduce((s, d) => s + d.habitScore, 0) /
            data.filter((d) => d.habitScore > 0).length || 0,
        )
      : 0;
  const totalTasks = data.reduce((s, d) => s + d.tasksCreated, 0);
  const avgWater =
    data.length > 0
      ? Math.round(
          data.reduce((s, d) => s + d.waterPercent, 0) /
            data.filter((d) => d.waterPercent > 0).length || 0,
        )
      : 0;

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-[#6961d5]" />
            Hoạt động 7 ngày qua
          </CardTitle>
          {/* Summary pills */}
          <div className="flex gap-2 flex-wrap text-xs">
            <span className="px-2 py-1 rounded-full bg-[#6961d5]/10 text-[#6961d5] font-medium">
              Điểm TB: {isNaN(avgScore) ? "—" : avgScore}
            </span>
            <span className="px-2 py-1 rounded-full bg-sky-100 dark:bg-sky-950/40 text-sky-600 font-medium">
              Nước TB: {isNaN(avgWater) ? "—" : `${avgWater}%`}
            </span>
            <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 font-medium">
              Tasks: {totalTasks}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
            Đang tải...
          </div>
        ) : data.every(
            (d) =>
              d.habitScore === 0 &&
              d.waterPercent === 0 &&
              d.tasksCreated === 0,
          ) ? (
          <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
            <TrendingUp className="w-8 h-8 opacity-20" />
            <p>Chưa có dữ liệu — hãy bắt đầu check-in thói quen!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Water percent — soft bar in background */}
              <Bar
                dataKey="waterPercent"
                name="Nước uống %"
                fill="#38bdf8"
                radius={[4, 4, 0, 0]}
                opacity={0.35}
                maxBarSize={32}
              />
              {/* Habit score — bold line on top */}
              <Line
                type="monotone"
                dataKey="habitScore"
                name="Điểm thói quen"
                stroke="#6961d5"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#6961d5", strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              {/* Tasks created — dashed green line */}
              <Line
                type="monotone"
                dataKey="tasksCreated"
                name="Tasks tạo"
                stroke="#34d399"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{ r: 3, fill: "#34d399", strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Legend
                formatter={(value) => (
                  <span
                    style={{ fontSize: 11, color: "var(--muted-foreground)" }}
                  >
                    {value}
                  </span>
                )}
                iconType="circle"
                iconSize={8}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
