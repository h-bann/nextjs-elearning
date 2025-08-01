import StatCard from "./StatsCard";
import { BookOpen, Clock, Trophy, Users } from "lucide-react";
import { getCourseStats, getInstructorStudentStats } from "@/lib/queries";
import mySQL from "@/lib/database";

async function getInstructorStats(userId) {
  const courseStats = await mySQL(getCourseStats, [userId]);
  const studentStats = await mySQL(getInstructorStudentStats, userId);
  return {
    totalCourses: courseStats[0]?.total_courses || 0,
    totalStudents: studentStats[0]?.total_students || 0,
    courseCompletions: studentStats[0]?.course_completions || 0,
  };
}

export default async function InstructorDashboard({ user }) {
  let stats = {
    totalCourses: 0,
    totalStudents: 0,
    courseCompletions: 0,
  };

  stats = await getInstructorStats(user.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={stats.totalCourses}
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
        />
        <StatCard
          icon={Trophy}
          label="Course Completions"
          value={stats.courseCompletions}
        />
      </div>

      {/* Recent Enrollments */}
      {/* <h2 className="text-xl font-semibold mt-8 mb-4">Recent Enrollments</h2> */}
      {/* <div className="bg-white rounded-lg shadow-sm"> */}
      {/* Add recent enrollments list here */}
      {/* </div> */}
    </div>
  );
}
