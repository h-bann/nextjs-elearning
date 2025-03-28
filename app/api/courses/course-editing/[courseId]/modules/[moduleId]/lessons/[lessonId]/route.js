import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import {
  addContent,
  checkInstructor,
  deleteLesson,
  getLoggedInUser,
  updateContent,
} from "@/lib/queries";

// ! ADD CONTENT TO EACH LESSON ROUTE
export async function PUT(req, { params }) {
  const { courseId, moduleId, lessonId } = await params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];

    // Verify course ownership
    const courses = await mySQL(checkInstructor, [courseId]);

    if (!courses.length || courses[0].instructor_id !== user.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { content, image } = await req.json();
    console.log("LESSON ID", lessonId);
    // Update lesson content
    await mySQL(addContent, [lessonId, content.type, content.value]);
    if (image) {
      await mySQL(addContent, [lessonId, image.type, image.value]);
    }

    return Response.json({ message: "Lesson updated successfully" });
  } catch (error) {
    console.error("Lesson update error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { courseId, moduleId, lessonId } = await params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];

    // Verify course ownership
    const courses = await mySQL(checkInstructor, [courseId]);

    if (!courses.length || courses[0].instructor_id !== user.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete the lesson
    await mySQL(deleteLesson, [lessonId, moduleId]);

    return Response.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Lesson deletion error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
