// app/courses/[courseId]/learn/page.jsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { redirect } from "next/navigation";
import {
  getCourseWithModules,
  getLoggedInUser,
  checkExistingEnrollment,
  getLessonById,
  getContent,
} from "@/lib/queries";
import { getCourseAndModules } from "@/lib/utils";
import CourseSidebar from "@/components/courses/CourseSidebar";
import CourseContent from "@/components/courses/CourseContent";
import MobileHeader from "@/components/courses/MobileHeader";
import { getCompletedLessons, canAccessLesson } from "@/lib/serverActions";

export default async function LearnPage({ params, searchParams }) {
  const { courseId } = await params;
  const { moduleId, lessonId } = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/auth/signin");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const users = await mySQL(getLoggedInUser, [decoded.userId]);

  if (!users.length) {
    redirect("/auth/signin");
  }

  // Check enrollment
  const enrollments = await mySQL(checkExistingEnrollment, [
    users[0].id,
    courseId,
  ]);
  if (!enrollments.length || enrollments[0].status !== "ACTIVE") {
    redirect("/courses");
  }

  // Get course data
  const courseData = await getCourseAndModules(courseId);
  if (!courseData || !courseData.modules.length) {
    redirect("/courses");
  }

  // Default to first lesson if none selected
  const modId = moduleId || courseData.modules[0]?.id;
  const lessId = lessonId || courseData.modules[0]?.lessons[0]?.id;

  // Get current lesson content
  const lessonContent = await mySQL(getContent, [lessId]);

  // Get lesson access info
  const { canAccess, error } = await canAccessLesson(lessId);

  if (!canAccess) {
    // Redirect to the most recent completed lesson or first lesson
    // This implementation will depend on your navigation structure
    redirect(`/courses/${courseId}`);
  }

  // Get completed lessons for sidebar
  const { completedLessons = [] } = await getCompletedLessons(courseId);

  return (
    <div
      key={lessId}
      className="min-h-screen bg-gray-50 flex flex-col md:flex-row"
    >
      {/* Mobile Header - client component */}
      <MobileHeader
        title={courseData.title}
        course={courseData}
        activeModuleId={modId}
        activeLessonId={lessId}
        commpletedLessons={completedLessons}
      />

      {/* Sidebar - server pre-rendered */}
      <div className="hidden md:block w-full md:w-80 bg-white border-r overflow-y-auto">
        <CourseSidebar
          course={courseData}
          activeModuleId={modId}
          activeLessonId={lessId}
          completedLessons={completedLessons}
        />
      </div>

      {/* Main Content - server rendered */}
      <main className="flex-1 overflow-y-auto">
        <CourseContent
          lesson={lessonContent}
          userId={users[0].id}
          courseId={courseId}
        />
      </main>
    </div>
  );
}
