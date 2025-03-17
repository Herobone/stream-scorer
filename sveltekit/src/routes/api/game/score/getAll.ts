import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Database } from '$lib/server/db';
import type { Score } from '$lib/types/scoringTypes';

export const getAll: RequestHandler = async ({ url }) => {
	const gameId = url.searchParams.get('gameId');
	const withHistory = url.searchParams.get('withHistory');
	if (!gameId) {
		return json({ success: false, message: 'Game ID not provided' }, { status: 400 });
	}

	const playerScores = await Database.valkey.hgetall(`game:${gameId}:players`);
	if (withHistory === null) {
		return json({ success: true, scores: playerScores });
	}
	const history: Record<string, Score[]> = {};
	const playerIds = Object.keys(playerScores);
	for (const playerId of playerIds) {
		const historyDb = await Database.valkey.lrange(`game:${gameId}:${playerId}:hist`, 0, -1);
		history[playerId] = historyDb.reverse().map((hist) => JSON.parse(hist));
	}
	return json({ success: true, scores: playerScores, history });
};
