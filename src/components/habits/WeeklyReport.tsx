"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WeeklyData {
  date: string;
  score: number;
  exercise: number;
  water: number;
  sleep: number;
  calories: number;
}

interface WeeklyReportProps {
  data: WeeklyData[];
}

export default function WeeklyReport({ data }: WeeklyReportProps) {
  const avgScore = data.reduce((acc, d) => acc + d.score, 0) / data.length;

  // Format date for display (MM/DD)
  const formattedData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString("vi-VN", {
      month: "2-digit",
      day: "2-digit",
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Báo Cáo Tuần</CardTitle>
        <CardDescription>
          Điểm trung bình:{" "}
          <span className="font-bold text-[#6961d5]">
            {avgScore.toFixed(1)}/100
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#6961d5"
              strokeWidth={2}
              name="Điểm"
              dot={{ fill: "#6961d5" }}
            />
            <Line
              type="monotone"
              dataKey="exercise"
              stroke="#10b981"
              name="Thể dục (giờ)"
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="water"
              stroke="#3b82f6"
              name="Nước (lít)"
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="sleep"
              stroke="#f59e0b"
              name="Ngủ (giờ)"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="text-sm text-gray-800">Thể dục TB</p>
            <p className="text-xl font-bold text-green-600">
              {(
                data.reduce((acc, d) => acc + d.exercise, 0) / data.length
              ).toFixed(1)}
              h
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <p className="text-sm text-gray-800">Nước TB</p>
            <p className="text-xl font-bold text-blue-600">
              {(
                data.reduce((acc, d) => acc + d.water, 0) / data.length
              ).toFixed(1)}
              L
            </p>
          </div>
          <div className="rounded-lg bg-yellow-50 p-3 text-center">
            <p className="text-sm text-gray-800">Ngủ TB</p>
            <p className="text-xl font-bold text-yellow-600">
              {(
                data.reduce((acc, d) => acc + d.sleep, 0) / data.length
              ).toFixed(1)}
              h
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3 text-center">
            <p className="text-sm text-gray-800">Calo TB</p>
            <p className="text-xl font-bold text-purple-600">
              {Math.round(
                data.reduce((acc, d) => acc + d.calories, 0) / data.length,
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
