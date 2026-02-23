import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import CalendarEvent from "@/models/CalendarEvent";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(""),
  startTime: z.string(),
  endTime: z.string(),
  color: z
    .enum(["purple", "blue", "green", "orange", "red"])
    .optional()
    .default("purple"),
  isAllDay: z.boolean().optional().default(false),
  reminder: z.number().nullable().optional().default(null),
});

// GET /api/calendar?start=...&end=...
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const query: any = { userId: session.user.id };
    if (start) query.startTime = { $gte: new Date(start) };
    if (end) query.endTime = { ...(query.endTime ?? {}), $lte: new Date(end) };

    const events = await CalendarEvent.find(query).sort({ startTime: 1 });
    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/calendar error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/calendar
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 },
      );
    }

    await connectDB();

    const event = await CalendarEvent.create({
      userId: session.user.id,
      ...parsed.data,
      startTime: new Date(parsed.data.startTime),
      endTime: new Date(parsed.data.endTime),
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/calendar error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
