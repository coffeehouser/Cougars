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

Create a `client/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Change the URL to your deployed backend when building for production.
