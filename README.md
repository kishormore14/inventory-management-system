# Inventra — Enterprise Inventory Management System

A modern, responsive, and robust Inventory Management System designed with a strict decoupled architecture: a Next.js (App Router) frontend, a Node.js/Express (TypeScript) REST API backend, and an ACID-compliant PostgreSQL database hosted on Supabase.

---

## 1. Project Overview

Inventra delivers real-time visibility into warehouse catalog items, automated stock valuation, and an immutable audit trail of inventory movements. Built with strict concurrency controls (`SELECT ... FOR UPDATE`), it guarantees zero race conditions and prevents negative inventory levels under high-frequency stock operations.

### Key Highlights
- **Stripe & Linear Inspired UI:** Clean typography, neutral light theme, interactive status badges, loading skeletons, and responsive drawer/modal workflows.
- **Atomic Inventory Ledger:** All stock changes (Intake, Dispatch, and Reconciliation) run inside atomic PostgreSQL transactions.
- **Strict Decoupling:** Next.js communicates solely over RESTful JSON APIs with the Express backend.
- **Idempotent Data Seeding:** Comes pre-seeded with 8 realistic categories, 25 diverse products (in-stock, low-stock, and out-of-stock), and 15 auditable movement records.

---

## 2. Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, Zod Schema Validation, CORS |
| **Database** | PostgreSQL 16 (hosted on Supabase), `pg` connection pool, SQL migrations |
| **Deployment** | Frontend on Vercel, Backend on Render, Database on Supabase |

---

## 3. Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js 14 App Router)"]
        UI["Modern Dashboard & Pages\n(Tailwind CSS, Lucide, Modals & Drawers)"]
        APIClient["API Client Layer\n(Typed Responses, Toast & Real-Time Sync)"]
        UI --> APIClient
    end

    subgraph Server ["Backend (Node.js + Express + TypeScript)"]
        Router["Express Routers\n(/api/products, /api/inventory, ...)"]
        Validation["Zod Request & Query Validation"]
        Controller["Controllers\n(Standard HTTP Envelopes & Error Catching)"]
        Service["Domain Services\n(Stock Transactions, Business Rules)"]
        Repo["Repositories\n(Parameterized SQL & Row Locking)"]

        Router --> Validation
        Validation --> Controller
        Controller --> Service
        Service --> Repo
    end

    subgraph Storage ["Database (Supabase / PostgreSQL)"]
        DB[("PostgreSQL\n(Categories, Products, Movements)")]
        Repo -->|"pg Pool (SELECT ... FOR UPDATE)"| DB
    end

    APIClient -->|"REST over HTTPS"| Router
```

---

## 4. Database Schema

The database utilizes foreign key constraints, check constraints, and performance indexes:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    description TEXT,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reorder_level INTEGER NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Inventory Movements (Immutable Audit Trail)
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT')),
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL CHECK (previous_stock >= 0),
    new_stock INTEGER NOT NULL CHECK (new_stock >= 0),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_stock_quantity ON products(stock_quantity);
CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at DESC);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);
```

---

## 5. Critical Concurrency Control

To guarantee zero race conditions and prevent negative inventory under concurrent stock operations:

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Service as Inventory Service
    participant DB as PostgreSQL Transaction

    Client->>Service: POST /api/inventory/stock-out { productId, quantity: 10 }
    Service->>DB: BEGIN TRANSACTION
    Service->>DB: SELECT id, stock_quantity FROM products WHERE id = $1 FOR UPDATE
    Note over DB: Product row locked. Concurrent requests queue up.
    DB-->>Service: Current stock = 15
    
    alt Insufficient Stock (requested > stock)
        Service->>DB: ROLLBACK
        Service-->>Client: 400 Bad Request: Insufficient stock
    else Valid Stock
        Service->>DB: UPDATE products SET stock_quantity = 5, updated_at = NOW() WHERE id = $1
        Service->>DB: INSERT INTO inventory_movements (product_id, movement_type, quantity_change, previous_stock, new_stock, ...) VALUES ($1, 'STOCK_OUT', -10, 15, 5, ...)
        Service->>DB: COMMIT
        Note over DB: Lock released
        Service-->>Client: 200 OK: Movement recorded & stock updated
    end
```

---

## 6. REST API Endpoints

All endpoints respond with standard envelopes:
- **Success:** `{ "success": true, "message": "...", "data": { ... } }`
- **Error:** `{ "success": false, "message": "...", "errors": [ ... ] }`

### Products
- `GET /api/products`: Query params: `search`, `categoryId`, `stockStatus` (`ALL`, `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`), `sortBy`, `sortOrder`, `page`, `limit`.
- `GET /api/products/:id`: Fetch single product by UUID.
- `POST /api/products`: Create product. If `initialStock > 0`, records an initial `STOCK_IN` movement atomically.
- `PUT /api/products/:id`: Update metadata (SKU, name, category, price, reorder level). *Direct stock modification is blocked*.
- `DELETE /api/products/:id`: Blocked if audit movement records exist.

### Categories
- `GET /api/categories`: Returns categories with aggregated `product_count`.
- `POST /api/categories`: Create category (unique name enforced).
- `PUT /api/categories/:id`: Update category.
- `DELETE /api/categories/:id`: Blocked if any products are assigned.

### Inventory Movements
- `POST /api/inventory/stock-in`: Record inbound stock intake.
- `POST /api/inventory/stock-out`: Record outbound dispatch (prevents negative stock).
- `POST /api/inventory/adjustment`: Record reconciliation count and auto-calculate delta.
- `GET /api/inventory/movements`: Filter by `productId`, `movementType`, `startDate`, `endDate`, `search`, and pagination.
- `GET /api/inventory/movements/:id`: Fetch movement receipt.

### Dashboard
- `GET /api/dashboard/stats`: Returns KPI totals.
- `GET /api/dashboard/low-stock`: Returns items at or below reorder threshold.
- `GET /api/dashboard/recent-movements`: Returns latest 10 movements with SKU and delta.
- `GET /api/dashboard/category-value`: Returns valuation and unit breakdown by category.

---

## 7. Local Development Setup

### Prerequisites
- Node.js 18+ (tested on Node 20 / 24)
- PostgreSQL 14+ running locally (or a Supabase connection string)

### 1. Clone & Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
DATABASE_URL=postgresql://postgres:root@localhost:5432/inventory_db
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Setup Backend & Seed Database

```bash
cd backend
npm install
npm run migrate    # Creates tables, constraints, and indexes
npm run seed       # Seeds 8 categories, 25 products, and 15 movements
npm run dev        # Starts Express server on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev        # Starts Next.js server on http://localhost:3000
```

Visit **`http://localhost:3000`** in your browser.

---

## 8. Automated Integration & Concurrency Test Suite

The project includes an automated test runner verifying 17 integration requirements and concurrent row locking:

```bash
cd backend
npx tsx src/test-suite.ts
```

Output:
```text
=============================================
🚀 STARTING COMPREHENSIVE INTEGRATION TESTS
=============================================
✅ PASS: 1. Backend Health Check
✅ PASS: 2. Dashboard Stats
✅ PASS: 3. Create Category
✅ PASS: 4. Prevent Duplicate Category Name
✅ PASS: 5. Update Category
✅ PASS: 6. Create Product with Initial Stock
✅ PASS: 7. Prevent Duplicate SKU
✅ PASS: 8. Update Product
✅ PASS: 9. Stock In (10 + 15 = 25)
✅ PASS: 10. Stock Out (25 - 5 = 20)
✅ PASS: 11. Prevent Insufficient Stock (400 Bad Request)
✅ PASS: 12. Stock Adjustment (20 -> 12, Delta -8)
✅ PASS: 13. Search Products by SKU
✅ PASS: 14. Audit Movements Ledger Logged
✅ PASS: 15. Block Deleting Product with Audit History
✅ PASS: 16. Block Deleting Category with Assigned Products
--- Running Concurrency Verification (5 simultaneous stock-outs) ---
✅ PASS: 17. Concurrent Row-Level Locking (SELECT FOR UPDATE)
=============================================
📊 INTEGRATION TEST RESULTS: 17 PASSED, 0 FAILED
=============================================
```

---

## 9. Production Deployment Guide

### A. Database Deployment (Supabase)
1. Sign in to [Supabase](https://supabase.com/) and create a new project.
2. In Project Settings &rarr; Database &rarr; Connection string:
   - For Render/Express (long-running server): Copy the **Direct Connection (URI)** or **Session Pooler (port 5432)** string.
   - Example format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
3. Run the migrations against Supabase using your connection string:
   ```bash
   cd backend
   DATABASE_URL="your-supabase-connection-string" npm run migrate
   DATABASE_URL="your-supabase-connection-string" npm run seed
   ```

### B. Backend Deployment (Render)
1. Create a **Web Service** on [Render](https://render.com/).
2. Connect your Git repository.
3. Configure settings:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
4. Set Environment Variables:
   - `DATABASE_URL`: Your Supabase connection string.
   - `FRONTEND_URL`: Your deployed Vercel frontend URL (e.g., `https://your-app.vercel.app`).
   - `NODE_ENV`: `production`
   - `PORT`: `5000`

### C. Frontend Deployment (Vercel)
1. Import your Git repository into [Vercel](https://vercel.com/).
2. Select the **`frontend`** directory as the Root Directory.
3. Framework Preset: **Next.js**.
4. Configure Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your live Render backend URL with `/api` appended:
     `https://your-backend.onrender.com/api`
5. Click **Deploy**.

---

## 10. Future Enhancements
- Role-based authentication (Admin vs. Warehouse Operator) using NextAuth / Supabase Auth.
- Barcode & QR code scanning support via mobile camera.
- Automated email/Slack alerts when stock reaches reorder levels.
- Multi-warehouse location routing and bin location mapping.
