// app/api/verification/oneid/callback/route.js
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import {
  checkUserVerification,
  getLoggedInUser,
  updateUserVerification,
} from "@/lib/queries";

const ONEID_CLIENT_ID = process.env.NEXT_PUBLIC_ONEID_CLIENT_ID;
const ONEID_CLIENT_SECRET = process.env.ONEID_CLIENT_SECRET; // You'll need to add this to your env
// const ONEID_REDIRECT_URI =
//   process.env.NEXT_PUBLIC_SITE_URL + "/verification/oneid/callback";

export async function POST(req) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }
    console.log("User authenticated:", user.username);

    // Get the authorization code from the request
    const { code, state } = await req.json();
    console.log("Received code:", code ? "Present" : "Missing");
    console.log("Received state:", state);
    if (!code) {
      return Response.json(
        { message: "Authorization code missing" },
        { status: 400 },
      );
    }

    // Prepare token exchange request
    const tokenRequestBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: ONEID_CLIENT_ID,
      client_secret: ONEID_CLIENT_SECRET,
      code: code,
      redirect_uri: "http://localhost:3000",
    });

    console.log("Token request body:", {
      grant_type: "authorization_code",
      client_id: ONEID_CLIENT_ID,
      client_secret: ONEID_CLIENT_SECRET ? "[PRESENT]" : "[MISSING]",
      code: code ? "[PRESENT]" : "[MISSING]",
      redirect_uri: "http://localhost:3000",
    });

    // Exchange authorization code for access token
    console.log("Making token exchange request to OneId...");

    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      "https://controller.sandbox.myoneid.co.uk/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${ONEID_CLIENT_ID}:${ONEID_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: tokenRequestBody,
        // new URLSearchParams({
        //   grant_type: "authorization_code",
        //   code: code,
        //   //   redirect_uri: ONEID_REDIRECT_URI,
        //   redirect_uri: "https://professionaldominatrixlondon.com",
        // }),
      },
    );
    console.log("Token response status:", tokenResponse.status);
    console.log(
      "Token response headers:",
      Object.fromEntries(tokenResponse.headers.entries()),
    );
    // console.log(tokenResponse);
    // console.log(ONEID_CLIENT_ID, ONEID_CLIENT_SECRET);
    // console.log(tokenResponse.text());
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.log(errorData);
      console.error("Token exchange failed:", errorData);
      return Response.json(
        { message: "Failed to exchange authorization code" },
        { status: 400 },
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, id_token } = tokenData;

    // Get user info from OneId
    const userInfoResponse = await fetch(
      "https://controller.sandbox.myoneid.co.uk/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      console.error("Failed to get user info from OneId");
      return Response.json(
        { message: "Failed to get user information" },
        { status: 400 },
      );
    }

    const userInfo = await userInfoResponse.json();
    console.log("USER INFO", userInfo);
    // Verify age_over_18 claim
    if (!userInfo.age_over_18) {
      return Response.json(
        { message: "Age verification failed - user is under 18" },
        { status: 403 },
      );
    }

    // Update user record with OneId verification
    await mySQL(updateUserVerification, [1, userInfo.sub, user.user_id]);

    return Response.json({
      message: "Age verification successful",
      verified: true,
      user: {
        id: user.id,
        username: user.username,
        oneid_verified: true,
      },
    });
  } catch (error) {
    console.error("OneId callback error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return Response.json(
        { message: "Invalid authentication token" },
        { status: 401 },
      );
    }

    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
