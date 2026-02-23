import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import { z } from "zod";

const courseSchema = z.object({
  semester: z.string().min(1),
  courseName: z.string().min(1),
  grade: z.number(),
  credits: z.number().min(0),
  gradeScale: z.enum(["10", "4"]),
});

// GET /api/courses
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const semester = searchParams.get("semester");

    let query: any = { userId: session.user.id };
    if (semester) query.semester = semester;

    const courses = await Course.find(query).sort({ createdAt: -1 });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Get courses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/courses
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = courseSchema.parse(body);

    await connectDB();

    const course = await Course.create({
      userId: session.user.id,
      ...validatedData,
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Create course error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
