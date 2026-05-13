# Book API reference

Base URL: `http://localhost:<PORT>` (see `PORT` in `server/.env`).

Headers:

- JSON: `Content-Type: application/json`
- Auth: `Authorization: Bearer <JWT>` where required
- PDF upload: `multipart/form-data` with field name **`pdf`** (browser sets boundary; do not set `Content-Type` manually in clients like axios when using `FormData`)

---

## Books (`/api/books`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/books` | No | List **published** books. Optional query: `?seller=<userId>`. |
| `GET` | `/api/books/my` | Yes | All books **you** sell (includes drafts). |
| `GET` | `/api/books/:id` | Optional | One book. Unpublished visible only to seller/admin if Bearer token sent. |
| `POST` | `/api/books/upload` | Yes | Upload a **PDF**; returns `pdfUrl` for the next step. |
| `POST` | `/api/books` | Yes | Create listing (usually after upload). |
| `PUT` | `/api/books/:id` | Yes | Update book (seller or admin). |
| `DELETE` | `/api/books/:id` | Yes | Delete book (seller or admin). |

### `POST /api/books/upload`

Multipart form field: **`pdf`** (single file, PDF only).

**Response:** `201` — `{ message, pdfUrl, filename }`  
Use `pdfUrl` (e.g. `/uploads/....pdf`) in `POST /api/books`.

### `POST /api/books`

**Body (JSON):**

```json
{
  "title": "Learn MERN",
  "description": "Hands-on guide.",
  "price": 9.99,
  "pdfUrl": "/uploads/1730000000-123456789.pdf",
  "coverImageUrl": "https://example.com/cover.jpg",
  "isPublished": true
}
```

Required: `title`, `price`.  
`coverImageUrl` is optional (storefront card).  
`isPublished` defaults to `true` if omitted.

### `PUT /api/books/:id`

**Body (JSON):** any subset of fields to change:

```json
{
  "title": "Learn MERN (2nd ed.)",
  "description": "Updated.",
  "price": 12.99,
  "pdfUrl": "/uploads/another.pdf",
  "coverImageUrl": "https://example.com/cover2.jpg",
  "isPublished": false
}
```

---

## Stripe (buy a book) (`/api/stripe`)

Used by the app after the user clicks **Buy** on a book. Creates a Checkout Session and a **pending** transaction in MongoDB; the webhook marks it **completed**.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/stripe/create-checkout-session` | Yes | Body `{ "bookId": "<mongoId>" }` — returns `{ url, sessionId }`; redirect browser to `url`. |
| `GET` | `/api/stripe/receipt` | No | Query `session_id` — public receipt summary after Stripe redirect. |
| `GET` | `/api/stripe/session-status` | Yes | Query `session_id` — full status + populated `transaction` if buyer matches JWT. |

### `POST /api/stripe/create-checkout-session`

**Body (JSON):**

```json
{
  "bookId": "507f1f77bcf86cd799439011"
}
```

**Rules:** book must be published; buyer cannot be the seller; price must be at least **$0.50** (Stripe minimum in this flow).

### `GET /api/stripe/receipt?session_id=cs_test_...`

No auth. Returns payment summary for the success page.

> **Webhook (not in this table):** `POST /api/stripe/webhook` — raw body, Stripe signature; configured in `server/server.js`. See `CODEBASE.md`.

---

## Purchase history (related)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/transactions/my` | Yes | Your purchases (includes populated `book` for title / `pdfUrl`). |
| `GET` | `/api/transactions` | Admin | All transactions. |

---

## Related code (server)

- Books: `server/routes/bookRoutes.js`, `server/controllers/bookController.js`, `server/models/bookModel.js`
- Upload: `server/middlewares/uploadPdfMiddleware.js`, `server/controllers/uploadController.js`
- Stripe: `server/routes/stripeRoutes.js`, `server/controllers/stripeController.js`
- Transactions: `server/routes/transactionRoutes.js`, `server/controllers/transactionController.js`, `server/models/transactionModel.js`
- Optional JWT for draft book view: `server/middlewares/optionalAuthMiddleware.js`
