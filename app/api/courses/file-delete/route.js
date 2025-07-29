import { withRole } from "@/lib/serverAuth";
import { deleteFromS3 } from "@/lib/fileUpload";

export const POST = withRole("instructor", async (req) => {
  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return Response.json(
        { message: "File URL is required" },
        { status: 400 },
      );
    }

    const bucketName = process.env.DO_SPACES_NAME;

    // Delete the file from Digital Ocean Spaces
    await deleteFromS3(fileUrl, bucketName);

    return Response.json(
      {
        message: "File deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("File deletion error:", error);
    return Response.json(
      {
        message: "Failed to delete file",
        error: error.message,
      },
      { status: 500 },
    );
  }
});
