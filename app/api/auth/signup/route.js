import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { checkExistingUser, createUser } from "@/lib/queries";
import { cookies } from "next/headers";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();
    // check there is input, return error if not
    if (!username || !email || !password) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // does user exist, return error if not
    const existingUser = await mySQL(checkExistingUser, [email]);
    if (existingUser.length > 0) {
      return Response.json(
        { message: "User already exists" },
        {
          status: 400,
        },
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // generate verification token and 24hr expiry
    const verificationToken = uuidv4();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // create user
    const userId = uuidv4();
    await mySQL(createUser, [
      userId,
      "user",
      username,
      email,
      hashedPassword,
      false,
      verificationToken,
      verificationExpiry,
    ]);

    // send verification email
    // await sendVerificationEmail(email, username, verificationToken);

    // returns success message but doesn't set session cookie yet
    return Response.json(
      {
        success: true,
        requireVerification: true,
        message:
          "Registration successful. Please check your email to verify your account.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json(
      { message: "Internal server error" },
      {
        status: 500,
      },
    );
  }
}
