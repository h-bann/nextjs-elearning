import mySQL from "@/lib/database";
import StatCard from "./StatsCard";
import { BookOpen, Clock, Trophy, Users } from "lucide-react";
import { getLoggedInUser, getStudentStat } from "@/lib/queries";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getStudentStats(userId) {
  const data = await mySQL(getStudentStat, [userId]);

  return {
    enrolledCourses: data[0]?.enrolled_courses || 0,
    completedCourses: data[0]?.completed_courses || 0,
  };
}

export default async function StudentDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let stats = {
    enrolledCourses: 0,
    hoursLearned: 0,
    completedCourses: 0,
  };
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = await mySQL(getLoggedInUser, [decoded.userId]);
      const user = users[0];

      if (user) {
        stats = await getStudentStats(user.id);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  }
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Enrolled Courses"
          value={stats.enrolledCourses}
        />
        {/* <StatCard
          icon={Clock}
          label="Hours Learned"
          value={stats.hoursLearned}
          change={5}
        /> */}
        <StatCard
          icon={Trophy}
          label="Completed Courses"
          value={stats.completedCourses}
        />
      </div>

      {/* Recent Activity */}
      <h2 className="mb-4 mt-8 text-xl font-semibold">Recent Activity</h2>
      <div className="rounded-lg bg-white shadow-sm">
        {/* Add recent activity list here */}
      </div>
    </div>
  );
}
