<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { fetchAuthorizedMaimaiProfile, finishLxnsOAuthCallback } from "$lib/client/lxns";

  let error = $state("");

  onMount(async () => {
    try {
      await finishLxnsOAuthCallback(new URL(window.location.href));
      const profile = await fetchAuthorizedMaimaiProfile();
      await goto(`/${profile.identity.friendCode}`, { replaceState: true });
    } catch (err) {
      error = err instanceof Error ? err.message : "连接 LXNS 失败";
    }
  });
</script>

<svelte:head>
  <title>正在连接 LXNS - CheckMyDX</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-bg-primary px-6">
  <div class="text-center">
    {#if error}
      <h1 class="mb-3 text-2xl font-semibold text-text-primary">LXNS 连接失败</h1>
      <p class="text-text-secondary">{error}</p>
    {:else}
      <h1 class="mb-3 text-2xl font-semibold text-text-primary">正在连接 LXNS</h1>
      <p class="text-text-secondary">正在读取你的 maimai DX 成绩数据...</p>
    {/if}
  </div>
</main>
