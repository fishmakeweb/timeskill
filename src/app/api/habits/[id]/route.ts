import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Habit from "@/models/Habit";
import User from "@/models/User";
import { calculateHabitScore } from "@/lib/habitCalculations";
import { z } from "zod";

const habitUpdateSchema = z.object({
  exercise: z.number().min(0).max(24).optional(),
  water: z.number().min(0).max(10).optional(),
  sleep: z.number().min(0).max(24).optional(),
  calories: z.number().min(0).optional(),
});

// GET /api/habits/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const habit = await Habit.findOne({ _id: id, userId: session.user.id });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    console.error("Get habit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/habits/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validatedData = habitUpdateSchema.parse(body);

    await connectDB();

    const habit = await Habit.findOne({ _id: id, userId: session.user.id });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Update fields
    if (validatedData.exercise !== undefined)
      habit.exercise = validatedData.exercise;
    if (validatedData.water !== undefined) habit.water = validatedData.water;
    if (validatedData.sleep !== undefined) habit.sleep = validatedData.sleep;
    if (validatedData.calories !== undefined)
      habit.calories = validatedData.calories;

    // Recalculate score
    const user = await User.findById(session.user.id);
    const rules = user?.settings?.habitRules || {
      exercise: { weight: 20, target: 1 },
      water: { weight: 20, target: 2 },
      sleep: { weight: 30, target: 7 },
      calories: { weight: 30, min: 2000, max: 2500 },
    };

    habit.score = calculateHabitScore(
      {
        exercise: habit.exercise,
        water: habit.water,
        sleep: habit.sleep,
        calories: habit.calories,
      },
      rules,
    );

    await habit.save();

    return NextResponse.json(habit);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Update habit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/habits/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const habit = await Habit.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Habit deleted" });
  } catch (error) {
    console.error("Delete habit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
