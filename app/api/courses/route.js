import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import mySQL from "@/lib/database";
import { getLoggedInUser, insertCourse } from "@/lib/queries";

export async function POST(req) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get instructor ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user is an instructor
    const user = await mySQL(getLoggedInUser, [decoded.userId]);
    console.log(user);
    if (!user.length || user[0].role !== "instructor") {
      return Response.json(
        { message: "Unauthorized - Instructor access required" },
        { status: 403 }
      );
    }

    // Get course data from request
    const {
      title,
      description,
      price,
      // imageUrl
    } = await req.json();

    // Validate required fields
    if (!title || !description || !price) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create course ID
    // const courseId = uuidv4();

    // Insert course into database
    await mySQL(insertCourse, [
      //   courseId,
      title,
      description,
      price,
      //   imageUrl,
      user[0].id,
      null, // Default to unpublished
    ]);

    return Response.json(
      {
        message: "Course created successfully",
        // courseId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Course creation error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// app/api/upload/route.js
// import { writeFile } from "fs/promises";
// import { join } from "path";
// import { cookies } from "next/headers";
// import jwt from "jsonwebtoken";
// import mySQL from "@/lib/database";
// import { getLoggedInUser } from "@/lib/queries";

// export async function POST(req) {
//   try {
//     // Verify authentication
//     const cookieStore = cookies();
//     const token = cookieStore.get("auth_token")?.value;

//     if (!token) {
//       return Response.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Get the form data
//     const formData = await req.formData();
//     const file = formData.get("image");

//     if (!file) {
//       return Response.json({ message: "No file provided" }, { status: 400 });
//     }

//     // Validate file type
//     const validTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!validTypes.includes(file.type)) {
//       return Response.json({ message: "Invalid file type" }, { status: 400 });
//     }

//     // Validate file size (10MB limit)
//     if (file.size > 10 * 1024 * 1024) {
//       return Response.json({ message: "File too large" }, { status: 400 });
//     }

//     // Create unique filename
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
//     const filename = `${decoded.userId}-${Date.now()}.${
//       file.type.split("/")[1]
//     }`;

//     // Ensure uploads directory exists
//     const uploadDir = join(process.cwd(), "public", "uploads");
//     try {
//       await writeFile(join(uploadDir, filename), buffer);
//     } catch (error) {
//       console.error("File write error:", error);
//       return Response.json({ message: "Error saving file" }, { status: 500 });
//     }

//     // Return the URL for the uploaded image
//     return Response.json(
//       {
//         message: "File uploaded successfully",
//         url: `/uploads/${filename}`,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Upload error:", error);
//     return Response.json({ message: "Internal server error" }, { status: 500 });
//   }
// }
