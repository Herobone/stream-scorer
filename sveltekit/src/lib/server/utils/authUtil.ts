import type { Session } from '@auth/sveltekit';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { Database } from '$lib/server/db';
import { users } from '$lib/server/db/schemas';
import { HttpError, NotFoundError, UnauthorizedError } from '$lib/errors';

export async function getUID(session: Session | null): Promise<string> {
	if (!session?.user) {
		throw new UnauthorizedError('No user session');
	}

	if (session.user.id) {
		return session.user.id;
	}

	if (!session.user.email) {
		throw new HttpError('Neither UID nor email available', 400);
	}

	const result = await Database.db.query.users.findFirst({
		where: eq(users.email, session.user.email),
		columns: {
			id: true
		}
	});
	if (!result) {
		throw new NotFoundError('User not found');
	}
	return result.id;
}
