// Vercel serverless entrypoint: the Express app itself defines the /api/*
// routes, this file just hands each request to it. The catch-all filename
// ([...all]) is what makes Vercel route every /api/* path here.
import { app } from "../server/app.js";

export default function handler(req, res) {
  app(req, res);
}
