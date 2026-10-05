# WebBooks

Pinterest-style book discovery, token-based reading, payment proof review, staff publishing tools, and an NVIDIA Nemotron reader companion built with Next.js App Router.

## Development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Local development uses the ignored `data/db.json` file. Configure `AUTH_SECRET` and `OPENROUTER_API_KEY` in `.env.local` to enable signed sessions and live Nemotron responses.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment

See [DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md) for Netlify's Next.js adapter, runtime environment variables, persistent Netlify Blobs storage, and deployment checks.
