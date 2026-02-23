import { Course } from "@/types";

export function calculateGPA(courses: Course[]): number {
  if (courses.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  courses.forEach((course) => {
    let normalizedGrade = course.grade;

    // Convert grade to 10 scale if it's 4.0 scale
    if (course.gradeScale === "4") {
      normalizedGrade = convertGradeToScale10(course.grade);
    }

    totalPoints += normalizedGrade * course.credits;
    totalCredits += course.credits;
  });

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  return Math.round(gpa * 100) / 100; // Round to 2 decimals
}

export function convertGradeToScale10(grade: number): number {
  // Convert 4.0 scale to 10 scale
  // 4.0 = 10, 3.0 = 7.5, 2.0 = 5, etc.
  return (grade / 4) * 10;
}

export function convertGradeToScale4(grade: number): number {
  // Convert 10 scale to 4.0 scale
  // 10 = 4.0, 7.5 = 3.0, 5 = 2.0, etc.
  return (grade / 10) * 4;
}

export function calculateSemesterGPA(
  courses: Course[],
  semester: string,
): number {
  const semesterCourses = courses.filter((c) => c.semester === semester);
  return calculateGPA(semesterCourses);
}

export function getAllSemesters(courses: Course[]): string[] {
  const semesters = new Set(courses.map((c) => c.semester));
  return Array.from(semesters).sort();
}
