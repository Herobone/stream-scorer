import { ForbiddenError, NotFoundError } from '$lib/errors';
import { Database } from '$lib/server/db';
import type { GameOptionsNoPlayers } from '$lib/types/GameOptions';
import type { SubscriberUpdateData } from '$lib/types/SubscriberUpdateData';

export async function getGameSettings(gameId: number): Promise<GameOptionsNoPlayers> {
	const gameSettingsString = await Database.valkey.get(`game:${gameId}:settings`);
	if (!gameSettingsString) {
		throw new NotFoundError('Game not found');
	}
	return JSON.parse(gameSettingsString);
}

export async function sendGameUpdate(gameId: number, updateData: SubscriberUpdateData) {
	// Publish to the game-specific channel
	const channel = `game:${gameId}`;
	const message = JSON.stringify(updateData);

	await Database.valkey.publish(channel, message);
}

export async function getPlayerScore(gameId: number, playerId: number): Promise<number> {
	const currentScoreString =
		(await Database.valkey.hget(`game:${gameId}:players`, playerId.toString())) || '0';
	return parseInt(currentScoreString);
}

export async function isOwner(gameId: number, uid: string) {
	const gameOwnerString = await Database.valkey.get(`game:${gameId}:owner`);
	if (!gameOwnerString || gameOwnerString !== uid) {
		throw new ForbiddenError('Not your game');
	}
}

/**
 * Gets the game settings and player score from the database using a pipeline for reduced load
 * @param gameId ID of the game
 * @param playerId ID of the player to get data for
 */
export async function getData(
	gameId: number,
	playerId: number
): Promise<[GameOptionsNoPlayers, number]> {
	const result = await Database.valkey
		.pipeline()
		.get(`game:${gameId}:settings`)
		.hget(`game:${gameId}:players`, playerId.toString())
		.exec();

	if (!result) {
		throw new NotFoundError('Game not found');
	}

	const [settings, score] = result;
	if (settings[0] !== null || score[0] !== null) {
		console.error(settings[0], score[0]);
		throw new Error('Database error');
	}

	return [JSON.parse(settings[1] as string), parseInt(score[1] as string)];
}
