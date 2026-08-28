import cors from "cors";
import express from "express";
import { connectDatabase, databaseIsReady } from "./config/database.js";
import { env } from "./config/env.js";
import { fantasyRouter } from "./routes/fantasy.js";
import { footballRouter } from "./routes/football.js";

const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    database: databaseIsReady() ? "connected" : "memory fallback",
    footballProviderConfigured: Boolean(env.apiFootballKey),
    liveRefreshMs: env.refreshMs
  });
});

app.use("/api/football", footballRouter);
app.use("/api/fantasy", fantasyRouter);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: "Unexpected server error." });
});

await connectDatabase();
app.listen(env.port, () => {
  console.info(`Sports tracker API listening on http://localhost:${env.port}`);
});

