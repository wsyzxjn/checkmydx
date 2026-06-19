<script lang="ts">
	import Dropdown from '$lib/components/ui/Dropdown.svelte';
	import type { TemplateType } from '$lib/types/portfolio';
	
	interface Props {
		template?: TemplateType;
		onTemplateChange?: (template: TemplateType) => void;
	}

	let { template = 'github', onTemplateChange }: Props = $props();

	const templateOptions = [
		{ value: 'github', label: '查分器风格', mobileLabel: '查分器' },
		{ value: 'bento', label: 'Bento 网格', mobileLabel: 'Bento' },
		{ value: 'minimal', label: '极简风格' }
	];

	function handleTemplateChange(value: string) {
		onTemplateChange?.(value as TemplateType);
	}
</script>

<Dropdown
	options={templateOptions}
	value={template}
	onchange={handleTemplateChange}
/>
