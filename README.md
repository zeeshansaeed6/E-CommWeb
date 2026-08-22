# 🛒 OmniMarket — Commercial-Grade Multi-Vendor E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-sky.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-emerald.svg)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment%20Gateways-blueviolet.svg)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, full-stack **Multi-Vendor Marketplace** built with the **MERN Stack** (MongoDB, Express, React, Node.js), featuring **Stripe Escrow Payments**, **Item-Level Split Fulfillment**, **Dynamic Multi-Currency Conversion (INR ₹, USD $, EUR €, etc.)**, **Vendor & Admin Hubs**, and **Role-Based Access Control**.

---

## 🌟 Key Features

### 🛍️ Buyer Experience
- **Dynamic Multi-Currency System**: Instant switching between **INR (₹ - Default)**, **USD ($)**, **EUR (€)**, **GBP (£)**, **AED (AED)**, **CAD (CA$)**, **AUD (AU$)**, **SAR (SAR)**, and **JPY (¥)** with persistent user preferences.
- **Product Discovery & Search**: Keyword search, category filters, live rating stars, discount badges, and stock availability tracking.
- **Cart & Checkout**: Multi-vendor single-cart checkout with split vendor fulfillment breakdown, 5% estimated tax calculation, and free shipping over $100.
- **Stripe 3D-Secure Payments**: Direct integration with Stripe Checkout and instant atomic webhook order processing.
- **Order Tracking**: Detailed item-level tracking numbers, fulfillment statuses, and courier details across multiple vendors per order.

### 🏬 Vendor Portal (Vendor Hub)
- **Vendor Dashboard**: Real-time KPI statistics (Net settled earnings, pending escrow payouts, catalog inventory, split order tickets).
- **Product Management**: Create, edit, and manage catalog items with image URLs, categorization, stock quantities, and base pricing.
- **Order & Dispatch Fulfillment**: Update status (`Pending` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`) and assign courier tracking numbers per item.
- **Automated Payouts**: Clear financial breakdown of gross item amounts, platform commission take, and net escrow payouts.

### 🛡️ Admin Super-Console
- **Executive KPI Dashboard**: Real-time tracking of Gross Merchandise Volume (GMV), Platform Revenue margin, Vendor Escrow Payables, and platform accounts.
- **Vendor Commission Management**: Dynamic vendor-specific commission adjustment (e.g. 10% default).
- **Escrow Settlement Console**: Audit split delivery verifications and release pending vendor net payouts.
- **User Directory**: Full CRUD management of Customer, Vendor, and Admin accounts.

---

## 🏗️ Architecture & Security Highlights

1. **Item-Level Split Fulfillment**: Orders containing items from different merchants are tracked independently with dedicated fulfillment states, carriers, and delivery verification.
2. **Automated Escrow & Commissions**: The backend automatically partitions order amounts into vendor net balances and platform commissions upon verified Stripe webhook execution.
3. **HTTP-Only Cookies & RBAC**: JWT authentication tokens are signed and delivered via secure `httpOnly` cookies with custom middleware (`protect` and `restrictTo('Admin', 'Vendor', 'Customer')`).
4. **Resilient MongoDB Schema**: Referenced vendor stores, embedded split fulfillment states, customer delivery addresses, and audited timestamps.

---

## 📂 Project Directory Structure

```
E-commerce Platform/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── cloudinary.js         # Cloudinary SDK setup
│   │   └── stripe.js             # Stripe SDK configuration
│   ├── controllers/
│   │   ├── authController.js     # Auth, signup, login, profile
│   │   ├── productController.js  # Catalog search, filter, vendor CRUD
│   │   ├── orderController.js    # Split order creation & fulfillment
│   │   ├── paymentController.js  # Stripe sessions & Webhook handler
│   │   ├── vendorController.js   # Vendor analytics & earnings
│   │   └── adminController.js    # Platform GMV & escrow management
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & RBAC guard
│   │   ├── errorMiddleware.js    # Central error handler
│   │   └── uploadMiddleware.js   # Multer file upload stream
│   ├── models/
│   │   ├── User.js               # User/Vendor profile schema
│   │   ├── Product.js            # Product & review schema
│   │   └── Order.js              # Split fulfillment & escrow schema
│   ├── routes/                   # Modular Express API routes
│   ├── utils/                    # Token generator & commission math
│   ├── seeder.js                 # Demo data seeder script
│   └── server.js                 # Express server bootstrap
│
└── frontend/
    ├── src/
    │   ├── api/axiosClient.js    # Axios instance with credentials
    │   ├── components/
    │   │   ├── common/           # Navbar, Footer, CurrencySelector, Loader, Alert
    │   │   ├── order/            # SplitOrderStatusBadge, VendorOrderSummary
    │   │   └── product/          # ProductCard, ImageGallery, Rating
    │   ├── hooks/
    │   │   └── useCurrency.js    # Multi-currency hook & formatting
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
    │   │   ├── vendor/           # VendorDashboard, VendorProducts, VendorOrders
    │   │   └── admin/            # AdminDashboard, AdminPayouts, AdminUsers
    │   ├── redux/
    │   │   ├── slices/           # auth, cart, currency, order, product slices
    │   │   └── store.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚡ Getting Started (Local Setup)

### Prerequisites
- **Node.js** (v18.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Git**

---

### 1. Clone the Repository
```bash
git clone https://github.com/zeeshansaeed6/E-CommWeb.git
cd E-CommWeb
```

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/multivendor_ecommerce
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173

# Stripe Keys (Optional for testing)
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# Platform Commission (%)
PLATFORM_COMMISSION_PERCENT=10
```

Seed initial sample data (Admin, Vendors, Customers, Products, Reviews):
```bash
npm run seed
```

Start Backend Server:
```bash
npm run dev
# Server running on http://localhost:5000
```

---

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
# Frontend running on http://localhost:5173
```

---

## 🔑 Demo Seed Accounts

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ecommerce.com` | `password123` | Master platform console, GMV overview, escrow payouts & user directory |
| **Vendor 1** | `techgear@vendor.com` | `password123` | **TechGear Prime**: Manage electronics catalog & split fulfillment |
| **Vendor 2** | `urbanstyle@vendor.com` | `password123` | **UrbanStyle Boutique**: Manage fashion catalog & split fulfillment |
| **Customer** | `sarah@customer.com` | `password123` | Customer buyer account with sample order history |

---

## 🌐 API Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user / vendor | Public |
| `POST` | `/api/auth/login` | Login user & set HTTP-only cookie | Public |
| `POST` | `/api/auth/logout` | Clear auth token cookie | Protected |
| `GET` | `/api/products` | Get products with search & category filter | Public |
| `GET` | `/api/products/:id` | Get single product details | Public |
| `POST` | `/api/orders` | Create master order with split items | Protected (Customer) |
| `GET` | `/api/orders/myorders` | Get logged-in user order history | Protected (Customer) |
| `POST` | `/api/payments/create-checkout-session/:id` | Create Stripe checkout session | Protected |
| `GET` | `/api/vendor/stats` | Get vendor earnings & KPI statistics | Protected (Vendor) |
| `GET` | `/api/admin/stats` | Platform GMV, margins & escrow status | Protected (Admin) |
| `GET` | `/api/admin/payouts` | Audit all vendor escrow payouts | Protected (Admin) |

---

## 📜 License
Distributed under the **MIT License**. Feel free to use and modify for your commercial or educational projects.
