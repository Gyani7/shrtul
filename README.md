# Shrtul — URL Shortener

A fast, beautiful, and free URL shortener built with Next.js and Supabase.

## Features

- **Instant shortening** — Paste any URL and get a short link in under a second
- **Click analytics** — Track country, browser, device, and referrer for every click
- **Custom aliases** — Use memorable short codes like `/my-link`
- **Password protection** — Lock links behind a password
- **Expiry dates** — Set automatic expiry on time-sensitive links
- **QR codes** — Generate QR codes for any short link
- **UTM parameters** — Append tracking params automatically
- **Dashboard** — Manage all your links in one place
- **Admin panel** — User management, abuse flags, blacklisted domains, promo URLs
- **REST API** — Programmatic access to create and manage links
- **Dark mode** — Beautiful light and dark themes
- **SEO optimized** — Sitemap, robots.txt, and Open Graph metadata

## Tech Stack

- **Next.js 13** (App Router)
- **Supabase** (PostgreSQL, Auth, RLS)
- **Tailwind CSS** + **shadcn/ui**
- **TypeScript**

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (see `.env.example`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/links` | Create a short link |
| `GET` | `/api/links` | List all links |
| `GET` | `/api/links/:alias` | Get link details |
| `DELETE` | `/api/links/:alias` | Delete a link |
| `GET` | `/api/links/:alias/clicks` | Get click analytics |

All API endpoints require a `Authorization: Bearer <token>` header.

## Database Schema

- **profiles** — User profiles with admin flag
- **workspaces** — Each user gets a personal workspace
- **workspace_members** — Multi-user workspace membership
- **links** — Short links with metadata (alias, password, expiry, UTM)
- **clicks** — Individual click records with geo/device data
- **api_keys** — API keys for programmatic access
- **abuse_flags** — Reported links for admin review
- **blacklisted_domains** — Blocked domains
- **promo_urls** — Promotional redirect URLs
- **platform_settings** — Global platform configuration

## License

MIT
