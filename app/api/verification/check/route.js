// app/api/verification/check/route.js
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { getLoggedInUser } from "@/lib/queries";

export async function GET(req) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user has OneId verification
    const verificationData = await mySQL(
      `SELECT oneid_verified, oneid_verification_date, oneid_verification_data 
       FROM users 
       WHERE user_id = ?`,
      [user.user_id],
    );

    const userVerification = verificationData[0];

    return Response.json({
      verified: !!userVerification.oneid_verified,
      verification_date: userVerification.oneid_verification_date,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        oneid_verified: !!userVerification.oneid_verified,
      },
    });
  } catch (error) {
    console.error("Verification check error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return Response.json(
        { message: "Invalid authentication token" },
        { status: 401 },
      );
    }

    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
