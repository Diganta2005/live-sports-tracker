import { useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState.jsx";
import { fixtureDate, fantasyPoints } from "../lib/formatters.js";
import { readableError, sportsApi } from "../lib/api.js";

function PlayerPool({ players, selectedIds, onToggle }) {
  if (!players.length) {
    return <EmptyState title="Select a fixture to load players" detail="The player pool is created from that fixture's published player statistics." />;
  }

  return (
    <div className="scrollbar-thin max-h-[530px] space-y-2 overflow-y-auto pr-1">
      {players.map((player) => {
        const selected = selectedIds.has(player.playerId);
        return (
          <button
            key={player.playerId}
            className={
              "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition " +
              (selected
                ? "border-teal-300/70 bg-teal-400/10"
                : "border-slate-700/60 bg-slate-900/45 hover:border-slate-500")
            }
            onClick={() => onToggle(player)}
            type="button"
          >
            <span className="min-w-0">
              <span className="block truncate font-bold text-slate-100">{player.name}</span>
              <span className="block truncate text-xs text-slate-400">{player.team} · {player.position}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-black text-teal-300">{player.points}</span>
              <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">est. pts</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function FantasyPage() {
  const [fixtures, setFixtures] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [form, setForm] = useState({ name: "", ownerName: "" });
  const [state, setState] = useState({ loading: true, poolLoading: false, saving: false, error: "", notice: "" });

  const selectedIds = useMemo(() => new Set(selectedPlayers.map((player) => player.playerId)), [selectedPlayers]);
  const totalPoints = selectedPlayers.reduce((total, player) => total + player.points, 0);

  const loadInitialData = async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const [live, upcoming, leaderboardResponse] = await Promise.all([
        sportsApi.liveFixtures(),
        sportsApi.upcomingFixtures(),
        sportsApi.leaderboard()
      ]);
      const unique = [...live, ...upcoming].filter(
        (fixture, index, values) =>
          values.findIndex((candidate) => candidate.fixture?.id === fixture.fixture?.id) === index
      );
      setFixtures(unique.slice(0, 12));
      setLeaderboard(leaderboardResponse.teams || []);
      setState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: readableError(error) }));
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadPlayerPool = async (fixture) => {
    setState((current) => ({ ...current, poolLoading: true, error: "", notice: "" }));
    try {
      const response = await sportsApi.players(fixture.fixture.id);
      const players = response.flatMap((group) =>
        (group.players || []).map((entry) => {
          const statistics = entry.statistics?.[0] || {};
          return {
            playerId: entry.player?.id,
            name: entry.player?.name || "Unknown player",
            team: group.team?.name || "Unknown team",
            position: statistics.games?.position || "MID",
            points: fantasyPoints(statistics)
          };
        })
      );
      setAvailablePlayers(players);
      setSelectedPlayers([]);
      setState((current) => ({
        ...current,
        poolLoading: false,
        notice: "Player pool loaded. Points are a transparent estimate from this fixture's statistics."
      }));
    } catch (error) {
      setState((current) => ({ ...current, poolLoading: false, error: readableError(error) }));
    }
  };

  const togglePlayer = (player) => {
    setSelectedPlayers((current) => {
      if (current.some((candidate) => candidate.playerId === player.playerId)) {
        return current.filter((candidate) => candidate.playerId !== player.playerId);
      }
      if (current.length >= 15) {
        setState((status) => ({ ...status, notice: "A fantasy squad can contain a maximum of 15 players." }));
        return current;
      }
      return [...current, player];
    });
  };

  const saveTeam = async (event) => {
    event.preventDefault();
    if (!selectedPlayers.length) {
      setState((current) => ({ ...current, error: "Choose at least one player before saving your team." }));
      return;
    }
    setState((current) => ({ ...current, saving: true, error: "", notice: "" }));
    try {
      const response = await sportsApi.createFantasyTeam({ ...form, players: selectedPlayers });
      setLeaderboard((current) => [...current, response.team].sort((a, b) => b.totalPoints - a.totalPoints));
      setForm({ name: "", ownerName: "" });
      setSelectedPlayers([]);
      setState((current) => ({
        ...current,
        saving: false,
        notice: response.storage === "mongodb"
          ? "Fantasy team saved to MongoDB."
          : "Fantasy team saved for this server session. Connect MongoDB to persist it."
      }));
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error: readableError(error) }));
    }
  };

  if (state.loading) return <LoadingState label="Setting up the fantasy workspace…" />;

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">Fantasy football</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Build your matchday squad</h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-300">
          Choose a fixture, select up to 15 players, and save a team to the leaderboard. Estimated
          points use goals, assists, saves, player rating, and cards; this is an educational tracker,
          not an official fantasy game.
        </p>
      </section>

      {state.error && <ErrorState message={state.error} action={<button className="button-secondary" onClick={loadInitialData}>Retry</button>} />}
      {state.notice && <div className="rounded-xl border border-teal-300/20 bg-teal-400/8 px-4 py-3 text-sm text-teal-100">{state.notice}</div>}

      <section className="surface rounded-2xl p-5 sm:p-6">
        <h2 className="section-title">1. Choose a source fixture</h2>
        <p className="mt-1 text-sm text-slate-400">Use a live or upcoming match to load its player pool.</p>
        {fixtures.length ? (
          <div className="scrollbar-thin mt-4 flex gap-3 overflow-x-auto pb-2">
            {fixtures.map((fixture) => (
              <button
                key={fixture.fixture?.id}
                type="button"
                onClick={() => loadPlayerPool(fixture)}
                className="min-w-64 rounded-xl border border-slate-700/70 bg-slate-900/55 p-4 text-left transition hover:border-teal-300/60 hover:bg-slate-800"
              >
                <span className="block truncate text-xs text-slate-400">{fixture.league?.name}</span>
                <span className="mt-2 block font-bold text-slate-100">{fixture.teams?.home?.name} vs {fixture.teams?.away?.name}</span>
                <span className="mt-2 block text-xs text-teal-300">{fixtureDate(fixture)}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4"><EmptyState title="No source fixtures found" detail="Configure API-Football and refresh this page to load a player pool." /></div>
        )}
      </section>

      <div className="grid gap-7 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="surface rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">2. Player pool</h2>
              <p className="mt-1 text-sm text-slate-400">{availablePlayers.length} players available</p>
            </div>
            {state.poolLoading && <span className="text-sm font-bold text-teal-300">Loading…</span>}
          </div>
          <div className="mt-5">
            <PlayerPool players={availablePlayers} selectedIds={selectedIds} onToggle={togglePlayer} />
          </div>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="section-title">3. Your squad</h2>
              <p className="mt-1 text-sm text-slate-400">{selectedPlayers.length}/15 selected</p>
            </div>
            <p className="text-right"><span className="block text-2xl font-black text-teal-300">{totalPoints}</span><span className="text-xs font-bold uppercase tracking-wide text-slate-500">estimated points</span></p>
          </div>
          {selectedPlayers.length ? (
            <ul className="mt-4 divide-y divide-slate-800">
              {selectedPlayers.map((player) => (
                <li key={player.playerId} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0"><span className="block truncate font-semibold text-slate-100">{player.name}</span><span className="text-xs text-slate-400">{player.position} · {player.team}</span></span>
                  <button type="button" className="text-sm font-bold text-rose-300 hover:text-rose-200" onClick={() => togglePlayer(player)}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4"><EmptyState title="Your squad is empty" detail="Choose players from the pool on the left." /></div>
          )}
          <form onSubmit={saveTeam} className="mt-5 space-y-3 border-t border-slate-700/60 pt-5">
            <label className="block text-sm font-semibold text-slate-300">Team name<input required className="input mt-1.5" value={form.name} maxLength="48" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Weekend XI" /></label>
            <label className="block text-sm font-semibold text-slate-300">Manager name<input required className="input mt-1.5" value={form.ownerName} maxLength="48" onChange={(event) => setForm((current) => ({ ...current, ownerName: event.target.value }))} placeholder="Your name" /></label>
            <button className="button-primary w-full" type="submit" disabled={state.saving}>{state.saving ? "Saving…" : "Save fantasy team"}</button>
          </form>
        </section>
      </div>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div><h2 className="section-title">Fantasy leaderboard</h2><p className="mt-1 text-sm text-slate-400">Sorted by the estimated points at the time each team was saved.</p></div>
          <span className="rounded-full bg-indigo-400/10 px-3 py-1 text-xs font-bold text-indigo-200">{leaderboard.length} teams</span>
        </div>
        {leaderboard.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-128 text-left text-sm">
              <thead className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-400"><tr><th className="p-3">Rank</th><th className="p-3">Team</th><th className="p-3">Manager</th><th className="p-3">Players</th><th className="p-3 text-right">Points</th></tr></thead>
              <tbody>
                {leaderboard.map((team, index) => <tr key={team.id} className="border-b border-slate-800 text-slate-300"><td className="p-3 font-black text-teal-300">{index + 1}</td><td className="p-3 font-bold text-slate-100">{team.name}</td><td className="p-3">{team.ownerName}</td><td className="p-3">{team.players?.length || 0}</td><td className="p-3 text-right font-black text-slate-100">{team.totalPoints}</td></tr>)}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="The leaderboard is waiting for its first team" detail="Save a squad above to create the first entry." />
        )}
      </section>
    </div>
  );
}

