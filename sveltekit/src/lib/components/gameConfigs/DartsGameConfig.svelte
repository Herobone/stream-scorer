<script lang="ts">
	import Select from '../ui/Select.svelte';
	import { m } from '$lib/paraglide/messages';
	import ArrowSquareIn from 'phosphor-svelte/lib/ArrowSquareIn';
	import ArrowSquareOut from 'phosphor-svelte/lib/ArrowSquareOut';
	import type { ScoreOptions } from '$lib/types/ScoringEngine';
	import { InOutType, type DartsScoringOptions } from '$lib/scoring/darts';

	let { gameScoreOptions = $bindable() }: { gameScoreOptions: DartsScoringOptions } = $props();

	const inTypes = [
		{
			value: InOutType.SINGLE,
			label: 'Single In',
			default: true
		},
		{
			value: InOutType.DOUBLE,
			label: 'Double In'
		},
		{
			value: InOutType.TRIPLE,
			label: 'Triple In'
		},
		{
			value: InOutType.MASTER,
			label: 'Master In'
		}
	];

	const outTypes = [
		{
			value: InOutType.SINGLE,
			label: 'Single Out'
		},
		{
			value: InOutType.DOUBLE,
			label: 'Double Out',
			default: true
		},
		{
			value: InOutType.TRIPLE,
			label: 'Triple Out'
		},
		{
			value: InOutType.MASTER,
			label: 'Master Out'
		}
	];
</script>

<div>
	<span class="text-lg leading-none font-medium">{m.config_game_darts()}</span>
</div>
<div class="grid grid-cols-2 gap-4">
	<span
		class="text-lg leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
	>
		{m.darts_in_type()}
	</span>
	<Select
		items={inTypes}
		bind:value={gameScoreOptions!.inType}
		type="single"
		placeholder={m.darts_in_type()}
		icon={ArrowSquareIn}
	/>

	<span
		class="text-lg leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
	>
		{m.darts_out_type()}
	</span>
	<Select
		items={outTypes}
		bind:value={gameScoreOptions!.outType}
		type="single"
		placeholder={m.darts_out_type()}
		icon={ArrowSquareOut}
	/>
</div>
