import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/db/database";
import { getLoggedInUser } from "@/lib/db/queries";
import { uploadToS3 } from "@/lib/fileUpload";
import sharp from "sharp";

// ! IMAGE UPLOAD ROUTE
export async function POST(req) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await mySQL(getLoggedInUser, [decoded.userId]);

    // Get the form data
    const formData = await req.formData();
    const file = formData.get("image") || null;
    const lessonTitle = formData.get("lessonTitle")?.replace(/\s+/g, "_") || "";
    const courseName = formData.get("title")?.replace(/\s+/g, "_") || "";
    const moduleId = formData.get("moduleId") || null;
    console.log(file);
    console.log(moduleId);
    if (!file) {
      return Response.json({ message: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return Response.json({ message: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ message: "File too large" }, { status: 400 });
    }
    const bucketName = process.env.DO_SPACES_NAME;
    const folderPath = `courses/${courseName}`;

    const buffer = await file.arrayBuffer();
    const optimisedBuffer = await sharp(Buffer.from(buffer))
      .resize(200)
      .webp({ quality: 100 })
      .toBuffer();

    const fileKey = moduleId
      ? `${folderPath}/${moduleId}-${lessonTitle}.webp`
      : `${folderPath}/coverImage.webp`;

    const fileUrl = await uploadToS3(optimisedBuffer, fileKey, bucketName);

    // Return the URL for the uploaded image
    return Response.json(
      {
        message: "Image uploaded successfully",
        url: fileUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
