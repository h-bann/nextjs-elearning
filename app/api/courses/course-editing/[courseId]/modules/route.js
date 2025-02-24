import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { checkInstructor, getLoggedInUser, insertModules } from "@/lib/queries";

// ! ADD MODULES ROUTE
export async function POST(req, { params }) {
  const { courseId } = await params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];
    const { title, order_index } = await req.json();

    // Verify course ownership
    const courses = await mySQL(checkInstructor, [courseId]);

    if (!courses.length || courses[0].instructor_id !== user.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await mySQL(insertModules, [courseId, title, order_index]);

    return Response.json({
      id: data.insertId,
      course_id: courseId,
      title,
      order_index,
    });
  } catch (error) {
    console.error("Module creation error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
