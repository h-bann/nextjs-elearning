// components/dashboard/courses/InstructorDashboardCourseCard.jsx
import { Users, FileEdit, Eye, Globe } from "lucide-react";

export default function CourseCard({ course }) {
  // Determine if the course is published
  const isPublished = !!course.published;

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="relative h-48">
        <img
          src={course.image_url || "/api/placeholder/400/300"}
          alt={course.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute right-2 top-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isPublished
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-lg font-semibold">{course.title}</h3>

        {/* Course Stats */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="flex items-center text-gray-600">
            <Users className="mr-2 h-4 w-4" />
            <span className="text-sm">
              {course.student_count || 0} students
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="text-sm">£{course.price}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`/dashboard/courses/${course.id}/edit`}
            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FileEdit className="mr-2 h-4 w-4" />
            Edit
          </a>
          <a
            href={
              isPublished
                ? `/courses/${course.id}/learn`
                : `/courses/${course.id}/preview`
            }
            className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            {isPublished ? "View" : "Preview"}
          </a>
        </div>
      </div>
    </div>
  );
}
