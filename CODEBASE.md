# Codebase guide

This document explains how the **E-Book Store** project is organized, how pieces connect, and how to configure **Stripe** environment variables.

---

## High-level architecture

```text
Browser (React + Vite, port 5173)
    │  HTTP  /api/* , /uploads/*
    ▼
Express API (server/, default port **5001** — see `PORT` in `server/.env`)
    │  Mongoose
    ▼
MongoDB
```

The **client** uses the Vite dev **proxy** (`client/vite.config.js`) so requests to `/api` and `/uploads` go to the backend without CORS issues during development. In production you typically serve the API under a real URL and set `VITE_API_URL` if needed (see `client/.env.example`).

---

## Repository layout

| Path | Role |
|------|------|
| `client/` | React (Vite) SPA: pages, layout, Context, axios `services/api.js`, Tailwind + Ant Design UI. |
| `server/` | Express REST API, MongoDB models, Stripe Checkout + webhook, Multer PDF uploads. |
| `USER_API.md` | User + auth endpoint reference. |
| `BOOK_API.md` | Book, upload, Stripe purchase, and transaction list reference. |
| `API_ENDPOINTS.md` | Broader endpoint list (legacy / combined). |
| `README.md` | How to run MongoDB, server, client, and Stripe CLI for webhooks. |
| `guides.md` | Original product / stack specification. |

---

## Server: how files connect

```text
server.js
  ├── connectDB()          → config/db.js (Mongo connection)
  ├── CORS                 → CLIENT_URL
  ├── POST /api/stripe/webhook  → raw body → stripeController.handleStripeWebhook
  ├── express.static /uploads
  ├── express.json()
  └── app.use("/api/...", routes/*.js)
```

| File / folder | Responsibility |
|---------------|----------------|
| `server.js` | App bootstrap, middleware order (webhook **before** JSON parser), route mounting. |
| `config/db.js` | `mongoose.connect(process.env.MONGO_URI)`. |
| `models/*.js` | Mongoose schemas: `User`, `Book`, `Transaction`. |
| `routes/*.js` | URL prefixes and HTTP verbs; attach middleware + controller handlers. |
| `controllers/*.js` | Business logic, DB calls, Stripe API calls. |
| `middlewares/authMiddleware.js` | Verifies JWT, sets `req.user`. |
| `middlewares/adminMiddleware.js` | Requires `role === "admin"`. |
| `middlewares/optionalAuthMiddleware.js` | Parses JWT if present (for viewing unpublished books as owner). |
| `middlewares/uploadPdfMiddleware.js` | Multer disk storage into `uploads/`. |
| `uploads/` | Stored PDF files; URLs like `/uploads/<filename>`. |

**Typical request flow:** `routes` → `middleware` (auth/admin/upload) → `controller` → `model` (Mongoose) → JSON response.

---

## Client: how files connect

```text
main.jsx
  └── App.jsx (Router, ConfigProvider, ToastContainer)
        ├── AuthProvider    → context/AuthContext.jsx (token, user, login/logout)
        ├── BookProvider    → context/BookContext.jsx (marketplace list)
        └── Routes → pages/* + components/Layout.jsx
```

| Path | Responsibility |
|------|----------------|
| `src/services/api.js` | Axios instance; attaches `Authorization` from `localStorage` token. |
| `src/context/AuthContext.jsx` | Login/register/logout; loads `/api/users/me` when token exists. |
| `src/context/BookContext.jsx` | Fetches `/api/books` for the home grid. |
| `src/routes/ProtectedRoute.jsx` | Redirects to `/login` if not authenticated. |
| `src/pages/*.jsx` | Screens: auth, home, book detail, upload, edit, dashboard, purchase success. |
| `src/utils/url.js` | `assetUrl()` — prefixes API origin for `/uploads/...` when needed. |

---

## Why `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are empty in `.env.example`

`server/.env.example` is a **template only**. It must **not** contain real secrets because it is usually committed to git. Anyone could steal keys that were pasted into the example file.

You fill values in your **local** `server/.env` (which should stay out of version control, e.g. via `.gitignore`).

### How to fill `STRIPE_SECRET_KEY`

1. Open [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **API keys**.
2. Use **Test mode** while developing.
3. Copy **Secret key** (`sk_test_...`).
4. In `server/.env` set:

   `STRIPE_SECRET_KEY=sk_test_xxxxxxxx`

The server uses this in `stripeController.js` to create Checkout Sessions and to verify webhooks.

### How to fill `STRIPE_WEBHOOK_SECRET`

Webhooks must prove events really come from Stripe. That proof uses a **signing secret** tied to your webhook endpoint.

**Local development (recommended):**

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Run:

   `stripe listen --forward-to localhost:5001/api/stripe/webhook`

3. The CLI prints a **webhook signing secret** like `whsec_...`.
4. Put that value in `server/.env`:

   `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx`

**Production / Dashboard endpoint:**

1. In Stripe Dashboard → **Developers** → **Webhooks** → add endpoint URL (your public HTTPS URL + `/api/stripe/webhook`).
2. Reveal the endpoint’s **Signing secret** and set `STRIPE_WEBHOOK_SECRET` on the server that receives those events.

Without a correct `STRIPE_WEBHOOK_SECRET`, `handleStripeWebhook` cannot verify signatures and **pending** transactions may never move to **completed** (though Checkout can still charge the card).

---

## Quick run checklist

1. MongoDB running; `MONGO_URI` set.  
2. `JWT_SECRET`, `PORT`, `CLIENT_URL` set.  
3. `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` set as above.  
4. `cd server && npm run dev`  
5. `cd client && npm run dev`  

Details: `README.md`.
