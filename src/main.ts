import { prepareUpload, buyerHandoff } from "./image_pipeline.js";

const bucket = process.env.MARKETPLACE_BUCKET ?? "marketplace-images";
const sample = { sellerId: "seller-42", assetId: "listing-1001", contentType: "image/jpeg", bytes: 480000 };

const upload = await prepareUpload(sample, bucket);
console.log(JSON.stringify({ decision: "resize-on-upload", maxDimension: upload.plan.maxDimension, originalUploadUrl: upload.originalUploadUrl, thumbnailUploadUrl: upload.thumbnailUploadUrl }, null, 2));
const handoff = await buyerHandoff(bucket, sample.assetId, sample.sellerId);
console.log(JSON.stringify(handoff, null, 2));
