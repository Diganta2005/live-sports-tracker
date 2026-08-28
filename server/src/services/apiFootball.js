import axios from "axios";
import { env } from "../config/env.js";

export class SportsProviderError extends Error {
  constructor(message, status = 503) {
    super(message);
    this.name = "SportsProviderError";
    this.status = status;
  }
}

const footballClient = axios.create({
  baseURL: env.apiFootballBaseUrl,
  timeout: 12000
});

export async function requestFootball(path, params = {}) {
  if (!env.apiFootballKey) {
    throw new SportsProviderError(
      "API-Football is not configured. Add API_FOOTBALL_KEY to your .env file.",
      503
    );
  }

  try {
    const { data } = await footballClient.get(path, {
      params,
      headers: { "x-apisports-key": env.apiFootballKey }
    });
    return data;
  } catch (error) {
    const status = error.response?.status || 502;
    const providerMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.token ||
      error.response?.data?.errors?.requests ||
      error.message;
    throw new SportsProviderError(`API-Football request failed: ${providerMessage}`, status);
  }
}

