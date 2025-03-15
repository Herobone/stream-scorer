import type { Player } from '$lib/types/Player';
import type { ScoreOptions } from '$lib/types/ScoringEngine';
import type { DartsScoringOptions } from '$lib/scoring/darts';

export type ScoreOptionMap = {
	[GameType.CUSTOM]: ScoreOptions;
	[GameType.DARTS]: DartsScoringOptions;
};

export type GameOptionsNoPlayers = {
	[T in GameType]: {
		type: T;
		initialScore: number;
		scoringOptions: ScoreOptionMap[T];
	};
}[GameType];

export type GameOptions = GameOptionsNoPlayers & {
	players: Player[];
};

export enum GameType {
	CUSTOM = 'custom',
	DARTS = 'darts'
}
