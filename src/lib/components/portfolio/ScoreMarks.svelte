<script lang="ts">
  import type { PlayerScore } from "$lib/types/player";
  import { fcColor, fcLabel, fsColor, fsLabel } from "$lib/utils/player-transform";

  interface Props {
    score: PlayerScore;
    size?: "xs" | "sm";
    class?: string;
  }

  let { score, size = "sm", class: className = "" }: Props = $props();

  const fc = $derived(fcLabel(score.fc));
  const fs = $derived(fsLabel(score.fs));
  const stars = $derived(score.dxStar ?? 0);
  const textClass = $derived(
    size === "xs" ? "text-[9px] leading-none" : "text-[11px] leading-none",
  );
</script>

<div class="flex flex-wrap items-center gap-1 {className}">
  {#if fc}
    <span class="font-bold {textClass}" style="color: {fcColor(score.fc)}">{fc}</span>
  {/if}
  {#if fs}
    <span class="font-bold {textClass}" style="color: {fsColor(score.fs)}">{fs}</span>
  {/if}
  {#if stars > 0}
    <span class="font-semibold text-accent-yellow {textClass}" title="DX 星 {stars}">
      {size === "xs" ? `${stars}★` : "★".repeat(stars)}
    </span>
  {/if}
</div>
