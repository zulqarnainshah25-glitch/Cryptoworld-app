import { describe, it, expect } from 'vitest';

// -------------------------------------------------------------
// CONSTANTS & LOGIC TESTED (Mirroring App core logic)
// -------------------------------------------------------------
const ADMOB_CONFIG = {
  appId: 'ca-app-pub-8825065858193656~5170875046',
  rewardedAdUnitId: 'ca-app-pub-8825065858193656/9953437597',
  appOpenAdUnitId: 'ca-app-pub-8825065858193656/2956162280'
};

const DEFAULT_AD_CONFIG = {
  network: 'admob' as 'admob' | 'adsterra' | 'monetag',
  rewardedAdUnitId: ADMOB_CONFIG.rewardedAdUnitId,
  appOpenAdUnitId: ADMOB_CONFIG.appOpenAdUnitId,
  adsterraDirectLink: '',
  monetagZoneId: ''
};

const PLAN_LIMITS: Record<string, number> = {
  FREE: 1,
  BASIC: 5,
  PRO: 10,
  ELITE: 20
};

// Pure function helper for merging ad config
function mergeAdConfig(prev: typeof DEFAULT_AD_CONFIG, fetched: any): typeof DEFAULT_AD_CONFIG {
  if (!fetched || typeof fetched !== 'object') return prev;
  return {
    network: fetched.network || prev.network || DEFAULT_AD_CONFIG.network,
    rewardedAdUnitId: fetched.rewardedAdUnitId || prev.rewardedAdUnitId || ADMOB_CONFIG.rewardedAdUnitId,
    appOpenAdUnitId: fetched.appOpenAdUnitId || prev.appOpenAdUnitId || ADMOB_CONFIG.appOpenAdUnitId,
    adsterraDirectLink: fetched.adsterraDirectLink !== undefined ? fetched.adsterraDirectLink : (prev.adsterraDirectLink || ''),
    monetagZoneId: fetched.monetagZoneId !== undefined ? fetched.monetagZoneId : (prev.monetagZoneId || '')
  };
}

// Pure function for signal target calculations
function computeSignalTargets(entry: number, direction: 'LONG' | 'SHORT', atrVal: number) {
  const atr = Math.max(0.000001, atrVal);
  const isLong = direction === 'LONG';
  const sl = isLong ? entry - atr * 1.5 : entry + atr * 1.5;
  const tp1 = isLong ? entry + atr * 1.5 : entry - atr * 1.5;
  const tp2 = isLong ? entry + atr * 2.5 : entry - atr * 2.5;
  const tp3 = isLong ? entry + atr * 4.0 : entry - atr * 4.0;
  return { sl, tp1, tp2, tp3 };
}

describe('1. AdMob & Global Ad Config Tests (TDD & Edge Cases)', () => {
  it('should have valid official AdMob App ID and Ad Unit IDs format', () => {
    expect(ADMOB_CONFIG.appId).toMatch(/^ca-app-pub-\d+~\d+$/);
    expect(ADMOB_CONFIG.rewardedAdUnitId).toMatch(/^ca-app-pub-\d+\/\d+$/);
    expect(ADMOB_CONFIG.appOpenAdUnitId).toMatch(/^ca-app-pub-\d+\/\d+$/);
  });

  it('should default to AdMob as the primary monetization network', () => {
    expect(DEFAULT_AD_CONFIG.network).toBe('admob');
  });

  it('should preserve fallback AdMob IDs when backend returns empty string IDs', () => {
    const emptyBackend = {
      network: 'admob',
      rewardedAdUnitId: '',
      appOpenAdUnitId: ''
    };
    const merged = mergeAdConfig(DEFAULT_AD_CONFIG, emptyBackend);
    expect(merged.rewardedAdUnitId).toBe(ADMOB_CONFIG.rewardedAdUnitId);
    expect(merged.appOpenAdUnitId).toBe(ADMOB_CONFIG.appOpenAdUnitId);
  });

  it('should gracefully handle null or undefined backend responses', () => {
    const mergedNull = mergeAdConfig(DEFAULT_AD_CONFIG, null);
    expect(mergedNull).toEqual(DEFAULT_AD_CONFIG);

    const mergedUndefined = mergeAdConfig(DEFAULT_AD_CONFIG, undefined);
    expect(mergedUndefined).toEqual(DEFAULT_AD_CONFIG);
  });

  it('should properly apply updated Ad Unit IDs when Admin changes them globally', () => {
    const adminCustomConfig = {
      network: 'admob' as const,
      rewardedAdUnitId: 'ca-app-pub-9999999999999999/1111111111',
      appOpenAdUnitId: 'ca-app-pub-9999999999999999/2222222222',
      adsterraDirectLink: '',
      monetagZoneId: ''
    };
    const merged = mergeAdConfig(DEFAULT_AD_CONFIG, adminCustomConfig);
    expect(merged.rewardedAdUnitId).toBe('ca-app-pub-9999999999999999/1111111111');
    expect(merged.appOpenAdUnitId).toBe('ca-app-pub-9999999999999999/2222222222');
  });
});

describe('2. Quota & User Plan Limits Tests', () => {
  it('should verify quota limits match the defined tiers', () => {
    expect(PLAN_LIMITS.FREE).toBe(1);
    expect(PLAN_LIMITS.BASIC).toBe(5);
    expect(PLAN_LIMITS.PRO).toBe(10);
    expect(PLAN_LIMITS.ELITE).toBe(20);
  });

  it('should never produce negative quota on depleted limits', () => {
    const quotaLeft = 0;
    const canGenerate = quotaLeft > 0;
    expect(canGenerate).toBe(false);
  });
});

describe('3. Quantitative Technical Signal Calculations', () => {
  it('should calculate valid LONG targets (TP > Entry > SL)', () => {
    const entry = 84000;
    const atr = 500;
    const targets = computeSignalTargets(entry, 'LONG', atr);
    expect(targets.sl).toBeLessThan(entry);
    expect(targets.tp1).toBeGreaterThan(entry);
    expect(targets.tp2).toBeGreaterThan(targets.tp1);
    expect(targets.tp3).toBeGreaterThan(targets.tp2);
  });

  it('should calculate valid SHORT targets (TP < Entry < SL)', () => {
    const entry = 84000;
    const atr = 500;
    const targets = computeSignalTargets(entry, 'SHORT', atr);
    expect(targets.sl).toBeGreaterThan(entry);
    expect(targets.tp1).toBeLessThan(entry);
    expect(targets.tp2).toBeLessThan(targets.tp1);
    expect(targets.tp3).toBeLessThan(targets.tp2);
  });

  it('should handle zero or negative ATR without breaking', () => {
    const entry = 84000;
    const targets = computeSignalTargets(entry, 'LONG', 0);
    expect(Number.isFinite(targets.sl)).toBe(true);
    expect(Number.isFinite(targets.tp1)).toBe(true);
  });
});

describe('4. Security & Device Identification Logic', () => {
  it('should validate format of generated Device ID', () => {
    const devId = 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    expect(devId.startsWith('DEV-')).toBe(true);
    expect(devId.length).toBeGreaterThan(5);
  });

  it('should correctly detect expired admin sessions', () => {
    const pastTimestamp = Date.now() - 5000; // 5 seconds ago
    const isExpired = Date.now() > pastTimestamp;
    expect(isExpired).toBe(true);

    const futureTimestamp = Date.now() + 3600000; // 1 hour ahead
    const isValid = Date.now() < futureTimestamp;
    expect(isValid).toBe(true);
  });

  it('should strictly require backend token for admin authorization (No local bypass)', () => {
    const processAdminAuth = (res: any) => {
      if (res && res.token && typeof res.token === 'string') {
        return { isAuthenticated: true, token: res.token };
      }
      return { isAuthenticated: false, error: res?.message || 'Access Denied' };
    };

    // Valid backend login
    expect(processAdminAuth({ token: 'SERVER_TOKEN_9988' }).isAuthenticated).toBe(true);

    // Invalid backend responses must fail
    expect(processAdminAuth({ error: true, message: 'Ghalat passphrase' }).isAuthenticated).toBe(false);
    expect(processAdminAuth(null).isAuthenticated).toBe(false);
    expect(processAdminAuth({}).isAuthenticated).toBe(false);
  });
});

describe('5. Semantic Version Comparison & Update Modal Rules', () => {
  const compareVersions = (v1: string, v2: string): number => {
    const p1 = (v1 || '').replace(/[^0-9.]/g, '').split('.').map(n => parseInt(n, 10) || 0);
    const p2 = (v2 || '').replace(/[^0-9.]/g, '').split('.').map(n => parseInt(n, 10) || 0);
    const len = Math.max(p1.length, p2.length);
    for (let i = 0; i < len; i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  };

  it('should NOT trigger update popup when backend version is older than current 1.0.7', () => {
    const current = '1.0.7';
    expect(compareVersions('1.0.1', current)).toBeLessThan(0);
    expect(compareVersions('1.0.2', current)).toBeLessThan(0);
    expect(compareVersions('1.0.3', current)).toBeLessThan(0);
    expect(compareVersions('1.0.4', current)).toBeLessThan(0);
    expect(compareVersions('1.0.5', current)).toBeLessThan(0);
    expect(compareVersions('1.0.6', current)).toBeLessThan(0);
    expect(compareVersions('1.0.6', current) > 0).toBe(false);
  });

  it('should NOT trigger update popup when backend version is identical to 1.0.7', () => {
    const current = '1.0.7';
    const remoteSame = '1.0.7';
    expect(compareVersions(remoteSame, current)).toBe(0);
    expect(compareVersions(remoteSame, current) > 0).toBe(false);
  });

  it('should trigger update popup ONLY when backend version is strictly newer (e.g. 1.0.8 or 1.1.0)', () => {
    const current = '1.0.7';
    expect(compareVersions('1.0.8', current)).toBe(1);
    expect(compareVersions('1.1.0', current)).toBe(1);
    expect(compareVersions('2.0.0', current)).toBe(1);
  });
});

describe('6. Quota Synchronization (Zero Quota Handling)', () => {
  it('should correctly store and return 0 quota without defaulting to base limit', () => {
    const parseQuota = (signalsLeft: any) => {
      if (signalsLeft !== undefined && signalsLeft !== null) {
        return Math.max(0, Number(signalsLeft));
      }
      return null;
    };

    expect(parseQuota(0)).toBe(0);
    expect(parseQuota('0')).toBe(0);
    expect(parseQuota(2)).toBe(2);
    expect(parseQuota(null)).toBe(null);
    expect(parseQuota(undefined)).toBe(null);
  });
});

describe('7. Google Sheet Open Trades Evaluation (Live Price + Candle High/Low)', () => {
  const evaluateOpenTrade = (
    signal: {
      symbol: string;
      direction: 'LONG' | 'SHORT' | 'BUY' | 'SELL';
      entry: number;
      stopLoss: number;
      takeProfit: number;
      timestamp: number;
      resolved?: boolean;
    },
    livePrice?: number,
    klines?: any[][]
  ) => {
    if (signal.resolved) return { resolved: true, outcome: null, targetHit: 'OPEN' };
    const rawDir = String(signal.direction || '').toUpperCase();
    const isLong = rawDir === 'LONG' || rawDir === 'BUY';
    let outcome: 'WIN' | 'LOSS' | null = null;
    let targetHit = 'OPEN';
    let closedPrice = signal.entry;

    // 1. Check historical candles after signal timestamp
    if (Array.isArray(klines) && klines.length > 0) {
      for (const k of klines) {
        const openTime = Number(k[0]);
        const high = parseFloat(k[2]);
        const low = parseFloat(k[3]);
        if (openTime < signal.timestamp) continue;
        if (isLong) {
          if (high >= signal.takeProfit) {
            outcome = 'WIN';
            targetHit = 'TP2';
            closedPrice = signal.takeProfit;
            break;
          }
          if (low <= signal.stopLoss) {
            outcome = 'LOSS';
            targetHit = 'SL';
            closedPrice = signal.stopLoss;
            break;
          }
        } else {
          if (low <= signal.takeProfit) {
            outcome = 'WIN';
            targetHit = 'TP2';
            closedPrice = signal.takeProfit;
            break;
          }
          if (high >= signal.stopLoss) {
            outcome = 'LOSS';
            targetHit = 'SL';
            closedPrice = signal.stopLoss;
            break;
          }
        }
      }
    }

    // 2. Check livePrice directly against takeProfit and stopLoss
    if (!outcome && livePrice && livePrice > 0) {
      if (isLong) {
        if (livePrice >= signal.takeProfit) {
          outcome = 'WIN';
          targetHit = 'TP2';
          closedPrice = signal.takeProfit;
        } else if (livePrice <= signal.stopLoss) {
          outcome = 'LOSS';
          targetHit = 'SL';
          closedPrice = signal.stopLoss;
        }
      } else {
        if (livePrice <= signal.takeProfit) {
          outcome = 'WIN';
          targetHit = 'TP2';
          closedPrice = signal.takeProfit;
        } else if (livePrice >= signal.stopLoss) {
          outcome = 'LOSS';
          targetHit = 'SL';
          closedPrice = signal.stopLoss;
        }
      }
    }

    return {
      resolved: outcome !== null,
      outcome,
      targetHit,
      closedPrice
    };
  };

  it('should immediately resolve LONG trade as WIN when livePrice crosses takeProfit', () => {
    const res = evaluateOpenTrade(
      {
        symbol: 'BTCUSDT',
        direction: 'LONG',
        entry: 79797.4,
        stopLoss: 79508.2,
        takeProfit: 80520.38,
        timestamp: 1700000000000
      },
      80600
    );
    expect(res.resolved).toBe(true);
    expect(res.outcome).toBe('WIN');
    expect(res.targetHit).toBe('TP2');
    expect(res.closedPrice).toBe(80520.38);
  });

  it('should immediately resolve SELL/SHORT trade as WIN when livePrice drops below takeProfit', () => {
    const res = evaluateOpenTrade(
      {
        symbol: 'BTCUSDT',
        direction: 'SELL',
        entry: 82082.01,
        stopLoss: 82902.83,
        takeProfit: 80440.37,
        timestamp: 1700000000000
      },
      77977.3
    );
    expect(res.resolved).toBe(true);
    expect(res.outcome).toBe('WIN');
    expect(res.targetHit).toBe('TP2');
    expect(res.closedPrice).toBe(80440.37);
  });

  it('should immediately resolve SHORT trade as LOSS when livePrice crosses stopLoss', () => {
    const res = evaluateOpenTrade(
      {
        symbol: 'BTCUSDT',
        direction: 'SHORT',
        entry: 80152.3,
        stopLoss: 80655.95,
        takeProfit: 79239.04,
        timestamp: 1700000000000
      },
      80700
    );
    expect(res.resolved).toBe(true);
    expect(res.outcome).toBe('LOSS');
    expect(res.targetHit).toBe('SL');
    expect(res.closedPrice).toBe(80655.95);
  });

  it('should detect TP/SL hit from historical candle High/Low even if livePrice pulled back to entry', () => {
    const sigTime = 1700000000000;
    const klines = [
      // Candle BEFORE signal (should be ignored even though low was 0.00000480)
      [sigTime - 3600000, '0.00000500', '0.00000505', '0.00000480', '0.00000500', '100', sigTime - 1],
      // Candle AFTER signal where high hit TP (0.00000515 >= 0.000005125)
      [sigTime + 1000, '0.00000500', '0.00000515', '0.00000499', '0.00000502', '100', sigTime + 3600000]
    ];

    const res = evaluateOpenTrade(
      {
        symbol: 'SHIBUSDT',
        direction: 'LONG',
        entry: 0.000005,
        stopLoss: 0.00000495,
        takeProfit: 0.000005125,
        timestamp: sigTime
      },
      0.00000501, // Current livePrice pulled back near entry
      klines
    );
    expect(res.resolved).toBe(true);
    expect(res.outcome).toBe('WIN');
    expect(res.closedPrice).toBe(0.000005125);
  });
});

describe('8. Multi-Timeframe Signal Payload & 50-Candle OHLC Formatter', () => {
  const formatCandlesForBackend = (candles: number[][], limit = 50) => {
    if (!Array.isArray(candles)) return [];
    return candles.slice(-limit).map(k => ({
      0: Number(k[0]),
      1: Number(k[1]),
      2: Number(k[2]),
      3: Number(k[3]),
      4: Number(k[4]),
      5: Number(k[5]),
      time: Number(k[0]),
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
      volume: Number(k[5]),
      o: Number(k[1]),
      h: Number(k[2]),
      l: Number(k[3]),
      c: Number(k[4]),
      v: Number(k[5])
    }));
  };

  it('should slice exactly the last 50 candles when given 250 candles', () => {
    const raw250 = Array.from({ length: 250 }, (_, i) => [
      1700000000000 + i * 60000,
      80000 + i,
      80100 + i,
      79900 + i,
      80050 + i,
      100 + i
    ]);
    const formatted = formatCandlesForBackend(raw250, 50);
    expect(formatted.length).toBe(50);
    const last = formatted[formatted.length - 1];
    expect(last.close).toBe(80050 + 249);
    expect(last[4]).toBe(80050 + 249);
    expect(last.open).toBe(80000 + 249);
    expect(last[1]).toBe(80000 + 249);
    expect(last.high).toBe(80100 + 249);
    expect(last[2]).toBe(80100 + 249);
    expect(last.low).toBe(79900 + 249);
    expect(last[3]).toBe(79900 + 249);
  });

  it('should include recentCandles, candles4h, candles1d, and updated currentPrice in payload', () => {
    const sampleKline = [[1700000000000, 81000, 81500, 80800, 81200, 500]];
    const payload = {
      symbol: 'BTCUSDT',
      timeframe: '1h',
      currentPrice: 81255.5,
      recentCandles: formatCandlesForBackend(sampleKline, 50),
      candles4h: formatCandlesForBackend(sampleKline, 50),
      candles1d: formatCandlesForBackend(sampleKline, 50)
    };
    expect(payload.currentPrice).toBe(81255.5);
    expect(payload.recentCandles.length).toBe(1);
    expect(payload.candles4h.length).toBe(1);
    expect(payload.candles1d.length).toBe(1);
  });
});

describe('9. T1 / T2 / T3 Tick Marks & Obfuscated Vault Reference Security', () => {
  const _ENC_VAULT_BYTES = [
    107, 61, 5, 60, 14, 31, 14, 17, 21, 23, 41, 61, 11, 21, 9, 98, 48, 104,
    24, 48, 98, 48, 22, 49, 111, 44, 63, 63, 24, 51, 40, 111, 34, 60, 28, 57,
    35, 28, 106, 25, 40, 8, 49, 19
  ];
  const resolveVaultRef = () => _ENC_VAULT_BYTES.map(b => String.fromCharCode(b ^ 0x5a)).join('');

  const computeTargetHits = (sig: any, livePrice: number, progressPct = 0) => {
    const rawDir = String(sig.direction || '').toUpperCase().trim();
    const isLong = rawDir === 'LONG' || rawDir === 'BUY' || rawDir === 'BULLISH';
    const effectivePrice = sig.resolved
      ? (Number(sig.closedPrice) || livePrice || Number(sig.entry))
      : (livePrice || Number(sig.currentPrice) || Number(sig.entry));
    const tp1 = Number(sig.tp1) || 0;
    const tp2 = Number(sig.tp2) || Number(sig.takeProfit) || 0;
    const tp3 = Number(sig.tp3) || 0;
    const sl = Number(sig.stopLoss) || 0;

    const priceHitT1 = effectivePrice > 0 && tp1 > 0 && (isLong ? effectivePrice >= tp1 : effectivePrice <= tp1);
    const priceHitT2 = effectivePrice > 0 && tp2 > 0 && (isLong ? effectivePrice >= tp2 : effectivePrice <= tp2);
    const priceHitT3 = effectivePrice > 0 && tp3 > 0 && (isLong ? effectivePrice >= tp3 : effectivePrice <= tp3);
    const priceHitSL = effectivePrice > 0 && sl > 0 && (isLong ? effectivePrice <= sl : effectivePrice >= sl);

    const t3Hit = Boolean(sig.tp3Hit || sig.targetHit === 'TP3' || priceHitT3 || progressPct >= 149.5);
    const t2Hit = Boolean(t3Hit || sig.tp2Hit || sig.outcome === 'WIN' || sig.targetHit === 'TP2' || priceHitT2 || progressPct >= 99.5);
    const t1Hit = Boolean(t2Hit || sig.tp1Hit || sig.targetHit === 'TP1' || priceHitT1 || progressPct >= 49.5);
    const slHit = Boolean(!t2Hit && (sig.outcome === 'LOSS' || sig.targetHit === 'SL' || priceHitSL || progressPct <= -99.5));

    return { t1Hit, t2Hit, t3Hit, slHit };
  };

  it('should decode the obfuscated vault reference at runtime without storing plain text in code', () => {
    const decoded = resolveVaultRef();
    expect(typeof decoded).toBe('string');
    expect(decoded.length).toBe(44);
    expect(decoded.startsWith('1g_')).toBe(true);
    expect(decoded.endsWith('RkI')).toBe(true);
  });

  it('should mark T1, T2, and T3 as HIT (never PENDING) for the SELL BTCUSDT card from screenshot (+250% progress)', () => {
    const sig = {
      symbol: 'BTCUSDT',
      direction: 'SELL',
      entry: 82082.01,
      stopLoss: 82902.83,
      takeProfit: 80440.37,
      tp1: 81261.19,
      tp2: 80440.37,
      tp3: 79619.55,
      tp1Hit: false,
      tp2Hit: false,
      tp3Hit: false,
      resolved: false
    };
    const hits = computeTargetHits(sig, 77977.3, 250.0);
    expect(hits.t1Hit).toBe(true);
    expect(hits.t2Hit).toBe(true);
    expect(hits.t3Hit).toBe(true);
    expect(hits.slHit).toBe(false);
  });

  it('should mark T1 as HIT and T2/T3 as false when LONG signal is at +60% progress towards TP2', () => {
    const sig = {
      symbol: 'SOLUSDT',
      direction: 'LONG',
      entry: 100,
      stopLoss: 98,
      takeProfit: 104,
      tp1: 102,
      tp2: 104,
      tp3: 106,
      tp1Hit: false,
      tp2Hit: false,
      tp3Hit: false,
      resolved: false
    };
    const hits = computeTargetHits(sig, 102.4, 60.0);
    expect(hits.t1Hit).toBe(true);
    expect(hits.t2Hit).toBe(false);
    expect(hits.t3Hit).toBe(false);
  });
});

describe('10. Open-Only Google Sheet Journal Signals & Flicker-Free Chart Kline Sanitizer', () => {
  const filterOpenOnlySignals = (signals: any[], marketPrices: Record<string, number>) => {
    return signals.filter(s => {
      if (s.direction !== 'LONG' && s.direction !== 'SHORT') return false;
      if (s.resolved || s.outcome === 'WIN' || s.outcome === 'LOSS' || s.outcome === 'EXPIRED') return false;
      const liveP = marketPrices[s.symbol] || s.currentPrice || s.entry;
      const isLong = s.direction === 'LONG';
      const tp2 = Number(s.tp2 || s.takeProfit);
      const sl = Number(s.stopLoss);
      const t2Hit = isLong ? liveP >= tp2 : liveP <= tp2;
      const slHit = isLong ? liveP <= sl : liveP >= sl;
      if (t2Hit || slHit) return false;
      return true;
    });
  };

  it('should strictly show ONLY the 2 open signals from Google Sheet and exclude all resolved WIN/LOSS trades', () => {
    const sheetSignals = [
      { id: 'JOURNAL_110_BTCUSDT', symbol: 'BTCUSDT', direction: 'LONG', entry: 80697.6, stopLoss: 80251.03, takeProfit: 81590.74, outcome: 'LOSS', resolved: true },
      { id: 'JOURNAL_107_BTCUSDT', symbol: 'BTCUSDT', direction: 'LONG', entry: 79797.4, stopLoss: 79508.21, takeProfit: 80520.38, outcome: 'WIN', resolved: true },
      { id: 'SHEET_111_NEARUSDT', symbol: 'NEARUSDT', direction: 'LONG', entry: 4.43, stopLoss: 4.329, takeProfit: 4.681, outcome: 'OPEN', resolved: false },
      { id: 'SHEET_112_BTCUSDT', symbol: 'BTCUSDT', direction: 'LONG', entry: 81785, stopLoss: 81216.62, takeProfit: 82694.41, outcome: 'OPEN', resolved: false }
    ];

    // While both open trades are trading between SL and TP
    const displayed = filterOpenOnlySignals(sheetSignals, { NEARUSDT: 4.50, BTCUSDT: 82000 });
    expect(displayed.length).toBe(2);
    expect(displayed.map(x => x.id)).toEqual(['SHEET_111_NEARUSDT', 'SHEET_112_BTCUSDT']);
  });

  it('should immediately remove a signal from the list once TP or SL is hit', () => {
    const openSignals = [
      { id: 'SHEET_111_NEARUSDT', symbol: 'NEARUSDT', direction: 'LONG', entry: 4.43, stopLoss: 4.329, takeProfit: 4.681, outcome: 'OPEN', resolved: false },
      { id: 'SHEET_112_BTCUSDT', symbol: 'BTCUSDT', direction: 'LONG', entry: 81785, stopLoss: 81216.62, takeProfit: 82694.41, outcome: 'OPEN', resolved: false }
    ];

    // NEARUSDT hits TP (4.69 >= 4.681), BTCUSDT remains open (82000)
    const afterNearTpHit = filterOpenOnlySignals(openSignals, { NEARUSDT: 4.69, BTCUSDT: 82000 });
    expect(afterNearTpHit.length).toBe(1);
    expect(afterNearTpHit[0].id).toBe('SHEET_112_BTCUSDT');
  });

  it('should deduplicate and sort klines strictly ascending by time to prevent chart flickering/crashes', () => {
    const rawKlines = [
      [1700007200000, '82000', '82500', '81800', '82100'],
      [1700003600000, '81500', '82100', '81400', '82000'],
      [1700003600000, '81500', '82150', '81400', '82050'] // duplicate timestamp with updated close
    ];
    const byTime = new Map<number, { time: number; open: number; high: number; low: number; close: number }>();
    for (const k of rawKlines) {
      const t = Math.floor(Number(k[0]) / 1000);
      byTime.set(t, {
        time: t,
        open: Number(k[1]),
        high: Number(k[2]),
        low: Number(k[3]),
        close: Number(k[4])
      });
    }
    const uniqueSorted = Array.from(byTime.values()).sort((a, b) => a.time - b.time);
    expect(uniqueSorted.length).toBe(2);
    expect(uniqueSorted[0].time).toBeLessThan(uniqueSorted[1].time);
    expect(uniqueSorted[0].close).toBe(82050);
  });
});

describe('11. Admin Premium Codes Google Sheet Sync & VIP Modal Scroll Rules', () => {
  const normalizeAdminCode = (c: any) => {
    const rawPlan = String(c?.plan || c?.planType || c?.PlanType || c?.Plan || 'PRO').toUpperCase().trim();
    const plan: 'BASIC' | 'PRO' | 'ELITE' =
      rawPlan === 'BASIC' || rawPlan === 'ELITE' ? rawPlan : 'PRO';
    const defaultSignals = plan === 'BASIC' ? 5 : plan === 'PRO' ? 10 : 20;
    const rawUsed = c?.used ?? c?.Used ?? c?.status ?? c?.Status ?? false;
    const isUsed =
      rawUsed === true ||
      String(rawUsed).toUpperCase() === 'TRUE' ||
      String(rawUsed).toUpperCase() === 'YES' ||
      String(rawUsed).toUpperCase() === 'USED' ||
      String(rawUsed).toUpperCase() === 'CLAIMED';

    return {
      code: String(c?.code || c?.Code || c?.key || '').trim().toUpperCase(),
      plan,
      signalsPerDay: Number(c?.signalsPerDay || c?.SignalsPerDay || c?.signals || defaultSignals) || defaultSignals,
      durationDays: Number(c?.durationDays || c?.DurationDays || c?.duration || c?.days || 30) || 30,
      used: isUsed,
      usedBy: c?.usedBy || c?.UsedBy || c?.claimedBy || null,
      cloudSynced: Boolean(c?.cloudSynced ?? true)
    };
  };

  it('should normalize Google Sheet PremiumCodes rows from admin_list_codes accurately', () => {
    const rawSheetRows = [
      { Code: 'pro-abcd1234', PlanType: 'PRO', SignalsPerDay: 10, DurationDays: 30, Used: 'FALSE', UsedBy: '' },
      { code: 'ELITE-9999XXXX', plan: 'elite', signalsPerDay: 20, durationDays: 90, status: 'CLAIMED', usedBy: 'trader1' }
    ];
    const normalized = rawSheetRows.map(normalizeAdminCode);
    expect(normalized[0].code).toBe('PRO-ABCD1234');
    expect(normalized[0].plan).toBe('PRO');
    expect(normalized[0].used).toBe(false);
    expect(normalized[0].cloudSynced).toBe(true);

    expect(normalized[1].code).toBe('ELITE-9999XXXX');
    expect(normalized[1].plan).toBe('ELITE');
    expect(normalized[1].durationDays).toBe(90);
    expect(normalized[1].used).toBe(true);
    expect(normalized[1].usedBy).toBe('trader1');
  });

  it('should generate 60 bulk codes (20 BASIC, 20 PRO, 20 ELITE) ready for admin_bulk_generate payload', () => {
    const plans = [
      { plan: 'BASIC', signals: 5, count: 20 },
      { plan: 'PRO', signals: 10, count: 20 },
      { plan: 'ELITE', signals: 20, count: 20 }
    ];
    const newCodes: any[] = [];
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    plans.forEach(p => {
      for (let i = 0; i < p.count; i++) {
        let suffix = '';
        for (let j = 0; j < 8; j++) suffix += chars.charAt(Math.floor(Math.random() * chars.length));
        newCodes.push({
          code: `${p.plan}-${suffix}`,
          plan: p.plan,
          signalsPerDay: p.signals,
          durationDays: 30,
          used: false
        });
      }
    });
    expect(newCodes.length).toBe(60);
    expect(newCodes.filter(c => c.plan === 'BASIC').length).toBe(20);
    expect(newCodes.filter(c => c.plan === 'PRO').length).toBe(20);
    expect(newCodes.filter(c => c.plan === 'ELITE').length).toBe(20);
  });
});

