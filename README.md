# Hospital-Hub

A full-stack Hospital Management System, restructured from a pnpm monorepo into two independent, plain-npm projects: `frontend/` and `backend/`.

## Project Structure

```
Hospital-Hub/
├── backend/      Express + Drizzle ORM + Socket.IO API server
└── frontend/     React 19 + Vite + Tailwind v4 client
```

Each folder is a self-contained npm project. There is no workspace/monorepo tooling — install and run each independently.

## Prerequisites

- Node.js 20+
- A PostgreSQL database (for Drizzle ORM)
- (Optional) A MongoDB instance for notifications/file metadata — the app degrades gracefully if absent

## Backend Setup

```bash
cd backend
cp .env.example .env
# edit .env and set DATABASE_URL (and optionally MONGODB_URI, SESSION_SECRET)
npm install
npm run build
npm run dev
```

The backend listens on `PORT` (default `5000`) and exposes the API under `/api`.

To push the Drizzle schema to your database:

```bash
npx drizzle-kit push
```

To create the demo accounts (all use password `password123`):

```bash
npm run seed
```

This creates/updates:

| Email | Role |
|---|---|
| `admin@hospital.com` | admin |
| `dr.carter@hospital.com` | doctor |
| `john.doe@email.com` | patient |
| `reception@hospital.com` | receptionist |
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on port `3000` and proxies `/api` requests to `http://localhost:5000` (see `vite.config.ts`). Start the backend first.

For production builds:

```bash
npm run build
npm run preview
```

## Key Architecture Notes

- **Backend**: Express 5, Drizzle ORM (PostgreSQL), JWT auth (`SESSION_SECRET` env var), Socket.IO for realtime events (appointments, queue, notifications), optional MongoDB for notifications/file metadata.
- **Frontend**: React 19, Vite 7, Tailwind v4, TanStack Query, wouter for routing, shadcn/ui-style components, react-hook-form + zod for forms, Socket.IO client for realtime updates.
- **API client**: A hand-inlined, orval-style generated client lives in `frontend/src/api/` (`generated/api.ts` for React Query hooks, `generated/api.schemas.ts` for types, `custom-fetch.ts` for the underlying fetch wrapper with auth-token injection).

## Environment Variables (backend/.env)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default 5000) | HTTP port |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SUPABASE_DATABASE_URL` | No | Alternative to `DATABASE_URL` if using Supabase |
| `MONGODB_URI` | No | Enables notifications/file-metadata features |
| `SESSION_SECRET` | Yes (production) | JWT signing secret |
| `NODE_ENV` | No | `development` or `production` |

## License

Private project.
