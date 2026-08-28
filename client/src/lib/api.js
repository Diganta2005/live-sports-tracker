import axios from "axios";

const apiOrigin = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const api = axios.create({ baseURL: apiOrigin, timeout: 15000 });

const extractResponse = (response) => response.data?.response || [];

export const readableError = (error) =>
  error.response?.data?.message || error.message || "Something went wrong while loading data.";

export const sportsApi = {
  health: () => api.get("/api/health").then((response) => response.data),
  liveFixtures: () => api.get("/api/football/live").then(extractResponse),
  upcomingFixtures: (from, to) =>
    api
      .get("/api/football/upcoming", { params: { from, to } })
      .then(extractResponse),
  fixture: (fixtureId) =>
    api.get("/api/football/fixtures/" + fixtureId).then(extractResponse),
  events: (fixtureId) =>
    api.get("/api/football/fixtures/" + fixtureId + "/events").then(extractResponse),
  statistics: (fixtureId) =>
    api.get("/api/football/fixtures/" + fixtureId + "/statistics").then(extractResponse),
  players: (fixtureId) =>
    api.get("/api/football/fixtures/" + fixtureId + "/players").then(extractResponse),
  leaderboard: () => api.get("/api/fantasy/leaderboard").then((response) => response.data),
  createFantasyTeam: (payload) =>
    api.post("/api/fantasy/teams", payload).then((response) => response.data)
};

export const liveStreamUrl = () => apiOrigin + "/api/football/stream/live";

