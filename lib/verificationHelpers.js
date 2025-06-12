// lib/verificationHelpers.js
import mySQL from "@/lib/database";

export async function checkUserVerification(userId) {
  try {
    const result = await mySQL(
      `SELECT oneid_verified, oneid_verification_date 
       FROM users 
       WHERE id = ?`,
      [userId],
    );

    return {
      isVerified: result.length > 0 && result[0].oneid_verified,
      verificationDate: result[0]?.oneid_verification_date,
    };
  } catch (error) {
    console.error("Error checking user verification:", error);
    return { isVerified: false, verificationDate: null };
  }
}

export function requireAgeVerification(handler) {
  return async (req, ...rest) => {
    try {
      // This assumes the user is already attached to req by withAuth
      if (!req.user) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }

      const { isVerified } = await checkUserVerification(req.user.id);

      if (!isVerified) {
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
