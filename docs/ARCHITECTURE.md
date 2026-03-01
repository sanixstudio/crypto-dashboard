# CryptoDash – Technical Architecture

Technical specification, architecture, and implementation details for the CryptoDash cryptocurrency dashboard.

---

## 1. Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **React** | React | 19.2.3 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui, Radix UI | — |
| **Charts** | Lightweight Charts, Recharts | 5.x, 2.15.x |
| **Auth** | Clerk | 6.39.x |
| **Data Source** | CoinGecko API (free tier) | v3 |
| **Theming** | next-themes | 0.4.x |
| **Toasts** | Sonner | 2.0.x |

---

## 2. Project Structure

```
src/
├── app/
│   ├── (auth)/                    # Auth route group
│   │   ├── layout.tsx
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   │
│   ├── (dashboard)/               # Main app route group
│   │   ├── layout.tsx             # Sidebar, header, CoinSearch
│   │   ├── page.tsx               # Dashboard home
│   │   ├── coin/[id]/page.tsx     # Coin detail
│   │   ├── coins/page.tsx         # Top coins (grid/table)
│   │   ├── categories/page.tsx
│   │   ├── categories/[id]/page.tsx
│   │   ├── trending/page.tsx
│   │   ├── portfolio/page.tsx
│   │   ├── watchlist/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── actions/                   # Server Actions
│   │   ├── currency.ts            # getCurrency, setCurrency (cookie)
│   │   ├── watchlist.ts           # getWatchlist, add/remove/toggle
│   │   └── portfolio.ts           # getHoldings, add/update/remove
│   │
│   ├── api/                       # API Routes (proxy to CoinGecko)
│   │   ├── search/route.ts
│   │   ├── coins/route.ts
│   │   ├── watchlist/route.ts
│   │   ├── coin/[id]/history/route.ts
│   │   └── coin/[id]/chart/route.ts
│   │
│   ├── layout.tsx                 # Root layout (ThemeProvider, AuthProvider)
│   └── globals.css
│
├── components/
│   ├── crypto/                    # Domain components
│   │   ├── coin-card.tsx
│   │   ├── coin-search.tsx
│   │   ├── coin-chart-view.tsx    # Candlestick/Area + time range
│   │   ├── candlestick-chart.tsx  # Lightweight Charts
│   │   ├── area-volume-chart.tsx  # Recharts
│   │   ├── price-chart.tsx
│   │   ├── sparkline.tsx
│   │   ├── global-stats.tsx       # Market dominance pie
│   │   ├── coin-detail-actions.tsx
│   │   ├── coin-history-section.tsx
│   │   ├── watchlist-button.tsx
│   │   ├── currency-selector.tsx
│   │   ├── recently-viewed.tsx
│   │   ├── record-coin-view.tsx
│   │   ├── coins-table.tsx
│   │   ├── coins-view-toggle.tsx
│   │   ├── portfolio-summary.tsx
│   │   ├── portfolio-dashboard-card.tsx
│   │   ├── add-holding-form.tsx
│   │   └── holding-row.tsx
│   │
│   ├── layout/
│   │   └── app-sidebar.tsx
│   │
│   ├── providers/
│   │   ├── theme-provider.tsx
│   │   └── auth-provider.tsx
│   │
│   ├── ui/                        # shadcn components
│   │   ├── button, card, input, badge, etc.
│   │   ├── chart.tsx              # ChartContainer, ChartTooltip
│   │   └── sidebar.tsx
│   │
│   ├── auth-button.tsx
│   └── theme-toggle.tsx
│
├── lib/
│   ├── api/
│   │   ├── coingecko.ts           # API client, fetchApi, all endpoints
│   │   └── coingecko-types.ts     # TypeScript interfaces
│   ├── user-preferences.ts        # Holding, UserPreferences, parsePreferences
│   └── utils.ts                   # cn, formatPrice, formatPercent, etc.
│
├── hooks/
│   └── use-mobile.ts
│
└── middleware.ts                  # Clerk auth, protects /settings
```

---

## 3. Data Flow

### 3.1 Server-Side Data (SSR / ISR)

- **Pages**: Dashboard, Coins, Trending, Categories, Coin Detail, Portfolio, Watchlist
- **Revalidation**: `revalidate: 60` (1 min) for most; 300s for categories, trending
- **Flow**: Server component → `getCoinsMarkets`, `getGlobalData`, etc. → render HTML

### 3.2 API Routes (Proxy)

| Route | Purpose |
|-------|---------|
| `GET /api/search?q=` | Proxies to CoinGecko `/search` (avoids CORS) |
| `GET /api/coins?ids=&currency=` | Proxies to `/coins/markets` |
| `GET /api/coin/[id]/history?date=` | Proxies to `/coins/{id}/history` |
| `GET /api/coin/[id]/chart?days=&type=&currency=` | Proxies to OHLC or market_chart |

### 3.3 Server Actions

- **`currency.ts`**: Reads/sets `currency` cookie (USD, EUR, GBP)
- **`watchlist.ts`**: CRUD on `publicMetadata.cryptoDashboard.watchlist` via Clerk
- **`portfolio.ts`**: CRUD on `publicMetadata.cryptoDashboard.holdings` via Clerk

### 3.4 User State Storage

| Data | Storage | Location |
|------|---------|----------|
| Currency | Cookie | `currency` (1 year) |
| Watchlist | Clerk `publicMetadata` | `cryptoDashboard.watchlist` (string[]) |
| Portfolio | Clerk `publicMetadata` | `cryptoDashboard.holdings` (Holding[]) |
| Recently viewed | localStorage | Client-only |

---

## 4. CoinGecko API Integration

### 4.1 Client

- **File**: `src/lib/api/coingecko.ts`
- **Base URL**: `https://api.coingecko.com/api/v3`
- **Auth**: Optional `COINGECKO_API_KEY` (Demo key for higher limits)
- **Rate limits**: ~30 calls/min (public), higher with API key

### 4.2 Endpoints Used

| Endpoint | Function | Revalidate |
|----------|----------|------------|
| `/coins/markets` | getCoinsMarkets | 60–300s |
| `/global` | getGlobalData | 60s |
| `/coins/{id}` | getCoinById | 60s |
| `/coins/{id}/ohlc` | getCoinOHLC | 60s |
| `/coins/{id}/market_chart` | getCoinMarketChart | 60s |
| `/coins/{id}/history` | getCoinHistory | 86400s |
| `/search` | searchCoins | — |
| `/search/trending` | getTrendingCoins | 300s |
| `/coins/categories/list` | getCategoriesList | 300s |
| `/simple/price` | getSimplePrices | 300s |

### 4.3 Error Handling

- `CoinGeckoRateLimitError` on 429
- `revalidatePath` used in server actions for cache invalidation

---

## 5. Auth & Middleware

- **Provider**: Clerk (`AuthProvider` in root layout)
- **Middleware**: Protects `/settings` when Clerk keys are configured
- **Fallback**: App works without Clerk (watchlist/portfolio require sign-in)

---

## 6. Charts

| Chart | Library | Use Case |
|-------|---------|----------|
| Candlestick | Lightweight Charts | Coin detail OHLC (1D–Max) |
| Area + Volume | Recharts ComposedChart | Coin detail area view |
| Sparkline | SVG (custom) | Coin cards, table rows |
| Market dominance | Recharts PieChart | Dashboard donut |

---

## 7. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | For auth | Clerk publishable key |
| `CLERK_SECRET_KEY` | For auth | Clerk secret key |
| `COINGECKO_API_KEY` | Optional | CoinGecko Demo API key (better rate limits) |

---

## 8. Build & Scripts

- `npm run dev` – Development server
- `npm run build` – Production build (Turbopack)
- `npm run start` – Production server
- `npm run lint` – ESLint

---

## 9. Image Configuration

`next.config.ts` allows remote images from:

- `assets.coingecko.com`
- `coin-images.coingecko.com`
