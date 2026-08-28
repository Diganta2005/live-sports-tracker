import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    playerId: { type: Number },
    name: { type: String, required: true, trim: true },
    team: { type: String, default: "Unknown", trim: true },
    position: { type: String, default: "MID", trim: true },
    points: { type: Number, default: 0 }
  },
  { _id: false }
);

const fantasyTeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 48 },
    ownerName: { type: String, required: true, trim: true, maxlength: 48 },
    players: {
      type: [playerSchema],
      validate: {
        validator: (players) => players.length >= 1 && players.length <= 15,
        message: "A fantasy team must contain between 1 and 15 players."
      }
    },
    totalPoints: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

export const FantasyTeam = mongoose.model("FantasyTeam", fantasyTeamSchema);

