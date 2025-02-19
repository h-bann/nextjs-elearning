import { cookies } from "next/headers";

export async function POST(req) {
  try {
    // Create response with success message
    const response = new Response(
      JSON.stringify({ message: "Logged out successfully" }),
      { status: 200 }
    );

    // Clear the auth token cookie by setting it to expire immediately
    const cookieStore = await cookies();

    cookieStore.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // This makes the cookie expire immediately
    });

    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return new Response(JSON.stringify({ message: "Error during sign out" }), {
      status: 500,
    });
  }
}
