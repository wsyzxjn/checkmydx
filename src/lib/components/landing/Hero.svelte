<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { validatePlayerHandle } from "$lib/types/portfolio";
  import { formatNumber } from "$lib/utils/player-transform";
  import { normalizeUsername } from "$lib/utils/username";
  import { navigationState } from "$lib/stores/navigation.svelte";
  import { beginLxnsOAuth, isLxnsOAuthConfigured } from "$lib/client/lxns";

  interface Props {
    totalPortfolios?: number;
  }

  let { totalPortfolios = 0 }: Props = $props();

  let username = $state("");
  let error = $state("");

  // Derive loading from navigation state
  let isLoading = $derived(navigationState.isLoading);

  async function handleSubmit() {
    const validation = validatePlayerHandle(username);
    if (!validation.valid) {
      error = validation.errors[0];
      return;
    }
    error = "";
    username = normalizeUsername(username);
    await navigationState.navigateToProfile(username);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  function setUsername(name: string) {
    username = name;
  }

  async function handleConnectLxns() {
    await beginLxnsOAuth();
  }
</script>

<section
  class="relative z-10 flex flex-col items-center justify-center px-6 pb-20 pt-16 text-center md:pb-32 md:pt-40"
>
  <div class="animate-fade-in relative z-10 max-w-4xl">
    <!-- Badge -->
    {#if totalPortfolios > 0}
      <div
        class="animate-fade-in-delay-1 mb-8 inline-flex items-center rounded-full border border-border-subtle bg-bg-secondary px-3 py-1 text-xs font-medium text-text-secondary shadow-sm backdrop-blur-sm"
      >
        <span
          class="mr-2 h-2 w-2 rounded-full bg-accent-green shadow-[0_0_8px_var(--color-accent-green)]"
        ></span>
        <span class="mr-1 font-semibold text-text-primary">{formatNumber(totalPortfolios)}</span>
        张玩家卡片已生成
      </div>
    {/if}

    <h1 class="mb-6 text-4xl font-bold tracking-tight md:text-7xl">
      把你的 maimai DX 成绩
      <br />
      <span class="text-gradient">变成玩家卡片</span>
    </h1>

    <p class="mx-auto mb-10 w-full max-w-150 text-base text-text-secondary md:text-xl">
      从 落雪咖啡屋 成绩数据生成可分享的玩家页，展示 Rating、同步热力图和代表成绩。
    </p>

    <!-- Input Container -->
    <div
      class="glass-panel mx-auto flex w-full max-w-130 items-center gap-2 rounded-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-saas-green"
    >
      <div class="relative flex flex-1 items-center px-3">
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
            d="M12 3v18m9-9H3m15.36-6.36L5.64 18.36m12.72 0L5.64 5.64"
          />
        </svg>
        <input
          type="text"
          placeholder="玩家 ID 或好友码"
          bind:value={username}
          onkeydown={handleKeydown}
          class="w-full border-none bg-transparent p-2 text-base text-text-primary placeholder-text-placeholder outline-none! ring-0! focus:border-none! focus:outline-none! focus:ring-0! focus-visible:border-none! focus-visible:outline-none! focus-visible:ring-0!"
          spellcheck="false"
        />
      </div>
      <Button
        variant="primary"
        size="md"
        onclick={handleSubmit}
        loading={isLoading}
        class="h-10 rounded-xl px-6 font-semibold shadow-lg shadow-accent-green/20"
      >
        生成
      </Button>
    </div>

    {#if error}
      <p class="mt-4 text-sm font-medium text-accent-red animate-fade-in">{error}</p>
    {/if}

    {#if isLxnsOAuthConfigured()}
      <div class="mt-4">
        <Button
          variant="secondary"
          size="md"
          onclick={handleConnectLxns}
          class="h-10 rounded-xl px-6 font-semibold"
        >
          连接 落雪咖啡屋
        </Button>
      </div>
    {/if}

    <p class="animate-fade-in-delay-1 mt-6 text-sm text-text-tertiary">
      试试示例玩家：
      <button
        type="button"
        onclick={() => setUsername("amatsuka")}
        class="ml-1 cursor-pointer font-medium text-text-secondary transition-colors hover:text-accent-green"
        >amatsuka</button
      >,
      <button
        type="button"
        onclick={() => setUsername("rainbow14")}
        class="cursor-pointer font-medium text-text-secondary transition-colors hover:text-accent-green"
        >rainbow14</button
      >,
      <button
        type="button"
        onclick={() => setUsername("dxstar")}
        class="cursor-pointer font-medium text-text-secondary transition-colors hover:text-accent-green"
        >dxstar</button
      >
    </p>
  </div>
</section>
