<script lang="ts">
  import type { PlayerProfile } from "$lib/types/player";
  import ProfileSidebar from "$lib/components/portfolio/ProfileSidebar.svelte";
  import RatingTrend from "$lib/components/portfolio/RatingTrend.svelte";
  import ScoreQuality from "$lib/components/portfolio/ScoreQuality.svelte";
  import GradeDistribution from "$lib/components/portfolio/GradeDistribution.svelte";
  import ScoreAnalytics from "$lib/components/portfolio/ScoreAnalytics.svelte";
  import B50Stats from "$lib/components/portfolio/B50Stats.svelte";
  import ConstantDistribution from "$lib/components/portfolio/ConstantDistribution.svelte";
  import ScoreCard from "$lib/components/portfolio/ScoreCard.svelte";
  import Card from "$lib/components/ui/Card.svelte";

  interface Props {
    profile: PlayerProfile;
    class?: string;
    views?: number;
  }

  let { profile, class: className = "", views = 0 }: Props = $props();
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 {className}">
  <div class="flex flex-col gap-8 lg:flex-row">
    <!-- Sidebar -->
    <div class="w-full lg:sticky lg:top-24 lg:self-start lg:w-74 lg:shrink-0">
      <ProfileSidebar {profile} {views} />
    </div>

    <!-- Main content -->
    <div class="flex-1 space-y-6">
      <!-- Banner -->
      <Card variant="default" padding="lg">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-text-primary">
              {profile.identity.name} 的 DX 主页
            </h2>
            <p class="mt-1 text-sm text-text-secondary">
              Rating 趋势、成绩质量、评级分布、同步记录与代表成绩
            </p>
          </div>
          <div class="text-right text-xs text-text-tertiary">
            由 <span class="font-semibold text-accent-green">CheckMyDX</span> 生成
          </div>
        </div>
      </Card>

      <!-- Rating trend -->
      <RatingTrend {profile} />

      <!-- B50 overview -->
      <B50Stats {profile} />

      <!-- Score quality -->
      <ScoreQuality {profile} />

      <!-- Distribution charts -->
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

      <!-- Featured scores -->
      {#if profile.scores.length > 0}
        <div>
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
            <h3 class="text-lg font-semibold text-text-primary">代表成绩</h3>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            {#each profile.scores as score (score.id)}
              <ScoreCard {score} />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
