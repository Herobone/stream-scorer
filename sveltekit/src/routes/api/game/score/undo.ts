import { getUID } from '$lib/server/utils/authUtil';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Database } from '$lib/server/db';
import type { Score } from '$lib/types/scoringTypes';
import { getScoringEngine } from '$lib/scoring';
import type { SubscriberUpdateData } from '$lib/types/SubscriberUpdateData';
import { HttpError } from '$lib/errors';
import { getData, isOwner } from '$lib/server/utils/gameDataUtils';

export const undo: RequestHandler = async ({ locals, request }) => {
	try {
		const uid = await getUID(await locals.auth());
		const { gameId, playerId }: { gameId: number; playerId: number } = await request.json();

		await isOwner(gameId, uid);

		const [gameSettings, currentScore] = await getData(gameId, playerId);
		const scoringEngine = getScoringEngine(gameSettings.type);

		const lastAction = await Database.valkey.lpop(`game:${gameId}:${playerId}:hist`);
		if (!lastAction) {
			return json({ success: false, message: 'No actions to undo' }, { status: 400 });
		}

		const lastScore: Score = JSON.parse(lastAction);

		const newScore = scoringEngine.undo(currentScore, lastScore);

		const result = await Database.valkey
			.multi()
			.hset(`game:${gameId}:players`, playerId.toString(), newScore)
			.decr(`game:${gameId}:sequence`)
			.exec();

		if (!result) {
			return json({ success: false, message: 'Failed to update score' }, { status: 500 });
		}

		const sequence = result[1][1] as number;

		const updateData: SubscriberUpdateData = {
			sequence: sequence,
			playerId,
			action: 'remove',
			score: lastScore,
			totalScore: newScore
		};

		// Publish to the game-specific channel
		const channel = `game:${gameId}`;
		const message = JSON.stringify(updateData);

		await Database.valkey.publish(channel, message);

		return json({ success: true, score: newScore, sequence });
	} catch (e) {
		if (e instanceof HttpError) {
			return json({ success: false, message: e.message }, { status: e.status });
		}
		return json({ success: false, message: e });
	}
};
