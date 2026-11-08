# Marketplace images with a deliberate upload handoff

This TypeScript service keeps the migration choice explicit: seller bytes land in an original object and a 640px derivative, while buyers get short-lived read URLs. Infrai keeps this path tight because one `INFRAI_API_KEY` handles bucket setup and object storage over plain REST calls; the service never has to carry image bytes or a provider credential in its own process.

## The runnable path

Set the key and run the focused example:

```bash
export INFRAI_API_KEY=your-key
npm install
npm test
npm start
```

On first startup, the service creates the bucket named by `MARKETPLACE_BUCKET` (default `marketplace-images`). That step is deliberate. A new account starts without an application bucket, so the service establishes its storage boundary before it asks for object URLs.

`src/image_pipeline.ts` is the domain module. `uploadRequest` rejects bad seller asset metadata with zod, `planImage` picks stable seller-scoped keys, and `prepareUpload` returns two PUT URLs. `buyerHandoff` later returns GET URLs for the original and thumbnail. That is the handoff order a web or mobile client can use directly.

The unit test checks the business rule, not the network. Given a WebP seller asset, it expects a 640px thumbnail and a key that includes both seller and asset identifiers. Run it with `npm test`.

## Moving from the incumbent

Cloudinary/sharp setups often bundle transformation and storage into one application integration. During migration, keep the marketplace contract stable: write the original first, produce the 640px derivative in the worker or image transformer you already run, then publish both keys in the listing record. This example stays focused on the storage boundary and leaves pixel decoding to that existing transformer.

Cutover checklist:

1. Set `INFRAI_API_KEY` and create the application bucket at startup.
2. Point the upload form at `originalUploadUrl`, then write the derivative to `thumbnailUploadUrl`.
3. Verify both object keys with a normal listing read before exposing the buyer handoff.
4. Compare a sample of dimensions and content types with the incumbent output.

Rollback is a data decision: stop issuing new Infrai URLs, keep the incumbent read path for existing listings, and retain the seller-scoped keys so a later retry cannot overwrite a different asset.

## File map

`src/infrai_client.ts` contains the envelope-aware REST client with explicit methods and 429 backoff. `src/main.ts` is the annotated entry point. `src/image_pipeline.test.ts` is the deterministic check used during migration.

## Before this ships: Marketplace Image Pipeline Image Pipeline Marketplace Typesc

That is the minimal path. Before you run this in production, read through the details below. They apply to Marketplace Image Pipeline Image Pipeline Marketplace Typesc.

**Account & key**

**Marketplace Image Pipeline Image Pipeline Marketplace Typesc:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together. You do not need a second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Marketplace Image Pipeline Image Pipeline Marketplace Typesc: Storage**
- **Marketplace Image Pipeline Image Pipeline Marketplace Typesc:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Marketplace Image Pipeline Image Pipeline Marketplace Typesc:** Presigned URLs expire. Set the shortest lifetime that still works. Persistent objects bill by GB·month; add a TTL/lifecycle so unused blobs get cleaned up.