// lib/verificationHelpers.js
import mySQL from "@/lib/database";

export async function checkUserVerification(userId) {
  try {
    const result = await mySQL(
      `SELECT oneid_verified, oneid_verification_date, role 
       FROM users 
       WHERE id = ?`,
      [userId],
    );

    if (result.length === 0) {
      return { isVerified: false, verificationDate: null, userRole: null };
    }

    const userData = result[0];

    // Instructors are considered "verified" for purchase purposes
    const isVerified =
      userData.oneid_verified || userData.role === "instructor";

    return {
      isVerified: isVerified,
      verificationDate: userData.oneid_verification_date,
      userRole: userData.role,
    };
  } catch (error) {
    console.error("Error checking user verification:", error);
    return { isVerified: false, verificationDate: null, userRole: null };
  }
}

export function requireAgeVerification(handler) {
  return async (req, ...rest) => {
    try {
      // This assumes the user is already attached to req by withAuth
      if (!req.user) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }

      const { isVerified, userRole } = await checkUserVerification(req.user.id);

      // Instructors don't need age verification
      if (!isVerified && userRole !== "instructor") {
        return Response.json(
          {
            message: "Age verification required",
            needsVerification: true,
          },
          { status: 403 },
        );
      }

      return handler(req, ...rest);
    } catch (error) {
      console.error("Verification check error:", error);
      return Response.json(
        { message: "Internal server error" },
        { status: 500 },
      );
    }
  };
}
