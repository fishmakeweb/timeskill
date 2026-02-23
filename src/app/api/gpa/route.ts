import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import { calculateGPA, getAllSemesters } from "@/lib/gpaCalculations";

// GET /api/gpa
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const semester = searchParams.get("semester");

    const allCourses = await Course.find({ userId: session.user.id });

    let gpa = 0;
    let courses = allCourses;

    if (semester) {
      courses = allCourses.filter((c: any) => c.semester === semester);
    }

    gpa = calculateGPA(
      courses.map((c: any) => ({
        id: c._id.toString(),
        userId: c.userId.toString(),
        semester: c.semester,
        courseName: c.courseName,
        grade: c.grade,
        credits: c.credits,
        gradeScale: c.gradeScale,
        createdAt: c.createdAt,
      })),
    );

    const semesters = getAllSemesters(
      allCourses.map((c: any) => ({
        id: c._id.toString(),
        userId: c.userId.toString(),
        semester: c.semester,
        courseName: c.courseName,
        grade: c.grade,
        credits: c.credits,
        gradeScale: c.gradeScale,
        createdAt: c.createdAt,
      })),
    );

    return NextResponse.json({
      gpa,
      semester: semester || "all",
      semesters,
      totalCourses: courses.length,
    });
  } catch (error) {
    console.error("Calculate GPA error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
