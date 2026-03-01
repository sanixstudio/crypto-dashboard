# CryptoDash – Features & User Guide

Overview of app features, user flows, and product capabilities.

---

## 1. Overview

CryptoDash is a cryptocurrency dashboard that helps users:

- Track global market data and top cryptocurrencies  
- Follow coins with a watchlist  
- Manage a manual portfolio with P&L  
- Explore detailed coin data, charts, and history  

No wallet connection or API keys are required; everything runs through the app.

---

## 2. Core Features

### 2.1 Dashboard

- **Global market stats**: Total market cap, 24h volume, active cryptocurrencies, markets  
- **Market dominance**: Donut chart for BTC, ETH, USDT, BNB, SOL, USDC  
- **Portfolio summary**: Total value and P&L when signed in  
- **Watchlist preview**: Up to 4 watchlist coins  
- **Top gainers / losers**: Top 5 gainers and losers in 24h  
- **Top coins**: Grid of top 12 coins by market cap  

### 2.2 Top Coins

- **View modes**: Card grid or table  
- **Pagination**: 24 coins per page  
- **Table columns**: Rank, coin, price, 24h %, 7d %, market cap, 7D sparkline  
- **Watchlist**: Star to add or remove from watchlist  

### 2.3 Categories

- List of CoinGecko categories (DeFi, Layer 1, etc.)  
- Category detail page with coins in that category  
- Watchlist support on coin cards  

### 2.4 Trending

- Most searched coins in the last 24 hours  
- Card layout with watchlist support  

### 2.5 Coin Detail

- **Header**: Name, symbol, price, 24h/7d change, watchlist button  
- **Chart**  
  - Type: Candlestick (OHLC) or Area  
  - Range: 1D, 7D, 30D, 90D, 1Y, Max  
  - Area view includes volume bars  
- **Stats**: Market cap, 24h volume, 24h high/low, ATH, ATL  
- **ATH/ATL context**: Distance from ATH/ATL in %, with dates  
- **About**: Coin description (HTML)  
- **Historical snapshot**: Price, market cap, volume at a chosen date (last 365 days)  
- **Actions**: Add to portfolio, share, copy link, links to website, Twitter, Reddit, GitHub, whitepaper  

### 2.6 Portfolio

- **Manual holdings**: Add coin, amount, optional cost basis  
- **Summary**: Total value, cost basis, P&L ($ and %), top holdings by allocation  
- **Holdings list**: Per-holding value, P&L, inline edit and delete  
- **Add from coin page**: “Add to Portfolio” pre-fills coin  
- **Storage**: Stored in the user account; no wallet connection  

### 2.7 Watchlist

- Star coins to add them to a personal list  
- Shows up to 4 on the dashboard and full list on the watchlist page  
- Syncs across devices when signed in  

### 2.8 Search

- **Location**: Header (top bar)  
- **Behavior**: Debounced search with dropdown results  
- **Result**: Click to go to coin detail  
- **Scope**: CoinGecko coins  

---

## 3. User Preferences

| Preference | Options | Where |
|------------|---------|-------|
| Currency | USD, EUR, GBP | Header selector |
| Theme | Light, dark, system | Sidebar footer |
| Watchlist | Coins (max 50) | Per user |
| Portfolio | Holdings (max 50) | Per user |

---

## 4. Auth & Access

- **Without sign-in**  
  - Browse all market data and coin details  
  - No watchlist or portfolio  
- **With sign-in**  
  - Watchlist and portfolio  
  - Sync across devices  
  - Access to protected Settings  

### Protected Routes

- **Settings**: Account/profile (Clerk UserProfile when configured)  

---

## 5. Navigation

**Sidebar**

- Dashboard  
- Portfolio  
- Watchlist  
- Top Coins  
- Categories  
- Trending  
- Settings  

**Header**

- Sidebar toggle (Cmd/Ctrl+B)  
- Search  
- Currency selector  

---

## 6. Visualizations

| Component | Description |
|-----------|-------------|
| Candlestick chart | OHLC with up/down colors, theme-aware |
| Area chart | Price line with volume bars |
| Sparkline | 7D trend on cards and table rows |
| Market dominance | Donut chart with brand colors |
| Portfolio allocation | Top holdings % in summary |

---

## 7. Responsive Behavior

- **Desktop**: Full sidebar, grid layouts, full chart controls  
- **Mobile**: Collapsible sidebar, stacked layouts, touch-friendly buttons  
- **Theme**: Follows system or manual light/dark  

---

## 8. Data Freshness

- **Dashboard, coins, coin detail**: ~1 minute  
- **Trending, categories**: ~5 minutes  
- **Historical snapshot**: Long cache (daily granularity)  

---

## 9. Limits

| Item | Limit |
|------|-------|
| Watchlist | 50 coins |
| Portfolio holdings | 50 holdings |
| Historical snapshot | Last 365 days |

---

## 10. Integrations

- **CoinGecko**: All market and coin data  
- **Clerk**: Authentication and user metadata  
- **Next.js**: SSR, API routes, server actions  
