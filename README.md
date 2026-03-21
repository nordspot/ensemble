# ensemble

**Die Fachkongress-Plattform der Schweiz**

[https://ensemble.events](https://ensemble.events)

![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)
![D1](https://img.shields.io/badge/Cloudflare-D1-F38020?logo=cloudflare)
![R2](https://img.shields.io/badge/Cloudflare-R2-F38020?logo=cloudflare)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)

---

## Overview

Ensemble is a professional congress management platform for medical, scientific, engineering, legal, and academic conventions. It covers the entire congress lifecycle from registration and abstract submission through live transcription and Q&A to post-event on-demand content, CME certificates, and AI-generated event reports.

Built by **Nord** ([nord.spot](https://nord.spot)) -- a Swiss AI agency based in Ittigen, Switzerland.

**Key differentiators:**

- 100% Swiss-hosted on Cloudflare (EU jurisdiction for GDPR/DSG compliance)
- Cloudflare-native architecture: D1, R2, KV, Vectorize, Durable Objects, Workers AI
- AI-powered: RAG knowledge base, live transcription, session summaries, coaching
- Real-time: WebSocket chat, live Q&A, presence tracking, audience polls
- Multi-language: DE, FR, IT, EN
- PWA-ready with push notifications and offline support

---

## Features

### 1. Programm & Sessions
- Multi-track programme with day/track/room views
- Session detail pages with speaker bios, abstracts, and materials
- Personal schedule builder ("Mein Plan")
- Session booking with capacity management
- Abstract submission and peer review workflow

### 2. Registrierung & Ticketing
- Multi-tier ticket types (early bird, standard, student, VIP)
- Stripe payment integration
- QR code e-tickets and badge generation (PDF)
- Group registrations and institutional invoicing

### 3. Live-Event
- Live Q&A with upvoting per session (Durable Objects)
- Audience polls with real-time results
- Live transcription via Whisper V3 Turbo (Workers AI)
- Live streaming integration
- Signage mode for room displays

### 4. Indoor-Navigation
- BLE beacon-based indoor positioning (iBeacon/Eddystone)
- Dijkstra wayfinding algorithm for room-to-room navigation
- Venue map with real-time attendee density
- Automatic session check-in via beacon proximity
- QR code fallback for beacon-less venues

### 5. Networking & Kontakte
- NFC badge tap for contact exchange (NTAG215)
- QR code fallback for contact sharing
- Contact list with notes and export (vCard)
- "Find nearby" attendees via beacon proximity

### 6. Chat & Kommunikation
- Real-time 1:1 and group chat (Durable Objects with Hibernatable WebSockets)
- Per-congress chat channels
- Message persistence in DO SQLite storage
- Push notifications for new messages

### 7. Ausstellung & Sponsoren
- Exhibitor profiles with logo, description, and booth location
- Sponsor tiers (platinum, gold, silver, bronze)
- Lead scanning for exhibitors
- Digital booth content (videos, brochures)

### 8. KI & Wissen
- RAG knowledge base from congress content (Vectorize + Claude)
- AI coach chat for attendee questions
- Session summarization
- AI-powered translation
- Knowledge ingestion pipeline (embeddings worker)

### 9. Gamification
- Points system for session attendance, networking, quiz participation
- Leaderboard with congress-scoped rankings
- Achievement badges
- Referral tracking

### 10. CME / Fortbildung
- CME credit tracking per session
- Attendance verification (beacon + quiz)
- Certificate generation (PDF)
- Conflict-of-interest disclosures for speakers

### 11. Medien & Inhalte
- Photo gallery with live feed
- On-demand session recordings
- Poster gallery with digital uploads
- Article/publication submission and review
- Speaker slide uploads

### 12. Administration
- Multi-congress management dashboard
- Attendee management and check-in
- Speaker invitation workflow
- Analytics dashboard (registrations, attendance, revenue)
- Data export (attendees CSV, schedule iCal)
- Profile management with GDPR data export and deletion

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript 5.7, Tailwind CSS v4, Framer Motion, Lucide icons, Sonner toasts, cmdk |
| **Backend** | Cloudflare Workers (via OpenNext), D1 (SQLite), R2 (object storage), KV (caching/rate limiting) |
| **Real-time** | Durable Objects with Hibernatable WebSockets (ChatRoom, SessionChannel, PresenceZone) |
| **AI** | Claude Sonnet 4 via AI Gateway (RAG, summaries, coaching), Workers AI -- Whisper V3 Turbo (STT), @cf/baai/bge-base-en-v1.5 (embeddings) |
| **Vector Search** | Cloudflare Vectorize (RAG knowledge base) |
| **Auth** | Auth.js v5 with D1 adapter, JWT sessions |
| **Payments** | Stripe (international), NordPay/Payrexx (Swiss) |
| **Email** | Resend (transactional + newsletters) |
| **i18n** | next-intl v4 (DE, FR, IT, EN) |
| **State** | Zustand v5 (client), TanStack Query (server) |
| **Bluetooth** | Web Bluetooth API (BLE beacons) |
| **NFC** | Web NFC API (badge tap) |
| **PWA** | Service Worker, Web Push (VAPID) |

---

## Project Structure

```
ensemble/
├── app/                        # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/       # i18n pages (52 pages)
│   │   │   └── api/            # API routes (58 endpoints)
│   │   ├── components/         # 97 React components
│   │   │   ├── admin/          # Admin dashboard components
│   │   │   ├── ai/             # AI coach, knowledge chat
│   │   │   ├── auth/           # Login, register, password reset
│   │   │   ├── beacon/         # BLE beacon scanner
│   │   │   ├── chat/           # Real-time chat UI
│   │   │   ├── cme/            # CME tracking, certificates
│   │   │   ├── congress/       # Congress cards, details
│   │   │   ├── contact/        # Contact exchange, NFC
│   │   │   ├── exhibition/     # Exhibitor profiles
│   │   │   ├── gallery/        # Photo gallery
│   │   │   ├── gamification/   # Points, leaderboard
│   │   │   ├── landing/        # Marketing landing page
│   │   │   ├── layout/         # Header, footer, sidebar
│   │   │   ├── live/           # Q&A, polls, transcription, streaming
│   │   │   ├── networking/     # Networking features
│   │   │   ├── profile/        # User profile
│   │   │   ├── providers/      # Context providers
│   │   │   ├── shared/         # Shared UI primitives
│   │   │   └── ui/             # Base UI components
│   │   ├── hooks/              # 8 custom hooks
│   │   ├── lib/                # Business logic
│   │   │   ├── ai/             # Claude integration, RAG
│   │   │   ├── auth/           # Auth.js config, D1 adapter
│   │   │   ├── beacon/         # BLE beacon utilities
│   │   │   ├── db/             # D1 queries, schema helpers
│   │   │   ├── email/          # Resend templates
│   │   │   ├── export/         # CSV/iCal export
│   │   │   ├── knowledge/      # RAG ingestion pipeline
│   │   │   ├── nfc/            # NFC badge logic
│   │   │   ├── payments/       # Stripe integration
│   │   │   ├── pdf/            # Badge + certificate generation
│   │   │   ├── push/           # Web Push (VAPID)
│   │   │   ├── realtime/       # WebSocket client
│   │   │   ├── security/       # Rate limiting, Turnstile
│   │   │   └── storage/        # R2 file operations
│   │   ├── stores/             # 8 Zustand stores
│   │   ├── types/              # Domain type definitions
│   │   ├── messages/           # i18n translations (de/en/fr/it.json)
│   │   └── i18n/               # next-intl routing config
│   ├── migrations/             # 9 D1 SQL migrations
│   ├── public/                 # Static assets, fonts, PWA manifest
│   └── wrangler.jsonc          # Cloudflare bindings config
├── workers/                    # Separate Cloudflare Workers
│   ├── realtime/               # Durable Objects (chat, Q&A, presence)
│   ├── transcription/          # Whisper STT worker
│   ├── embeddings/             # BGE vectorization worker
│   └── notifications/          # Push notification delivery
├── branding/                   # Logo assets
├── .github/workflows/
│   └── deploy.yml              # CI/CD pipeline
└── ENSEMBLE-MASTER-PROMPT.md   # Full build specification
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- Wrangler CLI (`npm i -g wrangler`)
- Cloudflare account with Workers Paid plan

### Install and Run

```bash
# Clone
git clone https://github.com/nordspot/ensemble.git
cd ensemble/app

# Install dependencies
npm install --legacy-peer-deps

# Run locally (with Turbopack)
npm run dev

# Run with Cloudflare bindings locally
npm run preview

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy
# Equivalent to: npx opennextjs-cloudflare build && npx wrangler deploy
```

### Database Migrations

```bash
# Apply migrations locally
npm run db:migrate:local

# Apply migrations to production
npm run db:migrate
```

---

## Environment Variables / Secrets

All secrets are set via `wrangler secret put <KEY>` (not committed to git).

Public variables are in `wrangler.jsonc` under `vars`.

| Variable | Description | Set via |
|----------|-------------|---------|
| `AUTH_SECRET` | Auth.js session encryption key | `wrangler secret put` |
| `AUTH_URL` | `https://ensemble.events` | `wrangler.jsonc` vars |
| `NEXTAUTH_URL` | `https://ensemble.events` | `wrangler.jsonc` vars |
| `RESEND_API_KEY` | Resend email delivery API key | `wrangler secret put` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `wrangler secret put` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `wrangler secret put` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `wrangler.jsonc` vars |
| `ANTHROPIC_API_KEY` | Claude API key for RAG/summaries | `wrangler secret put` |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server key | `wrangler secret put` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile client key | `wrangler.jsonc` vars |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key | `wrangler secret put` |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key | `wrangler secret put` |

---

## Database

- **Engine:** Cloudflare D1 (SQLite-based, serverless, EU jurisdiction)
- **Migrations:** 9 sequential SQL files in `app/migrations/`
- **Tables:** 50+ tables covering all 12 domains
- **Conventions:** TEXT IDs (`lower(hex(randomblob(16)))`), INTEGER booleans, TEXT timestamps

### Seed Demo Data

```bash
curl "https://ensemble.events/api/seed?key=ensemble-seed-2026"
```

### Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@ensemble.events` | `Admin2026!` | Platform Admin |
| `organizer@ensemble.events` | `Organizer2026!` | Congress Organizer |
| `speaker@ensemble.events` | `Speaker2026!` | Speaker |
| `reviewer@ensemble.events` | `Reviewer2026!` | Abstract Reviewer |
| `attendee@ensemble.events` | `Attendee2026!` | Attendee |
| `exhibitor@ensemble.events` | `Exhibitor2026!` | Exhibitor |
| `moderator@ensemble.events` | `Moderator2026!` | Session Moderator |
| `cme@ensemble.events` | `CME2026!` | CME Administrator |

---

## API Routes

### Auth (5 routes)
- `POST /api/auth/[...nextauth]` -- Auth.js handler (sign in, sign out, session)
- `POST /api/auth/register` -- User registration
- `POST /api/auth/validate` -- Email/token validation
- `POST /api/auth/forgot-password` -- Request password reset
- `POST /api/auth/reset-password` -- Reset password with token

### AI (3 routes)
- `POST /api/ai/coach` -- AI knowledge coach chat
- `POST /api/ai/summarize` -- Session/content summarization
- `POST /api/ai/translate` -- AI-powered translation

### Chat (2 routes)
- `GET/POST /api/chat` -- List/create conversations
- `GET/POST /api/chat/[conversationId]/messages` -- List/send messages

### Congress (1 route)
- `GET/POST /api/congress` -- List/create congresses

### Congress-scoped (38 routes)
- `GET/PUT /api/congress/[congressId]` -- Congress details
- `GET/POST /api/congress/[congressId]/sessions` -- Sessions CRUD
- `POST /api/congress/[congressId]/sessions/[sessionId]/book` -- Book session
- `GET /api/congress/[congressId]/sessions/[sessionId]/transcript` -- Session transcript
- `GET/POST /api/congress/[congressId]/speakers` -- Speakers CRUD
- `POST /api/congress/[congressId]/speakers/invite` -- Invite speaker
- `GET/POST /api/congress/[congressId]/speakers/[userId]/disclosures` -- COI disclosures
- `POST /api/congress/[congressId]/speakers/[userId]/uploads` -- Speaker file uploads
- `GET/POST /api/congress/[congressId]/abstracts` -- Abstracts CRUD
- `GET/PUT /api/congress/[congressId]/abstracts/[abstractId]` -- Abstract detail
- `POST /api/congress/[congressId]/abstracts/[abstractId]/decide` -- Accept/reject abstract
- `GET/POST /api/congress/[congressId]/abstracts/[abstractId]/reviews` -- Peer reviews
- `POST /api/congress/[congressId]/register` -- Congress registration
- `GET /api/congress/[congressId]/attendees` -- List attendees
- `POST /api/congress/[congressId]/checkin` -- Check in attendee
- `GET/POST /api/congress/[congressId]/rooms` -- Room management
- `GET/POST /api/congress/[congressId]/exhibitors` -- Exhibitors CRUD
- `GET/POST /api/congress/[congressId]/contacts` -- Contact exchange
- `GET/POST /api/congress/[congressId]/qa` -- Live Q&A
- `GET/POST /api/congress/[congressId]/polls` -- Audience polls
- `GET /api/congress/[congressId]/presence` -- Beacon presence data
- `GET/POST /api/congress/[congressId]/gamification` -- Gamification points/leaderboard
- `GET/POST /api/congress/[congressId]/cme` -- CME credits
- `GET /api/congress/[congressId]/certificates/[userId]` -- CME certificate PDF
- `GET /api/congress/[congressId]/badges/[registrationId]` -- Badge PDF
- `GET/POST /api/congress/[congressId]/articles` -- Articles/publications
- `GET/POST /api/congress/[congressId]/photos` -- Photo gallery
- `GET/POST /api/congress/[congressId]/posters` -- Poster gallery
- `GET /api/congress/[congressId]/recordings` -- On-demand recordings
- `POST /api/congress/[congressId]/upload` -- File upload (R2)
- `POST /api/congress/[congressId]/knowledge/ingest` -- RAG knowledge ingestion
- `POST /api/congress/[congressId]/knowledge/search` -- RAG knowledge search
- `POST /api/congress/[congressId]/payments/create-intent` -- Stripe payment intent
- `GET /api/congress/[congressId]/payments/status` -- Payment status
- `POST /api/congress/[congressId]/payments/webhook` -- Stripe webhook
- `GET /api/congress/[congressId]/analytics` -- Analytics dashboard data
- `GET /api/congress/[congressId]/export/attendees` -- Export attendees CSV
- `GET /api/congress/[congressId]/export/schedule` -- Export schedule iCal

### Profile (3 routes)
- `GET/PUT /api/profile` -- User profile
- `GET /api/profile/export` -- GDPR data export
- `POST /api/profile/delete-request` -- GDPR deletion request

### Push Notifications (2 routes)
- `POST /api/push/subscribe` -- Register push subscription
- `POST /api/push/send` -- Send push notification

### Other (3 routes)
- `POST /api/contact` -- Contact form submission
- `GET /api/files/[...path]` -- Serve files from R2
- `POST /api/seed` -- Seed demo data
- `POST /api/transcribe` -- Audio transcription

---

## Deployment

### CI/CD

GitHub Actions (`.github/workflows/deploy.yml`) runs on push to `main`:

1. **Typecheck** -- `tsc --noEmit`
2. **Lint** -- `next lint`
3. **Build** -- `npx @opennextjs/cloudflare build`
4. **Deploy** -- `npx opennextjs-cloudflare deploy` (main branch only)

### Required GitHub Secrets

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_KEY`
- `CLOUDFLARE_EMAIL`

### Workers Deployment

The 4 separate workers in `workers/` need individual deployment:

```bash
cd workers/realtime && wrangler deploy
cd workers/transcription && wrangler deploy
cd workers/embeddings && wrangler deploy
cd workers/notifications && wrangler deploy
```

### D1 Migrations

Migrations are applied via Wrangler CLI or Cloudflare API:

```bash
cd app && wrangler d1 migrations apply ENSEMBLE_DB
```

---

## License

Proprietary -- Nord GmbH. All rights reserved.
