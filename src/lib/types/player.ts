// maimai DX player profile domain types
//
// This is the internal model produced by the mock adapter (server/maimai.ts)
// and the 落雪咖啡屋 OAuth adapter (client/lxns.ts), and consumed by the templates.
// It reflects what the data source actually returns — no GitHub-shaped
// vestiges, no fields we can't populate.

/** Difficulty/type of a chart. */
export type ChartType = "standard" | "dx" | "utage";

/** FULL COMBO type (ap+/ap/fc+/fc), null when not achieved. */
export type FCType = "app" | "ap" | "fcp" | "fc" | null;

/** FULL SYNC type (fsd+/fsd/fs+/fs/sync), null when not achieved. */
export type FSType = "fsdp" | "fsd" | "fsp" | "fs" | "sync" | null;

/** A single best-50 entry. */
export interface PlayerScore {
  /** Song id from the data source. */
  id: number;
  /** Song title. */
  title: string;
  /** Chart difficulty label, e.g. 'MASTER', 'RE:MASTER', or the level string. */
  difficulty: string;
  /** Chart constant, e.g. 13.6. Null when the source doesn't expose it. */
  constant: number | null;
  /** Achievement rate, e.g. 100.6234 (%). */
  achievements: number;
  /** Grade label, e.g. 'SSS+'. */
  grade: string;
  /** Single-chart rating contribution. */
  rating: number;
  /** DX score (notes hit on the DX distribution). */
  dxScore: number | null;
  /** standard / dx / utage. */
  type: ChartType;
  /** FULL COMBO type, null when not achieved. */
  fc: FCType;
  /** FULL SYNC type, null when not achieved. */
  fs: FSType;
  /** DX star (0-5), null when unavailable. */
  dxStar: number | null;
  /** ISO timestamp of when the score was last uploaded/played. */
  timestamp: string | null;
}

/** Achievement-quality aggregates over the B50. */
export interface ScoreQuality {
  /** ALL PERFECT count (ap+ and ap). */
  allPerfect: number;
  /** FULL COMBO count (fc+ and fc, excluding AP). */
  fullCombo: number;
  /** FULL SYNC DX count (fsd+ and fsd). */
  fullSyncDx: number;
  /** FULL SYNC count (fs+ and fs, excluding FSD). */
  fullSync: number;
}

/** One bucket in the grade distribution. */
export interface GradeBucket {
  /** Grade label, e.g. 'SSS+', 'SSS'. */
  name: string;
  /** Number of B50 entries at this grade. */
  count: number;
  /** Display color. */
  color: string;
}

/** One bucket in the DX star distribution. */
export interface DxStarBucket {
  /** DX star value, 0-5. */
  star: number;
  /** Number of recorded scores with this star value. */
  count: number;
  /** Percentage among scores that expose DX star. */
  percentage: number;
}

/** Level preference and achievement summary for one chart level. */
export interface LevelPreferenceBucket {
  /** Chart level label, e.g. '13+', '14', '14+'. */
  level: string;
  /** Number of recorded scores at this level. */
  count: number;
  /** Percentage among all recorded scores. */
  percentage: number;
  /** Average achievement rate at this level. */
  averageAchievements: number;
  /** Best achievement rate at this level. */
  bestAchievements: number;
}

/** One day of the sync heatmap. */
export interface SyncDay {
  date: string;
  count: number;
}

/** One week column of the sync heatmap. */
export interface SyncWeek {
  days: SyncDay[];
}

/** Rating breakdown — how the DX Rating is composed. */
export interface RatingBreakdown {
  /** Total DX Rating (= oldB35 + newB15). */
  total: number;
  /** Sum of the old/standard Best 35 contribution. */
  oldB35: number;
  /** Sum of the new/DX Best 15 contribution. */
  newB15: number;
}

/** One point on the rating-over-time trend. */
export interface RatingTrendPoint {
  /** Total DX Rating at this point. */
  total: number;
  /** Old/standard (B35) contribution. */
  oldB35: number;
  /** New/DX (B15) contribution. */
  newB15: number;
  /** ISO date string. */
  date: string;
}

/** Aggregate overview of the player's Best 50 entries. */
export interface B50Stats {
  /** Number of B50 entries (<= 50). */
  count: number;
  /** Average achievement rate across B50. */
  averageAchievements: number;
  /** Highest single-chart achievement rate in B50. */
  bestAchievements: number;
  /** Highest single-chart rating contribution in B50. */
  maxRating: number;
  /** Lowest single-chart rating contribution in B50. */
  minRating: number;
  /** Lowest chart constant in B50, null when constants unavailable. */
  minConstant: number | null;
  /** Highest chart constant in B50, null when constants unavailable. */
  maxConstant: number | null;
}

/** One bucket in the chart-constant distribution of the B50. */
export interface ConstantBucket {
  /** Constant label, e.g. '13', '13+', '14', '14+', '15'. */
  label: string;
  /** Numeric lower bound of the bucket (13, 13.7, 14, 14.7, 15). */
  value: number;
  /** Number of B50 entries in this bucket. */
  count: number;
}

/** Core player identity. */
export interface PlayerIdentity {
  /** Display name. */
  name: string;
  /** Friend code (used in the route). */
  friendCode: string;
  /** Avatar URL. */
  avatarUrl: string;
  /** Player trophy/title, if available. */
  trophy: string | null;
  /** Course rank (段位) id, if available. */
  courseRank: number | null;
  /** Star count (星级), if available. */
  star: number | null;
  /** DX Rating. */
  rating: number;
  /** ISO timestamp of the most recent data sync. */
  lastSync: string | null;
}

/** The normalized profile consumed by all templates. */
export interface PlayerProfile {
  identity: PlayerIdentity;
  rating: RatingBreakdown;
  /** Rating-over-time trend derived from synced score history. May be empty. */
  ratingTrend: RatingTrendPoint[];
  /** Featured highlight scores (highest rating / AP / etc.). */
  scores: PlayerScore[];
  /** Best 35 from older-version charts, sorted desc by rating. */
  b35: PlayerScore[];
  /** Best 15 from current-version charts, sorted desc by rating. */
  b15: PlayerScore[];
  /** B50 entry count (<= 50). */
  b50Count: number;
  /** Aggregate overview of the Best 50 entries. */
  b50Stats: B50Stats;
  /** Chart-constant distribution of the Best 50 entries. */
  constantDistribution: ConstantBucket[];
  /** Total recorded score count across all charts (used for full-play stats). */
  totalScoreCount: number;
  /** Achievement-quality aggregates (FC/FS/AP counts) over all recorded scores. */
  quality: ScoreQuality;
  /** Grade distribution of all recorded scores (best grades first). */
  gradeDistribution: GradeBucket[];
  /** DX star distribution of all recorded scores that expose DX star. */
  dxStarDistribution: DxStarBucket[];
  /** Level preference and completion-rate summary over all recorded scores. */
  levelPreferences: LevelPreferenceBucket[];
  /** Sync heatmap over the last 52 weeks, or null if unavailable. */
  heatmap: { total: number; weeks: SyncWeek[] } | null;
}

/** Result wrapper shared by adapters. */
export type PlayerResult =
  | { success: true; data: PlayerProfile }
  | {
      success: false;
      error: { type: "NOT_FOUND" | "RATE_LIMIT" | "UNAUTHORIZED" | "UNKNOWN"; message: string };
    };
