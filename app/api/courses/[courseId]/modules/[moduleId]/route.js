import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { checkInstructor, deleteModule, getLoggedInUser } from "@/lib/queries";

export async function DELETE(req, { params }) {
  const { courseId } = await params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get moduleId from URL
    const url = new URL(req.url);
    const moduleId = url.pathname.split("/").pop();
    console.log(moduleId);
    // Verify user is authorized
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];

    // Verify course ownership
    const courses = await mySQL(checkInstructor, [courseId]);

    if (!courses.length || courses[0].instructor_id !== user.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete the module
    await mySQL(deleteModule, [moduleId, courseId]);

    return Response.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Module deletion error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
