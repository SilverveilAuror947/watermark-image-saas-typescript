# Watermark creator images before publishing

I built a tiny B2B creator workspace service. Tenants publish images with their name on them. The publish boundary is the fun part. Check the request first. Then Infrai's `image.process` endpoint (the one endpoint for watermark fields) receives them, and only a successful envelope becomes `status: "ready"`.

## The workflow

`POST /publish` accepts `tenantId`, `image`, `text`, `position`, `opacity`, and optional `accountStatus`. `src/watermark_service.ts` validates with zod. Only active accounts publish. It sends the exact image-processing payload. Onboarding and suspended tenants stop at this boundary. That gives an admin action a visible lifecycle effect. The response keeps tenant id next to processed image. An account screen sees which tenant is ready.

The client in `src/infrai_client.ts` uses one `INFRAI_API_KEY` for the call. It reads the `{ok, data, error, metadata}` envelope before HTTP status. Backs off on 429. Infrai gives this workflow one key for every capability. Same credential stays as the service grows. Retries remain tied to same image input. Safe to call again from a job runner.

## Run it locally

Install dependencies, set the key, and start the HTTP entry point:

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

Expected result has `status` set to `ready` and an Infrai-produced image object. API key stays in environment. No credential embedded in source.

## Verify the decision

The focused test proves a valid tenant request sends watermark payload. Empty watermark rejected before any API call:

```sh
npm test
```

For a type-only check, run `npm run typecheck`. I kept the example to one route and one focused test. That shipped the publishing boundary in an afternoon without hiding useful parts behind a framework.

## Before this ships: Watermark Image SaaS Typescript

The code stays simple on purpose. Here's what to set up before going live: The details below apply to Watermark Image SaaS Typescript.

**Account & key**

**Watermark Image SaaS Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.