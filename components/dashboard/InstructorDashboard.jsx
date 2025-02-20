import StatCard from "./StatsCard";
import { BookOpen, Clock, Trophy, Users } from "lucide-react";

export default function InstructorDashboard({ stats }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Instructor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={stats.totalCourses}
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          change={12}
        />
        <StatCard
          icon={Trophy}
          label="Course Completions"
          value={stats.courseCompletions}
        />
      </div>

      {/* Recent Enrollments */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Recent Enrollments</h2>
      <div className="bg-white rounded-lg shadow-sm">
        {/* Add recent enrollments list here */}
      </div>
    </div>
  );
}
