<script lang="ts">
	import type { MultiplierValues, PointValue, Score } from '$lib/types/scoringTypes';
	import { Backspace } from 'phosphor-svelte';

	import { Button } from 'bits-ui';

	interface GameScorerProps {
		// Custom point values (optional)
		pointValues: PointValue[];
		// Callback function that returns the calculated score
		onScore: (score: Score) => void;
		handleUndo: () => void;
		multipliers: MultiplierValues;
		disabled?: boolean;
	}

	// Define component props
	const { pointValues, onScore, multipliers, handleUndo, disabled }: GameScorerProps = $props();

	// State with runes
	let selectedMultiplier = $state(1);

	function handleScore(value: number) {
		onScore({ score: value, multiplier: selectedMultiplier });
		selectedMultiplier = 1; // Reset multiplier after scoring
	}

	function selectMultiplier(multiplier: number) {
		if (multiplier === selectedMultiplier) {
			selectedMultiplier = 1; // Reset multiplier if already selected
			return;
		}
		selectedMultiplier = multiplier;
	}
</script>

<div class="mx-auto w-full max-w-3xl p-4">
	<!-- Multiplier controls -->
	<div class="mb-6 grid grid-cols-3 gap-2">
		{#each multipliers as [multiplier, { label }] (multiplier)}
			<Button.Root
				class={`rounded-md py-3 ${selectedMultiplier === multiplier ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
				onclick={() => selectMultiplier(multiplier)}
			>
				{label}
			</Button.Root>
		{/each}
	</div>

	<!-- Points grid -->
	<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
		{#each pointValues as point (point.id)}
			<Button.Root
				class="rounded-md bg-gray-100 py-3 font-medium hover:bg-gray-200"
				onclick={() => handleScore(point.value)}
				{disabled}
			>
				{point.label}
			</Button.Root>
		{/each}

		<!-- Miss button -->
		<Button.Root
			class="col-span-2 rounded-md bg-red-100 py-3 font-medium hover:bg-red-200 sm:col-span-3 lg:col-span-4"
			onclick={() => handleScore(0)}
			{disabled}
		>
			Miss
		</Button.Root>
		<Button.Root
			class="col-span-1 rounded-md bg-red-700 py-3 font-medium hover:bg-red-700/80 sm:col-span-2"
			onclick={() => handleUndo()}
			{disabled}
		>
			<Backspace class="mr-2 inline" weight="bold" size={24} />
			Undo
		</Button.Root>
	</div>
</div>
