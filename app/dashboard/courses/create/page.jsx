import CourseForm from "@/components/dashboard/course-creation/CourseForm";
import { requireRole } from "@/lib/serverAuth";

export default async function CreateCoursePage() {
  const user = await requireRole("instructor");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Course</h1>
        <p className="mt-2 text-gray-600">
          Fill in the details below to start creating your course
        </p>
      </div>

      <CourseForm instructorId={user.id} />
    </div>
  );
}
