import { Users, DollarSign, FileEdit, Eye } from "lucide-react";

const CourseCard = ({ course }) => {
  console.log(course);
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
};

export default function InstructorCourseList({ courses }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <a
          href="/dashboard/courses/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Create New Course
        </a>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses created yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start by creating your first course
          </p>
          <a
            href="/dashboard/courses/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            Create Course
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
