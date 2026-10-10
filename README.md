# NEXUS – Ashoka's Skill-Sharing Platform

**N**etwork for **E**xchange of e**X**pertise **U**nder **S**tudent-leadership.

NEXUS is a campus platform for peer-to-peer learning at Ashoka University. Students can browse and search student-led courses, register for them, apply to teach, and book one-on-one discussions, while admins review applications and manage schedules from a dashboard.

## Features

- **Course catalogue** with search and individual course pages
- **Student accounts** – registration, login and a personal dashboard of enrolments
- **Book a discussion** – appointment booking with course leads
- **Admin panel** – review teaching applications, manage appointments and the course schedule
- **Toast notifications** and a responsive, mobile-friendly layout

## Tech stack

Vanilla JavaScript (single-page app with hand-rolled routing) · Vite · Supabase (Auth + Postgres) · GitHub Pages via GitHub Actions

## Getting started

```bash
npm install
npm run dev
```

The app needs a Supabase project. Run `supabase_schema.sql` in the Supabase SQL editor, then add your project URL and anon key to a `.env` file. [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) walks through each step.

## Project structure

```
main.js              router and app bootstrap
src/pages/           student-facing pages (home, search, course, dashboard, booking)
src/pages/admin/     admin login, dashboard, applications, appointments, schedule
src/components/      navbar, course card, toast
src/lib/             Supabase client and API helpers
supabase_schema.sql  database schema (profiles, courses, enrolments, applications, admins)
```

## Deployment

Pushes to `main` build the site with Vite and deploy it to GitHub Pages (`.github/workflows/deploy.yml`).
