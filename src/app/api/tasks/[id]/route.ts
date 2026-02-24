import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import { z } from "zod";

const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z
    .enum(["not-started", "in-progress", "completed", "done"])
    .optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  deadline: z.string().optional(),
  completed: z.boolean().optional(),
  subtasks: z
    .array(z.object({ title: z.string(), completed: z.boolean() }))
    .optional(),
});

// GET /api/tasks/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const task = await Task.findOne({ _id: id, userId: session.user.id });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/tasks/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validatedData = taskUpdateSchema.parse(body);

    await connectDB();

    const updateData: any = {};
    if (validatedData.title) updateData.title = validatedData.title;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.status) {
      updateData.status = validatedData.status;
      if (
        validatedData.status === "completed" ||
        validatedData.status === "done"
      ) {
        updateData.completedAt = new Date();
      }
    }
    if (validatedData.completed === true && !validatedData.status) {
      updateData.status = "done";
      updateData.completedAt = new Date();
    }
    if (validatedData.priority) updateData.priority = validatedData.priority;
    if (validatedData.deadline) {
      const d = new Date(validatedData.deadline);
      if (isNaN(d.getTime())) {
        return NextResponse.json(
          { error: "Hạn chật không hợp lệ. Vui lòng chọn ngày giờ cụ thể." },
          { status: 400 },
        );
      }
      updateData.deadline = d;
    }
    if (validatedData.subtasks !== undefined)
      updateData.subtasks = validatedData.subtasks;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updateData },
      { new: true },
    );

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
