import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import mySQL from "@/lib/database";
import ModuleManager from "@/components/dashboard/course-creation/ModuleManager";
import {
  getContent,
  getCourse,
  getLessons,
  getLoggedInUser,
  getModules,
  insertModules,
} from "@/lib/queries";
import { revalidatePath } from "next/cache";
import { cache } from "react";

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

export default async function CourseEditPage({ params }) {
  const { courseId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/auth/signin");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const users = await mySQL(getLoggedInUser, [decoded.userId]);
  const user = users[0];

  const courseData = await getCourseAndModules(courseId);
  console.log(courseData);
  if (!courseData || courseData.instructor_id !== user.id) {
    redirect("/dashboard/courses");
  }

  // async function addModule(formData) {
  //   "use server";
  //   const response = await fetch(`/api/courses/${id}/modules`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       title: formData.get("title"),
  //       order_index: formData.get("order_index"),
  //     }),
  //     cache: "no-store",
  //   });
  //   await mySQL(insertModules, [
  //     courseData.id,
  //     formData.get("title"),
  //     formData.get("order_index"),
  //   ]);
  //   const courseData = await getCourseAndModules(courseId);

  //   if (!response.ok) throw new Error("Failed to add module");
  //   revalidatePath(`dashboard/courses/${courseId}/edit`);
  // }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{courseData.title}</h1>
        <p className="text-gray-600">Manage your course content</p>
      </div>

      <ModuleManager course={courseData} />
    </div>
  );
}
