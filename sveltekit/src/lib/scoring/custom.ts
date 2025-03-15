import type { IScoringEngine, ScoreOptions } from '$lib/types/ScoringEngine';

export const custom: IScoringEngine = {
	calculate: function (
		currentGrossScore: number,
		score: number,
		multiplier: number,
		initialScore: number,
		scoringOptions?: ScoreOptions
	): number {
		throw new Error('Function not implemented.');
	},
	pointValues: [],
	multiplierValues: new Map(),
	triesPerRound: 0
};
