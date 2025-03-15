import type { Score } from '$lib/types/scoringTypes';

export interface Player {
	id: number;
	name: string;
}

export interface ScoringEntity extends Player {
	score: number;
	scoreHistory: Score[];
}
