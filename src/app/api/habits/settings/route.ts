import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { z } from "zod";

const settingsSchema = z.object({
  habitRules: z.object({
    exercise: z.object({
      weight: z.number().min(0).max(100),
      target: z.number().min(0),
    }),
    water: z.object({
      weight: z.number().min(0).max(100),
      target: z.number().min(0),
    }),
    sleep: z.object({
      weight: z.number().min(0).max(100),
      target: z.number().min(0),
    }),
    calories: z.object({
      weight: z.number().min(0).max(100),
      min: z.number().min(0),
      max: z.number().min(0),
    }),
  }),
});

// GET /api/habits/settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.settings || {});
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/habits/settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = settingsSchema.parse(body);

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { settings: validatedData } },
      { new: true },
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.settings);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
