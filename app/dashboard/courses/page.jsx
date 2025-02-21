import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import StudentCourseList from "@/components/dashboard/courses/StudentCourseList";
import InstructorCourseList from "@/components/dashboard/courses/InstructorCourseList";
import mySQL from "@/lib/database";
import {
  getEnrolledCourse,
  getInstructorCourse,
  getLoggedInUser,
} from "@/lib/queries";
import { redirect } from "next/navigation";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    redirect("/auth/signin");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    return users[0];
  } catch (error) {
    redirect("/auth/signin");
  }
}

async function getInstructorCourses(userId) {
  const courses = await mySQL(getInstructorCourse, [userId]);
  return courses;
}

async function getEnrolledCourses(userId) {
  const courses = await mySQL(getEnrolledCourse, [userId, userId]);
  return courses;
}

export default async function CoursesPage() {
  const user = await getUser();
  console.log(user);
  if (user.role === "instructor") {
    const courses = await getInstructorCourses(user.id);
    return <InstructorCourseList courses={courses} />;
  } else {
    const courses = await getEnrolledCourses(user.id);
    return <StudentCourseList courses={courses} />;
  }
}
