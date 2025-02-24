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
  // console.log(courseData);
  // Default to first lesson if none selected
  const modId = moduleId || courseData.modules[0]?.id;
  const lessId = lessonId || courseData.modules[0]?.lessons[0]?.id;
  console.log(modId, lessId);
  // Get current lesson content
  const lessonData = await mySQL(getContent, [lessId]);

  console.log("LESSONDATA", lessonData);
  return (
    <div
      key={lessId}
      className="min-h-screen bg-gray-50 flex flex-col md:flex-row"
    >
      {/* Mobile Header - client component */}
      <MobileHeader title={courseData.title} />

      {/* Sidebar - server pre-rendered */}
      <div className="hidden md:block w-full md:w-80 bg-white border-r overflow-y-auto">
        <CourseSidebar
          course={courseData}
          activeModuleId={modId}
          activeLessonId={lessId}
        />
      </div>

      {/* Main Content - server rendered */}
      <main className="flex-1 overflow-y-auto">
        <CourseContent
          lesson={lessonData}
          userId={users[0].id}
          courseId={courseId}
        />
      </main>
    </div>
  );
}
