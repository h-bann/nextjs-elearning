import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/db/database";
import { getLoggedInUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { cache } from "react";

// export const getServerSession = cache(async () => {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get("auth_token")?.value;

//     if (!token) {
//       return null;
//     }

//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Get user from database
//     const user = await mySQL(getLoggedInUser, [decoded.userId]);

//     if (!user.length) {
//       return null;
//     }

//     return user[0];
//   } catch (error) {
//     console.error("Auth error:", error);
//     return null;
//   }
// });

// export async function requireAuth(redirectPath = "/auth/signin") {
//   const session = await getServerSession();

//   if (!session) {
//     const searchParams = new URLSearchParams();
//     searchParams.set("redirect", redirectPath);
//     redirect(`/auth/signin?${searchParams.toString()}`);
//   }

//   return session;
// }

//  Server component helper to require specific role
//  Automatically redirects if not authorized

export async function requireRole(roles, redirectPath = "/dashboard") {
  const user = await requireAuth();

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(user.role)) {
    redirect(redirectPath);
  }

  return user;
}

// API route wrapper to require specific role

export function withRole(roles, handler) {
  return async (req, ...rest) => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;

      if (!token) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = await mySQL(getLoggedInUser, [decoded.userId]);

      if (!users.length) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }

      const user = users[0];
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(user.role)) {
        return Response.json({ message: "Forbidden" }, { status: 403 });
      }

      // Add user to the request object
      req.user = user;

      // Call the original handler
      return handler(req, ...rest);
    } catch (error) {
      console.error("API auth error:", error);
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
  };
}
