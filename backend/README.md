# 🏛️ Sisodia Atelier — Ultra-Luxury Heirloom Solid Wood Handicrafts Atelier Backend

Production REST API powering **Sisodia Atelier**, an ultra-luxury heirloom solid wood handicraft brand catering to discerning international patrons (US, UK, Europe, UAE) and Indian domestic buyers.

Built with **Node.js + Express + TypeScript**, configured for **Neon PostgreSQL via Prisma ORM**, with clean layered architecture (routes -> controllers -> services), strict Zod validation, role-based access control, and international export logistics calculations.

---

## 📐 Architecture & Directory Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema modeling products, bespoke inquiries, multi-currency orders
│   └── seed.ts             # Rich seed script with authentic heirloom pieces, categories, patrons & reviews
├── src/
│   ├── config/             # Zod-validated environment config, Prisma singleton, atelier constants
│   │   ├── constants.ts
│   │   ├── env.ts
│   │   └── prisma.ts
│   ├── controllers/        # Express HTTP controllers
│   │   ├── auth.controller.ts
│   │   ├── bespoke.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── collection.controller.ts
│   │   ├── currency.controller.ts
│   │   ├── health.controller.ts
│   │   ├── order.controller.ts
│   │   └── product.controller.ts
│   ├── middlewares/        # Authentication, RBAC, error handling, rate limiting, request validation
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   ├── requestLogger.ts
│   │   └── validateRequest.ts
│   ├── routes/             # Versioned REST routers (/api/v1)
│   │   ├── auth.routes.ts
│   │   ├── bespoke.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── collection.routes.ts
│   │   ├── currency.routes.ts
│   │   ├── health.routes.ts
│   │   ├── index.ts
│   │   ├── order.routes.ts
│   │   └── product.routes.ts
│   ├── services/           # Business logic & domain workflows
│   │   ├── auth.service.ts
│   │   ├── bespoke.service.ts
│   │   ├── cart.service.ts
│   │   ├── collection.service.ts
│   │   ├── currency.service.ts
│   │   ├── order.service.ts
│   │   └── product.service.ts
│   ├── types/              # TypeScript declarations and express request augmentations
│   │   └── index.ts
│   ├── utils/              # Standardized API response formatters, custom error classes, token handlers
│   │   ├── apiError.ts
│   │   ├── apiResponse.ts
│   │   ├── currency.ts
│   │   ├── logger.ts
│   │   └── tokens.ts
│   ├── app.ts              # Express application configuration & middleware pipeline
│   └── server.ts           # Server bootstrap, Neon DB verification & graceful shutdown
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── Dockerfile              # Multi-stage production container image
├── docker-compose.yml      # Container orchestration
├── package.json            # Scripts & dependencies
├── tsconfig.json           # Strict TypeScript configuration
└── README.md               # Atelier documentation
```

---

## ⚡ Quick Start

### 1. Requirements
- Node.js >= 20.x
- npm >= 10.x
- Neon PostgreSQL Account (or standard PostgreSQL instance)

### 2. Setup Environment
```bash
cp .env.example .env
```
Fill in your Neon connection strings:
- `DATABASE_URL`: Pooled connection string (`?sslmode=require`)
- `DIRECT_URL`: Direct unpooled connection string (used by Prisma migrations)

### 3. Install & Generate Prisma Client
```bash
npm install
npm run prisma:generate
```

### 4. Push Schema & Seed Database
```bash
npm run prisma:push
npm run prisma:seed
```

### 5. Start Development Server
```bash
npm run dev
```
The API is available at `http://localhost:5000/api/v1`.  
Health check endpoint: `http://localhost:5000/api/v1/health`.

---

## 🪙 Multi-Currency & International Patron Support

Sisodia Atelier caters to high-net-worth patrons worldwide with native multi-currency pricing:
- **USD ($)**: United States & Global Patronage
- **GBP (£)**: United Kingdom Estates
- **EUR (€)**: Continental Europe
- **AED (AED)**: United Arab Emirates & Middle East
- **INR (₹)**: Indian Domestic Connoisseurs

### Logistics & Export Capabilities Built-In:
- **Museum-Grade Crating**: Custom moisture-barrier crating and fumigation calculations.
- **CITES & Legal Timber Compliance**: Tracking for Dalbergia sissoo (Sheesham), Tectona grandis (Teak), Santalum album (Sandalwood), and Juglans regia (Kashmir Walnut).
- **International Marine Insurance**: Automatic 1.8% luxury valuation coverage estimation.
- **HS Tariff Code Compliance**: Standardized HS 9403.60.00 labeling for international customs clearance.

---

## 🔒 Security & Layered Architecture

- **Strict Zod Validation**: Every request body, query parameter, and route parameter is validated before reaching the controller.
- **JWT + Refresh Token Cookie**: Access tokens (15m) paired with secure HTTP-only refresh tokens (7d) in the database.
- **Role-Based Access Control (RBAC)**:
  - `SUPER_ADMIN`: Atelier principal & full system access
  - `ADMIN`: Operations & export logistics
  - `ARTISAN_CURATOR`: Catalog & bespoke inquiries curation
  - `VIP_PATRON`: Private salon access, bespoke commissions & order history
  - `CLIENT`: Registered buyer
- **Defense in Depth**: Helmet headers, CORS origin whitelisting, rate limiting on sensitive routes, and structured operational error handling.

---

## 📚 REST API Reference (`/api/v1`)

| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/health` | GET | Public | Any | Neon DB health & server uptime |
| `/currencies` | GET | Public | Any | Supported currencies and baseline rates |
| `/currencies/convert` | GET | Public | Any | Currency conversion calculator |
| `/auth/register` | POST | Public | Any | Register patron account |
| `/auth/login` | POST | Public | Any | Authenticate & retrieve JWT tokens |
| `/auth/refresh` | POST | Public | Any | Refresh expired access token |
| `/auth/logout` | POST | Public | Any | Revoke refresh token |
| `/auth/me` | GET | Auth | Client+ | Get authenticated profile |
| `/products` | GET | Public | Any | Filter catalog by wood, category, price, search |
| `/products/categories` | GET | Public | Any | List active product categories |
| `/products/wood-species` | GET | Public | Any | Botanical & CITES timber specs |
| `/products/:slug` | GET | Public | Any | Product detail with images & currency pricing |
| `/products` | POST | Auth | Admin/Curator | Create new heirloom piece |
| `/products/:id` | PATCH | Auth | Admin/Curator | Update product details |
| `/products/:id` | DELETE | Auth | Admin | Archive product |
| `/collections` | GET | Public | Any | List curated collections |
| `/collections/:slug` | GET | Public | Any | Get collection with products |
| `/bespoke` | POST | Public/Auth | Any | Submit bespoke commission inquiry |
| `/bespoke/my-inquiries` | GET | Auth | Client+ | Patron's bespoke inquiry history |
| `/bespoke` | GET | Auth | Admin/Curator | List all atelier inquiries |
| `/bespoke/:id/status` | PATCH | Auth | Admin/Curator | Update bespoke status & quotes |
| `/cart` | GET | Public/Auth | Any | Retrieve active shopping bag |
| `/cart/items` | POST | Public/Auth | Any | Add item with custom finishing / monogram |
| `/cart/items/:itemId` | PATCH | Public/Auth | Any | Update item quantity / customization |
| `/cart/items/:itemId` | DELETE | Public/Auth | Any | Remove item |
| `/cart/currency` | POST | Public/Auth | Any | Recalculate cart in new currency |
| `/orders` | POST | Public/Auth | Any | Place order with export logistics fees |
| `/orders/my-orders` | GET | Auth | Client+ | View patron order history |
| `/orders/:orderNumber` | GET | Public/Auth | Any | Track order and export certificates |
| `/orders` | GET | Auth | Admin/Curator | List all orders with filters |
| `/orders/:id/status` | PATCH | Auth | Admin | Update shipment tracking & CITES permit |
| `/payments/stripe/create-intent` | POST | Public/Auth | Any | Create Stripe PaymentIntent with 100% DDP tariff guarantee |
| `/payments/stripe/webhook` | POST | Public | Webhook | Handle Stripe webhook signatures & mark orders `PAID` |
| `/payments/paypal/create-order` | POST | Public/Auth | Any | Initialize PayPal international checkout order |
| `/payments/paypal/capture-order` | POST | Public/Auth | Any | Capture approved PayPal funds & confirm order |
| `/payments/razorpay/create-order` | POST | Public/Auth | Any | Initialize domestic INR order via Razorpay |
| `/payments/razorpay/verify` | POST | Public/Auth | Any | Verify Razorpay HMAC SHA256 payment signature |
| `/chat/craftsman` | POST | Public/Auth | Any | Gemini 1.5 Flash live chat with Master Craftsman Khemraj |
| `/reviews` | GET | Public | Any | Curated verified patron reviews for homepage marquee |
| `/reviews/summary` | GET | Public | Any | Aggregated rating metrics (4.98 stars, 1,420 consignments) |
| `/reviews` | POST | Public/Auth | Any | Submit verified patron testimonial |
| `/consultations/available-slots` | GET | Public | Any | Available slots in the strict 11 AM – 2 PM IST window |
| `/consultations` | POST | Public/Auth | Any | Book 1-on-1 video inspection call with Master Craftsman Khemraj |

---

## 🛠️ Build & Scripts

```bash
# Typecheck TypeScript
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```

