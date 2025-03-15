import { GameType } from '../../../types/GameOptions';
import type { ScoreOptions } from '../../../types/ScoringEngine';
import { relations } from 'drizzle-orm';
import { integer, jsonb, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { playersToGames } from './playersToGames';

const gameTypeValues = Object.values(GameType) as string[];

export const gameTypeEnum = pgEnum('game_type', ['unknown', ...gameTypeValues]);

export const games = pgTable('games', {
	id: serial('id').primaryKey(),
	gameType: text().$type<GameType>().notNull(),
	owner: text('owner')
		.notNull()
		.references(() => users.id),
	gameScoreOptions: jsonb('game_score_options').notNull().default('{}').$type<ScoreOptions>(),
	initialScore: integer('initial_score').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const gameRelations = relations(games, ({ one, many }) => ({
	owner: one(users, {
		fields: [games.owner],
		references: [users.id],
		relationName: 'owner'
	}),
	playersToGames: many(playersToGames)
}));
