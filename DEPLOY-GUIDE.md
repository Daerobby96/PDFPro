# Panduan Deployment Gratis - PDF Tool Pro

Panduan ini menjelaskan langkah-demi-langkah cara men-deploy aplikasi **PDF Tool Pro** (Next.js + Supabase) secara gratis menggunakan **Vercel** (untuk Frontend) dan **Supabase Free Tier** (untuk Database & Auth).

---

## Prasyarat
Sebelum memulai, pastikan Anda memiliki akun di platform berikut (semuanya menyediakan tier gratis):
1. [GitHub](https://github.com)
2. [Supabase](https://supabase.com)
3. [Vercel](https://vercel.com)

---

## Langkah 1: Persiapan Database Supabase (Gratis)

1. **Buat Project Baru**:
   - Masuk ke dashboard Supabase dan klik **New Project**.
   - Masukkan nama project (misal: `PDFPro`), buat kata sandi database, dan pilih wilayah terdekat (misal: `Singapore`).
   - Tunggu beberapa menit hingga database selesai disiapkan.

2. **Inisialisasi Skema Database**:
   - Masuk ke menu **SQL Editor** di panel kiri Supabase, lalu klik **New Query**.
   - Jalankan perintah SQL berikut untuk membuat tabel-tabel yang diperlukan:

   ```sql
   -- 1. Tabel Profiles (otomatis terhubung dengan Auth Users)
   create table public.profiles (
     id uuid references auth.users on delete cascade primary key,
     email text not null,
     full_name text,
     avatar_url text,
     subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'team')),
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Enable RLS untuk Profiles
   alter table public.profiles enable row level security;
   create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
   create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

   -- Trigger otomatis untuk membuat profile saat user mendaftar
   create or replace function public.handle_new_user()
   returns trigger as $$
   begin
     insert into public.profiles (id, email, full_name, avatar_url, subscription_tier)
     values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'free');
     return new;
   end;
   $$ language plpgsql security definer;

   create trigger on_auth_user_created
     after insert on auth.users
     for each row execute procedure public.handle_new_user();

   -- 2. Tabel Subscriptions
   create table public.subscriptions (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references public.profiles(id) on delete cascade not null,
     stripe_customer_id text,
     stripe_subscription_id text,
     plan text default 'free' check (plan in ('free', 'pro', 'team')),
     status text default 'active',
     current_period_start timestamp with time zone,
     current_period_end timestamp with time zone,
     cancel_at_period_end boolean default false,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   alter table public.subscriptions enable row level security;
   create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
   create policy "Users can update/insert own subscription" on public.subscriptions for all using (auth.uid() = user_id);

   -- 3. Tabel PDF History
   create table public.pdf_history (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references public.profiles(id) on delete cascade not null,
     tool_used text not null,
     file_name text not null,
     file_size numeric not null,
     pages_count integer,
     processing_time numeric,
     success boolean default true,
     error_message text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   alter table public.pdf_history enable row level security;
   create policy "Users can manage own history" on public.pdf_history for all using (auth.uid() = user_id);

   -- 4. Tabel Usage Stats
   create table public.usage_stats (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references public.profiles(id) on delete cascade not null,
     month date not null,
     pdf_count integer default 0,
     total_size numeric default 0
   );

   alter table public.usage_stats enable row level security;
   create policy "Users can view own usage stats" on public.usage_stats for select using (auth.uid() = user_id);
   ```

3. **Ambil API Keys**:
   - Buka menu **Project Settings** (ikon gerigi) -> **API**.
   - Salin nilai **Project URL** dan **anon public API Key**. Anda akan membutuhkannya nanti.

---

## Langkah 2: Mengunggah Kode ke GitHub

1. Buka Git Bash / Terminal di folder proyek local (`c:\xampp\htdocs\PDFPro`).
2. Jalankan perintah berikut untuk menginisialisasi Git dan melakukan commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - PDF Tool Pro"
   ```
3. Buat repository kosong baru di GitHub (misal bernama `pdf-tool-pro`).
4. Hubungkan proyek lokal ke GitHub dan unggah kodenya:
   ```bash
   git remote add origin https://github.com/USERNAME_ANDA/pdf-tool-pro.git
   git branch -M main
   git push -u origin main
   ```

---

## Langkah 3: Deploy Frontend di Vercel (Gratis)

1. Masuk ke dashboard **Vercel** dan klik **Add New...** -> **Project**.
2. Hubungkan akun GitHub Anda, pilih repositori `pdf-tool-pro`, lalu klik **Import**.
3. Di bagian **Environment Variables**, tambahkan variabel-variabel berikut berdasarkan kredensial Supabase Anda:
   - `NEXT_PUBLIC_SUPABASE_URL` = *(Salin URL Project Supabase)*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = *(Salin Anon Public Key)*
   - `SUPABASE_SERVICE_ROLE_KEY` = *(Salin Service Role Key dari Supabase Settings -> API)*
4. Klik **Deploy** dan tunggu proses build selesai (sekitar 1-2 menit).
5. Vercel akan memberikan domain publik gratis untuk aplikasi Anda (misalnya: `https://pdf-tool-pro.vercel.app`).

---

## Langkah 4: Konfigurasi Redirect Auth di Supabase

Karena Supabase membutuhkan verifikasi asal URL untuk proses login/signup, Anda harus menambahkan domain Vercel Anda ke whitelist:

1. Masuk ke dashboard Supabase proyek Anda.
2. Buka menu **Authentication** -> **URL Configuration**.
3. Di kolom **Site URL**, ubah menjadi domain Vercel Anda (misal: `https://pdf-tool-pro.vercel.app`).
4. Di bagian **Redirect URLs**, tambahkan `https://pdf-tool-pro.vercel.app/**` agar semua callback auth di-redirect dengan benar setelah login.
5. Klik **Save**.

---

## Selesai! 🎉
Aplikasi PDF Tool Pro Anda sekarang sudah online, aman, dan dapat digunakan secara gratis! Anda dapat mendaftar akun baru langsung melalui halaman registrasi web Anda yang sudah dideploy.
