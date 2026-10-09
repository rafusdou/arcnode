// See api/checkout/index.js for why each endpoint gets its own file.
import { app } from "../../server/app.js";

export default function handler(req, res) {
  app(req, res);
}
