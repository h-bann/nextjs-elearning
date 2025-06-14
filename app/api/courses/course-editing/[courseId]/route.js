import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import {
  checkInstructor,
  getLoggedInUser,
  updateCourseWithImage,
  updateCourseWithoutImage,
} from "@/lib/queries";

// Updated course editing route to handle PUT requests for updating course details
export async function PUT(req, { params }) {
  const { courseId } = params;

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

    // Get course data from request
    const { title, description, price, imageUrl } = await req.json();

    // Validate required fields
    if (!title || !description || !price) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    if (imageUrl) {
      await mySQL(updateCourseWithImage, [
        title,
        description,
        price,
        imageUrl,
        courseId,
        user.id,
      ]);
    } else {
      await mySQL(updateCourseWithoutImage, [
        title,
        description,
        price,
        courseId,
        user.id,
      ]);
    }

    return Response.json(
      {
        message: "Course updated successfully",
        course: {
          id: courseId,
          title,
          description,
          price,
          image_url: imageUrl,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Course update error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
