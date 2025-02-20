import React from "react";
import { BookOpen, Clock, Trophy, Users } from "lucide-react";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";

export default function DashboardPage() {
  // Example stats - replace with actual data fetching
  const mockStats = {
    student: {
      enrolledCourses: 5,
      hoursLearned: 25,
      completedCourses: 2,
    },
    instructor: {
      totalCourses: 8,
      totalStudents: 156,
      courseCompletions: 42,
    },
  };

  return (
    <>
      {/* This will only render for students */}
      <ProtectedRoute allowedRoles={["student"]}>
        <StudentDashboard stats={mockStats.student} />
      </ProtectedRoute>

      {/* This will only render for instructors */}
      <ProtectedRoute allowedRoles={["instructor"]}>
        <InstructorDashboard stats={mockStats.instructor} />
      </ProtectedRoute>
    </>
  );
}
