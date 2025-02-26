import StatCard from "./StatsCard";
import { BookOpen, Clock, Trophy, Users } from "lucide-react";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import {
  getCourseStats,
  getInstructorStudentStats,
  getLoggedInUser,
} from "@/lib/queries";
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
export default async function InstructorDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let stats = {
    totalCourses: 0,
    totalStudents: 0,
    courseCompletions: 0,
  };

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = await mySQL(getLoggedInUser, [decoded.userId]);
      const user = users[0];

      if (user) {
        stats = await getInstructorStats(user.id);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
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
