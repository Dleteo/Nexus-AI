# Nexus AI

Nexus AI is an evolving portfolio project by Joshua Vallejo Sanchez, built to demonstrate practical Junior Web Developer skills with Next.js, React, TypeScript, and Tailwind CSS.

## What is implemented

- Responsive landing page and reusable typed UI components
- Portfolio section and certificate previews
- Login and registration API routes powered by Supabase Auth
- Server-managed HTTP-only session cookie and protected dashboard
- User-owned project creation, listing, and deletion through Supabase Postgres REST
- PostgreSQL row-level security policy setup
- GitHub Actions checks for ESLint, TypeScript, and production build

## Roadmap, not yet implemented

AI chat, AI summaries, semantic search, admin analytics, and production deployment/monitoring are future milestones. The landing page describes these as planned rather than claiming they are already live.

## Stack

- Next.js App Router and React
- TypeScript
- Tailwind CSS
- Supabase Auth and PostgreSQL (external service configuration required)
- ESLint and GitHub Actions CI

## Quick start

1. Install Node.js 22 or later.
2. Install dependencies: `npm ci`
3. Copy `.env.example` to `.env.local` and set your Supabase project URL and public anon key.
4. Follow [the Supabase setup guide](docs/supabase-setup.md) and run its SQL in the Supabase SQL Editor.
5. Run `npm run dev` and open http://localhost:3000.

Without Supabase environment variables, the public portfolio and production build still work, but account APIs return a clear configuration message and authenticated project features cannot run.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Security

Never commit `.env.local`, passwords, access tokens, or a Supabase service-role key. Use the public/anon key with row-level security enabled. See [docs/supabase-setup.md](docs/supabase-setup.md) for deployment and security configuration.
