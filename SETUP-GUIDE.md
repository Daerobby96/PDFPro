# 🎯 Setup Guide - PDF Tool Pro (Next.js)

Complete step-by-step guide untuk menjalankan aplikasi ini.

## ✅ Checklist Persiapan

Sebelum mulai, pastikan Anda sudah punya:

- [ ] Node.js 18+ terinstall
- [ ] Text editor (VS Code recommended)
- [ ] Browser modern (Chrome/Firefox/Edge)
- [ ] Akun Supabase (gratis)
- [ ] Terminal/Command Prompt

---

## 📦 Step 1: Install Node.js

### Windows:

1. Download dari: https://nodejs.org/
2. Pilih **LTS version** (recommended)
3. Install dengan double-click
4. Verify:
   ```bash
   node --version
   npm --version
   ```
   Harus muncul versi number (contoh: v20.10.0)

---

## 🔧 Step 2: Install Dependencies

Buka Command Prompt di folder project ini:

```bash
# Navigasi ke folder project
cd "c:\xampp\htdocs\Split & Markdown PDF\pdf-tool-nextjs"

# Install semua dependencies
npm install
```

**Tunggu proses selesai** (~2-5 menit tergantung internet)

---

## 🔐 Step 3: Setup Supabase

### 3.1 Buat Akun & Project

1. **Buka**: https://supabase.com
2. **Sign up** dengan Google/GitHub/Email
3. **Create New Project**:
   - Organization: Buat baru atau pilih existing
   - Name: `pdf-tool-pro` (atau nama lain)
   - Database Password: **SIMPAN INI!** (copy ke notepad)
   - Region: **Southeast Asia (Singapore)** (paling dekat)
   - Plan: **Free** (gratis selamanya)
4. **Wait** ~2 menit untuk project setup

### 3.2 Copy API Keys

1. Di Supabase Dashboard, klik project Anda
2. Go to: **Settings** (⚙️ icon) → **API**
3. Copy 3 values ini:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **service_role (click "Reveal"):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3.3 Update .env.local

1. Buka file `.env.local` di folder project
2. Replace dengan values yang Anda copy:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hyhibvfsvahllbdmryjd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_PfN6ARzCMtsq9TLJ0eIEyA_8defCtp6
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Save file** (Ctrl+S)

---

## 🗄️ Step 4: Setup Database

### 4.1 Run SQL Migration

1. Di Supabase Dashboard, go to: **SQL Editor** (⚡ icon)
2. Click **+ New query**
3. Copy SQL ini dan paste:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'team')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- PDF History
CREATE TABLE pdf_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tool_used TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  pages_count INTEGER,
  processing_time INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Usage Stats
CREATE TABLE usage_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL,
  pdf_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  UNIQUE(user_id, month)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own history" ON pdf_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON pdf_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own stats" ON usage_stats FOR SELECT USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

4. Click **Run** (atau Ctrl+Enter)
5. Harus muncul "Success. No rows returned"

### 4.2 Verify Tables Created

1. Go to: **Table Editor** (📊 icon)
2. Harus ada 4 tables:
   - ✅ profiles
   - ✅ subscriptions
   - ✅ pdf_history
   - ✅ usage_stats

---

## 🚀 Step 5: Run Development Server

```bash
npm run dev
```

**Output harus seperti ini:**

```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

**Buka browser:** http://localhost:3000

✅ **Berhasil!** Anda akan lihat landing page yang keren!

---

## 🧪 Step 6: Test Authentication

### 6.1 Sign Up

1. Click **"Try Free"** atau **"Sign Up"**
2. Isi form:
   - Full Name: Nama Anda
   - Email: email@example.com
   - Password: minimal 6 karakter
3. Click **"Create account"**
4. Otomatis redirect ke dashboard

### 6.2 Verify Database

1. Buka Supabase Dashboard
2. Go to: **Authentication** → **Users**
3. User baru Anda harus muncul disini ✅

4. Go to: **Table Editor** → **profiles**
5. Profile Anda harus muncul dengan full_name ✅

### 6.3 Test Logout & Login

1. Di dashboard, click user menu → **Logout**
2. Redirect ke /login
3. Login lagi dengan email & password yang sama
4. Harus berhasil masuk ke dashboard ✅

---

## ✨ Step 7: Test Features (Optional)

### Upload PDF

1. Di dashboard, drag & drop PDF file
2. File name dan size harus muncul
3. Tool cards harus active (tidak disabled)

### Dark Mode

1. Click moon icon (🌙) di navbar
2. Theme berubah ke dark mode
3. Click sun icon (☀️) untuk kembali ke light mode

---

## 🎉 Selesai!

Aplikasi sudah running! Anda sekarang punya:

✅ Landing page profesional  
✅ Authentication (signup/login)  
✅ Dashboard dengan dark mode  
✅ Database PostgreSQL  
✅ Row Level Security  
✅ TypeScript + Next.js  

---

## 🔧 Troubleshooting

### Error: "Module not found"
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Error: "Invalid API key"
- Check `.env.local` file exists
- Pastikan values sudah benar (no extra spaces)
- Restart dev server: `Ctrl+C` lalu `npm run dev`

### Error: "Table does not exist"
- Pastikan SQL migration sudah di-run
- Check di Table Editor apakah tables ada

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```
Lalu buka: http://localhost:3001

### Supabase connection error
- Check internet connection
- Verify Supabase project masih aktif
- Pastikan API keys benar

---

## 📚 Next Steps

Sekarang Anda bisa:

1. **Customize UI** - Edit components di `src/components/`
2. **Add PDF tools** - Port logic dari vanilla JS version
3. **Add Stripe** - Implement payment
4. **Deploy** - Push to Vercel

Read `README.md` untuk detail lebih lanjut!

---

## 💬 Need Help?

Stuck? Tanya saya! 🙋‍♂️

**Common issues:**
- Node.js not installed → Install dari nodejs.org
- Supabase error → Check API keys di `.env.local`
- Build error → Try `npm install` lagi

---

**Happy Coding! 🚀**
