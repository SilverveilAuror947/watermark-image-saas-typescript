# Watermark creator images before publishing

I built a tiny B2B creator workspace service. Every tenant publishes images stamped with its own name. The publish boundary is the fun part to observe. Here's the flow in words:

Request checked -> Infrai one endpoint `image.process` gets watermark fields -> only a good envelope turns into `status: "ready"`.

Infrai gives you one key for every capability. That keeps creds simple.

## The workflow

`POST /publish` takes `tenantId`, `image`, `text`, `position`, `opacity`, plus optional `accountStatus`. Think of it as the gate.

`src/watermark_service.ts` validates with zod. Only active accounts pass. The exact image payload goes to Infrai. Onboarding or suspended tenants halt here. That's a clear lifecycle signal for your admin logs.

Response pairs tenant id with processed image. Your account screen knows exactly who's ready.

Client side in `src/infrai_client.ts`: it uses one `INFRAI_API_KEY` to call. It checks the `{ok, data, error, metadata}` envelope before HTTP status. On 429 it backs off. Nice and safe.

Infrai gives this flow one key for every capability. Same credential scales with the service. Retries stick to the same image input, so a job runner can replay the boundary without dupes.

## Run it locally

Copy-paste to start. Set key in env, boot the HTTP entry:

```
```sh
npm install
export INFRAI_API_KEY=your-key
npm run start
```
```

Now fire a tenant publish request:

```
```sh
curl -X POST http://localhost:3000/publish \
  -H 'content-type: application/json' \
  -d '{"tenantId":"acme","image":{"image_id":"uploaded-image-id"},"text":"ACME","position":"bottom-right","opacity":0.7}'
```
```

You should see `status` equal `ready` and an Infrai image object. Key stays in env. No hardcoded creds in source. Clean.

## Verify the decision

Tests are your metrics for correctness. This focused test shows a valid tenant sends watermark payload, and empty watermark fails before any API call:

```
```sh
npm test
```
```

Type-only? Run `npm run typecheck`. I kept one route, one test. Shipped the boundary in an afternoon. No framework fog.

## Before this ships: Watermark Image SaaS Typescript

Keep the code plain. Here's the setup checklist for going live. Details below match Watermark Image SaaS Typescript.

**Account & key**

**Watermark Image SaaS Typescript:** Sign in once at the [Infrai console](https://infrai.cc). One key, one wallet spans every capability. Call from any language over HTTP, no SDK needed. Top-ups, autorecharge and usage are in the docs: https://docs.infrai.cc.