import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mySQL from "@/lib/db/database";
import {
  addContent,
  checkInstructor,
  deleteLesson,
  deleteMediaContent,
  getLoggedInUser,
  updateContent,
} from "@/lib/db/queries";

// ! ADD CONTENT TO EACH LESSON ROUTE
export async function PUT(req, { params }) {
  const { courseId, moduleId, lessonId } = await params;

  try {
    // Authentication checks...

    // Parse request body with a try-catch to catch JSON parsing errors
    let requestBody;
    try {
      requestBody = await req.json();
      console.log(
        "Received lesson content:",
        JSON.stringify(requestBody, null, 2),
      );
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return Response.json({ message: "Invalid JSON format" }, { status: 400 });
    }

    // Extract components
    const { content, image, video, deleteMedia } = requestBody;

    // Process text content
    if (content?.type && content?.value) {
      console.log(`Adding TEXT content for lesson ${lessonId}`);
      await mySQL(addContent, [lessonId, "TEXT", content.value]);
    }

    // Process image content
    if (image?.type && image?.value) {
      console.log(`Adding IMAGE content for lesson ${lessonId}`);
      await mySQL(addContent, [lessonId, "IMAGE", image.value]);
    }

    // Process video content
    if (video?.type && video?.value) {
      console.log(`Adding VIDEO content for lesson ${lessonId}`);
      await mySQL(addContent, [lessonId, "VIDEO", video.value]);
    }

    // Handle media deletion if requested
    if (deleteMedia?.shouldDelete) {
      const mediaType = deleteMedia.type.toUpperCase();
      console.log(`Deleting ${mediaType} content for lesson ${lessonId}`);

      // Delete the specific media type from the database
      await mySQL(deleteMediaContent, [lessonId, mediaType]);
    }

    return Response.json({
      message: "Lesson updated successfully",
      contentUpdated: !!content,
      imageUpdated: !!image,
      videoUpdated: !!video,
      mediaDeleted: !!deleteMedia?.shouldDelete,
    });
  } catch (error) {
    console.error("Lesson update error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { courseId, moduleId, lessonId } = await params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mySQL(getLoggedInUser, [decoded.userId]);
    const user = users[0];

    // Verify course ownership
    const courses = await mySQL(checkInstructor, [courseId]);

    if (!courses.length || courses[0].instructor_id !== user.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete the lesson
    await mySQL(deleteLesson, [lessonId, moduleId]);

    return Response.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Lesson deletion error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
