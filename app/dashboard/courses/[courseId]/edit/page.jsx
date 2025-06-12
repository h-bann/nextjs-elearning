// app/dashboard/courses/[courseId]/edit/page.jsx
import { redirect } from "next/navigation";
import mySQL from "@/lib/database";
import ModuleManager from "@/components/dashboard/course-creation/ModuleManager";
import { getContent, getCourse, getLessons, getModules } from "@/lib/queries";
import { getServerSession } from "@/lib/serverAuth";
import PublishCourseButton from "@/components/dashboard/course-creation/PublishCourseButton";

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

  if (!courseData || courseData.instructor_id !== user.id) {
    redirect("/dashboard/courses");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{courseData.title}</h1>
            <p className="text-gray-600">Manage your course content</p>
          </div>

          <div className="mt-4 md:mt-0">
            <PublishCourseButton
              courseId={courseId}
              initialPublishState={!!courseData.published}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mb-2 text-lg font-medium">Course Details</h2>
            <p className="text-gray-600">Price: £{courseData.price}</p>
          </div>

          <div className="mt-4 flex space-x-4 md:mt-0">
            <a
              href={`/courses/${courseId}/preview`}
              className="rounded-md bg-blue-100 px-4 py-2 text-blue-800 transition-colors hover:bg-blue-200"
            >
              Preview Course
            </a>
            <a
              href={`/dashboard/courses/${courseId}/settings`}
              className="rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
            >
              Edit Details
            </a>
          </div>
        </div>
      </div>

      <ModuleManager course={courseData} />
    </div>
  );
}
