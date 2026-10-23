# Nexus AI

Nexus AI is an evolving portfolio project by Joshua Vallejo Sanchez, built to demonstrate practical Junior Web Developer skills with Next.js, React, TypeScript, and Tailwind CSS.

## What is implemented

- Responsive landing page and reusable typed UI components
- Portfolio section and certificate previews
- Login and registration API routes powered by Supabase Auth
- Server-managed HTTP-only session cookie and protected dashboard
- User-owned project creation, listing, and deletion through Supabase Postgres REST
- PostgreSQL row-level security policies and tracked SQL migration
- GitHub Actions checks for ESLint, TypeScript, and production build

## Roadmap, not yet implemented

AI chat, AI summaries, semantic search, admin analytics, and production deployment/monitoring are future milestones. The landing page describes these as planned rather than claiming they are already live.

## Stack

- Next.js App Router and React
- TypeScript
- Tailwind CSS
- Supabase Auth and PostgreSQL
- ESLint and GitHub Actions CI

## Quick start

1. Install Node.js 22 or later.
2. Install dependencies: npm ci
3. Copy .env.example to .env.local.
4. In the Supabase dashboard, get the project publishable key and replace the placeholder in .env.local. The project URL is https://hyrvilrthpyyrtcgthzq.supabase.co.
5. Configure Auth Site URL and allowed redirect URLs as described in docs/supabase-setup.md.
6. Run npm run dev and open http://localhost:3000.

Never commit .env.local. The public portfolio and production build work without local secrets, but account and project features need the environment variables.

## Validation

    npm run lint
    npx tsc --noEmit
    npm run build

## Security

Never commit .env.local, passwords, access tokens, or a Supabase secret/service-role key. The app uses a publishable key with user-scoped tokens and RLS. See docs/supabase-setup.md.
