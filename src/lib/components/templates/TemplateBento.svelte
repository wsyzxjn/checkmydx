<script lang="ts">
	import type { PlayerProfile } from '$lib/types/player';
	import { formatNumber, courseRankLabel, classRankLabel, totalSyncs } from '$lib/utils/player-transform';
	import { heatmapColor } from '$lib/utils/player-transform';
	import { themeState } from '$lib/stores/theme.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import SyncHeatmap from '$lib/components/portfolio/SyncHeatmap.svelte';
	import RatingTrend from '$lib/components/portfolio/RatingTrend.svelte';
	import GradeDistribution from '$lib/components/portfolio/GradeDistribution.svelte';
	import ScoreCard from '$lib/components/portfolio/ScoreCard.svelte';

	interface Props {
		profile: PlayerProfile;
		class?: string;
		views?: number;
	}

	let { profile, class: className = '', views = 0 }: Props = $props();

	const course = $derived(courseRankLabel(profile.identity.courseRank));
	const classRank = $derived(classRankLabel(profile.identity.classRank));
	const syncs = $derived(totalSyncs(profile));
	const q = $derived(profile.quality);
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
							{#if classRank}
								<Badge variant="outline" size="sm">{classRank}</Badge>
							{/if}
							{#if profile.identity.star != null}
								<Badge variant="default" size="sm">★ {formatNumber(profile.identity.star)}</Badge>
							{/if}
						</div>
					</div>
				</div>

				{#if profile.identity.trophy}
					<p class="mt-4 flex-1 text-sm text-text-secondary">{profile.identity.trophy}</p>
				{:else}
					<div class="mt-4 flex-1"></div>
				{/if}

				<div class="mt-4 flex items-center gap-4 text-sm text-text-tertiary">
					<div class="flex items-center gap-1">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

		<!-- Sync count -->
		<Card variant="elevated" padding="lg">
			<div class="flex h-full flex-col items-center justify-center text-center">
				<div class="text-4xl font-bold text-accent-yellow">{formatNumber(syncs)}</div>
				<div class="mt-1 text-xs uppercase tracking-wider text-text-secondary">同步次数</div>
			</div>
		</Card>

		<!-- Score quality (AP/FC/FSD/FS) -->
		<Card variant="elevated" padding="lg">
			<div class="flex h-full flex-col justify-center">
				<div class="mb-2 text-xs uppercase tracking-wider text-text-secondary">成绩质量</div>
				<div class="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
					<span class="flex items-center justify-between"><span class="text-amber-400">AP</span><span class="font-semibold text-text-primary">{q.allPerfect}</span></span>
					<span class="flex items-center justify-between"><span class="text-green-500">FC</span><span class="font-semibold text-text-primary">{q.fullCombo}</span></span>
					<span class="flex items-center justify-between"><span class="text-blue-500">FSD</span><span class="font-semibold text-text-primary">{q.fullSyncDx}</span></span>
					<span class="flex items-center justify-between"><span class="text-cyan-500">FS</span><span class="font-semibold text-text-primary">{q.fullSync}</span></span>
				</div>
			</div>
		</Card>

		<!-- Grade distribution (full width) -->
		<div class="md:col-span-2 lg:col-span-4">
			<GradeDistribution {profile} />
		</div>

		<!-- Heatmap (full width) -->
		{#if profile.heatmap}
			<div class="md:col-span-2 lg:col-span-4">
				<SyncHeatmap {profile} />
			</div>
		{/if}

		<!-- Scores (full width) -->
		{#if profile.scores.length > 0}
			<div class="md:col-span-2 lg:col-span-4">
				<div class="mb-4 flex items-center gap-2">
					<svg class="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
					</svg>
					<h3 class="text-lg font-semibold text-text-primary">代表成绩</h3>
				</div>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each profile.scores.slice(0, 6) as score (score.id)}
						<ScoreCard {score} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
