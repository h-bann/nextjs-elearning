import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import {
  checkInstructor,
  getLoggedInUser,
  reorderLessons,
  reorderModules,
} from "@/lib/queries";

// ! REORDER MODULES AND LESSONS ROUTE
export async function PUT(req, { params }) {
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

    // Verify course ownership
    const courses = await mySQL(checkInstructor, [courseId]);

    if (!courses.length || courses[0].instructor_id !== user.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { type, items, moduleId } = await req.json();

    if (type === "modules") {
      await Promise.all(
        items.map((module) =>
          mySQL(reorderModules, [module.order_index + 1, module.id, courseId])
        )
      );
    } else if (type === "lessons") {
      await Promise.all(
        items.map((lesson) =>
          mySQL(reorderLessons, [lesson.order_index + 1, lesson.id, moduleId])
        )
      );
    }

    return Response.json({ message: `${type} reordered successfully` });
  } catch (error) {
    console.error("Reorder error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
