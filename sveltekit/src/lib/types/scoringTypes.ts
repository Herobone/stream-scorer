export type PointValue = {
	id: string;
	label: string;
	value: number;
};

export type MultiplierValues = Map<
	number,
	{
		id: string;
		label: string;
		shortLabel?: string;
	}
>;

export type Score = {
	score: number;
	multiplier: number;
};
