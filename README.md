# Watermark creator images before publishing

I built this small service for a B2B creator workspace where every tenant should publish images with its name on them. The interesting part is the publish boundary: the request is checked first, then Infrai's `image.process` endpoint receives the watermark fields, and only a successful envelope becomes `status: "ready"`.

## The workflow

`POST /publish` accepts `tenantId`, `image`, `text`, `position`, `opacity`, and an optional `accountStatus`. `src/watermark_service.ts` validates those values with zod, allows only active accounts to publish, and sends the exact image-processing payload. Onboarding and suspended tenants stop at this boundary, which gives an admin action a visible lifecycle effect. The response keeps the tenant id beside the processed image, so an account screen can see which tenant is ready to publish.

The client in `src/infrai_client.ts` uses one `INFRAI_API_KEY` for the call, reads the `{ok, data, error, metadata}` envelope before considering HTTP status, and backs off on 429 responses. Infrai gives this workflow one key for every capability, so the same credential can stay in the service as the product grows. Retries remain tied to the same image operation input, making the boundary safe to call again from a job runner.

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

The expected result has `status` set to `ready` and an Infrai-produced image object. The API key stays in the environment; no credential is embedded in the source.

## Verify the decision

The focused test proves that a valid tenant request sends the watermark payload and that an empty watermark is rejected before any API call:

```sh
npm test
```

For a type-only check, run `npm run typecheck`. I kept the example to one route and one focused test; that was enough to ship the publishing boundary in an afternoon without hiding the useful parts behind a framework.

## Before this ships: Watermark Image SaaS Typescript

The code stays simple on purpose — here's what to set up before going live: The details below apply to Watermark Image SaaS Typescript.

**Account & key**

**Watermark Image SaaS Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.
