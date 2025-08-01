import StudentCourseList from "@/components/dashboard/courses/StudentCourseList";
import InstructorCourseList from "@/components/dashboard/courses/InstructorCourseList";
import mySQL from "@/lib/database";
import { getEnrolledCourse, getInstructorCourse } from "@/lib/queries";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-actions";

async function getInstructorCourses(userId) {
  const courses = await mySQL(getInstructorCourse, [userId]);
  return courses;
}

async function getEnrolledCourses(userId) {
  const courses = await mySQL(getEnrolledCourse, [userId, userId]);
  return courses;
}

export default async function CoursesPage() {
  const user = await requireAuth();
  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
    return null;
  }

  if (user.role === "instructor") {
    const courses = await getInstructorCourses(user.id);
    return <InstructorCourseList courses={courses} />;
  } else {
    const courses = await getEnrolledCourses(user.id);
    return <StudentCourseList courses={courses} />;
  }
}
