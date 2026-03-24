# Cloudflare R2 Worker Deployment

This project now supports a Cloudflare Worker upload backend for public image hosting.

## What the backend does

- accepts image uploads from the editor
- stores images in the `markdown-editor-img` R2 bucket
- creates timestamp-based object keys like `20260324181230.png`
- returns image URLs like `https://i.markdowneditor.cloud/20260324181230.png`
- deletes Worker-managed images older than 30 days during a daily scheduled cleanup run

## Frontend configuration

Create a root `.env.local` file for local or production builds:

```bash
VITE_DEFAULT_IMAGE_SERVICE=r2
VITE_IMAGE_UPLOAD_ENDPOINT=/api/images/upload
```

For local Worker development, point the endpoint at Wrangler:

```bash
VITE_DEFAULT_IMAGE_SERVICE=r2
VITE_IMAGE_UPLOAD_ENDPOINT=http://127.0.0.1:8787/api/images/upload
```

## Worker folder

The Worker lives in:

```text
cloudflare-worker/
```

Useful commands from the repo root:

```bash
npm run worker:dev
npm run worker:deploy
npm run worker:check
```

## Values to review before deploy

Open [wrangler.jsonc](D:/markdown-editor/cloudflare-worker/wrangler.jsonc) and confirm these values match your Cloudflare setup:

- `r2_buckets[0].bucket_name`: the R2 bucket that stores uploaded images
- `vars.PUBLIC_BASE_URL`: your public image domain, for example `https://i.markdowneditor.cloud`
- `vars.ALLOWED_ORIGINS`: the editor domains that are allowed to call the upload API
- `vars.UPLOAD_TIMEZONE`: used when generating timestamp-based keys
- `vars.RETENTION_DAYS`: default image retention period, currently `30`
- `vars.MAX_UPLOAD_BYTES`: maximum upload size, currently `10 MB`

If you want the editor to call the Worker on the same domain, uncomment the `routes` block and change it to your production domain.

## One-time Cloudflare setup

1. Keep the `markdown-editor-img` R2 bucket.
2. Keep `i.markdowneditor.cloud` connected to that bucket through R2 Custom Domains.
3. Deploy the Worker from `cloudflare-worker/`.
4. Route the Worker to either:
   - `markdowneditor.cloud/api/images/*`
   - or a dedicated API hostname such as `api.markdowneditor.cloud`

## Recommended same-origin route

If the editor stays on `https://markdowneditor.cloud`, the cleanest production route is:

```text
https://markdowneditor.cloud/api/images/upload
```

That means:

- no frontend secret is required
- no extra CORS work is needed for the editor itself
- the Worker can still return public image URLs from `https://i.markdowneditor.cloud/...`

## What to do on your server

If this markdown editor is deployed as a normal frontend site, your server does not need to run the image upload backend anymore.

You only need to:

- deploy the updated frontend build
- make sure the frontend uses the R2 mode env vars shown above
- keep your site domain pointing at the place where the frontend is hosted

The actual upload, storage, and scheduled cleanup all run inside Cloudflare Worker + R2.

## Retention policy

The Worker deletes timestamp-named images that match the managed key pattern after 30 days.

This means the hosted image mode is suitable for:

- public sharing
- temporary article images
- lightweight online editing

It is not suitable for:

- permanent asset storage
- long-term documentation that must keep the same image forever

## Hardening suggestions for a public site

The current implementation allows public uploads from approved browser origins, which is enough to get the first version online.

Before large-scale public use, consider adding:

- Cloudflare Turnstile
- Cloudflare Rate Limiting
- a manual cleanup token for `/api/images/cleanup`
- logging and alerting around unusual upload bursts
