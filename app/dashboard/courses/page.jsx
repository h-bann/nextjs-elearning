import StudentCourseList from "@/app/dashboard/components/courses/StudentCourseList";
import InstructorCourseList from "@/app/dashboard/components/courses/InstructorCourseList";
import mySQL from "@/lib/db/database";
import { getEnrolledCourse, getInstructorCourse } from "@/lib/db/queries";
import { requireAuth } from "@/lib/auth/auth-actions";

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
  if (user.role === "instructor") {
    const courses = await getInstructorCourses(user.id);
    return <InstructorCourseList courses={courses} />;
  } else {
    const courses = await getEnrolledCourses(user.id);
    return <StudentCourseList courses={courses} />;
  }
}
