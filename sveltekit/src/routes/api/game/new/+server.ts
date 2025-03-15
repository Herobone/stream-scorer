import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Database } from '$lib/server/db';
import { games, players, playersToGames } from '$lib/server/db/schemas';
import type { ScoreOptions } from '$lib/types/ScoringEngine';
import { getUID } from '$lib/server/utils/authUtil';
import type { GameOptionsNoPlayers, GameType } from '$lib/types/GameOptions';

export const POST: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();
	console.log(session);

	const uid = await getUID(session);
	if (typeof uid !== 'string') {
		return uid;
	}

	const data: Partial<{
		gameType: string;
		playerNames: string[];
		gameOptions: ScoreOptions;
		initialScore: number;
	}> = await request.json();

	console.log(data);

	if (!data.gameType) {
		return json({ success: false, message: 'Game type not provided' }, { status: 400 });
	}

	if (!data.playerNames || data.playerNames.length < 1) {
		return json({ success: false, message: 'At least one player is required' }, { status: 400 });
	}

	const gameResult = await Database.db
		.insert(games)
		.values({
			gameType: data.gameType as GameType,
			owner: uid,
			gameScoreOptions: data.gameOptions,
			initialScore: data.initialScore
		})
		.returning({
			gameId: games.id,
			initialScore: games.initialScore,
			gameScoreOptions: games.gameScoreOptions
		});

	const gameId = gameResult[0].gameId;

	if (!gameResult) {
		return json({ success: false, message: 'Failed to create game' }, { status: 500 });
	}

	const playerResults = await Database.db
		.insert(players)
		.values(data.playerNames.map((name) => ({ name, owner: uid })))
		.returning({ playerId: players.id, name: players.name });

	await Database.db.insert(playersToGames).values(
		playerResults.map((player) => ({
			playerId: player.playerId,
			gameId
		}))
	);

	const gameSettings = {
		type: data.gameType as never, // Shut up type checker
		initialScore: gameResult[0].initialScore,
		scoringOptions: gameResult[0].gameScoreOptions
	} satisfies GameOptionsNoPlayers;

	const scores = new Map<number, number>();
	playerResults.forEach((player) => scores.set(player.playerId, gameSettings.initialScore));

	for (const player of playerResults) {
		await Database.valkey.set(
			`game:${gameId}:player:${player.playerId}:score`,
			gameSettings.initialScore
		);
	}

	await Database.valkey
		.multi()
		.set(`game:${gameId}:settings`, JSON.stringify(gameSettings))
		.set(`game:${gameId}:owner`, uid)
		.hset(`game:${gameId}:players`, scores)
		.set(`game:${gameId}:sequence`, 0)
		.exec();

	return json({ success: true, gameId });
};
