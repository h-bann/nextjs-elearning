import { withAuth, withRole } from "@/lib/serverAuth";
import mySQL from "@/lib/database";
import { checkInstructor } from "@/lib/queries";
import { uploadToS3 } from "@/lib/fileUpload";

export const POST = withRole("instructor", async (req) => {
  try {
    const user = req.user;

    const formData = await req.formData();
    const file = formData.get("video") || null;
    const lessonTitle = formData.get("lessonTitle")?.replace(/\s+/g, "_") || "";
    const courseName = formData.get("title")?.replace(/\s+/g, "_") || "";
    const moduleId = formData.get("moduleId") || null;
    const courseId = formData.get("courseId") || null;

    if (!file) {
      return Response.json({ message: "No file provided" }, { status: 400 });
    }

    if (courseId) {
      const courses = await mySQL(checkInstructor, [courseId]);
      if (!courses.length || courses[0].instructor_id !== user.id) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    const validTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!validTypes.includes(file.type)) {
      return Response.json({ message: "Invalid file type" }, { status: 400 });
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return Response.json(
        { message: "File too large (max 100MB)" },
        { status: 400 },
      );
    }

    const bucketName = process.env.DO_SPACES_NAME;
    const folderPath = `courses/${courseName}/videos`;

    const buffer = await file.arrayBuffer();

    const fileKey = moduleId
      ? `${folderPath}/${moduleId}-${lessonTitle}.${file.name.split(".").pop()}`
      : `${folderPath}/video-${Date.now()}.${file.name.split(".").pop()}`;

    const fileUrl = await uploadToS3(
      Buffer.from(buffer),
      fileKey,
      bucketName,
      file.type,
    );
    console.log(fileUrl);
    return Response.json(
      {
        message: "Video uploaded successfully",
        url: fileUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
});
