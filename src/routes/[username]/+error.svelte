<script lang="ts">
  import { page } from "$app/stores";
  import Header from "$lib/components/layout/Header.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";

  const statusMessages: Record<number, { title: string; description: string }> = {
    404: {
      title: "找不到玩家",
      description: "你要查看的玩家卡片还不存在。",
    },
    429: {
      title: "请求过于频繁",
      description: "成绩服务暂时繁忙，请几分钟后再试。",
    },
    500: {
      title: "加载失败",
      description: "获取玩家卡片时出错，请稍后再试。",
    },
  };

  const status = $derived($page.status);
  const message = $derived(statusMessages[status] ?? statusMessages[500]);
</script>

<svelte:head>
  <title>{status} - CheckMyDX</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<Header />

<main class="flex min-h-[60vh] items-center justify-center px-4">
  <Card variant="default" padding="lg" class="max-w-md text-center">
    <div class="mb-4 text-6xl font-bold text-text-tertiary">
      {status}
    </div>
    <h1 class="text-xl font-semibold text-text-primary">
      {message.title}
    </h1>
    <p class="mt-2 text-text-secondary">
      {$page.error?.message || message.description}
    </p>
    <div class="mt-6 flex justify-center gap-3">
      <Button variant="primary" href="/">返回首页</Button>
      <Button variant="secondary" onclick={() => window.location.reload()}>重试</Button>
    </div>
  </Card>
</main>

<Footer />
