import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';
import { games } from './game';
import { players } from './players';

export const playersToGames = pgTable(
	'players_to_games',
	{
		playerId: integer('player_id')
			.notNull()
			.references(() => players.id),
		gameId: integer('game_id')
			.notNull()
			.references(() => games.id)
	},
	(t) => [primaryKey({ columns: [t.playerId, t.gameId] })]
);

export const playersToGamesRelations = relations(playersToGames, ({ one }) => ({
	player: one(players, {
		fields: [playersToGames.playerId],
		references: [players.id]
	}),
	game: one(games, {
		fields: [playersToGames.gameId],
		references: [games.id]
	})
}));
