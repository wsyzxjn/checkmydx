<script lang="ts">
  import type { PlayerProfile } from "$lib/types/player";
  import Card from "$lib/components/ui/Card.svelte";

  interface Props {
    profile: PlayerProfile;
    class?: string;
  }

  let { profile, class: className = "" }: Props = $props();

  const buckets = $derived([...profile.constantDistribution].sort((a, b) => b.count - a.count));
  const maxCount = $derived(Math.max(1, ...buckets.map((b) => b.count)));
  const total = $derived(buckets.reduce((sum, b) => sum + b.count, 0));

  // Color by constant value: higher constants get warmer colors.
  function bucketColor(value: number): string {
    if (value >= 15) return "#ef4444";
    if (value >= 14.7) return "#f59e0b";
    if (value >= 14) return "#22c55e";
    if (value >= 13.7) return "#06b6d4";
    return "#6366f1";
  }
</script>

<div class={className}>
  <Card variant="default" padding="md" class="h-full">
    <div class="mb-4">
      <h4 class="font-semibold text-text-primary">B50 定数分布</h4>
    </div>

    {#if buckets.length > 0}
      <div class="space-y-3">
        {#each buckets as bucket (bucket.label)}
          <div class="grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-4 text-sm">
            <div class="font-semibold text-text-primary">{bucket.label}</div>
            <div class="h-2 overflow-hidden rounded-full bg-bg-tertiary">
              <div
                class="h-full rounded-full transition-all duration-300"
                style="width: {(bucket.count / maxCount) * 100}%; background-color: {bucketColor(
                  bucket.value,
                )}"
              ></div>
            </div>
            <div class="whitespace-nowrap text-right font-semibold text-text-primary">
              {bucket.count}
              <span class="ml-1 text-xs text-text-tertiary">
                ({((bucket.count / total) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex min-h-32 items-center justify-center text-sm text-text-tertiary">
        暂无定数分布数据
      </div>
    {/if}
  </Card>
</div>
