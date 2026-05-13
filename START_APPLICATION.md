# Step-by-step: start the E-Book Store application

Follow these steps in order the first time you run the project. After setup, you usually only need **steps 10–12** (and **9** if you use Stripe).

---

## Part A — One-time setup

### Step 1 — Check Node.js and npm

Open a terminal and run:

```bash
node -v
npm -v
```

You should see versions (Node **18+** recommended). If `npm` is missing, install Node from [nodejs.org](https://nodejs.org) or use Homebrew: `brew install node`.

---

### Step 2 — Go to the project folder

```bash
cd "/Users/suresh/Desktop/My Learnings/E BOOK STORE"
```

(Use your actual path if the project lives somewhere else.)

---

### Step 3 — Install MongoDB (if you do not have it yet)

The API needs a running MongoDB server.

- **Option A — local:** Install [MongoDB Community](https://www.mongodb.com/docs/manual/installation/) and start it (often `brew services start mongodb-community` on Mac).
- **Option B — Atlas:** Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas) and copy your connection string.

---

### Step 4 — Confirm MongoDB is reachable

If MongoDB is local:

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

You should see `{ ok: 1 }`. If this fails, fix MongoDB before continuing.

---

### Step 5 — Create the server environment file

1. Copy the example file:

   ```bash
   cp server/.env.example server/.env
   ```

2. Open **`server/.env`** in your editor and set at least:

   | Variable | What to put |
   |----------|-------------|
   | `PORT` | **`5001`** recommended (macOS often uses **5000** for AirPlay; wrong target can cause **403** on `/api/*` in the browser) |
   | `CLIENT_URL` | `http://localhost:5173` (must match the Vite dev URL) |
   | `MONGO_URI` | Local: `mongodb://127.0.0.1:27017/ebook-store` — or your Atlas URI |
   | `JWT_SECRET` | Any long random string (used to sign login tokens) |

3. For **Stripe** (needed for “Buy with Stripe” and webhooks):

   - **`STRIPE_SECRET_KEY`:** [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **API keys** → **Secret key** (`sk_test_...`).
   - **`STRIPE_WEBHOOK_SECRET`:** You will set this in **Step 9** after running `stripe listen` (or from a Dashboard webhook in production).

Save **`server/.env`**. Do **not** commit real secrets; keep `.env` private.

**Vite proxy:** The dev server proxies `/api` to the backend. By default it uses **`http://127.0.0.1:5001`** (see `client/vite.config.js`). If you change `PORT` in `server/.env`, create **`client/.env`** with:

```env
VITE_API_PROXY_TARGET=http://127.0.0.1:<YOUR_PORT>
```

Then restart `npm run dev` in `client/`.

---

### Step 6 — Install backend dependencies (one time per machine)

```bash
cd server
npm install
cd ..
```

---

### Step 7 — Install frontend dependencies (one time per machine)

```bash
cd client
npm install
cd ..
```

---

### Step 8 — Install Stripe CLI (optional but recommended for payments locally)

Payments complete in the database when Stripe sends a **webhook** to your server.

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Log in once:

   ```bash
   stripe login
   ```

---

### Step 9 — Start Stripe webhook forwarding (each dev session)

Open a **dedicated terminal** and run:

```bash
stripe listen --forward-to localhost:5001/api/stripe/webhook
```

The CLI prints a **webhook signing secret** (`whsec_...`). Copy it into **`server/.env`** as:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
```

Restart the **server** (Step 11) after you change this value.

Leave this terminal running while you test payments.

---

## Part B — Every time you develop

### Step 10 — Start MongoDB (if it is not already running)

Example on Mac with Homebrew:

```bash
brew services start mongodb-community
```

(Use your own MongoDB start command if different.)

---

### Step 11 — Start the backend API

Open a terminal:

```bash
cd "/Users/suresh/Desktop/My Learnings/E BOOK STORE/server"
npm run dev
```

Wait until you see something like: **`Server running on port 5001`** (or whatever you set in `PORT`) and **`MongoDB connected`**.

**If register/login returns `403` on `http://localhost:5173/api/...`:** Your browser is hitting the **Vite** dev server, which proxies to the wrong host/port (often **5000** while the API runs on **5001**). Fix: align **`PORT`** in `server/.env` with **`VITE_API_PROXY_TARGET`** in `client/.env`, or use the default **5001** everywhere. On Mac, **5000** is frequently **not** your Express app (e.g. AirPlay) and responds with **403**.

**If the API port is busy:** pick another free port, set `PORT` in `server/.env`, set `VITE_API_PROXY_TARGET` in `client/.env`, and update the `stripe listen` URL to match.

**If MongoDB connection fails:** check `MONGO_URI` and that MongoDB is running (Step 10).

---

### Step 12 — Start the frontend

Open **another** terminal:

```bash
cd "/Users/suresh/Desktop/My Learnings/E BOOK STORE/client"
npm run dev
```

When Vite prints the local URL, open it in the browser — usually:

**http://localhost:5173**

---

## Part C — Quick sanity check

1. Open **http://localhost:5173**.  
2. **Register** a new account, then **Login**.  
3. Go to **Upload**, add a PDF, set price **≥ $0.50**, publish.  
4. Open the book → **Buy with Stripe** → use test card **`4242 4242 4242 4242`**.  
5. Confirm **`stripe listen`** is running and **`STRIPE_WEBHOOK_SECRET`** is set so the purchase shows as completed in **Dashboard**.

---

## Stopping the app

- In each terminal running `npm run dev` or `stripe listen`, press **Ctrl+C**.  
- Stop MongoDB only if you want to free resources (depends on how you installed it).

---

## Where to read more

- **[README.md](README.md)** — short overview and env snippet.  
- **[CODEBASE.md](CODEBASE.md)** — how folders connect and Stripe env details.  
- **[USER_API.md](USER_API.md)** / **[BOOK_API.md](BOOK_API.md)** — API reference.
