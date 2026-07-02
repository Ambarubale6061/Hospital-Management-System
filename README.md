cat > /home/claude/Hospital-Hub-Supabase/Hospital-Hub/README.md << 'README_EOF'

<div align="center">

# 🏥 MediCore HMS — Hospital Management System

### A full-stack, production-grade Hospital Management System built with React 19, Express 5, Drizzle ORM & Supabase PostgreSQL

[![Live Demo — Frontend](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://hospital-management-system-seven-kappa.vercel.app/)
[![Live API — Backend](https://img.shields.io/badge/Live%20API-Render-46E3B7?style=for-the-badge&logo=render)](https://hospital-backend-p20c.onrender.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

---

**🌐 Frontend (Vercel):** https://hospital-management-system-seven-kappa.vercel.app/

**⚙️ Backend API (Render):** https://hospital-backend-p20c.onrender.com

---

_Designed & Built by **Ambar Ubale** — Software Engineer_

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Live Deployment](#-live-deployment)
3. [Demo Accounts](#-demo-accounts)
4. [Key Features](#-key-features)
5. [Technology Stack](#-technology-stack)
6. [System Architecture](#-system-architecture)
7. [Complete Folder Structure](#-complete-folder-structure)
8. [File-by-File Explanation](#-file-by-file-explanation)
   - [Root Level](#root-level)
   - [Backend Files](#backend-files)
   - [Frontend Files](#frontend-files)
9. [Database Schema](#-database-schema)
10. [API Reference](#-api-reference)
11. [Authentication Flow](#-authentication-flow)
12. [User Roles & Permissions](#-user-roles--permissions)
13. [Frontend Routing](#-frontend-routing)
14. [Real-time Features (Socket.IO)](#-real-time-features-socketio)
15. [Environment Variables](#-environment-variables)
16. [Local Development Setup](#-local-development-setup)
17. [Build Instructions](#-build-instructions)
18. [Deployment Guide](#-deployment-guide)
19. [Troubleshooting](#-troubleshooting)
20. [Future Enhancements](#-future-enhancements)

---

## 🏥 Project Overview

**MediCore HMS** is a comprehensive, production-ready Hospital Management System that digitises and streamlines every aspect of modern hospital operations. It replaces fragmented, paper-based processes with a single unified digital platform — covering patients, doctors, appointments, prescriptions, billing, queue management, analytics, and system administration.

### What it solves

| Problem                                | Solution                                   |
| -------------------------------------- | ------------------------------------------ |
| Manual appointment scheduling          | Online booking with real-time availability |
| Paper-based patient records            | Searchable, digital health records         |
| Disconnected billing                   | Integrated invoicing tied to appointments  |
| No visibility into hospital operations | Live analytics dashboard with charts       |
| Role confusion between staff           | Strict role-based access control (RBAC)    |
| Slow inter-department communication    | Socket.IO real-time notifications          |
| Queue chaos in OPD                     | Digital token-based queue management       |

---

## 🌐 Live Deployment

| Service         | Platform              | URL                                                        |
| --------------- | --------------------- | ---------------------------------------------------------- |
| **Frontend**    | Vercel                | https://hospital-management-system-seven-kappa.vercel.app/ |
| **Backend API** | Render                | https://hospital-backend-p20c.onrender.com                 |
| **Database**    | Supabase (PostgreSQL) | Managed cloud PostgreSQL                                   |

> **Note:** The Render backend may take 30–60 seconds to wake up on the first request if it has been idle (free-tier spin-down).

---

## 🔐 Demo Accounts

All demo accounts use the same password: **`password123`**

| Role             | Email                    | Access Level                                    |
| ---------------- | ------------------------ | ----------------------------------------------- |
| **Admin**        | `admin@hospital.com`     | Full system access — all modules                |
| **Doctor**       | `dr.carter@hospital.com` | Appointments, patients, prescriptions, schedule |
| **Receptionist** | `reception@hospital.com` | Appointments, queue, billing, patient check-in  |
| **Patient**      | `john.doe@email.com`     | Own appointments, records, prescriptions, bills |

---

## ✨ Key Features

### 🏠 Landing Page

- Animated full-screen hero with auto-sliding carousel (3 slides)
- Fixed navbar with smooth scroll navigation (4 sections: Home, Services, About, Doctors)
- Statistics bar (50,000+ patients, 200+ doctors, 98% satisfaction)
- 8-card services grid (Cardiology, Neurology, Orthopedics, Ophthalmology, Pediatrics, Diagnostics, Pharmacy, Emergency)
- Feature highlights (NABH accreditation, 24/7, telemedicine, AI diagnostics)
- Doctor showcase with ratings
- Patient testimonials
- 4-card demo access section (one per role with perks list)
- Call-to-action banner
- Professional footer with "Designed by Ambar Ubale — Software Engineer" credit

### 👤 Authentication

- JWT-based authentication (7-day token expiry)
- Email + password login with bcrypt hashing (10 rounds)
- Role-based registration
- Password reset via email token
- Auto-redirect based on auth state
- Token stored in `localStorage` as `hms_token`

### 📊 Admin Dashboard

- Live statistics cards (patients, doctors, appointments, revenue)
- Monthly appointment analytics chart (Recharts)
- Revenue analytics chart
- Recent activity feed
- Department performance stats

### 📅 Appointment Management

- Book appointments with doctor + date + time selection
- Appointment statuses: `pending → confirmed → checked_in → waiting → in_consultation → completed`
- Reschedule and cancel
- Real-time updates via Socket.IO

### 👨‍⚕️ Doctor Management

- Full doctor profiles (specialization, qualifications, fees, bio, languages)
- Availability slot management (day of week + time ranges)
- Doctor performance stats (total patients, appointments, revenue, rating)
- Patient list per doctor
- Register new doctors (creates user account + doctor profile atomically)

### 🧑‍🤝‍🧑 Patient Management

- Patient registration linked to user accounts
- Medical history records (diagnosis, symptoms, treatment, notes)
- Emergency contact and insurance information
- Searchable patient list with pagination

### 💊 Prescriptions

- Create prescriptions linked to appointments
- Medications, dosage instructions, validity date
- Patient and doctor views with filtering

### 💰 Billing

- Auto-generated unique invoice numbers
- Amount, tax, discount, total calculation
- Bill statuses: `pending → paid / partially_paid / cancelled / refunded`
- Payment method tracking
- Integrated with appointment records

### 🔢 Queue Management

- Token-based OPD queue system
- Real-time queue status updates
- Check-in, waiting, in-consultation, completed statuses
- Doctor-wise and date-wise filtering

### 🏥 Departments

- CRUD department management
- Head doctor assignment
- Department performance analytics

### 📋 Audit Log

- Complete activity trail (user actions, system events)
- Filterable by event type
- Paginated log view

### 🔔 Notifications

- MongoDB-backed notification storage
- Real-time push via Socket.IO
- Per-user notification feed
- Mark as read / mark all read
- Notification bell with unread count badge

### ⚙️ Hospital Settings

- Hospital name, address, contact information
- Working hours, tax rate, currency
- Logo URL management

### 📈 Reports

- Revenue reports (monthly breakdown, paid vs pending)
- Appointment reports (completion rate, status distribution)
- Patient reports (new patients per month, gender/blood group distribution)
- Doctor performance reports (ranked by appointment volume)

---

## 🛠 Technology Stack

### Frontend

| Technology                   | Version   | Purpose                                |
| ---------------------------- | --------- | -------------------------------------- |
| **React**                    | 19.1.0    | UI library with concurrent features    |
| **TypeScript**               | ~5.9.3    | Static type safety                     |
| **Vite**                     | ^7.3.2    | Build tool and dev server              |
| **Tailwind CSS**             | ^4.1.14   | Utility-first CSS framework            |
| **Framer Motion**            | ^12.23.24 | Animations and transitions             |
| **TanStack Query**           | ^5.90.21  | Server state, caching, background sync |
| **wouter**                   | ^3.3.5    | Lightweight client-side routing        |
| **react-hook-form**          | ^7.55.0   | Performant form management             |
| **zod**                      | ^3.25.76  | Runtime schema validation              |
| **socket.io-client**         | ^4.8.3    | Real-time WebSocket communication      |
| **Recharts**                 | ^2.15.2   | Chart and analytics visualizations     |
| **date-fns**                 | ^3.6.0    | Date formatting and manipulation       |
| **lucide-react**             | ^0.545.0  | Icon library                           |
| **Radix UI**                 | Various   | Accessible headless UI primitives      |
| **class-variance-authority** | ^0.7.1    | Component variant management           |
| **clsx + tailwind-merge**    | Latest    | Conditional class names                |

### Backend

| Technology                | Version | Purpose                             |
| ------------------------- | ------- | ----------------------------------- |
| **Node.js**               | 20+     | JavaScript runtime                  |
| **Express**               | ^5.2.1  | HTTP server framework               |
| **TypeScript**            | ~5.9.3  | Static type safety                  |
| **Drizzle ORM**           | ^0.45.2 | Type-safe SQL ORM                   |
| **PostgreSQL (Supabase)** | Latest  | Primary relational database         |
| **MongoDB**               | ^7.3.0  | Notifications and file metadata     |
| **Socket.IO**             | ^4.8.3  | Real-time bidirectional events      |
| **jsonwebtoken**          | ^9.0.3  | JWT authentication                  |
| **bcryptjs**              | ^3.0.3  | Password hashing                    |
| **pino**                  | ^9.14.0 | High-performance structured logging |
| **cors**                  | ^2.8.6  | Cross-origin resource sharing       |
| **esbuild**               | 0.25.8  | Fast TypeScript bundler             |

### Infrastructure

| Service                      | Purpose                                             |
| ---------------------------- | --------------------------------------------------- |
| **Supabase**                 | Managed PostgreSQL database with connection pooling |
| **Vercel**                   | Frontend hosting with CDN and edge functions        |
| **Render**                   | Backend Node.js hosting with auto-deploy            |
| **MongoDB Atlas** (optional) | Notification and file metadata storage              |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React 19 SPA (Vite + Tailwind)             │   │
│  │                                                         │   │
│  │  Landing Page → Login → Protected App                   │   │
│  │                                                         │   │
│  │  TanStack Query          wouter Router                  │   │
│  │  (API state cache)       (client routing)               │   │
│  │                                                         │   │
│  │  AuthContext  SocketContext  NotificationsContext        │   │
│  │                                                         │   │
│  │  API Client (custom-fetch.ts)                           │   │
│  │  All requests → Bearer token in Authorization header    │   │
│  └──────────────┬──────────────────┬───────────────────────┘   │
└─────────────────│──────────────────│───────────────────────────┘
                  │ HTTP/REST        │ WebSocket (Socket.IO)
                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXPRESS 5 API SERVER                        │
│                                                                 │
│  app.ts (middleware stack)                                      │
│  ├── pino-http (structured request logging)                     │
│  ├── cors (all origins in dev, configured in prod)              │
│  ├── express.json (body parsing)                                │
│  └── /api/* (all routes)                                        │
│                                                                 │
│  Middlewares:                                                    │
│  ├── requireAuth   (JWT verification)                           │
│  └── requireRole   (RBAC enforcement)                           │
│                                                                 │
│  Routes (15 routers):                                           │
│  auth / users / departments / doctors / patients /              │
│  appointments / prescriptions / bills / dashboard /             │
│  queue / reports / notifications / files / settings / health    │
│                                                                 │
│  Socket.IO server (/api/socket.io)                              │
│  └── emitEvent() → broadcasts to all connected clients         │
└────────────────┬───────────────────┬───────────────────────────┘
                 │ Drizzle ORM       │ MongoDB driver
                 ▼                   ▼
┌───────────────────────┐  ┌────────────────────────────────────┐
│  Supabase PostgreSQL  │  │  MongoDB (optional)                │
│                       │  │                                    │
│  users                │  │  notifications collection          │
│  doctors              │  │  files collection                  │
│  patients             │  │                                    │
│  appointments         │  │  (graceful fallback if absent)     │
│  prescriptions        │  └────────────────────────────────────┘
│  bills                │
│  departments          │
│  availability_slots   │
│  medical_records      │
│  hospital_settings    │
│  activity_log         │
└───────────────────────┘
```

### Request Lifecycle

```
Browser
  │
  ├─ 1. Page load → Vite serves index.html → React SPA boots
  │
  ├─ 2. AuthProvider checks localStorage for hms_token
  │      → If token found: GET /api/auth/me to validate
  │      → If valid: set user state, render protected routes
  │      → If invalid/expired: clear token, redirect to /login
  │
  ├─ 3. User action (e.g., book appointment)
  │      → Form submit → react-hook-form validates with zod
  │      → useMutation fires → customFetch attaches Bearer token
  │      → POST /api/appointments
  │
  ├─ 4. Backend receives request
  │      → pino-http logs request
  │      → requireAuth middleware verifies JWT
  │      → Route handler runs Drizzle query
  │      → emitEvent("appointment:created", data) via Socket.IO
  │      → Response returned
  │
  └─ 5. Frontend receives response
         → TanStack Query caches result
         → Socket.IO event received → queryClient.invalidateQueries()
         → UI re-renders with fresh data
```

---

## 📁 Complete Folder Structure

```
Hospital-Hub/
│
├── README.md                          # This file
├── .gitignore                         # Git exclusions
│
├── backend/                           # Node.js + Express API server
│   ├── .env.example                   # Environment variable template
│   ├── package.json                   # Backend dependencies & scripts
│   ├── tsconfig.json                  # TypeScript config
│   ├── drizzle.config.ts              # Drizzle Kit migration config
│   ├── build.mjs                      # esbuild bundler for main server
│   ├── build-seed.mjs                 # esbuild bundler for seed script
│   │
│   └── src/
│       ├── app.ts                     # Express app setup (middleware)
│       ├── index.ts                   # Server entry point (HTTP + Socket.IO)
│       ├── db.ts                      # Supabase PostgreSQL connection
│       ├── seed.ts                    # Demo account seeder
│       │
│       ├── schema/                    # Drizzle ORM table definitions
│       │   ├── index.ts               # Re-exports all schemas
│       │   ├── users.ts               # users table
│       │   ├── departments.ts         # departments table
│       │   ├── doctors.ts             # doctors + availability_slots tables
│       │   ├── patients.ts            # patients + medical_records tables
│       │   ├── appointments.ts        # appointments table
│       │   ├── prescriptions.ts       # prescriptions table
│       │   ├── bills.ts               # bills + activity_log tables
│       │   └── settings.ts            # hospital_settings table
│       │
│       ├── middlewares/
│       │   └── auth.ts                # JWT requireAuth, requireRole, signToken
│       │
│       ├── lib/
│       │   ├── logger.ts              # Pino structured logger
│       │   ├── mongodb.ts             # MongoDB optional connection
│       │   └── socket.ts              # Socket.IO init + emitEvent()
│       │
│       └── routes/
│           ├── index.ts               # Master router (mounts all sub-routers)
│           ├── health.ts              # GET /api/healthz
│           ├── auth.ts                # POST /api/auth/* (login, register, etc.)
│           ├── users.ts               # CRUD /api/users
│           ├── departments.ts         # CRUD /api/departments
│           ├── doctors.ts             # CRUD /api/doctors + availability + stats
│           ├── patients.ts            # CRUD /api/patients + medical history
│           ├── appointments.ts        # CRUD /api/appointments + reschedule
│           ├── prescriptions.ts       # CRUD /api/prescriptions
│           ├── bills.ts               # CRUD /api/bills
│           ├── dashboard.ts           # GET /api/dashboard/* (stats, analytics)
│           ├── queue.ts               # Queue management endpoints
│           ├── reports.ts             # GET /api/reports/* (revenue, doctors, etc.)
│           ├── notifications.ts       # MongoDB-backed notification CRUD
│           ├── files.ts               # MongoDB-backed file metadata CRUD
│           └── settings.ts            # GET/PATCH /api/hospital-settings
│
└── frontend/                          # React 19 SPA
    ├── index.html                     # SPA shell (single div#root)
    ├── package.json                   # Frontend dependencies & scripts
    ├── tsconfig.json                  # TypeScript config
    ├── vite.config.ts                 # Vite + proxy config
    ├── components.json                # shadcn/ui config
    │
    ├── public/
    │   └── favicon.svg                # Hospital cross icon
    │
    └── src/
        ├── main.tsx                   # React 19 createRoot entry
        ├── App.tsx                    # Root component + all routes
        ├── index.css                  # Tailwind v4 + CSS variables + utilities
        ├── vite-env.d.ts              # Vite type declarations
        │
        ├── api/                       # Type-safe API client layer
        │   ├── index.ts               # Public re-exports
        │   ├── custom-fetch.ts        # Fetch wrapper with auth token injection
        │   └── generated/
        │       ├── api.schemas.ts     # TypeScript interfaces for all entities
        │       └── api.ts             # All React Query hooks (51 hooks)
        │
        ├── lib/                       # App-wide contexts and utilities
        │   ├── utils.ts               # cn() helper (clsx + tailwind-merge)
        │   ├── auth.tsx               # AuthContext + AuthProvider + useAuth()
        │   ├── socket.tsx             # SocketContext + SocketProvider + useSocket()
        │   └── notifications.tsx      # NotificationsContext + useNotifications()
        │
        ├── hooks/                     # Custom React hooks
        │   ├── use-mobile.tsx         # useIsMobile() — viewport breakpoint hook
        │   └── use-toast.ts           # useToast() — global toast notifications
        │
        ├── components/                # Shared UI components
        │   ├── app-layout.tsx         # Main authenticated layout (sidebar + topbar)
        │   ├── notification-bell.tsx  # Bell icon with dropdown notification list
        │   ├── protected-route.tsx    # Auth guard wrapper for private routes
        │   └── toaster.tsx            # Toast notification renderer
        │   │
        │   └── ui/                    # shadcn/ui component library
        │       ├── accordion.tsx      # Collapsible accordion
        │       ├── alert.tsx          # Alert banner (info, warning, error)
        │       ├── alert-dialog.tsx   # Confirmation modal dialog
        │       ├── avatar.tsx         # User avatar with fallback initials
        │       ├── badge.tsx          # Status/category badge pill
        │       ├── button.tsx         # Button with variants (default, outline, etc.)
        │       ├── card.tsx           # Card container with header/content/footer
        │       ├── checkbox.tsx       # Checkbox input
        │       ├── dialog.tsx         # Modal dialog
        │       ├── dropdown-menu.tsx  # Dropdown/context menu
        │       ├── form.tsx           # react-hook-form integration components
        │       ├── input.tsx          # Text input field
        │       ├── label.tsx          # Form label
        │       ├── select.tsx         # Dropdown select
        │       ├── separator.tsx      # Horizontal/vertical divider
        │       ├── sheet.tsx          # Slide-in drawer (mobile sidebar)
        │       ├── table.tsx          # Data table components
        │       ├── tabs.tsx           # Tab navigation
        │       └── textarea.tsx       # Multi-line text input
        │
        └── pages/                     # Route-level page components
            ├── landing.tsx            # Public landing page (/)
            ├── login.tsx              # Login page (/login)
            ├── register.tsx           # Self-registration (/register)
            ├── forgot-password.tsx    # Password reset request
            ├── not-found.tsx          # 404 page
            ├── dashboard.tsx          # Main dashboard (/dashboard)
            ├── profile.tsx            # User profile (/profile)
            ├── settings.tsx           # User settings (/settings)
            ├── hospital-settings.tsx  # Admin hospital config
            ├── audit-log.tsx          # Admin activity log
            ├── medical-records.tsx    # Patient medical records
            ├── queue.tsx              # OPD queue management
            ├── receptionists.tsx      # Receptionist management (admin)
            ├── reports.tsx            # Analytics reports (admin)
            ├── schedule.tsx           # Doctor schedule view
            │
            ├── appointments/
            │   ├── index.tsx          # Appointments list
            │   ├── new.tsx            # Book new appointment
            │   └── [id].tsx           # Appointment detail + actions
            │
            ├── patients/
            │   ├── index.tsx          # Patients list (paginated, searchable)
            │   ├── new.tsx            # Register new patient
            │   └── [id].tsx           # Patient detail + medical history
            │
            ├── doctors/
            │   ├── index.tsx          # Doctor directory (card grid)
            │   ├── new.tsx            # Register new doctor
            │   └── [id].tsx           # Doctor profile + booking widget
            │
            ├── departments/
            │   └── index.tsx          # Department CRUD
            │
            ├── prescriptions/
            │   ├── index.tsx          # Prescriptions list
            │   ├── new.tsx            # Create prescription
            │   └── [id].tsx           # Prescription detail
            │
            └── bills/
                ├── index.tsx          # Bills list
                ├── new.tsx            # Create invoice
                └── [id].tsx           # Bill detail + mark paid
```

---

## 📄 File-by-File Explanation

### Root Level

| File         | Purpose                                                         |
| ------------ | --------------------------------------------------------------- |
| `README.md`  | This documentation file                                         |
| `.gitignore` | Excludes `node_modules/`, `dist/`, `.env`, `*.log`, `.DS_Store` |

---

### Backend Files

#### `backend/package.json`

Defines all backend npm dependencies and the five scripts:

- `npm run build` — runs `build.mjs` which bundles `src/index.ts` → `dist/index.mjs` using esbuild
- `npm run dev` — runs the built bundle with source maps enabled
- `npm run start` — same as dev (used by Render in production)
- `npm run dev:build` — build then immediately start (shortcut for local development)
- `npm run seed` — builds `src/seed.ts` → `dist/seed.mjs` then runs it to create demo accounts

#### `backend/tsconfig.json`

TypeScript configuration targeting ES2022, using `"moduleResolution": "bundler"` (required for esbuild's ESM output). `skipLibCheck: true` avoids type errors in third-party packages.

#### `backend/drizzle.config.ts`

Drizzle Kit configuration for schema migrations and `push` commands. Reads `SUPABASE_DATABASE_URL` and provides it to Drizzle Kit when running `npx drizzle-kit push` or `npx drizzle-kit generate`.

#### `backend/build.mjs`

An esbuild script that:

- Bundles `src/index.ts` and all imports into a single `dist/index.mjs`
- Uses `esbuild-plugin-pino` to correctly handle pino's worker threads
- Excludes native modules (`*.node`, `pg-native`, etc.) from bundling
- Adds a banner to polyfill `__dirname`, `__filename`, and `require` in ESM context
- Produces source maps for production debugging

#### `backend/build-seed.mjs`

Same as `build.mjs` but bundles `src/seed.ts` → `dist/seed.mjs`.

#### `backend/.env.example`

Template showing all required environment variables with explanations. Copy to `.env` and fill values.

---

#### `backend/src/index.ts`

**Server entry point.** Creates an HTTP server from the Express `app`, initialises Socket.IO on that server, then starts listening on `process.env.PORT` (default 5000).

#### `backend/src/app.ts`

**Express application setup.** Assembles the middleware stack in order:

1. `pino-http` — attaches a request logger to every request
2. `cors()` — allows all origins (configure for production)
3. `express.json()` — parses JSON request bodies
4. `express.urlencoded()` — parses form-encoded bodies
5. Mounts all routes under `/api`

#### `backend/src/db.ts`

**Database connection.** Reads `SUPABASE_DATABASE_URL`, validates it is set and has the password filled in, creates a `pg.Pool` with `ssl: { rejectUnauthorized: false }` (required by Supabase), and creates the Drizzle ORM instance. Also re-exports all schema tables so routes can import from `../db.js` as a single source.

#### `backend/src/seed.ts`

**Demo data seeder.** Idempotent — safe to run multiple times. For each demo user:

1. Hashes the password `password123` with bcrypt
2. If the user exists: updates their `passwordHash` and sets `isActive: true`
3. If the user doesn't exist: inserts a new user record
4. For the doctor account: creates a `doctors` table profile if one doesn't exist
5. For the patient account: creates a `patients` table profile if one doesn't exist

---

#### `backend/src/schema/`

Each file defines one or more Drizzle ORM table objects using PostgreSQL-specific types. All tables use `serial` primary keys (auto-incrementing integers) and `timestamp with timezone` for all date fields.

| File               | Tables Defined                                    |
| ------------------ | ------------------------------------------------- |
| `users.ts`         | `usersTable` — core identity table with role enum |
| `departments.ts`   | `departmentsTable` — hospital departments         |
| `doctors.ts`       | `doctorsTable` + `availabilitySlotsTable`         |
| `patients.ts`      | `patientsTable` + `medicalRecordsTable`           |
| `appointments.ts`  | `appointmentsTable` with 9-value status enum      |
| `prescriptions.ts` | `prescriptionsTable`                              |
| `bills.ts`         | `billsTable` + `activityLogTable`                 |
| `settings.ts`      | `hospitalSettingsTable`                           |
| `index.ts`         | Re-exports everything for single-import access    |

---

#### `backend/src/middlewares/auth.ts`

Exports three functions:

- **`requireAuth`** — Express middleware that reads the `Authorization: Bearer <token>` header, verifies the JWT using `SESSION_SECRET`, and attaches the decoded payload to `req.user`. Returns 401 if missing or invalid.
- **`requireRole(...roles)`** — Factory that returns middleware enforcing that `req.user.role` is in the allowed set. Returns 403 if not.
- **`signToken(payload)`** — Creates a 7-day JWT signed with `SESSION_SECRET`.

---

#### `backend/src/lib/`

| File         | Purpose                                                                                                                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `logger.ts`  | Creates a `pino` logger. In development uses `pino-pretty` for human-readable coloured output. In production emits raw JSON for log aggregation services.                                                                                 |
| `mongodb.ts` | Optional MongoDB connection. Attempts to connect on first use with a 4.5-second timeout. If MongoDB is unavailable, `getCollection()` returns `null` and all notification/file routes gracefully return empty arrays instead of erroring. |
| `socket.ts`  | Initialises Socket.IO on the HTTP server at path `/api/socket.io`. Exposes `emitEvent(event, data)` — called throughout route handlers to broadcast real-time updates to all connected clients.                                           |

---

#### `backend/src/routes/`

Every route file creates an Express `Router`, registers its endpoints, and exports the router. All are mounted in `routes/index.ts` under the `/api` prefix set in `app.ts`.

| File               | Endpoints                                                                                                                                 | Auth Required | Role Restriction                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------- |
| `health.ts`        | `GET /healthz`                                                                                                                            | ❌            | None                             |
| `auth.ts`          | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password` | Varies        | None                             |
| `users.ts`         | `GET/POST /users`, `GET/PATCH/DELETE /users/:id`                                                                                          | ✅            | Admin for list/create/delete     |
| `departments.ts`   | `GET/POST /departments`, `GET/PATCH/DELETE /departments/:id`                                                                              | ✅            | Admin for mutations              |
| `doctors.ts`       | `GET/POST /doctors`, `POST /doctors/register`, `GET/PATCH/DELETE /doctors/:id`, `/availability`, `/patients`, `/stats`                    | ✅            | Admin for mutations              |
| `patients.ts`      | `GET /patients/me`, `GET/POST /patients`, `GET/PATCH/DELETE /patients/:id`, `/medical-history`                                            | ✅            | Role-filtered                    |
| `appointments.ts`  | `GET/POST /appointments`, `GET/PATCH/DELETE /appointments/:id`, `PATCH /appointments/:id/reschedule`                                      | ✅            | All authenticated                |
| `prescriptions.ts` | `GET/POST /prescriptions`, `GET/PATCH /prescriptions/:id`                                                                                 | ✅            | Doctor/Admin for mutations       |
| `bills.ts`         | `GET/POST /bills`, `GET/PATCH /bills/:id`                                                                                                 | ✅            | Admin/Receptionist for mutations |
| `dashboard.ts`     | `GET /dashboard/stats`, `/appointment-analytics`, `/revenue-analytics`, `/recent-activity`, `/audit-log`, `/department-stats`             | ✅            | All authenticated                |
| `queue.ts`         | `GET /queue`, `PATCH /appointments/:id/checkin`, `/queue-status`, `/consult`                                                              | ✅            | Receptionist/Doctor/Admin        |
| `reports.ts`       | `GET /reports/revenue`, `/appointments`, `/patients`, `/doctors`                                                                          | ✅            | Admin only                       |
| `notifications.ts` | `GET /notifications`, `/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, `DELETE /notifications/:id`      | ✅            | Own notifications only           |
| `files.ts`         | `GET /files`, `POST /files/upload-meta`, `DELETE /files/:id`                                                                              | ✅            | All authenticated                |
| `settings.ts`      | `GET /hospital-settings`, `PATCH /hospital-settings`                                                                                      | ✅            | Admin for mutations              |

---

### Frontend Files

#### `frontend/src/main.tsx`

React 19 entry point. Uses `createRoot()` from `react-dom/client` to mount `<App />` into `#root`. Imports `index.css` for global styles.

#### `frontend/src/App.tsx`

**Root component and router.** Wraps the entire app in providers (in order): `QueryClientProvider` → `AuthProvider` → `SocketProvider` → `NotificationsProvider`. Contains the `Router` component which renders the `Switch/Route` tree covering all 30+ routes.

Key routing logic:

- `/` — Redirects to `/dashboard` if authenticated, `/login` if not
- `/login` — Redirects to `/dashboard` if already authenticated
- All app routes are wrapped in `AuthedLayout` which renders `ProtectedRoute` → `AppLayout` → page component

#### `frontend/src/index.css`

Global stylesheet that:

- Imports Tailwind CSS v4 and `tw-animate-css`
- Defines all CSS custom properties using HSL values for light and dark modes
- Theme variables: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`
- Sidebar variables: `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, etc.
- Chart variables: `--chart-1` through `--chart-5`
- UI-specific variables: `--button-outline`, `--primary-border`, `--badge-outline`
- `@theme inline {}` block maps CSS vars to Tailwind color tokens
- `@layer utilities` adds `.hover-elevate` and `.active-elevate-2` for button animations

---

#### `frontend/src/api/`

| File                       | Purpose                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `custom-fetch.ts`          | The fetch wrapper used by all generated hooks. Before every request it reads `hms_token` from localStorage and attaches `Authorization: Bearer <token>`. Handles response parsing (JSON/text/blob auto-detection), error creation (`ApiError` class with status, statusText, data), and base URL prepending. Also exports `setBaseUrl()` and `setAuthTokenGetter()` for non-browser environments. |
| `generated/api.schemas.ts` | TypeScript interfaces for every entity: `User`, `Doctor`, `Patient`, `Appointment`, `Prescription`, `Bill`, `Department`, `DashboardStats`, `MonthlyAnalytics`, etc. Plus all enums (`UserRole`, `AppointmentStatus`, `BillStatus`) and query param types (`ListPatientsParams`, `ListAppointmentsParams`, etc.).                                                                                 |
| `generated/api.ts`         | 51 React Query hooks generated in the orval style. Includes `useQuery`-based hooks for GET endpoints and `useMutation`-based hooks for POST/PATCH/DELETE. Every hook also exports its query key function (e.g., `getListPatientsQueryKey`) for cache invalidation.                                                                                                                                |
| `index.ts`                 | Re-exports everything from the three files above as a single `@/api` import.                                                                                                                                                                                                                                                                                                                      |

---

#### `frontend/src/lib/`

**`auth.tsx` — AuthContext**

```
AuthProvider
├── Reads hms_token from localStorage on mount
├── Calls GET /api/auth/me to validate token
├── Provides: { user, token, isLoading, isAuthenticated, login(), logout() }
├── login() → stores token in localStorage, sets user state, invalidates all queries
└── logout() → removes token from localStorage, clears user state, clears query cache
```

**`socket.tsx` — SocketContext**

- Creates a Socket.IO client connection to `window.location.origin` on path `/api/socket.io`
- Exposes the `socket` instance via `useSocket()`
- Exports `useSocketEvent(event, handler)` which attaches/detaches event listeners safely
- Disconnects on unmount

**`notifications.tsx` — NotificationsContext**

- Fetches initial notifications from `GET /api/notifications` on mount
- Listens for `notification:{userId}` Socket.IO events to receive real-time pushes
- Provides: `{ notifications, unreadCount, markAsRead(), markAllAsRead(), refresh() }`

---

#### `frontend/src/components/`

**`app-layout.tsx`**
The authenticated application shell. Uses `flex h-screen overflow-hidden` as the root so the sidebar and main area fill the full viewport without overflow. Structure:

```
div.flex.h-screen.overflow-hidden
├── div.hidden.md:flex → Desktop sidebar (NavContent component)
└── div.flex-1.flex.flex-col.min-w-0
    ├── header.md:hidden → Mobile top bar + Sheet (slide-in menu)
    ├── div.hidden.md:flex → Desktop top bar (page title + NotificationBell + Avatar)
    └── main.flex-1.overflow-y-auto → Page content with max-w-7xl centering
```

Navigation items are role-filtered and grouped (Main / Management / System). Active state is detected by matching `location` against `item.href`.

**`notification-bell.tsx`**
Renders a bell icon button with an unread count badge. On click, shows a dropdown with the last 10 notifications, each showing type badge, title, message, and time-ago. Clicking a notification marks it as read.

**`protected-route.tsx`**
Checks `isAuthenticated` and `isLoading` from `useAuth()`. Shows a spinner while loading, redirects to `/login` if unauthenticated, renders children if authenticated. Optionally accepts a `roles` prop to restrict by role.

**`toaster.tsx`**
Renders active toasts from `useToast()` in a fixed top-right stack. Each toast shows title, description, and a dismiss button. Auto-dismisses after 5 seconds.

---

#### `frontend/src/pages/`

| Page                      | Route                | Roles                       | Description                                   |
| ------------------------- | -------------------- | --------------------------- | --------------------------------------------- |
| `landing.tsx`             | `/`                  | Public                      | Full landing page with 9 sections             |
| `login.tsx`               | `/login`             | Public                      | Email/password login + 4 demo account buttons |
| `register.tsx`            | `/register`          | Public                      | Patient self-registration                     |
| `forgot-password.tsx`     | `/forgot-password`   | Public                      | Password reset request                        |
| `dashboard.tsx`           | `/dashboard`         | All                         | Stats, charts, recent activity                |
| `appointments/index.tsx`  | `/appointments`      | All                         | Filterable appointment list                   |
| `appointments/new.tsx`    | `/appointments/new`  | All                         | Book appointment form                         |
| `appointments/[id].tsx`   | `/appointments/:id`  | All                         | Detail + confirm/complete/cancel              |
| `patients/index.tsx`      | `/patients`          | Admin, Doctor, Receptionist | Searchable patient directory                  |
| `patients/new.tsx`        | `/patients/new`      | Admin, Receptionist         | Register patient form                         |
| `patients/[id].tsx`       | `/patients/:id`      | Admin, Doctor, Receptionist | Profile + medical history                     |
| `doctors/index.tsx`       | `/doctors`           | All                         | Doctor card grid with search/filter           |
| `doctors/new.tsx`         | `/doctors/new`       | Admin                       | Create doctor + user account                  |
| `doctors/[id].tsx`        | `/doctors/:id`       | All                         | Profile, stats, booking widget                |
| `departments/index.tsx`   | `/departments`       | All                         | Department list with CRUD (admin)             |
| `prescriptions/index.tsx` | `/prescriptions`     | All                         | Prescription list                             |
| `prescriptions/new.tsx`   | `/prescriptions/new` | Doctor, Admin               | Create prescription                           |
| `prescriptions/[id].tsx`  | `/prescriptions/:id` | All                         | Prescription detail                           |
| `bills/index.tsx`         | `/bills`             | All                         | Invoice list                                  |
| `bills/new.tsx`           | `/bills/new`         | Admin, Receptionist         | Create invoice                                |
| `bills/[id].tsx`          | `/bills/:id`         | All                         | Invoice detail + mark paid                    |
| `queue.tsx`               | `/queue`             | Admin, Doctor, Receptionist | OPD queue management                          |
| `schedule.tsx`            | `/schedule`          | Doctor, Admin               | Doctor schedule/availability                  |
| `medical-records.tsx`     | `/medical-records`   | Admin, Doctor, Patient      | Medical record viewer                         |
| `receptionists.tsx`       | `/receptionists`     | Admin                       | Receptionist user management                  |
| `reports.tsx`             | `/reports`           | Admin                       | Revenue/appointment/patient/doctor reports    |
| `audit-log.tsx`           | `/audit-log`         | Admin                       | System activity log                           |
| `hospital-settings.tsx`   | `/hospital-settings` | Admin                       | Hospital configuration                        |
| `profile.tsx`             | `/profile`           | All                         | Edit own profile                              |
| `settings.tsx`            | `/settings`          | All                         | Account settings                              |
| `not-found.tsx`           | `*`                  | Public                      | 404 page                                      |

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
users (1) ─────────── (1) doctors ──── (M) availability_slots
  │                        │
  │                        │
  └─── (1) patients        └──── (M) appointments ──── (M) prescriptions
              │                         │
              │                         └──── (1) bills
              └── (M) medical_records

departments (1) ──── (M) doctors

activity_log (standalone — written by all route handlers)
hospital_settings (singleton — one row)
```

### Table Definitions

#### `users`

| Column               | Type                      | Notes                                              |
| -------------------- | ------------------------- | -------------------------------------------------- |
| `id`                 | serial PK                 | Auto-increment                                     |
| `email`              | text UNIQUE NOT NULL      | Lowercased on insert                               |
| `password_hash`      | text NOT NULL             | bcrypt 10 rounds                                   |
| `first_name`         | text NOT NULL             |                                                    |
| `last_name`          | text NOT NULL             |                                                    |
| `role`               | enum NOT NULL             | `admin` \| `doctor` \| `patient` \| `receptionist` |
| `phone`              | text NULL                 |                                                    |
| `avatar_url`         | text NULL                 |                                                    |
| `is_active`          | boolean DEFAULT true      | Inactive users cannot login                        |
| `reset_token`        | text NULL                 | Password reset token                               |
| `reset_token_expiry` | timestamptz NULL          | 1-hour expiry                                      |
| `created_at`         | timestamptz DEFAULT now() |                                                    |
| `updated_at`         | timestamptz               | Auto-updated                                       |

#### `departments`

| Column           | Type          | Notes                                      |
| ---------------- | ------------- | ------------------------------------------ |
| `id`             | serial PK     |                                            |
| `name`           | text NOT NULL |                                            |
| `description`    | text NULL     |                                            |
| `head_doctor_id` | integer NULL  | FK → doctors.id (not enforced at DB level) |
| `created_at`     | timestamptz   |                                            |
| `updated_at`     | timestamptz   |                                            |

#### `doctors`

| Column                                | Type                      | Notes                        |
| ------------------------------------- | ------------------------- | ---------------------------- |
| `id`                                  | serial PK                 |                              |
| `user_id`                             | integer NOT NULL          | FK → users.id                |
| `department_id`                       | integer NULL              | FK → departments.id          |
| `specialization`                      | text NOT NULL             |                              |
| `sub_specialization`                  | text NULL                 |                              |
| `qualifications`                      | text NULL                 | e.g., "MBBS, MD"             |
| `license_number`                      | text NULL                 |                              |
| `consultation_fee`                    | numeric(10,2) DEFAULT 100 |                              |
| `video_consultation_fee`              | numeric(10,2) NULL        |                              |
| `emergency_consultation_fee`          | numeric(10,2) NULL        |                              |
| `follow_up_fee`                       | numeric(10,2) NULL        |                              |
| `years_of_experience`                 | integer NULL              |                              |
| `bio`                                 | text NULL                 |                              |
| `services`                            | text NULL                 | Comma-separated or free text |
| `address`, `city`, `state`, `pincode` | text NULL                 |                              |
| `gender`                              | text NULL                 |                              |
| `languages`                           | text NULL                 |                              |
| `is_available`                        | boolean DEFAULT true      |                              |
| `created_at`, `updated_at`            | timestamptz               |                              |

#### `availability_slots`

| Column        | Type                 | Notes                |
| ------------- | -------------------- | -------------------- |
| `id`          | serial PK            |                      |
| `doctor_id`   | integer NOT NULL     | FK → doctors.id      |
| `day_of_week` | integer NOT NULL     | 0=Sunday, 6=Saturday |
| `start_time`  | text NOT NULL        | "HH:MM" format       |
| `end_time`    | text NOT NULL        | "HH:MM" format       |
| `is_active`   | boolean DEFAULT true |                      |
| `created_at`  | timestamptz          |                      |

#### `patients`

| Column                     | Type             | Notes           |
| -------------------------- | ---------------- | --------------- |
| `id`                       | serial PK        |                 |
| `user_id`                  | integer NOT NULL | FK → users.id   |
| `date_of_birth`            | text NULL        | ISO date string |
| `gender`                   | text NULL        |                 |
| `blood_group`              | text NULL        | e.g., "O+"      |
| `allergies`                | text NULL        |                 |
| `address`                  | text NULL        |                 |
| `emergency_contact_name`   | text NULL        |                 |
| `emergency_contact_phone`  | text NULL        |                 |
| `insurance_provider`       | text NULL        |                 |
| `insurance_number`         | text NULL        |                 |
| `created_at`, `updated_at` | timestamptz      |                 |

#### `medical_records`

| Column       | Type             | Notes            |
| ------------ | ---------------- | ---------------- |
| `id`         | serial PK        |                  |
| `patient_id` | integer NOT NULL | FK → patients.id |
| `doctor_id`  | integer NULL     | FK → doctors.id  |
| `diagnosis`  | text NOT NULL    |                  |
| `symptoms`   | text NULL        |                  |
| `treatment`  | text NULL        |                  |
| `notes`      | text NULL        |                  |
| `visit_date` | text NOT NULL    | ISO date string  |
| `created_at` | timestamptz      |                  |

#### `appointments`

| Column                     | Type                   | Notes                       |
| -------------------------- | ---------------------- | --------------------------- |
| `id`                       | serial PK              |                             |
| `patient_id`               | integer NOT NULL       |                             |
| `doctor_id`                | integer NOT NULL       |                             |
| `appointment_date`         | text NOT NULL          | "YYYY-MM-DD"                |
| `appointment_time`         | text NOT NULL          | "HH:MM"                     |
| `status`                   | enum DEFAULT "pending" | See statuses below          |
| `reason`                   | text NULL              |                             |
| `notes`                    | text NULL              |                             |
| `token_number`             | integer NULL           | Assigned at check-in        |
| `chief_complaint`          | text NULL              | Entered during consultation |
| `consultation_notes`       | text NULL              | Doctor's notes              |
| `diagnosis`                | text NULL              | Final diagnosis             |
| `follow_up_date`           | text NULL              |                             |
| `created_at`, `updated_at` | timestamptz            |                             |

**Appointment statuses:** `pending → confirmed → checked_in → waiting → in_consultation → completed` (also: `cancelled`, `no_show`, `rescheduled`)

#### `prescriptions`

| Column                     | Type             | Notes             |
| -------------------------- | ---------------- | ----------------- |
| `id`                       | serial PK        |                   |
| `patient_id`               | integer NOT NULL |                   |
| `doctor_id`                | integer NOT NULL |                   |
| `appointment_id`           | integer NULL     | Optional link     |
| `medications`              | text NOT NULL    | Free text or JSON |
| `dosage_instructions`      | text NULL        |                   |
| `diagnosis`                | text NULL        |                   |
| `valid_until`              | text NULL        | ISO date          |
| `notes`                    | text NULL        |                   |
| `created_at`, `updated_at` | timestamptz      |                   |

#### `bills`

| Column                     | Type                    | Notes                                                                |
| -------------------------- | ----------------------- | -------------------------------------------------------------------- |
| `id`                       | serial PK               |                                                                      |
| `patient_id`               | integer NOT NULL        |                                                                      |
| `appointment_id`           | integer NULL            | Optional link                                                        |
| `amount`                   | numeric(10,2) NOT NULL  | Base amount                                                          |
| `tax_amount`               | numeric(10,2) DEFAULT 0 |                                                                      |
| `discount_amount`          | numeric(10,2) DEFAULT 0 |                                                                      |
| `total_amount`             | numeric(10,2) NOT NULL  | amount + tax - discount                                              |
| `status`                   | enum DEFAULT "pending"  | `pending` \| `paid` \| `partially_paid` \| `cancelled` \| `refunded` |
| `payment_method`           | text NULL               | e.g., "cash", "card"                                                 |
| `invoice_number`           | text UNIQUE NOT NULL    | Auto-generated: `INV-{timestamp}-{random}`                           |
| `description`              | text NULL               |                                                                      |
| `paid_at`                  | timestamptz NULL        | Set when status becomes "paid"                                       |
| `created_at`, `updated_at` | timestamptz             |                                                                      |

#### `activity_log`

| Column        | Type          | Notes                                            |
| ------------- | ------------- | ------------------------------------------------ |
| `id`          | serial PK     |                                                  |
| `type`        | text NOT NULL | e.g., "appointment_booked", "patient_registered" |
| `description` | text NOT NULL | Human-readable description                       |
| `actor_name`  | text NULL     | Email of user who performed the action           |
| `created_at`  | timestamptz   |                                                  |

#### `hospital_settings`

Single-row table with hospital configuration (name, address, contact, working hours, tax rate, currency, logo URL).

---

## 🔌 API Reference

### Base URL

- **Local:** `http://localhost:5000/api`
- **Production:** `https://hospital-backend-p20c.onrender.com/api`

### Authentication

All protected endpoints require: `Authorization: Bearer <jwt_token>`

### Endpoints Summary

#### Health

```
GET  /healthz                   → { status: "ok" }
```

#### Auth

```
POST /auth/login                → { token, user }
POST /auth/register             → { token, user }
GET  /auth/me                   → User (requires auth)
POST /auth/logout               → { message }
POST /auth/forgot-password      → { message, resetToken }
POST /auth/reset-password       → { message }
```

#### Users

```
GET    /users?role&search&page&limit   → { data: User[], total, page, limit }
POST   /users                          → User  (admin)
GET    /users/:id                      → User
PATCH  /users/:id                      → User
DELETE /users/:id                      → 204  (admin)
```

#### Departments

```
GET    /departments             → Department[]
POST   /departments             → Department  (admin)
GET    /departments/:id         → Department
PATCH  /departments/:id         → Department  (admin)
DELETE /departments/:id         → 204         (admin)
```

#### Doctors

```
GET    /doctors?departmentId&search&available   → Doctor[]
POST   /doctors                                 → Doctor  (admin)
POST   /doctors/register                        → Doctor  (admin, creates user+doctor)
GET    /doctors/:id                             → Doctor
PATCH  /doctors/:id                             → Doctor  (admin/doctor)
DELETE /doctors/:id                             → 204     (admin)
GET    /doctors/:id/availability               → AvailabilitySlot[]
POST   /doctors/:id/availability               → AvailabilitySlot[]  (admin/doctor)
GET    /doctors/:id/patients                   → Patient[]
GET    /doctors/:id/stats                      → DoctorStats
```

#### Patients

```
GET    /patients/me                                    → Patient (patient role only)
GET    /patients?search&page&limit                     → { data, total, page, limit }
POST   /patients                                       → Patient
GET    /patients/:id                                   → Patient
PATCH  /patients/:id                                   → Patient
DELETE /patients/:id                                   → 204  (admin/receptionist)
GET    /patients/:id/medical-history                   → MedicalRecord[]
POST   /patients/:id/medical-history                   → MedicalRecord  (admin/doctor)
```

#### Appointments

```
GET    /appointments?patientId&doctorId&status&date&page&limit   → { data, total, page, limit }
POST   /appointments                                             → Appointment
GET    /appointments/:id                                         → Appointment
PATCH  /appointments/:id                                         → Appointment
DELETE /appointments/:id                                         → Appointment (sets cancelled)
PATCH  /appointments/:id/reschedule                              → Appointment
PATCH  /appointments/:id/checkin                                 → Appointment (receptionist/admin)
PATCH  /appointments/:id/queue-status                            → Appointment
PATCH  /appointments/:id/consult                                 → Appointment (doctor/admin)
```

#### Prescriptions

```
GET    /prescriptions?patientId&doctorId&appointmentId   → { data, total }
POST   /prescriptions                                    → Prescription  (admin/doctor)
GET    /prescriptions/:id                                → Prescription
PATCH  /prescriptions/:id                                → Prescription  (admin/doctor)
```

#### Bills

```
GET    /bills?patientId&status&page&limit   → { data, total, page, limit }
POST   /bills                               → Bill  (admin/receptionist)
GET    /bills/:id                           → Bill
PATCH  /bills/:id                           → Bill  (admin/receptionist)
```

#### Dashboard

```
GET    /dashboard/stats                              → DashboardStats
GET    /dashboard/appointment-analytics?months       → MonthlyAnalytics[]
GET    /dashboard/revenue-analytics?months           → MonthlyRevenue[]
GET    /dashboard/recent-activity                    → ActivityItem[]
GET    /dashboard/audit-log?page&limit&type          → { data, total, page, limit, totalPages }
GET    /dashboard/department-stats                   → DepartmentStat[]
```

#### Queue

```
GET    /queue?date&doctorId   → Appointment[]
```

#### Reports

```
GET    /reports/revenue?months       → { summary, monthly[] }
GET    /reports/appointments?months  → { summary, monthly[] }
GET    /reports/patients?months      → { summary, monthly[] }
GET    /reports/doctors              → DoctorReport[]
```

#### Hospital Settings

```
GET    /hospital-settings       → HospitalSettings
PATCH  /hospital-settings       → HospitalSettings  (admin)
```

#### Notifications (MongoDB)

```
GET    /notifications                    → Notification[]
GET    /notifications/unread-count       → { count }
PATCH  /notifications/:id/read           → { ok }
PATCH  /notifications/read-all           → { ok }
DELETE /notifications/:id                → { ok }
```

---

## 🔐 Authentication Flow

```
1. LOGIN
   ─────
   User submits email + password
        │
        ▼
   POST /api/auth/login
        │
        ├── Find user by email in database
        ├── Check isActive = true
        ├── bcrypt.compare(password, passwordHash)
        ├── signToken({ userId, role, email }) → JWT (7 days)
        └── Return { token, user (without passwordHash) }
        │
        ▼
   Frontend: localStorage.setItem("hms_token", token)
   AuthContext: setToken + setUser
   TanStack Query: invalidateQueries (refetch all data as new user)
   wouter: navigate to /dashboard

2. AUTHENTICATED REQUEST
   ──────────────────────
   customFetch reads localStorage.getItem("hms_token")
   Attaches → Authorization: Bearer <token>
        │
        ▼
   requireAuth middleware on backend
   jwt.verify(token, SESSION_SECRET)
        ├── Valid → req.user = { userId, role, email } → next()
        └── Invalid/Expired → 401 Unauthorized

3. SESSION RESTORE (page refresh)
   ────────────────────────────────
   AuthProvider mounts
   token = localStorage.getItem("hms_token")  ← if exists
        │
        ▼
   useGetMe() → GET /api/auth/me (with token)
        ├── Valid: setUser(meData) → app renders
        └── Invalid/401: clear token → redirect to /login

4. LOGOUT
   ───────
   logout() called
   localStorage.removeItem("hms_token")
   setToken(null), setUser(null)
   queryClient.clear() → removes all cached data
   wouter: navigate to /login
```

---

## 👥 User Roles & Permissions

### Role Matrix

| Feature                     | Admin   | Doctor       | Receptionist | Patient     |
| --------------------------- | ------- | ------------ | ------------ | ----------- |
| Dashboard                   | ✅ Full | ✅ Own stats | ✅ Basic     | ✅ Basic    |
| All Patients                | ✅      | ✅ Own       | ✅           | ❌ Own only |
| All Doctors                 | ✅ CRUD | ✅ View      | ✅ View      | ✅ View     |
| All Appointments            | ✅      | ✅ Own       | ✅ All       | ✅ Own      |
| Book Appointment            | ✅      | ✅           | ✅           | ✅          |
| Complete/Cancel Appointment | ✅      | ✅           | ✅           | ❌          |
| Prescriptions               | ✅ CRUD | ✅ CRUD      | ✅ View      | ✅ Own      |
| Bills                       | ✅ CRUD | ✅ View      | ✅ CRUD      | ✅ Own      |
| Queue Management            | ✅      | ✅           | ✅           | ❌          |
| Departments                 | ✅ CRUD | ✅ View      | ✅ View      | ✅ View     |
| Reports                     | ✅      | ❌           | ❌           | ❌          |
| Audit Log                   | ✅      | ❌           | ❌           | ❌          |
| Hospital Settings           | ✅      | ❌           | ❌           | ❌          |
| User Management             | ✅      | ❌           | ❌           | ❌          |
| Medical Records             | ✅      | ✅ Write     | ❌           | ✅ Own      |

### Role-Specific Navigation (sidebar groups)

**Admin** (Management + System groups)

- Patients, Doctors, Receptionists, Departments, Appointments, Billing, Prescriptions, Queue
- Reports, Hospital Settings, Audit Log, Settings

**Doctor** (Main group)

- Appointments, My Schedule, My Patients, Prescriptions

**Receptionist** (Main group)

- Appointments, Patients, Queue, Bills

**Patient** (Main group)

- Find Doctors, My Appointments, Medical Records, Prescriptions, My Bills

---

## 🗺 Frontend Routing

All routes are defined in `src/App.tsx` using `wouter`'s `<Switch>` and `<Route>` components.

### Public Routes (no auth required)

| Path               | Component      | Purpose             |
| ------------------ | -------------- | ------------------- |
| `/`                | LandingPage    | Public landing page |
| `/login`           | Login          | Login form          |
| `/register`        | Register       | Self-registration   |
| `/forgot-password` | ForgotPassword | Reset request       |

### Protected Routes (require authentication)

| Path                 | Component               |
| -------------------- | ----------------------- |
| `/dashboard`         | Dashboard               |
| `/appointments`      | Appointments list       |
| `/appointments/new`  | New appointment         |
| `/appointments/:id`  | Appointment detail      |
| `/patients`          | Patients list           |
| `/patients/new`      | New patient             |
| `/patients/:id`      | Patient detail          |
| `/doctors`           | Doctor directory        |
| `/doctors/new`       | New doctor              |
| `/doctors/:id`       | Doctor profile          |
| `/departments`       | Departments             |
| `/prescriptions`     | Prescriptions list      |
| `/prescriptions/new` | New prescription        |
| `/prescriptions/:id` | Prescription detail     |
| `/bills`             | Bills list              |
| `/bills/new`         | New bill                |
| `/bills/:id`         | Bill detail             |
| `/queue`             | Queue management        |
| `/schedule`          | Doctor schedule         |
| `/medical-records`   | Medical records         |
| `/receptionists`     | Receptionist management |
| `/reports`           | Analytics reports       |
| `/audit-log`         | Audit trail             |
| `/hospital-settings` | Hospital config         |
| `/profile`           | User profile            |
| `/settings`          | Account settings        |
| `*`                  | NotFound (404)          |

---

## 📡 Real-time Features (Socket.IO)

The Socket.IO server runs on the same HTTP server as Express, accessible at `/api/socket.io`.

### Events Emitted by Backend

| Event                         | Trigger                           | Payload                  |
| ----------------------------- | --------------------------------- | ------------------------ |
| `appointment:created`         | New appointment booked            | Full appointment object  |
| `appointment:updated`         | Status change, reschedule, cancel | Full appointment object  |
| `queue:updated`               | Check-in, queue status change     | Full appointment object  |
| `bill:created`                | New invoice created               | Full bill object         |
| `bill:updated`                | Payment status change             | Full bill object         |
| `prescription:created`        | New prescription                  | Full prescription object |
| `prescription:updated`        | Prescription edited               | Full prescription object |
| `doctor:created`              | New doctor registered             | Doctor object            |
| `doctor:updated`              | Doctor profile updated            | Doctor object            |
| `doctor:deleted`              | Doctor removed                    | `{ id }`                 |
| `doctor:availability_updated` | Schedule changed                  | `{ doctorId, slots }`    |
| `patient:created`             | New patient registered            | Patient object           |
| `notification:{userId}`       | New notification for user         | Notification object      |

### Frontend Usage

The `useSocketEvent()` hook (from `lib/socket.tsx`) subscribes to events:

```tsx
// Example: appointments list auto-refreshes when any appointment changes
const queryClient = useQueryClient();
const invalidate = useCallback(() => {
  queryClient.invalidateQueries({ queryKey: ["listAppointments"] });
}, [queryClient]);

useSocketEvent("appointment:created", invalidate);
useSocketEvent("appointment:updated", invalidate);
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable                | Required | Description                                                                                                   |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_DATABASE_URL` | **YES**  | Supabase PostgreSQL connection string (URI format). Get from: Project Settings → Database → Connection string |
| `SESSION_SECRET`        | **YES**  | JWT signing secret. Use a long random string in production.                                                   |
| `PORT`                  | No       | Server port. Default: `5000`                                                                                  |
| `NODE_ENV`              | No       | `development` or `production`. Affects log formatting.                                                        |
| `MONGODB_URI`           | No       | MongoDB connection string for notifications/files. App works without it.                                      |

**Getting your Supabase connection string:**

1. Go to [supabase.com](https://supabase.com) → your project
2. Navigate to **Project Settings → Database**
3. Select the **Connection string** tab, choose **URI**
4. For production/serverless → use **Transaction pooler** (port 6543)
5. For local development → use **Session pooler** or **Direct** (port 5432)
6. Replace `[YOUR-PASSWORD]` with your actual database password

**Example `.env`:**

```env
SUPABASE_DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:MyPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SESSION_SECRET=my-very-long-random-secret-string-change-in-production
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hms
```

### Frontend

No `.env` file is required for the frontend. The Vite dev server proxies all `/api` requests to `http://localhost:5000` automatically (configured in `vite.config.ts`).

For production deployment on Vercel, set:

| Variable       | Value      | Description                                                                                |
| -------------- | ---------- | ------------------------------------------------------------------------------------------ |
| `VITE_API_URL` | (optional) | Not currently used — Vite proxy handles this in dev, and Vercel rewrites handle production |

---

## 💻 Local Development Setup

### Prerequisites

- **Node.js** v20 or higher (`node --version`)
- **npm** v9 or higher (`npm --version`)
- A **Supabase** project (free tier works fine)

### Step 1 — Clone / Extract the project

```bash
git clone <repository-url> Hospital-Hub
cd Hospital-Hub
```

### Step 2 — Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database → Connection string → URI**
3. Copy the connection string (port 5432 for local dev is fine)

### Step 3 — Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set `SUPABASE_DATABASE_URL` and `SESSION_SECRET`.

### Step 4 — Install backend dependencies

```bash
cd backend
npm install
```

### Step 5 — Push database schema to Supabase

```bash
cd backend
npx drizzle-kit push
```

This creates all tables in your Supabase database. You'll see confirmation of each table created.

### Step 6 — Seed demo accounts

```bash
cd backend
npm run seed
```

Expected output:

```
Created user: admin@hospital.com
Created doctor profile for user #1
Created user: dr.carter@hospital.com
Created doctor profile for user #2
Created user: john.doe@email.com
Created patient profile for user #3
Created user: reception@hospital.com
Seeding complete.
```

### Step 7 — Build and start the backend

```bash
cd backend
npm run dev:build
```

You should see: `Server listening on port 5000 with Socket.IO`

### Step 8 — Install frontend dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### Step 9 — Start the frontend dev server

```bash
cd frontend
npm run dev
```

Output: `Local: http://localhost:3000/`

### Step 10 — Open the application

Navigate to **http://localhost:3000** in your browser.

You'll see the landing page. Click **Sign In** or use the demo account buttons.

---

## 🔨 Build Instructions

### Backend

```bash
cd backend
npm run build
```

- Output: `backend/dist/index.mjs` (single bundled file, ~4MB with source maps)
- Also outputs pino worker files to `dist/`

To test the production build locally:

```bash
npm run start
```

### Frontend

```bash
cd frontend
npm run build
```

- Output: `frontend/dist/` folder
  - `index.html` — SPA shell
  - `assets/index-[hash].css` — ~64KB compiled CSS
  - `assets/index-[hash].js` — ~1.1MB bundled JavaScript

To preview the production build:

```bash
npm run preview
# Opens at http://localhost:4173
```

---

## 🚀 Deployment Guide

### Frontend — Vercel

**Option A: Via Vercel CLI**

```bash
npm install -g vercel
cd frontend
npm run build
vercel --prod
```

**Option B: Via Vercel Dashboard**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Set the following in project settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

**Required Vercel `vercel.json` (in frontend root):**

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://hospital-backend-p20c.onrender.com/api/$1"
    },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures:

- SPA routing works (all non-API paths serve `index.html`)
- API calls are proxied to the Render backend

**No environment variables needed** in Vercel for the frontend.

---

### Backend — Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repository
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Node Version:** 20
5. Add **Environment Variables:**
   - `SUPABASE_DATABASE_URL` = your Supabase connection string (use **Transaction pooler**, port 6543)
   - `SESSION_SECRET` = your JWT secret
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render's default)
   - `MONGODB_URI` = (optional)

6. After deploy, run the seed script once:
   ```bash
   # In Render dashboard → Shell tab
   node dist/seed.mjs
   ```

> ⚠️ **Render Free Tier:** The service spins down after 15 minutes of inactivity. The first request after spin-down takes 30–60 seconds. Consider upgrading to the Starter plan for always-on service.

---

### Database — Supabase

No additional deployment steps. After running `npx drizzle-kit push` locally (pointing at your production Supabase instance), all tables exist in the cloud.

**Connection string types:**
| Mode | Port | When to use |
|---|---|---|
| Direct | 5432 | Local development, long-lived connections |
| Session pooler | 5432 | General server use |
| Transaction pooler | 6543 | **Recommended for Render/Vercel** (serverless-compatible) |

---

## 🔧 Troubleshooting

### Backend won't start

**Problem:** `SUPABASE_DATABASE_URL must be set`
**Fix:** Create `backend/.env` from `.env.example` and fill in the connection string.

**Problem:** `SUPABASE_DATABASE_URL still contains placeholder password`
**Fix:** Replace `[YOUR-PASSWORD]` in the connection string with your actual Supabase database password.

**Problem:** `Connection refused` or `SSL SYSCALL error`
**Fix:** Ensure you're using the correct Supabase connection string with SSL. The URL from the Supabase dashboard already includes the correct host — do not modify the hostname.

**Problem:** `relation "users" does not exist`
**Fix:** Run `npx drizzle-kit push` from the `backend/` directory to create all tables.

---

### Frontend issues

**Problem:** Blank screen after login
**Fix:** Check that the backend is running on port 5000. The Vite dev server proxy at `/api` forwards to `http://localhost:5000`.

**Problem:** `Network Error` on all API calls
**Fix:** Ensure `backend/.env` has `PORT=5000` and the backend is running. Alternatively, check that `vite.config.ts` proxy target matches your backend port.

**Problem:** Demo accounts don't work
**Fix:** Run `npm run seed` from the `backend/` directory. This creates/resets all 4 demo accounts with password `password123`.

**Problem:** CSS not loading / UI broken
**Fix:** Ensure you're running `npm run dev` (not just opening `index.html`). Tailwind v4 requires the Vite plugin to compile.

---

### Production issues

**Problem:** CORS errors in production
**Fix:** The backend uses `cors()` with all origins. If you've restricted origins, add your Vercel URL to the allowed list in `backend/src/app.ts`.

**Problem:** Socket.IO not connecting in production
**Fix:** Ensure your Vercel `vercel.json` proxies `/api/socket.io` correctly. Socket.IO upgrades to WebSocket — some proxy configurations block this. Use `transports: ["polling"]` as fallback.

**Problem:** Render backend timeout on first request
**Fix:** This is Render's free-tier spin-down behaviour. The first request after 15 minutes of inactivity takes 30–60 seconds. Expected behaviour — or upgrade to Render Starter plan.

---

## 🚀 Future Enhancements

### Phase 2 — Clinical Features

- [ ] Electronic Health Records (EHR) with structured SOAP notes
- [ ] Digital prescription with drug interaction checker
- [ ] Lab/radiology order management with result upload
- [ ] DICOM viewer integration for medical imaging
- [ ] Vaccination records and immunization tracking

### Phase 3 — Patient Experience

- [ ] Patient mobile app (React Native)
- [ ] Video telemedicine consultations (WebRTC)
- [ ] SMS/WhatsApp appointment reminders
- [ ] Online payment gateway (Razorpay / Stripe)
- [ ] Patient satisfaction surveys and ratings

### Phase 4 — Advanced Administration

- [ ] Insurance claim automation and ePayer integration
- [ ] Bed management and ward allocation system
- [ ] Operation theatre scheduling
- [ ] Inventory and pharmacy stock management
- [ ] Staff payroll and HR management

### Phase 5 — AI & Analytics

- [ ] AI-powered appointment demand forecasting
- [ ] Predictive analytics for readmission risk
- [ ] Natural language search across patient records
- [ ] Automated ICD-10 coding suggestions
- [ ] Revenue cycle optimization recommendations

### Infrastructure & DevOps

- [ ] Docker Compose for local full-stack development
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated database migrations (Drizzle Kit)
- [ ] End-to-end tests (Playwright)
- [ ] Unit tests for all route handlers (Vitest)
- [ ] API rate limiting and DDoS protection
- [ ] Redis caching for frequently-accessed data
- [ ] Multi-tenant architecture for multiple hospitals

---

## 📞 Contact & Support

**Project Author:** Ambar Ubale — Software Engineer

**Live Application:**

- Frontend: https://hospital-management-system-seven-kappa.vercel.app/
- Backend: https://hospital-backend-p20c.onrender.com

---

<div align="center">

Made with ❤️ by **Ambar Ubale**

_Full-stack Hospital Management System — Built with React 19, Express 5, Drizzle ORM & Supabase_

</div>
README_EOF
echo "README.md written — $(wc -l < /home/claude/Hospital-Hub-Supabase/Hospital-Hub/README.md) lines"
Output
