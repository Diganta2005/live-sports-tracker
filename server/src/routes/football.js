import { Router } from "express";
import { requestFootball, SportsProviderError } from "../services/apiFootball.js";
import { subscribeToLiveScores } from "../services/liveScores.js";

export const footballRouter = Router();

const sendProviderError = (response, error) => {
  const status = error instanceof SportsProviderError ? error.status : 500;
  response.status(status).json({ message: error.message || "Unable to load football data." });
};

const sendFootballResponse = (path, params) => async (_request, response) => {
  try {
    response.json(await requestFootball(path, params(_request)));
  } catch (error) {
    sendProviderError(response, error);
  }
};

footballRouter.get("/live", sendFootballResponse("fixtures", () => ({ live: "all" })));

footballRouter.get(
  "/upcoming",
  sendFootballResponse("fixtures", (request) => {
    const start = request.query.from || new Date().toISOString().slice(0, 10);
    const end = request.query.to || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    return { from: start, to: end, timezone: request.query.timezone || "UTC" };
  })
);

footballRouter.get(
  "/fixtures/:fixtureId",
  sendFootballResponse("fixtures", (request) => ({ id: request.params.fixtureId }))
);
footballRouter.get(
  "/fixtures/:fixtureId/events",
  sendFootballResponse("fixtures/events", (request) => ({ fixture: request.params.fixtureId }))
);
footballRouter.get(
  "/fixtures/:fixtureId/statistics",
  sendFootballResponse("fixtures/statistics", (request) => ({ fixture: request.params.fixtureId }))
);
footballRouter.get(
  "/fixtures/:fixtureId/players",
  sendFootballResponse("fixtures/players", (request) => ({ fixture: request.params.fixtureId }))
);

footballRouter.get("/stream/live", (request, response) => {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive"
  });
  response.flushHeaders();

  const unsubscribe = subscribeToLiveScores(response);
  request.on("close", unsubscribe);
});

