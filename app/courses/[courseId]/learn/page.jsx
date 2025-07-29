import { getServerSession } from "@/lib/serverAuth";
import mySQL from "@/lib/database";
import { redirect } from "next/navigation";
import {
  checkExistingEnrollment,
  checkInstructor,
  getContent,
} from "@/lib/queries";
import { getCourseAndModules } from "@/lib/utils";
import CourseSidebar from "@/components/courses/courseContent/CourseSidebar";
import CourseContent from "@/components/courses/courseContent/CourseContent";
import MobileHeader from "@/components/courses/courseContent/MobileHeader";
import { getCompletedLessons, canAccessLesson } from "@/lib/serverActions";
import { CourseProgressProvider } from "@/lib/courseProgressContext";
import InstructorViewBanner from "@/components/courses/courseContent/InstructorViewBanner";

// This forces the page to be dynamic and not cached
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function LearnPage({ params, searchParams }) {
  const { courseId } = await params;
  const { moduleId, lessonId } = await searchParams;
  const user = await getServerSession();

  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
    return null;
  }

  // Add a timestamp parameter to ensure fresh data on each request
  const timestamp = Date.now();

  // Check if the user is the instructor of this course
  const instructorCheck = await mySQL(checkInstructor, [courseId]);
  const isInstructor =
    instructorCheck.length > 0 && instructorCheck[0].instructor_id === user.id;

  // If not instructor, check enrollment
  if (!isInstructor) {
    const enrollments = await mySQL(checkExistingEnrollment, [
      user.id,
      courseId,
    ]);
    if (!enrollments.length || enrollments[0].status !== "ACTIVE") {
      redirect(`/courses/${courseId}/purchase`);
      return null;
    }
  }

  // Get course data
  const courseData = await getCourseAndModules(courseId);
  if (!courseData || !courseData.modules.length) {
    redirect("/courses");
    return null;
  }

  // Default to first lesson if none selected
  const modId = moduleId || courseData.modules[0]?.id;
  const lessId = lessonId || courseData.modules[0]?.lessons[0]?.id;

  // Get current lesson content
  const lessonContent = await mySQL(getContent, [lessId]);

  // Get completion data (for students)
  let completedLessons = [];
  if (!isInstructor) {
    const completedLessonsResult = await getCompletedLessons(courseId);
    completedLessons = completedLessonsResult.completedLessons || [];

    // Check if user can access this lesson
    const accessCheck = await canAccessLesson(lessId);
    if (!accessCheck.canAccess) {
      // Find the first lesson or last completed lesson
      const firstLesson = courseData.modules[0]?.lessons[0];
      if (firstLesson) {
        redirect(
          `/courses/${courseId}/learn?moduleId=${courseData.modules[0].id}&lessonId=${firstLesson.id}`,
        );
      } else {
        redirect(`/courses/${courseId}`);
      }
    }
  }

  return (
    <>
      {/* Instructor Banner - only shown to course instructor */}
      {isInstructor && (
        <InstructorViewBanner isPublished={!!courseData.published} />
      )}

      <CourseProgressProvider
        initialCompletedLessons={completedLessons}
        courseModules={courseData.modules}
      >
        <div
          key={`${lessId}-${timestamp}`}
          className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-white md:flex-row"
        >
          {/* Mobile Header */}
          <MobileHeader
            title={courseData.title}
            course={courseData}
            activeModuleId={modId}
            activeLessonId={lessId}
            isInstructor={isInstructor}
            isPublished={!!courseData.published}
          />

          {/* Sidebar - hidden on mobile */}
          <div className="hidden h-full w-full overflow-y-auto border-r bg-white md:block md:w-80">
            <CourseSidebar
              course={courseData}
              activeModuleId={modId}
              activeLessonId={lessId}
              isInstructor={isInstructor}
              isPublished={!!courseData.published}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <CourseContent
              lesson={lessonContent}
              userId={user.id}
              courseId={courseId}
              isInstructor={isInstructor}
            />
          </main>
        </div>
      </CourseProgressProvider>
    </>
  );
}
