<script lang="ts">
  import type { PlayerProfile } from "$lib/types/player";
  import {
    courseRankLabel,
    formatNumber,
    highlightScores,
    ratingTier,
    scoreKey,
    totalSyncs,
  } from "$lib/utils/player-transform";
  import Card from "$lib/components/ui/Card.svelte";
  import Badge from "$lib/components/ui/Badge.svelte";
  import RatingTrend from "$lib/components/portfolio/RatingTrend.svelte";
  import SyncHeatmap from "$lib/components/portfolio/SyncHeatmap.svelte";
  import GradeDistribution from "$lib/components/portfolio/GradeDistribution.svelte";
  import ScoreAnalytics from "$lib/components/portfolio/ScoreAnalytics.svelte";
  import B50Stats from "$lib/components/portfolio/B50Stats.svelte";
  import B50Grid from "$lib/components/portfolio/B50Grid.svelte";
  import ConstantDistribution from "$lib/components/portfolio/ConstantDistribution.svelte";
  import ScoreCard from "$lib/components/portfolio/ScoreCard.svelte";

  interface Props {
    profile: PlayerProfile;
    class?: string;
    views?: number;
  }

  let { profile, class: className = "", views = 0 }: Props = $props();

  const course = $derived(courseRankLabel(profile.identity.courseRank));
  const syncs = $derived(totalSyncs(profile));
  const q = $derived(profile.quality);
  const tier = $derived(ratingTier(profile.identity.rating));
  const highlights = $derived(highlightScores(profile, 6));
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 {className}">
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <!-- Profile card (2x2) -->
    <Card variant="elevated" padding="lg" class="md:col-span-2 md:row-span-2">
      <div class="flex h-full flex-col">
        <div class="flex items-start gap-4">
          <img
            src={profile.identity.avatarUrl}
            alt={profile.identity.name}
            width="80"
            height="80"
            fetchpriority="high"
            decoding="async"
            class="h-20 w-20 rounded-full border-2 border-border-default object-cover"
          />
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-text-primary">{profile.identity.name}</h1>
            <p class="text-text-secondary">{profile.identity.friendCode}</p>
            <div class="mt-2 flex flex-wrap gap-2">
              {#if course}
                <Badge variant="solid" size="sm" color="#3291FF">{course}</Badge>
              {/if}
              {#if profile.identity.star != null}
                <Badge variant="default" size="sm">★ {formatNumber(profile.identity.star)}</Badge>
              {/if}
              <Badge variant="outline" size="sm" color={tier.color}>{tier.label}</Badge>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <div class="text-xs uppercase tracking-wider text-text-tertiary">DX Rating</div>
          <div
            class="mt-1 text-4xl font-bold {tier.rainbow ? 'rating-rainbow' : ''}"
            style={tier.rainbow ? undefined : `color: ${tier.color}`}
          >
            {profile.identity.rating}
          </div>
          <div class="mt-1 text-xs text-text-secondary">
            B35 {formatNumber(profile.rating.oldB35)} · B15 {formatNumber(profile.rating.newB15)}
          </div>
        </div>

        {#if profile.identity.trophy}
          <p class="mt-4 flex-1 text-sm text-text-secondary">{profile.identity.trophy}</p>
        {:else}
          <div class="mt-4 flex-1"></div>
        {/if}

        <div class="mt-4 flex items-center gap-4 text-sm text-text-tertiary">
          <div class="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span class="font-semibold text-text-primary">{formatNumber(views)}</span>
          </div>
          <span>·</span>
          <span>B50 {profile.b50Count} 条</span>
        </div>
      </div>
    </Card>

    <!-- Rating trend (2 cols) -->
    <div class="md:col-span-2">
      <RatingTrend {profile} />
    </div>

    <!-- B50 overview (2 cols) -->
    <div class="md:col-span-2">
      <B50Stats {profile} />
    </div>

    <!-- Sync count -->
    <Card variant="elevated" padding="lg">
      <div class="flex h-full flex-col items-center justify-center text-center">
        <div class="text-4xl font-bold text-accent-yellow">{formatNumber(syncs)}</div>
        <div class="mt-1 text-xs uppercase tracking-wider text-text-secondary">同步次数</div>
      </div>
    </Card>

    <!-- Score quality -->
    <Card variant="elevated" padding="lg">
      <div class="flex h-full flex-col justify-center">
        <div class="mb-2 text-xs uppercase tracking-wider text-text-secondary">成绩质量</div>
        <div class="grid gap-y-1 text-xs">
          <span class="flex items-center justify-between gap-3"
            ><span class="text-amber-400">ALL PERFECT</span><span
              class="font-semibold text-text-primary">{q.allPerfect}</span
            ></span
          >
          <span class="flex items-center justify-between gap-3"
            ><span class="text-green-500">FULL COMBO</span><span
              class="font-semibold text-text-primary">{q.fullCombo}</span
            ></span
          >
          <span class="flex items-center justify-between gap-3"
            ><span class="text-blue-500">FULL SYNC DX</span><span
              class="font-semibold text-text-primary">{q.fullSyncDx}</span
            ></span
          >
          <span class="flex items-center justify-between gap-3"
            ><span class="text-cyan-500">FULL SYNC</span><span
              class="font-semibold text-text-primary">{q.fullSync}</span
            ></span
          >
        </div>
      </div>
    </Card>

    <!-- Heatmap (full width) -->
    <div class="md:col-span-2 lg:col-span-4">
      <SyncHeatmap {profile} />
    </div>

    <!-- B50 jackets (full width) -->
    <div class="md:col-span-2 lg:col-span-4">
      <B50Grid {profile} />
    </div>

    <!-- Distribution charts (full width) -->
    <div class="md:col-span-2 lg:col-span-4">
      <div class="space-y-4">
        <div class="grid gap-4 lg:grid-cols-2">
          <GradeDistribution {profile} />
          <ConstantDistribution {profile} />
        </div>
        <div class="grid gap-4 lg:grid-cols-2">
          <ScoreAnalytics {profile} mode="stars" />
          <ScoreAnalytics {profile} mode="levels" />
        </div>
      </div>
    </div>

    <!-- Highlights (full width) -->
    {#if highlights.length > 0}
      <div class="md:col-span-2 lg:col-span-4">
        <div class="mb-4 flex items-center gap-2">
          <svg
            class="h-5 w-5 text-text-tertiary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h3 class="text-lg font-semibold text-text-primary">高光成绩</h3>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each highlights as item (scoreKey(item.score))}
            <ScoreCard score={item.score} highlight={item.label} />
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
