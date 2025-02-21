import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import mySQL from "@/lib/database";
import { getLoggedInUser } from "@/lib/queries";
import CourseForm from "@/components/dashboard/course-creation/CourseForm";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/auth/signin");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);

    const user = users[0];

    if (user.role !== "instructor") {
      redirect("/dashboard");
    }

    return user;
  } catch (error) {
    redirect("/auth/signin");
  }
}

export default async function CreateCoursePage() {
  const user = await getUser();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Course</h1>
        <p className="text-gray-600 mt-2">
          Fill in the details below to start creating your course
        </p>
      </div>

      <CourseForm instructorId={user.id} />
    </div>
  );
}
