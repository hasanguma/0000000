# مؤسسة الذهبية - Al-Dhahabiya Premium Website

🎧 **A premium, cinematic Arabic (RTL) website for a professional audio & DJ event company**, featuring a full-featured hidden admin CMS. Built with Next.js 15 (App Router), MongoDB, Tailwind CSS, shadcn/ui, and Framer Motion.

**Fully portable – no vendor lock-in.** Deploy anywhere: Vercel, Netlify, AWS, DigitalOcean, or your own VPS.

---

## ✨ Features

### Public Site (`/`)
- Metallic gold logo with animated shimmer effect
- Cinematic Hero with background image/video, animated headline, CTAs, and stats
- **About** section (intro, vision, mission, why-us cards)
- **9 Services** with premium cards (Sound systems, DJ, weddings, graduations, conferences, lighting, stage, LED screens, special effects)
- **Gallery** with masonry layout, category filters, lightbox, zoom, lazy loading
- **YouTube Videos** section – admin pastes channel/playlist/video URL and videos are fetched automatically **without needing YouTube API key** (uses public RSS feeds)
- **Testimonials** with star ratings
- **Contact**: form + Google Maps + phone + WhatsApp + email + full address
- Social media links (Instagram, Facebook, TikTok, Snapchat, YouTube, Telegram, X, LinkedIn)
- Floating WhatsApp / Call / Back-to-top buttons
- Glassmorphism navbar (sticky) + mobile drawer
- Full **RTL Arabic** layout with the Cairo font
- SEO metadata + Open Graph + Google Analytics
- Responsive on mobile, tablet, desktop

### Admin Dashboard (`/admin`)
- Password-protected (session-based, 7-day cookie-less token stored in localStorage)
- 10 tabs to edit **everything** without touching code:
  1. Hero (title, subtitle, description, background image/video, CTAs, stats, logo text)
  2. About (intro, vision, mission, why-us)
  3. Services (add/remove/edit + images + icons)
  4. Gallery (add/remove images + categories)
  5. Videos (paste any YouTube URL and it auto-resolves)
  6. Testimonials
  7. Contact info (phone, WhatsApp, email, address, Google Maps embed)
  8. Social media links
  9. SEO (title, description, keywords, OG, Google Analytics)
  10. Footer
- Sticky save button, toast notifications

---

## 🚀 Quick Start

### 1) Prerequisites
- **Node.js 18.17+** (Node 20 LTS recommended)
- **MongoDB** (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 2) Install & Configure
```bash
# Clone / download the project, then:
cd al-dhahabiya
cp .env.example .env

# Edit .env with your values:
#   MONGO_URL=<your connection string>
#   DB_NAME=alzahabiya
#   ADMIN_PASSWORD=<a strong password>

npm install
```

### 3) Development
```bash
npm run dev
# open http://localhost:3000
# admin panel at http://localhost:3000/admin (default password from .env)
```

### 4) Production
```bash
npm run build
npm run start
```

---

## ☁️ Deploy to Vercel (Recommended)

1. Push the project to a GitHub / GitLab / Bitbucket repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Add environment variables in the Vercel project settings:
   - `MONGO_URL` → your MongoDB Atlas URI
   - `DB_NAME` → `alzahabiya`
   - `ADMIN_PASSWORD` → a strong password
   - `NEXT_PUBLIC_BASE_URL` → e.g. `https://your-domain.vercel.app`
   - `CORS_ORIGINS` → `*` (or your allowed origins)
5. Click **Deploy**. Done 🎉

> **Important:** For Vercel you *must* use MongoDB Atlas (or any network-accessible MongoDB) since Vercel serverless functions cannot reach `localhost`.

### Free MongoDB Atlas Setup (2 minutes)
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Add a database user
4. Whitelist `0.0.0.0/0` in Network Access (or Vercel IPs)
5. Copy the connection string → paste as `MONGO_URL`

---

## 🔐 Admin Access

- URL: `/admin`
- Default password (from `.env`): **`admin2025`** – **change this in production!**
- Sessions are stored in MongoDB and expire after 7 days.

---

## 📁 Project Structure

```
.
├── app/
│   ├── admin/page.js          # Admin dashboard (client)
│   ├── api/[[...path]]/       # All backend API routes (catch-all)
│   ├── layout.js              # Root layout + SEO metadata
│   ├── page.js                # Public landing page
│   └── globals.css            # Tailwind + gold shimmer + glassmorphism
├── components/ui/             # shadcn/ui components
├── lib/
│   ├── mongodb.js             # Mongo connection singleton
│   ├── defaultContent.js      # Seed content (used on first run)
│   └── utils.js               # cn() helper
├── .env.example
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
├── tsconfig.example.json     # Rename to tsconfig.json only if migrating to TypeScript
├── vercel.json
└── package.json
```

---

## 📚 API Reference

All routes are handled by the catch-all `app/api/[[...path]]/route.js`.

| Method | Endpoint             | Auth  | Purpose                                   |
|--------|---------------------|-------|-------------------------------------------|
| GET    | `/api/content`      | No    | Fetch entire site content                 |
| PUT    | `/api/content`      | Yes   | Update site content                       |
| POST   | `/api/admin/login`  | No    | Login → returns session token             |
| POST   | `/api/contact`      | No    | Submit contact form                       |
| GET    | `/api/submissions`  | Yes   | List contact submissions                  |
| POST   | `/api/youtube/resolve` | Yes | Resolve YouTube URL (channel/playlist/video) into video list (uses public RSS – **no API key**) |
| DELETE | `/api/reset`        | Yes   | Reset content to defaults                 |

Auth: send `Authorization: Bearer <token>` (token comes from `/api/admin/login`).

---

## 🎨 Design System

- Fonts: **Cairo** (via `next/font/google`)
- Colors: **Black** `#0F0F0F`, **Gold** `#D4AF37`, **White**, **Dark Gray**
- Effects: metallic gold text with shimmer animation, glassmorphism, gold border glow, cinematic vignettes
- Animations: Framer Motion for hero, IntersectionObserver for fade-up sections

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS 3.4 + shadcn/ui (Radix primitives) + lucide-react icons
- **Animation:** Framer Motion
- **Database:** MongoDB (native driver)
- **State:** React hooks (no external state library needed)
- **Notifications:** Sonner toasts

---

## ✅ Build & Verify

```bash
npm install
npm run build   # Should complete with zero errors
npm run start   # Starts production server on port 3000
```

---

## 📝 License

This codebase is delivered to the owner (مؤسسة الذهبية) with full ownership rights. Use it, modify it, and deploy it however you wish.
