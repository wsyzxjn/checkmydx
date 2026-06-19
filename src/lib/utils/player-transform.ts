import type { PlayerProfile, SyncWeek } from "$lib/types/player";
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
