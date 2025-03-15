import { Database } from '$lib/server/db';
import { getUID } from '$lib/server/utils/authUtil';
import type { GameType } from '$lib/types/GameOptions';
import type { Score } from '$lib/types/scoringTypes';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScoringEngine } from '$lib/scoring';
import { getData, isOwner, sendGameUpdate } from '$lib/server/utils/gameDataUtils';
import { HttpError } from '$lib/errors';

export const addScore: RequestHandler = async ({ locals, request }) => {
	try {
		const uid = await getUID(await locals.auth());
		const {
			gameId,
			playerId,
			score
		}: { gameId: number; gameType: GameType; playerId: number; score: Score } =
			await request.json();

		await isOwner(gameId, uid);

		//const gameSettings = await getGameSettings(gameId);
		//const currentScore = await getPlayerScore(gameId, playerId);
		const [gameSettings, currentScore] = await getData(gameId, playerId);
		const scoringEngine = getScoringEngine(gameSettings.type);

		const newScore = scoringEngine.calculate(
			currentScore,
			score.score,
			score.multiplier,
			gameSettings.initialScore,
			gameSettings.scoringOptions
		);

		const result = await Database.valkey
			.multi()
			.hset(`game:${gameId}:players`, playerId.toString(), newScore)
			.lpush(`game:${gameId}:${playerId}:hist`, JSON.stringify(score))
			.incr(`game:${gameId}:sequence`)
			.exec();

		if (!result) {
			return json({ success: false, message: 'Failed to update score' }, { status: 500 });
		}

		const sequence = result[2][1] as number;

		await sendGameUpdate(gameId, {
			sequence: sequence,
			playerId,
			action: 'add',
			score,
			totalScore: newScore
		});

		return json({ success: true, score: newScore, sequence });
	} catch (e) {
		if (e instanceof HttpError) {
			return json({ success: false, message: e.message }, { status: e.status });
		}
		return json({ success: false, message: e });
	}
};
