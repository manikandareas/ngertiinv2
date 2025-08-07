export function generateAccessCode(
	minLength: number = 6,
	maxLength: number = 12,
) {
	const length =
		Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
	return Math.random().toString(36).substring(2, length).toUpperCase();
}
