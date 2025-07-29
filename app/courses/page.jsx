import mySQL from "@/lib/database";
import { getAllCourses, getUserEnrollments } from "@/lib/queries";
import CourseGrid from "@/components/courses/courseList/CourseGrid";
import { getServerSession } from "@/lib/serverAuth";

async function getCoursesWithEnrollmentStatus(userId = null) {
  const courses = await mySQL(getAllCourses);

  if (!userId) {
    return { courses };
  }

  // Get user's enrollments
  const enrollments = await mySQL(getUserEnrollments, [userId]);
  const enrolledCourseIds = enrollments.map((e) => e.course_id);

  // Add enrollment status to courses
  const coursesWithStatus = courses.map((course) => ({
    ...course,
    isEnrolled: enrolledCourseIds.includes(course.id),
  }));

  return { courses: coursesWithStatus };
}

export default async function CoursesPage() {
  const user = await getServerSession();
  const { courses } = await getCoursesWithEnrollmentStatus(user?.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Available Courses</h1>
      <CourseGrid courses={courses} />
    </div>
  );
}
