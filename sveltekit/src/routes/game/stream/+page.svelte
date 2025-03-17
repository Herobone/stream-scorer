<script lang="ts">
	import { onMount } from 'svelte';
	import ScoreDisplay from './ScoreDisplay.svelte';
	import type { ScoringEntity } from '$lib/types/Player';
	import type { SubscriberUpdateData } from '$lib/types/SubscriberUpdateData';
	import type { PageProps } from './$types';

	import { WebSocket } from 'partysocket';

	const props: PageProps = $props();

	// State using runes
	let player = $state<ScoringEntity[]>([]);

	let history = $state(3);
	let showProgress = $state(true);
	let theme = $state<'dark' | 'light' | 'purple' | 'blue' | 'green'>('dark');
	let fontSize = $state<'small' | 'medium' | 'large'>('medium');

	let loaded = $state(false);
	let connected = $state(false);
	let sequence = $state(0);


	// Mock score update for demo purposes
	// In a real implementation, this would connect to a WebSocket or use other methods
	onMount(() => {
		props.data.scores?.entries().forEach(([id, score]) =>
			player.push({
				id,
				score: score ?? 0,
				scoreHistory: props.data.history?.get(id) ?? [],
				name: 'Player ' + id
			} as ScoringEntity)
		);
		// Load config from URL params
		const urlParams = new URLSearchParams(window.location.search);

		const socket = new WebSocket('ws://localhost:9191/ws?gameId=' + props.data.gameId);
		socket.addEventListener('message', (event) => {
			const data: SubscriberUpdateData = JSON.parse(event.data);
			sequence = data.sequence;
			let playerIndex = player.findIndex((p) => p.id === data.playerId);
			if (playerIndex === -1) {
				console.error(`Player with ID ${data.playerId} not found`);
				return;
			}
			player[playerIndex].score = data.totalScore;
			if (data.action === 'add') {
				player[playerIndex].scoreHistory.push(data.score);
			} else {
				player[playerIndex].scoreHistory.pop();
			}
		});

		socket.addEventListener('open', () => {
			connected = true;
			console.log('Connected');
		});

		socket.addEventListener('close', () => {
			connected = false;
			console.log('Connection closed');
		});

		// Parse URL parameters
		if (urlParams.has('history')) history = parseInt(urlParams.get('history')!);
		if (urlParams.has('showProgress')) showProgress = urlParams.get('showProgress') !== null;
		if (
			urlParams.has('theme') &&
			['dark', 'light', 'purple', 'blue', 'green'].includes(urlParams.get('theme')!)
		) {
			theme = urlParams.get('theme') as any;
		}
		if (
			urlParams.has('fontSize') &&
			['small', 'medium', 'large'].includes(urlParams.get('fontSize')!)
		) {
			fontSize = urlParams.get('fontSize') as any;
		}

		loaded = true;

		return () => {
			socket.close();
		};
	});
</script>

<!-- OBS-friendly transparent background -->
<div class="min-h-screen {theme === 'light' ? 'bg-transparent' : 'bg-transparent'} flex items-end">
	{#if loaded}
		<ScoreDisplay scoringEntities={player} {history} {showProgress} {theme} {fontSize} />
	{:else}
		<div class="text-opacity-80 text-white">Loading...</div>
	{/if}

	<!-- Connection indicator, only visible during development -->
	{#if import.meta.env.DEV}
		<div
			class="fixed right-2 bottom-2 rounded-full px-2 py-1 text-xs {connected
				? 'bg-green-500'
				: 'bg-red-500'} text-white"
		>
			{connected ? 'Connected' : 'Connecting...'}
		</div>
	{/if}
</div>
