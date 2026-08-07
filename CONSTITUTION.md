# SHRTUL X — PRODUCT CONSTITUTION

> The permanent rulebook for the Shrtul X platform.
> Every feature, every decision, every line of code must answer to this document.
> If a proposed change violates any article below, it is rejected — no exceptions.

---

## 1. Product Vision

### Why Shrtul exists

The internet treats clicks as disposable. A user clicks a link, waits, and lands on a page — that entire journey is wasted potential. Shrtul exists because the moment between click and destination is the most underutilized space on the web.

### What problem it solves

Marketers, creators, and businesses have no way to control, personalize, or measure what happens between the click and the destination. Traditional URL shorteners compress links. Analytics tools count clicks. Neither lets you design what the click itself feels like.

Shrtul turns the redirect into a programmable surface — an interactive, intelligent, measurable micro-experience that can adapt to who is clicking, when, where, and why.

### Why people will switch

| From | Problem | Shrtul answer |
|------|---------|---------------|
| Bitly / TinyURL | Links are dead endpoints | Links are living experiences |
| Linktree | Static landing pages | Dynamic, AI-personalized journeys |
| Google Analytics | Tells you what happened after | Tells you what happened during |
| Custom dev work | Months to build an interactive redirect | Minutes in Studio, deploy instantly |

### Category we are creating

**AI Click Experience Platform** — a new software category that sits between link management, marketing automation, and experience design. Not a URL shortener. Not a link-in-bio tool. An infrastructure layer for intelligent clicks.

---

## 2. Product Principles

1. **Every click must create value.** If an experience does not inform, entertain, convert, or personalize — it has no reason to exist. Remove it.
2. **Speed is more important than visual effects.** No experience may add more than 3 seconds to the redirect path. If a block exceeds this, it is opt-in only.
3. **Never mislead users.** Every experience must make clear that a redirect is in progress. No fake loading screens that serve no purpose. No bait-and-switch.
4. **AI assists, never confuses.** AI recommendations are always visible, explainable, and dismissible. AI never silently overrides a user's explicit choice.
5. **Mobile-first.** Every experience is designed for a 375px viewport first, then enhanced for larger screens. Touch targets minimum 44x44px.
6. **Privacy-first.** Collect only what is needed. Never sell user data. Analytics are aggregated by default. Individual tracking requires explicit consent.
7. **Accessibility-first.** WCAG 2.1 AA compliance is a launch requirement, not a backlog item. Every interactive element is keyboard-navigable and screen-reader-compatible.
8. **SEO-first.** Every public page has unique metadata, structured data, and a clear internal linking strategy. The platform builds topical authority, not just keyword density.
9. **Scalable by default.** Every feature is designed to handle 1000x current load without rewrites. Database queries are indexed. API responses are cached. Components are memoized.
10. **Every feature must justify its existence.** Before building, answer: What user problem does this solve? What metric does it improve? If neither answer is concrete, do not build it.

---

## 3. Design Language

### Colors

The Shrtul palette is built on a neutral foundation with two purposeful accents. No purple, no indigo, no violet.

| Token | Light | Dark | Usage |
|------|------|------|-------|
| `primary` | `#0ea5e9` (sky-500) | `#38bdf8` (sky-400) | Primary actions, links, active states |
| `accent` | `#14b8a6` (teal-500) | `#2dd4bf` (teal-400) | Secondary highlights, gradients |
| `success` | `#22c55e` (green-500) | `#4ade80` (green-400) | Positive states, confirmations |
| `warning` | `#f59e0b` (amber-500) | `#fbbf24` (amber-400) | Caution, pending states |
| `error` | `#ef4444` (red-500) | `#f87171` (red-400) | Errors, destructive actions |
| `background` | `#ffffff` | `#0a0a0f` | Page background |
| `card` | `#f8fafc` (slate-50) | `#12121a` | Elevated surfaces |
| `muted` | `#f1f5f9` (slate-100) | `#1a1a25` | Subtle backgrounds |
| `foreground` | `#0f172a` (slate-900) | `#f1f5f9` | Primary text |
| `muted-foreground` | `#64748b` (slate-500) | `#94a3b8` (slate-400) | Secondary text |
| `border` | `#e2e8f0` (slate-200) | `#1e1e2e` | Borders, dividers |

**Gradient**: `linear-gradient(135deg, primary, accent)` — used sparingly for hero text, primary CTAs, and icon backgrounds. Never on body text.

### Typography

- **Font family**: Inter (system fallback: `-apple-system, BlinkMacSystemFont, sans-serif`)
- **Display/headings**: Inter, weights 600-700, tracking tight (`-0.02em`)
- **Body**: Inter, weight 400, tracking normal
- **Small/labels**: Inter, weight 500, tracking normal
- **Maximum 3 weights per page**: 400, 600, 700
- **Line height**: 1.5 for body, 1.2 for headings
- **Scale**: 12px (xs), 14px (sm), 16px (base), 18px (lg), 20px (xl), 24px (2xl), 30px (3xl), 36px (4xl), 48px (5xl), 60px (6xl), 72px (7xl)

### Icon style

- **Library**: `lucide-react` exclusively. No mixed icon sets.
- **Size**: 16px (inline), 20px (navigation), 24px (feature cards), 48px (hero)
- **Stroke width**: 2 (default)
- **Color**: inherits from parent text color, or uses `primary` for emphasis

### Animations

- **Duration**: 150ms (micro), 300ms (standard), 500ms (emphasis), 1000ms+ (ambient)
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for standard, `cubic-bezier(0.17, 0.67, 0.12, 0.99)` for playful
- **Principles**: Animate to inform, never to decorate. Every animation must communicate state change, spatial relationship, or cause-and-effect.
- **Reduced motion**: All animations respect `prefers-reduced-motion: reduce`.

### Spacing

- **Base unit**: 8px
- **Scale**: 4px (0.5), 8px (1), 12px (1.5), 16px (2), 20px (2.5), 24px (3), 32px (4), 40px (5), 48px (6), 64px (8), 80px (10), 96px (12)
- **Page padding**: 16px mobile, 24px tablet, 32px desktop
- **Section padding**: 64px vertical mobile, 96px vertical desktop

### Cards

- **Border radius**: 16px (2xl) for standard cards, 24px (3xl) for feature/hero cards
- **Border**: 1px solid `border` token
- **Background**: `card` token with `glass` (backdrop-blur) or `glass-strong` variant
- **Padding**: 24px standard, 32px spacious
- **Hover**: subtle lift via `card-hover` (translateY -2px + shadow increase)

### Buttons

| Variant | Background | Text | Border | Usage |
|--------|-----------|------|--------|-------|
| Primary | `primary` | `primary-foreground` | none | Main action per view |
| Secondary | `card` | `foreground` | `border` | Alternative action |
| Ghost | transparent | `muted-foreground` | none | Tertiary actions |
| Destructive | `error` | white | none | Delete, remove |
| Outline | transparent | `primary` | `primary` | High-emphasis secondary |

- **Height**: 36px (sm), 40px (default), 48px (lg)
- **Border radius**: 10px (lg)
- **Font**: 14px, weight 500
- **Hover**: background opacity 90%, scale 1.02 for primary
- **Focus**: 2px ring at `ring-offset` distance
- **Disabled**: opacity 50%, no hover effects

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `md` | `0 4px 6px rgba(0,0,0,0.07)` | Cards, dropdowns |
| `lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, popovers |
| `xl` | `0 20px 25px rgba(0,0,0,0.1)` | Hero CTAs |
| `glow` | `0 0 20px rgba(14,165,233,0.3)` | Primary accent glow |

### Border radius

- 8px (lg) — inputs, small buttons, badges
- 12px (xl) — navigation items, tabs
- 16px (2xl) — cards, code blocks
- 24px (3xl) — hero sections, feature cards
- 9999px (full) — pills, avatars, status dots

### Dark mode

- Dark mode is the default for the dashboard and studio (creative tools work better dark).
- Light mode is the default for marketing pages and docs.
- Toggle is always available in the header.
- No mixed-mode on a single page — the entire page follows one theme.
- Transitions between modes: 200ms color fade, no flash of incorrect theme.

---

## 4. UX Rules

### The three questions every page must answer

When a user lands on any page, they must instantly know:

1. **Where am I?** — Breadcrumb, page title, active nav state. The user must never wonder which section of the product they are in.
2. **What can I do?** — Primary actions visible above the fold. Secondary actions in context menus or dropdowns. No hidden features that require discovery.
3. **What should I do next?** — One clear primary action per page. If there are two equally important actions, the page design is wrong.

### Click budget

- **Maximum 3 clicks** to complete any important task (create a link, view analytics, install a template, configure a workflow).
- If a task requires more than 3 clicks, the flow must be redesigned.
- "Click" includes taps on mobile. Dropdown selections count as clicks.

### Cognitive load rules

- **One primary action per screen.** If two actions compete, split into steps.
- **Maximum 7 items** in any visible list before grouping, filtering, or paginating.
- **Progressive disclosure.** Show only what is needed now. Reveal complexity on demand via modals, drawers, and expandable sections.
- **No dead ends.** Every page must have a next step. If a user reaches a page with no forward path, it is a bug.
- **Error messages must help.** Never show "Something went wrong." Always explain what happened and what the user should do next.

### Form rules

- Inline validation, never submit-then-error.
- Maximum 5 fields before splitting into steps.
- Required fields marked with `*`, not color alone.
- Submit buttons disabled until required fields are valid.
- Success state visible and dismissible.

---

## 5. Navigation Rules

### Primary navigation (marketing site)

```
Home | Ecosystem ▾ | Features ▾ | Solutions ▾ | Templates | Docs | Pricing
```

- Ecosystem dropdown: Platform Overview, Studio, Flow, Insights, Market, Labs, Developer
- Features dropdown: Smart Links, Click Experiences, Analytics, QR Experiences, Custom Domains
- Solutions dropdown: Marketing, Campaigns, Personalization, Interactive Links
- Maximum 7 top-level items. No more.

### Secondary navigation (dashboard)

```
Overview | Links | Analytics | Marketplace | Plugins | Webhooks | Notifications | Settings | Billing
```

- Left sidebar on desktop, bottom tab bar on mobile (5 items max, overflow in "More")
- Active item highlighted with `primary` color and left border accent
- Badge counts for notifications and pending items

### Dashboard hierarchy

```
Dashboard
├── Overview (default landing)
├── Links
│   ├── All Links
│   ├── Create New
│   └── [Link Detail] → Analytics, Settings, Delete
├── Analytics
├── Marketplace → Browse, Installed, Published
├── Plugins → Installed, Available
├── Webhooks → Endpoints, Logs
├── Notifications
├── Settings → Profile, Workspace, API Keys
└── Billing → Plan, Invoices, Usage
```

### Admin hierarchy

```
Admin
├── Dashboard (stats overview)
├── Users → All, Suspended, Admins
├── Links → All, Flagged, Expired
├── Analytics → Platform-wide
├── Reports → Usage, Revenue, Abuse
├── Support → Tickets, Responses
├── Settings → Platform config, Feature flags
└── Announcements
```

### Mobile navigation

- Header collapses to hamburger menu
- Dashboard sidebar becomes bottom tab bar (Overview, Links, Analytics, More)
- "More" opens a sheet with remaining items
- No nested dropdowns on mobile — use accordion expansion

### Developer navigation

- `/developer-api` page with: API Reference, SDKs, Webhooks, Plugin Guide, Changelog
- Code examples with language tabs (cURL, JS, Python, Go)
- API key management in dashboard Settings

### Enterprise navigation

- `/enterprise` page with: SSO, Audit Logs, Role-Based Access, White-Label, SLA, Custom Contracts
- Enterprise features gated by plan tier, shown but locked with upgrade prompt

### Navigation confusion prevention

- Never link to the same destination from two different nav labels.
- Never use the same label for two different destinations.
- Breadcrumbs on every dashboard page.
- Back button always returns to the logically previous page, not the browser history.

---

## 6. Component Library

### Rule

Every UI element must be built from the existing component library. If a new visual pattern is needed, add it to the library first — never create a one-off component.

### Core components (already in `components/ui/`)

`accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toast, toggle, toggle-group, tooltip`

### Naming convention

- UI primitives: `components/ui/<name>.tsx` (shadcn/ui convention)
- Feature components: `components/<feature-name>.tsx`
- Demo/interactive: `components/demo/<name>.tsx`
- Hooks: `hooks/use-<name>.ts`
- Lib utilities: `lib/<name>.ts`
- Engines: `engines/<name>/<file>.ts`
- Pages: `app/<route>/page.tsx`

### Reuse rules

- Before creating a component, search the library. If an 80% match exists, extend it.
- Never duplicate a component with minor styling differences — use props or variants.
- Every component accepts `className` for override. Never hardcode styles that block composition.
- Components are typed with explicit prop interfaces. No `any` props.

---

## 7. Database Standards

### Naming conventions

- **Tables**: `snake_case`, plural (e.g., `links`, `clicks`, `profiles`)
- **Columns**: `snake_case` (e.g., `created_at`, `user_id`, `is_active`)
- **Foreign keys**: `<table_singular>_id` (e.g., `user_id`, `link_id`, `workspace_id`)
- **Indexes**: `idx_<table>_<columns>` (e.g., `idx_links_user_id`)
- **Constraints**: `fk_<table>_<ref_table>`, `chk_<table>_<condition>`
- **Enums**: lowercase with underscores (e.g., `link_type`, `plan_tier`)

### Relationships

- Every table has a `uuid` primary key (`id uuid primary key default gen_random_uuid()`).
- Foreign keys are always `references` with `on delete` specified explicitly.
- No nullable foreign keys unless the relationship is genuinely optional.
- Junction tables for many-to-many: `<table_a>_<table_b>` with composite primary key.

### Indexes

- Every foreign key gets an index.
- Every column used in `where` or `order by` gets an index.
- Composite indexes for common filter combinations (e.g., `(user_id, created_at)`).
- No indexes on low-cardinality columns (e.g., `is_active`).

### Audit logs

- Every mutable table has `created_at`, `updated_at`, `created_by`, `updated_by` columns.
- Destructive operations (delete, expire) use soft delete (`deleted_at timestamp`) unless the row is truly disposable (click events, analytics).
- Audit trail table: `audit_logs(id, user_id, action, table_name, record_id, changes jsonb, created_at)`.

### Soft delete strategy

- User-facing content (links, experiences, templates): soft delete with `deleted_at`.
- High-volume event data (clicks, analytics): hard delete via retention policy (90 days raw, aggregated beyond).
- Never soft-delete then leave orphaned foreign keys — cascade or nullify explicitly.

### Migration strategy

- Every schema change is a migration file: `supabase/migrations/<timestamp>_<description>.sql`
- Migrations are forward-only. No `DROP` columns, no type changes, no renames. Create new column, migrate data, mark old as deprecated.
- Every migration includes `ENABLE ROW LEVEL SECURITY` for new tables.
- Every migration includes the 4 RLS policies (SELECT, INSERT, UPDATE, DELETE) — never `FOR ALL`.
- Test migration on a copy before applying to production.

### Backup strategy

- Supabase automatic daily backups (managed).
- Critical user data (links, experiences, templates) exported weekly to cold storage.
- Analytics data is reproducible from raw click logs — no separate backup needed.

---

## 8. API Standards

### REST naming

- Resources are plural nouns: `/api/links`, `/api/clicks`, `/api/templates`
- Nested resources: `/api/links/{id}/clicks`
- Actions on resources: `/api/links/{id}/expire` (verb as suffix)
- Never more than 2 levels of nesting.

### Versioning

- Current version: v1 (implicit, no prefix for now).
- When breaking changes are needed, add `/api/v2/` prefix and deprecate v1 with a 6-month sunset.
- Never break a response field without a version bump. Adding fields is non-breaking.

### Authentication

- Bearer token: `Authorization: Bearer <supabase_access_token>`
- API keys for programmatic access: `X-API-Key: <key>` (managed in dashboard settings)
- Service role key never exposed to clients. Only used in server-side code and edge functions.

### Rate limiting

| Scope | Limit | Window |
|-------|-------|--------|
| Anonymous | 10 | per minute |
| Authenticated | 100 | per minute |
| API key | 1000 | per minute |
| Enterprise | Custom | Custom |

- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- 429 response includes `Retry-After` header.

### Response format

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

Error format:

```json
{
  "error": {
    "code": "LINK_NOT_FOUND",
    "message": "The requested link does not exist.",
    "details": { ... }
  }
}
```

### Pagination

- Cursor-based for large datasets: `?cursor={id}&limit=20`
- Offset-based for small datasets: `?page=1&per_page=20`
- Maximum `per_page` is 100.

### Caching

- GET responses cached for 60 seconds via `Cache-Control: public, max-age=60, s-maxage=300`.
- Analytics data cached for 5 minutes.
- Never cache authenticated user-specific data in shared caches.

---

## 9. AI Standards

### How AI behaves

- AI is a recommendation engine, not an autonomous agent. It suggests, the user decides.
- Every AI suggestion includes a one-sentence explanation: "Recommended because [reason]."
- AI never modifies user data without explicit confirmation.
- AI-generated content is always editable before saving.

### When AI is active

- Experience generation from text prompts (Studio)
- Experience optimization recommendations (Insights)
- Workflow suggestions based on patterns (Flow)
- Template matching for marketplace (Market)
- Predictive analytics for conversion rates (Insights)

### When AI is disabled

- When the user is in a manual editing mode
- When the user has explicitly turned off AI features in settings
- When the user is on the Free plan (AI features are paid)
- When the request contains sensitive content (PII, health, financial)

### Fallback behavior

- If AI generation fails, show the manual builder with a note: "AI is unavailable. You can build manually."
- If AI insights are empty, show: "Not enough data yet. Insights appear after 100 clicks."
- If AI prediction confidence is below 60%, do not show the prediction.
- Never show a blank AI section — always provide a meaningful fallback.

### Privacy policy

- AI does not train on individual user content without consent.
- AI features that use third-party models send only the prompt text, never user PII.
- AI processing happens server-side. No AI model runs in the browser.
- Users can delete all AI-generated data from Settings.

### Learning strategy

- The platform learns from aggregate patterns (which experiences convert best for which audiences).
- Individual user behavior is never used to train models without explicit opt-in.
- Learning data is anonymized and aggregated before use.

---

## 10. Security Standards

### Authentication

- Supabase Auth with email/password only. No social login unless explicitly requested.
- Email confirmation OFF by default (can be enabled per workspace).
- Session tokens are JWT, refreshed automatically by the Supabase client.
- Admin access requires `is_admin` flag on profile, verified server-side on every request.

### Authorization

- Row Level Security on every table. No exceptions.
- Users can only access their own workspace data: `auth.uid() = user_id`.
- Admin routes check `is_admin` server-side, never trust client-side checks.
- API keys are scoped: read-only, write, or admin. Default scope is read-only.

### Encryption

- TLS 1.3 for all connections. No HTTP fallback.
- Database columns with sensitive data (API keys, tokens) encrypted at rest via Supabase.
- Never store secrets in environment variables that are exposed to the browser.
- `.env` files never committed to git. `.env.example` contains only key names, never values.

### Logging

- Security events logged: failed logins, admin access, API key creation, data exports.
- Logs retained for 90 days.
- No PII in logs. No request bodies in logs.
- Logs are append-only and tamper-evident.

### Secrets

- All secrets stored in Supabase Edge Function secrets or environment variables.
- Never hardcode secrets in source code.
- Never expose service role key to the browser.
- API keys are shown once at creation, then hashed. Users can regenerate but never view again.

### Input validation

- All API inputs validated with explicit schema (Zod or TypeScript types).
- SQL queries always use parameterized statements via Supabase client. Never string concatenation.
- User-generated content (link URLs, experience text) sanitized before storage.
- URL destinations validated against blocklist (malware, phishing) before redirect.

### Audit trail

- Every admin action logged with user, action, target, timestamp, and IP.
- Every data export logged and rate-limited.
- Every API key usage logged for the first 100 calls per key.

### Bot protection

- Rate limiting on link creation (10 per minute for authenticated users).
- CAPTCHA on signup and password reset.
- Suspicious click patterns (rapid-fire, single IP, bot user-agents) flagged and excluded from analytics.
- Honeypot fields on public forms.

### Abuse prevention

- Links flagged after 3 user reports. Auto-disabled after 10.
- IP blocking available to admins.
- Content scanning for malware/phishing on destination URLs.
- Account suspension after abuse threshold, with appeal process.

---

## 11. SEO Standards

### Metadata

- Every page has a unique `<title>` (max 60 chars), `meta description` (max 155 chars), and canonical URL.
- Title format: `Page Name — Shrtul X` (homepage: `Shrtul X — AI Click Experience Platform`).
- No duplicate titles or descriptions across pages.

### Schema (structured data)

- `WebApplication` schema on homepage and platform page.
- `Product` schema on ecosystem product pages with offers and ratings.
- `FAQPage` schema on FAQ sections.
- `BreadcrumbList` schema on all dashboard and docs pages.
- `BlogPosting` schema on blog articles.
- All schema rendered as `application/ld+json` script tags.

### Canonical

- Every page has `<link rel="canonical" href="https://shrtul.com/{path}" />`.
- No self-referencing canonicals on paginated pages — use `rel="next"` and `rel="prev"`.
- Query parameters stripped from canonical URLs unless they change content meaningfully.

### Internal links

- Every page links to at least 2 other pages in the platform.
- Footer contains links to all major sections.
- Related content links at the bottom of every content page.
- No orphan pages (pages with no internal links pointing to them).

### Sitemaps

- `sitemap.xml` auto-generated, includes all public pages.
- Sitemap updated on every deployment.
- Separate sitemap for blog content.
- Sitemap submitted to Google Search Console on deploy.

### Robots

- `robots.txt` allows all public marketing pages.
- Disallows `/dashboard/*`, `/admin/*`, `/api/*`, `/unlock/*`.
- Sitemap location declared in robots.txt.

### Open Graph

```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://shrtul.com/api/og/{page}" />
<meta property="og:url" content="https://shrtul.com/{path}" />
<meta property="og:type" content="website" />
```

- Dynamic OG images generated via `/api/og` route.
- 1200x630px, branded with Shrtul X gradient and page title.

### Twitter Cards

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="https://shrtul.com/api/og/{page}" />
```

### Content architecture

```
/ (homepage)
/platform (ecosystem overview)
/studio, /flow, /insights, /market, /labs (products)
/smart-links, /click-experience, /qr-experience (features)
/marketing-links, /link-campaigns, /link-personalization (solutions)
/blog (content hub)
/docs (documentation)
/pricing (pricing)
```

### Programmatic SEO

- Use-case pages generated from templates: "How [industry] uses interactive links"
- Comparison pages: "Shrtul X vs Bitly", "Shrtul X vs Linktree"
- Location pages for local SEO if applicable
- Each programmatic page has unique content, not just template substitution

---

## 12. Performance Standards

### Page load

- **Maximum page load**: 2 seconds on 4G mobile.
- **LCP target**: < 1.5 seconds.
- **FID target**: < 100ms.
- **CLS target**: < 0.1.
- **INP target**: < 200ms.

### Redirect delay

- **Maximum redirect delay**: 3 seconds from click to destination.
- **Default experience duration**: 5 seconds maximum.
- **Skip option**: always visible within 1 second of experience start.
- **Instant mode**: users can configure zero-delay redirects (no experience).

### Bundle size

- **Maximum first-load JS**: 150KB per page (shared chunks excluded).
- **Maximum per-route chunk**: 80KB.
- **Maximum total page weight**: 500KB (including images).
- Code splitting on every route. No monolithic bundles.

### Image optimization

- All images served via `next/image` with automatic format negotiation (WebP, AVIF).
- Stock photos from Pexels only (never download, always reference by URL).
- Maximum image size: 200KB per image, 100KB for above-the-fold.
- Lazy load all below-the-fold images.

### Database optimization

- No query without an index on the filter column.
- No N+1 queries — use joins or batch fetch.
- Analytics queries use materialized views or pre-aggregated tables.
- Maximum 5 joins per query. If more, denormalize.

### Caching strategy

- Static pages: ISR with 60-second revalidation.
- API GET responses: 60-second server cache, 300-second CDN cache.
- Analytics data: 5-minute cache with SWR on the client.
- Database reads: Supabase connection pooling, no client-side caching.
- Images: 1-year cache with immutable headers.

---

## 13. Quality Rules

1. **No duplicated code.** If the same logic appears in 2+ files, extract to a shared utility.
2. **No dead code.** If a function is not called, delete it. If an import is not used, remove it.
3. **No placeholder UI.** Every button must do something. Every link must go somewhere. "Coming soon" is acceptable only with a concrete ship date.
4. **No fake screenshots.** Every demo must be a real, working interactive component. Static images of UI are prohibited.
5. **Every demo must work.** Interactive demos on marketing pages must be fully functional, not mockups.
6. **Every feature must be testable.** If a feature cannot be verified in the browser, it is not done.
7. **No console errors.** Build must pass with zero TypeScript errors and zero ESLint warnings.
8. **No unused dependencies.** Every package in `package.json` must be imported somewhere.
9. **No commented-out code.** Delete it. Git remembers.
10. **No `any` types.** Every function parameter, return type, and variable must have an explicit type.

---

## 14. Future Compatibility

Every feature must be designed to support these from day one, even if not yet implemented:

| Capability | Requirement |
|-----------|-------------|
| **Plugins** | All features expose hooks. Core logic never hardcodes behavior that a plugin should provide. |
| **Marketplace** | Every user-created resource (experience, template, workflow) is serializable and transferable. |
| **AI** | Every feature has an AI-assist entry point. Not required to use, but the hook must exist. |
| **API** | Every feature is accessible via API. If a user can do it in the UI, they can do it via API. |
| **Enterprise** | Every feature supports multi-tenant workspaces, role-based access, and audit logging. |
| **Localization** | All user-facing strings are externalized. No hardcoded English in components. |
| **White-label** | Branding (logo, colors, domain) is configurable per workspace. No hardcoded brand assets in core. |
| **Multi-tenant** | Every database table has `workspace_id`. Every query is scoped to a workspace. |

---

## 15. Final Review Checklist

Before merging any feature, verify ALL of the following. If any answer is "No", the feature is not ready to merge.

- [ ] **Does it improve the product?** — It solves a real user problem or measurably improves a metric.
- [ ] **Does it match the vision?** — It advances the "AI Click Experience Platform" category, not generic SaaS features.
- [ ] **Is it scalable?** — It handles 1000x current load without architectural changes.
- [ ] **Is it reusable?** — It uses existing components. If new, it is added to the library for reuse.
- [ ] **Is it secure?** — RLS enabled, inputs validated, no secrets exposed, auth checked server-side.
- [ ] **Is it SEO-friendly?** — Unique metadata, structured data, internal links, canonical URL.
- [ ] **Is it mobile-friendly?** — Works on 375px viewport. Touch targets 44x44px. No horizontal scroll.
- [ ] **Is it accessible?** — Keyboard navigable. Screen reader compatible. Color contrast 4.5:1 minimum.
- [ ] **Does it pass the build?** — `npm run build` exits with zero errors and zero warnings.
- [ ] **Does it respect the constitution?** — No article is violated. No shortcut was taken that the constitution prohibits.

---

## Amendment Process

This constitution is a living document. To amend it:

1. Propose the change with rationale (what problem does the amendment solve?).
2. Verify the amendment does not contradict existing articles.
3. Update this document with the change and a note on what was amended and why.
4. All future development follows the amended version.

No article is silently ignored. If a feature requires violating an article, the article must be amended first.

---

*This constitution is the source of truth for Shrtul X. Every developer, every AI agent, and every decision must answer to it.*
