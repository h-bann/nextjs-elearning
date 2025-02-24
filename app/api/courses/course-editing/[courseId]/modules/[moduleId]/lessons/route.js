import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import mySQL from "@/lib/database";
import { checkInstructor, getLoggedInUser, insertLessons } from "@/lib/queries";

// ! INSERT LESSONS ROUTE
export async function POST(req, { params }) {
  const { courseId, moduleId } = await params;
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

    // Generate a new lesson ID
    // const lessonId = uuidv4();

    // Insert the lesson
    const data = await mySQL(insertLessons, [moduleId, title, order_index]);

    // Return the complete lesson object
    return Response.json({
      id: data.insertId,
      module_id: Number(moduleId),
      title,
      order_index,
    });
  } catch (error) {
    console.error("Lesson creation error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
