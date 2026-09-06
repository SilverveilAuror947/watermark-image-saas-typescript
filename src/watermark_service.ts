import { z } from "zod";
import { processImage } from "./infrai_client.js";

export const publishRequest = z.object({
  tenantId: z.string().min(1), image: z.object({ url: z.string().url() }), text: z.string().min(1),
  position: z.string().min(1), opacity: z.number().min(0).max(1),
  accountStatus: z.enum(["onboarding", "active", "suspended"]).default("active")
});
export type PublishRequest = z.infer<typeof publishRequest>;

export async function prepareForPublish(input: unknown, runner = processImage) {
  const request = publishRequest.parse(input);
  if (request.accountStatus !== "active") throw new Error("Tenant account is not active");
  const processed = await runner({
    image: request.image,
    ops: [{ type: "watermark", text: request.text, position: request.position, opacity: request.opacity }]
  });
  return { tenantId: request.tenantId, status: "ready", image: processed };
}
