================================================================================
E-BOOK STORE BACKEND — API REFERENCE
================================================================================
Base URL: http://localhost:<PORT>
  Replace <PORT> with the value in server/.env (PORT), or 5001 if unset.
  Example: http://localhost:5001

Headers (when body is JSON):
  Content-Type: application/json

Headers (protected routes):
  Authorization: Bearer <your_jwt_token>

================================================================================
HEALTH
================================================================================

GET /
  Description: Simple health check. Confirms the Express server is running.
  Auth:        None
  Body:        None

  Sample response (JSON):
  { "message": "E-Book Store backend is running" }

================================================================================
AUTHENTICATION — /api/auth
================================================================================

POST /api/auth/signup
  Description: Register a new user. Password is hashed with bcrypt; response
               includes a JWT for immediate use. New users default to role "user".
  Auth:        None

  Sample request body (JSON):
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePass123"
  }

  Notes: name, email, and password are required. Email is stored lowercase.


POST /api/auth/login
  Description: Authenticate with email and password. Returns a JWT and basic
               user info. Token includes id, email, and role — use for protected routes.
  Auth:        None

  Sample request body (JSON):
  {
    "email": "jane@example.com",
    "password": "SecurePass123"
  }

  Notes: Copy the "token" from the response for Authorization header.


GET /api/auth/profile
  Description: Protected route. Returns JWT payload (id, email, role) embedded
               when the token was issued. For full DB profile fields, use GET /api/users/me.
  Auth:        Required — Bearer token

  Body:        None

================================================================================
USERS (SELF) — /api/users
================================================================================

GET /api/users/me
  Description: Returns the logged-in user's document from MongoDB (excluding
               password hash). Includes name, email, role, timestamps, etc.
  Auth:        Required — Bearer token

  Body:        None


PUT /api/users/me
  Description: Update the current user's profile. Currently supports updating
               name (email change not implemented here).
  Auth:        Required — Bearer token

  Sample request body (JSON):
  {
    "name": "Jane D."
  }

  Notes: Send at least one field you want to update.

================================================================================
USERS (ADMIN ONLY) — /api/users
================================================================================
These routes require a valid JWT whose user has role "admin" in the database.
To get an admin token: set that user's role to "admin" in MongoDB, then login again.

GET /api/users
  Description: List all users (sorted newest first). Password hashes are omitted.
  Auth:        Required — Bearer token (admin)


GET /api/users/:id
  Description: Get one user by MongoDB _id. Password hash is omitted.
  Auth:        Required — Bearer token (admin)

  Example URL: http://localhost:5001/api/users/507f1f77bcf86cd799439011

  Body:        None


PATCH /api/users/:id/role
  Description: Change a user's role to either "user" or "admin".
  Auth:        Required — Bearer token (admin)

  Example URL: http://localhost:5001/api/users/507f1f77bcf86cd799439011/role

  Sample request body (JSON):
  {
    "role": "admin"
  }

  Valid role values: "user", "admin"


DELETE /api/users/:id
  Description: Permanently delete a user document from the database.
  Auth:        Required — Bearer token (admin)

  Example URL: http://localhost:5001/api/users/507f1f77bcf86cd799439011

  Body:        None

================================================================================
BOOKS — /api/books
================================================================================

GET /api/books
  Description: List published books for the marketplace. Optional query ?seller=<userId>
               returns only that seller’s published books.
  Auth:        None

  Body:        None


GET /api/books/my
  Description: List books you uploaded (includes drafts where isPublished is false).
  Auth:        Required — Bearer token


GET /api/books/:id
  Description: Get one book by id. Published books are public. Unpublished books are
               visible only to the seller or an admin (send Bearer token for those).
  Auth:        Optional — Bearer token (needed for unpublished as seller/admin)

  Body:        None


POST /api/books
  Description: Create a new book listing. You become the seller (from JWT).
  Auth:        Required — Bearer token

  Sample request body (JSON):
  {
    "title": "Learn MERN in 30 Days",
    "description": "Full-stack guide with projects.",
    "price": 9.99,
    "pdfUrl": "https://example.com/files/sample.pdf",
    "isPublished": true
  }

  Notes: title and price are required. pdfUrl can be empty until upload is wired.


PUT /api/books/:id
  Description: Update a book. Only the seller who owns the book or an admin may update.
  Auth:        Required — Bearer token

  Sample request body (JSON):
  {
    "title": "Learn MERN in 30 Days (2nd ed.)",
    "description": "Updated content.",
    "price": 12.99,
    "pdfUrl": "https://example.com/files/sample-v2.pdf",
    "isPublished": false
  }


DELETE /api/books/:id
  Description: Delete a book. Only the seller or an admin may delete.
  Auth:        Required — Bearer token

  Body:        None

================================================================================
TRANSACTIONS (PURCHASES) — /api/transactions
================================================================================
Dummy flow: creates a completed record without Stripe. Wire Stripe later using
stripePaymentIntentId on the Transaction model.

POST /api/transactions
  Description: Record a purchase of a published book by the logged-in user.
               You cannot buy your own book. Amount is taken from the book price.
  Auth:        Required — Bearer token

  Sample request body (JSON):
  {
    "bookId": "507f1f77bcf86cd799439011"
  }


GET /api/transactions/my
  Description: List your purchase history (transactions where you are the buyer).
  Auth:        Required — Bearer token

  Body:        None


GET /api/transactions
  Description: List all transactions (admin dashboard / reporting).
  Auth:        Required — Bearer token (admin)

  Body:        None

================================================================================
QUICK THUNDER CLIENT / POSTMAN CHECKLIST
================================================================================
1. POST /api/auth/signup OR /api/auth/login → save token.
2. For protected routes: Headers → Authorization → Bearer <token>
3. Admin routes: promote user in MongoDB first, then login to get admin token.

================================================================================
END OF FILE
================================================================================
