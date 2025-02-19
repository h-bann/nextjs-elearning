// app/api/auth/signup/route.js
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { checkExistingUser, createUser } from "@/lib/queries";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();
    console.log(username, email, password);
    // Validate input
    if (!username || !email || !password) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await mySQL(checkExistingUser, [email]);
    console.log(existingUser);
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ message: "User already exists" }), {
        status: 400,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = uuidv4();
    await mySQL(createUser, [userId, username, email, hashedPassword]);

    // Create JWT token
    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log(token);

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return Response.json(
      {
        user: {
          id: userId,
          username,
          email,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
