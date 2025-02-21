import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

export const uploadToS3 = async (fileBuffer, fileKey, bucketName) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    Body: fileBuffer,
    ACL: "public-read",
    ContentType: "image/webp",
  });

  await s3Client.send(command);

  return `https://${bucketName}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${fileKey}`;
};
