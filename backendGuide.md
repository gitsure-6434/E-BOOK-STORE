**Project Overview**

This project is a Book Marketplace platform where users can upload books in PDF format for others to purchase. It is built using the MERN stack (MongoDB, Express, React, Node.js), with additional technologies like Vite, Stripe for payments, and Tailwind CSS for styling. The system handles user authentication, file uploads, secure payments, and a clean user interface.

**Backend Features**

_User Authentication_

 - JWT-based authentication for secure login and signup.
 - Password hashing using bcrypt for secure storage.

_Book Management_

 - Users can upload books in PDF format.
 - File uploads handled with Multer and stored on cloud platforms like Cloudinary or AWS S3.
 - Mongoose models for managing users and books.

_Payment Processing_

 - Stripe integration for handling payments and transactions.
 - Webhooks to listen for Stripe payment events (e.g., successful payments).

_Data Validation and Security_

 - Input validation using Express Validator for secure data entry.
 - CORS handling for frontend-backend communication.

_API Endpoints_

 - RESTful API for book management (create, read, update, delete books).
 - Endpoints for user registration, login, and profile management.
 - Payment-related endpoints to initiate and confirm transactions via Stripe.

_Admin Controls_

 - Admin panel for viewing users, books, and transactions.
 - Admin capabilities for managing users and content.

 **Folder Structure**

 ├── server # Backend (Express)
│   ├── controllers # Controllers for handling requests
│   ├── models # Mongoose models (e.g., User, Book)
│   ├── routes # API routes (e.g., auth routes, book routes)
│   ├── middlewares # Middleware (e.g., auth checks, validation)
│   ├── uploads # Folder to store temporary uploads (Multer)
│   ├── config # Configuration files (e.g., Stripe, Cloudinary)
│   ├── server.js # Main server file
│   └── package.json # Backend dependencies
└──     .env # Environment variables (e.g., MongoDB URI, Stripe keys)


_Backend Setup_

 - https://www.mongodb.com/docs/
 - https://expressjs.com/en/starter/installing.html
 - https://reactjs.org/docs/getting-started.html
 - https://nodejs.org/en/docs/

_Vite_

 - https://vitejs.dev/guide/

_Authentication_

 - https://jwt.io/introduction (JWT Authentication in Node.js)
 - https://www.npmjs.com/package/bcrypt (Bcrypt for Password Hashing)

_File Upload_

 - https://www.npmjs.com/package/multer
 - https://cloudinary.com/documentation

_Payments_

 - https://stripe.com/docs/api

_Frontend UI_

 - https://tailwindcss.com/docs
 - https://ant.design/docs/react/introduce

_React Libraries_

 - https://reactrouter.com/web/guides/quick-start
 - https://reactjs.org/docs/context.html

