// Explicit per-route file instead of a [...catchall] — Vercel's catch-all
// convention wasn't matching nested paths in this project (it only matched a
// single path segment), so each /api/* endpoint gets its own file instead,
// all delegating to the same Express app for the actual logic.
import { app } from "../../server/app.js";

export default function handler(req, res) {
  app(req, res);
}
