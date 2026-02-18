# Connecting Ashoka NEXUS to Supabase (Backend)

Follow these steps to enable the database for your application.

## 1. Create a Supabase Project
1.  Go to [supabase.com](https://supabase.com) and sign up/log in.
2.  Click **"New Project"**.
3.  Choose your organization (or create one).
4.  **Name**: `Ashoka Nexus` (or anything you like).
5.  **Database Password**: Create a strong password (and save it).
6.  **Region**: Choose a region close to your users (e.g., `Mumbai` if available, or `Singapore`).
7.  Click **"Create new project"**.

## 2. Run the Database Schema
1.  Once the project is created, look at the left sidebar.
2.  Click on the **SQL Editor** icon (square with `>_`).
3.  Click **"New Query"**.
4.  **Copy the content** from the file `d:\NEXUS\nexusWeb\supabase_schema.sql` in your project folder.
5.  **Paste it** into the SQL Editor on the website.
6.  Click **"Run"** (bottom right).
    - This will create the `profiles`, `courses`, `enrollments`, etc. tables.

## 3. Get Your API Keys
1.  Go to **Project Settings** (cog icon at the bottom of the left sidebar).
2.  Click on **API**.
3.  Copy the **Project URL**.
4.  Copy the **anon public** key.

## 4. Connect Your Code
1.  In your project folder (`d:\NEXUS\nexusWeb`), create a new file named `.env`.
2.  Paste the following into it, replacing the values with the ones you copied:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3.  Save the file.

## 5. Install Dependencies (If needed)
If the automatic installation failed, running this in your terminal:
```bash
npm install @supabase/supabase-js
```

## Done!
Your application will now be able to fetch real data, handle logins, and manage enrollments.
