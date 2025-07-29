import mySQL from "@/lib/database";
import { getUser } from "@/lib/queries";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    const { email, password, rememberMe } = await req.json();

    // Validate input
    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 },
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
        },
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return Response.json(
        { message: "Invalid credentials" },
        {
          status: 401,
        },
      );
    }

    if (!user.verified) {
      return Response.json(
        {
          message: "Please verify your email address before signing in",
          needsVerification: true,
          email: user.email,
        },
        { status: 403 },
      );
    }

    // Set token expiration based on "remember me" option
    const tokenOptions = {
      expiresIn: rememberMe ? "7d" : "24h", // 7 days if remember me is checked, otherwise 24 hours
    };

    // Create JWT token with centralized utility
    const token = createToken(user, tokenOptions);

    // Prepare user data (excluding sensitive information)
    const userData = {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const cookieStore = cookies();
    const cookieName =
      process.env.NODE_ENV === "production"
        ? "__Host-auth_token"
        : "auth_token";

    // Set cookie max age based on "remember me" option
    const maxAge = rememberMe
      ? 7 * 24 * 60 * 60 // 7 days in seconds
      : 24 * 60 * 60; // 24 hours in seconds

    cookieStore.set({
      name: cookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: maxAge,
      path: "/",
    });

    // Create response with cookie
    return Response.json(
      { user: userData },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Sign in error:", error);
    return Response.json(
      { message: "Internal server error" },
      {
        status: 500,
      },
    );
  }
}
