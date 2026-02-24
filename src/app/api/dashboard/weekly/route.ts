import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Habit from "@/models/Habit";
import Task from "@/models/Task";
import WaterLog from "@/models/WaterLog";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

// GET /api/dashboard/weekly
// Returns aggregated data for the last 7 days (today included).
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Build array of the last 7 calendar days (oldest → newest)
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }

    const rangeStart = days[0];
    const rangeEnd = new Date(days[6]);
    rangeEnd.setHours(23, 59, 59, 999);

    // Fetch all three datasets in parallel
    const [habits, tasks, waterLogs] = await Promise.all([
      Habit.find({
        userId: session.user.id,
        date: { $gte: rangeStart, $lte: rangeEnd },
      }),
      Task.find({
        userId: session.user.id,
        createdAt: { $gte: rangeStart, $lte: rangeEnd },
      }),
      WaterLog.find({
        userId: session.user.id,
        date: { $gte: rangeStart, $lte: rangeEnd },
      }),
    ]);

    // Helper: match a record's date to one of our day buckets
    const dayKey = (d: Date) => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      return copy.getTime();
    };

    // Index by day timestamp for O(1) lookup
    const habitByDay = new Map<number, number>();
    habits.forEach((h: any) => {
      habitByDay.set(dayKey(h.date), h.score ?? 0);
    });

    const tasksByDay = new Map<number, number>();
    tasks.forEach((t: any) => {
      const k = dayKey(t.createdAt);
      tasksByDay.set(k, (tasksByDay.get(k) ?? 0) + 1);
    });

    const waterByDay = new Map<number, { totalMl: number; goalMl: number }>();
    waterLogs.forEach((w: any) => {
      waterByDay.set(dayKey(w.date), {
        totalMl: w.totalMl ?? 0,
        goalMl: w.goalMl ?? 2000,
      });
    });

    // Assemble result
    const result = days.map((d) => {
      const k = d.getTime();
      const water = waterByDay.get(k);
      const waterPct = water
        ? Math.min(100, Math.round((water.totalMl / water.goalMl) * 100))
        : 0;

      return {
        date: d.toISOString().split("T")[0],
        label: DAY_LABELS[d.getDay()],
        habitScore: habitByDay.get(k) ?? 0,
        tasksCreated: tasksByDay.get(k) ?? 0,
        waterMl: water?.totalMl ?? 0,
        waterPercent: waterPct,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/dashboard/weekly error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
