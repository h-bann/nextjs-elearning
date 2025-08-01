import mySQL from "@/lib/db/database";
import {
  getUserEnrollmentData,
  getUserPersonalInfo,
  getUserProgressData,
} from "@/lib/db/queries";
import { generateUserDataPDF } from "@/lib/pdfGenerator";
import { requireAuth } from "@/lib/auth/auth-actions";

export async function GET(req) {
  try {
    // Use existing server session helper
    const user = await requireAuth();

    if (!user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "pdf";

    // Collect all user data
    const userData = await collectUserData(user.id);

    switch (format) {
      case "pdf":
        // Generate PDF using jsPDF (fast and lightweight)
        const pdfBuffer = generateUserDataPDF(userData);
        const pdfFilename = `user-data-report-${user.username}-${new Date().toISOString().split("T")[0]}.pdf`;

        return new Response(pdfBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${pdfFilename}"`,
            "Cache-Control": "no-cache",
          },
        });

      case "json":
      default:
        const jsonFilename = `user-data-export-${user.username}-${new Date().toISOString().split("T")[0]}.json`;

        return new Response(JSON.stringify(userData, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-cache",
          },
        });
    }
  } catch (error) {
    console.error("Data export error:", error);
    return Response.json({ message: "Export failed" }, { status: 500 });
  }
}

async function collectUserData(userId) {
  // 1. Personal Information
  const personalInfo = await mySQL(getUserPersonalInfo, [userId]);

  // 2. Course Enrollments and Purchases
  const enrollments = await mySQL(getUserEnrollmentData, [userId]);

  // 3. Learning Progress
  const progress = await mySQL(getUserProgressData, [userId]);

  //   // 4. User Settings (if implemented)
  //   const settings = await mySQL(
  //     `SELECT * FROM user_settings WHERE user_id = ?`,
  //     [userId],
  //   );

  //   // 5. Purchase History (if you have a separate purchases table)
  //   const purchases = await mySQL(
  //     `SELECT p.*, c.title as course_title
  //      FROM purchases p
  //      JOIN courses c ON p.course_id = c.id
  //      WHERE p.user_id = ?
  //      ORDER BY p.created_at DESC`,
  //     [userId],
  //   );

  //   // 6. If user is an instructor - their courses
  //   let instructorCourses = [];
  //   if (personalInfo[0].role === "instructor") {
  //     instructorCourses = await mySQL(
  //       `SELECT id, title, description, price, created_at, published
  //        FROM courses WHERE instructor_id = ?`,
  //       [userId],
  //     );
  //   }

  //   // 7. Login/Activity History (if you track this)
  //   const loginHistory = await mySQL(
  //     `SELECT login_time, ip_address, user_agent
  //      FROM user_login_history
  //      WHERE user_id = ?
  //      ORDER BY login_time DESC
  //      LIMIT 100`,
  //     [userId],
  //   );

  // Compile everything into a structured format
  return {
    export_info: {
      generated_at: new Date().toISOString(),
      user_id: personalInfo[0].user_id,
      export_type: "GDPR_DATA_EXPORT",
      format_version: "1.0",
    },
    personal_information: personalInfo[0],
    // account_settings: settings[0] || {},
    course_enrollments: enrollments,
    learning_progress: {
      total_lessons_completed: progress.filter((p) => p.completed).length,
      total_courses_enrolled: enrollments.length,
      progress_records: progress,
    },
    // purchase_history: purchases,
    // instructor_data: {
    //   courses_created: instructorCourses,
    //   total_courses: instructorCourses.length,
    // },
    // activity_history: {
    //   recent_logins: loginHistory,
    //   last_login: loginHistory[0]?.login_time || null,
    // },
    data_categories_explanation: {
      personal_information: "Basic account details and verification status",
      course_enrollments: "Courses you have enrolled in or purchased",
      learning_progress: "Your progress through lessons and courses",
      //   purchase_history: "Record of payments and transactions",
      //   instructor_data: "Courses you have created (if applicable)",
      //   activity_history: "Login times and usage patterns",
    },
  };
}
