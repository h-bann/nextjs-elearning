import { ProtectedRoute } from "@/lib/auth";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";

export default async function DashboardPage() {
  return (
    <>
      {/* This will only render for students */}
      <ProtectedRoute allowedRoles={["user"]}>
        <StudentDashboard />
      </ProtectedRoute>

      {/* This will only render for instructors */}
      <ProtectedRoute allowedRoles={["instructor"]}>
        <InstructorDashboard />
      </ProtectedRoute>
    </>
  );
}
