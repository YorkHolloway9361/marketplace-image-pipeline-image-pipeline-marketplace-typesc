import { planImage, uploadRequest } from "./image_pipeline.js";

const input = { sellerId: "seller-7", assetId: "asset-9", contentType: "image/webp", bytes: 1200 };
const parsed = uploadRequest.parse(input);
const plan = planImage(parsed);
if (plan.maxDimension !== 640 || plan.thumbnailKey !== "sellers/seller-7/assets/asset-9/thumbnail-640") throw new Error("image plan did not select the marketplace thumbnail policy");
console.log("image pipeline decision: 640px thumbnail and seller-scoped keys");
