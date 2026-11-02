import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_BYTES = 256 * 1024 * 1024;
const PUT_EXPIRES = 15 * 60;
const GET_EXPIRES = 30 * 60;

function s3Config() {
  const region = process.env.AWS_REGION?.trim();
  const bucket = process.env.AWS_S3_BUCKET?.trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }
  return { region, bucket, accessKeyId, secretAccessKey };
}

export function isS3Configured() {
  return Boolean(s3Config());
}

function clientAndBucket() {
  const cfg = s3Config();
  if (!cfg) {
    const err = new Error("S3 is not configured.");
    err.code = "S3_NOT_CONFIGURED";
    throw err;
  }
  const client = new S3Client({
    region: cfg.region,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
  return { client, bucket: cfg.bucket };
}

export function sanitizeFileName(name) {
  const base = String(name || "video")
    .replace(/[/\\]/g, "")
    .replace(/[^\w.\-]+/g, "_")
    .slice(0, 80);
  return base || "video";
}

export function buildReviewObjectKey(ownerId, submissionId, fileName) {
  return `reviews/${ownerId}/${submissionId}/${sanitizeFileName(fileName)}`;
}

export async function createPresignedPutUrl({ key, contentType }) {
  const { client, bucket } = clientAndBucket();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: PUT_EXPIRES });
  return { uploadUrl, expiresIn: PUT_EXPIRES };
}

export async function createPresignedGetUrl({ key, contentType }) {
  const { client, bucket } = clientAndBucket();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentType: contentType || undefined,
    ResponseContentDisposition: "inline",
  });
  const playbackUrl = await getSignedUrl(client, command, { expiresIn: GET_EXPIRES });
  return { playbackUrl, expiresIn: GET_EXPIRES };
}

export async function headReviewObject(key) {
  const { client, bucket } = clientAndBucket();
  const result = await client.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
  return {
    contentType: result.ContentType || "",
    contentLength: Number(result.ContentLength || 0),
  };
}

export async function getReviewObjectStream(key) {
  const { client, bucket } = clientAndBucket();
  const result = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
  return result.Body;
}

export async function deleteReviewObject(key) {
  if (!key) return;
  const { client, bucket } = clientAndBucket();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export const S3_MAX_BYTES = MAX_BYTES;
