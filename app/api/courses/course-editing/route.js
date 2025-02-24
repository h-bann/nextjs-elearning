import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { getLoggedInUser, insertCourse } from "@/lib/queries";

// ! OVERALL COURSE CREATION ROUTE
export async function POST(req) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get instructor ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user is an instructor
    const user = await mySQL(getLoggedInUser, [decoded.userId]);
    console.log(user);
    if (!user.length || user[0].role !== "instructor") {
      return Response.json(
        { message: "Unauthorized - Instructor access required" },
        { status: 403 }
      );
    }

    // Get course data from request
    const { title, description, price, imageUrl } = await req.json();

    // Validate required fields
    if (!title || !description || !price || !imageUrl) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert course into database
    await mySQL(insertCourse, [
      title,
      description,
      price,
      imageUrl,
      user[0].id,
      null, // Default to unpublished
    ]);

    return Response.json(
      {
        message: "Course created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Course creation error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
