import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";

// POST /api/gpa/predict — predict GPA with a hypothetical grade
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { hypotheticalGrade, credits, gradeScale = "10" } = await req.json();

    await connectDB();

    const courses = await Course.find({ userId: session.user.id });

    if (courses.length === 0) {
      return NextResponse.json({ error: "No courses found" }, { status: 400 });
    }

    // Calculate current GPA (hệ 4)
    let totalWeighted = 0;
    let totalCredits = 0;

    for (const course of courses) {
      const grade =
        course.gradeScale === "10" ? convertTo4(course.grade) : course.grade;
      totalWeighted += grade * course.credits;
      totalCredits += course.credits;
    }

    const currentGpa = totalCredits > 0 ? totalWeighted / totalCredits : 0;

    // Add hypothetical course
    const hypGradeOn4 =
      gradeScale === "10" ? convertTo4(hypotheticalGrade) : hypotheticalGrade;
    const newTotalWeighted = totalWeighted + hypGradeOn4 * credits;
    const newTotalCredits = totalCredits + credits;
    const predictedGpa = newTotalWeighted / newTotalCredits;

    return NextResponse.json({
      currentGpa: Math.round(currentGpa * 100) / 100,
      predictedGpa: Math.round(predictedGpa * 100) / 100,
      difference: Math.round((predictedGpa - currentGpa) * 100) / 100,
      totalCreditsAfter: newTotalCredits,
    });
  } catch (error) {
    console.error("POST /api/gpa/predict error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function convertTo4(grade10: number): number {
  if (grade10 >= 9.0) return 4.0;
  if (grade10 >= 8.5) return 3.7;
  if (grade10 >= 8.0) return 3.5;
  if (grade10 >= 7.5) return 3.0;
  if (grade10 >= 7.0) return 2.5;
  if (grade10 >= 6.5) return 2.0;
  if (grade10 >= 6.0) return 1.5;
  if (grade10 >= 5.5) return 1.0;
  if (grade10 >= 5.0) return 0.5;
  return 0.0;
}
