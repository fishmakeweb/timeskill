import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import SleepLog from "@/models/SleepLog";
import { z } from "zod";

const sleepSchema = z.object({
  bedtime: z.string(), // ISO datetime string
  wakeTime: z.string(), // ISO datetime string
  quality: z.number().int().min(1).max(5),
  notes: z.string().max(500).optional(),
});

// GET /api/sleep?start=...&end=... or /api/sleep?limit=7
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "7");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const query: any = { userId: session.user.id };
    if (start && end) {
      query.date = { $gte: new Date(start), $lte: new Date(end) };
    }

    const logs = await SleepLog.find(query).sort({ date: -1 }).limit(limit);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET /api/sleep error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/sleep — log a sleep session
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = sleepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { bedtime, wakeTime, quality, notes = "" } = parsed.data;
    await connectDB();

    const bedtimeDate = new Date(bedtime);
    const wakeTimeDate = new Date(wakeTime);
    const durationHours =
      (wakeTimeDate.getTime() - bedtimeDate.getTime()) / (1000 * 60 * 60);

    if (durationHours <= 0 || durationHours > 24) {
      return NextResponse.json(
        { error: "Invalid time range" },
        { status: 400 },
      );
    }

    // Date = wake time day
    const date = new Date(wakeTimeDate);
    date.setHours(0, 0, 0, 0);

    const log = await SleepLog.create({
      userId: session.user.id,
      date,
      bedtime: bedtimeDate,
      wakeTime: wakeTimeDate,
      durationHours: Math.round(durationHours * 10) / 10,
      quality,
      notes,
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("POST /api/sleep error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
