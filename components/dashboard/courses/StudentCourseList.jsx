import { BookOpen, Clock } from "lucide-react";

const CourseCard = ({ course }) => {
  const progressPercentage = Math.round(
    (course.completed_lessons / course.total_lessons) * 100
  );

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
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
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
            {course.duration || "2h 30m"}
          </div>
        </div>

        <a
          href={`/dashboard/courses/${course.id}`}
          className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue Learning
        </a>
      </div>
    </div>
  );
};

export default function StudentCourseList({ courses }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <a
          href="/courses"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Browse Courses
        </a>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start learning by enrolling in some courses
          </p>
          <a
            href="/courses"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            Find Courses
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
