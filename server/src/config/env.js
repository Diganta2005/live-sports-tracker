import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, "../../../.env") });
dotenv.config();

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = Object.freeze({
  port: toPositiveInteger(process.env.PORT, 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  apiFootballKey: process.env.API_FOOTBALL_KEY || "",
  apiFootballBaseUrl:
    process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io",
  mongoUri: process.env.MONGODB_URI || "",
  refreshMs: Math.max(toPositiveInteger(process.env.DATA_REFRESH_MS, 30000), 10000)
});
