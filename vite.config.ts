import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'icon-192.png', 'icon-512.png'],
        manifest: {
          id: '/',
          name: 'CryptoWorld - AI Crypto Signals',
          short_name: 'CryptoWorld',
          description: 'Pakistan ka pehla AI-powered crypto signal app',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#0b0f19',
          theme_color: '#00d2ff',
          orientation: 'portrait',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'api-signal-analyzer',
        configureServer(server) {
          server.middlewares.use('/api/analyze-signal', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method Not Allowed');
              return;
            }
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const data = JSON.parse(body || '{}');
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'No API key available' }));
                  return;
                }

                const { GoogleGenAI } = await import('@google/genai');
                const ai = new GoogleGenAI({ apiKey });

                const prompt = `You are the lead quantitative crypto trading analyst for CryptoWorld (Pakistan's premier crypto signals platform).
Your task is to analyze Binance Futures market data and provide decisive, actionable, and accurate trading signals with deep strategic reasoning in natural, professional Roman Urdu.

CRITICAL INSTRUCTIONS FOR PROFESSIONAL TRADING SIGNALS:
1. TRUE TWO-WAY TRADING (NEVER FORCE LONG IN A DUMP):
   - If market is BEARISH or breaking down (Price < EMA20, EMA20 < EMA50, RSI < 48, MACD negative, or Lower Highs/Lows): ALWAYS generate a decisive "SHORT" signal ("direction": "SHORT", "entryStatus": "READY")! Selling into a downtrend yields high-win-rate trades.
   - If market is BULLISH or breaking out (Price > EMA20, Higher Highs/Lows, RSI > 52, buyer momentum): Generate a decisive "LONG" signal ("direction": "LONG", "entryStatus": "READY").
2. PROFESSIONAL STOP LOSS & BREATHING ROOM:
   - In crypto, stop losses must NEVER be too tight (less than 2%). A 0.8% - 1.2% stop loss gets hit by normal 15m/1h candle wicks!
   - Stop Loss MUST be placed beyond key structural levels with a 2.0x to 2.8x ATR buffer:
     - For Altcoins (SOL, ADA, SUI, DOGE, NEAR, FET, etc.): Stop Loss distance MUST be at least 2.8% to 5.0% from entry!
     - For BTC/ETH: Stop Loss distance MUST be at least 1.8% to 3.2% from entry!
   - Take Profit: Risk-to-Reward MUST be 1:1.8 to 1:2.4 so profits outpace risk.
3. Decisive Entries: Traders want actionable trade plans. If there is clear market direction, provide entryStatus "READY" with exact entry, stop loss, and take profit.

Input Data:
- Symbol: ${data.symbol}
- Current Timeframe: ${data.timeframe}
- Current Price: ${data.currentPrice}
- Primary Indicators: RSI: ${data.rsi}, MACD: ${data.macd}, MACD Hist: ${data.macdHist}, ADX: ${data.adx}, ATR: ${data.atr}, Volume Ratio: ${data.volRatio}
- Primary EMAs: EMA20: ${data.ema20}, EMA50: ${data.ema50}, EMA200: ${data.ema200}
- Candlestick Pattern: ${data.candlePattern}
- Market Structure: ${data.marketStructure}
- 4H Confluence: 4H RSI: ${data.rsi4h}, 4H EMA20: ${data.ema204h}, 4H EMA50: ${data.ema504h}, 4H Trend: ${data.trend4h}
- Daily RSI: ${data.rsi1d}
- Key Pivots: Resistance: ${data.resistance}, Support: ${data.support}
- Swing Low: ${data.swingLow}, Swing High: ${data.swingHigh}

Return ONLY valid JSON matching this exact structure:
{
  "direction": "LONG" | "SHORT" | "NO_TRADE" | "WAIT_LONG" | "WAIT_SHORT",
  "signalDirection": "LONG" | "SHORT" | "NEUTRAL",
  "entryStatus": "READY" | "WAIT_PULLBACK" | "WAIT_COUNTER_TREND" | "CHOPPY_RANGE",
  "entry": number,
  "stopLoss": number,
  "takeProfit": number,
  "rr": number,
  "confidence": number,
  "signalQuality": "STRONG" | "MODERATE" | "WEAK" | "WAIT",
  "model": "Google Gemini 3.8 Quantitative Core",
  "warnings": ["clear, constructive advice"],
  "reasoning": "Comprehensive institutional analysis in fluent, encouraging Roman Urdu explaining Market Structure, Candlestick/Volume, Indicators, HTF alignment, and exact Risk/Reward execution.",
  "waitFor": "Clear instruction if waiting",
  "waitForLevel": number or null
}`;

                let resultText = '';
                try {
                  const result = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: prompt,
                    config: {
                      responseMimeType: 'application/json'
                    }
                  });
                  resultText = result.text || '';
                } catch (e1) {
                  console.error('Gemini API call failed:', e1);
                  throw e1;
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(resultText);
              } catch (err: any) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Analysis error' }));
              }
            });
          });

          // Binance Klines Proxy (Bypass Pakistan/regional ISP blocks and mobile browser CORS)
          server.middlewares.use('/api/binance-klines', async (req, res) => {
            try {
              const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
              const symbol = parsedUrl.searchParams.get('symbol') || 'BTCUSDT';
              const interval = parsedUrl.searchParams.get('interval') || '15m';
              const limit = parsedUrl.searchParams.get('limit') || '250';

              const binanceUrls = [
                `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
                `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
                `https://api1.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
              ];

              for (const bUrl of binanceUrls) {
                try {
                  const bRes = await fetch(bUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                  if (bRes.ok) {
                    const data = await bRes.text();
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Cache-Control', 'no-cache');
                    res.end(data);
                    return;
                  }
                } catch (e) {}
              }

              res.statusCode = 502;
              res.end(JSON.stringify({ error: 'Failed to fetch Binance klines from upstream' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });

          // Binance Ticker Proxy (Bypass ISP blocks)
          server.middlewares.use('/api/binance-ticker', async (req, res) => {
            try {
              const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
              const symbol = parsedUrl.searchParams.get('symbol') || 'BTCUSDT';

              const binanceUrls = [
                `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
                `https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${symbol}`,
                `https://api1.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
              ];

              for (const bUrl of binanceUrls) {
                try {
                  const bRes = await fetch(bUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                  if (bRes.ok) {
                    const data = await bRes.text();
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Cache-Control', 'no-cache');
                    res.end(data);
                    return;
                  }
                } catch (e) {}
              }

              res.statusCode = 502;
              res.end(JSON.stringify({ error: 'Failed to fetch Binance ticker' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });

          // Google Apps Script Backend Status Route
          const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzxKNv2JGtgAbLohzkvTwN5it7Xl3iKSKb6RK228k7JQxUnl-OPPKaXrjq5v-eaj9XrPQ/exec';

          server.middlewares.use('/api/backend-status', async (req, res) => {
            try {
              const gasRes = await fetch(GAS_WEBAPP_URL, { redirect: 'follow' });
              const data = await gasRes.json();
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ...data,
                gasUrl: GAS_WEBAPP_URL
              }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                service: 'CryptoWorld V6 (Groq + Gemini)',
                status: 'online',
                gasUrl: GAS_WEBAPP_URL,
                fallback: true
              }));
            }
          });

          // Google Apps Script Action Dispatcher Proxy
          server.middlewares.use('/api/apps-script-backend', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method Not Allowed');
              return;
            }
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsedBody = JSON.parse(body || '{}');
                const gasRes = await fetch(GAS_WEBAPP_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                  body: JSON.stringify(parsedBody),
                  redirect: 'follow'
                });
                const text = await gasRes.text();
                res.setHeader('Content-Type', 'application/json');
                res.end(text);
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: true, message: err.message || 'Apps Script proxy error' }));
              }
            });
          });
        }
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          about: path.resolve(__dirname, 'src/pages/about.html'),
          terms: path.resolve(__dirname, 'src/pages/terms.html'),
          disclaimer: path.resolve(__dirname, 'src/pages/disclaimer.html'),
          contact: path.resolve(__dirname, 'src/pages/contact.html'),
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});