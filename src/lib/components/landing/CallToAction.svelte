<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
</script>

<section class="relative z-10 border-t border-border-muted bg-bg-primary py-24 text-center">
  <div class="mx-auto max-w-4xl px-6">
    <h2 class="mb-6 text-4xl font-bold tracking-tight text-text-primary">
      准备好分享你的 DX 记录了吗？
    </h2>
    <p class="mx-auto mb-10 w-full max-w-3xl text-lg text-text-secondary">
      把 maimai DX 成绩整理成一张紧凑卡片，用来导出、分享，也适合放到查分器首页展示。
    </p>
    <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
      <Button
        variant="primary"
        size="lg"
        onclick={() => document.querySelector("input")?.focus()}
        class="w-full sm:w-auto"
      >
        生成我的卡片
      </Button>
    </div>
    <p class="mt-8 text-sm text-text-secondary">
      基于 CheckMyGit 改造，原作者
      <a
        href="https://github.com/whoisyurii"
        target="_blank"
        class="hover:text-text-primary hover:underline">@whoisyurii</a
      >
    </p>
  </div>
</section>
