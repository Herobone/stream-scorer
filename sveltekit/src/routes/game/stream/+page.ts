import type { Score } from '$lib/types/scoringTypes';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({url, fetch}) => {
    const userId = url.searchParams.get('userId');
    const gameIdParam = url.searchParams.get('gameId');
    if (!userId && !gameIdParam) {
        throw error(400, 'User ID or Game ID not provided');
    }

    let gameId: number;
    if (gameIdParam) {
        gameId = Number.parseInt(gameIdParam);
    } else {
        const response = await fetch(`/api/game/getActive?userId=${userId}`);
        const activeGame: {success: boolean, gameId: number} = await response.json();
        if (!activeGame.success) {
            return {
                gameId: null
            };
        }
        gameId = activeGame.gameId;
    }
    const response = await fetch(`/api/game/score?gameId=${gameId}&withHistory`);
    const game: {success: boolean, scores: Record<string, string>, history: Record<string, Score[]>} = await response.json();

    const scores: Map<number, number> = new Map();
    for (const playerId in game.scores) {
        scores.set(Number.parseInt(playerId), Number.parseInt(game.scores[playerId]));
    }

    const history: Map<number, Score[]> = new Map();
    for (const playerId in game.history) {
        history.set(Number.parseInt(playerId), game.history[playerId]);
    }

    if (!game.success) {
        return {
            gameId
        }
    }

    return {
        gameId,
        scores,
        history
    };
}) satisfies PageLoad;