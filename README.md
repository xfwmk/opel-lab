# opel Lab

A minimal Cloudflare Worker with static assets and a tiny API.

## GitHub → Cloudflare automatic deployment

1. Create a GitHub repository named `opel-lab`.
2. Upload the contents of this starter folder (not the containing `opel-lab-starter` folder) to the **root** of the repository.
3. In Cloudflare: **Workers & Pages → Create application → GitHub → opel-lab**.
4. Configure Worker name `opel-lab`, production branch `main`, root directory `/`, no build command, deploy command `npx wrangler deploy`.
5. Deploy. Test the provided `*.workers.dev` URL and its `/api/health` endpoint.
6. On the Worker, choose **Settings → Domains & Routes → Add → Custom Domain** and enter `lab.opel.org.uk` (requires `opel.org.uk` to be an active Cloudflare DNS zone).

## Local development (optional)

Requires a supported Node.js version and npm.

```sh
npm install
npm run dev
```

Open the local address Wrangler prints, usually `http://localhost:8787`.

## Structure

- `public/index.html`: homepage, CSS and any future static pages/assets
- `src/index.js`: Worker API (`GET /api/health`) and asset routing
- `wrangler.jsonc`: Cloudflare Worker configuration
- `package.json`: Wrangler dependency and local scripts

No credentials or API tokens belong in this repository.
