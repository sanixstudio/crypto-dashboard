# CryptoDash – Cryptocurrency Dashboard

A modern crypto dashboard built with **Next.js 16**, **shadcn/ui**, **CoinGecko API**, and **Clerk** authentication. Features real-time market data, price charts, search, and dark/light theming.

## Features

- **Dashboard** – Global market stats and top coins by market cap
- **Top Coins** – Browse top 50 cryptocurrencies
- **Search** – Search coins by name or symbol with instant results
- **Trending** – Most searched coins in the last 24 hours
- **Coin Detail** – Price charts (7d, 30d, 90d), ATH/ATL, volume
- **Theme** – Dark, light, and system theme support
- **Auth** – Sign in/sign up and protected settings (Clerk)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** shadcn/ui, Tailwind CSS, Recharts
- **Data:** CoinGecko API (free tier)
- **Auth:** Clerk
- **Theming:** next-themes

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

**Required for full auth (optional for basic use):**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` – from [Clerk Dashboard](https://dashboard.clerk.com)
- `CLERK_SECRET_KEY` – from Clerk Dashboard

The app runs without Clerk keys; sign-in and settings will show setup instructions.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. CoinGecko API

Uses the public API (no key) with ~30 calls/min rate limit. For a [Demo API key](https://www.coingecko.com/en/developers/dashboard), add `COINGECKO_API_KEY` to `.env.local` and update `src/lib/api/coingecko.ts` to pass it in requests.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Sign-in, sign-up
│   ├── (dashboard)/      # Main app routes
│   │   ├── coin/[id]/    # Coin detail + charts
│   │   ├── coins/        # Top 50 coins
│   │   ├── search/       # Search page
│   │   ├── settings/     # User settings (protected)
│   │   └── trending/     # Trending coins
│   └── api/              # API routes (search, coins)
├── components/
│   ├── crypto/           # Coin cards, charts, search
│   ├── layout/           # Sidebar, providers
│   └── ui/               # shadcn components
└── lib/
    ├── api/              # CoinGecko client + types
    └── utils.ts
```

## Architecture

- **SSR/ISR** – Dashboard, coins, trending use `revalidate: 60` (1 min)
- **Client** – Search, charts, theme toggle
- **Data layer** – `src/lib/api/coingecko.ts` centralizes API calls
- **API routes** – `/api/search`, `/api/coins` proxy to CoinGecko (avoids CORS)

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run lint` – Run ESLint

## License

MIT
