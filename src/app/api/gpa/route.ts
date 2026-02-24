import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import { calculateGPA, getAllSemesters } from "@/lib/gpaCalculations";

// GET /api/gpa
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const semester = searchParams.get("semester");

    const allCourses = await Course.find({ userId: session.user.id });

    let courses = allCourses;

    if (semester) {
      courses = allCourses.filter((c: any) => c.semester === semester);
    }

    const mapped = courses.map((c: any) => ({
      id: c._id.toString(),
      userId: c.userId.toString(),
      semester: c.semester,
      courseName: c.courseName,
      grade: c.grade,
      credits: c.credits,
      gradeScale: c.gradeScale,
      createdAt: c.createdAt,
    }));

    const allMapped = allCourses.map((c: any) => ({
      id: c._id.toString(),
      userId: c.userId.toString(),
      semester: c.semester,
      courseName: c.courseName,
      grade: c.grade,
      credits: c.credits,
      gradeScale: c.gradeScale,
      createdAt: c.createdAt,
    }));

    const gpa10 = calculateGPA(mapped);
    const gpa4 = parseFloat(((gpa10 / 10) * 4).toFixed(4));
    const totalCredits = mapped.reduce(
      (sum: number, c: any) => sum + c.credits,
      0,
    );
    const courseCount = mapped.length;

    const semesters = getAllSemesters(allMapped);

    return NextResponse.json({
      gpa4,
      gpa10,
      totalCredits,
      courseCount,
      // legacy fields kept for backward compat
      gpa: gpa10,
      semester: semester || "all",
      semesters,
      totalCourses: courseCount,
    });
  } catch (error) {
    console.error("Calculate GPA error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
