import { BookOpen, Clock } from "lucide-react";

export default function StudentDashboardCourseCard({ course }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-48 relative">
        <img
          src={course.image_url || "/api/placeholder/400/300"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4">
          Instructor: {course.instructor_name}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {course.progress_percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all duration-300"
              style={{ width: `${course.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-1" />
            {course.total_lessons} lessons
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {course.module_count + " days"}
          </div>
        </div>

        <a
          href={`/courses/${course.id}/learn`}
          className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue Learning
        </a>
      </div>
    </div>
  );
}
