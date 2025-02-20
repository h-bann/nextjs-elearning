import StatCard from "./StatsCard";
import { BookOpen, Clock, Trophy, Users } from "lucide-react";

export default function StudentDashboard({ stats }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={BookOpen}
          label="Enrolled Courses"
          value={stats.enrolledCourses}
        />
        <StatCard
          icon={Clock}
          label="Hours Learned"
          value={stats.hoursLearned}
          change={5}
        />
        <StatCard
          icon={Trophy}
          label="Completed Courses"
          value={stats.completedCourses}
        />
      </div>

      {/* Recent Activity */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Recent Activity</h2>
      <div className="bg-white rounded-lg shadow-sm">
        {/* Add recent activity list here */}
      </div>
    </div>
  );
}
