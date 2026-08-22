# Commercial-Grade Multi-Vendor E-Commerce Platform (MERN Stack)

A production-ready, commercial-grade Multi-Vendor E-Commerce platform built with **React (Vite), Tailwind CSS, Redux Toolkit, Node.js, Express.js, MongoDB (Mongoose), and Stripe Webhook processing**.

---

## Key Architectural Highlights

### 1. Multi-Vendor Data Architecture & Split Orders
- **Item-Level Split Fulfillment**: When a customer places an order containing products from multiple vendors, the master order tracks distinct fulfillment statuses (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), carrier tracking numbers, and dispatch timestamps per item.
- **Automated Platform Commission & Vendor Escrow**: Calculates platform commission take (e.g., 10% default or customized per vendor) and maintains isolated net payout balances for each vendor.
- **Vendor Payout Settlement**: Platform administrators can review earnings and release payouts once split deliveries are completed.

### 2. Security & Authentication
- **HTTP-Only Cookies**: JWT authentication tokens are signed with user ID and role, and transmitted via `httpOnly`, `sameSite`, and secure cookies to prevent XSS.
- **Role-Based Access Control (RBAC)**: Custom Express middlewares:
  - `protect`: Extracts and verifies JWT cookie / Bearer token.
  - `restrictTo('Admin', 'Vendor', 'Customer')`: Enforces strict route-level authorization.
- **Bcrypt Hashing**: Pre-save Mongoose hook for secure salted password hashing.

### 3. Stripe Checkout & Atomic Webhooks
- **Stripe Checkout Sessions**: Generates server-side payment sessions with metadata containing `orderId` and customer details.
- **Signature-Verified Webhook Engine**: Express raw body parser (`express.raw({ type: 'application/json' })`) mounted prior to standard JSON parser, validating HMAC signatures with `stripe.webhooks.constructEvent`.
- **Atomic MongoDB Updates**: Handles `checkout.session.completed` events to mark master orders as paid, record transaction IDs, and transition vendor payout records to pending distribution.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18 (Vite), Tailwind CSS, Redux Toolkit, React Router 6, Axios, Lucide Icons |
| **Backend** | Node.js (ES Modules), Express.js, Mongoose ODM, Stripe SDK, Multer, Cloudinary |
| **Database** | MongoDB |
| **Security** | JWT in HTTP-Only Cookies, BcryptJS, CORS, Role-Based Access Control |

---

## Directory Structure

```
E-commerce Platform/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Resilient MongoDB connection
│   │   ├── cloudinary.js         # Cloudinary SDK config
│   │   └── stripe.js             # Stripe SDK initialization
│   ├── controllers/
│   │   ├── authController.js     # Auth, signup, login, profile
│   │   ├── productController.js  # Catalog search, filter, vendor CRUD
│   │   ├── orderController.js    # Split order creation & fulfillment
│   │   ├── paymentController.js  # Stripe sessions & Webhook handler
│   │   ├── vendorController.js   # Vendor analytics & earnings
│   │   └── adminController.js    # Platform GMV & escrow management
│   ├── middleware/
│   │   ├── authMiddleware.js     # protect & restrictTo RBAC
│   │   ├── errorMiddleware.js    # Centralized error handler
│   │   └── uploadMiddleware.js   # Multer buffer & Cloudinary stream
│   ├── models/
│   │   ├── User.js               # Admin/Vendor/Customer schemas
│   │   ├── Product.js            # Vendor reference & inventory
│   │   └── Order.js              # Split fulfillment & payout models
│   ├── routes/                   # Modular Express routers
│   ├── utils/                    # Token generator & commission math
│   ├── seeder.js                 # Seed database with sample data
│   ├── server.js                 # Express server bootstrap
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/axiosClient.js    # Axios with credentials: true
    │   ├── components/
    │   │   ├── common/           # Navbar, Footer, ProtectedRoute, Alert
    │   │   └── product/          # ProductCard, Rating
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ProductDetailsPage.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   ├── OrderSuccessPage.jsx
    │   │   ├── OrderDetailsPage.jsx
    │   │   ├── OrderHistoryPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── vendor/VendorDashboardPage.jsx
    │   │   └── admin/AdminDashboardPage.jsx
    │   ├── redux/
    │   │   ├── slices/           # auth, cart, product, order slices
    │   │   └── store.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## Quick Start & Running Locally

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # (Optional) Seed sample users, vendors, and products
npm run dev      # Runs Express server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Runs Vite app on http://localhost:5173
```

---

## Demo Credentials (Seeded)

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@ecommerce.com` | `password123` | Master platform dashboard, GMV & payouts |
| **Vendor 1** | `techgear@vendor.com` | `password123` | TechGear Prime store (Audio & Tech) |
| **Vendor 2** | `urbanstyle@vendor.com` | `password123` | UrbanStyle Boutique (Fashion & Apparel) |
| **Customer** | `sarah@customer.com` | `password123` | Customer with sample split order |
