// app/api/profile/delete-account/route.js
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import {
  deleteUserEnrollments,
  deleteProgressRecords,
  getLoggedInUser,
  deleteUserAccount,
} from "@/lib/queries";

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

    // Start transaction for data integrity
    await mySQL("START TRANSACTION");

    try {
      // Delete user's progress records
      await mySQL(deleteProgressRecords, [user.id]);

      // Delete user's enrollments
      await mySQL(deleteUserEnrollments, [user.id]);

      // Delete user's purchases (if you have a separate purchases table)
      //   await mySQL("DELETE FROM purchases WHERE user_id = ?", [user.id]);

      // Delete any user settings (if you implement the settings table later)
      //   await mySQL("DELETE FROM user_settings WHERE user_id = ?", [user.id]);

      // If user is an instructor, we need to handle their courses
      // Option 1: Delete all their courses and associated data
      // Option 2: Transfer ownership or mark as inactive
      // For now, let's prevent deletion if they have active courses with students

      //   const instructorCourses = await mySQL(
      //     "SELECT id FROM courses WHERE instructor_id = ?",
      //     [user.id],
      //   );

      //   if (instructorCourses.length > 0) {
      //     const courseIds = instructorCourses.map((course) => course.id);

      //     // Check if any of their courses have enrolled students
      //     const enrolledStudents = await mySQL(
      //       `SELECT COUNT(*) as student_count
      //        FROM enrollments
      //        WHERE course_id IN (${courseIds.map(() => "?").join(",")})
      //        AND status = 'ACTIVE'`,
      //       courseIds,
      //     );

      //     if (enrolledStudents[0].student_count > 0) {
      //       await mySQL("ROLLBACK");
      //       return Response.json(
      //         {
      //           message:
      //             "Cannot delete account. You have active courses with enrolled students. Please contact support for assistance.",
      //         },
      //         { status: 400 },
      //       );
      //     }

      //     // If no students enrolled, delete instructor's courses and related data
      //     for (const courseId of courseIds) {
      //       // Delete lesson content
      //       await mySQL(
      //         "DELETE FROM lesson_content WHERE lesson_id IN (SELECT id FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id = ?))",
      //         [courseId],
      //       );

      //       // Delete lessons
      //       await mySQL(
      //         "DELETE FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id = ?)",
      //         [courseId],
      //       );

      //       // Delete modules
      //       await mySQL("DELETE FROM modules WHERE course_id = ?", [courseId]);

      //       // Delete the course
      //       await mySQL("DELETE FROM courses WHERE id = ?", [courseId]);
      //     }
      //   }

      // Finally, delete the user account
      await mySQL(deleteUserAccount, [user.id]);

      // Commit the transaction
      await mySQL("COMMIT");

      // Clear the authentication cookie
      cookieStore.set("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0, // Expire immediately
        path: "/",
      });

      return Response.json({
        message: "Account deleted successfully",
      });
    } catch (deleteError) {
      // Rollback transaction on error
      await mySQL("ROLLBACK");
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
