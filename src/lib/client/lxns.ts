import { LxnsOAuthClient, LxnsApiClient } from "lxns-rhythm-api";
import { PUBLIC_LXNS_OAUTH_CLIENT_ID } from "$env/static/public";
import { normalizeUsername } from "$lib/utils/username";
import type {
  PlayerProfile,
  PlayerScore,
  ScoreQuality,
  GradeBucket,
  DxStarBucket,
  LevelPreferenceBucket,
  FCType,
  FSType,
  SyncWeek,
  ChartType,
  RatingTrendPoint,
  B50Stats,
  ConstantBucket,
} from "$lib/types/player";

const BASE_URL = "https://maimai.lxns.net/api/v0/";
const TOKEN_KEY = "checkmydx:lxns-token";
const OAUTH_STATE_KEY = "checkmydx:lxns-oauth-state";
const OAUTH_VERIFIER_KEY = "checkmydx:lxns-oauth-verifier";
const OAUTH_SCOPES = ["read_user_profile", "read_player"] as const;

type LxnsToken = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
};

type LxnsPlayer = {
  name: string;
  rating: number;
  friend_code: number;
  star: number;
  course_rank: number;
  upload_time?: string;
  icon?: { id: number; name?: string };
  trophy?: { name?: string };
  name_plate?: { id: number; name?: string };
  frame?: { id: number; name?: string };
};

type LxnsScore = {
  id: number;
  song_name?: string;
  level?: string;
  level_index: number;
  achievements: number;
  dx_score: number;
  dx_rating?: number;
  rate?: string;
  fc?: "app" | "ap" | "fcp" | "fc" | null;
  fs?: "fsdp" | "fsd" | "fsp" | "fs" | "sync" | null;
  dx_star?: number | null;
  type: "standard" | "dx" | "utage";
  upload_time?: string;
  play_time?: string;
};

type LxnsBests = {
  standard: LxnsScore[];
  dx: LxnsScore[];
  standard_total: number;
  dx_total: number;
};

type LxnsHeatmap = Record<string, number>;

type LxnsTrendPoint = {
  total: number;
  standard_total: number;
  dx_total: number;
  date: string | number;
};

export function isLxnsOAuthConfigured() {
  return Boolean(PUBLIC_LXNS_OAUTH_CLIENT_ID);
}

function getRedirectURI() {
  return `${window.location.origin}/oauth/callback`;
}

function createOAuthClient() {
  if (!PUBLIC_LXNS_OAUTH_CLIENT_ID) {
    throw new Error("尚未配置 PUBLIC_LXNS_OAUTH_CLIENT_ID");
  }

  return new LxnsOAuthClient({
    clientId: PUBLIC_LXNS_OAUTH_CLIENT_ID,
    redirectURI: getRedirectURI(),
    baseURL: BASE_URL,
  });
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64Url(bytes);
}

function base64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function sha256Base64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return base64Url(new Uint8Array(digest));
}

export async function beginLxnsOAuth() {
  const client = createOAuthClient();
  const state = randomToken();
  const verifier = randomToken();
  const challenge = await sha256Base64Url(verifier);

  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  sessionStorage.setItem(OAUTH_VERIFIER_KEY, verifier);

  window.location.href = client.createAuthorizeURL({
    scope: [...OAUTH_SCOPES],
    state,
    codeChallenge: challenge,
    codeChallengeMethod: "S256",
  });
}

export async function finishLxnsOAuthCallback(url: URL) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = sessionStorage.getItem(OAUTH_STATE_KEY);
  const verifier = sessionStorage.getItem(OAUTH_VERIFIER_KEY);

  if (!code) throw new Error("落雪咖啡屋 没有返回授权码");
  if (!state || state !== storedState) throw new Error("落雪咖啡屋 OAuth 状态校验失败");
  if (!verifier) throw new Error("缺少 落雪咖啡屋 OAuth 校验信息");

  const token = await createOAuthClient().exchangeCodeForToken({
    code,
    codeVerifier: verifier,
  });

  sessionStorage.removeItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(OAUTH_VERIFIER_KEY);

  const storedToken: LxnsToken = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: Date.now() + token.expires_in * 1000,
    scope: token.scope,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(storedToken));
  return storedToken;
}

export function hasStoredLxnsToken() {
  return Boolean(readStoredToken());
}

function readStoredToken(): LxnsToken | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as LxnsToken;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

async function getAccessToken() {
  const token = readStoredToken();
  if (!token) throw new Error("请先连接 落雪咖啡屋");

  if (Date.now() < token.expiresAt - 30_000) {
    return token.accessToken;
  }

  const refreshed = await createOAuthClient().refreshAccessToken({
    refreshToken: token.refreshToken,
  });

  const nextToken: LxnsToken = {
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    expiresAt: Date.now() + refreshed.expires_in * 1000,
    scope: refreshed.scope,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(nextToken));
  return nextToken.accessToken;
}

export async function fetchAuthorizedMaimaiProfile(): Promise<PlayerProfile> {
  const accessToken = await getAccessToken();
  const authorized = createOAuthClient().createAuthorizedClient(accessToken);
  const [player, bests, allScoresRaw, heatmap, trend] = await Promise.all([
    authorized.maimai.getPlayer() as Promise<LxnsPlayer>,
    authorized.maimai.getBests() as Promise<LxnsBests>,
    authorized.maimai.getScores().catch(() => [] as LxnsScore[]) as Promise<LxnsScore[]>,
    authorized.maimai.getHeatmap().catch(() => null) as Promise<LxnsHeatmap | null>,
    authorized.maimai.getTrend().catch(() => []) as Promise<LxnsTrendPoint[]>,
  ]);

  return transformLxnsProfile(player, bests, allScoresRaw, heatmap, trend);
}

async function scoreToPlayerScore(
  score: LxnsScore,
  constantMap: ConstantMap,
): Promise<PlayerScore> {
  const level = score.level || "??";
  // Prefer the precise level_value from the song list; fall back to parsing
  // the level string (e.g. "14+" -> 14.9) when the chart isn't found.
  const constant =
    constantMap.get(constantKey(score.id, score.type, score.level_index)) ?? parseConstant(level);
  return {
    id: score.id,
    title: score.song_name || `曲目 ${score.id}`,
    difficulty: level,
    constant,
    achievements: score.achievements,
    grade: normalizeGrade(score.rate),
    rating: score.dx_rating ?? 0,
    dxScore: score.dx_score,
    type: score.type as ChartType,
    fc: (score.fc ?? null) as FCType,
    fs: (score.fs ?? null) as FSType,
    dxStar: score.dx_star ?? null,
    timestamp: score.play_time || score.upload_time || null,
  };
}

// '14+' -> 14.9, '13.6' -> 13.6. Returns null when unparseable.
function parseConstant(level: string): number | null {
  const match = level.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const base = parseFloat(match[1]);
  return level.includes("+") ? base + 0.9 : base;
}

// Lookup key: `${id}|${type}|${level_index}` -> precise chart constant (level_value).
// Built once from the public song list and reused across profile fetches.
type ConstantMap = Map<string, number>;
let constantMapPromise: Promise<ConstantMap> | null = null;

function constantKey(id: number, type: string, levelIndex: number): string {
  return `${id}|${type}|${levelIndex}`;
}

// Fetch the full song list (public, no auth) and build a constant lookup map.
// Cached for the lifetime of the page load; song constants rarely change.
async function buildConstantMap(): Promise<ConstantMap> {
  const client = new LxnsApiClient({ baseURL: BASE_URL });
  const { songs } = (await client.maimai.public.getSongList()) as {
    songs: Array<{
      id: number;
      difficulties: {
        standard: Array<{ difficulty: number; level_value: number }>;
        dx: Array<{ difficulty: number; level_value: number }>;
        utage?: Array<{ difficulty: number; level_value: number }>;
      };
    }>;
  };
  const map: ConstantMap = new Map();
  for (const song of songs) {
    for (const type of ["standard", "dx", "utage"] as const) {
      const diffs = song.difficulties[type];
      if (!diffs) continue;
      for (const diff of diffs) {
        map.set(constantKey(song.id, type, diff.difficulty), diff.level_value);
      }
    }
  }
  return map;
}

function getConstantMap(): Promise<ConstantMap> {
  if (!constantMapPromise) constantMapPromise = buildConstantMap().catch(() => new Map());
  return constantMapPromise;
}

// Map a 落雪咖啡屋 rate code (e.g. 'sssp') to a display label ('SSS+') and a color.
const GRADE_META: Record<string, { label: string; color: string }> = {
  sssp: { label: "SSS+", color: "#fbbf24" },
  sss: { label: "SSS", color: "#fcd34d" },
  ssp: { label: "SS+", color: "#a3e635" },
  ss: { label: "SS", color: "#84cc16" },
  sp: { label: "S+", color: "#22d3ee" },
  s: { label: "S", color: "#38bdf8" },
  // AAAp/AAAp/AAp/Ap/Bp map to A+/A/B+/B etc. — 落雪咖啡屋 returns lowercase codes,
  // so keep a few lower-grade mappings for completeness even though the
  // distribution only renders S and above.
  aaap: { label: "AAA+", color: "#fb7185" },
  aaa: { label: "AAA", color: "#f87171" },
  aap: { label: "AA+", color: "#fb923c" },
  aa: { label: "AA", color: "#f97316" },
  ap: { label: "A+", color: "#fdba74" },
  a: { label: "A", color: "#fcd34d" },
  bp: { label: "B+", color: "#a3e635" },
  b: { label: "B", color: "#84cc16" },
  cp: { label: "C+", color: "#22d3ee" },
  c: { label: "C", color: "#38bdf8" },
  dp: { label: "D+", color: "#818cf8" },
  d: { label: "D", color: "#6366f1" },
};

// Normalize a raw 落雪咖啡屋 rate code (any case) to the display label used across the UI.
function normalizeGrade(rate?: string): string {
  if (!rate) return "—";
  return GRADE_META[rate.toLowerCase()]?.label ?? rate.toUpperCase();
}

// S and above only — anything below is dropped from the distribution.
// Keyed by display label so it works whether grade came from a rate code
// (normalized to label) or from mock data (already a label).
const GRADE_ORDER = ["SSS+", "SSS", "SS+", "SS", "S+", "S"];

function buildGradeDistribution(scores: PlayerScore[]): GradeBucket[] {
  const labelToMeta = new Map(Object.entries(GRADE_META).map(([, v]) => [v.label, v]));
  const counts = new Map<string, number>();
  for (const score of scores) {
    const key = score.grade;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return GRADE_ORDER.filter((label) => counts.has(label)).map((label) => ({
    name: label,
    count: counts.get(label) ?? 0,
    color: labelToMeta.get(label)?.color ?? "#94a3b8",
  }));
}

function computeQuality(scores: PlayerScore[]): ScoreQuality {
  let allPerfect = 0;
  let fullCombo = 0;
  let fullSyncDx = 0;
  let fullSync = 0;
  for (const score of scores) {
    if (score.fc === "app" || score.fc === "ap") allPerfect += 1;
    else if (score.fc === "fcp" || score.fc === "fc") fullCombo += 1;
    if (score.fs === "fsdp" || score.fs === "fsd") fullSyncDx += 1;
    else if (score.fs === "fsp" || score.fs === "fs") fullSync += 1;
  }
  return { allPerfect, fullCombo, fullSyncDx, fullSync };
}

function buildDxStarDistribution(scores: PlayerScore[]): DxStarBucket[] {
  const counts = new Map<number, number>();
  for (const score of scores) {
    if (score.dxStar == null) continue;
    counts.set(score.dxStar, (counts.get(score.dxStar) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  if (total === 0) return [];
  // Always show all 6 tiers (0-5) even when count is 0, so the chart is stable.
  return [5, 4, 3, 2, 1, 0].map((star) => ({
    star,
    count: counts.get(star) ?? 0,
    percentage: ((counts.get(star) ?? 0) / total) * 100,
  }));
}

function buildLevelPreferences(scores: PlayerScore[]): LevelPreferenceBucket[] {
  const buckets = new Map<
    string,
    { count: number; totalAchievements: number; bestAchievements: number }
  >();
  const rankedScores = scores.filter((score) => score.type !== "utage");
  for (const score of rankedScores) {
    const current = buckets.get(score.difficulty) ?? {
      count: 0,
      totalAchievements: 0,
      bestAchievements: 0,
    };
    current.count += 1;
    current.totalAchievements += score.achievements;
    current.bestAchievements = Math.max(current.bestAchievements, score.achievements);
    buckets.set(score.difficulty, current);
  }
  const total = rankedScores.length || 1;
  return [...buckets.entries()]
    .map(([level, bucket]) => ({
      level,
      count: bucket.count,
      percentage: (bucket.count / total) * 100,
      averageAchievements: bucket.totalAchievements / bucket.count,
      bestAchievements: bucket.bestAchievements,
    }))
    .filter((bucket) => bucket.count >= 10)
    .sort((a, b) => b.count - a.count || b.averageAchievements - a.averageAchievements);
}

// Aggregate overview of the Best 50 entries: averages, extremes, constant range.
function buildB50Stats(b50: PlayerScore[]): B50Stats {
  if (b50.length === 0) {
    return {
      count: 0,
      averageAchievements: 0,
      bestAchievements: 0,
      maxRating: 0,
      minRating: 0,
      minConstant: null,
      maxConstant: null,
    };
  }
  let sumAchievements = 0;
  let bestAchievements = 0;
  let maxRating = 0;
  let minRating = Infinity;
  let minConstant = Infinity;
  let maxConstant = 0;
  let hasConstant = false;
  for (const score of b50) {
    sumAchievements += score.achievements;
    bestAchievements = Math.max(bestAchievements, score.achievements);
    maxRating = Math.max(maxRating, score.rating);
    minRating = Math.min(minRating, score.rating);
    if (score.constant != null) {
      hasConstant = true;
      minConstant = Math.min(minConstant, score.constant);
      maxConstant = Math.max(maxConstant, score.constant);
    }
  }
  return {
    count: b50.length,
    averageAchievements: sumAchievements / b50.length,
    bestAchievements,
    maxRating,
    minRating,
    minConstant: hasConstant ? minConstant : null,
    maxConstant: hasConstant ? maxConstant : null,
  };
}

// Group B50 entries into chart-constant buckets: 13, 13+, 14, 14+, 15+.
// A constant like 13.7 falls into "13+", 14.0 into "14", 14.9 into "14+", etc.
function buildConstantDistribution(b50: PlayerScore[]): ConstantBucket[] {
  const buckets = new Map<number, { label: string; count: number }>();
  for (const score of b50) {
    if (score.constant == null) continue;
    const c = score.constant;
    // base is the integer floor; "plus" means fractional part >= 0.7.
    const base = Math.floor(c);
    const isPlus = c - base >= 0.7;
    const bucketValue = isPlus ? base + 0.7 : base;
    const label = isPlus ? `${base}+` : `${base}`;
    const entry = buckets.get(bucketValue) ?? { label, count: 0 };
    entry.count += 1;
    buckets.set(bucketValue, entry);
  }
  return [...buckets.entries()]
    .map(([value, entry]) => ({ value, label: entry.label, count: entry.count }))
    .sort((a, b) => a.value - b.value);
}

function heatmapToWeeks(heatmap: LxnsHeatmap): { total: number; weeks: SyncWeek[] } {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 52 * 7);

  const weeks: SyncWeek[] = [];
  let total = 0;
  for (let week = 0; week < 52; week++) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + day);
      const key = date.toISOString().slice(0, 10);
      const count = heatmap[key] ?? 0;
      total += count;
      days.push({ date: key, count });
    }
    weeks.push({ days });
  }
  return { total, weeks };
}

async function transformLxnsProfile(
  player: LxnsPlayer,
  bests: LxnsBests,
  allScoresRaw: LxnsScore[],
  heatmap: LxnsHeatmap | null,
  trend: LxnsTrendPoint[],
): Promise<PlayerProfile> {
  // Build the chart constant lookup map once (cached), so every score resolves
  // its precise constant instead of guessing from the "14+" level string.
  const constantMap = await getConstantMap();
  const toPlayerScore = (score: LxnsScore) => scoreToPlayerScore(score, constantMap);
  // B50 = best entries (used for featured scores + rating breakdown).
  const b50 = (await Promise.all([...bests.standard, ...bests.dx].map(toPlayerScore))).sort(
    (a, b) => b.rating - a.rating,
  );
  const featured = b50.slice(0, 6);
  const b50Stats = buildB50Stats(b50);
  const constantDistribution = buildConstantDistribution(b50);
  // Full score history = every chart the player has recorded. Used for the
  // quality / grade distribution stats so they reflect all play, not just B50.
  const allScores = await Promise.all(allScoresRaw.map(toPlayerScore));
  const gradeDistribution = buildGradeDistribution(allScores);
  const quality = computeQuality(allScores);
  const dxStarDistribution = buildDxStarDistribution(allScores);
  const levelPreferences = buildLevelPreferences(allScores);
  const oldB35 = bests.standard_total;
  const newB15 = bests.dx_total;
  const syncHeatmap = heatmap ? heatmapToWeeks(heatmap) : null;
  const ratingTrend: RatingTrendPoint[] = trend.map((p) => ({
    total: p.total,
    oldB35: p.standard_total,
    newB15: p.dx_total,
    date: typeof p.date === "number" ? new Date(p.date).toISOString() : p.date,
  }));

  return {
    identity: {
      name: normalizeUsername(player.name),
      friendCode: String(player.friend_code),
      avatarUrl: player.icon?.id
        ? `https://assets2.lxns.net/maimai/icon/${player.icon.id}.png`
        : "/favicon.svg",
      trophy: player.trophy?.name ?? null,
      courseRank: player.course_rank ?? null,
      star: player.star ?? null,
      rating: player.rating,
      lastSync: player.upload_time ?? null,
    },
    rating: { total: player.rating, oldB35, newB15 },
    ratingTrend,
    scores: featured,
    b50Count: b50.length,
    b50Stats,
    constantDistribution,
    totalScoreCount: allScores.length,
    quality,
    gradeDistribution,
    dxStarDistribution,
    levelPreferences,
    heatmap: syncHeatmap,
  };
}
