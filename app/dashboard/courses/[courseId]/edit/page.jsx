import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import mySQL from "@/lib/database";
import ModuleManager from "@/components/dashboard/course-creation/ModuleManager";
import {
  getCourse,
  getLessons,
  getLoggedInUser,
  getModules,
} from "@/lib/queries";

async function getCourseAndModules(courseId) {
  const course = await mySQL(getCourse, [courseId]);

  if (!course.length) {
    return null;
  }

  const modules = await mySQL(getModules, [courseId]);

  const modulesWithLessons = await Promise.all(
    modules.map(async (module) => {
      const lessons = await mySQL(getLessons, [module.id]);
      return { ...module, lessons };
    })
  );

  return {
    course: course[0],
    modules: modulesWithLessons,
  };
}

export default async function CourseEditPage({ params }) {
  const { courseId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  // console.log(courseId);
  if (!token) {
    redirect("/auth/signin");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const users = await mySQL(getLoggedInUser, [decoded.userId]);
  const user = users[0];

  const courseData = await getCourseAndModules(courseId);
  console.log(courseData);
  if (!courseData || courseData.course.instructor_id !== user.id) {
    redirect("/dashboard/courses");
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{courseData.course.title}</h1>
        <p className="text-gray-600">Manage your course content</p>
      </div>

      <ModuleManager
        courseId={courseId}
        courseName={courseData.course.title}
        initialModules={courseData.modules || []}
      />
    </div>
  );
}
