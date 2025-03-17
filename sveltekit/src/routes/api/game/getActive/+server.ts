import { Database } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({url}) => {
    const userId = url.searchParams.get('userId');
    if (!userId) {
        return json({success: false, message: 'User ID not provided'}, {status: 400});
    }

    const data = await Database.valkey.get(`user:${userId}:activeGame`);
    if (!data) {
        return json({success: false, message: "User has no active Game"}, {status: 404});
    }

    return json({success: true, gameId: Number.parseInt(data)});
};