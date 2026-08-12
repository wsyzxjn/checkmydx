<script lang="ts">
  import type { PlayerScore } from "$lib/types/player";
  import {
    chartTypeLabel,
    formatAchievements,
    formatNumber,
    jacketUrl,
    levelColor,
  } from "$lib/utils/player-transform";
  import ScoreMarks from "$lib/components/portfolio/ScoreMarks.svelte";

  interface Props {
    score: PlayerScore;
    class?: string;
  }

  let { score, class: className = "" }: Props = $props();

  const accent = $derived(levelColor(score.difficulty, score.type));
  const cover = $derived(jacketUrl(score.id));
  const typeLabel = $derived(chartTypeLabel(score.type));
  let imgError = $state(false);

  const tooltip = $derived(
    [
      score.title,
      `${score.difficulty} ${typeLabel}`,
      `${score.grade} ${formatAchievements(score.achievements)}`,
      score.constant != null ? `定数 ${score.constant.toFixed(1)}` : null,
      `Rating ${score.rating}`,
    ]
      .filter(Boolean)
      .join(" · "),
  );
</script>

<div
  class="relative aspect-square overflow-hidden rounded-md bg-bg-tertiary {className}"
  style="box-shadow: inset 0 0 0 2px {accent}"
  title={tooltip}
>
  {#if imgError}
    <div class="flex h-full w-full items-center justify-center text-text-tertiary">
      <span class="px-1 text-center text-[10px] leading-tight">{score.title}</span>
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

  <div
    class="absolute left-1 top-1 rounded px-1 py-px text-[9px] font-bold text-white"
    style="background-color: {accent}"
  >
    {score.difficulty}
  </div>
  <div
    class="absolute right-1 top-1 rounded bg-black/60 px-1 py-px text-[9px] font-semibold text-white"
  >
    {typeLabel}
  </div>

  <div
    class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-1 pb-1 pt-5"
  >
    <div class="truncate text-[10px] font-bold text-white">
      {formatAchievements(score.achievements)}
    </div>
    <div class="mt-0.5 flex items-center justify-between gap-1">
      <ScoreMarks {score} size="xs" />
      <span class="shrink-0 text-[9px] font-semibold text-emerald-300"
        >{formatNumber(score.rating)}</span
      >
    </div>
  </div>
</div>
