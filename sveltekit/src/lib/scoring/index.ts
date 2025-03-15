import { GameType } from '$lib/types/GameOptions';
import type { IScoringEngine } from '$lib/types/ScoringEngine';
import { custom } from '$lib/scoring/custom';
import { darts } from '$lib/scoring/darts';
import { NotFoundError } from '$lib/errors';

export function getScoringEngine(type: GameType): IScoringEngine {
	switch (type) {
		case GameType.CUSTOM:
			return custom;
		case GameType.DARTS:
			return darts;
		default:
			throw new NotFoundError(`Scoring engine for game type ${type} not found`);
	}
}
