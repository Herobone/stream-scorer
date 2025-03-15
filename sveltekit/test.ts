import Valkey from 'iovalkey';

// Define the data structure to match our Go service
interface Score {
	score: number;
	multiplier: number;
}

interface SubscriberUpdateData {
	sequence: number;
	playerId: number;
	action: 'add' | 'remove';
	score: Score;
	totalScore: number;
}

async function main() {
	// Create a Valkey client
	const client = new Valkey();

	// Handle connection errors
	client.on('error', (err) => {
		console.error('Valkey connection error:', err);
	});

	console.log('Connected to Valkey');

	try {
		// Send some sample game updates
		await publishSampleGameUpdates(client);
	} catch (error) {
		console.error('Error publishing updates:', error);
	} finally {
		await client.quit();
		console.log('Disconnected from Valkey');
	}
}

async function publishSampleGameUpdates(client: Valkey) {
	// Sample game IDs
	const gameIds = ['123', '456', '789'];

	// Generate and publish sample data
	for (let i = 0; i < 10; i++) {
		for (const gameId of gameIds) {
			// Create sample update data
			const updateData: SubscriberUpdateData = {
				sequence: i + 1,
				playerId: Math.floor(Math.random() * 1000) + 1,
				action: Math.random() > 0.3 ? 'add' : 'remove',
				score: {
					score: Math.floor(Math.random() * 1000),
					multiplier: Math.floor(Math.random() * 5) + 1
				},
				totalScore: Math.floor(Math.random() * 10000)
			};

			// Publish to the game-specific channel
			const channel = `game:${gameId}`;
			const message = JSON.stringify(updateData);

			const subscriberCount = await client.publish(channel, message);
			console.log(
				`Published update to ${channel}, received by ${subscriberCount} subscribers:`,
				updateData
			);

			// Wait a bit between messages
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}
}

// Continuous publishing function
async function startContinuousPublishing(client: Valkey, gameId: string, interval: number = 1000) {
	let sequence = 1;

	console.log(`Starting continuous publishing for game ${gameId} at ${interval}ms intervals`);

	// Keep reference to interval to allow stopping later
	const intervalId = setInterval(async () => {
		try {
			const updateData: SubscriberUpdateData = {
				sequence: sequence++,
				playerId: Math.floor(Math.random() * 1000) + 1,
				action: Math.random() > 0.3 ? 'add' : 'remove',
				score: {
					score: Math.floor(Math.random() * 1000),
					multiplier: Math.floor(Math.random() * 5) + 1
				},
				totalScore: Math.floor(Math.random() * 10000)
			};

			const channel = `game:${gameId}`;
			const message = JSON.stringify(updateData);

			const subscriberCount = await client.publish(channel, message);
			console.log(
				`[${new Date().toISOString()}] Published to ${channel}, received by ${subscriberCount} subscribers`
			);
		} catch (error) {
			console.error('Error publishing update:', error);
		}
	}, interval);

	// Return a function that stops the publishing
	return () => {
		clearInterval(intervalId);
		console.log(`Stopped publishing for game ${gameId}`);
	};
}

// Example of using the continuous publisher
async function runPublisherDemo() {
	const client = new Valkey();

	client.on('error', (err) => {
		console.error('Valkey connection error:', err);
	});

	await client.connect();
	console.log('Connected to Valkey');

	// Start publishing to a specific game
	const stopPublishing = await startContinuousPublishing(client, 'game123', 2000);

	// Run for 30 seconds then stop
	setTimeout(async () => {
		stopPublishing();
		await client.quit();
		console.log('Publisher demo completed');
	}, 30000);
}

// Run the demo publisher function
// runPublisherDemo().catch(console.error);

// Alternatively, run the sample updates function
main().catch(console.error);
