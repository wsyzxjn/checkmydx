<script lang="ts">
  import Dropdown from "$lib/components/ui/Dropdown.svelte";

  interface Props {
    value: "all" | "original";
    onchange: (value: "all" | "original") => void;
    label?: string;
  }

  let { value, onchange, label = "仓库：" }: Props = $props();

  const options = [
    { value: "all", label: "全部仓库", mobileLabel: "全部" },
    { value: "original", label: "本人仓库", mobileLabel: "本人" },
  ];
</script>

<div class="flex items-center gap-2">
  <span class="text-sm text-text-secondary">{label}</span>
  <Dropdown {options} {value} onchange={(v) => onchange(v as "all" | "original")} class="w-36" />
</div>
