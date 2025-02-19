// app/api/auth/signin/route.js
import mySQL from "@/lib/database";
import { getUser } from "@/lib/queries";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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
    console.log(user);
    if (!user) {
      return Response(
        { message: "Invalid credentials" },
        {
          status: 401,
        }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return Response(
        { message: "Invalid credentials" },
        {
          status: 401,
        }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Prepare user data (excluding sensitive information)
    const userData = {
      userId: user.user_id,
      username: user.username,
      email: user.email,
    };

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
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
    return Response(
      { message: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}
