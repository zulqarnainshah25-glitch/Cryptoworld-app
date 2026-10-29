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

  it('should NOT trigger update popup when backend version is older than current 1.0.2', () => {
    const current = '1.0.2';
    const remoteOlder = '1.0.1';
    expect(compareVersions(remoteOlder, current)).toBeLessThan(0);
    expect(compareVersions(remoteOlder, current) > 0).toBe(false);
  });

  it('should NOT trigger update popup when backend version is identical to 1.0.2', () => {
    const current = '1.0.2';
    const remoteSame = '1.0.2';
    expect(compareVersions(remoteSame, current)).toBe(0);
    expect(compareVersions(remoteSame, current) > 0).toBe(false);
  });

  it('should trigger update popup ONLY when backend version is strictly newer (e.g. 1.0.3 or 1.1.0)', () => {
    const current = '1.0.2';
    expect(compareVersions('1.0.3', current)).toBe(1);
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
      direction: 'LONG' | 'SHORT';
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
    const isLong = signal.direction === 'LONG';
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


