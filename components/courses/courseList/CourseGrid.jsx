// components/courses/courseList/CourseGrid.jsx
import CourseCard from "./CourseCard";

export default function CourseGrid({ courses, userVerified = false }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          userVerified={userVerified}
        />
      ))}
    </div>
  );
}
