import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

export const uploadToS3 = async (
  fileBuffer,
  fileKey,
  bucketName,
  contentType,
) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    Body: fileBuffer,
    ACL: "public-read",
    ContentType: contentType || "application/octet-stream",
  });

  await s3Client.send(command);

  return `https://${bucketName}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${fileKey}`;
};

export const deleteFromS3 = async (fileUrl, bucketName) => {
  try {
    // Extract the key from the full URL
    // URL format: https://bucket-name.region.digitaloceanspaces.com/path/to/file.ext
    const urlParts = fileUrl.split(
      `${bucketName}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/`,
    );
    if (urlParts.length !== 2) {
      throw new Error(`Invalid file URL format: ${fileUrl}`);
    }

    const fileKey = urlParts[1];

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting file from storage:", error);
    throw error;
  }
};
