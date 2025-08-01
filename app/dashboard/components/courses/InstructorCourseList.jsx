import CourseCard from "./InstructorDashboardCourseCard";

export default function InstructorCourseList({ courses }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <a
          href="/dashboard/courses/create"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create New Course
        </a>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg bg-white py-12 text-center shadow">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No courses created yet
          </h3>
          <p className="mb-4 text-gray-600">
            Start by creating your first course
          </p>
          <a
            href="/dashboard/courses/create"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
          >
            Create Course
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
