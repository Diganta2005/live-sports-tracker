# PitchPulse — Live Sports Score & Stats Tracker

PitchPulse is a full-stack football/soccer tracker with API-Football data, live Server-Sent Events,
match analysis, Recharts visualizations, a MongoDB-ready fantasy leaderboard, and an explicitly
educational simulated-odds lab.

## Stack

- Client: React, Vite, Tailwind CSS, React Router, Axios, Recharts
- API: Node.js, Express, Axios, dotenv, Server-Sent Events
- Persistence: MongoDB and Mongoose (with a temporary in-memory fantasy fallback if MongoDB is offline)
- Sports feed: API-Football v3

## Quick start

1. Install Node.js 20.19 or newer and ensure node and npm are on your PATH.
2. In the repository root, copy .env.example to .env.
3. Set API_FOOTBALL_KEY to a valid API-Football key. Set MONGODB_URI to enable persistent
   fantasy teams; MongoDB is optional during initial UI development.
4. Install dependencies with npm install.
5. Start both applications with npm run dev.
6. Open http://localhost:5173.

The Vite client proxies /api to http://localhost:4000 during development. To target a deployed
server, set VITE_API_URL to its origin in the frontend environment.

## Features

- Live scores streamed from the Express API through SSE
- Upcoming fixture search by date range
- Match centre with score, event commentary, team statistics, chart, and player tables
- Fantasy team builder that derives transparent estimated points from fixture player statistics
- Fantasy leaderboard persisted in MongoDB when configured
- Educational probability sandbox; it is not connected to wagering, markets, or money

## API surface

- GET /api/health
- GET /api/football/live
- GET /api/football/upcoming?from=YYYY-MM-DD&to=YYYY-MM-DD
- GET /api/football/fixtures/:fixtureId
- GET /api/football/fixtures/:fixtureId/events
- GET /api/football/fixtures/:fixtureId/statistics
- GET /api/football/fixtures/:fixtureId/players
- GET /api/football/stream/live (SSE)
- GET /api/fantasy/leaderboard
- POST /api/fantasy/teams
- # ⚽ Live Sports Score & Stats Tracker

A modern full-stack football/sports tracking platform that provides live match scores, match events, player statistics, team information, fantasy points, performance analytics, and educational simulated match odds.

## 🚀 Features

### 🔴 Live Scores
- Real-time football match scores
- Live match status and minute
- Upcoming fixtures
- Match results
- Automatic live updates using Server-Sent Events (SSE)

### 📢 Live Match Events
- Goals
- Yellow cards
- Red cards
- Substitutions
- Penalties
- VAR events
- Half-time and full-time events

### 📊 Statistics & Analytics
- Team statistics
- Player statistics
- Match statistics
- Possession
- Shots
- Passing
- Player ratings
- Performance charts

### ⭐ Fantasy Football
- Create a fantasy team
- Player selection
- Fantasy budget
- Position restrictions
- Captain and vice-captain
- Automatic fantasy-point calculation
- Fantasy leaderboard

### 📈 Educational Odds Simulation
- Home-win probability
- Draw probability
- Away-win probability
- Simulated odds
- Odds movement charts

> **Educational Simulation Only — No Real-Money Betting**

### 👤 User Features
- User registration
- Login/logout
- JWT authentication
- User profile
- Favorite teams and players
- Notification preferences

---

# 🛠️ Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts

## Backend

- Node.js
- Express.js
- Axios
- Server-Sent Events (SSE)
- JWT
- bcrypt

## Database

- MongoDB
- Mongoose

## Sports Data

- API-Football

## Development Tools

- VS Code
- Git
- GitHub
- Postman

---

# 🏗️ Architecture

```text
                  API-Football
                       │
                       ▼
                ┌─────────────┐
                │ Node/Express│
                │   Backend   │
                └──────┬──────┘
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
         MongoDB     Cache       SSE
            │                     │
            └──────────┬──────────┘
                       ▼
                 React Frontend
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   Live Scores     Statistics      Fantasy
        │              │              │
        ▼              ▼              ▼
   Commentary       Charts       Leaderboard

## Data and safety notes

API-Football remains the source of truth for football information. The backend keeps the API key
server-side and passes only the required data to the browser. The simulated-odds page is a
transparent learning feature, not a betting product or an endorsement of gambling.
🔮 Future Improvements
Possible future features:
- Multi-sport support
- Cricket
- Basketball
- Tennis
- Advanced player comparison
- Advanced team analytics
- Push notifications
- Redis caching
- WebSocket support
- AI-powered match analysis
- AI-generated match summaries
- Historical performance analysis
- More advanced fantasy leagues
