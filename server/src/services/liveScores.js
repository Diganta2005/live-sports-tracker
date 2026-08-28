import { env } from "../config/env.js";
import { requestFootball } from "./apiFootball.js";

const clients = new Set();
let timer;
let latestPayload = null;

function writeEvent(response, event, payload) {
  response.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
}

function broadcast(event, payload) {
  clients.forEach((client) => writeEvent(client, event, payload));
}

async function refreshLiveScores() {
  if (clients.size === 0) return;

  try {
    const payload = await requestFootball("fixtures", { live: "all" });
    latestPayload = payload;
    broadcast("score-update", payload);
  } catch (error) {
    broadcast("provider-error", { message: error.message });
  }
}

function beginPolling() {
  if (timer || clients.size === 0) return;
  refreshLiveScores();
  timer = setInterval(refreshLiveScores, env.refreshMs);
}

function stopPolling() {
  if (clients.size === 0 && timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

export function subscribeToLiveScores(response) {
  clients.add(response);
  writeEvent(response, "connected", { refreshMs: env.refreshMs });
  if (latestPayload) writeEvent(response, "score-update", latestPayload);
  beginPolling();

  return () => {
    clients.delete(response);
    stopPolling();
  };
}

