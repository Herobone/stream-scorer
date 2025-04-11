<script lang="ts">
	import { Button, Label, Slider } from 'bits-ui';
	import DiceSix from 'phosphor-svelte/lib/DiceSix';
	import { GameType, type GameOptions } from '$lib/types/GameOptions';
	import { m } from '$lib/paraglide/messages';
	import Select from '$lib/components/ui/Select.svelte';
	import DartsGameConfig from '$lib/components/gameConfigs/DartsGameConfig.svelte';
	import { goto } from '$app/navigation';
	import { type ScoreOptions } from '$lib/types/ScoringEngine';
	import OtherPlayerNameInput from '$lib/components/OtherPlayerNameInput.svelte';
	import type { PageProps } from './$types';
	import type { DartsScoringOptions } from '$lib/scoring/darts';

	const { data }: PageProps = $props();

	const gameType = [
		{
			value: GameType.DARTS,
			label: m.darts()
		},
		{
			value: GameType.CUSTOM,
			label: m.custom()
		}
	];

	let selectedGameType = $state<string>(GameType.DARTS);
	let gameScoreOptions = $state<ScoreOptions>({});
	let playerNames = $state<string[]>([]);

	async function createGame() {
		console.log('Create game');
		const result = await fetch('/api/game/new', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				gameType: selectedGameType,
				gameOptions: gameScoreOptions,
				initialScore: 501,
				playerNames
			})
		});

		const return_data = await result.json();
		if (return_data.success) {
			const gameId = return_data.gameId;
			await goto(`/game/${gameId}/play`);
		} else {
			console.error(return_data.message);
		}
	}
</script>

<main class="flex h-full flex-col items-center justify-center space-y-6">
	<div class="flex items-center space-x-4">
		<span
			class="text-lg leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			{m.select_game_type()}
		</span>
		<Select
			items={gameType}
			type="single"
			bind:value={selectedGameType}
			placeholder={m.select_game_type()}
			icon={DiceSix}
		/>
	</div>
	<OtherPlayerNameInput bind:names={playerNames} />

	{#if selectedGameType === GameType.DARTS.toString()}
		<DartsGameConfig bind:gameScoreOptions={gameScoreOptions as DartsScoringOptions} />
	{/if}

	<Button.Root
		onclick={createGame}
		class="rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 text-md h-12 px-4 font-semibold active:scale-[0.98] active:transition-all"
	>
		{m.create_game()}
	</Button.Root>
</main>
