// An error whose message is safe and useful to show to the user as-is.
// The API answers these with 400; anything else becomes a generic 500.
export class UserFacingError extends Error {}
