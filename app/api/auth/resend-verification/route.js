import { v4 as uuidv4 } from "uuid";
import mySQL from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";
import { getUser, newVerificationToken } from "@/lib/queries";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ message: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const users = await mySQL(getUser, [email]);

    if (!users.length) {
      // Don't reveal if user exists for security
      return Response.json(
        { message: "If an account exists, a verification email has been sent" },
        { status: 200 },
      );
    }

    const user = users[0];

    // If already verified, no need to resend
    if (user.verified) {
      return Response.json(
        { message: "Email already verified. Please sign in." },
        { status: 200 },
      );
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Update user with new token
    await mySQL(newVerificationToken, [
      verificationToken,
      verificationExpires,
      user.user_id,
    ]);

    // Send verification email
    await sendVerificationEmail(user.email, user.username, verificationToken);

    return Response.json(
      { message: "Verification email sent" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
