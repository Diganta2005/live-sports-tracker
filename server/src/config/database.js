import mongoose from "mongoose";
import { env } from "./env.js";

export const databaseIsReady = () => mongoose.connection.readyState === 1;

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn("MONGODB_URI is not set; fantasy teams will use temporary in-memory storage.");
    return false;
  }

  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.info("Connected to MongoDB.");
    return true;
  } catch (error) {
    console.warn(`MongoDB connection unavailable: ${error.message}`);
    console.warn("Fantasy teams will use temporary in-memory storage until MongoDB is available.");
    return false;
  }
}

