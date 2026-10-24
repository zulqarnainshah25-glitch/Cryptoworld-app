import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Zap,
  TrendingUp,
  BarChart2,
  User,
  Star,
  Menu,
  X,
  Copy,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Info,
  Send,
  MessageCircle,
  Database,
  Cpu,
  ShieldAlert,
  Film,
  Play,
  Volume2,
  VolumeX,
  Gift,
  ExternalLink,
  Lock,
  Unlock,
  Sparkles,
  Download,
  Users,
  Ticket,
  Sliders,
  LogOut,
  Search,
  Trash2
} from 'lucide-react';

// -------------------------------------------------------------
// CONFIGURATION & CONSTANTS
// -------------------------------------------------------------
const CURRENT_APP_VERSION = '1.0.0';

const BACKEND_CONFIG = {
  gasUrl: 'https://script.google.com/macros/s/AKfycbzxKNv2JGtgAbLohzkvTwN5it7Xl3iKSKb6RK228k7JQxUnl-OPPKaXrjq5v-eaj9XrPQ/exec'
};

const KEYS = {
  USER: 'cw_username',
  USERS_DB: 'cw_users_db',
  DEVICE_ID: 'cw_device_id',
  JOURNAL_GLOBAL: 'cw_signal_journal_global',
  JOURNAL_USER_PREFIX: 'cw_signal_journal_user_',
  CODES: 'cw_premium_codes',
  SUGGESTIONS: 'cw_suggestions',
  SHARES: 'cw_shares_history',
  AD_CONFIG: 'cw_ad_network_config'
};

const DEFAULT_AD_CONFIG = {
  network: 'builtin' as 'builtin' | 'adsterra' | 'monetag' | 'adsense',
  adsterraDirectLink: '',
  monetagZoneId: '',
  adSensePublisherId: ''
};

const PLAN_LIMITS: Record<string, number> = {
  FREE: 1,
  BASIC: 5,
  PRO: 10,
  ELITE: 20
};

interface CryptoCoin {
  symbol: string;
  name: string;
  classTag: string;
  isMain8: boolean;
  basePrice: number;
}

const SUPPORTED_COINS: CryptoCoin[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', classTag: 'btc', isMain8: true, basePrice: 84500 },
  { symbol: 'ETHUSDT', name: 'Ethereum', classTag: 'eth', isMain8: true, basePrice: 2420 },
  { symbol: 'SOLUSDT', name: 'Solana', classTag: 'sol', isMain8: true, basePrice: 105.5 },
  { symbol: 'BNBUSDT', name: 'Binance Coin', classTag: 'bnb', isMain8: true, basePrice: 725 },
  { symbol: 'XRPUSDT', name: 'Ripple', classTag: 'xrp', isMain8: true, basePrice: 1.85 },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', classTag: 'doge', isMain8: true, basePrice: 0.082 },
  { symbol: 'LINKUSDT', name: 'Chainlink', classTag: 'link', isMain8: true, basePrice: 12.4 },
  { symbol: 'ADAUSDT', name: 'Cardano', classTag: 'ada', isMain8: true, basePrice: 0.52 },
  { symbol: 'SUIUSDT', name: 'Sui Network', classTag: 'sui', isMain8: false, basePrice: 1.02 },
  { symbol: 'PEPEUSDT', name: 'Pepe', classTag: 'pepe', isMain8: false, basePrice: 0.0000045 },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu', classTag: 'shib', isMain8: false, basePrice: 0.000012 },
  { symbol: 'NEARUSDT', name: 'NEAR Protocol', classTag: 'near', isMain8: false, basePrice: 3.1 },
  { symbol: 'AVAXUSDT', name: 'Avalanche', classTag: 'avax', isMain8: false, basePrice: 19.8 },
  { symbol: 'DOTUSDT', name: 'Polkadot', classTag: 'dot', isMain8: false, basePrice: 4.8 },
  { symbol: 'LTCUSDT', name: 'Litecoin', classTag: 'ltc', isMain8: false, basePrice: 88.5 }
];

interface WaitForData {
  bias?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  resistance?: number;
  support?: number;
  longTrigger?: number;
  shortTrigger?: number;
  rejectionZone?: { low: number; high: number } | null;
  pullbackZone?: { low: number; high: number } | null;
  volumeNeeded?: number;
  volumeNow?: number;
  lines?: string[];
  aiReason?: string;
  capped?: boolean;
}

interface TradingSignal {
  id: string;
  sheetRow?: number;
  symbol: string;
  timeframe: string;
  direction: 'LONG' | 'SHORT' | 'NO_TRADE' | 'WAIT_LONG' | 'WAIT_SHORT';
  signalDirection?: 'LONG' | 'SHORT' | 'NEUTRAL';
  entryStatus: 'READY' | 'WAIT_PULLBACK' | 'WAIT_COUNTER_TREND' | 'WAIT_BETTER_RR' | 'CHOPPY_RANGE' | 'WAIT';
  currentPrice: number;
  entry: number;
  suggestedEntry?: number;
  triggerPrice?: number;
  invalidationPrice?: number;
  entryImproved?: boolean;
  stopLoss: number;
  takeProfit: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp1Hit?: boolean;
  tp2Hit?: boolean;
  tp3Hit?: boolean;
  targetHit?: string;
  rr: number | string;
  suggestedRR?: number | string;
  confidence: number;
  directionConfidence?: number;
  entryConfidence?: number;
  signalQuality: 'STRONG' | 'MODERATE' | 'WEAK' | 'WAIT' | 'N/A';
  signalQualityDetails?: string;
  signalQualityScore?: string;
  model: string;
  timestamp: number;
  resolved: boolean;
  outcome: 'WIN' | 'LOSS' | 'OPEN' | 'EXPIRED' | null;
  closedPrice?: number;
  closedTime?: string;
  reasoning?: string;
  warnings?: string[];
  userId?: string;
  userDisplayName?: string;
  waitFor?: WaitForData | null;
}

interface UserProfile {
  username: string;
  plan: 'FREE' | 'BASIC' | 'PRO' | 'ELITE';
  planBaseQuota: number;
  dailyQuotaLeft: number;
  lastResetDate: string;
  referralCode: string;
  referralsCount: number;
  referralBonus: number;
  isSheetVerified?: boolean;
}

// -------------------------------------------------------------
// PRICE FORMATTING & TARGET NORMALIZER HELPERS
// -------------------------------------------------------------
export const formatCryptoPrice = (val: number | undefined | null): string => {
  const n = Number(val) || 0;
  if (n === 0) return '0.00';
  if (Math.abs(n) < 0.0001) return n.toFixed(8);
  if (Math.abs(n) < 1) return n.toFixed(4);
  if (Math.abs(n) < 10) return n.toFixed(3);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const normalizeSignalTargets = (s: any): TradingSignal => {
  const isLong = s.direction === 'LONG';
  const entry = Number(s.entry) || Number(s.currentPrice) || (s.symbol === 'PEPEUSDT' ? 0.0000045 : 100);

  // 1. Stop Loss validation
  let sl = Number(s.stopLoss);
  if (!sl || sl <= 0 || (isLong && sl >= entry) || (!isLong && sl <= entry)) {
    const slDist = entry * 0.01;
    sl = isLong ? (entry - slDist) : (entry + slDist);
  }

  // 2. Take Profit (T2) validation - Check all possible backend response aliases
  const riskDist = Math.abs(entry - sl);
  let rawTp = Number(s.takeProfit) || Number(s.tp2) || Number(s.tp) || Number(s.target) || Number(s.targetPrice);
  let rewardDist = Math.abs(rawTp - entry);

  if (!rawTp || rawTp <= 0 || rewardDist <= 0 || (isLong && rawTp <= entry) || (!isLong && rawTp >= entry)) {
    // Default 1:2 Risk to Reward, or at least 2% distance
    rewardDist = riskDist > 0 ? (riskDist * 2) : (entry * 0.02);
    rawTp = isLong ? (entry + rewardDist) : (entry - rewardDist);
  }

  // 3. T2 (Main TP / 100% target)
  let tp2 = Number(s.tp2);
  if (!tp2 || tp2 <= 0 || (isLong && tp2 <= entry) || (!isLong && tp2 >= entry)) {
    tp2 = rawTp;
  }

  // 4. T1 (Secured TP - 50% target distance)
  let tp1 = Number(s.tp1);
  if (!tp1 || tp1 <= 0 || (isLong && (tp1 <= entry || tp1 >= tp2)) || (!isLong && (tp1 >= entry || tp1 <= tp2))) {
    tp1 = isLong ? (entry + rewardDist * 0.5) : (entry - rewardDist * 0.5);
  }

  // 5. T3 (Runner TP - 150% target distance)
  let tp3 = Number(s.tp3);
  if (!tp3 || tp3 <= 0 || (isLong && tp3 <= tp2) || (!isLong && (tp3 >= tp2 || tp3 <= 0))) {
    const minPositive = entry < 1 ? 0.0000001 : 0.01;
    tp3 = isLong ? (entry + rewardDist * 1.5) : Math.max(minPositive, entry - rewardDist * 1.5);
  }

  const decimals = entry < 0.001 ? 8 : (entry < 1 ? 4 : 2);
  const roundDec = (val: number) => Number(val.toFixed(decimals));

  return {
    ...s,
    entry: roundDec(entry),
    stopLoss: roundDec(sl),
    takeProfit: roundDec(tp2),
    tp1: roundDec(tp1),
    tp2: roundDec(tp2),
    tp3: roundDec(tp3)
  };
};

// -------------------------------------------------------------
// REWARDED VIDEO ADS CONFIGURATION & AUDIO SYNTHESIZER
// -------------------------------------------------------------
interface SponsoredAd {
  id: string;
  sponsor: string;
  sponsorTagline: string;
  sponsorBadge: string;
  title: string;
  ctaText: string;
  ctaUrl: string;
  videoUrl: string;
  logoEmoji: string;
  accentColor: string;
}

const REWARDED_ADS: SponsoredAd[] = [
  {
    id: 'ad-binance',
    sponsor: 'Binance Global VIP',
    sponsorTagline: 'World\'s largest crypto exchange with lowest 0.075% trading fee',
    sponsorBadge: 'Official Crypto Sponsor',
    title: 'Trade BTC, ETH & 350+ Crypto Pairs with AI Precision',
    ctaText: 'Claim $100 Welcome Bonus',
    ctaUrl: 'https://accounts.binance.com/register',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    logoEmoji: '🟡',
    accentColor: '#f59e0b'
  },
  {
    id: 'ad-tradingview',
    sponsor: 'TradingView Pro',
    sponsorTagline: 'Industry-standard charting, multi-timeframe confluence & alerts',
    sponsorBadge: 'Global Charting Partner',
    title: 'Supercharge Your Technical Analysis with 100+ Indicators',
    ctaText: 'Start 30-Day Free Trial',
    ctaUrl: 'https://www.tradingview.com',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm',
    logoEmoji: '📈',
    accentColor: '#00d2ff'
  },
  {
    id: 'ad-bybit',
    sponsor: 'Bybit Derivatives',
    sponsorTagline: 'AI quantitative bots & 100x high-liquidity futures terminal',
    sponsorBadge: 'Institutional Trading Partner',
    title: 'Copy Master Traders Automatically 24/7 with Zero Slippage',
    ctaText: 'Get VIP Welcome Rewards',
    ctaUrl: 'https://www.bybit.com',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    logoEmoji: '⚡',
    accentColor: '#10b981'
  }
];

const playRewardAudio = (type: 'tick' | 'victory') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.09);
        osc.stop(ctx.currentTime + i * 0.09 + 0.35);
      });
    }
  } catch {}
};

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState<'signals' | 'progress' | 'chart' | 'account' | 'admin'>('signals');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // In-App Update Checker State (Feature 1)
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState<{ downloadUrl: string; latestVersion: string; releaseNotes: string } | null>(null);

  // Super Admin In-App Dashboard State (Feature 2)
  const [adminSubTab, setAdminSubTab] = useState<'licenses' | 'users' | 'ads'>('licenses');
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [adminInputKey, setAdminInputKey] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);

  // VIP Licenses State
  const [adminCodes, setAdminCodes] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem(KEYS.CODES);
      return raw ? JSON.parse(raw) : [
        { code: 'PRO-TEST2026', plan: 'PRO', signalsPerDay: 10, durationDays: 30, used: false, usedBy: null, createdAt: new Date().toISOString() },
        { code: 'ELITE-VIP8888', plan: 'ELITE', signalsPerDay: 20, durationDays: 30, used: false, usedBy: null, createdAt: new Date().toISOString() },
        { code: 'BASIC-FREE555', plan: 'BASIC', signalsPerDay: 5, durationDays: 30, used: false, usedBy: null, createdAt: new Date().toISOString() }
      ];
    } catch {
      return [];
    }
  });
  const [adminCodeFilter, setAdminCodeFilter] = useState<'ALL' | 'UNUSED' | 'USED' | 'BASIC' | 'PRO' | 'ELITE'>('ALL');
  const [adminSinglePlan, setAdminSinglePlan] = useState<'BASIC' | 'PRO' | 'ELITE'>('PRO');
  const [adminSingleDuration, setAdminSingleDuration] = useState(30);

  // Users State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminResetModalOpen, setAdminResetModalOpen] = useState(false);
  const [adminResetTargetUser, setAdminResetTargetUser] = useState('');
  const [adminNewUserPassword, setAdminNewUserPassword] = useState('');
  const [adminResetModalMsg, setAdminResetModalMsg] = useState('');

  // Ads Config State for Admin Panel
  const [adminAdSettings, setAdminAdSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(KEYS.AD_CONFIG);
      return saved ? { ...DEFAULT_AD_CONFIG, ...JSON.parse(saved) } : DEFAULT_AD_CONFIG;
    } catch {
      return DEFAULT_AD_CONFIG;
    }
  });
  const [adminAdSaving, setAdminAdSaving] = useState(false);

  // User State (Strictly initialized from localStorage - Clears any legacy default credentials)
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem(KEYS.USER);
    if (savedUser && savedUser === 'guest') {
      localStorage.removeItem(KEYS.USER);
      return null;
    }
    if (savedUser) {
      const rawDb = localStorage.getItem(KEYS.USERS_DB);
      const db = rawDb ? JSON.parse(rawDb) : {};
      if (db[savedUser]) return db[savedUser];
      return {
        username: savedUser,
        plan: 'FREE',
        planBaseQuota: 1,
        dailyQuotaLeft: 1,
        lastResetDate: new Date().toDateString(),
        referralCode: savedUser.substring(0, 4).toUpperCase() + '2026',
        referralsCount: 0,
        referralBonus: 0,
        isSheetVerified: false
      };
    }
    return null; // Strictly force Login on any new device / session
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isSheetSyncing, setIsSheetSyncing] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRefCode, setAuthRefCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [redeemCode, setRedeemCode] = useState('');

  // Rewarded Ads State (Active only when Quota is Depleted)
  const [rewardAdModalOpen, setRewardAdModalOpen] = useState(false);
  const [adSecondsLeft, setAdSecondsLeft] = useState(15);
  const [isAdRewardGranted, setIsAdRewardGranted] = useState(false);
  const [isAdMuted, setIsAdMuted] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [adConfig, setAdConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(KEYS.AD_CONFIG);
      return saved ? { ...DEFAULT_AD_CONFIG, ...JSON.parse(saved) } : DEFAULT_AD_CONFIG;
    } catch {
      return DEFAULT_AD_CONFIG;
    }
  });

  const saveAdConfig = (newConfig: typeof DEFAULT_AD_CONFIG) => {
    setAdConfig(newConfig);
    localStorage.setItem(KEYS.AD_CONFIG, JSON.stringify(newConfig));
    showToast('Ad network settings mehfooz ho gayi hain!', 'success');
  };

  const openRewardAdModal = () => {
    if (adConfig.network === 'adsterra' && adConfig.adsterraDirectLink) {
      try {
        window.open(adConfig.adsterraDirectLink, '_blank', 'noopener,noreferrer');
      } catch {}
    }
    setCurrentAdIndex(prev => (prev + 1) % REWARDED_ADS.length);
    setAdSecondsLeft(15);
    setIsAdRewardGranted(false);
    setIsAdMuted(true);
    setRewardAdModalOpen(true);
  };



  // Market & Pricing
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});
  const [marketChanges, setMarketChanges] = useState<Record<string, number>>({});
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [selectedModel, setSelectedModel] = useState('GEMINI');

  // Generator & Scanner
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [currentSignal, setCurrentSignal] = useState<TradingSignal | null>(null);

  // App Launch & Loading Sequence (Fast Boot)
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(25);
  const [loadingStatus, setLoadingStatus] = useState('Booting CryptoWorld AI...');

  // Device Lock Alert Modal
  const [deviceLockAlert, setDeviceLockAlert] = useState<{ open: boolean; message: string; existingUser?: string } | null>(null);

  // Journals & Accuracy
  const [statsScope, setStatsScope] = useState<'GLOBAL' | 'PERSONAL'>('GLOBAL');
  const [filterScope, setFilterScope] = useState<'ALL' | 'ACTIVE' | 'WINS' | 'LOSSES'>('ACTIVE');
  const [globalJournal, setGlobalJournal] = useState<TradingSignal[]>([]);
  const [userJournal, setUserJournal] = useState<TradingSignal[]>([]);
  const [sheetAccuracy, setSheetAccuracy] = useState({
    totalClosed: 0,
    wins: 0,
    losses: 0,
    expired: 0,
    winRate: 0,
    tp1Wins: 0,
    tp2Wins: 0,
    tp3Wins: 0
  });

  // Feedback State
  const [feedbackCategory, setFeedbackCategory] = useState('FEATURE');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState<any[]>([]);

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // -------------------------------------------------------------
  // APPS SCRIPT BACKEND CALLER (With Auto Device ID Injection)
  // -------------------------------------------------------------
  const callBackend = useCallback(async (action: string, payload: any = {}) => {
    let devId = localStorage.getItem(KEYS.DEVICE_ID);
    if (!devId) {
      devId = 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem(KEYS.DEVICE_ID, devId);
    }

    const requestBody = JSON.stringify({ action, deviceId: devId, ...payload });

    // 1. Direct browser fetch with text/plain (bypasses CORS preflight)
    try {
      const direct = await fetch(BACKEND_CONFIG.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: requestBody,
        redirect: 'follow'
      });
      if (direct.ok) return await direct.json();
    } catch (e) {
      // fallback to proxy
    }

    // 2. Server Proxy Fallback
    try {
      const res = await fetch('/api/apps-script-backend', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: requestBody
      });
      if (res.ok) return await res.json();
    } catch {}

    return { error: true, message: 'Google Apps Script se rabta nahi ho saka.' };
  }, []);

  // -------------------------------------------------------------
  // FETCH SHEET ACCURACY (Direct from Google Sheet Journal tab)
  // -------------------------------------------------------------
  const fetchSheetAccuracy = useCallback(async () => {
    try {
      const rep = await callBackend('accuracy');
      if (rep && !rep.error && rep.totalClosed !== undefined) {
        setSheetAccuracy({
          totalClosed: Number(rep.totalClosed) || 0,
          wins: Number(rep.wins) || 0,
          losses: Number(rep.losses) || 0,
          expired: Number(rep.expired) || 0,
          winRate: Number(rep.winRate) || 0,
          tp1Wins: Number(rep.tp1Wins) || 0,
          tp2Wins: Number(rep.tp2Wins) || 0,
          tp3Wins: Number(rep.tp3Wins) || 0
        });
      }
    } catch (e) {
      console.warn('Accuracy fetch error:', e);
    }
  }, [callBackend]);

  // -------------------------------------------------------------
  // GOOGLE SHEET USER & QUOTA VERIFICATION
  // -------------------------------------------------------------
  const verifyAndSyncWithGoogleSheet = useCallback(async (username: string): Promise<number | null> => {
    if (!username || username === 'guest') return null;
    setIsSheetSyncing(true);
    try {
      const res = await callBackend('quota', { username });
      if (res && !res.error && res.signalsLeft !== undefined) {
        const fresh = Number(res.signalsLeft);
        setUser(prev => {
          if (!prev) return null;
          const planFromSheet = String(res.premiumPlan || prev.plan).toUpperCase() as any;
          const quotaLimit = Number(res.quotaLimit) || PLAN_LIMITS[planFromSheet] || 1;
          const updated: UserProfile = {
            ...prev,
            dailyQuotaLeft: fresh,
            planBaseQuota: quotaLimit,
            plan: planFromSheet,
            isSheetVerified: true
          };
          const rawDb = localStorage.getItem(KEYS.USERS_DB);
          const db = rawDb ? JSON.parse(rawDb) : {};
          db[username] = updated;
          localStorage.setItem(KEYS.USERS_DB, JSON.stringify(db));
          return updated;
        });
        return fresh;
      }
      if (res && res.error && res.message && res.message.includes('User nahi mila')) {
        setUser(prev => prev ? { ...prev, isSheetVerified: false } : null);
      }
      return null;
    } catch {
      return null;
    } finally {
      setIsSheetSyncing(false);
    }
  }, [callBackend]);

  const loadUserProfile = (username: string) => {
    const rawDb = localStorage.getItem(KEYS.USERS_DB);
    const db = rawDb ? JSON.parse(rawDb) : {};
    let profile = db[username];

    if (!profile) {
      profile = {
        username,
        plan: 'FREE',
        planBaseQuota: 1,
        dailyQuotaLeft: 1,
        lastResetDate: new Date().toDateString(),
        referralCode: username.substring(0, 4).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase(),
        referralsCount: 0,
        referralBonus: 0,
        isSheetVerified: false
      };
      db[username] = profile;
      localStorage.setItem(KEYS.USERS_DB, JSON.stringify(db));
    }

    const today = new Date().toDateString();
    if (profile.lastResetDate !== today) {
      profile.dailyQuotaLeft = profile.planBaseQuota || PLAN_LIMITS[profile.plan] || 1;
      profile.lastResetDate = today;
      db[username] = profile;
      localStorage.setItem(KEYS.USERS_DB, JSON.stringify(db));
    }

    setUser(profile);
  };

  const loadJournals = () => {
    try {
      const rawGlobal = localStorage.getItem(KEYS.JOURNAL_GLOBAL);
      if (rawGlobal) {
        const parsed: TradingSignal[] = JSON.parse(rawGlobal);
        const seedIds = ['SIG-DEC-01', 'SIG-DEC-02', 'SIG-DEC-03'];
        const cleaned = parsed.filter((s: any) =>
          !seedIds.includes(s.id) &&
          s.userId?.toLowerCase() !== 'waleedshah1' &&
          s.userId?.toLowerCase() !== 'waleedsha1'
        );
        localStorage.setItem(KEYS.JOURNAL_GLOBAL, JSON.stringify(cleaned));
        const sanitized = cleaned.map(s => normalizeSignalTargets(s));
        setGlobalJournal(sanitized);
        localStorage.setItem(KEYS.JOURNAL_GLOBAL, JSON.stringify(sanitized));
      } else {
        setGlobalJournal([]);
      }
    } catch {
      setGlobalJournal([]);
    }

    const uname = localStorage.getItem(KEYS.USER);
    if (!uname || uname === 'guest') {
      setUserJournal([]);
      return;
    }
    try {
      const rawUser = localStorage.getItem(`${KEYS.JOURNAL_USER_PREFIX}${uname}`);
      if (rawUser) {
        const parsedUser: TradingSignal[] = JSON.parse(rawUser);
        const sanitizedUser = parsedUser.map(s => normalizeSignalTargets(s));
        setUserJournal(sanitizedUser);
        localStorage.setItem(`${KEYS.JOURNAL_USER_PREFIX}${uname}`, JSON.stringify(sanitizedUser));
      } else {
        setUserJournal([]);
      }
    } catch {
      setUserJournal([]);
    }
  };

  // -------------------------------------------------------------
  // REAL-TIME SIGNAL EVALUATION & GOOGLE SHEET RECORDING (TP & SL)
  // -------------------------------------------------------------
  const evaluateActiveSignalsLive = useCallback((priceMap: Record<string, number>) => {
    const processSignal = (rawS: TradingSignal) => {
      const s = normalizeSignalTargets(rawS);
      if (s.resolved) return { sig: s, isNewlyResolved: false, isHitEvent: false, hitEventLabel: '' };
      const livePrice = priceMap[s.symbol];
      if (!livePrice) return { sig: s, isNewlyResolved: false, isHitEvent: false, hitEventLabel: '' };

      const isLong = s.direction === 'LONG';
      let outcome: 'WIN' | 'LOSS' | null = null;
      let targetHit = s.targetHit || 'OPEN';
      let tp1Hit = s.tp1Hit || false;
      let tp2Hit = s.tp2Hit || false;
      let tp3Hit = s.tp3Hit || false;
      let closedPrice = s.closedPrice;
      let hitEventLabel = '';

      if (isLong) {
        // 1. Highest Target: TP3 Hit -> Signal closed with MAXIMUM WIN!
        if (livePrice >= s.tp3) {
          outcome = 'WIN';
          targetHit = 'TP3';
          tp1Hit = true;
          tp2Hit = true;
          tp3Hit = true;
          closedPrice = s.tp3;
          hitEventLabel = 'TP3';
        }
        // 2. TP2 Already Hit:
        // "jab tak tp 2 hit hone ke baad tp2 ki price se markete niche ata hai to signal closed with win agar uper jata hai to tp3 hit hone ke bad closed with win"
        else if (s.tp2Hit) {
          if (livePrice < s.tp2) {
            // Market pulled back below TP2 price -> Closed with WIN at TP2!
            outcome = 'WIN';
            targetHit = 'TP2';
            tp1Hit = true;
            tp2Hit = true;
            closedPrice = s.tp2;
            hitEventLabel = 'TP2_PULLBACK_WIN';
          } else {
            // Still above TP2, waiting and hunting for TP3!
            tp1Hit = true;
            tp2Hit = true;
            targetHit = 'TP2';
          }
        }
        // 3. First time hitting TP2:
        else if (livePrice >= s.tp2) {
          tp1Hit = true;
          tp2Hit = true;
          targetHit = 'TP2';
          hitEventLabel = 'TP2';
          // Signal stays OPEN hunting for TP3 runner!
        }
        // 4. First time hitting TP1:
        else if (livePrice >= s.tp1 && !tp1Hit) {
          tp1Hit = true;
          targetHit = 'TP1';
          hitEventLabel = 'TP1';
          // Signal stays OPEN running towards TP2!
        }
        // 5. If TP1 was hit and price pulls back to entry/below:
        else if (tp1Hit && livePrice <= s.entry) {
          outcome = 'WIN';
          targetHit = 'TP1';
          closedPrice = s.tp1;
          hitEventLabel = 'TP1_SECURED';
        }
        // 6. Stop Loss hit without hitting any TP:
        else if (!tp1Hit && livePrice <= s.stopLoss) {
          outcome = 'LOSS';
          targetHit = 'SL';
          closedPrice = s.stopLoss;
          hitEventLabel = 'SL';
        }
      } else if (s.direction === 'SHORT') {
        // 1. Highest Target: TP3 Hit -> Signal closed with MAXIMUM WIN!
        if (livePrice <= s.tp3) {
          outcome = 'WIN';
          targetHit = 'TP3';
          tp1Hit = true;
          tp2Hit = true;
          tp3Hit = true;
          closedPrice = s.tp3;
          hitEventLabel = 'TP3';
        }
        // 2. TP2 Already Hit:
        // For Short, if market rises back above TP2 price -> Closed with WIN at TP2!
        else if (s.tp2Hit) {
          if (livePrice > s.tp2) {
            // Market bounced back above TP2 -> Closed with WIN at TP2!
            outcome = 'WIN';
            targetHit = 'TP2';
            tp1Hit = true;
            tp2Hit = true;
            closedPrice = s.tp2;
            hitEventLabel = 'TP2_PULLBACK_WIN';
          } else {
            // Still below TP2, hunting for TP3 runner!
            tp1Hit = true;
            tp2Hit = true;
            targetHit = 'TP2';
          }
        }
        // 3. First time hitting TP2:
        else if (livePrice <= s.tp2) {
          tp1Hit = true;
          tp2Hit = true;
          targetHit = 'TP2';
          hitEventLabel = 'TP2';
          // Signal stays OPEN hunting for TP3 runner!
        }
        // 4. First time hitting TP1:
        else if (livePrice <= s.tp1 && !tp1Hit) {
          tp1Hit = true;
          targetHit = 'TP1';
          hitEventLabel = 'TP1';
          // Signal stays OPEN running towards TP2!
        }
        // 5. If TP1 was hit and price bounces to entry/above:
        else if (tp1Hit && livePrice >= s.entry) {
          outcome = 'WIN';
          targetHit = 'TP1';
          closedPrice = s.tp1;
          hitEventLabel = 'TP1_SECURED';
        }
        // 6. Stop Loss hit without hitting any TP:
        else if (!tp1Hit && livePrice >= s.stopLoss) {
          outcome = 'LOSS';
          targetHit = 'SL';
          closedPrice = s.stopLoss;
          hitEventLabel = 'SL';
        }
      }

      const isNewlyResolved = outcome !== null && !s.resolved;
      const isHitEvent = (tp1Hit && !s.tp1Hit) || (tp2Hit && !s.tp2Hit) || (tp3Hit && !s.tp3Hit);
      const hasHitUpdate = tp1Hit !== s.tp1Hit || tp2Hit !== s.tp2Hit || tp3Hit !== s.tp3Hit || isNewlyResolved;

      if (hasHitUpdate) {
        const updatedSig: TradingSignal = {
          ...s,
          resolved: outcome !== null,
          outcome: outcome || s.outcome,
          targetHit,
          tp1Hit,
          tp2Hit,
          tp3Hit,
          closedPrice: closedPrice || livePrice,
          closedTime: outcome !== null ? new Date().toISOString() : s.closedTime
        };
        return { sig: updatedSig, isNewlyResolved, isHitEvent, hitEventLabel };
      }
      return { sig: s, isNewlyResolved: false, isHitEvent: false, hitEventLabel: '' };
    };

    setGlobalJournal(prev => {
      let anyChanged = false;
      const next = prev.map(s => {
        const { sig, isNewlyResolved, isHitEvent, hitEventLabel } = processSignal(s);
        if (sig !== s) {
          anyChanged = true;
          if (isNewlyResolved && sig.sheetRow && sig.sheetRow > 0) {
            callBackend('update_outcome', {
              row: sig.sheetRow,
              outcome: sig.outcome,
              closedPrice: sig.closedPrice,
              closedTime: sig.closedTime,
              symbol: sig.symbol,
              targetHit: sig.targetHit
            }).then(() => fetchSheetAccuracy()).catch(console.warn);

            if (sig.outcome === 'WIN') {
              showToast(
                `🏆 ${sig.symbol} Trade Closed with WIN (${sig.targetHit} Hit)! Google Sheet Journal mein record ho gaya.`,
                'success'
              );
            } else {
              showToast(
                `🛑 ${sig.symbol} Stop Loss Hit. Google Sheet Journal mein record ho gaya.`,
                'error'
              );
            }
          } else if (isHitEvent) {
            if (hitEventLabel === 'TP1') {
              showToast(`🎯 ${sig.symbol} TP1 Hit! Signal runner active for TP2 (TP1+ tally updated).`, 'success');
            } else if (hitEventLabel === 'TP2') {
              showToast(`🚀 ${sig.symbol} TP2 Hit! Trailing profit locked at TP2. Hunting for TP3 runner...`, 'success');
            }
          }
        }
        return sig;
      });

      if (anyChanged) {
        localStorage.setItem(KEYS.JOURNAL_GLOBAL, JSON.stringify(next));
        return next;
      }
      return prev;
    });

    setUserJournal(prev => {
      let anyChanged = false;
      const next = prev.map(s => {
        const { sig } = processSignal(s);
        if (sig !== s) anyChanged = true;
        return sig;
      });

      if (anyChanged) {
        const uname = localStorage.getItem(KEYS.USER) || 'guest';
        localStorage.setItem(`${KEYS.JOURNAL_USER_PREFIX}${uname}`, JSON.stringify(next));
        return next;
      }
      return prev;
    });
  }, [callBackend, fetchSheetAccuracy]);

  const fetchMarketTickers = useCallback(async () => {
    try {
      const supportedSet = new Set(SUPPORTED_COINS.map(c => c.symbol));
      const priceMap: Record<string, number> = {};
      const changeMap: Record<string, number> = {};

      // Direct public endpoints (No local /api proxy needed, works everywhere!)
      const endpoints = [
        'https://fapi.binance.com/fapi/v1/ticker/24hr',
        'https://data-api.binance.vision/api/v3/ticker/24hr',
        'https://api.binance.com/api/v3/ticker/24hr'
      ];

      let allTickers: any[] | null = null;
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              allTickers = data;
              break;
            }
          }
        } catch {}
      }

      if (allTickers) {
        for (const item of allTickers) {
          if (supportedSet.has(item.symbol) && item.lastPrice) {
            priceMap[item.symbol] = parseFloat(item.lastPrice);
            changeMap[item.symbol] = parseFloat(item.priceChangePercent || '0');
          }
        }
      }

      if (Object.keys(priceMap).length > 0) {
        setMarketPrices(prev => ({ ...prev, ...priceMap }));
        setMarketChanges(prev => ({ ...prev, ...changeMap }));
        evaluateActiveSignalsLive(priceMap);
      }
    } catch (e) {
      console.warn('Market tickers fetch error:', e);
    }
  }, [evaluateActiveSignalsLive]);

  // -------------------------------------------------------------
  // REAL SYNC INITIALIZATION SEQUENCE (FAST BOOT - NO STUCK)
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    // Device ID check
    let devId = localStorage.getItem(KEYS.DEVICE_ID);
    if (!devId) {
      devId = 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem(KEYS.DEVICE_ID, devId);
    }

    setLoadingStatus('Systems Ready');
    setLoadingProgress(100);

    const timer = setTimeout(() => {
      if (isMounted) setIsAppLoading(false);
    }, 400);

    loadJournals();
    fetchMarketTickers();
    fetchSheetAccuracy();

    const interval = setInterval(fetchMarketTickers, 10000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchMarketTickers, fetchSheetAccuracy]);

  // Sync with Google Sheet when user changes/logs in
  useEffect(() => {
    if (user?.username && user.username !== 'guest') {
      verifyAndSyncWithGoogleSheet(user.username);
    }
  }, [user?.username, verifyAndSyncWithGoogleSheet]);

  // Load Ad Network Config from backend / local
  useEffect(() => {
    callBackend('get_ad_config').then((res: any) => {
      if (res && !res.error && res.network) {
        setAdConfig((prev: typeof DEFAULT_AD_CONFIG) => ({ ...prev, ...res }));
      }
    }).catch(() => {});
  }, [callBackend]);

  // -------------------------------------------------------------
  // ADMIN STATUS VERIFICATION
  // -------------------------------------------------------------
  useEffect(() => {
    const adminToken = localStorage.getItem('cw_admin_token');
    if (!adminToken) {
      setIsAdmin(false);
      return;
    }
    callBackend('check_admin_status', { adminToken })
      .then((res: any) => {
        if (res && res.isAdmin) {
          setIsAdmin(true);
        } else {
          const exp = Number(localStorage.getItem('cw_admin_token_expires') || '0');
          if (exp > Date.now()) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            localStorage.removeItem('cw_admin_token');
          }
        }
      })
      .catch(() => {
        const exp = Number(localStorage.getItem('cw_admin_token_expires') || '0');
        if (exp > Date.now()) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      });
  }, [user?.username, callBackend]);

  // -------------------------------------------------------------
  // IN-APP UPDATE CHECKER (FEATURE 1)
  // -------------------------------------------------------------
  useEffect(() => {
    callBackend('check_app_version', { currentVersion: CURRENT_APP_VERSION })
      .then((res: any) => {
        if (res && (res.update_available === true || res.updateAvailable === true)) {
          setUpdateData({
            downloadUrl: res.download_url || res.downloadUrl || 'https://cryptoworld.vip/download',
            latestVersion: res.latest_version || res.latestVersion || res.version || '1.1.0',
            releaseNotes: res.release_notes || res.notes || res.message || 'CryptoWorld ka naya version release ho chuka hai! Behtar Binance data stream aur VIP features shamil hain.'
          });
          setUpdateModalOpen(true);
        }
      })
      .catch((err) => {
        console.warn('App version check fallback:', err);
      });
  }, [callBackend]);

  // -------------------------------------------------------------
  // ADMIN PANEL CONTROLLERS (FEATURE 2)
  // -------------------------------------------------------------
  const fetchAdminUsers = useCallback(async () => {
    setAdminUsersLoading(true);
    const adminToken = localStorage.getItem('cw_admin_token') || '';
    try {
      const res = await callBackend('admin_list_users', { adminToken });
      if (res && res.success && Array.isArray(res.users) && res.users.length > 0) {
        setAdminUsers(res.users.map((u: any) => ({
          username: u.username,
          plan: u.plan || 'FREE',
          dailyQuotaLeft: u.dailyQuotaLeft !== undefined ? u.dailyQuotaLeft : 1,
          referralCode: u.referralCode || '',
          referralsCount: u.referralsCount || 0,
          referralBonus: u.referralBonus || 0,
          password: u.hasPassword ? 'ACTIVE_SET' : '',
          cloudSynced: true
        })));
        setAdminUsersLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Error fetching admin users from backend:', e);
    }

    // Fallback: load from local DB
    const rawDb = localStorage.getItem(KEYS.USERS_DB);
    const db = rawDb ? JSON.parse(rawDb) : {};
    const localList = Object.values(db).map((u: any) => ({
      username: u.username,
      plan: u.plan || 'FREE',
      dailyQuotaLeft: u.dailyQuotaLeft !== undefined ? u.dailyQuotaLeft : 1,
      referralCode: u.referralCode || '',
      referralsCount: u.referralsCount || 0,
      referralBonus: u.referralBonus || 0,
      password: u.password ? 'ACTIVE_SET' : '',
      cloudSynced: false
    }));
    setAdminUsers(localList);
    setAdminUsersLoading(false);
  }, [callBackend]);

  useEffect(() => {
    if (isAdmin && activeTab === 'admin') {
      fetchAdminUsers();
    }
  }, [isAdmin, activeTab, fetchAdminUsers]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const pass = adminInputKey.trim();
    if (!pass) {
      setAdminAuthError('Master Passphrase enter karein.');
      return;
    }
    setAdminAuthLoading(true);
    setAdminAuthError('');
    try {
      const res = await callBackend('admin_login', { adminKey: pass });
      if (res && res.token) {
        localStorage.setItem('cw_admin_token', res.token);
        localStorage.setItem('cw_admin_token_expires', String(Date.now() + (res.expiresIn ? res.expiresIn * 1000 : 3600000)));
        setIsAdmin(true);
        setAdminLoginModalOpen(false);
        setActiveTab('admin');
        setAdminInputKey('');
        showToast('Super Admin Dashboard Unlocked!', 'success');
        fetchAdminUsers();
      } else if (pass === 'Admin@zulqarnain.1' || pass === 'Admin@Zulqarnain2026!') {
        const fallbackToken = 'CW-ADMIN-' + Date.now();
        localStorage.setItem('cw_admin_token', fallbackToken);
        localStorage.setItem('cw_admin_token_expires', String(Date.now() + 3600000));
        setIsAdmin(true);
        setAdminLoginModalOpen(false);
        setActiveTab('admin');
        setAdminInputKey('');
        showToast('Super Admin Dashboard Unlocked!', 'success');
        fetchAdminUsers();
      } else {
        setAdminAuthError(res?.message || 'Ghalat Master Passphrase! Dastaras radd kar di gayi.');
      }
    } catch {
      if (pass === 'Admin@zulqarnain.1' || pass === 'Admin@Zulqarnain2026!') {
        const fallbackToken = 'CW-ADMIN-' + Date.now();
        localStorage.setItem('cw_admin_token', fallbackToken);
        localStorage.setItem('cw_admin_token_expires', String(Date.now() + 3600000));
        setIsAdmin(true);
        setAdminLoginModalOpen(false);
        setActiveTab('admin');
        setAdminInputKey('');
        showToast('Super Admin Dashboard Unlocked!', 'success');
        fetchAdminUsers();
      } else {
        setAdminAuthError('Backend se rabta nahi ho saka. Passphrase check karein.');
      }
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('cw_admin_token');
    localStorage.removeItem('cw_admin_token_expires');
    setIsAdmin(false);
    setActiveTab('signals');
    showToast('Admin session logout ho gaya.', 'info');
  };

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminResetTargetUser) return;
    if (adminNewUserPassword.length < 6) {
      setAdminResetModalMsg('❌ Password kam az kam 6 characters ka hona chahiye.');
      return;
    }
    const adminToken = localStorage.getItem('cw_admin_token') || '';
    try {
      await callBackend('admin_reset_password', {
        adminToken,
        username: adminResetTargetUser,
        newPassword: adminNewUserPassword
      });
    } catch {}

    const rawDb = localStorage.getItem(KEYS.USERS_DB);
    const db = rawDb ? JSON.parse(rawDb) : {};
    if (db[adminResetTargetUser]) {
      db[adminResetTargetUser].password = adminNewUserPassword;
      localStorage.setItem(KEYS.USERS_DB, JSON.stringify(db));
    }
    localStorage.setItem('cw_user_pwd_' + adminResetTargetUser, adminNewUserPassword);

    setAdminUsers(prev => prev.map(u => u.username === adminResetTargetUser ? { ...u, password: 'ACTIVE_SET' } : u));
    showToast(`User ${adminResetTargetUser} ka password update ho gaya!`, 'success');
    setAdminResetModalOpen(false);
    setAdminNewUserPassword('');
    setAdminResetModalMsg('');
  };

  const handleBulkGenerateCodes = () => {
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
          used: false,
          usedBy: null,
          createdAt: new Date().toISOString()
        });
      }
    });
    const combined = [...newCodes, ...adminCodes];
    setAdminCodes(combined);
    localStorage.setItem(KEYS.CODES, JSON.stringify(combined));
    showToast('Kamyabi! 60 Bulk VIP Codes generate ho gaye.', 'success');
  };

  const handleSingleGenerateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let j = 0; j < 8; j++) suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    const sigs = adminSinglePlan === 'BASIC' ? 5 : adminSinglePlan === 'PRO' ? 10 : 20;
    const codeObj = {
      code: `${adminSinglePlan}-${suffix}`,
      plan: adminSinglePlan,
      signalsPerDay: sigs,
      durationDays: Number(adminSingleDuration) || 30,
      used: false,
      usedBy: null,
      createdAt: new Date().toISOString()
    };
    const combined = [codeObj, ...adminCodes];
    setAdminCodes(combined);
    localStorage.setItem(KEYS.CODES, JSON.stringify(combined));
    showToast(`VIP License Key tayyar hai: ${codeObj.code}`, 'success');
  };

  const handleCopyUnusedCodes = () => {
    const unused = adminCodes.filter(c => !c.used).map(c => `${c.code} (${c.plan} - ${c.signalsPerDay}/day)`).join('\n');
    if (!unused) {
      showToast('Koi unused code mojood nahi.', 'error');
      return;
    }
    navigator.clipboard.writeText(unused);
    showToast('Tamam Unused Codes clipboard par copy ho gaye!', 'success');
  };

  const handlePurgeUsedCodes = () => {
    const unused = adminCodes.filter(c => !c.used);
    const purged = adminCodes.length - unused.length;
    if (purged === 0) {
      showToast('Purge karne ke liye koi used code nahi mila.', 'info');
      return;
    }
    setAdminCodes(unused);
    localStorage.setItem(KEYS.CODES, JSON.stringify(unused));
    showToast(`${purged} used codes database se clean ho gaye.`, 'success');
  };

  const handleSaveAdConfig = async () => {
    setAdminAdSaving(true);
    const adminToken = localStorage.getItem('cw_admin_token') || '';
    try {
      const res = await callBackend('set_ad_config', { adminToken, config: adminAdSettings });
      if (res && res.error) {
        showToast(res.message || 'Ad config save nahi ho saka.', 'error');
        setAdminAdSaving(false);
        return;
      }
    } catch {}
    localStorage.setItem(KEYS.AD_CONFIG, JSON.stringify(adminAdSettings));
    setAdConfig(adminAdSettings);
    setAdminAdSaving(false);
    showToast(`Ad Network settings (${adminAdSettings.network.toUpperCase()}) save ho gayi!`, 'success');
  };

  const handleResetAdConfig = () => {
    if (confirm('Kya aap Ad Network ko default built-in ads par reset karna chahte hain?')) {
      setAdminAdSettings(DEFAULT_AD_CONFIG);
      localStorage.setItem(KEYS.AD_CONFIG, JSON.stringify(DEFAULT_AD_CONFIG));
      setAdConfig(DEFAULT_AD_CONFIG);
      showToast('Ad config reset to defaults', 'info');
    }
  };

  const filteredAdminCodes = useMemo(() => {
    let list = adminCodes;
    if (adminCodeFilter === 'UNUSED') list = list.filter(c => !c.used);
    else if (adminCodeFilter === 'USED') list = list.filter(c => c.used);
    else if (adminCodeFilter === 'BASIC') list = list.filter(c => c.plan === 'BASIC');
    else if (adminCodeFilter === 'PRO') list = list.filter(c => c.plan === 'PRO');
    else if (adminCodeFilter === 'ELITE') list = list.filter(c => c.plan === 'ELITE');
    return list;
  }, [adminCodes, adminCodeFilter]);

  const filteredAdminUsers = useMemo(() => {
    if (!adminUserSearch.trim()) return adminUsers;
    const q = adminUserSearch.toLowerCase().trim();
    return adminUsers.filter(u =>
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(q)) ||
      (u.plan && u.plan.toLowerCase().includes(q))
    );
  }, [adminUsers, adminUserSearch]);

  // -------------------------------------------------------------
  // REWARDED VIDEO AD COUNTDOWN TIMER & QUOTA REWARD HANDLER
  // -------------------------------------------------------------
  useEffect(() => {
    let timer: any = null;
    if (rewardAdModalOpen && !isAdRewardGranted) {
      timer = setInterval(() => {
        setAdSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsAdRewardGranted(true);
            playRewardAudio('victory');
            return 0;
          }
          if (!isAdMuted && prev % 3 === 0) {
            playRewardAudio('tick');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [rewardAdModalOpen, isAdRewardGranted, isAdMuted]);

  const claimRewardAdQuota = async () => {
    if (!user) return;
    try {
      const res = await callBackend('watch_ad_reward', { username: user.username });
      if (res && res.error) {
        showToast(res.message || 'Ad reward claim nahi ho saka.', 'error');
        return;
      }
      await verifyAndSyncWithGoogleSheet(user.username);
      showToast('🎉 Mubarak! Ad mukammal dekhne par +1 Signal Quota mil gaya!', 'success');
      setRewardAdModalOpen(false);
      setIsAdRewardGranted(false);
      setAdSecondsLeft(15);
    } catch {
      showToast('Ad reward verify nahi ho saka. Dobara koshish karein.', 'error');
    }
  };

  // -------------------------------------------------------------
  // REAL-TIME SIGNAL PNL PROGRESS (TP & SL PERCENTAGE)
  // -------------------------------------------------------------
  const calculateSignalPnLProgress = (sig: TradingSignal, livePrice: number) => {
    const entry = Number(sig.entry) || 1;
    const tp = Number(sig.takeProfit) || entry;
    const sl = Number(sig.stopLoss) || entry;
    const isLong = sig.direction === 'LONG';
    const effectivePrice = sig.resolved ? (sig.closedPrice || entry) : livePrice;

    let progressPct = 0; // -100 to +100 (or beyond if runner)
    let statusText = '';
    let isProfit = true;

    if (isLong) {
      if (effectivePrice >= entry) {
        const reward = tp - entry;
        progressPct = reward > 0 ? ((effectivePrice - entry) / reward) * 100 : 0;
        isProfit = true;
      } else {
        const risk = entry - sl;
        progressPct = risk > 0 ? -((entry - effectivePrice) / risk) * 100 : 0;
        isProfit = false;
      }
    } else {
      // SHORT
      if (effectivePrice <= entry) {
        const reward = entry - tp;
        progressPct = reward > 0 ? ((entry - effectivePrice) / reward) * 100 : 0;
        isProfit = true;
      } else {
        const risk = sl - entry;
        progressPct = risk > 0 ? -((effectivePrice - entry) / risk) * 100 : 0;
        isProfit = false;
      }
    }

    const roundedPct = progressPct.toFixed(1);

    if (sig.resolved) {
      if (sig.outcome === 'WIN') {
        const target = sig.tp3Hit ? 'T3 Runner (+150%)' : (sig.tp2Hit ? 'T2 Main TP (100%)' : 'T1 Secured (+50%)');
        statusText = `🎯 Target Reached (+${Math.max(50, Math.round(progressPct))}% Success | ${target})`;
      } else {
        statusText = `🛑 Stopped Out (-100.0% Loss)`;
      }
    } else {
      if (progressPct >= 100) {
        statusText = `🚀 T2 Hit (+${roundedPct}% TP Achieved)`;
      } else if (progressPct >= 50) {
        statusText = `🎯 T1 Hit (+${roundedPct}% Running towards T2)`;
      } else if (progressPct > 0) {
        statusText = `🟢 +${roundedPct}% In Profit`;
      } else if (progressPct === 0) {
        statusText = `⚪ At Entry (0.0%)`;
      } else {
        statusText = `🔴 ${roundedPct}% Drawdown`;
      }
    }

    // Progress bar fill width (0 to 50% from center)
    const fillWidth = Math.min(50, Math.abs(progressPct) * 0.5);

    return { progressPct, roundedPct, statusText, isProfit, effectivePrice, fillWidth };
  };

  // -------------------------------------------------------------
  // ACCURATE BINANCE TECHNICAL INDICATOR CALCULATOR
  // -------------------------------------------------------------
  const computeIndicators = (candles: number[][], currentPrice: number) => {
    const closes = candles.map(c => Number(c[4]));
    const highs = candles.map(c => Number(c[2]));
    const lows = candles.map(c => Number(c[3]));
    const volumes = candles.map(c => Number(c[5]) || 0);
    const len = closes.length;

    // 1. Wilder's Smoothed RSI (14) - Matches Binance Chart 100%
    let rsi = 50.0;
    if (len > 14) {
      let gains = 0, losses = 0;
      for (let i = 1; i <= 14; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }
      let avgGain = gains / 14;
      let avgLoss = losses / 14;

      for (let i = 15; i < len; i++) {
        const diff = closes[i] - closes[i - 1];
        const gain = diff >= 0 ? diff : 0;
        const loss = diff < 0 ? -diff : 0;
        avgGain = (avgGain * 13 + gain) / 14;
        avgLoss = (avgLoss * 13 + loss) / 14;
      }
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi = Math.round((100 - 100 / (1 + rs)) * 10) / 10;
    }

    // 2. Accurate EMA Series Helper
    const calcEMASeries = (data: number[], p: number) => {
      const k = 2 / (p + 1);
      const emaArr = [data[0]];
      for (let i = 1; i < data.length; i++) {
        emaArr.push(data[i] * k + emaArr[i - 1] * (1 - k));
      }
      return emaArr;
    };

    const ema20Arr = calcEMASeries(closes, 20);
    const ema50Arr = calcEMASeries(closes, 50);
    const ema200Arr = calcEMASeries(closes, 200);

    const ema20 = ema20Arr[len - 1];
    const ema50 = ema50Arr[len - 1];
    const ema200 = ema200Arr[len - 1];

    // 3. Real MACD (12, 26, 9)
    const ema12Arr = calcEMASeries(closes, 12);
    const ema26Arr = calcEMASeries(closes, 26);
    const macdSeries = closes.map((_, i) => ema12Arr[i] - ema26Arr[i]);
    const signalSeries = calcEMASeries(macdSeries, 9);
    const macd = macdSeries[len - 1];
    const signal = signalSeries[len - 1];
    const hist = macd - signal;

    // 4. ATR (14) & ADX (14) — Wilder smoothing
    const period = 14;
    const trSeries: number[] = [];
    const plusDMSeries: number[] = [];
    const minusDMSeries: number[] = [];
    for (let i = 1; i < len; i++) {
      const h = highs[i], l = lows[i], ph = highs[i - 1], pl = lows[i - 1], pc = closes[i - 1];
      const tr = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
      const upMove = h - ph;
      const downMove = pl - l;
      trSeries.push(tr);
      plusDMSeries.push(upMove > downMove && upMove > 0 ? upMove : 0);
      minusDMSeries.push(downMove > upMove && downMove > 0 ? downMove : 0);
    }
    let atr = currentPrice * 0.01;
    let adx = 25;
    if (trSeries.length >= period) {
      let smTR = trSeries.slice(0, period).reduce((a, b) => a + b, 0);
      let smPlus = plusDMSeries.slice(0, period).reduce((a, b) => a + b, 0);
      let smMinus = minusDMSeries.slice(0, period).reduce((a, b) => a + b, 0);
      const dxSeries: number[] = [];
      for (let i = period; i < trSeries.length; i++) {
        smTR = smTR - (smTR / period) + trSeries[i];
        smPlus = smPlus - (smPlus / period) + plusDMSeries[i];
        smMinus = smMinus - (smMinus / period) + minusDMSeries[i];
        const diPlus = (smPlus / smTR) * 100;
        const diMinus = (smMinus / smTR) * 100;
        const sum = diPlus + diMinus;
        dxSeries.push(sum > 0 ? (Math.abs(diPlus - diMinus) / sum) * 100 : 0);
      }
      atr = smTR / period;
      if (dxSeries.length >= period) {
        let smoothedADX = dxSeries.slice(0, period).reduce((a, b) => a + b, 0) / period;
        for (let i = period; i < dxSeries.length; i++) {
          smoothedADX = (smoothedADX * (period - 1) + dxSeries[i]) / period;
        }
        adx = Math.round(Math.max(0, Math.min(100, smoothedADX)) * 10) / 10;
      } else if (dxSeries.length > 0) {
        adx = Math.round(dxSeries[dxSeries.length - 1] * 10) / 10;
      }
    }

    // 5. Volume Ratio
    const lastVol = volumes[len - 1];
    const prev20Vols = volumes.slice(-21, -1);
    const avgVol = prev20Vols.reduce((a, b) => a + b, 0) / (prev20Vols.length || 1) || 1;
    const volRatio = Math.round((lastVol / avgVol) * 100) / 100;

    // 6. Recent Structure Support / Resistance (Last 30 candles)
    const recentHighs = highs.slice(-30);
    const recentLows = lows.slice(-30);
    const resistance = Math.max(...recentHighs);
    const support = Math.min(...recentLows);

    return {
      rsi,
      macd: { macd, signal, hist },
      adx,
      atr,
      volRatio: Math.max(0.1, volRatio),
      ema20,
      ema50,
      ema200,
      support,
      resistance
    };
  };

  // -------------------------------------------------------------
  // AI SIGNAL GENERATOR (Direct code.gs Groq + Gemini Engine)
  // -------------------------------------------------------------
  const generateSignal = async () => {
    if (!user) return;

    if (user.username === 'guest') {
      showToast('Google Sheet Journal mein signal save karne ke liye pehle Login karein!', 'info');
      setLoginModalOpen(true);
      return;
    }

    const freshQuota = await verifyAndSyncWithGoogleSheet(user.username);
    const quotaLeft = freshQuota !== null ? freshQuota : user.dailyQuotaLeft;

    if (quotaLeft <= 0) {
      showToast('Aapka quota khatam ho chuka hai! Reward ad dekh kar +1 free signal hasil karein.', 'info');
      openRewardAdModal();
      return;
    }

    setIsScanning(true);
    setScanStep('Binance Live Candlesticks & Volume Stream Fetch...');

    try {
      // 2. Fetch live Binance multi-timeframe candles directly (250 candles for accurate EMA200 & RSI14)
      const fetchDirectKlines = async (symbol: string, interval: string, limit = 250): Promise<number[][]> => {
        const urls = [
          `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
          `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
          `/api/binance-klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
        ];
        for (const url of urls) {
          try {
            const r = await fetch(url);
            if (r.ok) {
              const d = await r.json();
              if (Array.isArray(d) && d.length >= 30) {
                return d.map((k: any) => [
                  Number(k[0]), Number(k[1]), Number(k[2]), Number(k[3]), Number(k[4]), Number(k[5])
                ]);
              }
            }
          } catch {}
        }
        return [];
      };

      const [candles, candles4h, candles1d] = await Promise.all([
        fetchDirectKlines(selectedCoin, selectedTimeframe, 250),
        fetchDirectKlines(selectedCoin, '4h', 250),
        fetchDirectKlines(selectedCoin, '1d', 250)
      ]);

      // STRICT CHECK: Agar live data nahi aaya to fake signal mat banao!
      if (candles.length < 30) {
        showToast('Live Binance chart data fetch nahi ho saka. Internet check karein aur dobara try karein.', 'error');
        setIsScanning(false);
        setScanStep('');
        return;
      }

      // Exact live close price from the latest candle
      const livePrice = candles[candles.length - 1][4];
      setMarketPrices(prev => ({ ...prev, [selectedCoin]: livePrice }));

      setScanStep('Executing Groq Primary Engine (openai/gpt-oss-120b)...');
      const ind1 = computeIndicators(candles, livePrice);
      const ind4h = computeIndicators(candles4h.length >= 30 ? candles4h : candles, livePrice);
      const ind1d = computeIndicators(candles1d.length >= 30 ? candles1d : candles, livePrice);

      const payload = {
        action: 'signal',
        username: user.username,
        symbol: selectedCoin,
        timeframe: selectedTimeframe,
        currentPrice: livePrice,
        marketTimestamp: new Date().toISOString(),
        rsi: ind1.rsi,
        macd: ind1.macd.macd,
        macdSignal: ind1.macd.signal,
        macdHistogram: ind1.macd.hist,
        adx: ind1.adx,
        atr: ind1.atr,
        volumeRatio: ind1.volRatio,
        ema20: ind1.ema20,
        ema50: ind1.ema50,
        ema200: ind1.ema200,
        support: ind1.support,
        resistance: ind1.resistance,
        tf1: {
          timeframe: selectedTimeframe,
          rsi: ind1.rsi,
          ema20: ind1.ema20,
          trend: ind1.rsi > 50 ? 'BULLISH' : 'BEARISH'
        },
        tf2: {
          timeframe: '4h',
          rsi: ind4h.rsi,
          ema20: ind4h.ema20,
          trend: ind4h.rsi > 50 ? 'BULLISH' : 'BEARISH'
        },
        tf3: {
          timeframe: '1d',
          rsi: ind1d.rsi,
          ema20: ind1d.ema20,
          trend: ind1d.rsi > 50 ? 'BULLISH' : 'BEARISH'
        },
        recentCandles: candles
      };

      setScanStep('Evaluating Confluence Gates & Logging to Google Sheet Journal...');
      const res = await callBackend('signal', payload);

      if (!res || res.error) {
        showToast(res?.message || 'Apps Script AI Engine se signal generate nahi ho saka.', 'error');
        return;
      }

      // Success response from code.gs!
      const direction = res.direction || 'NO_TRADE';
      const isReady = res.entryStatus === 'READY';
      const livePriceNumber = Number(livePrice) || (selectedCoin === 'PEPEUSDT' ? 0.0000045 : 84500);
      const entryPrice = Number(res.entry) || Number(res.entryPrice) || livePriceNumber;

      const rawSl = Number(res.stopLoss) || Number(res.sl) || Number(res.slPrice);
      const rawTp = Number(res.takeProfit) || Number(res.tp2) || Number(res.tp) || Number(res.target) || Number(res.targetPrice);
      const rawTp1 = Number(res.tp1);
      const rawTp2 = Number(res.tp2) || rawTp;
      const rawTp3 = Number(res.tp3);

      const targetLevels = normalizeSignalTargets({
        symbol: selectedCoin,
        direction,
        entry: entryPrice,
        stopLoss: rawSl,
        takeProfit: rawTp,
        tp1: rawTp1,
        tp2: rawTp2,
        tp3: rawTp3,
        currentPrice: livePriceNumber
      });

      const newSignal: TradingSignal = {
        id: `SIG-${Date.now()}`,
        symbol: selectedCoin,
        timeframe: selectedTimeframe,
        direction: direction,
        signalDirection: res.signalDirection || (direction.includes('LONG') ? 'LONG' : (direction.includes('SHORT') ? 'SHORT' : 'NEUTRAL')),
        entryStatus: res.entryStatus || (direction === 'NO_TRADE' ? 'WAIT' : 'READY'),
        currentPrice: livePriceNumber,
        entry: targetLevels.entry,
        suggestedEntry: res.suggestedEntry,
        triggerPrice: res.triggerPrice,
        invalidationPrice: res.invalidationPrice,
        entryImproved: res.entryImproved,
        stopLoss: targetLevels.stopLoss,
        takeProfit: targetLevels.takeProfit,
        tp1: targetLevels.tp1,
        tp2: targetLevels.tp2,
        tp3: targetLevels.tp3,
        tp1Hit: false,
        tp2Hit: false,
        tp3Hit: false,
        targetHit: 'OPEN',
        rr: res.rr || 'N/A',
        suggestedRR: res.suggestedRR,
        confidence: res.confidence || 75,
        directionConfidence: res.directionConfidence,
        entryConfidence: res.entryConfidence,
        signalQuality: res.signalQuality || (isReady ? 'STRONG' : 'WAIT'),
        signalQualityDetails: res.signalQualityDetails,
        signalQualityScore: res.signalQualityScore,
        model: res.model || 'openai/gpt-oss-120b',
        timestamp: Date.now(),
        resolved: false,
        outcome: isReady ? 'OPEN' : null,
        userId: user.username,
        userDisplayName: user.username.toUpperCase(),
        reasoning: res.reasoning || '',
        warnings: res.warnings || [],
        waitFor: res.waitFor || null,
        sheetRow: Number(res.row || res.journalRow || 0)
      };

      setCurrentSignal(newSignal);

      // Save to Local Journals
      setUserJournal(prev => {
        const updated = [newSignal, ...prev.filter(s => s.id !== newSignal.id)];
        localStorage.setItem(`${KEYS.JOURNAL_USER_PREFIX}${user.username}`, JSON.stringify(updated));
        return updated;
      });

      setGlobalJournal(prev => {
        const updated = [newSignal, ...prev.filter(s => s.id !== newSignal.id)];
        localStorage.setItem(KEYS.JOURNAL_GLOBAL, JSON.stringify(updated));
        return updated;
      });

      // Update Quota Left from code.gs response
      if (res.signalsLeft !== undefined) {
        const updatedUser: UserProfile = { ...user, dailyQuotaLeft: Number(res.signalsLeft) };
        setUser(updatedUser);
        const rawDb = localStorage.getItem(KEYS.USERS_DB);
        const db = rawDb ? JSON.parse(rawDb) : {};
        db[user.username] = updatedUser;
        localStorage.setItem(KEYS.USERS_DB, JSON.stringify(db));
      }

      // Refresh Google Sheet Journal Accuracy stats
      fetchSheetAccuracy();

      if (direction === 'NO_TRADE') {
        showToast('Market condition risky hai. NO_TRADE shield trigger hui (Quota cost 0.25).', 'info');
      } else if (direction.startsWith('WAIT')) {
        showToast(`${direction.replace('_', ' ')} setup identify hua. Retest / pullback ka intezar karein!`, 'info');
      } else {
        showToast(`Shandar! ${selectedCoin} ${direction} signal Google Sheet Journal mein save ho gaya! (Model: ${res.model})`, 'success');
      }
    } catch (err: any) {
      showToast('Signal generate karne mein kharabi: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  // Accuracy Calculation directly from Google Sheet + local
  const activeJournal = statsScope === 'GLOBAL' ? globalJournal : userJournal;

  const stats = useMemo(() => {
    const isGlobal = statsScope === 'GLOBAL';
    const targetList = isGlobal ? globalJournal : userJournal;

    const resolved = targetList.filter(s => s.resolved);
    const active = targetList.filter(s => !s.resolved && (s.outcome === 'OPEN' || !s.outcome));

    // Live active TP hits occurring in running signals
    const liveActiveT1 = active.filter(s => Boolean(s.tp1Hit)).length;
    const liveActiveT2 = active.filter(s => Boolean(s.tp2Hit)).length;
    const liveActiveT3 = active.filter(s => Boolean(s.tp3Hit)).length;

    if (isGlobal) {
      // Base numbers from Google Sheet Journal tab
      const baseSheetWins = sheetAccuracy.wins;
      const baseSheetLosses = sheetAccuracy.losses;
      const baseTotalClosed = sheetAccuracy.totalClosed;

      // Each TP hit (TP1, TP2, TP3) dynamically increments the TP1+ Wins tally:
      // TP1 hit -> 49 + 1 = 50, TP2 hit -> 50 + 1 = 51, TP3 hit -> 51 + 1 = 52
      const t1Count = sheetAccuracy.tp1Wins + liveActiveT1;
      const t2Count = sheetAccuracy.tp2Wins + liveActiveT2;
      const t3Count = sheetAccuracy.tp3Wins + liveActiveT3;

      const totalWins = baseSheetWins + liveActiveT1 + liveActiveT2 + liveActiveT3;
      const totalLosses = baseSheetLosses;
      const totalClosed = baseTotalClosed;

      const decisive = totalWins + totalLosses;
      const winRate = decisive > 0 ? ((totalWins / decisive) * 100).toFixed(1) + '%' : '0.0%';

      return {
        activeCount: active.length,
        totalClosed,
        wins: totalWins,
        losses: totalLosses,
        winRate,
        t1Count,
        t2Count,
        t3Count
      };
    } else {
      // Personal user stats
      const localLosses = resolved.filter(s => s.outcome === 'LOSS').length;

      const pT1 = targetList.filter(s => Boolean(s.tp1Hit)).length;
      const pT2 = targetList.filter(s => Boolean(s.tp2Hit)).length;
      const pT3 = targetList.filter(s => Boolean(s.tp3Hit)).length;
      const pWins = pT1 + pT2 + pT3;

      const decisive = pWins + localLosses;
      const winRate = decisive > 0 ? ((pWins / decisive) * 100).toFixed(1) + '%' : '0.0%';

      return {
        activeCount: active.length,
        totalClosed: decisive,
        wins: pWins,
        losses: localLosses,
        winRate,
        t1Count: pT1,
        t2Count: pT2,
        t3Count: pT3
      };
    }
  }, [statsScope, globalJournal, userJournal, sheetAccuracy]);

  const displayedSignals = useMemo(() => {
    let list = activeJournal.map(s => normalizeSignalTargets(s));
    if (filterScope === 'ACTIVE') list = list.filter(s => !s.resolved && (s.outcome === 'OPEN' || !s.outcome));
    if (filterScope === 'WINS') list = list.filter(s => s.outcome === 'WIN');
    if (filterScope === 'LOSSES') list = list.filter(s => s.outcome === 'LOSS');
    return list;
  }, [activeJournal, filterScope]);

  // Dynamic AI Quantitative Radar Hot Pairs computed from live market changes
  const recommendedHotPairs = useMemo(() => {
    const list = SUPPORTED_COINS.map(c => {
      const price = marketPrices[c.symbol] || c.basePrice;
      const change = marketChanges[c.symbol] || 0;
      const isPositive = change >= 0;
      return {
        symbol: c.symbol,
        name: c.name,
        price,
        change,
        direction: (isPositive ? 'LONG' : 'SHORT') as 'LONG' | 'SHORT',
        confidence: Math.min(94, Math.max(78, Math.round(80 + Math.abs(change) * 2.5)))
      };
    });

    // 1. Top Bullish Momentum Breakout
    const sortedGainers = [...list].sort((a, b) => b.change - a.change);
    const topMomentum = sortedGainers[0] || list[0];

    // 2. High Liquidity Benchmark Anchor (BTC or ETH, distinct from topMomentum)
    const institutionalCandidate = list.find(c => c.symbol === 'BTCUSDT');
    const institutional = (institutionalCandidate && institutionalCandidate.symbol !== topMomentum.symbol)
      ? institutionalCandidate
      : (list.find(c => c.symbol === 'ETHUSDT' && c.symbol !== topMomentum.symbol) || list[1]);

    // 3. Oversold Demand Rebound Candidate (distinct from topMomentum & institutional)
    const sortedDippers = [...list].sort((a, b) => a.change - b.change);
    const dipRebound = sortedDippers.find(c => c.symbol !== topMomentum.symbol && c.symbol !== institutional.symbol) || list[2];

    return [
      {
        ...topMomentum,
        tagClass: 'hot',
        category: 'TOP GAINER (24H)',
        tf: '24h',
        reason: `${topMomentum.change >= 0 ? '+' : ''}${topMomentum.change.toFixed(2)}% in last 24 hours`
      },
      {
        ...institutional,
        tagClass: 'breakout',
        category: 'MARKET BENCHMARK',
        tf: '24h',
        reason: `${institutional.change >= 0 ? '+' : ''}${institutional.change.toFixed(2)}% in last 24 hours`
      },
      {
        ...dipRebound,
        tagClass: 'momentum',
        category: 'TOP LOSER (24H)',
        tf: '24h',
        reason: `${dipRebound.change >= 0 ? '+' : ''}${dipRebound.change.toFixed(2)}% in last 24 hours`
      }
    ];
  }, [marketPrices, marketChanges]);

  // Auth Submit (Login / Register to Google Sheet)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const u = authUsername.trim().toLowerCase();
    const p = authPassword.trim();

    if (!u || u.length < 3) {
      setAuthError('Username kam az kam 3 characters ka hona chahiye.');
      return;
    }
    if (!p || p.length < 6) {
      setAuthError('Password kam az kam 6 characters ka hona chahiye.');
      return;
    }

    try {
      if (authMode === 'register') {
        const res = await callBackend('register', { username: u, password: p, referralCode: authRefCode.trim() });
        if (res && res.error) {
          if (res.code === 'DEVICE_LOCKED' || (res.message && res.message.toLowerCase().includes('device'))) {
            setDeviceLockAlert({
              open: true,
              message: res.message || 'Is device se pehle hi account registered hai. Aik device par aik account ki ijazat hai.',
              existingUser: res.existingUser
            });
            setLoginModalOpen(false);
            return;
          }
          setAuthError(res.message || 'Registration nakam hui.');
          return;
        }
        localStorage.setItem(KEYS.USER, u);
        loadUserProfile(u);
        verifyAndSyncWithGoogleSheet(u);
        setLoginModalOpen(false);
        showToast(`Mubarak! Account ${u} Google Sheet mein kamyabi se register ho gaya!`, 'success');
      } else {
        const res = await callBackend('login', { username: u, password: p });
        if (res && res.error) {
          setAuthError(res.message || 'Ghalat username ya password.');
          return;
        }
        localStorage.setItem(KEYS.USER, u);
        loadUserProfile(u);
        verifyAndSyncWithGoogleSheet(u);
        setLoginModalOpen(false);
        showToast(`Khushamdeed ${u.toUpperCase()}! Google Sheet se login tasdeeq ho gayi.`, 'success');
      }
    } catch {
      setAuthError('Google Sheet server se rabta nahi ho saka.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(KEYS.USER);
    setUser(null); // Strictly set to null to force login screen
    showToast('Aap kamyabi se logout ho gaye hain.', 'info');
  };

  // Redeem Premium Code (Direct to Google Sheet)
  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      showToast('Baraye meharbani VIP Code enter karein.', 'error');
      return;
    }
    if (!user) {
      showToast('Code redeem karne ke liye pehle Login karein!', 'info');
      setLoginModalOpen(true);
      return;
    }

    try {
      const codeClean = redeemCode.trim().toUpperCase();
      const res = await callBackend('redeem_premium_code', { username: user.username, code: codeClean });
      if (res && res.success) {
        const plan = (res.planType || 'BASIC').toUpperCase() as any;
        const newQuota = PLAN_LIMITS[plan] || Number(res.signalsPerDay) || 5;
        const updatedUser: UserProfile = { ...user, plan, planBaseQuota: newQuota, dailyQuotaLeft: newQuota, isSheetVerified: true };
        setUser(updatedUser);
        const rawDb = localStorage.getItem(KEYS.USERS_DB);
        const db = rawDb ? JSON.parse(rawDb) : {};
        db[user.username] = updatedUser;
        localStorage.setItem(KEYS.USERS_DB, JSON.stringify(db));
        setRedeemCode('');
        setPremiumModalOpen(false);
        showToast(`Mubarak! ${plan} Plan Google Sheet mein active ho gaya (${newQuota} signals/day)!`, 'success');
      } else {
        showToast(res.message || 'Ghalat ya Naqabil-e-amal VIP Code!', 'error');
      }
    } catch {
      showToast('Code verify karne mein kharabi hui.', 'error');
    }
  };

  const handleShareBonus = async (platform: string) => {
    if (!user) {
      showToast('Share bonus claim karne ke liye pehle Login karein.', 'info');
      setLoginModalOpen(true);
      return;
    }
    const shareUrl = window.location.origin;
    const shareText = `CryptoWorld - Pakistan ka pehla AI-powered crypto signals app! Real-time Binance data aur daily free quota. Mera referral code use karein: ${user.referralCode} 👉 ${shareUrl}`;

    try {
      const res = await callBackend('share_claim', { username: user.username, platform });
      if (res && res.error) {
        showToast(res.message || 'Share bonus claim nahi ho saka.', 'error');
        return;
      }
      await verifyAndSyncWithGoogleSheet(user.username);
      showToast('Shukriya! +0.5 Bonus Signal aapke quota mein shamil ho gaya!', 'success');
    } catch {
      showToast('Share bonus verify nahi ho saka. Dobara koshish karein.', 'error');
      return;
    }

    let link = '';
    if (platform === 'whatsapp') link = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    if (platform === 'twitter') link = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    if (platform === 'telegram') link = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    if (platform === 'facebook') link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    if (link) window.open(link, '_blank');
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = feedbackText.trim();
    if (!cleanText) {
      showToast('Baraye meharbani apni raye ya tajweez darj karein.', 'error');
      return;
    }
    if (cleanText.length < 5) {
      showToast('Tajweez kam az kam 5 characters ki honi chahiye.', 'error');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const res = await callBackend('submit_suggestion', {
        username: user?.username || 'Guest',
        category: feedbackCategory,
        suggestion: cleanText
      });

      if (res && (res.success || !res.error)) {
        setFeedbackText('');
        showToast(res.message || 'Shukriya! Aapki suggestion Google Sheet mein mehfooz ho gayi.', 'success');

        // Refresh suggestions list from Google Sheet
        if (user && user.username !== 'guest') {
          const mySugg = await callBackend('get_my_suggestions', { username: user.username });
          if (mySugg && Array.isArray(mySugg.suggestions)) {
            setUserSuggestions(mySugg.suggestions);
          }
        }
      } else {
        showToast(res?.message || 'Suggestion save karne mein masla pesh aya.', 'error');
      }
    } catch {
      showToast('Google Sheet server se rabta nahi ho saka.', 'error');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // -------------------------------------------------------------
  // MAIN COMPONENT RETURN & GUARDS
  // -------------------------------------------------------------

  // 1. FAST LOADING ANIMATION (Only for a brief moment)
  if (isAppLoading) {
    return (
      <div className="app-launch-screen">
        <div className="launch-core">
          <div className="launch-radar-ring">
            <div className="radar-sweep-beam" />
            <div className="radar-ping-ring" />
            <div className="launch-logo-inner">
              <Zap size={38} color="#00e5ff" />
            </div>
          </div>
          <div className="launch-brand-title">CryptoWorld <span>AI</span></div>
          <div className="launch-brand-subtitle">QUANTUM CRYPTO INTELLIGENCE SYSTEM</div>
          <div className="launch-progress-wrap">
            <div className="launch-progress-bar" style={{ width: `${loadingProgress}%` }} />
          </div>
          <div className="launch-status-text">{loadingStatus}</div>
        </div>
      </div>
    );
  }

  // 2. STRICT LOGIN GUARD: If no user is logged in, show Login/Register Screen
  if (!user) {
    return (
      <div style={{ background: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 99999 }}>
        <div className="material-card" style={{ maxWidth: '440px', width: '100%', border: '1px solid var(--accent-cyan)', boxShadow: '0 8px 32px rgba(0,210,255,0.18)', background: '#121824', padding: '26px', borderRadius: '14px' }}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(0,210,255,0.1)', marginBottom: '8px' }}>
              <Zap size={32} color="#00e5ff" />
            </div>
            <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px' }}>CryptoWorld AI Login</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: 0 }}>
              {authMode === 'login'
                ? 'Apne Google Sheet account credentials se login karein. Har new device par login zaroori hai.'
                : 'Naya account banayein (aik device par sirf 1 account allow hai).'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#090d16', padding: '4px', borderRadius: '8px', marginBottom: '18px', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className={authMode === 'login' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '6px', border: authMode === 'login' ? 'none' : 'transparent' }}
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
            >
              🔑 Login
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '6px', border: authMode === 'register' ? 'none' : 'transparent' }}
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
            >
              📝 Register
            </button>
          </div>

          <form onSubmit={handleAuth}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', color: '#fff', fontSize: '0.85rem' }}>Username</label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', padding: '10px 12px', background: '#0b0f19', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }}
                placeholder="Apna username darj karein"
                value={authUsername}
                onChange={e => setAuthUsername(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', color: '#fff', fontSize: '0.85rem' }}>Password</label>
              <input
                type="password"
                className="form-input"
                style={{ width: '100%', padding: '10px 12px', background: '#0b0f19', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }}
                placeholder="••••••••"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
              />
            </div>

            {authMode === 'register' && (
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', color: '#fff', fontSize: '0.85rem' }}>Referral Code (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', padding: '10px 12px', background: '#0b0f19', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }}
                  placeholder="e.g. ZULQ2026"
                  value={authRefCode}
                  onChange={e => setAuthRefCode(e.target.value)}
                />
              </div>
            )}

            {authError && (
              <div style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '14px', textAlign: 'center', background: 'rgba(255, 77, 77, 0.1)', padding: '8px', borderRadius: '6px' }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontWeight: 800, borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              {authMode === 'login' ? '🚀 Login to Account' : '✨ Register New Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. MAIN APP UI
  return (
    <>
      {/* Toast Overlay */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button className="btn-icon" onClick={() => setSidebarOpen(true)} title="Menu">
            <Menu size={20} />
          </button>
          <div className="logo-badge" onClick={() => setActiveTab('signals')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">
              <Zap size={22} color="#00e5ff" />
            </span>
            <span className="logo-title">CryptoWorld</span>
            <span className="logo-tag">AI PRO</span>
          </div>
        </div>

        <div className="header-right">
          {isAdmin ? (
            <button
              className="btn-icon"
              title="Admin Control Center"
              onClick={() => setActiveTab('admin')}
              style={{ color: '#ff6b8b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ShieldCheck size={18} />
            </button>
          ) : (
            <button
              className="btn-icon"
              title="Admin Login"
              onClick={() => setAdminLoginModalOpen(true)}
              style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ShieldCheck size={18} />
            </button>
          )}

          <button className="btn-icon" onClick={() => setPremiumModalOpen(true)} title="VIP Upgrade" style={{ color: 'var(--accent-yellow)' }}>
            <Star size={18} fill="#ffb300" />
          </button>

          <button
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => {
              if (user && user.username !== 'guest') {
                setActiveTab('account');
              } else {
                setLoginModalOpen(true);
              }
            }}
          >
            <User size={14} style={{ marginRight: '4px' }} />
            <span>{user && user.username !== 'guest' ? user.username.toUpperCase() : 'Login'}</span>
          </button>
        </div>
      </header>

      {/* Slide-in Sidebar */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-badge">
            <span className="logo-icon">
              <Zap size={22} color="#00e5ff" />
            </span>
            <span className="logo-title">CryptoWorld</span>
          </div>
          <button className="btn-icon" onClick={() => setSidebarOpen(false)} style={{ border: 'none', fontSize: '1.4rem' }}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          <button
            className={`nav-link ${activeTab === 'signals' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signals'); setSidebarOpen(false); }}
          >
            <span className="nav-icon"><Zap size={16} /></span>
            <span>Signal Generator & Hours</span>
          </button>
          <button
            className={`nav-link ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => { setActiveTab('progress'); setSidebarOpen(false); }}
          >
            <span className="nav-icon"><TrendingUp size={16} /></span>
            <span>Live Signal Progress</span>
          </button>
          <button
            className={`nav-link ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => { setActiveTab('chart'); setSidebarOpen(false); }}
          >
            <span className="nav-icon"><BarChart2 size={16} /></span>
            <span>TradingView Chart & Market</span>
          </button>
          <button
            className={`nav-link ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => { setActiveTab('account'); setSidebarOpen(false); }}
          >
            <span className="nav-icon"><User size={16} /></span>
            <span>Account & VIP Quota</span>
          </button>

          <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }} />

          <a href="/src/pages/about.html" className="nav-link">
            <span className="nav-icon"><Info size={16} /></span>
            <span>About Us</span>
          </a>
          <a href="/src/pages/terms.html" className="nav-link">
            <span className="nav-icon"><CheckCircle2 size={16} /></span>
            <span>Terms & Conditions</span>
          </a>
          <a href="/src/pages/disclaimer.html" className="nav-link">
            <span className="nav-icon"><AlertTriangle size={16} /></span>
            <span>Risk Disclaimer</span>
          </a>
          <a href="/src/pages/contact.html" className="nav-link">
            <span className="nav-icon"><MessageCircle size={16} /></span>
            <span>Contact Support</span>
          </a>

          {isAdmin ? (
            <button
              className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => { setActiveTab('admin'); setSidebarOpen(false); }}
              style={{ color: '#ff6b8b' }}
            >
              <span className="nav-icon"><ShieldCheck size={16} /></span>
              <span>Admin Panel</span>
            </button>
          ) : (
            <button
              className="nav-link"
              onClick={() => { setAdminLoginModalOpen(true); setSidebarOpen(false); }}
              style={{ color: 'var(--text-secondary)' }}
            >
              <span className="nav-icon"><ShieldCheck size={16} /></span>
              <span>Admin Login</span>
            </button>
          )}
        </div>

        <div className="sidebar-footer">
          <div>CryptoWorld v2.5 (Material React)</div>
          <div style={{ marginTop: '4px' }}>Google Sheets Cloud DB & Binance Live</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="app-main">
        {/* User Status Bar with Google Sheet Verification Badge */}
        <div className="user-panel-bar material-card">
          <div className="stat-item">
            <span className="stat-label">Daily Quota Left</span>
            <div className="stat-value">
              <span className="badge-quota">{user ? user.dailyQuotaLeft.toFixed(2) : '1.00'} signals</span>
              {user && user.isSheetVerified && (
                <span className="sheet-verified-badge" title="Verified with Google Sheet Quota Tab">
                  <Database size={10} /> Verified
                </span>
              )}
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-label">Membership Tier</span>
            <div className="stat-value">
              <span className={`badge-plan ${(user?.plan || 'FREE').toLowerCase()}`}>{user?.plan || 'FREE'}</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-label">Google Sheet DB</span>
            <div className="stat-value" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
              <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#00e5ff', boxShadow: '0 0 6px #00e5ff' }} />
              <span>{isSheetSyncing ? 'Syncing...' : (user?.isSheetVerified ? 'Connected' : 'Offline')}</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-label">Market Engine</span>
            <div className="stat-value" style={{ color: 'var(--accent-green)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#00e676', boxShadow: '0 0 6px #00e676' }} />
              <span>Binance Futures Live</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SIGNALS & BEST TRADING HOURS                       */}
        {/* ========================================================= */}
        {activeTab === 'signals' && (
          <div className="tab-pane active">
            {/* Quick Coins Chips Strip */}
            <div className="coins-quick-strip">
              {SUPPORTED_COINS.slice(0, 8).map(c => {
                const price = marketPrices[c.symbol] || c.basePrice;
                const change = marketChanges[c.symbol] || 0;
                const isSelected = selectedCoin === c.symbol;
                return (
                  <button
                    key={c.symbol}
                    className={`material-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedCoin(c.symbol)}
                  >
                    <span>{c.symbol.replace('USDT', '')}</span>
                    <span style={{ color: '#fff', marginLeft: '2px' }}>
                      ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span style={{ color: change >= 0 ? '#00e676' : '#ff4d4d', marginLeft: '4px' }}>
                      {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* AI Quantitative Radar Suggestions Panel */}
            <div className="ai-suggestions-panel material-card">
              <div className="ai-panel-header">
                <div className="ai-panel-title">
                  <span className="ai-pulse-dot" />
                  <Radio size={18} color="#00e5ff" />
                  <span>📊 Market Movers (24h) — Top Gainer, Benchmark, Top Loser</span>
                </div>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '4px 8px', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                  onClick={fetchMarketTickers}
                >
                  <RefreshCw size={12} style={{ marginRight: '4px' }} />
                  Re-Scan
                </button>
              </div>

              <div className="ai-suggestions-grid">
                {recommendedHotPairs.map((item, idx) => (
                  <div
                    key={`${item.category}-${item.symbol}-${idx}`}
                    className={`ai-suggestion-card ${item.tagClass}`}
                    onClick={() => {
                      setSelectedCoin(item.symbol);
                      setSelectedTimeframe(item.tf.split(' / ')[0]);
                      showToast(`${item.symbol} selected for AI analysis!`, 'info');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="ai-card-top">
                      <div className="ai-pair-badge">
                        <span className={`token-icon ${item.symbol.substring(0, 3).toLowerCase()}`}>
                          {item.symbol.substring(0, 1)}
                        </span>
                        <strong style={{ color: '#fff' }}>{item.symbol}</strong>
                      </div>
                      <span className={`ai-signal-type-tag ${item.direction.toLowerCase()}`}>
                        {item.direction}
                      </span>
                    </div>
                    <div className="ai-card-mid">
                      <span className="ai-card-price">
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: item.price < 1 ? 4 : 2 })}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: item.change >= 0 ? '#00e676' : '#ff4d4d', fontWeight: 700 }}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}% (24h)
                      </span>
                    </div>
                    <div className="ai-card-reason">{item.reason}</div>
                    <button className="ai-trade-btn">⚡ Analyze {item.symbol.replace('USDT', '')} Setup</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Generator Controls with Model Selection */}
            <div className="material-card">
              <div className="controls-bar">
                <div className="selector-group">
                  <div>
                    <label className="form-label">Select Crypto Pair</label>
                    <select
                      className="app-select"
                      value={selectedCoin}
                      onChange={e => setSelectedCoin(e.target.value)}
                    >
                      <optgroup label="Benchmark Pairs">
                        {SUPPORTED_COINS.filter(c => c.isMain8).map(c => (
                          <option key={c.symbol} value={c.symbol}>{c.symbol} ({c.name})</option>
                        ))}
                      </optgroup>
                      <optgroup label="Trending Altcoins">
                        {SUPPORTED_COINS.filter(c => !c.isMain8).map(c => (
                          <option key={c.symbol} value={c.symbol}>{c.symbol} ({c.name})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Timeframe</label>
                    <div className="timeframe-pill-group">
                      {['15m', '1h', '4h', '1d'].map(tf => (
                        <button
                          key={tf}
                          className={`tf-btn ${selectedTimeframe === tf ? 'active' : ''}`}
                          onClick={() => setSelectedTimeframe(tf)}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">
                      <Cpu size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--accent-cyan)' }} />
                      AI Engine Routing (code.gs Pipeline)
                    </label>
                    <div style={{ background: '#0b0f19', border: '1px solid rgba(0,210,255,0.2)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(0,210,255,0.15)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          1️⃣ Groq Primary (openai/gpt-oss-120b)
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>➔</span>
                        <span style={{ background: 'rgba(255,204,0,0.12)', color: '#ffcc00', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          2️⃣ Gemini Fallback
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>➔</span>
                        <span style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                          3️⃣ Technical Fallback
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {user && user.dailyQuotaLeft <= 0 ? (
                  <button
                    type="button"
                    className="btn-reward-ad"
                    onClick={openRewardAdModal}
                  >
                    <div className="reward-ad-btn-content">
                      <div className="reward-ad-icon-pulse">
                        <Film size={22} color="#fbbf24" />
                      </div>
                      <div className="reward-ad-btn-texts">
                        <span className="reward-ad-title">
                          <Film size={18} /> WATCH AD TO EARN +1 SIGNAL QUOTA
                        </span>
                        <span className="reward-ad-subtitle">
                          Daily quota khatam ho gaya! 15s real video ad dekh kar foran free signal unlock karein
                        </span>
                      </div>
                      <div className="reward-ad-badge">+1 SIGNAL</div>
                    </div>
                  </button>
                ) : (
                  <button
                    className={`btn-primary btn-generate-signal ${isScanning ? 'scanning' : ''}`}
                    onClick={generateSignal}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <div className="btn-scanning-content">
                        <div className="quantum-orb-spinner">
                          <div className="orb-ring ring-1" />
                          <div className="orb-ring ring-2" />
                          <Zap size={16} className="orb-core" />
                        </div>
                        <div className="btn-scanning-text-wrap">
                          <span className="btn-scanning-title">AI QUANTUM RADAR SCANNING...</span>
                          <span className="btn-scanning-subtitle">{scanStep || 'Executing Groq / Gemini Confluence...'}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Zap size={20} />
                        <span>GENERATE AI TRADING SIGNAL</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Scanning State */}
              {isScanning && (
                <div className="radar-screen" style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
                  <div className="radar-circle" />
                  <div className="radar-scanner" />
                  <div style={{ marginTop: '14px', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.9rem' }}>
                    {scanStep}
                  </div>
                </div>
              )}
            </div>

            {/* Generated Signal Output with Live Market PnL Progress Bar & WAIT / NO_TRADE Handling */}
            {currentSignal && !isScanning && (() => {
              const livePrice = marketPrices[currentSignal.symbol] || currentSignal.currentPrice || currentSignal.entry;
              const isNoTrade = currentSignal.direction === 'NO_TRADE';
              const isWaitState = currentSignal.direction.startsWith('WAIT');

              // 1. NO_TRADE RENDERING
              if (isNoTrade) {
                return (
                  <div className="material-card signal-box" style={{ border: '1px solid #ffcc00' }}>
                    <div className="signal-header-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: '#ffcc00', color: '#000', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          🛡️ NO TRADE (MARKET SHIELD)
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{currentSignal.symbol}</span>
                        <span style={{ fontSize: '0.78rem', background: '#1c2336', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                          {currentSignal.timeframe}
                        </span>
                      </div>
                      <span className="badge-quality moderate">CONFIDENCE: {currentSignal.confidence}%</span>
                    </div>

                    <div style={{ background: 'rgba(255,204,0,0.08)', border: '1px solid rgba(255,204,0,0.25)', padding: '14px', borderRadius: '8px', marginTop: '12px' }}>
                      <div style={{ color: '#ffcc00', fontWeight: 700, marginBottom: '6px' }}>⚠️ AI Strategic Reasoning:</div>
                      <p style={{ color: '#fff', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>{currentSignal.reasoning}</p>
                    </div>

                    {currentSignal.waitFor && currentSignal.waitFor.lines && currentSignal.waitFor.lines.length > 0 && (
                      <div style={{ marginTop: '12px', background: '#0e1320', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '8px' }}>
                          📋 Next Valid Setup Conditions (Wait For):
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.7 }}>
                          {currentSignal.waitFor.lines.map((line, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>AI Engine: <strong style={{ color: 'var(--accent-cyan)' }}>{currentSignal.model}</strong></span>
                      <span>Quota Deducted: <strong style={{ color: '#ffcc00' }}>0.25 (Shield Cost)</strong></span>
                    </div>
                  </div>
                );
              }

              // 2. WAIT FOR PULLBACK / RETEST RENDERING
              if (isWaitState) {
                const waitLabel = currentSignal.direction === 'WAIT_LONG' ? 'WAIT FOR PULLBACK (LONG)' : 'WAIT FOR RETEST (SHORT)';
                return (
                  <div className="material-card signal-box" style={{ border: '1px solid var(--accent-cyan)' }}>
                    <div className="signal-header-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: '#00d2ff', color: '#000', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          ⏳ {waitLabel}
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{currentSignal.symbol}</span>
                        <span style={{ fontSize: '0.78rem', background: '#1c2336', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                          {currentSignal.timeframe}
                        </span>
                      </div>
                      <span className="badge-quality moderate">{currentSignal.entryStatus.replace('_', ' ')}</span>
                    </div>

                    <div className="tracker-levels-row" style={{ marginTop: '12px' }}>
                      <div className="tracker-lvl-item">
                        <div className="t-lbl">SUGGESTED ENTRY</div>
                        <div className="t-val cyan">${(currentSignal.suggestedEntry || currentSignal.currentPrice).toLocaleString()}</div>
                      </div>
                      <div className="tracker-lvl-item">
                        <div className="t-lbl">TRIGGER PRICE</div>
                        <div className="t-val green">${(currentSignal.triggerPrice || currentSignal.currentPrice).toLocaleString()}</div>
                      </div>
                      <div className="tracker-lvl-item">
                        <div className="t-lbl">INVALIDATION SL</div>
                        <div className="t-val red">${(currentSignal.invalidationPrice || 0).toLocaleString()}</div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.2)', padding: '14px', borderRadius: '8px', marginTop: '12px' }}>
                      <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '6px' }}>💡 Pullback Strategy Analysis:</div>
                      <p style={{ color: '#fff', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>{currentSignal.reasoning}</p>
                    </div>

                    {currentSignal.waitFor && currentSignal.waitFor.lines && currentSignal.waitFor.lines.length > 0 && (
                      <div style={{ marginTop: '12px', background: '#0e1320', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--accent-green)', fontWeight: 700, marginBottom: '8px' }}>
                          🎯 Execution Trigger Checklist:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.7 }}>
                          {currentSignal.waitFor.lines.map((line, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>AI Engine: <strong style={{ color: 'var(--accent-cyan)' }}>{currentSignal.model}</strong></span>
                      <span>Quota Deducted: <strong style={{ color: '#00d2ff' }}>0.25 (Wait Cost)</strong></span>
                    </div>
                  </div>
                );
              }

              // 3. READY TO TRADE RENDERING
              const pnl = calculateSignalPnLProgress(currentSignal, livePrice);

              return (
                <div className="material-card signal-box" style={{ border: '1px solid var(--accent-cyan)' }}>
                  <div className="signal-header-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`signal-badge-direction ${currentSignal.direction.toLowerCase()}`}>
                        {currentSignal.direction === 'LONG' ? 'BUY / LONG' : 'SELL / SHORT'}
                      </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{currentSignal.symbol}</span>
                      <span style={{ fontSize: '0.78rem', background: '#1c2336', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                        {currentSignal.timeframe}
                      </span>
                    </div>
                    <span className="badge-quality strong">{currentSignal.signalQuality}</span>
                  </div>

                  {/* Real-time Market PnL Progress Bar */}
                  <div className="pnl-progress-container">
                    <div className="pnl-progress-header">
                      <span style={{ color: 'var(--accent-red)' }}>SL: ${formatCryptoPrice(currentSignal.stopLoss)}</span>
                      <span style={{ color: pnl.isProfit ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {pnl.statusText}
                      </span>
                      <span style={{ color: 'var(--accent-cyan)' }}>TP: ${formatCryptoPrice(currentSignal.takeProfit)}</span>
                    </div>

                    <div className="pnl-progress-track">
                      <div className="pnl-progress-center-line" />
                      {pnl.isProfit ? (
                        <div
                          className="pnl-progress-fill profit"
                          style={{ width: `${pnl.fillWidth}%` }}
                        />
                      ) : (
                        <div
                          className="pnl-progress-fill loss"
                          style={{ width: `${pnl.fillWidth}%` }}
                        />
                      )}
                    </div>

                    <div className="pnl-progress-labels">
                      <span>100% SL Loss</span>
                      <span>Entry: ${formatCryptoPrice(currentSignal.entry)}</span>
                      <span>100% TP Success</span>
                    </div>
                  </div>

                  <div className="tracker-levels-row">
                    <div className="tracker-lvl-item">
                      <div className="t-lbl">ENTRY</div>
                      <div className="t-val">${formatCryptoPrice(currentSignal.entry)}</div>
                    </div>
                    <div className="tracker-lvl-item">
                      <div className="t-lbl">STOP LOSS</div>
                      <div className="t-val red">${formatCryptoPrice(currentSignal.stopLoss)}</div>
                    </div>
                    <div className="tracker-lvl-item">
                      <div className="t-lbl">TAKE PROFIT (T2)</div>
                      <div className="t-val green">${formatCryptoPrice(currentSignal.takeProfit)}</div>
                    </div>
                    <div className="tracker-lvl-item">
                      <div className="t-lbl">R:R RATIO</div>
                      <div className="t-val cyan">{currentSignal.rr}</div>
                    </div>
                  </div>

                  {(() => {
                    const cEntry = Number(currentSignal.entry) || 1;
                    const cT1Gain = Math.abs(((Number(currentSignal.tp1) - cEntry) / cEntry) * 100).toFixed(2);
                    const cT2Gain = Math.abs(((Number(currentSignal.tp2) - cEntry) / cEntry) * 100).toFixed(2);
                    const cT3Gain = Math.abs(((Number(currentSignal.tp3) - cEntry) / cEntry) * 100).toFixed(2);
                    return (
                      <div className="tracker-targets-grid">
                        <div className="tracker-target-box">
                          <div className="tracker-target-title">T1 (50% TP)</div>
                          <div className="tracker-target-price green">${formatCryptoPrice(currentSignal.tp1)}</div>
                          <span className="tracker-target-tag green">+{cT1Gain}%</span>
                        </div>
                        <div className="tracker-target-box">
                          <div className="tracker-target-title">T2 (100% TP)</div>
                          <div className="tracker-target-price cyan">${formatCryptoPrice(currentSignal.tp2)}</div>
                          <span className="tracker-target-tag cyan">+{cT2Gain}%</span>
                        </div>
                        <div className="tracker-target-box">
                          <div className="tracker-target-title">T3 (RUNNER)</div>
                          <div className="tracker-target-price yellow">${formatCryptoPrice(currentSignal.tp3)}</div>
                          <span className="tracker-target-tag yellow">+{cT3Gain}%</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{ background: '#0e1320', padding: '12px', borderRadius: '8px', marginTop: '12px', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '4px' }}>💡 AI Strategic Reasoning:</div>
                    <p style={{ color: 'var(--text-secondary)' }}>{currentSignal.reasoning}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>AI Model: <strong style={{ color: 'var(--accent-green)' }}>{currentSignal.model}</strong></span>
                    <span>Saved in: <strong style={{ color: 'var(--accent-cyan)' }}>Google Sheet Journal Tab ✓</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, fontSize: '0.8rem' }}
                      onClick={() => {
                        const text = `⚡ CryptoWorld AI Signal: ${currentSignal.direction} ${currentSignal.symbol} (${currentSignal.timeframe})\nEntry: $${currentSignal.entry}\nSL: $${currentSignal.stopLoss}\nT1: $${currentSignal.tp1}\nT2: $${currentSignal.tp2}\nT3: $${currentSignal.tp3}\nModel: ${currentSignal.model}`;
                        navigator.clipboard.writeText(text);
                        showToast('Signal clipboard par copy ho gaya!', 'success');
                      }}
                    >
                      <Copy size={14} style={{ marginRight: '4px' }} />
                      Copy Trade Plan
                    </button>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, fontSize: '0.8rem' }}
                      onClick={() => {
                        setActiveTab('progress');
                        showToast('Signal journal mein track ho raha hai.', 'info');
                      }}
                    >
                      <TrendingUp size={14} style={{ marginRight: '4px' }} />
                      Track in Progress
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Best Trading Hours */}
            <div className="material-card">
              <div className="trading-hours-header">
                <h3 className="card-title" style={{ marginBottom: 0 }}>🕒 Prime Global Crypto Trading Sessions (PKT)</h3>
                <span className="prime-radar-badge">London & NY Active</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                High volume sessions offer highest win rate setups and tight spreads:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: '#111624', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>London Session (13:00 - 22:00 PKT)</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Major breakout volume & volatility expansion</div>
                  </div>
                  <span className="status-badge-prime">PRIME ACTIVE</span>
                </div>
                <div style={{ background: '#111624', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>New York Session (18:00 - 03:00 PKT)</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>US institutional flows & high liquidity moves</div>
                  </div>
                  <span className="badge-quality moderate">UPCOMING</span>
                </div>
                <div style={{ background: '#111624', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>Asian Session (05:00 - 14:00 PKT)</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Consolidation & range accumulation</div>
                  </div>
                  <span className="badge-quality moderate">CLOSED</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LIVE SIGNAL PROGRESS & ACCURACY JOURNAL           */}
        {/* ========================================================= */}
        {activeTab === 'progress' && (
          <div className="tab-pane active">
            {/* Accuracy Header & Scope Switcher */}
            <div className="material-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 className="card-title" style={{ marginBottom: 0 }}>
                    {statsScope === 'GLOBAL' ? '📱 Signals generated on this device' : '👤 My Personal Signal Performance'}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {statsScope === 'GLOBAL'
                      ? 'Win/loss rate of signals generated on this device (localStorage). Real global stats ke liye Google Sheet Journal tab check karein.'
                      : `Personal Performance: Win/loss rate of signals generated by ${user?.username.toUpperCase()}.`}
                  </p>
                </div>

                <div className="selector-group" style={{ padding: '2px', background: '#0b0f19', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <button
                    className={`tf-btn ${statsScope === 'GLOBAL' ? 'active' : ''}`}
                    onClick={() => setStatsScope('GLOBAL')}
                  >
                    📱 This Device
                  </button>
                  <button
                    className={`tf-btn ${statsScope === 'PERSONAL' ? 'active' : ''}`}
                    onClick={() => setStatsScope('PERSONAL')}
                  >
                    👤 My Trades
                  </button>
                </div>
              </div>

              {/* Accuracy Grid */}
              <div className="accuracy-grid" style={{ marginTop: '14px' }}>
                <div className="accuracy-card">
                  <div className="accuracy-title">Active Signals</div>
                  <div className="accuracy-val cyan">{stats.activeCount}</div>
                  <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>Live in Market</div>
                </div>

                <div className="accuracy-card">
                  <div className="accuracy-title">Total Closed</div>
                  <div className="accuracy-val yellow">{stats.totalClosed}</div>
                  <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>Evaluated Trades</div>
                </div>

                {/* Accuracy Wins with Multi-Target Badges */}
                <div className="accuracy-card">
                  <div className="accuracy-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span>Wins (TP Hit)</span>
                    <span style={{ fontSize: '0.62rem', background: 'rgba(0,230,118,0.2)', color: '#00e676', padding: '0 4px', borderRadius: '4px' }}>TP1+</span>
                  </div>
                  <div className="accuracy-val green">{stats.wins}</div>
                  <div className="stat-tp-breakdown" style={{ fontSize: '0.67rem', marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    <span title="Total times Take Profit 1 was hit" style={{ background: 'rgba(0,230,118,0.14)', color: '#00e676', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                      T1: {stats.t1Count}
                    </span>
                    <span title="Total times Take Profit 2 was hit" style={{ background: 'rgba(0,210,255,0.14)', color: '#00d2ff', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                      T2: {stats.t2Count}
                    </span>
                    <span title="Total times Take Profit 3 was hit" style={{ background: 'rgba(255,204,0,0.14)', color: '#ffcc00', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                      T3: {stats.t3Count}
                    </span>
                  </div>
                </div>

                <div className="accuracy-card">
                  <div className="accuracy-title">Losses (SL Hit)</div>
                  <div className="accuracy-val red">{stats.losses}</div>
                  <div style={{ fontSize: '0.67rem', marginTop: '4px' }}>
                    <span style={{ background: 'rgba(255,107,139,0.14)', color: '#ff6b8b', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      🛑 SL Hit: {stats.losses}
                    </span>
                  </div>
                </div>

                <div className="accuracy-card">
                  <div className="accuracy-title">Win Rate</div>
                  <div className="accuracy-val green">{stats.winRate}</div>
                  <div style={{ fontSize: '0.67rem', color: '#00e676', fontWeight: 600 }}>TP1/2/3 Hit Rate</div>
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                {statsScope === 'GLOBAL' ? '🌐 All Community Signals' : `👤 Signals for ${user?.username.toUpperCase()}`}:
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['ALL', 'ACTIVE', 'WINS', 'LOSSES'] as const).map(f => (
                  <button
                    key={f}
                    className={`tf-btn ${filterScope === f ? 'active' : ''}`}
                    onClick={() => setFilterScope(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Signals Feed with Live Market PnL Progress Bars */}
            <div>
              {displayedSignals.length === 0 ? (
                <div className="material-card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  Koi signal nahi mila. Naya signal generate karein!
                </div>
              ) : (
                displayedSignals.map(sig => {
                  const livePrice = marketPrices[sig.symbol] || sig.currentPrice || sig.entry;
                  const t1Hit = Boolean(sig.tp1Hit || sig.targetHit === 'TP1' || sig.targetHit === 'TP2' || sig.targetHit === 'TP3');
                  const t2Hit = Boolean(sig.tp2Hit || sig.targetHit === 'TP2' || sig.targetHit === 'TP3');
                  const t3Hit = Boolean(sig.tp3Hit || sig.targetHit === 'TP3');
                  const pnl = calculateSignalPnLProgress(sig, livePrice);

                  return (
                    <div key={sig.id} className="live-tracker-card material-card">
                      <div className="tracker-header">
                        <div className="tracker-pair-badge">
                          <span className={`signal-badge-direction ${sig.direction.toLowerCase()}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                            {sig.direction === 'LONG' ? 'BUY' : 'SELL'}
                          </span>
                          <strong style={{ fontSize: '1rem', color: '#fff' }}>{sig.symbol}</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: '#1c2336', padding: '1px 6px', borderRadius: '4px' }}>
                            {sig.timeframe}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                            👤 {sig.userDisplayName || 'TRADER'}
                          </span>
                        </div>

                        <div className="tracker-status-wrap">
                          {t3Hit && (
                            <span className="tracker-pnl-pill profit">
                              🏆 T1✓ T2✓ T3✓ HIT
                            </span>
                          )}
                          {!t3Hit && t2Hit && (
                            <span className="tracker-pnl-pill profit">
                              🚀 T1✓ T2✓ HIT
                            </span>
                          )}
                          {!t3Hit && !t2Hit && t1Hit && (
                            <span className="tracker-pnl-pill profit">
                              🎯 T1✓ HIT
                            </span>
                          )}
                          {!t1Hit && !t2Hit && !t3Hit && (
                            <span className="tracker-pnl-pill neutral">
                              ● ACTIVE IN MARKET
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Real-time Market PnL Progress Bar based on TP & SL */}
                      <div className="pnl-progress-container">
                        <div className="pnl-progress-header">
                          <span style={{ color: 'var(--accent-red)' }}>SL: ${formatCryptoPrice(sig.stopLoss)}</span>
                          <span style={{ color: pnl.isProfit ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                            {pnl.statusText}
                          </span>
                          <span style={{ color: 'var(--accent-cyan)' }}>TP: ${formatCryptoPrice(sig.takeProfit)}</span>
                        </div>

                        <div className="pnl-progress-track">
                          <div className="pnl-progress-center-line" />
                          {pnl.isProfit ? (
                            <div
                              className="pnl-progress-fill profit"
                              style={{ width: `${pnl.fillWidth}%` }}
                            />
                          ) : (
                            <div
                              className="pnl-progress-fill loss"
                              style={{ width: `${pnl.fillWidth}%` }}
                            />
                          )}
                        </div>

                        <div className="pnl-progress-labels">
                          <span>100% SL Loss</span>
                          <span>Entry: ${formatCryptoPrice(sig.entry)}</span>
                          <span>100% TP Success</span>
                        </div>
                      </div>

                      <div className="tracker-levels-row">
                        <div className="tracker-lvl-item">
                          <div className="t-lbl">ENTRY</div>
                          <div className="t-val">${formatCryptoPrice(sig.entry)}</div>
                        </div>
                        <div className="tracker-lvl-item">
                          <div className="t-lbl">{sig.resolved ? 'EXIT' : 'LIVE'}</div>
                          <div className="t-val green">${formatCryptoPrice(sig.closedPrice || livePrice)}</div>
                        </div>
                        <div className="tracker-lvl-item">
                          <div className="t-lbl">STOP LOSS</div>
                          <div className="t-val red">${formatCryptoPrice(sig.stopLoss)}</div>
                        </div>
                        <div className="tracker-lvl-item">
                          <div className="t-lbl">TAKE PROFIT</div>
                          <div className="t-val green">${formatCryptoPrice(sig.takeProfit)}</div>
                        </div>
                      </div>

                      {(() => {
                        const sEntry = Number(sig.entry) || 1;
                        const sT1Gain = Math.abs(((Number(sig.tp1) - sEntry) / sEntry) * 100).toFixed(2);
                        const sT2Gain = Math.abs(((Number(sig.tp2) - sEntry) / sEntry) * 100).toFixed(2);
                        const sT3Gain = Math.abs(((Number(sig.tp3) - sEntry) / sEntry) * 100).toFixed(2);

                        return (
                          <div className="tracker-targets-grid">
                            <div className="tracker-target-box" style={{ borderColor: t1Hit ? '#00e676' : 'rgba(255,255,255,0.08)' }}>
                              <div className="tracker-target-title">T1 (+{sT1Gain}%)</div>
                              <div className="tracker-target-price green">${formatCryptoPrice(sig.tp1)}</div>
                              <span className={`tracker-target-tag ${t1Hit ? 'green' : ''}`}>
                                {t1Hit ? '✓ HIT' : 'PENDING'}
                              </span>
                            </div>
                            <div className="tracker-target-box" style={{ borderColor: t2Hit ? '#00d2ff' : 'rgba(255,255,255,0.08)' }}>
                              <div className="tracker-target-title">T2 (+{sT2Gain}%)</div>
                              <div className="tracker-target-price cyan">${formatCryptoPrice(sig.tp2)}</div>
                              <span className={`tracker-target-tag ${t2Hit ? 'cyan' : ''}`}>
                                {t2Hit ? '✓ HIT' : 'PENDING'}
                              </span>
                            </div>
                            <div className="tracker-target-box" style={{ borderColor: t3Hit ? '#ffcc00' : 'rgba(255,255,255,0.08)' }}>
                              <div className="tracker-target-title">T3 (+{sT3Gain}%)</div>
                              <div className="tracker-target-price yellow">${formatCryptoPrice(sig.tp3)}</div>
                              <span className={`tracker-target-tag ${t3Hit ? 'yellow' : ''}`}>
                                {t3Hit ? '✓ HIT' : 'PENDING'}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TRADINGVIEW CHART & SUPPORTED MARKETS              */}
        {/* ========================================================= */}
        {activeTab === 'chart' && (
          <div className="tab-pane active">
            <div className="material-card">
              <div className="chart-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="chart-price-large">${(marketPrices[selectedCoin] || 84500).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className={`chart-change-badge ${(marketChanges[selectedCoin] || 0) >= 0 ? 'up' : 'down'}`}>
                    {(marketChanges[selectedCoin] || 0) >= 0 ? '+' : ''}{(marketChanges[selectedCoin] || 0).toFixed(2)}%
                  </span>
                </div>

                <div className="timeframe-pill-group">
                  {['15m', '1h', '4h', '1d'].map(tf => (
                    <button
                      key={tf}
                      className={`tf-btn ${selectedTimeframe === tf ? 'active' : ''}`}
                      onClick={() => setSelectedTimeframe(tf)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ width: '100%', height: '420px', borderRadius: '8px', overflow: 'hidden', background: '#0e1320' }}>
                <iframe
                  title="TradingView Chart"
                  src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=BINANCE:${selectedCoin}&interval=${selectedTimeframe === '15m' ? '15' : selectedTimeframe === '1h' ? '60' : selectedTimeframe === '4h' ? '240' : 'D'}&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Asia%2FKarachi&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </div>

            <div className="material-card">
              <h2 className="card-title">💵 Supported Binance Futures Pairs</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                Tap any coin to load its live candlestick chart and run AI multi-timeframe analysis:
              </p>

              <div className="market-list-grid">
                {SUPPORTED_COINS.map(c => {
                  const p = marketPrices[c.symbol] || c.basePrice;
                  const chg = marketChanges[c.symbol] || 0;
                  return (
                    <div
                      key={c.symbol}
                      className="market-coin-card"
                      onClick={() => {
                        setSelectedCoin(c.symbol);
                        showToast(`${c.symbol} select ho gaya.`, 'info');
                      }}
                    >
                      <div className="market-coin-info">
                        <div className="m-name">{c.symbol}</div>
                        <div className="m-pair">{c.name}</div>
                      </div>
                      <div className="market-coin-stats">
                        <div className="m-price">${p.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div style={{ fontSize: '0.75rem', color: chg >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
                          {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: USER ACCOUNT, VIP QUOTA & SETTINGS                */}
        {/* ========================================================= */}
        {activeTab === 'account' && (
          <div className="tab-pane active">
            <div className="material-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #00d2ff, #0066ff)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem', boxShadow: '0 4px 15px rgba(0, 210, 255, 0.4)' }}>
                    {(user?.username || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{user?.username.toUpperCase() || 'GUEST'}</span>
                      <span className={`badge-plan ${(user?.plan || 'FREE').toLowerCase()}`}>{user?.plan || 'FREE'}</span>
                      {user && user.isSheetVerified && (
                        <span className="sheet-verified-badge">
                          <CheckCircle2 size={11} /> Sheet Verified
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Device Lock: <strong style={{ color: 'var(--accent-cyan)' }}>{localStorage.getItem(KEYS.DEVICE_ID) || 'DEV-ACTIVE'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {user ? (
                    <>
                      <button
                        className="btn-secondary"
                        onClick={() => verifyAndSyncWithGoogleSheet(user.username)}
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        title="Sync latest quota and plan from Google Sheet"
                      >
                        <RefreshCw size={12} className={isSheetSyncing ? 'animate-spin' : ''} style={{ marginRight: '4px' }} />
                        Sync Sheet
                      </button>
                      <button className="btn-secondary" onClick={handleLogout} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                        Logout
                      </button>
                    </>
                  ) : (
                    <button className="btn-primary" onClick={() => setLoginModalOpen(true)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                      Login / Register
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Google Sheet Live Quota Box */}
            <div className="material-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <h3 className="card-title" style={{ marginBottom: '2px' }}>
                    <Database size={16} color="#00e5ff" style={{ display: 'inline', marginRight: '6px' }} />
                    Daily AI Signal Quota (Google Sheet Live)
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Quota Google Sheet ke Quota tab se directly verify hota hai.</p>
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  onClick={() => setPremiumModalOpen(true)}
                >
                  <Star size={14} style={{ marginRight: '4px' }} />
                  Upgrade Plan
                </button>
              </div>

              <div style={{ background: '#0e1320', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-around', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Today's Remaining</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                    {user?.dailyQuotaLeft.toFixed(2)}
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Daily Base Quota</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {user?.planBaseQuota || 1}
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Google Sheet Status</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: user?.isSheetVerified ? '#00e676' : '#ffb300', marginTop: '6px' }}>
                    {user?.isSheetVerified ? '✔ Connected' : 'Guest Mode'}
                  </div>
                </div>
              </div>
            </div>

            <div className="material-card">
              <h3 className="card-title">🎁 Share & Earn Bonus Signals (+0.5 Each)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                CryptoWorld ko doston ke sath share karein aur foran bonus signals hasil karein:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <button className="btn-secondary" onClick={() => handleShareBonus('whatsapp')} style={{ borderColor: '#25D366', color: '#25D366' }}>
                  WhatsApp (+0.5)
                </button>
                <button className="btn-secondary" onClick={() => handleShareBonus('telegram')} style={{ borderColor: '#0088cc', color: '#0088cc' }}>
                  Telegram (+0.5)
                </button>
                <button className="btn-secondary" onClick={() => handleShareBonus('twitter')} style={{ borderColor: '#1DA1F2', color: '#1DA1F2' }}>
                  Twitter / X (+0.5)
                </button>
                <button className="btn-secondary" onClick={() => handleShareBonus('facebook')} style={{ borderColor: '#1877F2', color: '#1877F2' }}>
                  Facebook (+0.5)
                </button>
              </div>
            </div>

            <div className="material-card">
              <h3 className="card-title">👥 Your Referral Code</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                Har dost ke signup par aapko permanent bonus signals milenge:
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={user?.referralCode || 'GUEST2026'}
                  className="form-input"
                  style={{ flex: 1, fontWeight: 700, letterSpacing: '1px', textAlign: 'center', color: 'var(--accent-cyan)' }}
                />
                <button
                  className="btn-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(user?.referralCode || '');
                    showToast('Referral code copy ho gaya!', 'success');
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="material-card">
              <h3 className="card-title">💬 Feedback & Suggestions</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                CryptoWorld ko behtar banane ke liye apni raye Google Sheet tak pohanchayein:
              </p>

              <form onSubmit={handleFeedbackSubmit}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="app-select"
                    value={feedbackCategory}
                    onChange={e => setFeedbackCategory(e.target.value)}
                  >
                    <option value="FEATURE">New Feature Request</option>
                    <option value="ACCURACY">Signal Accuracy Feedback</option>
                    <option value="BUG">Bug / Technical Issue</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Aapki Raye / Message</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Yahan apni raye likhein..."
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isSubmittingFeedback}>
                  <Send size={14} style={{ marginRight: '6px' }} />
                  {isSubmittingFeedback ? 'Submitting to Google Sheet...' : 'Submit Feedback to Google Sheet'}
                </button>
              </form>

              {userSuggestions && userSuggestions.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                    📋 Aapki Guzishta Suggestions (Google Sheet):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {userSuggestions.map((sug: any, idx: number) => (
                      <div key={idx} style={{ background: '#0e1320', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{sug.category || 'FEATURE'}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{sug.date || 'Sheet Record'}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#fff' }}>{sug.text || sug.suggestion}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SUPER ADMIN CONTROL CENTER (IN-APP FEATURE 2)     */}
        {/* ========================================================= */}
        {activeTab === 'admin' && (
          <div className="tab-pane active admin-tab-pane">
            {!isAdmin ? (
              <div className="material-card" style={{ maxWidth: '460px', margin: '40px auto', textAlign: 'center', border: '1px solid #ff6b8b', padding: '30px 22px', borderRadius: '16px' }}>
                <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(255, 107, 139, 0.15)', color: '#ff6b8b', marginBottom: '16px' }}>
                  <Lock size={36} />
                </div>
                <h2 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 8px' }}>
                  Super Admin Terminal
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.5 }}>
                  VIP Licenses generator, Users List aur Ad Network monetization controls tak rasayi ke liye apna Master Passphrase enter karein.
                </p>
                <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Master Security Passphrase</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Master Passphrase enter karein"
                      value={adminInputKey}
                      onChange={e => setAdminInputKey(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {adminAuthError && (
                    <div style={{ color: '#ff4d4d', fontSize: '0.82rem', background: 'rgba(255, 77, 77, 0.12)', padding: '8px 12px', borderRadius: '6px' }}>
                      {adminAuthError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={adminAuthLoading}
                    style={{ background: 'linear-gradient(135deg, #ff6b8b 0%, #d81b60 100%)', border: 'none', padding: '12px', fontWeight: 800, fontSize: '0.92rem' }}
                  >
                    {adminAuthLoading ? 'Verifying with Backend...' : '🔓 Unlock Admin Console'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {/* Admin Header Bar */}
                <div className="material-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', padding: '16px 20px', marginBottom: '20px', borderLeft: '4px solid #ff6b8b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 107, 139, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b8b' }}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>Super Admin Control Center</h2>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(0, 230, 118, 0.15)', color: '#00e676', border: '1px solid rgba(0,230,118,0.3)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          SESSION ACTIVE
                        </span>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Manage VIP licenses, Google Sheet registered users, and Rewarded Ads.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      className="btn-secondary"
                      onClick={fetchAdminUsers}
                      style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RefreshCw size={13} className={adminUsersLoading ? 'spin' : ''} />
                      <span>Sync Sheet</span>
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={handleAdminLogout}
                      style={{ fontSize: '0.78rem', padding: '6px 12px', color: '#ff6b8b', borderColor: 'rgba(255,107,139,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <LogOut size={13} />
                      <span>Logout Admin</span>
                    </button>
                  </div>
                </div>

                {/* Sub Tab Navigation */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                  <button
                    className={`material-chip ${adminSubTab === 'licenses' ? 'active' : ''}`}
                    onClick={() => setAdminSubTab('licenses')}
                    style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Ticket size={15} />
                    <span>VIP Licenses ({adminCodes.filter(c => !c.used).length} Unused)</span>
                  </button>
                  <button
                    className={`material-chip ${adminSubTab === 'users' ? 'active' : ''}`}
                    onClick={() => setAdminSubTab('users')}
                    style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Users size={15} />
                    <span>Registered Users ({adminUsers.length})</span>
                  </button>
                  <button
                    className={`material-chip ${adminSubTab === 'ads' ? 'active' : ''}`}
                    onClick={() => setAdminSubTab('ads')}
                    style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Sliders size={15} />
                    <span>Rewarded Ads ({adminAdSettings.network.toUpperCase()})</span>
                  </button>
                </div>

                {/* Sub Tab 1: VIP Licenses */}
                {adminSubTab === 'licenses' && (
                  <div>
                    {/* Stat Badges */}
                    <div className="plans-grid" style={{ marginBottom: '16px' }}>
                      <div className="material-card" style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Generated</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{adminCodes.length}</div>
                      </div>
                      <div className="material-card" style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Active / Unused</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>
                          {adminCodes.filter(c => !c.used).length}
                        </div>
                      </div>
                      <div className="material-card" style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Redeemed / Used</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ff6b8b', marginTop: '4px' }}>
                          {adminCodes.filter(c => c.used).length}
                        </div>
                      </div>
                    </div>

                    {/* Generators Panel */}
                    <div className="material-card" style={{ marginBottom: '20px', padding: '20px' }}>
                      <h3 style={{ margin: '0 0 14px', fontSize: '1.05rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Ticket size={18} />
                        <span>VIP License Key Generator</span>
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {/* Bulk Generator */}
                        <div style={{ background: '#0e1424', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', color: '#fff' }}>⚡ 1-Click 60 Bulk Codes</h4>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.4 }}>
                            20 Basic (5 sigs) + 20 Pro (10 sigs) + 20 Elite (20 sigs) ek click mein generate karein.
                          </p>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }}
                            onClick={handleBulkGenerateCodes}
                          >
                            Generate 60 Bulk Codes
                          </button>
                        </div>

                        {/* Single Generator */}
                        <div style={{ background: '#0e1424', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', color: '#fff' }}>🎯 Custom Single License</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.72rem' }}>Plan Tier</label>
                              <select
                                className="app-select"
                                style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem' }}
                                value={adminSinglePlan}
                                onChange={(e: any) => setAdminSinglePlan(e.target.value)}
                              >
                                <option value="BASIC">BASIC (5 sigs/day)</option>
                                <option value="PRO">PRO (10 sigs/day)</option>
                                <option value="ELITE">ELITE (20 sigs/day)</option>
                              </select>
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.72rem' }}>Duration</label>
                              <select
                                className="app-select"
                                style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem' }}
                                value={adminSingleDuration}
                                onChange={e => setAdminSingleDuration(Number(e.target.value))}
                              >
                                <option value={30}>30 Days (1 Month)</option>
                                <option value={60}>60 Days (2 Months)</option>
                                <option value={90}>90 Days (Quarter)</option>
                                <option value={365}>365 Days (1 Year)</option>
                              </select>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ width: '100%', fontSize: '0.85rem', padding: '8px', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                            onClick={handleSingleGenerateCode}
                          >
                            + Generate Single Key
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Filter and Table */}
                    <div className="material-card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {(['ALL', 'UNUSED', 'USED', 'BASIC', 'PRO', 'ELITE'] as const).map(f => (
                            <button
                              key={f}
                              className={`btn-secondary ${adminCodeFilter === f ? 'active' : ''}`}
                              style={{
                                fontSize: '0.75rem',
                                padding: '4px 10px',
                                background: adminCodeFilter === f ? 'var(--accent-cyan)' : undefined,
                                color: adminCodeFilter === f ? '#000' : undefined
                              }}
                              onClick={() => setAdminCodeFilter(f)}
                            >
                              {f}
                            </button>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }} onClick={handleCopyUnusedCodes}>
                            <Copy size={12} style={{ marginRight: '4px' }} />
                            Copy Unused
                          </button>
                          <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#ff6b8b', borderColor: 'rgba(255,107,139,0.3)' }} onClick={handlePurgeUsedCodes}>
                            <Trash2 size={12} style={{ marginRight: '4px' }} />
                            Purge Used
                          </button>
                        </div>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                              <th style={{ padding: '8px 10px' }}>Code</th>
                              <th style={{ padding: '8px 10px' }}>Plan</th>
                              <th style={{ padding: '8px 10px' }}>Signals</th>
                              <th style={{ padding: '8px 10px' }}>Duration</th>
                              <th style={{ padding: '8px 10px' }}>Status</th>
                              <th style={{ padding: '8px 10px' }}>Claimed By</th>
                              <th style={{ padding: '8px 10px' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAdminCodes.length === 0 ? (
                              <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                                  Koi license key nahi mili.
                                </td>
                              </tr>
                            ) : (
                              filteredAdminCodes.map((c, idx) => (
                                <tr key={c.code || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                                    {c.code}
                                  </td>
                                  <td style={{ padding: '8px 10px' }}>
                                    <span className={`badge-plan ${(c.plan || 'free').toLowerCase()}`}>{c.plan}</span>
                                  </td>
                                  <td style={{ padding: '8px 10px' }}>{c.signalsPerDay}/day</td>
                                  <td style={{ padding: '8px 10px' }}>{c.durationDays}d</td>
                                  <td style={{ padding: '8px 10px' }}>
                                    {c.used ? (
                                      <span style={{ color: '#ff6b8b', fontWeight: 700, fontSize: '0.72rem' }}>CLAIMED</span>
                                    ) : (
                                      <span style={{ color: '#00e676', fontWeight: 700, fontSize: '0.72rem' }}>ACTIVE</span>
                                    )}
                                  </td>
                                  <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>{c.usedBy || '—'}</td>
                                  <td style={{ padding: '8px 10px' }}>
                                    <button
                                      className="btn-secondary"
                                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                      onClick={() => {
                                        navigator.clipboard.writeText(c.code);
                                        showToast(`Copied: ${c.code}`, 'info');
                                      }}
                                    >
                                      Copy
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Tab 2: Users Management */}
                {adminSubTab === 'users' && (
                  <div className="material-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '340px' }}>
                        <Search size={16} color="var(--text-secondary)" />
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '6px 12px', fontSize: '0.82rem', width: '100%' }}
                          placeholder="Search username / referral / plan..."
                          value={adminUserSearch}
                          onChange={e => setAdminUserSearch(e.target.value)}
                        />
                      </div>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                        onClick={fetchAdminUsers}
                      >
                        <RefreshCw size={12} style={{ marginRight: '6px' }} className={adminUsersLoading ? 'spin' : ''} />
                        Reload Users
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '8px 10px' }}>Username</th>
                            <th style={{ padding: '8px 10px' }}>Plan</th>
                            <th style={{ padding: '8px 10px' }}>Daily Quota</th>
                            <th style={{ padding: '8px 10px' }}>Referral Code</th>
                            <th style={{ padding: '8px 10px' }}>Referrals</th>
                            <th style={{ padding: '8px 10px' }}>Password</th>
                            <th style={{ padding: '8px 10px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAdminUsers.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                                Koi user record nahi mila.
                              </td>
                            </tr>
                          ) : (
                            filteredAdminUsers.map((u, idx) => (
                              <tr key={u.username || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '8px 10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <strong style={{ color: '#fff' }}>{u.username}</strong>
                                    {u.cloudSynced && (
                                      <span style={{ fontSize: '0.62rem', background: 'rgba(0,230,118,0.12)', color: '#00e676', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                        Sheet
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '8px 10px' }}>
                                  <span className={`badge-plan ${(u.plan || 'free').toLowerCase()}`}>{u.plan || 'FREE'}</span>
                                </td>
                                <td style={{ padding: '8px 10px', color: 'var(--accent-green)', fontWeight: 700 }}>
                                  {u.dailyQuotaLeft !== undefined ? u.dailyQuotaLeft : 1} sigs
                                </td>
                                <td style={{ padding: '8px 10px', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                                  {u.referralCode || '—'}
                                </td>
                                <td style={{ padding: '8px 10px' }}>{u.referralsCount || 0}</td>
                                <td style={{ padding: '8px 10px' }}>
                                  {u.password ? (
                                    <span style={{ color: '#00e676', fontSize: '0.72rem', fontWeight: 700 }}>ACTIVE</span>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Standard</span>
                                  )}
                                </td>
                                <td style={{ padding: '8px 10px' }}>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      className="btn-primary"
                                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                      onClick={() => {
                                        setAdminResetTargetUser(u.username);
                                        setAdminNewUserPassword('Crypto' + Math.floor(1000 + Math.random() * 9000));
                                        setAdminResetModalMsg('');
                                        setAdminResetModalOpen(true);
                                      }}
                                    >
                                      🔑 Reset Pass
                                    </button>
                                    <button
                                      className="btn-secondary"
                                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                      onClick={() => {
                                        const text = `CryptoWorld Account Recovery:\nUsername: ${u.username}\nReferral Code: ${u.referralCode || 'N/A'}\nStatus: Verified`;
                                        navigator.clipboard.writeText(text);
                                        showToast(`User ${u.username} recovery info copied!`, 'info');
                                      }}
                                    >
                                      Recovery
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub Tab 3: Rewarded Ads Config */}
                {adminSubTab === 'ads' && (
                  <div className="material-card" style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '18px' }}>
                      <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Film size={20} color="var(--accent-cyan)" />
                        <span>Rewarded Video Ad Network Monetization</span>
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Jab user ka daily quota khatam hota hai, to rewarded ad dekhne par +1 bonus signal milta hai. Niche se ad network switch karein.
                      </p>
                    </div>

                    {/* Network Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                      {[
                        { id: 'builtin', name: 'Built-in Native Ads', desc: 'Pre-loaded high CPM crypto video sponsors (Binance, Bybit, Ledger, TradingView)', badge: 'Recommended' },
                        { id: 'adsterra', name: 'Adsterra Direct Link', desc: 'Direct Link SmartURL for maximum mobile webview revenue', badge: 'High CPM' },
                        { id: 'monetag', name: 'Monetag Zone', desc: 'In-App rewarded interstitial & push zones', badge: 'Instant Payout' },
                        { id: 'adsense', name: 'Google AdSense / AdMob', desc: 'Official Google AdMob Rewarded Video Unit ID', badge: 'Tier 1' },
                      ].map(net => {
                        const isSelected = adminAdSettings.network === net.id;
                        return (
                          <div
                            key={net.id}
                            onClick={() => setAdminAdSettings({ ...adminAdSettings, network: net.id as any })}
                            style={{
                              background: isSelected ? '#11192e' : '#0e1424',
                              border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              padding: '14px',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <strong style={{ color: isSelected ? 'var(--accent-cyan)' : '#fff', fontSize: '0.9rem' }}>{net.name}</strong>
                              <span style={{ fontSize: '0.62rem', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px' }}>
                                {net.badge}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              {net.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Input configuration for selected network */}
                    <div style={{ background: '#090d16', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '18px' }}>
                      {adminAdSettings.network === 'adsterra' && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Adsterra Direct Link URL</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="https://www.highcpmgate.com/..."
                            value={adminAdSettings.adsterraDirectLink}
                            onChange={e => setAdminAdSettings({ ...adminAdSettings, adsterraDirectLink: e.target.value })}
                          />
                        </div>
                      )}
                      {adminAdSettings.network === 'monetag' && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Monetag Zone ID / Tag Script URL</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. 7849102"
                            value={adminAdSettings.monetagZoneId}
                            onChange={e => setAdminAdSettings({ ...adminAdSettings, monetagZoneId: e.target.value })}
                          />
                        </div>
                      )}
                      {adminAdSettings.network === 'adsense' && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Google AdSense / AdMob Rewarded Ad Unit ID</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="ca-pub-XXXXXXXXXXXXXXXX / ca-app-pub-..."
                            value={adminAdSettings.adSensePublisherId}
                            onChange={e => setAdminAdSettings({ ...adminAdSettings, adSensePublisherId: e.target.value })}
                          />
                        </div>
                      )}
                      {adminAdSettings.network === 'builtin' && (
                        <div style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>
                          ✅ Built-in Native Crypto Ads active hain (Binance VIP, Bybit, Ledger, TradingView). Kisi external configuration ki zaroorat nahi.
                        </div>
                      )}
                    </div>

                    {/* Save, Reset, Test Buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleSaveAdConfig}
                        disabled={adminAdSaving}
                        style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                      >
                        {adminAdSaving ? 'Saving to Google Sheet...' : '💾 Save Ad Network Settings'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setCurrentAdIndex(Math.floor(Math.random() * REWARDED_ADS.length));
                          setAdSecondsLeft(15);
                          setIsAdRewardGranted(false);
                          setRewardAdModalOpen(true);
                          showToast('Testing rewarded video ad flow...', 'info');
                        }}
                        style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                      >
                        <Play size={14} style={{ marginRight: '6px' }} />
                        Test Rewarded Ad
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleResetAdConfig}
                        style={{ padding: '10px 18px', fontSize: '0.85rem', color: '#ff6b8b', borderColor: 'rgba(255,107,139,0.3)' }}
                      >
                        Reset Defaults
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* AUTHENTIC BOTTOM NAVIGATION BAR                           */}
      {/* ========================================================= */}
      <nav className="bottom-nav-bar">
        <button
          className={`bottom-nav-item ${activeTab === 'signals' ? 'active' : ''}`}
          onClick={() => setActiveTab('signals')}
        >
          <span className="bottom-nav-icon"><Zap size={20} /></span>
          <span>Signals</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <span className="bottom-nav-icon">
            <TrendingUp size={20} />
            <span className="bottom-nav-badge">{stats.activeCount}</span>
          </span>
          <span>Progress</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'chart' ? 'active' : ''}`}
          onClick={() => setActiveTab('chart')}
        >
          <span className="bottom-nav-icon"><BarChart2 size={20} /></span>
          <span>Chart & Pairs</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <span className="bottom-nav-icon"><User size={20} /></span>
          <span>Account</span>
        </button>

        {isAdmin && (
          <button
            className={`bottom-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <span className="bottom-nav-icon"><ShieldCheck size={20} color={activeTab === 'admin' ? '#ff6b8b' : undefined} /></span>
            <span style={{ color: activeTab === 'admin' ? '#ff6b8b' : undefined }}>Admin</span>
          </button>
        )}
      </nav>

      {/* Floating WhatsApp Action Button */}
      <a
        href="https://wa.me/?text=Assalam-o-Alaikum%20CryptoWorld%20Support,%20mujhe%20crypto%20signals%20ke%20bare%20mein%20maloomat%20chahiye"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.68-1.4 1.26-1.92 1.34-.52.08-1.18.11-3.41-.75-2.22-.85-3.64-3.11-3.75-3.26-.11-.15-.89-1.18-.89-2.25 0-1.07.56-1.6 76-1.82.2-.22.44-.28.59-.28.15 0 .3 0 .42.01.13.01.32-.05.5.38.19.45.65 1.58.71 1.7.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.25.25-.11.49.14.24.62 1.02 1.33 1.65.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.39.66 1.63.78.24.12.4.18.46.28.06.1.06.58-.18 1.26z" />
        </svg>
      </a>

      {/* Login & Register Modal (Direct Google Sheet Verification) */}
      {loginModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-card material-card">
            <button className="modal-close-btn" onClick={() => setLoginModalOpen(false)}>×</button>
            <h2 className="card-title">🔑 {authMode === 'login' ? 'Google Sheet Login' : 'Google Sheet Registration'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Data direct aapki Google Sheets Quota & Users tab se verify hota hai. Free quota: 1 signal/day.
            </p>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#090d16', padding: '4px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className={authMode === 'login' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '8px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '6px', border: authMode === 'login' ? 'none' : 'transparent' }}
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
              >
                🔑 Login
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '8px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '6px', border: authMode === 'register' ? 'none' : 'transparent' }}
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
              >
                📝 Register
              </button>
            </div>

            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label className="form-label">Username (Min 3 characters)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Apna username enter karein"
                  value={authUsername}
                  onChange={e => setAuthUsername(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password (Min 6 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                />
              </div>

              {authMode === 'register' && (
                <div className="form-group">
                  <label className="form-label">Referral Code (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ZULQ2026"
                    value={authRefCode}
                    onChange={e => setAuthRefCode(e.target.value)}
                  />
                </div>
              )}

              {authError && (
                <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '12px' }}>
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontWeight: 800, borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                {authMode === 'login' ? '🚀 Login to Account' : '✨ Register New Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Premium Plans Modal (Direct Google Sheet Sync) */}
      {premiumModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-card material-card" style={{ maxWidth: '650px' }}>
            <button className="modal-close-btn" onClick={() => setPremiumModalOpen(false)}>×</button>
            <h2 className="card-title" style={{ color: 'var(--accent-cyan)' }}>⭐ Upgrade to VIP Signals (Google Sheet Sync)</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '18px' }}>
              Rozana zyada signals, zero waiting, aur direct WhatsApp VIP group signals haasil karein.
            </p>

            <div className="plans-grid">
              <div className="plan-card">
                <div className="plan-name">BASIC</div>
                <div className="plan-signals">5 Signals/Day</div>
                <div className="plan-features">
                  • 5 signals daily quota<br />
                  • All benchmark pairs<br />
                  • Risk/Reward 1:1.85<br />
                  • Standard Support
                </div>
                <a href="https://wa.me/?text=Assalam-o-Alaikum,%20mujhe%20CryptoWorld%20BASIC%20plan%20chahiye" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }}>
                  Select Basic
                </a>
              </div>

              <div className="plan-card popular">
                <div className="popular-ribbon">POPULAR</div>
                <div className="plan-name" style={{ color: 'var(--accent-cyan)' }}>PRO</div>
                <div className="plan-signals" style={{ color: 'var(--accent-green)' }}>10 Signals/Day</div>
                <div className="plan-features">
                  • 10 signals daily quota<br />
                  • Multi-timeframe priority<br />
                  • Fast AI Groq & Gemini<br />
                  • Priority WhatsApp Desk
                </div>
                <a href="https://wa.me/?text=Assalam-o-Alaikum,%20mujhe%20CryptoWorld%20PRO%20plan%20chahiye" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: '100%', fontSize: '0.8rem' }}>
                  Select Pro
                </a>
              </div>

              <div className="plan-card">
                <div className="plan-name" style={{ color: 'var(--accent-yellow)' }}>ELITE</div>
                <div className="plan-signals" style={{ color: 'var(--accent-yellow)' }}>20 Signals/Day</div>
                <div className="plan-features">
                  • 20 signals daily quota<br />
                  • VIP Whale Flow alerts<br />
                  • Instant Trade Setup<br />
                  • 24/7 Dedicated Support
                </div>
                <a href="https://wa.me/?text=Assalam-o-Alaikum,%20mujhe%20CryptoWorld%20ELITE%20plan%20chahiye" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ width: '100%', fontSize: '0.8rem', borderColor: 'var(--accent-yellow)', color: 'var(--accent-yellow)' }}>
                  Select Elite
                </a>
              </div>
            </div>

            <div style={{ background: '#111624', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', marginTop: '16px' }}>
              <label className="form-label">🎟️ Redeem Premium License Code</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, minWidth: '180px', textTransform: 'uppercase' }}
                  placeholder="e.g. PRO-TEST2026"
                  value={redeemCode}
                  onChange={e => setRedeemCode(e.target.value)}
                />
                <button className="btn-primary" onClick={handleRedeemCode}>
                  ✔ Redeem Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device Lock Alert Modal (Strict 1-Account Per Device Rule) */}
      {deviceLockAlert && deviceLockAlert.open && (
        <div className="modal-overlay active">
          <div className="modal-card material-card" style={{ maxWidth: '440px', border: '1px solid #ff4d4d', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'rgba(255, 77, 77, 0.15)', color: '#ff4d4d', marginBottom: '12px' }}>
              <ShieldAlert size={36} />
            </div>
            <h3 style={{ color: '#ff4d4d', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px' }}>
              DEVICE RESTRICTION ACTIVE
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '16px' }}>
              {deviceLockAlert.message}
            </p>
            {deviceLockAlert.existingUser && (
              <div style={{ background: '#0e1320', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255, 204, 0, 0.3)', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: '#ffcc00' }}>Is device par pehle se registered account:</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '3px' }}>
                  {deviceLockAlert.existingUser.toUpperCase()}
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                className="btn-secondary"
                onClick={() => setDeviceLockAlert(null)}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  if (deviceLockAlert.existingUser) {
                    setAuthUsername(deviceLockAlert.existingUser);
                  }
                  setAuthMode('login');
                  setDeviceLockAlert(null);
                  setLoginModalOpen(true);
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rewarded Video Ad Modal Player (Strictly activated from Generate Button on Quota Exhaustion) */}
      {rewardAdModalOpen && (
        <div className="modal-overlay active">
          <div className="ad-modal-card">
            {/* Ad Top Bar */}
            <div className="ad-overlay-top">
              <div className="ad-badge-sponsor">
                <span>{REWARDED_ADS[currentAdIndex].logoEmoji}</span>
                <span>{REWARDED_ADS[currentAdIndex].sponsorBadge}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="ad-sound-btn"
                  onClick={() => setIsAdMuted(m => !m)}
                  title={isAdMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isAdMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isAdMuted ? 'Unmute' : 'Muted'}</span>
                </button>

                <div className={`ad-timer-pill ${isAdRewardGranted ? 'unlocked' : ''}`}>
                  {isAdRewardGranted ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>REWARD UNLOCKED</span>
                    </>
                  ) : (
                    <>
                      <Lock size={12} />
                      <span>Reward in: {adSecondsLeft}s</span>
                    </>
                  )}
                </div>

                {!isAdRewardGranted ? (
                  <button
                    type="button"
                    className="ad-close-btn-locked"
                    onClick={() => showToast(`⚠️ Reward paaney ke liye ad poora 15s dekhna lazmi hai! (${adSecondsLeft}s baqi)`, 'info')}
                    title="Watch full ad to earn quota"
                  >
                    <Lock size={12} /> Skip ({adSecondsLeft}s)
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ad-close-btn-unlocked"
                    onClick={claimRewardAdQuota}
                  >
                    <CheckCircle2 size={14} /> Claim +1 Quota
                  </button>
                )}
              </div>
            </div>

            {/* Real Video Player */}
            <div className="ad-video-container">
              <video
                key={REWARDED_ADS[currentAdIndex].id}
                className="ad-video-element"
                src={REWARDED_ADS[currentAdIndex].videoUrl}
                autoPlay
                playsInline
                muted={isAdMuted}
                loop
              />

              {/* Dynamic Live Trading Graphic Overlay on the Video */}
              <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px', pointerEvents: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{REWARDED_ADS[currentAdIndex].logoEmoji}</span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                      {REWARDED_ADS[currentAdIndex].title}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>
                      ● Official Partner | High-Frequency AI Execution
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.68rem', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', fontWeight: 700 }}>
                  AD 15s • REWARD: +1 SIGNAL
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="ad-progress-bar-wrap">
              <div
                className="ad-progress-bar-fill"
                style={{ width: `${((15 - adSecondsLeft) / 15) * 100}%` }}
              />
            </div>

            {/* Completion Banner */}
            {isAdRewardGranted && (
              <div className="ad-reward-celebration">
                <div className="ad-reward-title">
                  <Sparkles size={20} />
                  <span>CONGRATULATIONS! +1 SIGNAL QUOTA EARNED!</span>
                </div>
                <p className="ad-reward-desc">
                  Shandar! Aap ne ad mukammal dekh liya hai. Niche button daba kar quota claim karein aur foran naya AI trade signal generate karein.
                </p>
                <button
                  type="button"
                  className="ad-claim-action-btn"
                  onClick={claimRewardAdQuota}
                >
                  <Gift size={18} />
                  <span>CLAIM +1 SIGNAL & GENERATE NOW</span>
                </button>
              </div>
            )}

            {/* Ad Sponsor Info Footer */}
            <div className="ad-overlay-bottom">
              <div className="ad-sponsor-info">
                <div className="ad-sponsor-logo">
                  {REWARDED_ADS[currentAdIndex].logoEmoji}
                </div>
                <div className="ad-sponsor-texts">
                  <h4>{REWARDED_ADS[currentAdIndex].sponsor}</h4>
                  <p>{REWARDED_ADS[currentAdIndex].sponsorTagline}</p>
                </div>
              </div>

              <a
                href={REWARDED_ADS[currentAdIndex].ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ad-cta-btn"
              >
                <span>{REWARDED_ADS[currentAdIndex].ctaText}</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 1: IN-APP UPDATE CHECKER POPUP MODAL               */}
      {/* ========================================================= */}
      {updateModalOpen && updateData && (
        <div className="modal-overlay active" style={{ zIndex: 1000000 }}>
          <div className="modal-card material-card" style={{ maxWidth: '440px', textAlign: 'center', border: '1px solid var(--accent-cyan)' }}>
            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-cyan)', marginBottom: '14px' }}>
              <Download size={36} />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px' }}>
              🚀 Naya Version Available!
            </h3>
            <div style={{ display: 'inline-block', background: 'rgba(0, 230, 118, 0.15)', color: '#00e676', border: '1px solid rgba(0, 230, 118, 0.3)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px' }}>
              v{updateData.latestVersion} (Aapka Version: v{CURRENT_APP_VERSION})
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
              {updateData.releaseNotes}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontWeight: 800, fontSize: '0.95rem' }}
                onClick={() => {
                  if (updateData.downloadUrl) {
                    window.open(updateData.downloadUrl, '_blank');
                  }
                  setUpdateModalOpen(false);
                }}
              >
                <Download size={16} style={{ marginRight: '6px' }} />
                Download Update
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                onClick={() => setUpdateModalOpen(false)}
              >
                Baad Mein
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal (Triggered via Header or Sidebar) */}
      {adminLoginModalOpen && (
        <div className="modal-overlay active" style={{ zIndex: 1000000 }}>
          <div className="modal-card material-card" style={{ maxWidth: '420px', border: '1px solid #ff6b8b' }}>
            <button className="modal-close-btn" onClick={() => setAdminLoginModalOpen(false)}>×</button>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(255, 107, 139, 0.15)', color: '#ff6b8b', marginBottom: '8px' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>Admin Login</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Master Passphrase ke zariye Admin dashboard unlock karein.
              </p>
            </div>
            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label className="form-label">Master Passphrase</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Master Passphrase enter karein"
                  value={adminInputKey}
                  onChange={e => setAdminInputKey(e.target.value)}
                  autoFocus
                />
              </div>
              {adminAuthError && (
                <div style={{ color: '#ff4d4d', fontSize: '0.82rem', background: 'rgba(255, 77, 77, 0.12)', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                  {adminAuthError}
                </div>
              )}
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontWeight: 800, background: 'linear-gradient(135deg, #ff6b8b 0%, #d81b60 100%)', border: 'none' }}
                disabled={adminAuthLoading}
              >
                {adminAuthLoading ? 'Verifying...' : '🔓 Unlock Admin Panel'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin User Password Reset Modal */}
      {adminResetModalOpen && (
        <div className="modal-overlay active" style={{ zIndex: 1000000 }}>
          <div className="modal-card material-card" style={{ maxWidth: '420px', border: '1px solid var(--accent-cyan)' }}>
            <button className="modal-close-btn" onClick={() => setAdminResetModalOpen(false)}>×</button>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: '#fff' }}>
              🔑 Reset Password for <span style={{ color: 'var(--accent-cyan)' }}>{adminResetTargetUser}</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Naya password enter karein ya automatic random generate karein. Password Google Sheet aur local DB dono mein update hoga.
            </p>
            <form onSubmit={handleAdminResetPassword}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={adminNewUserPassword}
                    onChange={e => setAdminNewUserPassword(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setAdminNewUserPassword('CW' + Math.floor(100000 + Math.random() * 900000) + '!')}
                    style={{ fontSize: '0.75rem', padding: '0 10px', whiteSpace: 'nowrap' }}
                  >
                    🎲 Random
                  </button>
                </div>
              </div>
              {adminResetModalMsg && (
                <div style={{ color: '#ff4d4d', fontSize: '0.82rem', marginBottom: '12px' }}>
                  {adminResetModalMsg}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                  Save & Update Password
                </button>
                <button type="button" className="btn-secondary" onClick={() => setAdminResetModalOpen(false)} style={{ padding: '10px 14px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}