import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/db/database";
import {
  checkInstructor,
  getLoggedInUser,
  publishCourse,
  unpublishCourse,
} from "@/lib/db/queries";

// ! COURSE PUBLISHING ROUTE
export async function PUT(req, { params }) {
  const { courseId } = await params;

  try {
    // Verify authentication
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

    // Update the course status to published
    await mySQL(publishCourse, ["published", courseId, user.id]);

    return Response.json({
      message: "Course published successfully",
      published: true,
    });
  } catch (error) {
    console.error("Course publish error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Add an unpublish route as well for toggling functionality
export async function DELETE(req, { params }) {
  const { courseId } = await params;

  try {
    // Verify authentication
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

    // Update the course status to unpublished (draft)
    await mySQL(unpublishCourse, [null, courseId, user.id]);

    return Response.json({
      message: "Course unpublished successfully",
      published: false,
    });
  } catch (error) {
    console.error("Course unpublish error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
