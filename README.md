<div align="center">

# 🏥 MediCore HMS — Hospital Management System

### Full-stack, production-ready system built with React 19, Express 5, Drizzle ORM, Supabase PostgreSQL & MongoDB

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://hospital-management-system-seven-kappa.vercel.app/)
[![Backend API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://hospital-backend-p20c.onrender.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

_Designed & Built by **Ambar Ubale** — Software Engineer_

</div>

---

## 📋 Overview

**MediCore HMS** digitises every core hospital operation — from appointment scheduling and patient records to prescriptions, billing, queue management and analytics. It replaces fragmented workflows with a single, secure, role-based platform.

**Live URLs**

- Frontend: [hospital-management-system-seven-kappa.vercel.app](https://hospital-management-system-seven-kappa.vercel.app/)
- Backend: [hospital-backend-p20c.onrender.com](https://hospital-backend-p20c.onrender.com)

---

## 📸 Screenshots

| Dashboard                               | Appointments                                  | Doctor Profile                                    |
| --------------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| ![Dashboard](screenshots/dashboard.png) | ![Appointments](screenshots/appointments.png) | ![Doctor Profile](screenshots/doctor-profile.png) |

> _Add your own screenshots inside the `screenshots/` folder and update paths above._

---

## 🔐 Demo Accounts

All use password: **`password123`**

| Role             | Email                    | Access Level                        |
| ---------------- | ------------------------ | ----------------------------------- |
| **Admin**        | `admin@hospital.com`     | Full system access                  |
| **Doctor**       | `dr.carter@hospital.com` | Appointments, patients, prescribing |
| **Receptionist** | `reception@hospital.com` | Appointments, queue, billing        |
| **Patient**      | `john.doe@email.com`     | Own records, appointments, bills    |

---

## ✨ Key Features

### 📅 Appointments

- Online booking with doctor, date & time selection
- Lifecycle: `pending → confirmed → checked_in → in_consultation → completed`
- Reschedule / cancel with real-time Socket.IO updates

### 👨‍⚕️ Doctor & Patient Management

- Full profiles, specialisation, fees, availability slots
- Patient medical history (diagnosis, symptoms, treatment)
- Emergency contacts & insurance info

### 💊 Prescriptions & 💰 Billing

- Prescriptions linked to appointments, with medications and dosage
- Invoices with tax, discount, auto-generated invoice number
- Status flow: `pending → paid / partially_paid / cancelled / refunded`

### 🔢 Queue & Real-time Notifications

- Token-based OPD queue with status push via Socket.IO
- MongoDB-backed notification bell with unread count
- Real-time events: appointments, bills, queue, prescriptions, doctors

### 📊 Analytics & Admin

- Dashboard with live stats, appointment/revenue charts (Recharts)
- Revenue, appointment, patient, doctor performance reports
- Audit log, hospital settings, user & role management

### 🔔 Additional

- Role-based access (Admin, Doctor, Receptionist, Patient)
- JWT authentication (7-day tokens, bcrypt)
- Beautiful, responsive UI (Tailwind CSS, Framer Motion, shadcn/ui)

---

## 🛠 Tech Stack

### Frontend

| Technology           | Purpose                    |
| -------------------- | -------------------------- |
| React 19, Vite       | UI framework & build tool  |
| TypeScript           | Type safety                |
| Tailwind CSS         | Styling                    |
| Framer Motion        | Animations                 |
| TanStack Query       | Server state & caching     |
| wouter               | Client-side routing        |
| react-hook-form, zod | Form handling & validation |
| Socket.IO client     | Real-time communication    |
| Recharts             | Charts & analytics         |

### Backend

| Technology          | Purpose                       |
| ------------------- | ----------------------------- |
| Node.js, Express 5  | HTTP server                   |
| TypeScript          | Type safety                   |
| Drizzle ORM         | Type-safe SQL queries         |
| Supabase PostgreSQL | Primary database              |
| MongoDB (optional)  | Notifications & file metadata |
| Socket.IO           | Real-time events              |
| JWT, bcryptjs       | Auth & password hashing       |

### Infrastructure

| Service  | Purpose             |
| -------- | ------------------- |
| Vercel   | Frontend hosting    |
| Render   | Backend API hosting |
| Supabase | Managed PostgreSQL  |

---

## 🏗 System Architecture

┌──────────────────────────────────────────────────┐
│ Client (Browser) │
│ React 19 SPA (Vite + Tailwind) │
│ ┌──────────────┐ ┌─────────────┐ ┌─────────┐ │
│ │ AuthContext │ │ SocketCtx │ │ NotifCtx│ │
│ └──────┬───────┘ └──────┬──────┘ └────┬────┘ │
│ │ │ │ │
│ ┌──────┴─────────────────┴──────────────┴───┐ │
│ │ API Client (custom-fetch, TanStack Query) │ │
│ │ All requests → Bearer token in header │ │
│ └───────────────────┬───────────────────────┘ │
└──────────────────────┼───────────────────────────┘
│
┌──────────┴──────────┐
│ HTTP/REST │ WebSocket (Socket.IO)
▼ ▼
┌──────────────────────────────────────────────────┐
│ Express 5 API Server (Render) │
│ ┌────────────────────────────────────────────┐ │
│ │ Middleware: pino-http, cors, json, │ │
│ │ requireAuth, requireRole │ │
│ └────────────────────────────────────────────┘ │
│ │
│ Routes (15 routers): │
│ auth/users/departments/doctors/patients/ │
│ appointments/prescriptions/bills/dashboard/ │
│ queue/reports/notifications/files/settings │
│ │
│ Socket.IO emits events on data changes │
└─────┬───────────────────────────────┬────────────┘
│ Drizzle ORM │ MongoDB driver
▼ ▼
┌───────────────┐ ┌────────────────────────┐
│ Supabase │ │ MongoDB (optional) │
│ PostgreSQL │ │ notifications, files │
│ (10 tables) │ └────────────────────────┘
└───────────────┘

text

### Request Flow

1. **Authentication:** Login → JWT stored in `localStorage` → auto-attached on every request.
2. **Page load:** AuthProvider checks token → validates via `/auth/me` → renders protected routes.
3. **Mutations:** Form validated with react-hook-form/zod → POST/PATCH via TanStack Query mutation → backend creates DB record → emits Socket.IO event.
4. **Real‑time update:** Frontend Socket.IO listener invalidates relevant TanStack Query caches → UI re-fetches fresh data instantly.

---

## 📁 Project Folder Structure

Hospital-Management-System/
│
├── backend/
│ ├── src/
│ │ ├── app.ts # Express app setup (middleware stack)
│ │ ├── index.ts # Server entry (HTTP + Socket.IO)
│ │ ├── db.ts # Supabase PG connection (Drizzle ORM)
│ │ ├── seed.ts # Demo data seeder
│ │ ├── routes/ # API endpoints (15 routers)
│ │ ├── middlewares/auth.ts # JWT verification & RBAC
│ │ ├── schema/ # Drizzle table definitions (9 tables)
│ │ └── lib/ # Logger, MongoDB connection, Socket.IO
│ ├── build.mjs / build-seed.mjs # esbuild bundlers
│ ├── drizzle.config.ts # Drizzle Kit config
│ └── package.json # Backend dependencies & scripts
│
└── frontend/
├── public/ # Static assets (favicon, logo)
├── src/
│ ├── main.tsx # React 19 entry point
│ ├── App.tsx # Root component & wouter routes
│ ├── index.css # Tailwind v4 + design tokens
│ ├── api/ # Auto-generated TanStack Query hooks + fetch wrapper
│ ├── components/ # Shared UI (shadcn/ui, app-layout, notification-bell)
│ ├── hooks/ # use-mobile, use-toast
│ ├── lib/ # AuthContext, SocketContext, NotificationsContext
│ └── pages/ # All route pages (dashboard, appointments, etc.)
├── vite.config.ts # Vite config + API proxy
└── package.json # Frontend dependencies & scripts

text

---

## 🔐 Authentication Flow

1. Login → `POST /auth/login` → returns JWT (7 days) → stored in `localStorage` as `hms_token`.
2. Every request attaches token in `Authorization` header via custom fetch wrapper.
3. Backend `requireAuth` middleware verifies token and populates `req.user`.
4. Page refresh → `GET /auth/me` restores user session.
5. Logout clears token and query cache.

---

## 💻 Local Development Setup

1. **Clone & install**
   ```bash
   git clone <repo-url> Hospital-Hub
   cd Hospital-Hub/backend && npm install
   cd ../frontend && npm install
   Backend configuration
   Copy .env.example → .env and fill SUPABASE_DATABASE_URL and SESSION_SECRET.
   Optionally provide MONGODB_URI for notifications.
   ```

Push database schema

bash
cd backend
npx drizzle-kit push
Seed demo accounts

bash
npm run seed
Run servers

Backend: cd backend && npm run dev:build (port 5000)

Frontend: cd frontend && npm run dev (port 3000)

Open http://localhost:3000

🚀 Deployment
Frontend → Vercel: Set root to frontend, build npm run build, output dist. Add vercel.json rewrites to proxy /api to Render backend.

Backend → Render: Root backend, build npm install && npm run build, start npm run start. Set env vars and seed once via Shell.

Database: Supabase already cloud-hosted; run drizzle-kit push against production URL.

🔮 Future Enhancements
EHR with structured SOAP notes, lab management, telemedicine, mobile apps, AI analytics, CI/CD pipeline, Docker Compose, E2E tests.

<div align="center">
Made with ❤️ by Ambar Ubale

</div> ```
