import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { getLoggedInUser } from "@/lib/queries";
import { redirect } from "next/navigation";

/**
 * Gets the current authenticated user or null
 */
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const users = await mySQL(getLoggedInUser, [decoded.userId]);

    if (!users.length) {
      return null;
    }

    return users[0];
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

/**
 * Server component helper to require authentication
 * Automatically redirects if not authenticated
 */
export async function requireAuth(redirectPath = "/auth/signin") {
  const session = await getServerSession();

  if (!session) {
    redirect(redirectPath);
  }

  return session;
}

/**
 * Server component helper to require specific role
 * Automatically redirects if not authorized
 */
export async function requireRole(roles, redirectPath = "/dashboard") {
  const user = await requireAuth();

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(user.role)) {
    redirect(redirectPath);
  }

  return user;
}

/**
 * API route wrapper to require authentication
 */
export function withAuth(handler) {
  return async (req, ...rest) => {
    try {
      const cookieStore = cookies();
      const token = cookieStore.get("auth_token")?.value;

      if (!token) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = await mySQL(getLoggedInUser, [decoded.userId]);

      if (!users.length) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }

      // Add user to the request object
      req.user = users[0];

      // Call the original handler
      return handler(req, ...rest);
    } catch (error) {
      console.error("API auth error:", error);
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
  };
}

/**
 * API route wrapper to require specific role
 */
export function withRole(roles, handler) {
  return async (req, ...rest) => {
    try {
      const cookieStore = cookies();
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
