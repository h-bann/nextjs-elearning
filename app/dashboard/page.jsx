import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-actions";

export default async function DashboardPage() {
  const user = await requireAuth();
  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
    return null;
  }

  {
    user.role === "instructor" && <InstructorDashboard user={user} />;
  }
  {
    user.role !== "instructor" && <StudentDashboard user={user} />;
  }

  // if (user.role === "instructor") {
  //   return <InstructorDashboard user={user} />;
  // } else {
  //   return <StudentDashboard user={user} />;
  // }
}
