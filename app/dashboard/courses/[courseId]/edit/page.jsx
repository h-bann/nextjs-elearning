import { redirect } from "next/navigation";
import mySQL from "@/lib/database";
import ModuleManager from "@/components/dashboard/course-creation/ModuleManager";
import { getContent, getCourse, getLessons, getModules } from "@/lib/queries";
import { getServerSession } from "@/lib/serverAuth";

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
        }),
      );

      return { ...module, lessons: lessonsWithContent };
    }),
  );
  return {
    ...course[0],
    modules: modulesWithLessons,
  };
}

export default async function CourseEditPage({ params }) {
  const { courseId } = await params;
  const user = await getServerSession();

  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
    return null;
  }
  const courseData = await getCourseAndModules(courseId);
  console.log(courseData);
  if (!courseData || courseData.instructor_id !== user.id) {
    redirect("/dashboard/courses");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{courseData.title}</h1>
        <p className="text-gray-600">Manage your course content</p>
      </div>

      <ModuleManager course={courseData} />
    </div>
  );
}
