# CryptoDash – Cryptocurrency Dashboard

A modern crypto dashboard built with **Next.js 16**, **shadcn/ui**, **CoinGecko API**, and **Clerk** authentication. Features real-time market data, price charts, portfolio tracking, search, and dark/light theming.

## Documentation

- **[Features & User Guide](docs/FEATURES.md)** – App capabilities, user flows, and product overview
- **[Technical Architecture](docs/ARCHITECTURE.md)** – Tech stack, project structure, data flow, and API details

## Features

- **Dashboard** – Global market stats, market dominance chart, portfolio summary, top gainers/losers
- **Portfolio** – Manual holdings with P&L, cost basis, and allocation
- **Watchlist** – Save and sync favorite coins across devices
- **Top Coins** – Grid or table view with sortable data
- **Categories** – Browse coins by category
- **Trending** – Most searched coins in the last 24 hours
- **Coin Detail** – Candlestick/Area charts, 1D–Max ranges, ATH/ATL context, historical snapshot
- **Search** – Header search with instant results
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

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full structure. Summary:

```
src/
├── app/
│   ├── (auth)/           # Sign-in, sign-up
│   ├── (dashboard)/      # Main app routes (dashboard, portfolio, coins, etc.)
│   ├── actions/          # Server Actions (currency, watchlist, portfolio)
│   └── api/              # API routes (search, coins, chart, history)
├── components/
│   ├── crypto/           # Coin cards, charts, portfolio, search
│   ├── layout/           # Sidebar
│   └── ui/               # shadcn components
└── lib/
    ├── api/              # CoinGecko client + types
    └── user-preferences.ts
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
