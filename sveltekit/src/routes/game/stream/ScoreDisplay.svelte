<script lang="ts">
	import { darts } from '$lib/scoring/darts';
	import type { ScoringEntity } from '$lib/types/Player';
	import type { Score } from '$lib/types/scoringTypes';
	import { Progress } from 'bits-ui';

	// Props for the component
	type Props = {
		scoringEntities: ScoringEntity[];
		history?: number;
		showProgress?: boolean;
		theme?: 'dark' | 'light' | 'purple' | 'blue' | 'green';
		fontSize?: 'small' | 'medium' | 'large';
	};

	const props: Props = $props();

	// Default values
	props.history ??= 3;
	props.showProgress ??= true;
	props.theme ??= 'dark';
	props.fontSize ??= 'medium';

	// State
	let animateScore = $state(false);

	// Animation effect for score changes
	$effect(() => {
		// This will trigger whenever currentScore changes
		animateScore = true;
		const timer = setTimeout(() => {
			animateScore = false;
		}, 1000);

		return () => clearTimeout(timer);
	});

	// Compute theme classes
	function getThemeClasses() {
		const baseClasses = 'rounded-lg shadow-lg overflow-hidden';

		switch (props.theme) {
			case 'light':
				return `${baseClasses} bg-white bg-opacity-90 text-gray-800`;
			case 'purple':
				return `${baseClasses} bg-purple-900 bg-opacity-90 text-white`;
			case 'blue':
				return `${baseClasses} bg-blue-900 bg-opacity-90 text-white`;
			case 'green':
				return `${baseClasses} bg-emerald-900 bg-opacity-90 text-white`;
			case 'dark':
			default:
				return `${baseClasses} bg-gray-900 bg-opacity-90 text-white`;
		}
	}

	// Compute font size classes
	function getFontSizeClasses() {
		switch (props.fontSize) {
			case 'small':
				return 'text-base';
			case 'large':
				return 'text-3xl';
			case 'medium':
			default:
				return 'text-xl';
		}
	}

	// Compute progress color based on theme
	function getProgressColor() {
		switch (props.theme) {
			case 'light':
				return 'bg-blue-500';
			case 'purple':
				return 'bg-purple-400';
			case 'blue':
				return 'bg-blue-400';
			case 'green':
				return 'bg-emerald-400';
			case 'dark':
			default:
				return 'bg-blue-500';
		}
	}

	function renderScore(score: Score) {
		return `${darts.multiplierValues.get(score.multiplier)?.shortLabel || ''}${score.score}`;
	}
</script>

<div class={`obs-score-display ${getThemeClasses()}`}>
	{#each props.scoringEntities as entity}
		<div class="obs-score-display-border border-b border-gray-700 p-4">
			<!-- Player name -->
			<div class="mb-2 flex items-center justify-between">
				<h2 class={`font-bold ${getFontSizeClasses()} tracking-wider uppercase`}>
					{entity.name}
				</h2>

				<!-- Current score with animation -->
				<div class="flex items-center">
					<span
						class={`font-mono font-bold ${animateScore ? 'scale-110 text-green-400' : ''} transition-all duration-500 ${getFontSizeClasses()}`}
					>
						{entity.score}
					</span>
				</div>
			</div>

			<!-- History items -->
			{#if props.history && props.history > 0}
				<div class="pt-1">
					<span class="font-mono"
						>{entity.scoreHistory
							.slice(-props.history!)
							.reverse()
							.map(renderScore)
							.join(', ')}</span
					>
				</div>
			{/if}
		</div>
	{/each}

	<!-- Animated highlight bar at bottom -->
	<div class={`h-1 ${getProgressColor()}`}></div>
</div>

<style>
	.obs-score-display {
		min-width: 400px;
		max-width: 600px;
		/* These styles make it ideal for OBS */
		font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
	}
</style>
