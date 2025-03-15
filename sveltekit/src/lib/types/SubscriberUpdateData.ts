import type { Score } from './scoringTypes';

export interface SubscriberUpdateData {
	sequence: number;
	playerId: number;
	action: 'add' | 'remove';
	score: Score;
	totalScore: number;
}
