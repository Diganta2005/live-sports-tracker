import { Router } from "express";
import { databaseIsReady } from "../config/database.js";
import { FantasyTeam } from "../models/FantasyTeam.js";

export const fantasyRouter = Router();
let memoryTeams = [];

const sanitizePlayer = (player) => ({
  playerId: Number.isFinite(Number(player.playerId)) ? Number(player.playerId) : undefined,
  name: String(player.name || "").trim(),
  team: String(player.team || "Unknown").trim(),
  position: String(player.position || "MID").trim().toUpperCase(),
  points: Number.isFinite(Number(player.points)) ? Number(player.points) : 0
});

const serializeTeam = (team) => ({
  id: String(team._id || team.id),
  name: team.name,
  ownerName: team.ownerName,
  players: team.players,
  totalPoints: team.totalPoints,
  createdAt: team.createdAt
});

fantasyRouter.get("/leaderboard", async (_request, response) => {
  try {
    const teams = databaseIsReady()
      ? await FantasyTeam.find().sort({ totalPoints: -1, createdAt: 1 }).lean()
      : [...memoryTeams].sort((a, b) => b.totalPoints - a.totalPoints);
    response.json({ storage: databaseIsReady() ? "mongodb" : "memory", teams: teams.map(serializeTeam) });
  } catch (error) {
    response.status(500).json({ message: `Could not load the leaderboard: ${error.message}` });
  }
});

fantasyRouter.post("/teams", async (request, response) => {
  const name = String(request.body?.name || "").trim();
  const ownerName = String(request.body?.ownerName || "").trim();
  const players = Array.isArray(request.body?.players) ? request.body.players.map(sanitizePlayer) : [];

  if (!name || !ownerName) {
    return response.status(400).json({ message: "Team name and manager name are required." });
  }
  if (players.length < 1 || players.length > 15 || players.some((player) => !player.name)) {
    return response.status(400).json({ message: "Choose between 1 and 15 valid players." });
  }

  const totalPoints = players.reduce((total, player) => total + player.points, 0);
  const payload = { name, ownerName, players, totalPoints };

  try {
    const team = databaseIsReady()
      ? await FantasyTeam.create(payload)
      : { ...payload, id: `memory-${Date.now()}`, createdAt: new Date().toISOString() };
    if (!databaseIsReady()) memoryTeams = [team, ...memoryTeams];
    return response.status(201).json({ storage: databaseIsReady() ? "mongodb" : "memory", team: serializeTeam(team) });
  } catch (error) {
    return response.status(400).json({ message: `Could not create the team: ${error.message}` });
  }
});

