import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState.jsx";
import { FixtureCard } from "../components/FixtureCard.jsx";
import { liveStreamUrl, readableError, sportsApi } from "../lib/api.js";

function todayRange() {
  const from = new Date().toISOString().slice(0, 10);
  const to = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  return { from, to };
}

export function DashboardPage() {
  const [liveFixtures, setLiveFixtures] = useState([]);
  const [upcomingFixtures, setUpcomingFixtures] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [streamMessage, setStreamMessage] = useState("");

  const loadData = async () => {
    setStatus({ loading: true, error: "" });
    try {
      const range = todayRange();
      const [live, upcoming] = await Promise.all([
        sportsApi.liveFixtures(),
        sportsApi.upcomingFixtures(range.from, range.to)
      ]);
      setLiveFixtures(live);
      setUpcomingFixtures(upcoming);
      setStatus({ loading: false, error: "" });
    } catch (error) {
      setStatus({ loading: false, error: readableError(error) });
    }
  };

  useEffect(() => {
    loadData();
    const stream = new EventSource(liveStreamUrl());
    stream.addEventListener("score-update", (event) => {
      const payload = JSON.parse(event.data);
      setLiveFixtures(payload.response || []);
      setStreamMessage("Live feed connected");
    });
    stream.addEventListener("provider-error", (event) => {
      const payload = JSON.parse(event.data);
      setStreamMessage(payload.message);
    });
    stream.onerror = () => setStreamMessage("Live stream reconnecting…");
    return () => stream.close();
  }, []);

  return (
    <div className="space-y-8">
      <section className="surface overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">Matchday hub</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              Follow every moment on the pitch.
            </h1>
            <p className="mt-4 max-w-xl leading-7 text-slate-300">
              Live scores, rich match timelines, player data, fantasy points, and transparent
              probability simulations in one calm match centre.
            </p>
          </div>
          <div className="rounded-2xl border border-teal-300/15 bg-teal-400/8 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-300">Live connection</p>
            <p className="mt-2 text-3xl font-black text-white">{liveFixtures.length}</p>
            <p className="text-sm text-slate-300">matches currently tracked</p>
            <p className="mt-3 text-xs text-slate-400">{streamMessage || "Opening score stream…"}</p>
          </div>
        </div>
      </section>

      {status.loading ? (
        <LoadingState label="Loading live fixtures and the next three days…" />
      ) : status.error ? (
        <ErrorState
          message={status.error}
          action={<button className="button-secondary" onClick={loadData}>Try again</button>}
        />
      ) : (
        <>
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="section-title">Live now</h2>
                <p className="mt-1 text-sm text-slate-400">Updates arrive through a persistent live feed.</p>
              </div>
              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">LIVE</span>
            </div>
            {liveFixtures.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {liveFixtures.map((fixture) => <FixtureCard key={fixture.fixture.id} fixture={fixture} />)}
              </div>
            ) : (
              <EmptyState title="No fixtures are live right now" detail="The live feed will populate automatically when matches begin." />
            )}
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="section-title">Coming up</h2>
                <p className="mt-1 text-sm text-slate-400">The next scheduled matches from your configured provider.</p>
              </div>
              <Link className="text-sm font-bold text-teal-300 hover:text-teal-200" to="/schedule">Full schedule →</Link>
            </div>
            {upcomingFixtures.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {upcomingFixtures.slice(0, 9).map((fixture) => <FixtureCard key={fixture.fixture.id} fixture={fixture} />)}
              </div>
            ) : (
              <EmptyState title="No upcoming fixtures found" detail="Try another date range from the schedule page." />
            )}
          </section>
        </>
      )}
    </div>
  );
}
