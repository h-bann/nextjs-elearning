// app/courses/page.jsx
import mySQL from "@/lib/database";
import { getAllCourses, getUserEnrollments } from "@/lib/queries";
import CourseGrid from "@/components/courses/courseList/CourseGrid";
import { getServerSession } from "@/lib/serverAuth";

async function getCoursesWithEnrollmentStatus(userId = null) {
  const courses = await mySQL(getAllCourses);

  if (!userId) {
    return { courses, userVerified: false };
  }

  // Get user's enrollments
  const enrollments = await mySQL(getUserEnrollments, [userId]);
  const enrolledCourseIds = enrollments.map((e) => e.course_id);

  // Get user's verification status
  const verificationData = await mySQL(
    `SELECT oneid_verified FROM users WHERE id = ?`,
    [userId],
  );
  const userVerified =
    verificationData.length > 0 && verificationData[0].oneid_verified;

  // Add enrollment status to courses
  const coursesWithStatus = courses.map((course) => ({
    ...course,
    isEnrolled: enrolledCourseIds.includes(course.id),
  }));

  return { courses: coursesWithStatus, userVerified };
}

export default async function CoursesPage() {
  const user = await getServerSession();
  const { courses, userVerified } = await getCoursesWithEnrollmentStatus(
    user?.id,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Available Courses</h1>

      {/* Age Verification Notice */}
      {user && !userVerified && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Age Verification Required
              </h3>
              <div className="mt-1 text-sm text-amber-700">
                <p>
                  To purchase courses, you'll need to verify that you're over 18
                  using OneId. This is a secure, one-time process.
                </p>
              </div>
              <div className="mt-3">
                <a
                  href="/verification/oneid"
                  className="inline-flex items-center rounded-md border border-transparent bg-amber-200 px-3 py-2 text-sm font-medium leading-4 text-amber-800 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Verify Age Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <CourseGrid courses={courses} userVerified={userVerified} />
    </div>
  );
}
