import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  status: z
    .enum(["not-started", "in-progress", "completed", "done"])
    .optional(),
  priority: z.enum(["low", "medium", "high"]),
  deadline: z.string(),
  subtasks: z
    .array(z.object({ title: z.string(), completed: z.boolean() }))
    .optional(),
});

// GET /api/tasks
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    let query: any = { userId: session.user.id };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query).sort({ deadline: 1 });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = taskSchema.parse(body);

    await connectDB();

    const task = await Task.create({
      userId: session.user.id,
      title: validatedData.title,
      description: validatedData.description || "",
      status: validatedData.status || "not-started",
      priority: validatedData.priority,
      deadline: new Date(validatedData.deadline),
      subtasks: validatedData.subtasks || [],
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
