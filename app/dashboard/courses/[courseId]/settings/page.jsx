import { redirect } from "next/navigation";
import mySQL from "@/lib/database";
import { getCourse, checkInstructor } from "@/lib/queries";
import CourseSettingsForm from "@/components/dashboard/course-creation/CourseSettingsForm";
import PublishCourseButton from "@/components/dashboard/course-creation/PublishCourseButton";
import { requireAuth } from "@/lib/auth-actions";

export default async function CourseSettingsPage({ params }) {
  const user = await requireAuth();

  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
    return null;
  }
  const { courseId } = await params;

  // Verify course ownership
  const courses = await mySQL(checkInstructor, [courseId]);
  if (!courses.length || courses[0].instructor_id !== user.id) {
    redirect("/dashboard/courses");
    return null;
  }

  // Get course details
  const courseDetails = await mySQL(getCourse, [courseId]);
  const course = courseDetails[0];

  if (!course) {
    redirect("/dashboard/courses");
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Settings</h1>
          <p className="text-gray-600">Edit your course details</p>
        </div>

        <div className="mt-4 md:mt-0">
          <PublishCourseButton
            courseId={courseId}
            initialPublishState={!!course.published}
          />
        </div>
      </div>

      <CourseSettingsForm course={course} />

      <div className="mt-8 flex justify-between">
        <a
          href={`/dashboard/courses/${courseId}/edit`}
          className="rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
        >
          Back to Course Editor
        </a>

        <a
          href={`/courses/${courseId}/preview`}
          className="rounded-md bg-blue-100 px-4 py-2 text-blue-800 transition-colors hover:bg-blue-200"
        >
          Preview Course
        </a>
      </div>
    </div>
  );
}
