import { undo } from './undo';
import { getAll } from './getAll';
import { addScore } from './add';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = addScore;

export const GET: RequestHandler = getAll;

export const DELETE: RequestHandler = undo;
