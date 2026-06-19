<script lang="ts">
  import type { PlayerScore } from "$lib/types/player";
  import { formatNumber, formatAchievements } from "$lib/utils/player-transform";
  import Badge from "$lib/components/ui/Badge.svelte";

  interface Props {
    score: PlayerScore;
    class?: string;
  }

  let { score, class: className = "" }: Props = $props();

  const typeLabel = $derived(score.type === "dx" ? "DX" : score.type === "utage" ? "宴" : "STD");
  // maimai jacket assets are keyed by songId % 10000 (version prefix stripped).
  const jacketUrl = $derived(`https://assets2.lxns.net/maimai/jacket/${score.id % 10000}.png`);
  let imgError = $state(false);
</script>

<div
  class="group flex gap-4 overflow-hidden rounded-md border border-border-default bg-bg-secondary p-4 transition-all hover:border-border-subtle hover:bg-bg-tertiary {className}"
>
  <!-- Jacket -->
  <div class="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-bg-tertiary">
    {#if imgError}
      <div class="flex h-full w-full items-center justify-center text-text-tertiary">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </div>
    {:else}
      <img
        src={jacketUrl}
        alt={score.title}
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover"
        onerror={() => (imgError = true)}
      />
    {/if}
  </div>

  <!-- Body -->
  <div class="flex min-w-0 flex-1 flex-col">
    <div class="flex items-start justify-between gap-2">
      <h3 class="truncate font-semibold text-text-primary">{score.title}</h3>
      {#if score.difficulty}
        <Badge
          variant="outline"
          size="sm"
          color={score.difficulty.includes("14+")
            ? "#ef4444"
            : score.difficulty.includes("14")
              ? "#f59e0b"
              : "#22c55e"}
          class="flex-shrink-0"
        >
          {score.difficulty}
        </Badge>
      {/if}
    </div>

    <!-- Grade + achievements -->
    <div class="mt-1 flex items-baseline gap-3">
      <span class="text-lg font-bold text-accent-yellow">{score.grade}</span>
      <span class="text-sm text-text-secondary">{formatAchievements(score.achievements)}</span>
    </div>

    <!-- Footer stats -->
    <div class="mt-auto flex items-center gap-4 pt-2 text-xs text-text-tertiary">
      {#if score.constant != null}
        <span class="flex items-center gap-1">
          定数 <span class="font-semibold text-text-secondary">{score.constant.toFixed(1)}</span>
        </span>
      {/if}
      <span class="flex items-center gap-1">
        Rating <span class="font-semibold text-accent-green">{formatNumber(score.rating)}</span>
      </span>
      <span class="ml-auto rounded bg-bg-tertiary px-1.5 py-0.5 text-[10px] text-text-secondary"
        >{typeLabel}</span
      >
    </div>
  </div>
</div>
