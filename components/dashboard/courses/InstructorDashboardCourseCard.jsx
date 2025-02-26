import { Users, DollarSign, FileEdit, Eye } from "lucide-react";

export default function CourseCard({ course }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-48 relative">
        <img
          src={course.image_url || "/api/placeholder/400/300"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              course.published
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {course.published ? "Published" : "Draft"}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">{course.student_count} students</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="text-sm">£{course.price}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`/dashboard/courses/${course.id}/edit`}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FileEdit className="w-4 h-4 mr-2" />
            Edit
          </a>
          <a
            href={`/courses/${course.id}/learn`}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </a>
        </div>
      </div>
    </div>
  );
}
