// app/api/auth/signin/route.js
import mySQL from "@/lib/database";
import { getUser } from "@/lib/queries";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get user from database
    const users = await mySQL(getUser, [email]);
    const user = users[0];

    if (!user) {
      return Response.json(
        { message: "Invalid credentials" },
        {
          status: 401,
        }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return Response.json(
        { message: "Invalid credentials" },
        {
          status: 401,
        }
      );
    }

    // Create JWT token with centralied utility
    const token = createToken(user);

    // Prepare user data (excluding sensitive information)
    const userData = {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const cookieStore = cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: "/",
    });

    // Create response with cookie
    return Response.json(
      { user: userData },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Sign in error:", error);
    return Response.json(
      { message: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}
