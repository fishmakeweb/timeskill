import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Habit from "@/models/Habit";
import User from "@/models/User";
import { calculateHabitScore } from "@/lib/habitCalculations";
import { z } from "zod";

const habitSchema = z.object({
  date: z.string(),
  exercise: z.number().min(0).max(24),
  water: z.number().min(0).max(10),
  sleep: z.number().min(0).max(24),
  calories: z.number().min(0),
});

// GET /api/habits - Get habits
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const days = searchParams.get("days");

    let query: any = { userId: session.user.id };

    if (date) {
      const dateObj = new Date(date);
      query.date = {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(dateObj.setHours(23, 59, 59, 999)),
      };
    } else if (start && end) {
      query.date = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    } else if (days) {
      const daysNum = parseInt(days, 10);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysNum + 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const habits = await Habit.find(query).sort({ date: -1 });

    return NextResponse.json(habits);
  } catch (error) {
    console.error("Get habits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/habits - Create habit
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = habitSchema.parse(body);

    await connectDB();

    // Get user settings
    const user = await User.findById(session.user.id);
    const rules = user?.settings?.habitRules || {
      exercise: { weight: 20, target: 1 },
      water: { weight: 20, target: 2 },
      sleep: { weight: 30, target: 7 },
      calories: { weight: 30, min: 2000, max: 2500 },
    };

    // Calculate score
    const score = calculateHabitScore(
      {
        exercise: validatedData.exercise,
        water: validatedData.water,
        sleep: validatedData.sleep,
        calories: validatedData.calories,
      },
      rules,
    );

    // Check if habit for this date already exists
    const dateObj = new Date(validatedData.date);
    const existingHabit = await Habit.findOne({
      userId: session.user.id,
      date: {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(dateObj.setHours(23, 59, 59, 999)),
      },
    });

    if (existingHabit) {
      return NextResponse.json(
        { error: "Habit cho ngày này đã tồn tại" },
        { status: 400 },
      );
    }

    const habit = await Habit.create({
      userId: session.user.id,
      date: new Date(validatedData.date),
      exercise: validatedData.exercise,
      water: validatedData.water,
      sleep: validatedData.sleep,
      calories: validatedData.calories,
      score,
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Create habit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
