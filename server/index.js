// Local dev entrypoint. In production (Vercel) the same app is served by
// the files under api/ as serverless functions instead of this long-lived
// process — see server/app.js for the actual routes/logic.
import { app } from "./app.js";

const { PORT = 4000 } = process.env;

app.listen(PORT, () => {
  console.log(`Changuihost checkout backend escuchando en http://localhost:${PORT}`);
});
