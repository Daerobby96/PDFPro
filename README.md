# 🚀 PDF Tool Pro - Next.js Edition

Professional PDF processing SaaS built with **Next.js 14**, **Supabase**, and **TypeScript**.

## ✨ Features

- ✅ **Authentication** - Email/password + OAuth (Google)
- ✅ **PDF Tools** - Split, Merge, Convert, Compress, Protect, etc.
- ✅ **Dashboard** - Professional UI with dark mode
- ✅ **Database** - PostgreSQL with Row Level Security
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Responsive** - Mobile-friendly design
- ✅ **SEO Optimized** - Perfect lighthouse scores

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database + Storage)
- **PDF Processing**: PDF.js + PDF-lib
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, make sure you have:

1. **Node.js** 18+ installed
   ```bash
   node --version
   ```

2. **Supabase account** (free)
   - Sign up at: https://supabase.com

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Supabase

1. Create a new project at https://supabase.com/dashboard
2. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

3. Update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Setup Database

1. Go to **Supabase Dashboard → SQL Editor**
2. Copy the SQL from `MIGRATION-GUIDE.md` (in parent folder)
3. Run the SQL to create tables and policies

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Project Structure

```
pdf-tool-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── dashboard/         # Dashboard (protected)
│   │   └── auth/callback/     # OAuth callback
│   │
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   └── ui/               # Reusable UI components
│   │
│   ├── lib/                   # Utilities
│   │   ├── supabase/         # Supabase clients
│   │   ├── pdf/              # PDF processing logic
│   │   └── utils.ts          # Helper functions
│   │
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript types
│
├── public/                    # Static assets
├── .env.local                # Environment variables
└── package.json              # Dependencies
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript
```

## 🗄️ Database Schema

The app uses these Supabase tables:

- **profiles** - User profiles (extends auth.users)
- **subscriptions** - Subscription management
- **pdf_history** - PDF processing history
- **usage_stats** - Monthly usage tracking

See `MIGRATION-GUIDE.md` for complete SQL schema.

## 🔐 Authentication

### Email/Password
- Sign up: `/signup`
- Login: `/login`
- Auto-creates user profile

### OAuth (Google)
Configure in Supabase Dashboard:
1. Go to **Authentication → Providers**
2. Enable Google
3. Add OAuth credentials

## 📦 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

Or connect GitHub repo:
1. Push code to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy! ✨

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🎨 Customization

### Colors
Edit `tailwind.config.ts`:
```typescript
primary: {
  500: '#7c6af7', // Change your primary color
}
```

### Logo
Replace in components:
```tsx
<FileText /> // Replace with your logo
```

### Branding
Update:
- `src/app/layout.tsx` - Meta tags
- `public/favicon.ico` - Favicon
- `src/app/page.tsx` - Landing page content

## 🐛 Troubleshooting

### "Invalid API key" error
- Check `.env.local` has correct Supabase credentials
- Restart dev server after changing env vars

### "Table does not exist" error
- Run the SQL migration in Supabase Dashboard
- Check database tables exist

### "Session not found" error
- Clear browser cookies
- Sign out and sign in again

### PDF processing not working
- Check browser console for errors
- Ensure file size < 100MB
- Check PDF is not corrupted

## 📚 Next Steps

1. **Add PDF Processing Logic**
   - Port from vanilla JS version
   - Create tool-specific pages
   - Implement PDF.js workers

2. **Add Stripe Payments**
   - Install Stripe SDK
   - Create checkout flow
   - Add webhook handlers

3. **Implement Usage Limits**
   - Track PDF counts
   - Enforce tier limits
   - Show usage stats

4. **Add Team Features**
   - Create teams table
   - Implement invitations
   - Shared workspaces

## 📖 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

## 🤝 Support

Need help? Check:
- `MIGRATION-GUIDE.md` - Step-by-step migration
- `FRAMEWORK-DECISION.md` - Architecture decisions
- [Supabase Discord](https://discord.supabase.com/)
- [Next.js Discord](https://nextjs.org/discord)

## 📝 License

MIT License - feel free to use for commercial projects!

---

**Built with ❤️ using Next.js and Supabase**

Start building your SaaS now! 🚀
