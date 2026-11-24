# Inventra — Full-Stack Deployment Guide & Architecture

This document provides a complete record and reference guide for the deployment of the **Inventra Inventory Management System** across **Supabase (PostgreSQL)**, **Render (Express Backend)**, and **Vercel (Next.js Frontend)**.

---

## 1. Live Production Deployment Overview

| Service | Platform | Live URL / Endpoint | Configuration / Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | `https://inventory-management-system-*.vercel.app` | Next.js 14 App Router, Tailwind CSS, Responsive UI |
| **Backend** | **Render** | `https://inventory-backend-w5bd.onrender.com` | Express REST API, Node.js, Zod Validation, Concurrency Lock |
| **Database** | **Supabase** | `aws-0-ap-southeast-1.pooler.supabase.com:5432` | Managed PostgreSQL 16, Connection Pooling, ACID Transactions |

---

## 2. Architecture & Data Flow

```mermaid
flowchart LR
    subgraph Browser ["Client Browser"]
        User["Operations User / Admin"]
    end

    subgraph Vercel ["Vercel (Frontend CDN)"]
        NextApp["Next.js 14 App Router\n(/, /products, /inventory, /categories)"]
    end

    subgraph Render ["Render (Backend Web Service)"]
        Express["Express.js REST API\n(/api/*)\nRow-level Locks: SELECT FOR UPDATE"]
    end

    subgraph Supabase ["Supabase (PostgreSQL 16)"]
        Pooler["Session Pooler (Port 5432)\nap-southeast-1"]
        DB[("PostgreSQL Database\n(categories, products, movements)")]
        Pooler --> DB
    end

    User -->|"HTTPS (Next.js Pages)"| NextApp
    NextApp -->|"REST over HTTPS (NEXT_PUBLIC_API_URL)"| Express
    Express -->|"PostgreSQL Protocol (DATABASE_URL SSL)"| Pooler
```

---

## 3. Database Configuration (Supabase)

### Instance Details
- **Project Ref:** `ryxkaffhzobtnhnjmqbw`
- **Region:** Singapore (`ap-southeast-1`)
- **Port:** `5432` (Session Pooler)
- **User:** `postgres.ryxkaffhzobtnhnjmqbw`
- **Database:** `postgres`

### Database Connection String Format
Because the database password contains `#` (`inventory_db#123`), it is URL-encoded as `%23`:

```text
postgresql://postgres.ryxkaffhzobtnhnjmqbw:inventory_db%23123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

> **Why the Pooler Host?**  
> Direct connections to `db.ryxkaffhzobtnhnjmqbw.supabase.co` resolve via IPv6 only. Standard cloud providers (such as Render) require IPv4 routing. The Supabase Session Pooler (`aws-0-ap-southeast-1.pooler.supabase.com:5432`) natively supports IPv4 with TLS/SSL encryption.

---

## 4. Backend Configuration (Render)

### Web Service Settings
- **Service Name:** `inventory-backend`
- **Git Repository:** `kishormore14/inventory-management-system`
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`
- **Plan:** `Free`

### Environment Variables on Render
Configure these in Render Dashboard &rarr; **Environment**:

| Variable Key | Value | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.ryxkaffhzobtnhnjmqbw:inventory_db%23123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` | Connects backend to Supabase PostgreSQL |
| `NODE_ENV` | `production` | Enables Express production optimizations & SSL |
| `PORT` | `5000` | Port listened to by Node server (Render assigns internally) |
| `FRONTEND_URL` | Your Vercel domain (e.g. `https://inventory-management-system.vercel.app`) | Configures CORS origin permissions |

### Health Check Endpoint
- **URL:** `https://inventory-backend-w5bd.onrender.com/health`
- **Response:** `{"status":"ok","timestamp":"..."}`

---

## 5. Frontend Configuration (Vercel)

### Project Settings
- **Git Repository:** `kishormore14/inventory-management-system`
- **Framework Preset:** `Next.js`
- **Root Directory:** `frontend` *(⚠️ Crucial: set to frontend directory)*
- **Build Command:** `next build` (default)
- **Output Directory:** `.next` (default)

### Environment Variables on Vercel
Configure this in Vercel Dashboard &rarr; **Settings** &rarr; **Environment Variables**:

| Variable Key | Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://inventory-backend-w5bd.onrender.com/api` | Points all client-side API requests to Render |

---

## 6. Database Migrations & Seeding Commands

If you ever need to reset or re-seed the Supabase database from your local machine:

```bash
cd backend

# Run schema migrations (creates categories, products, inventory_movements tables and indexes)
npm run migrate

# Run initial demonstration seed (8 categories, 25 products, 15 ledger movements)
npm run seed

# Run integration and concurrency test suite (17 tests)
npx tsx src/test-suite.ts
```

---

## 7. Troubleshooting & Maintenance

### Cold Starts (Render Free Tier)
Render's free tier spins down web services after 15 minutes of inactivity. When a new request arrives, it may take 30–45 seconds for the backend to wake up.
- **Behavior in UI:** The frontend displays smooth loading skeletons while waiting for the backend to wake up.
- **Remedy:** Upgrading to Render's Starter plan ($7/mo) prevents sleeping.

### CORS Updates
The backend is coded in `src/app.ts` to automatically permit:
- `http://localhost:3000` (Local testing)
- Any domain ending with `.vercel.app` (All Vercel preview & production deployments)
- Custom domains defined in `FRONTEND_URL`

### Automatic Deployments
Both Render and Vercel are connected to the `main` branch of `kishormore14/inventory-management-system`. Any code pushed to `main`:
1. Automatically triggers a Vercel build if files inside `frontend/` changed.
2. Automatically triggers a Render build if files inside `backend/` changed.
