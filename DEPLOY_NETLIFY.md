# Deploy WebBooks to Netlify

WebBooks is a Next.js App Router application. Netlify's maintained Next.js adapter deploys its pages and Route Handlers as static assets and serverless functions. The application stores its production data in a strongly consistent Netlify Blobs JSON store; it does **not** rely on a writable function filesystem.

## 1. Connect the repository

1. Push the project to GitHub and import that repository in Netlify.
2. Set the Netlify **Base directory** to the folder containing `package.json` and `netlify.toml` (the repository root for this project).
3. The checked-in `netlify.toml` configures:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node.js: 22
   - Netlify's Next.js adapter: `@netlify/plugin-nextjs`
4. Keep `package-lock.json` committed. Netlify uses it for a reproducible `npm ci` install.

## 2. Configure environment variables in Netlify

Add these under **Site configuration → Environment variables**. Do not put secrets in `netlify.toml`, `next.config.ts`, or any `NEXT_PUBLIC_*` variable. Set the server-only values to be available to **Builds and Functions**, then trigger a fresh deploy after changing them.

| Variable | Value / purpose |
| --- | --- |
| `WEBBOOKS_STORAGE` | `netlify-blobs` |
| `AUTH_SECRET` | A unique random secret of at least 32 characters. Generate one with `openssl rand -base64 32`. |
| `OPENROUTER_API_KEY` | A valid OpenRouter key, kept server-side. The `/chat` page calls the same-origin `/api/chat` route; the browser never receives this key. |
| `STAFF_ADMIN_EMAIL` | `techmakers077@gmail.com` |
| `STAFF_ADMIN_PASSWORD` | Set the requested staff password as a private Netlify environment variable; do not commit the value. Use a unique secret and rotate it before public production use. |
| `NEXT_PUBLIC_GPAY_NUMBER` | `9500089956` |

Set `NEXT_PUBLIC_GPAY_NUMBER` for the **Builds** scope because it is displayed in the browser UI. Set the secret values for the **Functions** scope (and Builds as well if your Netlify plan requires both scopes for Next.js runtime access).

The OpenRouter key was previously embedded in client-side code and an example file. **Revoke/rotate that key before deploying** and enter the replacement only in Netlify's environment-variable settings. Do not add a `NEXT_PUBLIC_OPENROUTER_API_KEY`.

## 3. Persistent database behavior

- Local development defaults to `WEBBOOKS_STORAGE=file` and writes to `data/db.json` (ignored by Git).
- Netlify uses the site-wide Netlify Blobs store `webbooks-json-database`, so users, token balances, rewards, books, and staff remain available across function invocations and deploys.
- The JSON document uses strongly consistent reads and ETag conditional writes. A simultaneous conflicting update returns a retryable error rather than silently overwriting another write.
- The JSON document is deliberately capped at 4 MB as a safety margin below the Blobs value limit. Payment screenshot files are stored as separate Netlify Blobs and referenced from the JSON rewards record; the staff-only proof route serves them. Screenshots are compressed and size-limited. For a larger or high-write production service, migrate this single-document store to a transactional database such as Netlify Database/Postgres.
- Netlify Blobs is provisioned by the platform; no separate database URL or token is required when called from the Netlify Next.js runtime.

## 4. Verify before publishing

Run locally from the repository root:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
```

Use a Deploy Preview first. After deployment, smoke-test `/`, `/signin`, `/signup`, `/chat`, `/api/books`, and the sign-in/reward flows. A missing storage setting is reported as a configuration error instead of falling back to temporary function storage.

## Local production server

If you want to run `next start` locally after a production build, set `WEBBOOKS_STORAGE=file`, `ALLOW_EPHEMERAL_FILE_DB=true`, and a local `AUTH_SECRET` in an ignored `.env.local` file. This explicit opt-in is required because a production-mode file database is never assumed to be durable. Use `netlify dev` to emulate Netlify Functions and Blobs locally; do not rely on the production function filesystem for persistent files.
