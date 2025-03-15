<script lang="ts">
	import type { PageProps } from './$types';
	import GameScorer from '$lib/components/GameScorer.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ScoringEntity } from '$lib/types/Player';
	import { type GameOptions, GameType } from '$lib/types/GameOptions';
	import type { Score } from '$lib/types/scoringTypes';
	import { getScoringEngine } from '$lib/scoring';

	const { data }: PageProps = $props();

	let players = $state<ScoringEntity[]>(
		data.gameOptions.players.map((p) => ({
			...p,
			scoreHistory: data.history[p.id.toString()] || [],
			score: parseInt(data.playerScores[p.id.toString()]) || data.gameOptions.initialScore
		}))
	);
	const scoringEngine = getScoringEngine(data.gameOptions.type);

	let sequence = $state(data.sequence);
	let currentTry = $derived(sequence % scoringEngine.triesPerRound);

	let currentPlayer = $derived(Math.floor(sequence / scoringEngine.triesPerRound) % players.length);

	let locked = $state(false);

	async function handleScore(score: Score) {
		if (locked) return;
		locked = true;
		const result = await fetch(`/api/game/score`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				gameId: data.gameId,
				playerId: players[currentPlayer].id,
				score
			})
		});

		const { success, message, score: newScore, sequence: newSeq } = await result.json();
		if (!success) {
			console.error(message);
			return;
		}

		players[currentPlayer].score = newScore;
		players[currentPlayer].scoreHistory.push(score);

		if (players[currentPlayer].score <= 0) {
			alert(`${players[currentPlayer].name} wins!`);
			// Reset game or handle win condition
		}
		sequence = newSeq;
		locked = false;
	}

	async function handleUndo() {
		if (locked) return;
		locked = true;
		sequence -= 1;
		const result = await fetch(`/api/game/score`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				gameId: data.gameId,
				playerId: players[currentPlayer].id
			})
		});

		const { success, message, score: newScore, sequence: newSeq } = await result.json();
		if (!success) {
			console.error(message);
			locked = false;
			return;
		}

		sequence = newSeq;

		players[currentPlayer].score = newScore;
		players[currentPlayer].scoreHistory.pop();
		locked = false;
	}

	function renderScore(score: Score) {
		return `${scoringEngine.multiplierValues.get(score.multiplier)?.shortLabel || ''}${score.score}`;
	}

	$effect(() => {
		$inspect('Sequence:', sequence);
	});
</script>

<svelte:head>
	<title>Scoring Game {data.uid}</title>
</svelte:head>

<div class="container mx-auto py-8">
	<h1 class="mb-6 text-3xl font-bold">Scorer</h1>

	<div
		class={`mb-6 grid ${players.length < 4 ? 'grid-cols-' + players.length : 'grid-cols-4'} gap-2`}
	>
		{#each players as player, i (player.id)}
			<div class="mb-8">
				<div
					class={`${i === currentPlayer ? 'bg-blue-600 text-white' : 'bg-slate-100'} rounded-lg p-4 text-center`}
				>
					<div class="text-2xl font-bold">{player.name}: {player.score}</div>
					<div class="mt-2 text-sm">
						{m.game_scoreHistory()}
						: {player.scoreHistory.map(renderScore).join(', ') || m.game_noScoresYet()}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<GameScorer
		onScore={handleScore}
		{handleUndo}
		multipliers={scoringEngine.multiplierValues}
		pointValues={scoringEngine.pointValues}
		disabled={locked}
	/>
</div>
