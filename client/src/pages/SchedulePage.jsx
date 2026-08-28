import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState.jsx";
import { FixtureCard } from "../components/FixtureCard.jsx";
import { readableError, sportsApi } from "../lib/api.js";

const isoDate = (date) => date.toISOString().slice(0, 10);

export function SchedulePage() {
  const [from, setFrom] = useState(isoDate(new Date()));
  const [to, setTo] = useState(isoDate(new Date(Date.now() + 7 * 86400000)));
  const [fixtures, setFixtures] = useState([]);
  const [state, setState] = useState({ loading: false, error: "" });

  const loadFixtures = async (event) => {
    event?.preventDefault();
    if (from > to) {
      setState({ loading: false, error: "The end date needs to be on or after the start date." });
      return;
    }
    setState({ loading: true, error: "" });
    try {
      setFixtures(await sportsApi.upcomingFixtures(from, to));
      setState({ loading: false, error: "" });
    } catch (error) {
      setState({ loading: false, error: readableError(error) });
    }
  };

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">Fixtures</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Plan your matchweek</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-300">
          Browse upcoming football matches over any date range. Select a match to explore its
          commentary, player data, team statistics, and visual analysis.
        </p>
      </section>

      <form onSubmit={loadFixtures} className="surface grid gap-4 rounded-2xl p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-sm font-semibold text-slate-300">
          From
          <input className="input mt-2" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label className="text-sm font-semibold text-slate-300">
          To
          <input className="input mt-2" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
        <button className="button-primary h-[42px]" type="submit" disabled={state.loading}>
          {state.loading ? "Loading…" : "Find fixtures"}
        </button>
      </form>

      {state.loading && <LoadingState label="Searching the fixture calendar…" />}
      {state.error && <ErrorState message={state.error} action={<button className="button-secondary" onClick={loadFixtures}>Try again</button>} />}
      {!state.loading && !state.error && fixtures.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">{fixtures.length} fixtures found</h2>
            <span className="text-sm text-slate-400">{from} to {to}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {fixtures.map((fixture) => <FixtureCard key={fixture.fixture.id} fixture={fixture} />)}
          </div>
        </section>
      )}
      {!state.loading && !state.error && fixtures.length === 0 && (
        <EmptyState title="Choose a date range" detail="Search the schedule to see available fixtures." />
      )}
    </div>
  );
}

