# ProjGen SaaS

A gamified project-generator web app built as a multi-user SaaS platform. Roll the dice for a random coding challenge, track progress on a Kanban board, and view analytics on your completion rate.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS 4, Lucide React, Framer Motion (Aceternity-style UI)
- **Backend:** Next.js Server Actions
- **Auth & Database:** Supabase (PostgreSQL + Auth with JWT)

## Features

- User registration and login (Supabase Auth)
- Password reset and account deletion flows
- Persistent sidebar navigation (Analytics, Generate, Board, Logout)
- Analytics dashboard with Year / Month / Language filters
- Smart alert when no pending/in-progress projects exist
- Dice-roller project generator with career, language, framework, and time estimate
- Kanban board with drag-and-drop and completion URL modal

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor
3. Copy `.env.example` to `.env.local` and fill in your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`NEXT_PUBLIC_SITE_URL` is used for Supabase auth redirects, including password reset emails.
`SUPABASE_SERVICE_ROLE_KEY` is required for deleting auth users from the server.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # Protected routes (sidebar layout)
│   │   ├── page.tsx        # Analytics (default landing)
│   │   ├── generate/       # Dice roller
│   │   └── board/          # Kanban board
│   ├── login/              # Auth pages
│   └── register/
├── components/
│   ├── analytics/
│   ├── auth/
│   ├── board/
│   ├── generator/
│   ├── layout/
│   └── ui/                 # Aceternity-style components
├── lib/
│   ├── actions/            # Server Actions (auth, projects)
│   ├── generator/          # Project roll logic & data
│   └── supabase/           # Client, server, middleware helpers
└── types/
```

## Database Schema

| Table | Columns |
|-------|---------|
| `users` | id, email, first_name, last_name, created_at |
| `user_projects` | id, user_id, career, language, framework, project_title, time_estimate, status, github_url, live_url, created_at, updated_at |
| `feedback` | id, email, message, created_at |

Row Level Security ensures users can only access their own data.

## License

MIT
