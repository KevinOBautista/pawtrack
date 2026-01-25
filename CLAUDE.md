# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PawTrack is a pet medication reminder application built with Next.js 15 and Supabase. It enables pet owners to track medications and coordinate with pet sitters through SMS reminders and dose confirmations.

**Tech Stack:**
- Next.js 15 (App Router with Turbopack)
- React 19
- Supabase (Auth + Database)
- TypeScript
- Tailwind CSS + shadcn/ui
- Twilio (planned for SMS)

## Monorepo Structure

This is an npm workspaces monorepo with three workspaces defined in the root `package.json`:

```
pawtrack/
├── client/          # Next.js 15 frontend application
├── server/          # Backend (configured but not implemented)
├── shared/          # Shared types/utilities (empty)
└── docs/            # Documentation
```

## Development Commands

### Root Level (runs all workspaces)
```bash
npm run dev            # Run both client and server in parallel (uses concurrently)
npm run build          # Build both client and server
npm test               # Run server tests
```

### Client Workspace
```bash
cd client
npm run dev            # Start Next.js dev server with Turbopack on localhost:3000
npm run build          # Production build
npm start              # Start production server
npm run lint           # Run ESLint
```

### Individual Workspace Commands
```bash
npm run dev:client     # From root: run client only
npm run dev:server     # From root: run server only
```

## Environment Setup

Required environment variables in `client/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-or-anon-key>
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Future Twilio variables (see TASK.md Phase 2.3):
```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
NEXT_PUBLIC_BASE_URL=
```

## Architecture

### Client Directory Structure

```
client/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout with ThemeProvider
│   ├── globals.css               # Global Tailwind styles
│   ├── auth/                     # Authentication routes
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   ├── update-password/
│   │   ├── confirm/route.ts      # Email verification handler
│   │   └── error/
│   ├── (dashboard)/              # Protected route group
│   │   ├── dashboard/page.tsx    # Main dashboard (pets overview)
│   │   ├── pets/
│   │   │   ├── new/page.tsx      # Add pet form (stub)
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Pet detail (stub)
│   │   │       └── medications/new/page.tsx
│   │   └── sitters/page.tsx      # Sitters/doses view (stub)
│   └── api/
│       ├── cron/send-reminders/route.ts  # Future SMS cron job
│       └── doses/[id]/confirm/route.ts   # Future dose confirmation
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── auth-button.tsx           # Auth state display
│   ├── logout-button.tsx         # Sign out functionality
│   ├── theme-switcher.tsx        # Dark mode toggle
│   └── forms/                    # Auth forms (login, signup, etc.)
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client (with cookies)
│   │   └── middleware.ts         # Auth session management
│   ├── types/
│   │   └── database.ts           # Database type definitions
│   ├── actions/                  # Server Actions (empty stubs)
│   │   ├── pets.ts
│   │   ├── medications.ts
│   │   └── doses.ts
│   └── utils.ts                  # Utility functions (cn, hasEnvVars)
└── middleware.ts                 # Next.js middleware for auth routing
```

### Supabase Authentication Pattern

**Three client implementations:**

1. **Browser Client** (`lib/supabase/client.ts`):
   - Use in Client Components
   - Created with `createBrowserClient` from `@supabase/ssr`
   - Auto-manages session in browser storage

2. **Server Client** (`lib/supabase/server.ts`):
   - Use in Server Components, Route Handlers, Server Actions
   - Created with `createServerClient` from `@supabase/ssr`
   - Manages session via Next.js cookies API
   - Must be awaited: `const supabase = await createClient()`

3. **Middleware Client** (`lib/supabase/middleware.ts`):
   - Used in `middleware.ts` to protect routes
   - Checks user claims and redirects unauthenticated users to `/auth/login`
   - Preserves session across requests

**Auth Flow:**
- Sign up → email verification → redirect to `/protected`
- Login → redirect to `/protected`
- Password reset via email with OTP token
- Middleware protects all routes except static assets and auth pages

### Database Schema

Database types are defined in `lib/types/database.ts`:

**Core Tables:**
- `profiles` - User profiles with role (owner/sitter), phone number
- `pets` - Pet information (owner_id, name, species, breed, photo, etc.)
- `medications` - Medication schedules (pet_id, dosage, frequency, time_of_day[])
- `dose_logs` - Scheduled and administered doses (medication_id, sitter_id, status, photos)

**Key Relationships:**
- Profile → Pets (1:many via owner_id)
- Pet → Medications (1:many via pet_id)
- Medication → DoseLogs (1:many via medication_id)
- Profile (sitter) → DoseLogs (1:many via sitter_id)

### Data Fetching Pattern

Server Components query Supabase directly:

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();

  const { data: pets } = await supabase
    .from('pets')
    .select('*, medications(count)')
    .order('created_at', { ascending: false });

  // Render with data
}
```

For mutations, use Server Actions in `lib/actions/`.

### Styling Conventions

- **Tailwind CSS** with CSS variables for theming
- **Dark mode** via `next-themes` (supports system, light, dark)
- **Component styling** via `class-variance-authority` for variants
- **shadcn/ui** components in `components/ui/` (New York style)
- **Class merging** via `cn()` utility (clsx + tailwind-merge)
- **Icons** via `lucide-react`

### Route Groups

The `(dashboard)` route group wraps protected pages with a shared layout:
- Layout includes navigation and requires authentication
- All child routes inherit the authentication requirement
- See `app/(dashboard)/layout.tsx` for shared UI

## Development Workflow

### Adding New Features

See `TASK.md` for detailed roadmap. Current phase: **Phase 1 - Core Owner Features**

Key stub files ready for implementation:
- Pet CRUD: `app/(dashboard)/pets/[id]/page.tsx`, `lib/actions/pets.ts`
- Medication CRUD: `app/(dashboard)/pets/[id]/medications/new/page.tsx`, `lib/actions/medications.ts`
- Dose tracking: `app/(dashboard)/sitters/page.tsx`, `lib/actions/doses.ts`

### Adding shadcn/ui Components

```bash
cd client
npx shadcn@latest add <component-name>
```

Configuration in `client/components.json` (New York style, TypeScript, Tailwind CSS).

### Database Queries

All tables have RLS (Row Level Security) policies configured. Always use the appropriate Supabase client:
- **Server-side**: `await createClient()` from `lib/supabase/server`
- **Client-side**: `createClient()` from `lib/supabase/client`

## Project Status

**Completed:**
- Authentication system (login, signup, password reset)
- Database schema and TypeScript types
- Basic dashboard layout
- RLS policies
- Dark mode support

**In Progress (Phase 1):**
- Pet CRUD operations
- Medication management
- Profile setup flow

**Planned:**
- SMS reminders via Twilio (Phase 2)
- Photo uploads to Supabase Storage (Phase 3)
- CSV export and analytics (Phase 4)

See `TASK.md` for the complete development roadmap.
