export class HttpError extends Error {
	private statusCode: number;
	constructor(msg: string, statusCode: number) {
		super(msg);
		this.name = 'HttpError';
		this.statusCode = statusCode;

		Object.setPrototypeOf(this, UnauthorizedError.prototype);
	}

	public get status(): number {
		return this.statusCode;
	}
}

export class UnauthorizedError extends HttpError {
	constructor(msg: string) {
		super(msg, 401);
		this.name = 'UnauthorizedError';

		Object.setPrototypeOf(this, UnauthorizedError.prototype);
	}
}

export class ForbiddenError extends HttpError {
	constructor(msg: string) {
		super(msg, 403);
		this.name = 'ForbiddenError';

		Object.setPrototypeOf(this, ForbiddenError.prototype);
	}
}

export class NotFoundError extends HttpError {
	constructor(msg: string) {
		super(msg, 404);
		this.name = 'NotFoundError';

		Object.setPrototypeOf(this, NotFoundError.prototype);
	}
}
