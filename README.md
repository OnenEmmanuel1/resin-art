# Resin Art E-Commerce System with AR Product Preview 🎨✨

A full-stack Node.js & EJS e-commerce platform dedicated to handcrafted resin art products (trays, jewelry, wall art, keyholders, coasters, and custom gifts), featuring an **AR Product Preview** for 3D visualization, real-time Socket.IO notifications, OAuth authentication, and a complete admin management dashboard.

---

## 🚀 Features

### 🛍️ Storefront & Customer Features
- **Product Catalog & Search**: Browse resin products by categories (Trays, Jewelry, Wall Decor, Coasters, Keyholders, Custom Gifts).
- **AR Product Preview**: Interactive 3D / Augmented Reality preview for products.
- **Shopping Cart & Checkout**: Session-backed shopping cart with quantity management and order placement.
- **Order Management & Tracking**: View order history, track delivery status, and review order item details.
- **Product Reviews & Ratings**: Submit product reviews and star ratings (1–5 stars) with image uploads.
- **Real-Time Notifications**: Instant updates via Socket.IO for order status changes and user notifications.
- **User Profile Management**: Update account details, shipping address, phone number, and password.

### 🔐 Authentication & Security
- **Authentication Methods**: Local email/password login, Google OAuth 2.0, and Facebook Login via Passport.js.
- **Role-Based Access Control**: Differentiates between `customer` and `admin` roles.
- **Password Hashing**: Secure password encryption using `bcrypt`.
- **Session Security**: Express sessions with configurable secret keys.

### 🛠️ Admin Dashboard
- **Product & Category Management**: Create, edit, activate/deactivate products with image upload support (Multer).
- **Order Processing**: View customer orders, update order status (`pending`, `paid`, `shipped`, `delivered`, `cancelled`), and assign delivery tracking numbers.
- **Review Moderation**: Approve or reject customer product reviews.
- **Inventory Tracking**: Track stock movements (`in`/`out` reasons) and current product stock levels.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Templating**: EJS (Embedded JavaScript) with `express-ejs-layouts`
- **Database**: MySQL 8.0+ using `mysql2` (Promise-based API)
- **Authentication**: Passport.js (`passport-local`, `passport-google-oauth20`, `passport-facebook`)
- **Real-Time Engine**: Socket.IO
- **File Uploads**: Multer
- **Styling & UI**: Custom CSS, Font Awesome icons, responsive layouts

---

## 📁 Project Structure

```text
resin SW/
├── config/             # Database and Passport configuration
├── controllers/        # Route controllers / business logic
├── middlewares/        # Authentication & role authorization middlewares
├── models/             # MySQL data access models (User, Product, Order, Cart, etc.)
├── public/             # Static assets (CSS, JS, images, models)
├── routes/             # Express routes (auth, shop, cart, orders, admin, etc.)
├── uploads/            # Multer file uploads directory
├── views/              # EJS templates and layouts
│   ├── admin/          # Admin portal views
│   ├── auth/           # Login, register, profile views
│   ├── layouts/        # Base layout templates
│   ├── shop/           # Shop catalog and product details
│   └── partials/       # Header, footer, navbar partials
├── app.js              # Application entry point & Express setup
├── setup_db.js         # Automatic database schema creation & admin setup
├── seed_data.js        # Initial database seed script (categories & products)
├── .env                # Environment variables configuration (ignored in git)
├── .gitignore          # Git ignore rules
└── package.json        # Node.js dependencies & scripts
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** (v16.x or higher)
- **npm** (v8.x or higher)
- **MySQL Server** (v8.0+ running locally or remotely)

### 1. Installation

Clone the repository and install the project dependencies:

```bash
git clone <repository-url>
cd "resin SW"
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (or use your existing configuration):

```env
PORT=3000
SESSION_SECRET=your_super_secret_session_key

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=resin_art_system

# OAuth Credentials (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### 3. Database Setup & Seeding

Run the database setup script to automatically create the database and required tables:

```bash
node setup_db.js
```

Seed initial sample categories and resin products into the database:

```bash
node seed_data.js
```

> **Default Admin Account:**  
> - **Email**: `admin@resinart.com`  
> - **Password**: `admin123`

---

## 🏃 Running the Application

### Development Mode (with Nodemon)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Access the application in your browser at: `http://localhost:3000`

---

## 🔑 Default Accounts & Access

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin@resinart.com` | `admin123` | Full admin panel access (`/admin`) |
| **Customer** | *(Register via `/auth/register`)* | *(User specified)* | Storefront, cart, checkout, profile |

---

## 📜 License

This project is created for educational and commercial resin art e-commerce demonstration.
