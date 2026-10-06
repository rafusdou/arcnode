// Local dev entrypoint. In production (Vercel) the same app is served by
// api/[...all].js as a serverless function instead of this long-lived
// process — see server/app.js for the actual routes/logic.
import { app } from "./app.js";

const { PORT = 4000 } = process.env;

app.listen(PORT, () => {
  console.log(`ArcNode checkout backend escuchando en http://localhost:${PORT}`);
});
