import mySQL from "@/lib/db/database";
import { getUserPassword, updateUserPassword } from "@/lib/db/queries";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    // Get token and verify
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get passwords
    const { currentPassword, newPassword } = await req.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return Response.json(
        { message: "Current and new password are required" },
        { status: 400 },
      );
    }

    // Get user with current password
    const users = await mySQL(getUserPassword, [decoded.userId]);

    if (!users.length) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      users[0].password,
    );

    if (!isValidPassword) {
      return Response.json(
        { message: "Current password is incorrect" },
        { status: 400 },
      );
    }

    // Validate new password
    if (newPassword.length < 6) {
      return Response.json(
        { message: "New password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await mySQL(updateUserPassword, [hashedPassword, decoded.userId]);

    return Response.json(
      { message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password change error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
