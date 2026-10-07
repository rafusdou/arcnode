// See api/checkout/index.js for why this is a dedicated file instead of a
// single catch-all.
import { app } from "../../../server/app.js";

export default function handler(req, res) {
  app(req, res);
}
