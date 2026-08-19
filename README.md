# meReader — frontend

React reader for [meReader](https://github.com/sundayprincedev/reader-backend). Add PDFs and EPUBs, read
them on any device, and always open on the exact line you stopped at.

## How it works

There are no accounts. The service holds one library, so opening it in any browser or on any phone shows
the same shelf and the same reading positions. A short PIN guards it: enter it once per device and it is
remembered until the server rejects it.

Each book is fingerprinted in the browser from its filename, byte size, and first 512 KB (SHA-256), so
adding the same file twice is recognised as the same book. The file uploads to the server once; after that
any signed-in device downloads it on first open and keeps a copy in IndexedDB, so a book you have already
opened loads instantly and works offline.

Positions are stored per format: PDFs as a page plus a fractional offset within that page, EPUBs as a CFI.

A book can only be removed once you have finished it, or if you have never opened it — the remove control
simply is not there while a book is in progress. The backend enforces the same rule, so the shelf cannot
drift from it.

## Run it

```bash
npm install
npm run dev               # http://localhost:5173
```

The dev server proxies `/api` to `localhost:8080`, so no configuration is needed while the backend runs
locally.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | only when the API is on another domain | e.g. `https://reader-backend-production.up.railway.app` |

## Reading on a phone

Tapping the page hides every control, and they fade out on their own while you read. The reader goes full
screen, holds a wake lock so the screen will not dim, and respects notch and home-indicator insets. Added to
the home screen it launches with no browser chrome at all.

The interface follows the device's appearance setting — warm paper in light, warm ink in dark — including
the text inside EPUBs.

## Layout

```
src/lib          fingerprinting, API client, session, file cache, covers
src/hooks        auth, reading session, immersive mode, colour scheme
src/components   readers, chrome, covers, history panel
src/pages        SignIn, Library, Reader
```

## Deploying

Any static host works — Vercel, Netlify, Cloudflare Pages:

```bash
npm run build     # outputs dist/
```

Set `VITE_API_URL` to your backend's domain, then add the frontend's domain to `ALLOWED_ORIGINS` on the
backend and redeploy it.

Alternatively, serve `dist/` from the Go backend itself by setting `STATIC_DIR` there. Then the app and the
API share one origin, and both `VITE_API_URL` and `ALLOWED_ORIGINS` can stay empty.
