<script lang="ts">
	import { SITE_URL } from '$lib/constants';
	import { jsonLd } from '$lib/utils/jsonld';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Hero from '$lib/components/landing/Hero.svelte';
	import Features from '$lib/components/landing/Features.svelte';
	import FeaturedProfiles from '$lib/components/landing/FeaturedProfiles.svelte';
	import CallToAction from '$lib/components/landing/CallToAction.svelte';

	let { data } = $props();

	const websiteSchema = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'CheckMyDX',
		alternateName: 'CheckMyDX — maimai DX 玩家卡片生成器',
		url: SITE_URL,
		description:
			'把 maimai DX 查分器数据整理成可分享的玩家页，展示 Rating、同步热力图、代表成绩和练习结构。',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${SITE_URL}/{search_term_string}`
			},
			'query-input': 'required name=search_term_string'
		}
	};
</script>

<svelte:head>
	<title>CheckMyDX - 生成你的 maimai DX 玩家卡片</title>
	<meta
		name="description"
		content="把 maimai DX 成绩数据生成可分享的玩家页，支持三种模板、同步热力图、代表成绩和一键 PNG 导出。"
	/>
	{@html jsonLd(websiteSchema)}
</svelte:head>

<Header />

<main class="relative min-h-screen w-full overflow-hidden">
	<!-- SaaS Glow -->
	<div class="saas-glow"></div>
	<!-- Background grid effect -->
	<div class="absolute inset-0 z-0 grid-bg"></div>
	
	<Hero totalPortfolios={data.totalPortfolios} />
	<Features />
	<FeaturedProfiles />
	<CallToAction />
</main>

<Footer />
