<script lang="ts">
	import type { PlayerProfile, RatingTrendPoint } from '$lib/types/player';
	import Card from '$lib/components/ui/Card.svelte';

	interface Props {
		profile: PlayerProfile;
		class?: string;
	}

	let { profile, class: className = '' }: Props = $props();

	const trend = $derived(profile.ratingTrend);

	// Chart geometry.
	const width = 640;
	const height = 200;
	const padding = { top: 16, right: 16, bottom: 28, left: 44 };
	const plotW = $derived(width - padding.left - padding.right);
	const plotH = $derived(height - padding.top - padding.bottom);

	// Y domain padded a touch so the line isn't flush against the edges.
	const yDomain = $derived.by(() => {
		if (trend.length === 0) return { min: 0, max: 1 };
		const values = trend.map((p) => p.total);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const pad = Math.max(10, (max - min) * 0.15);
		return { min: Math.floor(min - pad), max: Math.ceil(max + pad) };
	});

	function x(i: number): number {
		if (trend.length <= 1) return padding.left;
		return padding.left + (i / (trend.length - 1)) * plotW;
	}

	function y(value: number): number {
		const { min, max } = yDomain;
		const range = max - min || 1;
		return padding.top + (1 - (value - min) / range) * plotH;
	}

	// Area + line path strings.
	const linePath = $derived.by(() => {
		if (trend.length === 0) return '';
		return trend.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.total)}`).join(' ');
	});

	const areaPath = $derived.by(() => {
		if (trend.length === 0) return '';
		const baseY = padding.top + plotH;
		const top = trend.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.total)}`).join(' ');
		const last = x(trend.length - 1);
		const first = x(0);
		return `${top} L ${last} ${baseY} L ${first} ${baseY} Z`;
	});

	// ~4 y-axis ticks.
	const yTicks = $derived.by(() => {
		const { min, max } = yDomain;
		const ticks: number[] = [];
		const steps = 4;
		for (let i = 0; i <= steps; i++) {
			ticks.push(Math.round(min + ((max - min) * i) / steps));
		}
		return ticks;
	});

	// X labels: first / middle / last date.
	const xLabels = $derived.by(() => {
		if (trend.length === 0) return [];
		const indices = [0, Math.floor((trend.length - 1) / 2), trend.length - 1];
		return indices.map((i) => ({
			i,
			label: new Date(trend[i].date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
		}));
	});

	let hoverIndex = $state<number | null>(null);

	function onMove(e: MouseEvent) {
		if (trend.length === 0) return;
		const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
		const px = ((e.clientX - rect.left) / rect.width) * width;
		// Nearest index.
		let nearest = 0;
		let nearestDist = Infinity;
		for (let i = 0; i < trend.length; i++) {
			const d = Math.abs(x(i) - px);
			if (d < nearestDist) {
				nearestDist = d;
				nearest = i;
			}
		}
		hoverIndex = nearest;
	}

	const hovered = $derived(hoverIndex != null ? trend[hoverIndex] : null);

	const currentRating = $derived(profile.identity.rating);
	const firstRating = $derived(trend[0]?.total ?? currentRating);
	const delta = $derived(currentRating - firstRating);
</script>

<div class={className}>
	<div class="mb-4 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<svg class="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 17l6-6 4 4 8-8" />
			</svg>
			<h3 class="text-lg font-semibold text-text-primary">Rating 趋势</h3>
		</div>
		{#if trend.length >= 2}
			<div class="text-sm text-text-secondary">
				{#if delta >= 0}
					<span class="text-accent-green">+{delta}</span>
				{:else}
					<span class="text-accent-red">{delta}</span>
				{/if}
				<span class="ml-1 text-text-tertiary">较 {firstRating}</span>
			</div>
		{/if}
	</div>

	<Card variant="default" padding="md">
		{#if trend.length >= 2}
			<div class="relative w-full">
				<svg
					viewBox="0 0 {width} {height}"
					class="w-full"
					role="img"
					aria-label="DX Rating 趋势图"
					onmousemove={onMove}
					onmouseleave={() => (hoverIndex = null)}
				>
					<defs>
						<linearGradient id="rating-trend-fill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stop-color="#2EA043" stop-opacity="0.35" />
							<stop offset="100%" stop-color="#2EA043" stop-opacity="0" />
						</linearGradient>
					</defs>

					<!-- Y grid + labels -->
					{#each yTicks as tick}
						<line
							x1={padding.left}
							y1={y(tick)}
							x2={padding.left + plotW}
							y2={y(tick)}
							stroke="currentColor"
							stroke-width="1"
							stroke-opacity="0.08"
						/>
						<text
							x={padding.left - 8}
							y={y(tick) + 4}
							text-anchor="end"
							class="fill-text-tertiary"
							font-size="11"
						>{tick}</text>
					{/each}

					<!-- X labels -->
					{#each xLabels as lbl}
						<text
							x={x(lbl.i)}
							y={height - 8}
							text-anchor="middle"
							class="fill-text-tertiary"
							font-size="11"
						>{lbl.label}</text>
					{/each}

					<!-- Area + line -->
					<path d={areaPath} fill="url(#rating-trend-fill)" />
					<path d={linePath} fill="none" stroke="#2EA043" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />

					<!-- Hover marker -->
					{#if hoverIndex != null}
						<line
							x1={x(hoverIndex)}
							y1={padding.top}
							x2={x(hoverIndex)}
							y2={padding.top + plotH}
							stroke="currentColor"
							stroke-width="1"
							stroke-opacity="0.2"
						/>
						<circle cx={x(hoverIndex)} cy={y(trend[hoverIndex].total)} r="4" fill="#2EA043" stroke="white" stroke-width="1.5" />
					{/if}
				</svg>

				<!-- Tooltip -->
				{#if hovered}
					{@const i = hoverIndex ?? 0}
					<div
						class="pointer-events-none absolute top-2 rounded-md border border-border-default bg-bg-tertiary px-2 py-1 text-xs shadow"
						style="left: {(x(i) / width) * 100}%; transform: translateX(-50%)"
					>
						<div class="text-text-tertiary">{new Date(hovered.date).toLocaleDateString('zh-CN')}</div>
						<div class="font-semibold text-accent-green">DX Rating {hovered.total}</div>
						<div class="text-text-secondary">B35 {hovered.oldB35} · B15 {hovered.newB15}</div>
					</div>
				{/if}
			</div>
			<p class="mt-3 text-xs text-text-tertiary">※ 该数据由历史同步成绩推出，而非玩家的历史 DX Rating，仅供参考。</p>
		{:else}
			<div class="flex h-40 items-center justify-center text-center text-sm text-text-tertiary">
				<div>
					<svg class="mx-auto mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 17l6-6 4 4 8-8" />
					</svg>
					<p>历史记录不足，无法生成趋势图</p>
					<p class="mt-1 text-[10px]">授权 LXNS 并多次同步后可显示 Rating 趋势</p>
				</div>
			</div>
		{/if}
	</Card>
</div>
