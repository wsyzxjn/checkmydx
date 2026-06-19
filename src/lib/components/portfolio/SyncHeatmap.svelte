<script lang="ts">
	import type { PlayerProfile } from '$lib/types/player';
	import { formatNumber, heatmapMonthLabels, heatmapColor } from '$lib/utils/player-transform';
	import { themeState } from '$lib/stores/theme.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	interface Props {
		profile: PlayerProfile;
		class?: string;
	}

	let { profile, class: className = '' }: Props = $props();

	const weeks = $derived(profile.heatmap?.weeks.slice(-52) ?? []);
	const total = $derived(profile.heatmap?.total ?? 0);
	const monthLabels = $derived(heatmapMonthLabels(weeks));

	const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
</script>

<div class="flex flex-col {className}">
	<div class="mb-4 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<svg class="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
			</svg>
			<h3 class="text-lg font-semibold text-text-primary">同步热力图</h3>
		</div>
		<div class="text-sm text-text-secondary">
			<span class="font-semibold text-text-primary">{formatNumber(total)}</span>
			<span class="ml-1">次同步（近一年）</span>
		</div>
	</div>

	<Card variant="default" padding="md">
		{#if profile.heatmap}
			<div class="w-full">
				<!-- Month labels -->
				<div class="mb-2 flex text-xs text-text-tertiary">
					<div class="w-8 shrink-0"></div>
					<div class="flex flex-1 justify-between gap-0.5">
						{#each weeks as _, i}
							<div class="relative min-w-0 flex-1">
								{#each monthLabels as month}
									{#if month.col === i}
										<span class="absolute bottom-0 left-0 truncate text-[10px]">{month.label}</span>
									{/if}
								{/each}
							</div>
						{/each}
					</div>
				</div>

				<!-- Grid -->
				<div class="flex w-full gap-2">
					<div class="flex w-8 shrink-0 flex-col gap-0.5">
						{#each dayLabels as label}
							<div class="flex flex-1 items-center justify-end text-[10px] leading-none text-text-tertiary">
								<span class="mr-1">{label}</span>
							</div>
						{/each}
					</div>
					<div class="flex flex-1 justify-between gap-0.5">
						{#each weeks as week}
							<div class="flex min-w-0 flex-1 flex-col gap-0.5">
								{#each week.days as day}
									<div
										class="aspect-square w-full rounded-sm transition-opacity hover:opacity-80"
										style="background-color: {heatmapColor(day.count, themeState.isDark)}"
										title="{new Date(day.date).toLocaleDateString('zh-CN')} 同步 {day.count} 条"
									></div>
								{/each}
							</div>
						{/each}
					</div>
				</div>

				<div class="mt-4 text-xs text-text-tertiary">最近 52 周的成绩同步记录</div>
			</div>
		{:else}
			<div class="flex h-32 items-center justify-center text-sm text-text-tertiary">
				<div class="text-center">
					<svg class="mx-auto mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
					<p>暂无同步热力图</p>
					<p class="mt-1 text-[10px]">授权 LXNS 历史数据后可显示完整活动</p>
				</div>
			</div>
		{/if}
	</Card>
</div>
