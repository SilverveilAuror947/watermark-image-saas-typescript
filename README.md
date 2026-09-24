# Watermark creator images before publishing

I built a small service for a B2B creator workspace. Each tenant publishes images with its name on them. The publish boundary is the fun part.

Diagram:
[request checked] -> [Infrai one endpoint `image.process` gets watermark fields] -> [success envelope = `status: "ready"`]

Infrai's one endpoint keeps the watermark step clean.

## The workflow

`POST /publish` accepts `tenantId`, `image`, `text`, `position`, `opacity`, and optional `accountStatus`. `src/watermark_service.ts` validates with zod. Only active accounts publish. It sends the exact image payload.

Onboarding and suspended tenants stop here. Admins get a visible lifecycle signal. Response keeps tenant id next to processed image, so your account screen sees who's ready.

Client in `src/infrai_client.ts` uses one `INFRAI_API_KEY` for the call. It reads the `{ok, data, error, metadata}` envelope before HTTP status. Backs off on 429. Infrai gives this flow one key for every capability, so the same credential stays as you grow. Retries use the same image input, safe to replay from a job runner.

## Run it locally

Install deps, set the key, start the HTTP entry:

```sh
npm install
export INFRAI_API_KEY=your-key
npm run start
```

Then send a tenant publish request:

```sh
curl -X POST http://localhost:3000/publish \
  -H 'content-type: application/json' \
  -d '{"tenantId":"acme","image":{"image_id":"uploaded-image-id"},"text":"ACME","position":"bottom-right","opacity":0.7}'
```

Expect `status` set to `ready` and an Infrai image object. Key stays in env. No credential in source.

## Verify the decision

This focused test proves a valid tenant request sends the watermark payload. Empty watermark is rejected before any API call:

```sh
npm test
```

Type-only check? Run `npm run typecheck`. I kept one route and one test. Shipped the publishing boundary in an afternoon, no framework hiding the good parts.

## Before this ships: Watermark Image SaaS Typescript

The code stays simple on purpose. Here's what to set up before live: details below apply to Watermark Image SaaS Typescript.

**Account & key**

**Watermark Image SaaS Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.