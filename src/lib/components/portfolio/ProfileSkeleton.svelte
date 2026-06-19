<script lang="ts">
  import Skeleton from "$lib/components/ui/Skeleton.svelte";
  import Card from "$lib/components/ui/Card.svelte";
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <div class="flex flex-col gap-8 lg:flex-row">
    <!-- Sidebar skeleton -->
    <aside
      class="flex w-full flex-col items-center gap-4 text-center lg:w-[296px] lg:flex-shrink-0 lg:items-start lg:text-left"
    >
      <Skeleton variant="circular" width="296px" height="296px" />
      <div class="w-full space-y-2">
        <Skeleton variant="text" width="180px" height="28px" class="mx-auto lg:mx-0" />
        <Skeleton variant="text" width="120px" height="18px" class="mx-auto lg:mx-0" />
      </div>
      <div class="flex flex-wrap justify-center gap-2 lg:justify-start">
        <Skeleton variant="rectangular" width="70px" height="22px" class="rounded-full" />
        <Skeleton variant="rectangular" width="60px" height="22px" class="rounded-full" />
      </div>
      <Skeleton variant="rectangular" width="100%" height="96px" />
    </aside>

    <!-- Main skeleton -->
    <div class="flex-1 space-y-6">
      <Card variant="default" padding="lg">
        <Skeleton variant="text" width="200px" height="24px" />
        <div class="mt-4 space-y-2">
          <Skeleton variant="text" width="100%" height="14px" />
          <Skeleton variant="text" width="80%" height="14px" />
        </div>
      </Card>
      <div class="grid gap-4 md:grid-cols-2">
        {#each Array(2) as _}
          <Card variant="default" padding="md">
            <Skeleton variant="text" width="120px" height="20px" />
            <div class="mt-4"><Skeleton variant="rectangular" width="100%" height="48px" /></div>
          </Card>
        {/each}
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        {#each Array(4) as _}
          <Card variant="default" padding="md">
            <Skeleton variant="text" width="60%" height="18px" />
            <div class="mt-3"><Skeleton variant="text" width="40%" height="14px" /></div>
          </Card>
        {/each}
      </div>
    </div>
  </div>
</div>
