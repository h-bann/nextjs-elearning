import mySQL from "@/lib/database";
import { getLoggedInUser } from "@/lib/queries";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    // Get the token from the cookie
    const token = req.cookies.get("auth_token")?.value;

    // If no token exists, return a 200 with null user
    // This is not an error state, just means no one is logged in
    if (!token) {
      return Response.json({ user: null }, { status: 200 });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (excluding password)
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];

    if (!user) {
      return Response.json(
        { message: "User not found" },
        {
          status: 401,
        },
      );
    }

    return Response.json({ user }, { status: 200 });
  } catch (error) {
    // Handle different types of errors
    if (error instanceof jwt.JsonWebTokenError) {
      return Response.json(
        { message: "Invalid token" },
        {
          status: 401,
        },
      );
    }

    if (error instanceof jwt.TokenExpiredError) {
      return Response.json(
        { message: "Token expired" },
        {
          status: 401,
        },
      );
    }

    console.error("Auth check error:", error);
    return Response.json(
      { message: "Internal server error" },
      {
        status: 500,
      },
    );
  }
}
