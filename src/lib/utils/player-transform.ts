import type {
  ChartType,
  FCType,
  FSType,
  PlayerProfile,
  PlayerScore,
  SyncWeek,
} from "$lib/types/player";
import { normalizeUsername } from "$lib/utils/username";

// Format an integer with thousands separators. Unlike the old GitHub star
// formatter, this never collapses to k/M — DX Rating and rating contributions
// are exact integers that should read in full.
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

// Format an achievement rate, e.g. 100.6234 -> "100.6234%".
export function formatAchievements(value: number): string {
  return `${value.toFixed(4)}%`;
}

// Format a sync timestamp, e.g. "2024-06-19T..." -> "2024年6月".
export function formatSyncDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `最近同步于 ${date.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })}`;
}

// maimai DX course rank (段位) id -> label.
const COURSE_RANK_LABELS = [
  "初段",
  "二段",
  "三段",
  "四段",
  "五段",
  "六段",
  "七段",
  "八段",
  "九段",
  "十段",
  "真初段",
  "真二段",
  "真三段",
  "真四段",
  "真五段",
  "真六段",
  "真七段",
  "真八段",
  "真九段",
  "真十段",
  "真皆传",
];

export function courseRankLabel(rank: number | null): string | null {
  if (rank == null || rank < 1 || rank > COURSE_RANK_LABELS.length) return null;
  return COURSE_RANK_LABELS[rank - 1];
}

// Total sync count over the heatmap window.
export function totalSyncs(profile: PlayerProfile): number {
  return profile.heatmap?.total ?? 0;
}

// Month labels for the heatmap header, aligned to week columns.
export function heatmapMonthLabels(weeks: SyncWeek[]): { label: string; col: number }[] {
  const months: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, index) => {
    const first = week.days[0];
    if (!first) return;
    const month = new Date(first.date).getMonth();
    if (month !== lastMonth) {
      months.push({
        label: new Date(first.date).toLocaleDateString("en-US", { month: "short" }),
        col: index,
      });
      lastMonth = month;
    }
  });
  return months;
}

// Heatmap color for a given count, theme-aware.
export function heatmapColor(count: number, isDark: boolean): string {
  if (count === 0) return isDark ? "#161b22" : "#ebedf0";
  if (count < 3) return isDark ? "#0e4429" : "#9be9a8";
  if (count < 6) return isDark ? "#006d32" : "#40c463";
  if (count < 10) return isDark ? "#26a641" : "#30a14e";
  return isDark ? "#39d353" : "#216e39";
}

// Stable key for a single chart score (song + chart type + level).
export function scoreKey(score: PlayerScore): string {
  return `${score.id}-${score.type}-${score.difficulty}`;
}

// Jacket assets are keyed by songId % 10000 (version prefix stripped).
export function jacketUrl(songId: number): string {
  return `https://assets2.lxns.net/maimai/jacket/${songId % 10000}.png`;
}

export function chartTypeLabel(type: ChartType): string {
  if (type === "dx") return "DX";
  if (type === "utage") return "宴";
  return "STD";
}

// Level-number colors for 13 / 13+ / 14 / 14+ / 15 style labels.
export function levelColor(level: string, type?: ChartType): string {
  if (type === "utage") return "#ec4899";
  const match = level.match(/(\d+)/);
  const n = match ? Number.parseInt(match[1], 10) : 0;
  const plus = level.includes("+");
  if (n >= 15) return "#ef4444";
  if (n === 14 && plus) return "#f97316";
  if (n === 14) return "#eab308";
  if (n === 13 && plus) return "#84cc16";
  if (n === 13) return "#22c55e";
  if (n === 12 && plus) return "#14b8a6";
  if (n === 12) return "#06b6d4";
  if (n >= 10) return "#3b82f6";
  return "#94a3b8";
}

const FC_LABELS: Record<Exclude<FCType, null>, string> = {
  app: "AP+",
  ap: "AP",
  fcp: "FC+",
  fc: "FC",
};

const FC_COLORS: Record<Exclude<FCType, null>, string> = {
  app: "#fbbf24",
  ap: "#f59e0b",
  fcp: "#4ade80",
  fc: "#22c55e",
};

const FS_LABELS: Record<Exclude<FSType, null>, string> = {
  fsdp: "FDX+",
  fsd: "FDX",
  fsp: "FS+",
  fs: "FS",
  sync: "SYNC",
};

const FS_COLORS: Record<Exclude<FSType, null>, string> = {
  fsdp: "#a78bfa",
  fsd: "#818cf8",
  fsp: "#38bdf8",
  fs: "#0ea5e9",
  sync: "#94a3b8",
};

export function fcLabel(fc: FCType): string | null {
  return fc ? FC_LABELS[fc] : null;
}

export function fcColor(fc: FCType): string {
  return fc ? FC_COLORS[fc] : "#94a3b8";
}

export function fsLabel(fs: FSType): string | null {
  return fs ? FS_LABELS[fs] : null;
}

export function fsColor(fs: FSType): string {
  return fs ? FS_COLORS[fs] : "#94a3b8";
}

export interface RatingTier {
  label: string;
  color: string;
  rainbow: boolean;
}

// maimai DX Rating color bands (PRiSM-era).
export function ratingTier(rating: number): RatingTier {
  if (rating >= 15000) return { label: "彩虹", color: "#f472b6", rainbow: true };
  if (rating >= 14500) return { label: "铂金", color: "#e2e8f0", rainbow: false };
  if (rating >= 14000) return { label: "金", color: "#fbbf24", rainbow: false };
  if (rating >= 13000) return { label: "银", color: "#cbd5e1", rainbow: false };
  if (rating >= 12000) return { label: "铜", color: "#d97706", rainbow: false };
  if (rating >= 10000) return { label: "紫", color: "#a78bfa", rainbow: false };
  if (rating >= 7000) return { label: "红", color: "#f87171", rainbow: false };
  if (rating >= 4000) return { label: "黄", color: "#facc15", rainbow: false };
  if (rating >= 2000) return { label: "绿", color: "#4ade80", rainbow: false };
  if (rating >= 1000) return { label: "蓝", color: "#38bdf8", rainbow: false };
  return { label: "白", color: "#e5e7eb", rainbow: false };
}

export interface HighlightScore {
  score: PlayerScore;
  label: string;
}

// Pick a small set of "story" scores instead of only the top-N by rating.
export function pickHighlightScores(scores: PlayerScore[], limit = 6): HighlightScore[] {
  const out: HighlightScore[] = [];
  const seen = new Set<string>();

  const add = (score: PlayerScore | undefined, label: string) => {
    if (!score || out.length >= limit) return;
    const key = scoreKey(score);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ score, label });
  };

  const byRating = [...scores].sort((a, b) => b.rating - a.rating);
  const byAchievements = [...scores].sort((a, b) => b.achievements - a.achievements);
  const byConstant = [...scores]
    .filter((score) => score.constant != null)
    .sort((a, b) => (b.constant ?? 0) - (a.constant ?? 0));
  const allPerfect = scores.find((score) => score.fc === "app" || score.fc === "ap");
  const fiveStar = [...scores]
    .filter((score) => (score.dxStar ?? 0) >= 5)
    .sort((a, b) => b.achievements - a.achievements)[0];
  const latest = [...scores]
    .filter((score) => score.timestamp)
    .sort((a, b) => Date.parse(scoreTimestamp(b)) - Date.parse(scoreTimestamp(a)))[0];

  add(byRating[0], "最高 Rating");
  add(byAchievements[0], "最高达成率");
  add(byConstant[0], "最高定数");
  add(allPerfect, "ALL PERFECT");
  add(fiveStar, "满 DX 星");
  add(latest, "最近游玩");

  for (const score of byRating) {
    add(score, "代表成绩");
  }

  return out;
}

function scoreTimestamp(score: PlayerScore): string {
  return score.timestamp ?? "";
}

export function highlightScores(profile: PlayerProfile, limit = 6): HighlightScore[] {
  const pool =
    profile.b35.length > 0 || profile.b15.length > 0
      ? [...profile.b35, ...profile.b15]
      : profile.scores;
  return pickHighlightScores(pool, limit);
}

// Generate a shareable profile URL with optional template/theme params.
export function generateShareUrl(
  username: string,
  options?: { template?: string; theme?: string },
): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const params = new URLSearchParams();
  if (options?.template) params.set("template", options.template);
  if (options?.theme) params.set("theme", options.theme);
  const queryString = params.toString();
  return `${baseUrl}/${encodeURIComponent(normalizeUsername(username))}${queryString ? `?${queryString}` : ""}`;
}
