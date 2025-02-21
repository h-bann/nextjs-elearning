import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/database";
import { checkInstructor, getLoggedInUser, insertModules } from "@/lib/queries";

export async function POST(req, { params }) {
  console.log("Full request object:", JSON.stringify(req, null, 2));
  console.log("Params:", JSON.stringify(params, null, 2));
  try {
    console.log("Received request to create module");

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.log("Params:", params);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];
    const { title, order_index } = await req.json();
    console.log("Request body:", { title, order_index });

    // Verify course ownership
    const courses = await mySQL(checkInstructor, [params.courseId]);

    if (!courses.length || courses[0].instructor_id !== user.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await mySQL(insertModules, [params.courseId, title, order_index]);

    return Response.json({
      course_id: params.courseId,
      title,
      order_index,
    });
  } catch (error) {
    console.error("Module creation error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// app/api/courses/[courseId]/modules/route.js
// export async function POST(req) {
//   console.log("API endpoint hit");

//   try {
//     const body = await req.json();
//     console.log("Received data:", body);

//     return Response.json({ message: "Received request" });
//   } catch (error) {
//     console.error("Error in API route:", error);
//     return Response.json({ message: error.message }, { status: 500 });
//   }
// }
