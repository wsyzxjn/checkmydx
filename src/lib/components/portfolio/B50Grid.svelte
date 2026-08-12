<script lang="ts">
  import type { PlayerProfile } from "$lib/types/player";
  import { formatNumber, scoreKey } from "$lib/utils/player-transform";
  import ScoreTile from "$lib/components/portfolio/ScoreTile.svelte";

  interface Props {
    profile: PlayerProfile;
    class?: string;
  }

  let { profile, class: className = "" }: Props = $props();

  const b35 = $derived([...profile.b35].sort((a, b) => b.rating - a.rating));
  const b15 = $derived([...profile.b15].sort((a, b) => b.rating - a.rating));
  const hasB50 = $derived(b35.length > 0 || b15.length > 0);
</script>

<div class={className}>
  <div class="mb-4 flex items-center gap-2">
    <svg class="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
    <h3 class="text-lg font-semibold text-text-primary">Best 50</h3>
    <span class="text-sm text-text-tertiary">{profile.b50Count} 条</span>
  </div>

  {#if hasB50}
    <div class="space-y-6">
      {#if b35.length > 0}
        <section>
          <div class="mb-3 flex items-baseline justify-between gap-2">
            <h4 class="text-sm font-semibold text-text-primary">B35 旧曲</h4>
            <span class="text-xs text-text-tertiary">
              Rating {formatNumber(profile.rating.oldB35)} · {b35.length} 条
            </span>
          </div>
          <div class="grid grid-cols-5 gap-1.5 sm:grid-cols-5 md:grid-cols-7">
            {#each b35 as score (scoreKey(score))}
              <ScoreTile {score} />
            {/each}
          </div>
        </section>
      {/if}

      {#if b15.length > 0}
        <section>
          <div class="mb-3 flex items-baseline justify-between gap-2">
            <h4 class="text-sm font-semibold text-text-primary">B15 新曲</h4>
            <span class="text-xs text-text-tertiary">
              Rating {formatNumber(profile.rating.newB15)} · {b15.length} 条
            </span>
          </div>
          <div class="grid grid-cols-5 gap-1.5 sm:grid-cols-5 md:grid-cols-5">
            {#each b15 as score (scoreKey(score))}
              <ScoreTile {score} />
            {/each}
          </div>
        </section>
      {/if}
    </div>
  {:else}
    <div
      class="rounded-md border border-border-default bg-bg-secondary py-10 text-center text-sm text-text-tertiary"
    >
      暂无 B50 成绩
    </div>
  {/if}
</div>
