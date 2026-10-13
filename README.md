# RoyalRides Travels — Premium Chauffeur-Driven Travel Agency & Admin Dashboard

A production-quality web application built for **RoyalRides Travels**, designed as an executive demo for travel agency owners and clients. The application features a luxury customer-facing website with an automatic arrow-free vehicle showcase, transparent route pricing, real-time inquiry booking, and a complete authenticated Admin Dashboard.

---

## 🌟 Highlights & Features

### Customer-Facing Experience
- **Cinematic Hero Showcase**: Automatic, smooth vehicle transitions showcasing **Innova**, **Ertiga**, **Swift Dzire**, and **Urbania Traveller** on a lighted platform without navigation arrows.
- **Our Fleet**: Clean 4-column responsive grid displaying active vehicles and passenger capacities without carousels.
- **Fixed Price Routes**: Displays verified rates such as **Surat → Mumbai Airport** (Swift Dzire ₹7,000, Ertiga ₹8,000, Innova ₹13,000, Urbania "Get a Quote").
- **Popular Destinations**: Photographic showcase of Mumbai, Lonavala, Nashik, Statue of Unity, Somnath, and Diu with instant booking links.
- **Interactive Inquiries**: Validated form with Indian phone number format checking, passenger counts, and vehicle preselection.
- **Direct Channels**: Working `tel:` click-to-call and WhatsApp click-to-chat links with prefilled templates.

### Admin Dashboard (`/admin`)
- **Executive Login (`/admin/login`)**: Secure Supabase Auth with fallback demo access (`admin@gmail.com` / `admin123`).
- **Dashboard Overview (`/admin`)**: Metric cards (Total Inquiries, Pending, Total Cars, Total Routes), Recharts inquiries-over-time trend, and recent inquiries list.
- **Inquiries Management (`/admin/inquiries`)**: Status workflow (`New` → `Contacted` → `Quotation Given` → `Confirmed` → `Completed` → `Cancelled`), phone/WhatsApp quick actions, agreed price recording, internal notes, and manual booking creation.
- **Realtime Sync**: Submissions on the public site appear immediately in the admin dashboard via BroadcastChannel & Supabase Realtime without manual refresh.
- **Fleet Management (`/admin/cars`)**: Full CRUD operations with category, seating, active toggle, and hero featured switches.
- **Routes & Pricing (`/admin/routes`)**: Route pricing management in INR.
- **Destinations (`/admin/destinations`)**: Photo destination catalog management.
- **Reviews (`/admin/reviews`)**: Testimonial management with star ratings and demo tags.
- **Content CMS (`/admin/content`)**: Dynamic editing of hero headlines, subtitles, badges, and company story.
- **Settings (`/admin/settings`)**: Agency branding, phone numbers, WhatsApp lines, and SEO metadata.
- **Admin Profile (`/admin/profile`)**: Name and password updates.

---

## 🛠 Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict type checking)
- **Styling**: Tailwind CSS v4 & custom design tokens
- **Animations**: Framer Motion (Motion for React)
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form & Zod
- **Data & Auth**: Supabase PostgreSQL, Supabase Realtime, and client persistent fallback
- **Charts**: Recharts
- **Notifications**: Sonner

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (Tested on Node.js v24.19)
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default demo configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=https://placeholder-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=true
DEMO_ADMIN_EMAIL=admin@gmail.com
DEMO_ADMIN_PASSWORD=admin123
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- Customer Website: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3000/admin` (Login: `admin@gmail.com` / `admin123`)

---

## 🗄 Supabase Setup & Production Deployment

To connect a live Supabase PostgreSQL database:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run the schema file:
   - Copy contents of `supabase/schema.sql` and execute.
4. Run the seed data file:
   - Copy contents of `supabase/seed.sql` and execute.
5. Create your administrator account under **Authentication > Users** in Supabase with email `admin@gmail.com`.
6. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
   ```
7. Restart the Next.js server. The application will automatically stream queries and realtime events directly to and from your Supabase PostgreSQL database.

---

## 🧪 Testing Checklist

- [x] **Customer Navigation**: Smooth scrolling to `#fleet`, `#routes`, `#destinations`, `#about`, `#reviews`, `#inquiry`.
- [x] **Hero Car Showcase**: Automatically advances between Innova, Ertiga, Swift Dzire, and Urbania every 4.5 seconds without arrows.
- [x] **Fleet Listing**: 4-column responsive grid without carousel.
- [x] **Fixed Pricing**: Surat → Mumbai Airport verified rates displayed accurately.
- [x] **Inquiry Submission**: Validated via Zod; saves to store and confirms to user.
- [x] **Admin Authentication**: Route guarding redirects unauthenticated visitors to `/admin/login`.
- [x] **Live Inquiries**: Real-time cross-tab updates appear in the admin panel upon customer submission.
- [x] **Full CRUD Operations**: Tested on Cars, Routes, Destinations, Reviews, and Content.
- [x] **Responsive Layouts**: Tested on mobile (360px), tablet (768px), and desktop (1440px).
