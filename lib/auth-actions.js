// lib/auth-actions.js
"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import mySQL from "@/lib/database";
import { getUser, updateVerification } from "@/lib/queries";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";

// Sign in action
export async function signIn(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const rememberMe = formData.get("rememberMe") === "on";
  const redirectTo = formData.get("redirectTo") || "/dashboard";

  try {
    // Validate input
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    // Get user from database
    const users = await mySQL(getUser, [email]);
    const user = users[0];

    if (!user) {
      return {
        success: false,
        error: "Invalid credentials",
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return {
        success: false,
        error: "Invalid credentials",
      };
    }

    // Check if email is verified
    if (!user.verified) {
      return {
        success: false,
        error: "Please verify your email before signing in",
        needsVerification: true,
        email: user.email,
      };
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "7d" : "24h" },
    );

    // Set cookie
    await cookies().set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // seconds
      path: "/",
    });

    // Return success and redirect URL
    return {
      success: true,
      redirectTo,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error: "Authentication failed",
    };
  }
}

// Sign out action
export async function signOut() {
  // Clear the cookie
  await cookies().set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  // Redirect to home page
  redirect("/");
}

// Sign up action
export async function signUp(prevState, formData) {
  try {
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    // Validate input
    if (!username || !email || !password) {
      return {
        success: false,
        error: "All fields are required",
      };
    }

    // Check if user already exists
    const existingUser = await mySQL(
      "SELECT user_id FROM users WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      return {
        success: false,
        error: "User already exists",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = uuidv4();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Create user
    const userId = uuidv4();
    await mySQL(
      "INSERT INTO users (user_id, role, username, email, password, verified, verification_token, verification_expiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        "user",
        username,
        email,
        hashedPassword,
        false,
        verificationToken,
        verificationExpiry,
      ],
    );

    // Send verification email
    await sendVerificationEmail(email, username, verificationToken);

    return {
      success: true,
      requireVerification: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      email,
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: "Registration failed",
    };
  }
}

// Verify email action
export async function verifyEmail(token) {
  try {
    if (!token) {
      return {
        success: false,
        error: "Verification token is missing",
      };
    }

    // Check if token is valid
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const users = await mySQL(
      "SELECT users.user_id, users.email, users.username FROM users WHERE verification_token = ? AND verification_expiry > ?",
      [token, timestamp],
    );

    if (!users.length) {
      return {
        success: false,
        error: "Invalid or expired verification token",
      };
    }

    const user = users[0];

    // Mark user as verified
    await mySQL(updateVerification, [user.user_id]);

    // Send welcome email
    await sendWelcomeEmail(user.email, user.username);

    // Create JWT token and set cookie
    const jwtToken = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    cookies().set("auth_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return {
      success: true,
      message: "Email verified successfully",
      username: user.username,
    };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      success: false,
      error: "Failed to verify email",
    };
  }
}

// Resend verification email
export async function resendVerification(prevState, formData) {
  try {
    const email = formData.get("email");

    if (!email) {
      return {
        success: false,
        error: "Email is required",
      };
    }

    // Check if user exists
    const users = await mySQL(getUser, [email]);

    if (!users.length) {
      // Don't reveal if user exists for security
      return {
        success: true,
        message: "If an account exists, a verification email has been sent",
      };
    }

    const user = users[0];

    // If already verified, no need to resend
    if (user.verified) {
      return {
        success: true,
        message: "Email already verified. Please sign in.",
      };
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Update user with new token
    await mySQL(
      "UPDATE users SET verification_token = ?, verification_expiry = ? WHERE user_id = ?",
      [verificationToken, verificationExpires, user.user_id],
    );

    // Send verification email
    await sendVerificationEmail(user.email, user.username, verificationToken);

    return {
      success: true,
      message: "Verification email sent",
    };
  } catch (error) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      error: "Failed to send verification email",
    };
  }
}
