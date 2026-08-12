<script lang="ts">
  import type { PlayerProfile } from "$lib/types/player";
  import {
    courseRankLabel,
    formatNumber,
    formatSyncDate,
    ratingTier,
  } from "$lib/utils/player-transform";
  import Badge from "$lib/components/ui/Badge.svelte";

  interface Props {
    profile: PlayerProfile;
    views?: number;
    class?: string;
  }

  let { profile, views = 0, class: className = "" }: Props = $props();

  const course = $derived(courseRankLabel(profile.identity.courseRank));
  const syncDate = $derived(formatSyncDate(profile.identity.lastSync));
  const tier = $derived(ratingTier(profile.identity.rating));
  const ratingTotal = $derived(Math.max(1, profile.rating.oldB35 + profile.rating.newB15));
  const b35Pct = $derived((profile.rating.oldB35 / ratingTotal) * 100);
  const b15Pct = $derived((profile.rating.newB15 / ratingTotal) * 100);
</script>

<aside class="flex flex-col gap-4 items-center text-center {className}">
  <!-- Avatar -->
  <img
    src={profile.identity.avatarUrl}
    alt={profile.identity.name}
    width="128"
    height="128"
    fetchpriority="high"
    decoding="async"
    class="h-32 w-32 rounded-full border-4 border-border-default bg-bg-tertiary object-cover"
  />

  <!-- Name & friend code -->
  <div class="space-y-1">
    <h1 class="text-2xl font-semibold text-text-primary">
      {profile.identity.name}
    </h1>
    <p class="text-base text-text-secondary">
      好友码 {profile.identity.friendCode}
    </p>
  </div>

  <!-- Rank badges -->
  <div class="flex flex-wrap justify-center gap-2">
    {#if course}
      <Badge variant="solid" size="sm" color="#3291FF">{course}</Badge>
    {/if}
    {#if profile.identity.star != null}
      <Badge variant="default" size="sm">★ {formatNumber(profile.identity.star)}</Badge>
    {/if}
    <Badge variant="outline" size="sm" color={tier.color}>{tier.label}</Badge>
  </div>

  <!-- Trophy -->
  {#if profile.identity.trophy}
    <p class="text-sm text-text-secondary">{profile.identity.trophy}</p>
  {/if}

  <!-- Headline rating -->
  <div class="w-full rounded-md border border-border-default bg-bg-secondary p-4">
    <div
      class="flex items-center justify-between text-xs uppercase tracking-wider text-text-tertiary"
    >
      <span>DX Rating</span>
      <span class="normal-case tracking-normal" style="color: {tier.color}">{tier.label}</span>
    </div>
    <div
      class="mt-1 text-4xl font-bold {tier.rainbow ? 'rating-rainbow' : ''}"
      style={tier.rainbow ? undefined : `color: ${tier.color}`}
    >
      {profile.identity.rating}
    </div>
    <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
      <div class="flex h-full w-full">
        <div class="h-full bg-sky-400" style="width: {b35Pct}%"></div>
        <div class="h-full bg-violet-400" style="width: {b15Pct}%"></div>
      </div>
    </div>
    <div class="mt-2 flex justify-between text-xs text-text-primary">
      <span>B35 {formatNumber(profile.rating.oldB35)}</span>
      <span>B15 {formatNumber(profile.rating.newB15)}</span>
    </div>
  </div>

  <!-- Meta -->
  <div class="space-y-2 text-sm text-text-secondary">
    {#if syncDate}
      <div class="flex items-center justify-center gap-2">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>{syncDate}</span>
      </div>
    {/if}
    <div class="flex items-center justify-center gap-2">
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
      <span><span class="font-semibold text-text-primary">{formatNumber(views)}</span> 次浏览</span>
    </div>
  </div>
</aside>
