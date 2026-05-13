# E-Book Store — Run locally

Stack: **MongoDB**, **Express** (default API port **5001**; set `PORT` in `server/.env`), **React + Vite** (port 5173), **Stripe Checkout**, **Tailwind + Ant Design**.

**Docs:** [USER_API.md](USER_API.md) (auth & users) · [BOOK_API.md](BOOK_API.md) (books, upload, Stripe, purchases) · [CODEBASE.md](CODEBASE.md) (architecture & Stripe env explanation) · **[START_APPLICATION.md](START_APPLICATION.md) (step-by-step startup)**

## 1. Prerequisites

- Node.js 18+ and npm  
- MongoDB running locally (or Atlas URI)  
- [Stripe](https://stripe.com) account (test keys)

## 2. Backend (`server/`)

Create `server/.env`:

```env
PORT=5001
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/ebook-store
JWT_SECRET=your_long_random_secret

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Install and start:

```bash
cd server
npm install
npm run dev
```

### Stripe webhooks (local)

In a separate terminal:

```bash
stripe listen --forward-to localhost:5001/api/stripe/webhook
```

Use the printed **webhook signing secret** as `STRIPE_WEBHOOK_SECRET`.

## 3. Frontend (`client/`)

Optional `client/.env` (only if you do **not** use the Vite proxy and call the API directly):

```env
VITE_API_URL=http://localhost:5001
```

Install and start:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**.

## 4. Quick test flow

1. Register → Login  
2. **Upload** a PDF book (price ≥ **$0.50** for Stripe)  
3. Open the book → **Buy with Stripe** (test card `4242 4242 4242 4242`)  
4. After redirect, see receipt; **Dashboard → Purchase history** for PDF link  
5. **Edit** your listing from book page or dashboard  

Admin features (users/transactions) still use an admin JWT as before.
