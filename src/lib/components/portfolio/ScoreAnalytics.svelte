<script lang="ts">
  import type { PlayerProfile } from "$lib/types/player";
  import Card from "$lib/components/ui/Card.svelte";

  interface Props {
    profile: PlayerProfile;
    class?: string;
    mode?: "both" | "stars" | "levels";
  }

  let { profile, class: className = "", mode = "both" }: Props = $props();

  const starBuckets = $derived(profile.dxStarDistribution);
  const showStars = $derived(mode === "both" || mode === "stars");
  const showLevels = $derived(mode === "both" || mode === "levels");
  const starTotal = $derived(starBuckets.reduce((sum, bucket) => sum + bucket.count, 0));
  const levelByAverage = $derived(
    [...profile.levelPreferences]
      .sort((a, b) => b.averageAchievements - a.averageAchievements || b.count - a.count)
      .slice(0, 5),
  );
  const maxAverage = $derived(
    Math.max(1, ...levelByAverage.map((bucket) => bucket.averageAchievements)),
  );

  const starSize = 116;
  const starStrokeWidth = 18;
  const starRadius = (starSize - starStrokeWidth) / 2;
  const starCircumference = 2 * Math.PI * starRadius;
  const starColors: Record<number, string> = {
    5: "#fbbf24",
    4: "#f59e0b",
    3: "#38bdf8",
    2: "#22c55e",
    1: "#a78bfa",
    0: "#64748b",
  };

  const starSegments = $derived.by(() => {
    const out: Array<{ bucket: (typeof starBuckets)[number]; offset: number; color: string }> = [];
    let cumulative = 0;
    for (const bucket of starBuckets) {
      out.push({
        bucket,
        offset: cumulative,
        color: starColors[bucket.star] ?? "#94a3b8",
      });
      cumulative += bucket.percentage;
    }
    return out;
  });

  function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  function formatAchievement(value: number): string {
    return `${value.toFixed(4)}%`;
  }
</script>

<div
  class="{mode === 'both'
    ? 'grid gap-4 lg:grid-cols-[minmax(210px,0.8fr)_minmax(330px,1.2fr)]'
    : ''} {className}"
>
  {#if showStars}
    <Card variant="default" padding="md" class="h-full">
      <div class="mb-4">
        <h4 class="font-semibold text-text-primary">DX 星级占比</h4>
      </div>

      {#if starBuckets.length > 0}
        <div class="flex items-center gap-5">
          <div class="relative shrink-0">
            <svg width={starSize} height={starSize} class="-rotate-90">
              {#each starSegments as segment (segment.bucket.star)}
                <circle
                  cx={starSize / 2}
                  cy={starSize / 2}
                  r={starRadius}
                  fill="none"
                  stroke={segment.color}
                  stroke-width={starStrokeWidth}
                  stroke-dasharray="{(segment.bucket.percentage / 100) *
                    starCircumference} {starCircumference}"
                  stroke-dashoffset={-(segment.offset / 100) * starCircumference}
                  class="transition-all duration-300"
                />
              {/each}
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-lg font-bold text-text-primary">{starTotal}</span>
              <span class="text-[10px] text-text-tertiary">成绩</span>
            </div>
          </div>

          <div class="flex-1 space-y-2">
            {#each starBuckets as bucket (bucket.star)}
              <div
                class="grid grid-cols-[0.75rem_2.75rem_minmax(4.75rem,1fr)] items-center gap-2 text-sm"
              >
                <span
                  class="h-3 w-3 rounded-full"
                  style="background-color: {starColors[bucket.star] ?? '#94a3b8'}"
                ></span>
                <span class="font-semibold text-text-primary">{bucket.star} 星</span>
                <span class="whitespace-nowrap text-right text-text-secondary">
                  {bucket.count}
                  <span class="ml-1 text-text-tertiary">({formatPercent(bucket.percentage)})</span>
                </span>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="flex min-h-32 items-center justify-center text-sm text-text-tertiary">
          暂无 DX 星级数据
        </div>
      {/if}
    </Card>
  {/if}

  {#if showLevels}
    <Card variant="default" padding="md" class="h-full">
      <div class="mb-4">
        <h4 class="font-semibold text-text-primary">等级平均完成率排行</h4>
      </div>

      {#if levelByAverage.length > 0}
        <div class="space-y-3">
          {#each levelByAverage as bucket (bucket.level)}
            <div class="grid grid-cols-[4.25rem_minmax(0,1fr)_6.5rem] items-center gap-4 text-sm">
              <div class="font-semibold text-text-primary">{bucket.level}</div>
              <div class="h-2 overflow-hidden rounded-full bg-bg-tertiary">
                <div
                  class="h-full rounded-full bg-accent-blue"
                  style="width: {(bucket.averageAchievements / maxAverage) * 100}%"
                ></div>
              </div>
              <div class="whitespace-nowrap text-right font-semibold text-accent-green">
                {formatAchievement(bucket.averageAchievements)}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex min-h-32 items-center justify-center text-sm text-text-tertiary">
          暂无等级完成率数据
        </div>
      {/if}
    </Card>
  {/if}
</div>
