<script lang="ts">
  import type { PlayerProfile } from "$lib/types/player";
  import Card from "$lib/components/ui/Card.svelte";

  interface Props {
    profile: PlayerProfile;
    class?: string;
  }

  let { profile, class: className = "" }: Props = $props();

  const q = $derived(profile.quality);
  const total = $derived(profile.totalScoreCount || 1);

  const pct = (n: number) => ((n / total) * 100).toFixed(1) + "%";

  const items = $derived([
    { label: "ALL PERFECT", value: q.allPerfect, color: "#fbbf24" },
    { label: "FULL COMBO", value: q.fullCombo, color: "#22c55e" },
    { label: "FULL SYNC DX", value: q.fullSyncDx, color: "#3b82f6" },
    { label: "FULL SYNC", value: q.fullSync, color: "#06b6d4" },
  ]);
</script>

<div class={className}>
  <div class="mb-4 flex items-center gap-2">
    <svg class="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
    <h3 class="text-lg font-semibold text-text-primary">成绩质量</h3>
  </div>

  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {#each items as item (item.label)}
      <Card variant="default" padding="md">
        <div class="flex flex-col items-center text-center">
          <span class="text-3xl font-bold" style="color: {item.color}">{item.value}</span>
          <span class="mt-1 text-xs font-semibold text-text-primary">{item.label}</span>
          <span class="mt-1 text-xs text-text-secondary">{pct(item.value)}</span>
        </div>
      </Card>
    {/each}
  </div>
</div>
