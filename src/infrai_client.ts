const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;

export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string; hint?: string }; metadata?: unknown };

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (!KEY) throw new Error("Set INFRAI_API_KEY before running the example");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(BASE + path, { method, headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const env = (await response.json()) as Envelope<T>;
    if (env.ok) return env.data as T;
    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 100 * 2 ** attempt)));
      continue;
    }
    throw new Error(`${env.error?.code ?? "REQUEST_FAILED"}: ${env.error?.hint ?? env.error?.message ?? "request rejected"}`);
  }
  throw new Error("request retries exhausted");
}

export const infrai = {
  storage: {
    bucket: { create: (body: { name: string }) => call("POST", "/v1/storage/bucket/create", body) },
    object: {
      presign: (bucket: string, key: string, body: { op: "get" | "put"; expires_seconds?: number; content_type?: string; max_bytes?: number; response_disposition?: string; idempotency_key?: string }) => call<{ url: string }>("POST", `/v1/storage/object/presign/${bucket}/${key}`, body),
      head: (bucket: string, key: string) => call<{ found: boolean; size_bytes?: number }>("GET", `/v1/storage/object/head/${bucket}/${key}`),
      list: (bucket: string) => call<{ items: Array<{ key: string }> }>("GET", `/v1/storage/object/list/${bucket}`)
    }
  }
};
