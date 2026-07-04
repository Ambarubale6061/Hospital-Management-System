<div align="center">

<img src="https://img.shields.io/badge/MediCore-HMS-0d9488?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek0xNyAxM2gtNHY0aC0ydi00SDd2LTJoNFY3aDJ2NGg0djJ6Ii8+PC9zdmc+" alt="MediCore HMS" />

# MediCore HMS

### Full-Stack Hospital Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-0d9488?style=flat-square&logo=vercel)](https://hospital-management-system-seven-kappa.vercel.app/)
[![API](https://img.shields.io/badge/Backend%20API-Live-46E3B7?style=flat-square&logo=render)](https://hospital-backend-p20c.onrender.com/api/healthz)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Built by [Ambar Ubale](https://github.com/ambarubale) — Software Engineer**

[Live App](https://hospital-management-system-seven-kappa.vercel.app/) · [Backend API](https://hospital-backend-p20c.onrender.com) · [Report Bug](https://github.com/ambarubale/hospital-hub/issues)

</div>

---

## Overview

MediCore HMS is a production-ready, role-based hospital management platform that digitalises patient care, scheduling, billing, and hospital administration in a single unified system.

```
Landing Page → Role-Based Login → Personalised Dashboard → Full HMS
```

---

## Screenshots

> **Note:** To add screenshots, place images in a `/screenshots` folder and update the paths below.

<table>
  <tr>
    <td align="center"><strong>Landing Page</strong></td>
    <td align="center"><strong>Dashboard</strong></td>
    <td align="center"><strong>Appointments</strong></td>
  </tr>
  <tr>
    <td><img src="screenshots/landing.png" alt="Landing Page" width="280" /></td>
    <td><img src="screenshots/dashboard.png" alt="Dashboard" /></td>
    <td><img src="screenshots/appointments.png" alt="Appointments" width="280" /></td>
  </tr>
</table>

> Screenshot 3 — **Appointments page** showing the full appointment management interface with status tracking, patient/doctor details, date/time display, and action controls.

---

## Live Deployment

| Layer        | Platform | URL                                                        |
| ------------ | -------- | ---------------------------------------------------------- |
| **Frontend** | Vercel   | https://hospital-management-system-seven-kappa.vercel.app/ |
| **Backend**  | Render   | https://hospital-backend-p20c.onrender.com                 |
| **Database** | Supabase | Managed PostgreSQL (cloud)                                 |

> The Render free tier spins down after inactivity — first request may take ~30s.

---

## Demo Accounts

All accounts use password: **`password123`**

| Role             | Email                    | Access                                |
| ---------------- | ------------------------ | ------------------------------------- |
| **Admin**        | `admin@hospital.com`     | Full system — all modules             |
| **Doctor**       | `dr.carter@hospital.com` | Appointments, patients, prescriptions |
| **Receptionist** | `reception@hospital.com` | Appointments, queue, billing          |
| **Patient**      | `john.doe@email.com`     | Own records, bookings, bills          |

---

## Features

### By Module

| Module                | Capability                                                             |
| --------------------- | ---------------------------------------------------------------------- |
| **Landing Page**      | Animated hero, services, doctors, testimonials, role-based demo access |
| **Authentication**    | JWT login, bcrypt passwords, role-based routing, password reset        |
| **Dashboard**         | Live stats, Recharts analytics, revenue graphs, activity feed          |
| **Appointments**      | Book, confirm, check-in, complete, cancel, reschedule                  |
| **Patients**          | Profiles, medical history, emergency contacts, insurance               |
| **Doctors**           | Profiles, availability slots, stats (patients, revenue, rating)        |
| **Prescriptions**     | Create/manage prescriptions linked to appointments                     |
| **Billing**           | Auto-invoicing, tax/discount, payment status tracking                  |
| **Queue**             | Token-based OPD queue with real-time status updates                    |
| **Departments**       | CRUD departments with head doctor assignment                           |
| **Reports**           | Revenue, appointments, patients, doctor performance                    |
| **Audit Log**         | Full activity trail of all system events                               |
| **Notifications**     | Real-time push via Socket.IO, per-user bell with unread count          |
| **Hospital Settings** | Name, address, working hours, tax rate, currency                       |

---

## Tech Stack

### Frontend

|     | Technology            | Purpose                |
| --- | --------------------- | ---------------------- |
| ⚛️  | React 19 + TypeScript | UI framework           |
| ⚡  | Vite 7                | Build tool             |
| 🎨  | Tailwind CSS v4       | Styling                |
| 🎞️  | Framer Motion         | Animations             |
| 🔄  | TanStack Query v5     | Server state & caching |
| 🧭  | wouter                | Client routing         |
| 📋  | react-hook-form + zod | Forms & validation     |
| 🔌  | socket.io-client      | Real-time events       |
| 📊  | Recharts              | Charts & analytics     |
| 🧩  | Radix UI + shadcn/ui  | Accessible components  |

### Backend

|     | Technology             | Purpose                        |
| --- | ---------------------- | ------------------------------ |
| 🟢  | Node.js 20 + Express 5 | API server                     |
| 🗄️  | Drizzle ORM            | Type-safe SQL queries          |
| 🐘  | Supabase PostgreSQL    | Primary database               |
| 🍃  | MongoDB (optional)     | Notifications & file metadata  |
| 🔌  | Socket.IO              | Real-time bidirectional events |
| 🔐  | JWT + bcryptjs         | Authentication                 |
| 📝  | Pino                   | Structured logging             |
| 📦  | esbuild                | TypeScript bundler             |

---

## Architecture

```
Browser (React SPA)
    │
    ├── HTTP REST ──────────────► Express 5 API (/api/*)
    │   Authorization: Bearer     │
    │   <jwt_token>               ├── requireAuth (JWT verify)
    │                             ├── requireRole (RBAC)
    └── WebSocket ───────────────► Socket.IO (/api/socket.io)
        (real-time events)        │
                                  ├── Drizzle ORM ──► Supabase PostgreSQL
                                  └── MongoDB driver ► MongoDB (optional)
```

**Request flow:**  
`User action → zod validation → TanStack Query mutation → customFetch (adds Bearer token) → Express route → Drizzle query → response + Socket.IO broadcast → cache invalidated → UI updates`

---

## Project Structure

```
Hospital-Hub/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express app + middleware stack
│   │   ├── index.ts            # HTTP server + Socket.IO init
│   │   ├── db.ts               # Supabase PostgreSQL connection
│   │   ├── seed.ts             # Demo account seeder
│   │   ├── schema/             # Drizzle table definitions (10 tables)
│   │   │   ├── users.ts
│   │   │   ├── doctors.ts      # doctors + availability_slots
│   │   │   ├── patients.ts     # patients + medical_records
│   │   │   ├── appointments.ts
│   │   │   ├── prescriptions.ts
│   │   │   ├── bills.ts        # bills + activity_log
│   │   │   ├── departments.ts
│   │   │   └── settings.ts
│   │   ├── middlewares/
│   │   │   └── auth.ts         # requireAuth, requireRole, signToken
│   │   ├── lib/
│   │   │   ├── logger.ts       # Pino logger
│   │   │   ├── mongodb.ts      # Optional MongoDB connection
│   │   │   └── socket.ts       # Socket.IO + emitEvent()
│   │   └── routes/             # 15 route modules
│   │       ├── auth.ts
│   │       ├── users.ts
│   │       ├── departments.ts
│   │       ├── doctors.ts
│   │       ├── patients.ts
│   │       ├── appointments.ts
│   │       ├── prescriptions.ts
│   │       ├── bills.ts
│   │       ├── dashboard.ts
│   │       ├── queue.ts
│   │       ├── reports.ts
│   │       ├── notifications.ts
│   │       ├── files.ts
│   │       ├── settings.ts
│   │       └── health.ts
│   ├── drizzle.config.ts       # Drizzle Kit config (schema push/migrate)
│   ├── build.mjs               # esbuild bundler script
│   ├── build-seed.mjs          # esbuild bundler for seed
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.tsx            # React 19 createRoot entry
    │   ├── App.tsx             # Router + all providers
    │   ├── index.css           # Tailwind v4 + CSS design tokens
    │   ├── api/
    │   │   ├── custom-fetch.ts          # Fetch wrapper with auth injection
    │   │   └── generated/
    │   │       ├── api.schemas.ts       # All TypeScript interfaces
    │   │       └── api.ts               # 51 React Query hooks
    │   ├── lib/
    │   │   ├── auth.tsx         # AuthContext (login, logout, user state)
    │   │   ├── socket.tsx       # SocketContext + useSocketEvent()
    │   │   ├── notifications.tsx # NotificationsContext
    │   │   └── utils.ts         # cn() helper
    │   ├── components/
    │   │   ├── app-layout.tsx          # Sidebar + topbar layout shell
    │   │   ├── notification-bell.tsx   # Bell + dropdown
    │   │   ├── protected-route.tsx     # Auth guard
    │   │   ├── toaster.tsx             # Toast renderer
    │   │   └── ui/                     # shadcn/ui components (17 files)
    │   ├── hooks/
    │   │   ├── use-mobile.tsx   # Viewport breakpoint hook
    │   │   └── use-toast.ts     # Global toast system
    │   └── pages/
    │       ├── landing.tsx      # Public landing page
    │       ├── login.tsx        # Login + demo accounts
    │       ├── register.tsx
    │       ├── dashboard.tsx
    │       ├── appointments/    # index, new, [id]
    │       ├── patients/        # index, new, [id]
    │       ├── doctors/         # index, new, [id]
    │       ├── departments/     # index
    │       ├── prescriptions/   # index, new, [id]
    │       ├── bills/           # index, new, [id]
    │       ├── queue.tsx
    │       ├── schedule.tsx
    │       ├── reports.tsx
    │       ├── audit-log.tsx
    │       ├── hospital-settings.tsx
    │       ├── medical-records.tsx
    │       ├── profile.tsx
    │       └── settings.tsx
    ├── vite.config.ts          # Vite + /api proxy to backend
    └── package.json
```

---

## Database Schema

```
users
 ├─── doctors ──── availability_slots
 └─── patients ─── medical_records
                         │
appointments ────────────┤ (patientId + doctorId)
 ├─── prescriptions      │
 └─── bills              │
                         │
departments ─── doctors ─┘
activity_log    (written by all route handlers)
hospital_settings (singleton row)
```

**Key design decisions:**

- All timestamps use `timestamptz` (timezone-aware)
- Appointment status uses a 9-value enum: `pending → confirmed → checked_in → waiting → in_consultation → completed` (+ `cancelled`, `no_show`, `rescheduled`)
- Invoice numbers are auto-generated: `INV-{timestamp}-{random}`
- Notifications and file metadata use MongoDB (optional — app works without it)

---

## API Reference

**Base URL:** `https://hospital-backend-p20c.onrender.com/api`  
**Auth:** `Authorization: Bearer <token>` on all protected routes

| Resource          | Endpoints                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Health**        | `GET /healthz`                                                                                                                                 |
| **Auth**          | `POST /auth/login` · `POST /auth/register` · `GET /auth/me` · `POST /auth/logout` · `POST /auth/forgot-password` · `POST /auth/reset-password` |
| **Users**         | `GET/POST /users` · `GET/PATCH/DELETE /users/:id`                                                                                              |
| **Departments**   | `GET/POST /departments` · `GET/PATCH/DELETE /departments/:id`                                                                                  |
| **Doctors**       | `GET/POST /doctors` · `POST /doctors/register` · `GET/PATCH/DELETE /doctors/:id` · `/availability` · `/patients` · `/stats`                    |
| **Patients**      | `GET /patients/me` · `GET/POST /patients` · `GET/PATCH/DELETE /patients/:id` · `/medical-history`                                              |
| **Appointments**  | `GET/POST /appointments` · `GET/PATCH/DELETE /appointments/:id` · `/reschedule` · `/checkin` · `/queue-status` · `/consult`                    |
| **Prescriptions** | `GET/POST /prescriptions` · `GET/PATCH /prescriptions/:id`                                                                                     |
| **Bills**         | `GET/POST /bills` · `GET/PATCH /bills/:id`                                                                                                     |
| **Dashboard**     | `GET /dashboard/stats` · `/appointment-analytics` · `/revenue-analytics` · `/recent-activity` · `/audit-log` · `/department-stats`             |
| **Queue**         | `GET /queue`                                                                                                                                   |
| **Reports**       | `GET /reports/revenue` · `/appointments` · `/patients` · `/doctors`                                                                            |
| **Notifications** | `GET/DELETE /notifications` · `/unread-count` · `/read` · `/read-all`                                                                          |
| **Settings**      | `GET/PATCH /hospital-settings`                                                                                                                 |

---

## Authentication & Roles

**Flow:** `Login → bcrypt verify → JWT signed (7d) → stored in localStorage → attached to every request as Bearer token`

| Permission            | Admin | Doctor       | Receptionist | Patient |
| --------------------- | ----- | ------------ | ------------ | ------- |
| All patients          | ✅    | Own patients | ✅           | ❌      |
| All appointments      | ✅    | Own          | ✅           | Own     |
| Prescriptions (write) | ✅    | ✅           | ❌           | ❌      |
| Billing (write)       | ✅    | ❌           | ✅           | ❌      |
| Queue management      | ✅    | ✅           | ✅           | ❌      |
| Reports               | ✅    | ❌           | ❌           | ❌      |
| Hospital settings     | ✅    | ❌           | ❌           | ❌      |
| User management       | ✅    | ❌           | ❌           | ❌      |

---

## Environment Variables

### Backend — `backend/.env`

```env
# Required
SUPABASE_DATABASE_URL=postgresql://postgres.[ref]:[password]@[host]:6543/postgres
SESSION_SECRET=your-long-random-secret-here

# Optional
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hms
```

**Getting `SUPABASE_DATABASE_URL`:**  
Supabase Dashboard → Project Settings → Database → Connection string → URI  
Use **Transaction pooler (port 6543)** for production, **Direct (port 5432)** for local dev.

### Frontend

No `.env` required. Vite proxies `/api` → `http://localhost:5000` in development.  
In production (Vercel), use `vercel.json` rewrites to proxy `/api/*` to your Render URL.

---

## Local Setup

```bash
# 1. Install backend dependencies and push schema
cd backend
npm install
cp .env.example .env        # Fill SUPABASE_DATABASE_URL + SESSION_SECRET

npx drizzle-kit push        # Creates all tables in Supabase
npm run seed                # Creates 4 demo accounts with password123
npm run dev:build           # Build + start on :5000

# 2. In a new terminal — install and start frontend
cd frontend
npm install
npm run dev                 # Starts on :3000
```

Open **http://localhost:3000**

---

## Deployment

### Vercel (Frontend)

1. Connect GitHub repo to Vercel
2. Set **Root Directory:** `frontend` · **Build:** `npm run build` · **Output:** `dist`
3. Add `frontend/vercel.json`:

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

### Render (Backend)

1. Connect GitHub repo → New Web Service
2. **Root Directory:** `backend` · **Build:** `npm install && npm run build` · **Start:** `npm run start`
3. Set environment variables: `SUPABASE_DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`
4. After deploy, open the Render shell and run: `node dist/seed.mjs`

---

## Troubleshooting

| Problem                             | Fix                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `SUPABASE_DATABASE_URL must be set` | Create `backend/.env` from `.env.example`                                  |
| `[YOUR-PASSWORD]` error             | Replace the placeholder in the connection string with your actual password |
| `relation "users" does not exist`   | Run `npx drizzle-kit push`                                                 |
| Demo accounts not working           | Run `npm run seed` from `backend/`                                         |
| Blank screen after login            | Ensure backend is running on port 5000                                     |
| First request on Render is slow     | Free tier spin-down — expected; upgrade to Starter plan for always-on      |
| Socket.IO not connecting in prod    | Verify Vercel rewrites include `/api/socket.io` pass-through               |

---

## Roadmap

- [ ] Video telemedicine (WebRTC)
- [ ] SMS/WhatsApp appointment reminders
- [ ] Online payments (Razorpay / Stripe)
- [ ] Lab & radiology order management
- [ ] Bed and OT management
- [ ] Mobile app (React Native)
- [ ] Docker Compose setup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] AI-assisted diagnostic suggestions

---

<div align="center">

## Designed & Built by

<img src="https://img.shields.io/badge/Ambar%20Ubale-Software%20Engineer-0d9488?style=for-the-badge" alt="Ambar Ubale" />

_MediCore HMS — Modern Hospital Management for the Digital Age_

[![Frontend](https://img.shields.io/badge/Frontend-Live-black?style=flat-square&logo=vercel)](https://hospital-management-system-seven-kappa.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Live-46E3B7?style=flat-square&logo=render)](https://hospital-backend-p20c.onrender.com)

</div>
