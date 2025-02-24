import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import CourseGrid from "@/components/courses/CourseGrid";
import {
  getAllCourses,
  getLoggedInUser,
  getUserEnrollments,
} from "@/lib/queries";
import { ProtectedRoute } from "@/lib/auth";

async function getCoursesWithEnrollmentStatus(userId = null) {
  const courses = await mySQL(getAllCourses);

  if (!userId) {
    return courses;
  }

  // Get user's enrollments
  const enrollments = await mySQL(getUserEnrollments, [userId]);
  const enrolledCourseIds = enrollments.map((e) => e.course_id);
  // Add enrollment status to courses
  return courses.map((course) => ({
    ...course,
    isEnrolled: enrolledCourseIds.includes(course.id),
  }));
}

export default async function CoursesPage() {
  let userId = null;

  // Check if user is logged in
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = await mySQL(getLoggedInUser, [decoded.userId]);
      if (users.length) {
        userId = users[0].id;
      }
    } catch (error) {
      console.error("Token verification failed:", error);
    }
  }
  const courses = await getCoursesWithEnrollmentStatus(userId);
  console.log(courses);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Courses</h1>

      <CourseGrid courses={courses} />
    </div>
  );
}
