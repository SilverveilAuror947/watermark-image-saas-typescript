import { createServer } from "node:http";
import { prepareForPublish } from "./watermark_service.js";

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/publish") { res.writeHead(404); res.end("Not found"); return; }
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const result = await prepareForPublish(JSON.parse(Buffer.concat(chunks).toString()));
    res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify(result));
  } catch (error) {
    const status = error instanceof Error && error.name === "ZodError" ? 400 : 502;
    res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Request failed" }));
  }
});
server.listen(Number(process.env.PORT ?? 3000), () => console.log("publish service listening"));
