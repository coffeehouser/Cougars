# Cyber Cougars — Frontend

React 19 + Vite client for the Cyber Cougars OSI Showcase.

## Dev server

```bash
npm run dev
```

Runs on <http://localhost:5173>. Requires the backend running on port 5000 (see root `README.md`).

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Deploy the `dist/` folder to Vercel or any static host.

## Environment variable

The `.env.example` file has the correct default for local development. Copy it:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
```

Change the URL to your deployed backend when building for production.

## Profile images

Static image files live in `public/images/` and are served at the root path:

- `public/images/headshots/` — member profile photos (e.g. `/images/headshots/darien.jpg`)
- `public/images/gallery/` — event and gathering photos

These folders are included in the production build automatically. Add headshot files here before running `npm run build` for deployment.

See the root `README.md` for naming conventions and recommended image dimensions.
