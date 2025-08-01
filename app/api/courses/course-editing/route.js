import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { getLoggedInUser, insertCourse } from "@/lib/queries";
import { checkAuthStatus } from "@/lib/auth-actions";

// ! OVERALL COURSE CREATION ROUTE
export async function POST(req) {
  try {
    // Verify authentication
    const authCheck = await checkAuthStatus();

    // Verify user is an instructor
    const user = await mySQL(getLoggedInUser, [authCheck.user.userId]);
    if (!user.length || user[0].role !== "instructor") {
      return Response.json(
        { message: "Unauthorized - Instructor access required" },
        { status: 403 },
      );
    }

    // Get course data from request
    const { title, description, price, imageUrl } = await req.json();

    // Validate required fields
    if (!title || !description || !price || !imageUrl) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Insert course into database
    const response = await mySQL(insertCourse, [
      title,
      description,
      price,
      imageUrl,
      user[0].id,
      null, // Default to unpublished
    ]);
    console.log(response.insertId);
    return Response.json(
      {
        message: "Course created successfully",
        courseId: response.insertId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Course creation error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
