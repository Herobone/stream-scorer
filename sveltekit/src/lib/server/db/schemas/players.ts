import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';
import { playersToGames } from './playersToGames';
import { users } from './users';

export const players = pgTable('players', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	owner: text('owner')
		.notNull()
		.references(() => users.id)
});
export const playerRelations = relations(players, ({ many, one }) => ({
	playersToGames: many(playersToGames),
	owner: one(users, {
		fields: [players.owner],
		references: [users.id],
		relationName: 'owner'
	})
}));
