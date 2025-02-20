import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { checkExistingEmails, updateUser } from "@/lib/queries";

export async function PUT(req) {
  try {
    // Get token and verify
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get update data
    const { username, email } = await req.json();

    // Validate input
    if (!username || !email) {
      return Response.json(
        { message: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email is already taken (if email is being changed)
    const existingUsers = await mySQL(checkExistingEmails, [
      email,
      decoded.userId,
    ]);

    if (existingUsers.length > 0) {
      return Response.json(
        { message: "Email already in use" },
        {
          status: 400,
        }
      );
    }

    // Update user
    await mySQL(updateUser, [username, email, decoded.userId]);

    return Response.json(
      {
        message: "Profile updated successfully",
        user: { username, email },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return Response.json(
      { message: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}
