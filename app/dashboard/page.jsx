import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/auth-actions";
import InstructorDashboard from "@/app/dashboard/components/InstructorDashboard";
import StudentDashboard from "@/app/dashboard/components/StudentDashboard";

export default async function DashboardPage() {
  const user = await requireAuth();
  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
    return null;
  }

  if (user.role === "instructor") {
    return <InstructorDashboard user={user} />;
  } else {
    return <StudentDashboard user={user} />;
  }
}
