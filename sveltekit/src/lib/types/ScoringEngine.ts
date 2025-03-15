import type { MultiplierValues, PointValue, Score } from '$lib/types/scoringTypes';

export interface ScoreOptions {
	[option: string]: boolean | string | number;
}

export interface IScoringEngine {
	calculate(
		currentGrossScore: number,
		score: number,
		multiplier: number,
		initialScore: number,
		scoringOptions?: ScoreOptions
	): number;

	undo(currentGrossScore: number, score: Score): number;

	pointValues: PointValue[];
	multiplierValues: MultiplierValues;
	triesPerRound: number;
}
