import * as Minio from "minio";
import {randomUUID} from "crypto";
import * as path from "path";

const minioClient = new Minio.Client({
    endPoint: process.env.S3_ENDPOINT || "localhost",
    port: parseInt(process.env.S3_PORT || "9000"),
    useSSL: process.env.S3_USE_SSL === "true",
    accessKey: process.env.S3_ACCESS_KEY || "minioadmin",
    secretKey: process.env.S3_SECRET_KEY || "minioadmin",
});

const BUCKET = process.env.S3_BUCKET || "lms-uploads";
const PRESIGNED_EXPIRY = 15 * 60; // 15 minutes

export async function getPresignedGetUrl(key: string): Promise<string> {
    return minioClient.presignedGetObject(BUCKET, key, PRESIGNED_EXPIRY);
}

export async function getPresignedPutUrl(key: string): Promise<string> {
    // Note: Minio v8 presignedPutObject only accepts bucket, key, and expiry
    // Content-type must be set by the client when uploading
    return minioClient.presignedPutObject(BUCKET, key, PRESIGNED_EXPIRY);
}

export async function deleteFile(key: string): Promise<void> {
    await minioClient.removeObject(BUCKET, key);
}

export async function uploadFile(
    file: Buffer,
    originalName: string,
    folder: string,
    contentType: string
): Promise<string> {
    const ext = path.extname(originalName);
    const key = `${folder}/${randomUUID()}${ext}`;
    await minioClient.putObject(BUCKET, key, file, file.length, {"Content-Type": contentType});
    return key;
}

export {minioClient, BUCKET, PRESIGNED_EXPIRY};
