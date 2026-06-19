<script lang="ts">
  import Header from "$lib/components/layout/Header.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { REPO_URL } from "$lib/constants";
</script>

<svelte:head>
  <title>隐私说明 - CheckMyDX</title>
  <meta
    name="description"
    content="CheckMyDX 的隐私说明：我们如何处理 LXNS OAuth 授权、浏览器本地 token 和访问统计。"
  />
</svelte:head>

<Header />

<main class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
  <article class="space-y-10">
    <header class="border-b border-border-default pb-8">
      <h1 class="text-3xl font-bold text-text-primary sm:text-4xl">隐私说明</h1>
      <p class="mt-4 text-text-secondary">最后更新：2026 年 6 月</p>
    </header>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-text-primary">我们读取什么数据</h2>
      <p class="leading-relaxed text-text-secondary">
        当你连接 LXNS 时，CheckMyDX 会在浏览器里通过 OAuth 读取你授权范围内的 maimai DX
        玩家信息、Best 50 和成绩同步热力图。
      </p>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-text-primary">数据保存在哪里</h2>
      <p class="leading-relaxed text-text-secondary">
        纯前端版本会把 OAuth token 存在你的浏览器本地，用于刷新当前设备上的授权数据。CheckMyDX
        不会在自己的服务端保存这些 token。
      </p>
      <p class="leading-relaxed text-text-secondary">
        页面访问量可能会以匿名计数形式保存，用来展示卡片浏览次数。
      </p>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-text-primary">第三方服务</h2>
      <ul class="ml-4 list-inside list-disc space-y-2 text-text-secondary">
        <li><span class="text-text-primary">LXNS</span>：用于 OAuth 授权和读取成绩数据。</li>
        <li><span class="text-text-primary">Cloudflare</span>：用于部署、CDN 和访问计数存储。</li>
        <li><span class="text-text-primary">GitHub</span>：用于托管项目源码。</li>
      </ul>
    </section>

    <section class="space-y-4 border-t border-border-default pt-8">
      <h2 class="text-xl font-semibold text-text-primary">问题反馈</h2>
      <p class="leading-relaxed text-text-secondary">
        如果你对数据处理有疑问，可以在项目仓库中提交 issue。
      </p>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 text-accent-blue transition-colors hover:underline"
      >
        打开 GitHub 仓库
      </a>
    </section>
  </article>
</main>

<Footer />
