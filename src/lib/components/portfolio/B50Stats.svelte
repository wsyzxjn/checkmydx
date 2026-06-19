<script lang="ts">
  import type { PlayerProfile } from "$lib/types/player";
  import Card from "$lib/components/ui/Card.svelte";

  interface Props {
    profile: PlayerProfile;
    class?: string;
  }

  let { profile, class: className = "" }: Props = $props();

  const s = $derived(profile.b50Stats);

  // Format an achievement rate (e.g. 100.6234 -> "100.6234%").
  function formatAchievement(value: number): string {
    return `${value.toFixed(4)}%`;
  }

  // Format a constant range (e.g. 13.6 - 14.9 -> "13.6 ~ 14.9").
  function constantRange(): string {
    if (s.minConstant == null || s.maxConstant == null) return "—";
    return `${s.minConstant.toFixed(1)} ~ ${s.maxConstant.toFixed(1)}`;
  }

  const items = $derived([
    { label: "平均达成率", value: formatAchievement(s.averageAchievements), color: "#22c55e" },
    { label: "最高达成率", value: formatAchievement(s.bestAchievements), color: "#fbbf24" },
    {
      label: "Rating 区间",
      value: `${s.minRating.toFixed(1)} ~ ${s.maxRating.toFixed(1)}`,
      color: "#3b82f6",
    },
    { label: "定数范围", value: constantRange(), color: "#a78bfa" },
  ]);
</script>

<div class={className}>
  <div class="mb-4 flex items-center gap-2">
    <svg class="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
    <h3 class="text-lg font-semibold text-text-primary">B50 概览</h3>
  </div>

  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {#each items as item (item.label)}
      <Card variant="default" padding="md">
        <div class="flex flex-col items-center text-center">
          <span class="text-xl font-bold" style="color: {item.color}">{item.value}</span>
          <span class="mt-1 text-xs font-semibold text-text-primary">{item.label}</span>
        </div>
      </Card>
    {/each}
  </div>
</div>
