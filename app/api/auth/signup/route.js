// app/api/auth/signup/route.js
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

    // Check there is input, return error if not
    if (!username || !email || !password) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Does user exist, return error if yes
    const existingUser = await mySQL(checkExistingUser, [email]);
    if (existingUser.length > 0) {
      return Response.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token and 24hr expiry
    const verificationToken = uuidv4();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Create user
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

    // Try to send verification email
    try {
      await sendVerificationEmail(email, username, verificationToken);
      console.log(`Verification email sent successfully to ${email}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);

      // In development, we can continue without email verification
      if (process.env.NODE_ENV === "development") {
        console.log("Development mode: Continuing without email verification");
        console.log(`Verification token for ${email}: ${verificationToken}`);
        console.log(
          `Verification URL: ${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${verificationToken}`,
        );
      } else {
        // In production, this is a critical error
        throw emailError;
      }
    }

    // Returns success message but doesn't set session cookie yet
    return Response.json(
      {
        success: true,
        requireVerification: true,
        message:
          process.env.NODE_ENV === "development"
            ? "Registration successful. In development mode, check the console for the verification link."
            : "Registration successful. Please check your email to verify your account.",
        email: email,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
