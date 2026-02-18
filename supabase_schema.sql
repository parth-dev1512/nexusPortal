-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- NOTE: Student user accounts are managed by Supabase Auth (auth.users table).
-- Use the Supabase dashboard → Authentication → Settings to configure:
--   1. Enable Email/Password provider
--   2. Enable Google OAuth provider (add Google Client ID + Secret)
--   3. Set Site URL to your app URL (e.g. http://localhost:5173)
--   4. Add redirect URL: http://localhost:5173/#/dashboard

-- 1. PROFILES (Extends default auth.users)
create table profiles (
  id uuid references auth.users not null primary key,
  email text unique,
  full_name text,
  year text, -- e.g. UG3
  batch text, -- e.g. 2025
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. COURSES
create table courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  instructor text not null,
  description text,
  syllabus text,
  sessions jsonb default '[]'::jsonb, -- Array of {date, start_time, end_time}
  location text,
  max_capacity int default 30,
  tags text[],
  status text default 'approved', -- 'approved', 'pending', 'ended'
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ENROLLMENTS
create table enrollments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  course_id uuid references courses(id) not null,
  status text default 'enrolled', -- 'enrolled', 'dropped'
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- 4. APPLICATIONS (For new courses)
create table applications (
  id uuid default uuid_generate_v4() primary key,
  applicant_id uuid, -- Simplified to avoid FK issues without real profiles
  instructor_name text,
  email text,
  course_title text,
  course_brief text,
  syllabus_proposal text,
  experience text,
  planned_capacity int default 30,
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- RLS POLICIES (Simple version)
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);

alter table courses enable row level security;
create policy "Courses are viewable by everyone." on courses for select using (true);
create policy "Courses can be created by admin." on courses for insert with check (true);
create policy "Courses can be updated by admin." on courses for update using (true);
create policy "Courses can be deleted by admin." on courses for delete using (true);

alter table enrollments enable row level security;
create policy "Users can view their own enrollments." on enrollments for select using (auth.uid() = user_id);
create policy "Users can enroll themselves." on enrollments for insert with check (auth.uid() = user_id);

alter table applications enable row level security;
create policy "Anyone can submit an application." on applications for insert with check (true);
create policy "Applications are viewable by admin." on applications for select using (true);
create policy "Applications can be updated by admin." on applications for update using (true);


-- 6. ADMIN USERS
create table admin_users (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  password_hash text not null, -- Store bcrypt hash in production; plain text for MVP
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Allow public SELECT so the login function can query it (RLS-free for MVP)
-- In production, use a server-side function/edge function to avoid exposing hashes
alter table admin_users enable row level security;
create policy "Admin users table is publicly readable for login." on admin_users for select using (true);

-- Seed default admin account (username: admin, password: nexus@admin)
-- IMPORTANT: Change this password immediately after first login!
insert into admin_users (username, password_hash) values ('admin', 'nexus@admin');
