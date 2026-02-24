import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import WaterLog from "@/models/WaterLog";
import { z } from "zod";

const addWaterSchema = z.object({
  amount: z.number().int().min(1).max(5000), // ml
  goalMl: z.number().int().min(500).max(10000).optional(),
});

function getTodayMidnight(dateStr?: string): Date {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/water?date=YYYY-MM-DD  — get water log for a specific day
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const rangeStart = searchParams.get("start");
    const rangeEnd = searchParams.get("end");

    if (rangeStart && rangeEnd) {
      const logs = await WaterLog.find({
        userId: session.user.id,
        date: { $gte: new Date(rangeStart), $lte: new Date(rangeEnd) },
      }).sort({ date: -1 });
      return NextResponse.json(logs);
    }

    const date = getTodayMidnight(dateStr ?? undefined);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const log = await WaterLog.findOne({
      userId: session.user.id,
      date: { $gte: date, $lt: nextDay },
    });

    return NextResponse.json(log ?? { totalMl: 0, goalMl: 2000, entries: [] });
  } catch (error) {
    console.error("GET /api/water error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/water — add water entry for today
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = addWaterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { amount, goalMl } = parsed.data;
    await connectDB();

    const today = getTodayMidnight();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const update: any = {
      $push: { entries: { time: new Date(), amount } },
      $inc: { totalMl: amount },
      $setOnInsert: { date: today, userId: session.user.id },
    };

    if (goalMl != null) {
      update.$set = { goalMl };
    }

    const log = await WaterLog.findOneAndUpdate(
      { userId: session.user.id, date: { $gte: today, $lt: tomorrow } },
      update,
      { upsert: true, new: true },
    );

    return NextResponse.json(log);
  } catch (error) {
    console.error("POST /api/water error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/water — update goal
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { goalMl } = z
      .object({ goalMl: z.number().int().min(500).max(10000) })
      .parse(body);

    await connectDB();

    const today = getTodayMidnight();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const log = await WaterLog.findOneAndUpdate(
      { userId: session.user.id, date: { $gte: today, $lt: tomorrow } },
      {
        $set: { goalMl },
        $setOnInsert: { date: today, userId: session.user.id, totalMl: 0 },
      },
      { upsert: true, new: true },
    );

    return NextResponse.json(log);
  } catch (error) {
    console.error("PUT /api/water error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/water — remove last entry
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const today = getTodayMidnight();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const log = await WaterLog.findOne({
      userId: session.user.id,
      date: { $gte: today, $lt: tomorrow },
    });

    if (!log || log.entries.length === 0) {
      return NextResponse.json(
        { error: "No entry to delete" },
        { status: 404 },
      );
    }

    const lastEntry = log.entries[log.entries.length - 1];
    log.entries.pop();
    log.totalMl = Math.max(0, log.totalMl - lastEntry.amount);
    await log.save();

    return NextResponse.json(log);
  } catch (error) {
    console.error("DELETE /api/water error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
