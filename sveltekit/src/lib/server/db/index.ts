import { drizzle } from 'drizzle-orm/bun-sql';
import * as schema from '$lib/server/db/schemas';
import { env } from '$env/dynamic/private';
import Valkey from 'iovalkey';

import { SQL } from 'bun';

type DrizzleClient = ReturnType<typeof createDrizzleClient>;

function createDrizzleClient() {
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

	const client = new SQL(process.env.DATABASE_URL!);

	return drizzle(client, {
		schema
	});
}

export class Database {
	private static instance: DrizzleClient | null = null;
	private static valkeyInstance: Valkey | null = null;

	public static get db(): DrizzleClient {
		if (Database.instance === null) {
			// Create the connection only when first requested at runtime
			Database.instance = createDrizzleClient();
		}

		return Database.instance;
	}

	public static get valkey(): Valkey {
		if (Database.valkeyInstance === null) {
			Database.valkeyInstance = new Valkey();

			// Handle connection errors
			Database.valkeyInstance.on('error', (err) => {
				console.error('Valkey connection error:', err);
			});
		}

		return Database.valkeyInstance;
	}
}
