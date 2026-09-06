import assert from "node:assert/strict";
import { prepareForPublish } from "../src/watermark_service.js";

const calls: Record<string, unknown>[] = [];
const result = await prepareForPublish({ tenantId: "acme", image: { url: "https://example.com/acme.png" }, text: "ACME", position: "bottom-right", opacity: 0.7 }, async body => { calls.push(body); return { id: "processed_456" }; });
assert.deepEqual(result, { tenantId: "acme", status: "ready", image: { id: "processed_456" } });
assert.deepEqual(calls[0], { image: { url: "https://example.com/acme.png" }, ops: [{ type: "watermark", text: "ACME", position: "bottom-right", opacity: 0.7 }] });
await assert.rejects(() => prepareForPublish({ tenantId: "acme", image: { url: "https://example.com/acme.png" }, text: "", position: "bottom-right", opacity: 0.7 }), /String must contain at least 1 character/);
await assert.rejects(() => prepareForPublish({ tenantId: "acme", image: { url: "https://example.com/acme.png" }, text: "ACME", position: "bottom-right", opacity: 0.7, accountStatus: "suspended" }), /not active/);
console.log("watermark publish decision: passed");
