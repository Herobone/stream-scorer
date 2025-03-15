import type { IScoringEngine, ScoreOptions } from '$lib/types/ScoringEngine';
import type { Score } from '$lib/types/scoringTypes';

export interface DartsScoringOptions extends ScoreOptions {
	inType: InOutType;
	outType: InOutType;
}

export enum InOutType {
	SINGLE = 'single',
	DOUBLE = 'double',
	MASTER = 'master',
	// Never seen a triple in/out, but it's possible
	TRIPLE = 'triple'
}

export const darts: IScoringEngine = {
	triesPerRound: 3,
	multiplierValues: new Map([
		[2, { id: 'double', label: 'Double', shortLabel: 'D' }],
		[3, { id: 'triple', label: 'Triple', shortLabel: 'T' }]
	]),
	pointValues: [
		...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25].map((num) => ({
			id: num.toString(),
			label: num.toString(),
			value: num
		}))
	],

	calculate(
		currentScore: number,
		score: number,
		multiplier: number,
		initialScore: number,
		scoringOptions: DartsScoringOptions
	): number {
		if (multiplier === 0) {
			throw new RangeError('No multiplier');
		}
		if (multiplier > 3) {
			throw new RangeError('Multiplier too high');
		}
		if (multiplier < 0) {
			throw new RangeError('Multiplier too low');
		}
		if (score < 0) {
			throw new RangeError('Score too low');
		}
		if (score > 25) {
			throw new RangeError('Score too high');
		}
		if (currentScore < 0) {
			throw new RangeError('Current gross score too low');
		}

		if (currentScore === initialScore && scoringOptions.doubleIn) {
			if (multiplier !== 2) {
				return currentScore;
			}
		}

		if (score * multiplier > currentScore) {
			return currentScore;
		}

		if (currentScore - score * multiplier === 0 && scoringOptions.doubleOut && multiplier !== 2) {
			return currentScore;
		}

		return currentScore - score * multiplier;
	},

	undo(currentScore: number, score: Score): number {
		if (score.multiplier === 0) {
			throw new RangeError('No multiplier');
		}
		if (score.multiplier > 3) {
			throw new RangeError('Multiplier too high');
		}
		if (score.multiplier < 0) {
			throw new RangeError('Multiplier too low');
		}
		if (score.score < 0) {
			throw new RangeError('Score too low');
		}
		if (score.score > 25) {
			throw new RangeError('Score too high');
		}
		if (currentScore < 0) {
			throw new RangeError('Current gross score too low');
		}
		return currentScore + score.score * score.multiplier;
	}
};
