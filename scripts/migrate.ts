// Applies pending SQL migrations from ./drizzle (Neon if DATABASE_URL is set, else local PGlite).
import { connect } from './lib/connect';

const { close, target } = await connect();
console.log(`✓ migrations applied on ${target}`);
await close();
