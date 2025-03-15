<script lang="ts">
	import { Button, Label } from 'bits-ui';
	import Plus from 'phosphor-svelte/lib/Plus';
	import PencilSimple from 'phosphor-svelte/lib/PencilSimple';
	import TrashSimple from 'phosphor-svelte/lib/TrashSimple';
	import FloppyDisk from 'phosphor-svelte/lib/FloppyDisk';

	let { names = $bindable() }: { names: string[] } = $props();

	let currentName = $state<string>('');
	let editingIndex = $state<number>(-1);

	function addName() {
		if (!currentName.trim()) return;
		// Add new name
		names = [...names, currentName];

		currentName = '';
	}

	function editName(index: number) {
		if (editingIndex === index) {
			editingIndex = -1;
			return;
		}
		editingIndex = index;
	}

	function deleteName(index: number) {
		names = names.filter((_, i) => i !== index);
		if (editingIndex === index) {
			currentName = '';
			editingIndex = -1;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			addName();
		}
	}
</script>

<div class="flex w-full flex-col items-center gap-4">
	<Label.Root class="text-sm font-medium">Enter Player Names</Label.Root>

	<div class="flex w-full md:max-w-[30rem]">
		<input
			type="text"
			class="h-input rounded-l-card-sm border-border-input bg-background placeholder:text-foreground-alt/50 hover:border-dark-40 focus:ring-foreground focus:ring-offset-background inline-flex w-full items-center border px-4 text-base focus:ring-2 focus:ring-offset-2 focus:outline-hidden sm:text-sm"
			placeholder={'Add Player'}
			bind:value={currentName}
			onkeydown={handleKeydown}
		/>
		<Button.Root
			class="h-input rounded-r-card-sm bg-dark text-background hover:bg-dark/95 px-3 active:scale-[0.98]"
			onclick={addName}
		>
			<Plus size={20} />
		</Button.Root>
	</div>

	{#if names.length > 0}
		<div class="mt-2 flex w-full flex-col gap-2 md:max-w-[30rem]">
			{#each names as name, i}
				<div class="bg-muted/20 rounded-card-sm flex items-center justify-between px-4 py-2.5">
					<input
						type="text"
						bind:value={names[i]}
						disabled={editingIndex !== i}
						class="h-input rounded-l-card-sm border-border-input bg-background placeholder:text-foreground-alt/50 hover:border-dark-40 focus:ring-foreground focus:ring-offset-background inline-flex w-full items-center border px-4 text-base focus:ring-2 focus:ring-offset-2 focus:outline-hidden sm:text-sm"
					/>
					<Button.Root
						class="h-input bg-dark text-background hover:bg-dark/90 px-3 active:scale-[0.98]"
						onclick={() => editName(i)}
					>
						{#if editingIndex === i}
							<FloppyDisk size={16} />
						{:else}
							<PencilSimple size={16} />
						{/if}
					</Button.Root>
					<Button.Root
						class="h-input rounded-r-card-sm text-background bg-red-700 px-3 hover:bg-red-700/90 active:scale-[0.98]"
						onclick={() => deleteName(i)}
					>
						<TrashSimple size={16} />
					</Button.Root>
				</div>
			{/each}
		</div>
	{/if}
</div>
