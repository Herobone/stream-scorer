import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { games } from './game';

export const users = pgTable('users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: timestamp('email_verified', { mode: 'date' }),
	image: text('image')
});

export const userRelations = relations(users, ({ many }) => ({
	games: many(games)
}));
