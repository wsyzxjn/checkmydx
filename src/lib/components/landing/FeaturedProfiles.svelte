<script lang="ts">
  import { navigationState } from "$lib/stores/navigation.svelte";

  const featuredProfiles = [
    { username: "amatsuka", name: "Amatsuka", role: "均衡的 14+ 练习档案" },
    { username: "rainbow14", name: "Rainbow14", role: "高 Rating 展示示例" },
    { username: "dxstar", name: "DX Star", role: "成绩卡片导出示例" },
  ];

  async function handleProfileClick(username: string) {
    await navigationState.navigateToProfile(username);
  }
</script>

<section
  class="animate-fade-in-delay-3 relative z-10 border-t border-border-muted bg-bg-secondary py-24"
>
  <div class="mx-auto max-w-5xl px-6">
    <div class="mb-12 text-center">
      <h2 class="mb-4 text-3xl font-bold text-text-primary">示例玩家</h2>
      <p class="text-text-secondary">看看 CheckMyDX 如何把成绩数据整理成卡片</p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {#each featuredProfiles as profile}
        <button
          type="button"
          onclick={() => handleProfileClick(profile.username)}
          class="group relative overflow-hidden rounded-2xl border border-border-default bg-bg-tertiary p-6 text-left transition-all hover:border-border-highlight hover:shadow-xl cursor-pointer"
        >
          <div class="flex items-center gap-4">
            <div class="relative">
              <img
                src="/favicon.svg"
                alt={profile.name}
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                class="h-12 w-12 rounded-full border border-border-subtle bg-bg-secondary"
              />
              <div
                class="absolute -bottom-1 -right-1 rounded-full border-2 border-bg-tertiary bg-accent-green p-1"
              ></div>
            </div>
            <div>
              <h3 class="font-semibold text-text-primary group-hover:text-accent-green">
                {profile.name}
              </h3>
              <p class="text-xs text-text-tertiary">@{profile.username}</p>
            </div>
          </div>
          <p class="mt-4 text-sm font-medium text-text-secondary">{profile.role}</p>
        </button>
      {/each}
    </div>
  </div>
</section>
