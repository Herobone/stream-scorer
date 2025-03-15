import { SvelteKitAuth } from '@auth/sveltekit';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Twitch from '@auth/sveltekit/providers/twitch';
import { Database } from '$lib/server/db';
import { accounts, sessions, users, verificationTokens } from '$lib/server/db/schemas';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [Twitch],
	adapter: DrizzleAdapter(Database.db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens
	})
});
