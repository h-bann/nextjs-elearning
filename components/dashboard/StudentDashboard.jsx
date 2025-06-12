// components/dashboard/StudentDashboard.jsx
import mySQL from "@/lib/database";
import StatCard from "./StatsCard";
import { BookOpen, Trophy } from "lucide-react";
import { getLoggedInUser, getStudentStat } from "@/lib/queries";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import RecentActivity from "./RecentActivity";

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
    completedCourses: 0,
  };

  let userId = null;
  let userRole = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = await mySQL(getLoggedInUser, [decoded.userId]);
      const user = users[0];

      if (user) {
        userId = user.id;
        userRole = user.role;
        stats = await getStudentStats(user.id);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  }

  const isInstructor = userRole === "instructor";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        My {isInstructor ? "Instructor" : "Learning"} Dashboard
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatCard
          icon={BookOpen}
          label={isInstructor ? "Courses As Student" : "Enrolled Courses"}
          value={stats.enrolledCourses}
        />
        <StatCard
          icon={Trophy}
          label="Completed Courses"
          value={stats.completedCourses}
        />
      </div>

      {/* Recent Activity */}
      <h2 className="mb-4 mt-8 text-xl font-semibold">Recent Activity</h2>
      <RecentActivity userId={userId} />

      {/* Note for instructors who also learn */}
      {isInstructor && stats.enrolledCourses > 0 && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Learning & Teaching
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>
                  This shows your activity as a student. To view your instructor
                  dashboard with course creation and student management,
                  <a
                    href="/dashboard/courses"
                    className="font-medium underline hover:no-underline"
                  >
                    visit your instructor courses
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
