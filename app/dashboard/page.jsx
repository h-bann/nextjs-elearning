import { getServerSession } from "@/lib/serverAuth";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getServerSession();

  if (!user) {
    redirect("/auth/signin?redirect=/dashboard");
    return null;
  }

  if (user.role === "instructor") {
    return <InstructorDashboard userRole={user.role} />;
  } else {
    return <StudentDashboard userRole={user.role} />;
  }
}
