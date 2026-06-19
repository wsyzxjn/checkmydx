<script lang="ts">
  import type { PlayerProfile } from "$lib/types/player";
  import {
    formatNumber,
    formatSyncDate,
    courseRankLabel,
    totalSyncs,
  } from "$lib/utils/player-transform";
  import Badge from "$lib/components/ui/Badge.svelte";
  import RatingTrend from "$lib/components/portfolio/RatingTrend.svelte";
  import ScoreQuality from "$lib/components/portfolio/ScoreQuality.svelte";
  import GradeDistribution from "$lib/components/portfolio/GradeDistribution.svelte";
  import ScoreAnalytics from "$lib/components/portfolio/ScoreAnalytics.svelte";
  import ScoreCard from "$lib/components/portfolio/ScoreCard.svelte";

  interface Props {
    profile: PlayerProfile;
    class?: string;
    views?: number;
  }

  let { profile, class: className = "", views = 0 }: Props = $props();

  const course = $derived(courseRankLabel(profile.identity.courseRank));
  const syncs = $derived(totalSyncs(profile));
  const syncDate = $derived(formatSyncDate(profile.identity.lastSync));
</script>

<div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 {className}">
  <!-- Header -->
  <header class="mb-16 text-center">
    <img
      src={profile.identity.avatarUrl}
      alt={profile.identity.name}
      width="128"
      height="128"
      fetchpriority="high"
      decoding="async"
      class="mx-auto mb-6 h-32 w-32 rounded-full border-4 border-border-default object-cover"
    />
    <h1 class="text-4xl font-bold text-text-primary">{profile.identity.name}</h1>
    <p class="mt-2 text-xl text-text-secondary">{profile.identity.friendCode}</p>

    {#if course || profile.identity.star != null}
      <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
        {#if course}
          <Badge variant="solid" size="md" color="#3291FF">{course}</Badge>
        {/if}
        {#if profile.identity.star != null}
          <Badge variant="default" size="md">★ {formatNumber(profile.identity.star)}</Badge>
        {/if}
      </div>
    {/if}

    {#if profile.identity.trophy}
      <p class="mt-4 text-text-secondary">{profile.identity.trophy}</p>
    {/if}
  </header>

  <!-- Stats row -->
  <section class="mb-12">
    <div class="flex flex-wrap items-center justify-center gap-8 text-center">
      <div>
        <div class="text-3xl font-bold text-accent-green">{profile.identity.rating}</div>
        <div class="text-sm text-text-secondary">DX Rating</div>
      </div>
      <div class="h-12 w-px bg-border-default"></div>
      <div>
        <div class="text-3xl font-bold text-text-primary">{profile.b50Count}</div>
        <div class="text-sm text-text-secondary">B50 条目</div>
      </div>
      <div class="h-12 w-px bg-border-default"></div>
      <div>
        <div class="text-3xl font-bold text-accent-yellow">{formatNumber(syncs)}</div>
        <div class="text-sm text-text-secondary">同步次数</div>
      </div>
    </div>
  </section>

  <!-- Rating trend -->
  <section class="mb-16">
    <RatingTrend {profile} />
  </section>

  <!-- Score quality + grade distribution -->
  <section class="mb-16 space-y-6">
    <ScoreQuality {profile} />
    <div class="space-y-4">
      <div class="grid gap-4 lg:grid-cols-2">
        <GradeDistribution {profile} />
        <ScoreAnalytics {profile} mode="stars" />
      </div>
      <ScoreAnalytics {profile} mode="levels" />
    </div>
  </section>

  <!-- Featured scores -->
  {#if profile.scores.length > 0}
    <section class="mb-16">
      <h2
        class="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-text-tertiary"
      >
        代表成绩
      </h2>
      <div class="space-y-3">
        {#each profile.scores.slice(0, 4) as score (score.id)}
          <ScoreCard {score} />
        {/each}
      </div>
    </section>
  {/if}

  <!-- Footer -->
  <footer class="text-center text-sm text-text-tertiary">
    {#if syncDate}<p>{syncDate}</p>{/if}
    <p class="mt-2 text-text-secondary">
      <span class="font-semibold text-text-primary">{formatNumber(views)}</span> 次浏览
    </p>
  </footer>
</div>
