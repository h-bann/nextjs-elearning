import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/db/database";
import {
  deleteUserEnrollments,
  deleteProgressRecords,
  getLoggedInUser,
  deleteUserAccount,
  startTransaction,
  commitTransaction,
  rollbackTransaction,
  checkAnyEnrolledStudents,
  deleteAllInstructorCourseContent,
  deleteAllInstructorLessons,
  deleteAllInstructorModules,
  deleteAllInstructorCourses,
  deleteUserPurchases,
  deleteUserSettings,
} from "@/lib/db/queries";

export async function DELETE(req) {
  try {
    // Get token and verify
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Start transaction
    await mySQL(startTransaction);

    try {
      // If user is an instructor, handle their courses
      if (user.role === "instructor") {
        // Check if they have any students enrolled in their courses
        const enrolledStudents = await mySQL(checkAnyEnrolledStudents, [
          user.id,
        ]);

        if (enrolledStudents[0].student_count > 0) {
          await mySQL(rollbackTransaction);
          return Response.json(
            {
              message:
                "Cannot delete account. You have active courses with enrolled students. Please contact support for assistance.",
            },
            { status: 400 },
          );
        }

        // Delete all instructor's course content (in proper order)
        await mySQL(deleteAllInstructorCourseContent, [user.id]);
        await mySQL(deleteAllInstructorLessons, [user.id]);
        await mySQL(deleteAllInstructorModules, [user.id]);
        await mySQL(deleteAllInstructorCourses, [user.id]);
      }

      // Delete user's progress records
      await mySQL(deleteProgressRecords, [user.id]);

      // Delete user's enrollments
      await mySQL(deleteUserEnrollments, [user.id]);

      // Delete user's purchases (optional tables)
      try {
        await mySQL(deleteUserPurchases, [user.id]);
      } catch (error) {
        console.log("Purchases table not found, skipping");
      }

      // Delete user settings (optional tables)
      try {
        await mySQL(deleteUserSettings, [user.id]);
      } catch (error) {
        console.log("Settings table not found, skipping");
      }

      // Finally, delete the user account
      await mySQL(deleteUserAccount, [user.id]);

      // Commit the transaction
      await mySQL(commitTransaction);

      // Clear the authentication cookie
      cookieStore.set("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });

      return Response.json({
        message: "Account deleted successfully",
      });
    } catch (deleteError) {
      await mySQL(rollbackTransaction);
      throw deleteError;
    }
  } catch (error) {
    console.error("Account deletion error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return Response.json(
        { message: "Invalid authentication token" },
        { status: 401 },
      );
    }

    return Response.json(
      {
        message:
          "Failed to delete account. Please try again or contact support.",
      },
      { status: 500 },
    );
  }
}
