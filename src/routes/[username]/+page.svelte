<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount, tick } from 'svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import TemplateGitHub from '$lib/components/templates/TemplateGitHub.svelte';
	import TemplateBento from '$lib/components/templates/TemplateBento.svelte';
	import TemplateMinimal from '$lib/components/templates/TemplateMinimal.svelte';
	import ProfileSkeleton from '$lib/components/portfolio/ProfileSkeleton.svelte';
	import ExportContainer from '$lib/components/export/ExportContainer.svelte';
	import QRModal from '$lib/components/ui/QRModal.svelte';
	import { generatorState, toastState } from '$lib/stores/generator.svelte';
	import { navigationState } from '$lib/stores/navigation.svelte';
	import { themeState } from '$lib/stores/theme.svelte';
	import { generateShareUrl } from '$lib/utils/player-transform';
	import { generateQRCode } from '$lib/utils/qr';
	import { jsonLd } from '$lib/utils/jsonld';
	import { SITE_URL, META_DESCRIPTION_MAX_LENGTH } from '$lib/constants';
	import { fetchAuthorizedMaimaiProfile, hasStoredLxnsToken } from '$lib/client/lxns';
	import type { TemplateType } from '$lib/types/portfolio';
	import type { PlayerProfile } from '$lib/types/player';

	let { data } = $props();

	// Track loading state and resolved data
	let isLoading = $state(true);
	let loadError = $state<Error | null>(null);
	let profile = $state<PlayerProfile | null>(null);
	let views = $state<number>(0);
	let isRefreshingFromLxns = $state(false);

	// Which username we've already sent a view beacon for. Plain (non-reactive)
	// variable so client-side navigation between profiles counts each one once.
	let countedUser = '';

	// Fire-and-forget view beacon. Running this client-side means crawlers (which
	// don't execute JS) never hit the KV write path. Best-effort: must never throw
	// or affect the UI.
	function sendViewBeacon(username: string) {
		try {
			void fetch('/api/view', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username }),
				keepalive: true
			}).catch(() => {});
		} catch {
			// ignore
		}
	}

	async function hydrateAuthorizedProfile(requestedUser: string) {
		if (!hasStoredLxnsToken()) return;

		try {
			isRefreshingFromLxns = true;
			const authorizedProfile = await fetchAuthorizedMaimaiProfile();
			const isCurrentUserRoute =
				requestedUser === 'me' ||
				requestedUser === authorizedProfile.identity.friendCode ||
				requestedUser.toLowerCase() === authorizedProfile.identity.name?.toLowerCase();

			if (isCurrentUserRoute) {
				profile = authorizedProfile;
			}
		} catch (err) {
			console.warn('Failed to load LXNS OAuth profile:', err);
			toastState.warning('暂时无法刷新 LXNS 数据，已显示预览数据。');
		} finally {
			isRefreshingFromLxns = false;
		}
	}

	// Resolve the streamed promises
	$effect(() => {
		isLoading = true;
		loadError = null;
		const requestedUser = data.username;

		Promise.all([data.profile, data.views])
			.then(([resolvedProfile, resolvedViews]) => {
				profile = resolvedProfile;
				views = resolvedViews;
				isLoading = false;
				void hydrateAuthorizedProfile(requestedUser);

				// Count the view only after the profile actually resolves (so 404s
				// aren't counted) and only once per profile.
				if (countedUser !== requestedUser) {
					countedUser = requestedUser;
					sendViewBeacon(requestedUser);
				}
			})
			.catch((err) => {
				loadError = err;
				isLoading = false;
			});
	});

	// Track if we came from a navigation (for enter animation)
	let showEnterAnimation = $derived(navigationState.phase === 'entering');

	const profileUrl = $derived(`${SITE_URL}/${data.username}`);

	const pageTitle = $derived(
		profile?.identity.name
			? `${profile.identity.name} (@${data.username}) - maimai DX 玩家卡片 - CheckMyDX`
			: `@${data.username} - maimai DX 玩家卡片 - CheckMyDX`
	);

	const pageDescription = $derived.by(() => {
		if (!profile) {
			return `@${data.username} 的 maimai DX 玩家卡片，包含 Rating、同步热力图、成绩分布和代表成绩。`;
		}
		const name = profile.identity.name || data.username;
		const parts = [
			`${profile.b50Count} 条 B50`,
			`${profile.identity.rating} DX Rating`,
			`${profile.rating.oldB35} B35`,
			`${profile.rating.newB15} B15`
		];
		const stats = parts.join(' · ');
		return `${name} 的 CheckMyDX 玩家卡片：${stats}。`.slice(
			0,
			META_DESCRIPTION_MAX_LENGTH
		);
	});

	const profileSchema = $derived.by(() => {
		if (!profile) return null;
		const person: Record<string, unknown> = {
			'@type': 'Person',
			name: profile.identity.name,
			alternateName: profile.identity.friendCode,
			url: profileUrl,
			image: profile.identity.avatarUrl
		};
		if (profile.identity.trophy) person.description = profile.identity.trophy;

		return {
			'@context': 'https://schema.org',
			'@type': 'ProfilePage',
			url: profileUrl,
			dateModified: profile.identity.lastSync,
			mainEntity: person,
			breadcrumb: {
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
					{ '@type': 'ListItem', position: 2, name: profile.identity.friendCode, item: profileUrl }
				]
			}
		};
	});

	// Signal that the profile has loaded - trigger enter animation
	onMount(() => {
		// Small delay to ensure the page has rendered before revealing
		requestAnimationFrame(() => {
			navigationState.profileLoaded();
		});
	});

	// Check if on mobile (matches Tailwind's sm breakpoint: 640px)
	function isMobile(): boolean {
		if (typeof window === 'undefined') return false;
		return window.innerWidth < 640;
	}

	// Initialize template from URL params
	$effect(() => {
		const params = $page.url.searchParams;
		generatorState.loadFromParams(params);

		// Force compact prober-style template on mobile
		if (isMobile() && generatorState.template !== 'github') {
			generatorState.setTemplate('github');
		}
	});

	// Handle template change (only called on desktop since selector is hidden on mobile)
	function handleTemplateChange(template: TemplateType) {
		generatorState.setTemplate(template);
		// Update URL without navigation
		const params = generatorState.toParams();
		const newUrl = `/${data.username}${params.toString() ? `?${params}` : ''}`;
		goto(newUrl, { replaceState: true, noScroll: true });
	}

	// Handle export
	async function handleExport() {
		generatorState.enterExportMode();

		// Wait for export container to render
		await tick();

		try {
			const { toPng } = await import('html-to-image');
			const element = document.getElementById('export-container');
			if (!element) throw new Error('找不到导出区域');

			// Wait for fonts to load
			await document.fonts.ready;

			const dataUrl = await toPng(element, {
				pixelRatio: 2,
				cacheBust: true,
				skipFonts: true,
				filter: (node) => {
					// Skip script tags and other problematic nodes
					return !(node instanceof HTMLScriptElement);
				}
			});

			// Download
			const link = document.createElement('a');
			link.download = `${data.username}-checkmydx.png`;
			link.href = dataUrl;
			link.click();

			toastState.success('玩家卡片已导出。');
		} catch (err) {
			console.error('Export failed:', err);
			toastState.error('导出玩家卡片失败。');
		} finally {
			generatorState.exitExportMode();
		}
	}

	// Handle share
	async function handleShare() {
		const url = generateShareUrl(data.username, {
			template: generatorState.template,
			theme: themeState.current
		});

		try {
			await navigator.clipboard.writeText(url);
			toastState.success('链接已复制。');
		} catch {
			// Fallback for browsers without clipboard API
			toastState.info(url);
		}
	}

	// Handle QR code generation
	async function handleQRCode() {
		const url = generateShareUrl(data.username, {
			template: generatorState.template,
			theme: themeState.current
		});

		try {
			const qrDataUrl = await generateQRCode(url);
			generatorState.setQRDataUrl(qrDataUrl);
			generatorState.openQRModal();
		} catch (err) {
			console.error('QR generation failed:', err);
			toastState.error('生成二维码失败。');
		}
	}

	// Get current share URL for modal display
	function getCurrentShareUrl(): string {
		return generateShareUrl(data.username, {
			template: generatorState.template,
			theme: themeState.current
		});
	}

	// Handle QR code download
	function handleQRDownload() {
		const link = document.createElement('a');
		link.download = `${data.username}-qrcode.png`;
		link.href = generatorState.qrDataUrl;
		link.click();
		toastState.success('二维码已下载。');
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content={profileUrl} />
	<meta property="og:site_name" content="CheckMyDX" />
	<meta property="og:type" content="profile" />
	{#if profile?.identity.avatarUrl}
		<meta property="og:image" content={profile.identity.avatarUrl} />
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	{#if profileSchema}
		{@html jsonLd(profileSchema)}
	{/if}
</svelte:head>

<div class:page-enter={showEnterAnimation}>
	<Header
	username={data.username}
	template={generatorState.template}
	showControls={true}
	onTemplateChange={handleTemplateChange}
	onExport={handleExport}
	onShare={handleShare}
	onQRCode={handleQRCode}
	/>

	<main id="portfolio-container" class="min-h-screen bg-bg-primary">
		{#if isLoading}
			<!-- Show skeleton while loading -->
			<ProfileSkeleton />
		{:else if loadError}
			<!-- Error state -->
			<div class="flex min-h-[60vh] items-center justify-center">
				<div class="text-center">
					<div class="mb-4 text-6xl">😕</div>
					<h2 class="mb-2 text-xl font-semibold text-text-primary">加载失败</h2>
					<p class="mb-4 text-text-secondary">{loadError.message || '玩家卡片加载失败'}</p>
					<a href={resolve('/')} class="text-accent-green hover:underline">← 返回首页</a>
				</div>
			</div>
		{:else if profile}
			{#if isRefreshingFromLxns}
				<div class="border-b border-border-subtle bg-bg-secondary px-4 py-2 text-center text-xs text-text-tertiary">
					正在从 LXNS 刷新数据...
				</div>
			{/if}
			{#if generatorState.template === 'github'}
				<TemplateGitHub {profile} {views} />
			{:else if generatorState.template === 'bento'}
				<TemplateBento {profile} {views} />
			{:else if generatorState.template === 'minimal'}
				<TemplateMinimal {profile} {views} />
			{/if}
		{/if}
	</main>

	<Footer />
</div>

<!-- Export Container (rendered off-screen when exporting) -->
{#if generatorState.isExportMode && profile}
	<div class="fixed -left-[9999px] top-0">
		<ExportContainer>
			{#if generatorState.template === 'github'}
				<TemplateGitHub {profile} {views} />
			{:else if generatorState.template === 'bento'}
				<TemplateBento {profile} {views} />
			{:else if generatorState.template === 'minimal'}
				<TemplateMinimal {profile} {views} />
			{/if}
		</ExportContainer>
	</div>
{/if}

<!-- QR Code Modal -->
{#if generatorState.isQRModalOpen}
	<QRModal
		qrDataUrl={generatorState.qrDataUrl}
		url={getCurrentShareUrl()}
		onClose={() => generatorState.closeQRModal()}
		onDownload={handleQRDownload}
	/>
{/if}
