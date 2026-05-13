# User API reference

Base URL: `http://localhost:<PORT>` (see `PORT` in `server/.env`; default in this project is **5001**).

Common headers:

- JSON body: `Content-Type: application/json`
- Protected routes: `Authorization: Bearer <JWT>`

---

## Authentication (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/signup` | No | Create account; returns JWT + user summary. |
| `POST` | `/api/auth/login` | No | Login; returns JWT + user summary. |
| `GET` | `/api/auth/profile` | Yes | Returns JWT payload (`id`, `email`, `role`) embedded at login time. |

### `POST /api/auth/signup`

**Body (JSON):**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

**Response:** `201` — `{ message, token, user: { id, name, email, role } }`

### `POST /api/auth/login`

**Body (JSON):**

```json
{
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200` — `{ message, token, user }`

### `GET /api/auth/profile`

**Body:** none.

**Response:** `200` — `{ message, user }` where `user` is the decoded JWT claims.

---

## Users (`/api/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/users/me` | Yes | Full current user document from MongoDB (no password hash). |
| `PUT` | `/api/users/me` | Yes | Update own profile (e.g. `name`). |
| `GET` | `/api/users` | Admin | List all users. |
| `GET` | `/api/users/:id` | Admin | Get one user by MongoDB `_id`. |
| `PATCH` | `/api/users/:id/role` | Admin | Set `role` to `user` or `admin`. |
| `DELETE` | `/api/users/:id` | Admin | Delete a user. |

### `PUT /api/users/me`

**Body (JSON):**

```json
{
  "name": "Jane D."
}
```

### `PATCH /api/users/:id/role`

**Body (JSON):**

```json
{
  "role": "admin"
}
```

Valid `role` values: `"user"`, `"admin"`.

---

## Related code (server)

- Routes: `server/routes/authRoutes.js`, `server/routes/userRoutes.js`
- Controllers: `server/controllers/authController.js`, `server/controllers/userController.js`
- Model: `server/models/userModel.js`
- JWT middleware: `server/middlewares/authMiddleware.js`
- Admin guard: `server/middlewares/adminMiddleware.js`
