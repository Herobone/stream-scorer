import { getUID } from '$lib/server/utils/authUtil';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { games } from '$lib/server/db/schemas';
import { Database } from '$lib/server/db';
import { type GameOptions } from '$lib/types/GameOptions';
import { error } from '@sveltejs/kit';
import type { Player } from '$lib/types/Player';
import type { Score } from '$lib/types/scoringTypes';

export const load = (async ({ locals, params }) => {
	const uid = await getUID(await locals.auth());
	const { id } = params;

	const gameResult = await Database.db.query.games.findFirst({
		where: eq(games.id, Number.parseInt(id)),
		with: {
			playersToGames: {
				with: {
					player: true
				},
				columns: {}
			}
		}
	});

	console.log(gameResult);

	if (!gameResult) {
		return error(404, 'Game not found');
	}

	const playerScores = await Database.valkey.hgetall(`game:${id}:players`);
	const history: Record<string, Score[]> = {};
	const playerIds = Object.keys(playerScores);
	for (const playerId of playerIds) {
		const historyDb = await Database.valkey.lrange(`game:${id}:${playerId}:hist`, 0, -1);
		history[playerId] = historyDb.reverse().map((hist) => JSON.parse(hist));
	}

	const sequenceString = (await Database.valkey.get(`game:${id}:sequence`)) || '0';
	const sequence = parseInt(sequenceString);

	return {
		uid,
		gameOptions: {
			type: gameResult.gameType,
			players: gameResult.playersToGames.map((ptg) => ptg.player as Player),
			initialScore: gameResult.initialScore,
			scoringOptions: gameResult.gameScoreOptions
		} as GameOptions,
		gameId: id,
		playerScores,
		history,
		sequence
	};
}) satisfies LayoutServerLoad;
