import { getServerSession } from "@/lib/serverAuth";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Get the session without automatic redirect
  const user = await getServerSession();

  // If no user is authenticated, redirect to login
  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
    return null;
  }

  // Render the appropriate dashboard based on user role
  if (user.role === "instructor") {
    return <InstructorDashboard />;
  } else {
    return <StudentDashboard />;
  }
}
