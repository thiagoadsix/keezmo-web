import { S3Client } from "@aws-sdk/client-s3";

const isDev = process.env.NODE_ENV !== 'production';

export const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: isDev ? "http://localhost:4566" : undefined,
});
