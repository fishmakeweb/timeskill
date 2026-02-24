import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import { z } from "zod";

const courseUpdateSchema = z.object({
  semester: z.string().min(1).optional(),
  courseName: z.string().min(1).optional(),
  grade: z.number().optional(),
  credits: z.number().min(0).optional(),
  gradeScale: z.enum(["10", "4"]).optional(),
});

// GET /api/courses/[id]
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
    const course = await Course.findOne({ _id: id, userId: session.user.id });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Get course error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/courses/[id]
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
    const validatedData = courseUpdateSchema.parse(body);

    await connectDB();

    const updateData: any = {};
    if (validatedData.semester) updateData.semester = validatedData.semester;
    if (validatedData.courseName)
      updateData.courseName = validatedData.courseName;
    if (validatedData.grade !== undefined)
      updateData.grade = validatedData.grade;
    if (validatedData.credits !== undefined)
      updateData.credits = validatedData.credits;
    if (validatedData.gradeScale)
      updateData.gradeScale = validatedData.gradeScale;

    const course = await Course.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updateData },
      { new: true },
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Update course error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/courses/[id]
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

    const course = await Course.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Course deleted" });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
