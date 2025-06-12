import mySQL from "@/lib/database";
import { sendWelcomeEmail } from "@/lib/email";
import { createToken } from "@/lib/jwt";
import {
  findVerificationToken,
  updateVerification,
  usedVerificationToken,
} from "@/lib/queries";
import { cookies } from "next/headers";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      console.error("Verification failed: Token missing");

      return Response.json(
        { success: false, message: "Verification token is missing" },
        { status: 400 },
      );
    }

    // mySQL time format
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    console.log(`Verification attempt with token: ${token} at ${timestamp}`);

    const verifiedUsers = await mySQL(usedVerificationToken);
    if (verifiedUsers.length > 0) {
      return Response.json(
        {
          success: false,
          alreadyVerified: true,
          message: "Your email has already been verified. You can now sign in.",
        },
        { status: 200 },
      );
    }

    const users = await mySQL(findVerificationToken, [token, timestamp]);
    console.log(`Query result: Found ${users.length} matching users`);

    if (!users.length) {
      console.error("Verification failed: Invalid or expired token");

      return Response.json(
        {
          message: "Invalid or expired verficiation token",
        },
        { status: 400 },
      );
    }

    const user = users[0];
    console.log(`Found user with ID: ${user.user_id}`);

    await mySQL(updateVerification, [user.user_id]);
    console.log(`User ${user.user_id} marked as verified`);

    await sendWelcomeEmail(user.email, user.username);
    console.log(`Welcome email sent to ${user.email}`);

    // Create JWT token
    const jwtToken = createToken(user);

    const cookieStore = await cookies();
    cookieStore.set("auth_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });
    console.log(`Auth cookie set for user ${user.user_id}`);

    return Response.json(
      {
        success: true,
        message: "Email verified successfully",
        user: {
          username: user.username,
          email: user.email,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verification error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
