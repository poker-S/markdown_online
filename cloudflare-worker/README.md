# Cloudflare Worker Upload Backend

This Worker handles public image uploads for the markdown editor and stores them in the `markdown-editor-img` R2 bucket.

## Features

- `POST /api/images/upload`
- timestamp-based object keys like `20260324181230.png`
- collision handling for same-second uploads
- daily cleanup of Worker-managed images older than 30 days
- optional same-origin protection using `ALLOWED_ORIGINS`

## Local development

```bash
cd cloudflare-worker
npm install
npm run dev
```

The default local endpoint is usually:

```text
http://127.0.0.1:8787/api/images/upload
```

To connect the frontend locally, set:

```bash
VITE_DEFAULT_IMAGE_SERVICE=r2
VITE_IMAGE_UPLOAD_ENDPOINT=http://127.0.0.1:8787/api/images/upload
```

## Deploy

1. Make sure the `markdown-editor-img` bucket already exists.
2. Keep `i.markdowneditor.cloud` bound to that bucket in R2 Custom Domains.
3. From this folder:

```bash
npm install
npm run deploy
```

4. Route the Worker to one of these options:

- same-origin route: `markdowneditor.cloud/api/images/*`
- separate API domain, for example `api.markdowneditor.cloud`

## Why no R2 API token is needed here

This Worker uses an R2 bucket binding, so uploads happen through the Workers runtime and do not require storing an R2 access key in the frontend.

## Cleanup behavior

The Worker runs every day and deletes timestamp-named images created by this upload flow after `RETENTION_DAYS`.

Files manually uploaded to the bucket that do not match the timestamp naming pattern are left untouched.
