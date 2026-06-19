<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { REPO_URL } from '$lib/constants';
</script>

<svelte:head>
	<title>关于 - CheckMyDX</title>
	<meta
		name="description"
		content="了解 CheckMyDX：一个把 maimai DX 成绩数据整理成可分享玩家卡片的小工具。"
	/>
</svelte:head>

<Header />

<main class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
	<article class="space-y-10">
		<header class="border-b border-border-default pb-8">
			<h1 class="text-3xl font-bold text-text-primary sm:text-4xl">关于 CheckMyDX</h1>
			<p class="mt-4 text-lg text-text-secondary">
				把 maimai DX 成绩数据整理成一张好看、可分享、可导出的玩家卡片。
			</p>
		</header>

		<section class="space-y-4">
			<h2 class="text-xl font-semibold text-text-primary">它能做什么</h2>
			<p class="leading-relaxed text-text-secondary">
				CheckMyDX 会展示玩家的 DX Rating、Best 50、成绩分布、同步热力图和代表成绩。你可以选择不同模板，也可以把卡片导出成 PNG。
			</p>
		</section>

		<section class="space-y-4">
			<h2 class="text-xl font-semibold text-text-primary">数据从哪里来</h2>
			<p class="leading-relaxed text-text-secondary">
				当前版本支持示例数据，也可以通过 LXNS OAuth 在浏览器中读取你授权后的个人成绩数据。纯前端版本不会保存你的 client secret，也不会把授权数据交给 CheckMyDX 的服务端处理。
			</p>
		</section>

		<section class="space-y-4">
			<h2 class="text-xl font-semibold text-text-primary">开源与来源</h2>
			<p class="leading-relaxed text-text-secondary">
				这个项目基于 CheckMyGit 改造，保留了原项目的模板、导出和分享体验，并把展示对象换成 maimai DX 玩家成绩。
			</p>
			<a
				href={REPO_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 text-accent-blue transition-colors hover:underline"
			>
				查看源码
			</a>
		</section>
	</article>
</main>

<Footer />
