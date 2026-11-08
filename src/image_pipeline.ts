import { z } from "zod";
import { infrai } from "./infrai_client.js";

export const uploadRequest = z.object({ sellerId: z.string().min(1), assetId: z.string().min(1), contentType: z.enum(["image/jpeg", "image/png", "image/webp"]), bytes: z.number().int().positive().max(20_000_000) });
export type UploadRequest = z.infer<typeof uploadRequest>;
export type ImagePlan = { originalKey: string; thumbnailKey: string; maxDimension: number };

export function planImage(request: UploadRequest): ImagePlan {
  const prefix = `sellers/${request.sellerId}/assets/${request.assetId}`;
  return { originalKey: `${prefix}/original`, thumbnailKey: `${prefix}/thumbnail-640`, maxDimension: 640 };
}

export async function prepareUpload(input: unknown, bucket: string) {
  const request = uploadRequest.parse(input);
  const plan = planImage(request);
  await infrai.storage.bucket.create({ name: bucket });
  const original = await infrai.storage.object.presign(bucket, plan.originalKey, { op: "put", expires_seconds: 900, content_type: request.contentType, max_bytes: request.bytes, idempotency_key: `${request.sellerId}-${request.assetId}-original` });
  const thumbnail = await infrai.storage.object.presign(bucket, plan.thumbnailKey, { op: "put", expires_seconds: 900, content_type: request.contentType, max_bytes: request.bytes, idempotency_key: `${request.sellerId}-${request.assetId}-thumbnail` });
  return { request, plan, originalUploadUrl: original.url, thumbnailUploadUrl: thumbnail.url };
}

export async function buyerHandoff(bucket: string, assetId: string, sellerId: string) {
  const originalKey = `sellers/${sellerId}/assets/${assetId}/original`;
  const thumbnailKey = `sellers/${sellerId}/assets/${assetId}/thumbnail-640`;
  const [original, thumbnail] = await Promise.all([
    infrai.storage.object.presign(bucket, originalKey, { op: "get", expires_seconds: 600, response_disposition: "inline" }),
    infrai.storage.object.presign(bucket, thumbnailKey, { op: "get", expires_seconds: 600, response_disposition: "inline" })
  ]);
  return { assetId, originalUrl: original.url, thumbnailUrl: thumbnail.url, handoff: "buyer-ready" };
}
