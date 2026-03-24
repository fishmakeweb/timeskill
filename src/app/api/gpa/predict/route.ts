import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import { calculateGPA, convertGradeToScale4 } from "@/lib/gpaCalculations";

// POST /api/gpa/predict — predict GPA with a hypothetical grade
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rawGrade = body?.hypotheticalGrade ?? body?.grade;
    const grade = Number(rawGrade);
    const credits = Number(body?.credits);
    const gradeScale: "10" | "4" = body?.gradeScale === "4" ? "4" : "10";

    if (!Number.isFinite(grade) || !Number.isFinite(credits) || credits <= 0) {
      return NextResponse.json(
        { error: "Dữ liệu dự đoán không hợp lệ" },
        { status: 400 },
      );
    }

    if (gradeScale === "10" && (grade < 0 || grade > 10)) {
      return NextResponse.json(
        { error: "Điểm hệ 10 phải trong khoảng 0-10" },
        { status: 400 },
      );
    }

    if (gradeScale === "4" && (grade < 0 || grade > 4)) {
      return NextResponse.json(
        { error: "Điểm hệ 4 phải trong khoảng 0-4" },
        { status: 400 },
      );
    }

    await connectDB();

    const courses = await Course.find({ userId: session.user.id });

    if (courses.length === 0) {
      return NextResponse.json({ error: "No courses found" }, { status: 400 });
    }

    const mappedCourses = courses.map((course) => ({
      id: course._id.toString(),
      userId: course.userId.toString(),
      semester: course.semester,
      courseName: course.courseName,
      grade: course.grade,
      credits: course.credits,
      gradeScale: course.gradeScale,
      createdAt: course.createdAt,
    }));

    // Keep prediction formula consistent with /api/gpa: weighted average on 10-scale.
    const currentGpa10 = calculateGPA(mappedCourses);
    const currentGpa4 = parseFloat(convertGradeToScale4(currentGpa10).toFixed(4));

    const hypotheticalCourse = {
      id: "hypothetical",
      userId: session.user.id,
      semester: "Dự đoán",
      courseName: "Môn giả định",
      grade,
      credits,
      gradeScale,
      createdAt: new Date(),
    };

    const predictedGpa10 = calculateGPA([...mappedCourses, hypotheticalCourse]);
    const predictedGpa4 = parseFloat(
      convertGradeToScale4(predictedGpa10).toFixed(4),
    );

    const totalCreditsAfter = mappedCourses.reduce((sum, c) => sum + c.credits, 0) + credits;

    return NextResponse.json({
      // Backward compatible fields (historically treated as GPA hệ 4 in UI)
      currentGpa: Math.round(currentGpa4 * 100) / 100,
      predictedGpa: Math.round(predictedGpa4 * 100) / 100,
      difference: Math.round((predictedGpa4 - currentGpa4) * 100) / 100,
      totalCreditsAfter,
      // Explicit scale fields for reliable UI rendering
      currentGpa4: Math.round(currentGpa4 * 100) / 100,
      predictedGpa4: Math.round(predictedGpa4 * 100) / 100,
      currentGpa10,
      predictedGpa10,
      difference10: Math.round((predictedGpa10 - currentGpa10) * 100) / 100,
    });
  } catch (error) {
    console.error("POST /api/gpa/predict error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
