export async function POST(req) {
  try {
    // Create response with success message
    const response = Response.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );

    // Clear the auth token cookie by setting it to expire immediately
    const cookieStore = await cookies();

    cookieStore.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // This makes the cookie expire immediately
    });

    // Add redirection
    response.headers.set("Location", "/");

    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return Response.json(
      { message: "Error during sign out" },
      {
        status: 500,
      },
    );
  }
}
