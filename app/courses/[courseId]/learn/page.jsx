import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { redirect } from "next/navigation";
import CourseContent from "@/components/courses/CourseContent";
import CourseSidebar from "@/components/courses/CourseSidebar";
import { Menu } from "lucide-react";
import {
  getCourseWithModules,
  getLoggedInUser,
  checkExistingEnrollment,
  getCourse,
  getModules,
  getLessons,
  getContent,
} from "@/lib/queries";
import LearnLayout from "@/components/courses/LearnLayout";

export default async function LearnPage({ params, searchParams }) {
  const { courseId } = await params;
  const { moduleId } = await searchParams;
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
  const enrollment = await mySQL(checkExistingEnrollment, [
    users[0].id,
    courseId,
  ]);
  console.log();
  if (!enrollment.length || enrollment[0].status !== "ACTIVE") {
    redirect("/courses");
  }

  // Get course data
  async function getCourseAndModules(courseId) {
    const course = await mySQL(getCourse, [courseId]);

    const modules = await mySQL(getModules, [courseId]);
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await mySQL(getLessons, [module.id]);
        const lessonsWithContent = await Promise.all(
          lessons.map(async (lesson) => {
            const content = await mySQL(getContent, [lesson.id]);

            return {
              ...lesson,
              content: content,
            };
          })
        );

        return { ...module, lessons: lessonsWithContent };
      })
    );
    return {
      ...course[0],
      modules: modulesWithLessons,
    };
  }
  const courseData = await getCourseAndModules(courseId);
  if (!courseData) {
    redirect("/courses");
  }
  console.log(courseData);
  // Default to first lesson if none selected
  const defaultModuleId = courseData.modules[0]?.id;
  const defaultLessonId = courseData.modules[0]?.lessons[0]?.id;

  return (
    <LearnLayout
      courseData={courseData}
      initialModuleId={moduleId || defaultModuleId}
      initialLessonId={defaultLessonId}
      userId={users[0].id}
    />
  );
}
