<script lang="ts">
  import type { PlayerProfile, GradeBucket } from "$lib/types/player";
  import Card from "$lib/components/ui/Card.svelte";

  interface Props {
    profile: PlayerProfile;
    class?: string;
  }

  let { profile, class: className = "" }: Props = $props();

  const buckets = $derived(profile.gradeDistribution);
  // Total across the shown (S and above) buckets — basis for legend %.
  const shownTotal = $derived(buckets.reduce((sum, b) => sum + b.count, 0) || 1);
  // All recorded scores — shown in the donut center.
  const total = $derived(profile.totalScoreCount);

  // Donut chart geometry.
  const size = 120;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = $derived.by(() => {
    const out: Array<{ bucket: GradeBucket; offset: number; percentage: number }> = [];
    let cumulative = 0;
    for (const bucket of buckets) {
      const percentage = (bucket.count / shownTotal) * 100;
      out.push({ bucket, offset: cumulative, percentage });
      cumulative += percentage;
    }
    return out;
  });
</script>

<div class={className}>
  <Card variant="default" padding="md" class="h-full">
    <div class="mb-4 flex items-center gap-2">
      <svg class="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
        />
      </svg>
      <h3 class="font-semibold text-text-primary">评级分布</h3>
    </div>

    {#if buckets.length > 0}
      <div class="flex items-center gap-4">
        <!-- Donut -->
        <div class="relative shrink-0">
          <svg width={size} height={size} class="-rotate-90">
            {#each segments as segment (segment.bucket.name)}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.bucket.color}
                stroke-width={strokeWidth}
                stroke-dasharray="{(segment.percentage / 100) * circumference} {circumference}"
                stroke-dashoffset={-(segment.offset / 100) * circumference}
                class="transition-all duration-300"
              />
            {/each}
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-lg font-bold text-text-primary">{total}</span>
            <span class="text-[10px] text-text-tertiary">成绩总数</span>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex-1 space-y-2">
          {#each buckets as bucket (bucket.name)}
            <div
              class="grid grid-cols-[0.75rem_2.5rem_minmax(4.25rem,1fr)] items-center gap-2 text-sm"
            >
              <span class="h-3 w-3 rounded-full" style="background-color: {bucket.color}"></span>
              <span class="font-medium text-text-primary">{bucket.name}</span>
              <span class="whitespace-nowrap text-right text-text-secondary">
                {bucket.count} 条
                <span class="ml-1 text-text-tertiary"
                  >({((bucket.count / shownTotal) * 100).toFixed(0)}%)</span
                >
              </span>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="flex w-full items-center justify-center py-4 text-sm text-text-tertiary">
        暂无评级分布数据
      </div>
    {/if}
  </Card>
</div>
