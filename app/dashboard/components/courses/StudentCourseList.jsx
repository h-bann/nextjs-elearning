import StudentDashboardCourseCard from "./StudentDashboardCourseCard";

export default function StudentCourseList({ courses }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <a
          href="/courses"
          className="inline-flex items-center rounded-md border border-transparent bg-accent-light px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Browse Courses
        </a>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg bg-white py-12 text-center shadow">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No courses yet
          </h3>
          <p className="mb-4 text-gray-600">
            Start learning by enrolling in some courses
          </p>
          <a
            href="/courses"
            className="inline-flex items-center rounded-md border border-transparent bg-accent-light px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Find Courses
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <StudentDashboardCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
