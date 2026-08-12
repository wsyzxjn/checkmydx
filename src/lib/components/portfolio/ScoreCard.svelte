<script lang="ts">
  import type { PlayerScore } from "$lib/types/player";
  import {
    chartTypeLabel,
    formatAchievements,
    formatNumber,
    jacketUrl,
    levelColor,
  } from "$lib/utils/player-transform";
  import Badge from "$lib/components/ui/Badge.svelte";
  import ScoreMarks from "$lib/components/portfolio/ScoreMarks.svelte";

  interface Props {
    score: PlayerScore;
    highlight?: string;
    class?: string;
  }

  let { score, highlight, class: className = "" }: Props = $props();

  const typeLabel = $derived(chartTypeLabel(score.type));
  const cover = $derived(jacketUrl(score.id));
  const accent = $derived(levelColor(score.difficulty, score.type));
  let imgError = $state(false);
</script>

<div
  class="group flex gap-4 overflow-hidden rounded-md border border-border-default bg-bg-secondary p-4 transition-all hover:border-border-subtle hover:bg-bg-tertiary {className}"
  style="border-left: 3px solid {accent}"
>
  <!-- Jacket -->
  <div
    class="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-bg-tertiary"
    style="box-shadow: inset 0 0 0 2px {accent}"
  >
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
        src={cover}
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
      <div class="min-w-0">
        {#if highlight}
          <div class="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            {highlight}
          </div>
        {/if}
        <h3 class="truncate font-semibold text-text-primary">{score.title}</h3>
      </div>
      {#if score.difficulty}
        <Badge variant="outline" size="sm" color={accent} class="shrink-0">
          {score.difficulty}
        </Badge>
      {/if}
    </div>

    <!-- Grade + achievements -->
    <div class="mt-1 flex items-baseline gap-3">
      <span class="text-lg font-bold text-accent-yellow">{score.grade}</span>
      <span class="text-sm text-text-secondary">{formatAchievements(score.achievements)}</span>
    </div>

    <ScoreMarks {score} class="mt-1" />

    <!-- Footer stats -->
    <div
      class="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs text-text-tertiary"
    >
      {#if score.constant != null}
        <span>
          定数 <span class="font-semibold text-text-secondary">{score.constant.toFixed(1)}</span>
        </span>
      {/if}
      <span>
        Rating <span class="font-semibold text-accent-green">{formatNumber(score.rating)}</span>
      </span>
      {#if score.dxScore != null}
        <span>
          DX 分 <span class="font-semibold text-text-secondary">{formatNumber(score.dxScore)}</span>
        </span>
      {/if}
      <span class="ml-auto rounded bg-bg-tertiary px-1.5 py-0.5 text-[10px] text-text-secondary"
        >{typeLabel}</span
      >
    </div>
  </div>
</div>
