# CryptoWorld - AI-Powered Cryptocurrency Trading Signals PWA

> **Pakistan ka pehla AI-powered crypto signal app** built with real-time Binance Futures market data, quantitative multi-timeframe indicator confluence, dual-core AI analysis (Groq & Google Gemini), automatic signal accuracy journaling, and progressive web app (PWA) offline capabilities.

---

## 🚀 Features

- **Real-Time Binance Futures Feed**: Direct WebSocket/REST API data ingestion for top crypto pairs (`BTCUSDT`, `ETHUSDT`, `SOLUSDT`, `BNBUSDT`, `XRPUSDT`, `DOGEUSDT`, `LINKUSDT`, `ADAUSDT`).
- **Interactive TradingView Candlestick Chart**: Powered by `lightweight-charts v4` with volume histogram, live price, 24-hour change %, indicator badges, and auto-refresh every 10 seconds.
- **Dynamic Signal Lines**: Automatic chart visualization for **Entry (Cyan Solid)**, **Stop Loss (Red Dashed)**, and **Take Profit (Green Dashed)**.
- **Deep Technical Indicator Engine**:
  - **RSI (14)** with Wilder's exponential smoothing
  - **MACD (12, 26, 9)** with Signal Line & Histogram
  - **EMA (20, 50, 200)** & SMA (20, 50)
  - **ATR (14)** & **ADX (14)** trend strength filtering
  - **Volume Ratio** relative to 20-candle moving average
  - **Support & Resistance** swing pivot detection
- **Rigorous AI & Quality Gates**:
  - ADX threshold checking (min 20 for trending market)
  - RSI chase guards (LONG capped at 75, SHORT guarded below 25)
  - Higher Timeframe (4H & 1D) confluence checks
  - Overextension protection against mean-reversion traps
  - Strict **Risk/Reward ratio (minimum 1:1.5)**
  - Roman Urdu strategic reasoning and "Wait For" levels for choppy conditions
- **Fair Quota & Monetization Engine**:
  - Free tier: 1 signal per day, resets at midnight **Asia/Karachi (PKT)**
  - NO_TRADE and WAIT signals only consume 0.25 quota
  - Premium tiers: **BASIC** (5/day), **PRO** (10/day), **ELITE** (20/day)
- **7-Day Hardware Device Lock**: Anti-fraud prevention locking 1 account per device fingerprint for 7 days.
- **Referral & Share Rewards**:
  - Unique referral codes (e.g. `ZULQ3A5B`) yielding +2 permanent bonus signals per invited trader
  - Social media share integration (WhatsApp, Twitter/X, Facebook, Telegram) with +0.5 bonus signals and 24h platform cooldown
- **Automated Outcome Journaling**:
  - Automatically journals every LONG and SHORT signal
  - Verifies outcomes against live candles every 30 minutes (checks TP/SL hits, 48h expiration)
  - Real-time win rate dashboard categorized across 4 confidence buckets (70%+, 60-69%, 55-59%, under 55%)
- **Admin Portal (`/src/pages/admin.html`)**:
  - Master security key protection (default: `admin123`)
  - Bulk generate 60 license codes (20 BASIC, 20 PRO, 20 ELITE)
  - Single license code generator
  - Inventory search, filter, and one-click copy
- **PWA & Mobile-First Dark Theme**:
  - Colors: `#0b0f19` (background), `#151a28` (cards), `#00d2ff` (cyan accent), `#00ff88` (success), `#ff4d4d` (danger)
  - Installable as a standalone app on Android & iOS with custom splash screens and service worker caching

---

## 🛠️ Project Structure

```
cryptoworld-app/
├── index.html                    # Root entry point
├── src/
│   ├── index.html                # App template
│   ├── pages/
│   │   ├── about.html            # About Us & 5-Step Flow
│   │   ├── terms.html            # 12-Section Terms & Conditions
│   │   ├── disclaimer.html       # 10-Point Legal & Financial Disclaimer
│   │   ├── contact.html          # Contact Support & 8-FAQ Accordion
│   │   └── admin.html            # Admin Code Generator Portal
│   ├── styles/
│   │   └── main.css              # Dark High-Tech UI & Components
│   └── scripts/
│       └── main.js               # Core Indicators, Chart, & State Logic
├── public/
│   ├── manifest.json             # Web App Manifest
│   ├── icon.svg                  # SVG Emblem
│   ├── icon-192.png              # 192x192 PNG Icon
│   ├── icon-512.png              # 512x512 Maskable PNG Icon
│   ├── apple-touch-icon.png      # iOS Safari Icon
│   └── favicon.ico               # 32x32 Favicon
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 💻 Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```
Creates an optimized, production-ready bundle in the `dist/` folder.

---

## 📱 Mobile APK Conversion

### Method A: PWABuilder (Recommended)
1. Deploy your web app to any HTTPS URL (Netlify, Vercel, Cloud Run).
2. Visit [pwabuilder.com](https://www.pwabuilder.com/).
3. Enter your live URL and download the generated Android APK package.

### Method B: Nitron CLI
```bash
npx nitron build
```

---

## 🔐 Admin Portal Credentials

- Navigate to `/src/pages/admin.html` or click the 🔐 lock icon in the top header.
- **Default Master Admin Key**: `admin123`
- Preloaded with sample testing keys:
  - `PRO-TEST2026` (10 signals/day, 30 days)
  - `ELITE-VIP8888` (20 signals/day, 30 days)
  - `BASIC-FREE555` (5 signals/day, 30 days)

---

## 📄 License & Disclaimer

Trading cryptocurrencies carries significant risk of financial loss. Signals generated by CryptoWorld are for educational and informational purposes only and do not constitute financial advice. Always practice strict risk management.
