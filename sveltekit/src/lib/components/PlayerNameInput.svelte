<script lang="ts">
	import { Label } from 'bits-ui';
	import { m } from '$lib/paraglide/messages';

	let { names = $bindable() }: { names: string[] } = $props();

	// Initialize with one empty name

	function handleInput() {
		// 1. Ensure there's an empty field at the end
		const lastIndex = names.length - 1;
		if (names[lastIndex].trim() !== '') {
			names = [...names, ''];
		}

		// 2. Remove any empty fields except the last one
		if (names.length > 1) {
			names = names.filter((name, i) => name.trim() !== '' || i === names.length - 1);
		}
	}
</script>

<div class="flex w-full flex-col items-center gap-4">
	<Label.Root class="text-sm font-medium">Player Names</Label.Root>

	<div class="flex w-full flex-col gap-2 md:max-w-[30rem]">
		{#each names as name, index (index)}
			<input
				type="text"
				class="h-input rounded-card-sm border-border-input bg-background placeholder:text-foreground-alt/50 hover:border-dark-40 focus:ring-foreground focus:ring-offset-background inline-flex w-full items-center border px-4 text-base focus:ring-2 focus:ring-offset-2 focus:outline-hidden sm:text-sm"
				placeholder={`Player ${index + 1}`}
				bind:value={names[index]}
				oninput={handleInput}
			/>
		{/each}
	</div>
</div>
