import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState.jsx";
import { StatBar } from "../components/StatBar.jsx";
import { readableError, sportsApi } from "../lib/api.js";
import { displayStat, fixtureDate, fixtureStatus, score, statNumber } from "../lib/formatters.js";

function buildStatPairs(statistics) {
  if (statistics.length < 2) return [];
  const home = statistics[0]?.statistics || [];
  const away = statistics[1]?.statistics || [];
  const awayByType = new Map(away.map((stat) => [stat.type, stat.value]));
  return home.map((stat) => ({
    label: stat.type,
    home: stat.value,
    away: awayByType.get(stat.type)
  }));
}

function TeamScore({ team, goals, align = "left" }) {
  return (
    <div className={"flex items-center gap-3 " + (align === "right" ? "flex-row-reverse text-right" : "")}>
      {team?.logo && <img className="h-12 w-12 object-contain sm:h-16 sm:w-16" src={team.logo} alt="" />}
      <div>
        <p className="text-base font-bold text-white sm:text-xl">{team?.name || "Team"}</p>
        <p className="mt-1 text-3xl font-black text-teal-300 sm:text-4xl">{score(goals)}</p>
      </div>
    </div>
  );
}

export function MatchDetailsPage() {
  const { fixtureId } = useParams();
  const [data, setData] = useState({ fixture: null, events: [], statistics: [], players: [] });
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    let active = true;
    async function loadMatch() {
      setState({ loading: true, error: "" });
      try {
        const [fixtureResponse, events, statistics, players] = await Promise.all([
          sportsApi.fixture(fixtureId),
          sportsApi.events(fixtureId),
          sportsApi.statistics(fixtureId),
          sportsApi.players(fixtureId)
        ]);
        if (active) {
          setData({ fixture: fixtureResponse[0] || null, events, statistics, players });
          setState({ loading: false, error: "" });
        }
      } catch (error) {
        if (active) setState({ loading: false, error: readableError(error) });
      }
    }
    loadMatch();
    return () => {
      active = false;
    };
  }, [fixtureId]);

  const statPairs = useMemo(() => buildStatPairs(data.statistics), [data.statistics]);
  const chartData = statPairs
    .filter((item) => item.label !== "Ball Possession")
    .slice(0, 7)
    .map((item) => ({ name: item.label, Home: statNumber(item.home), Away: statNumber(item.away) }));
  const fixture = data.fixture;
  const home = fixture?.teams?.home;
  const away = fixture?.teams?.away;

  if (state.loading) return <LoadingState label="Loading match centre…" />;
  if (state.error) {
    return (
      <ErrorState
        message={state.error}
        action={<Link className="button-secondary inline-block" to="/">Back to live centre</Link>}
      />
    );
  }
  if (!fixture) return <EmptyState title="Match not found" detail="This fixture may no longer be available from the data provider." />;

  return (
    <div className="space-y-7">
      <Link className="inline-flex text-sm font-bold text-teal-300 hover:text-teal-100" to="/">← Live centre</Link>
      <section className="surface overflow-hidden rounded-3xl">
        <div className="border-b border-slate-700/60 px-5 py-4 text-center sm:px-8">
          <p className="font-bold text-slate-200">{fixture.league?.name}</p>
          <p className="mt-1 text-sm text-slate-400">{fixtureDate(fixture)} · {fixture.venue?.name || "Venue TBC"}</p>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-7 sm:px-10">
          <TeamScore team={home} goals={fixture.goals?.home} />
          <div className="text-center">
            <p className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-red-300">
              {fixtureStatus(fixture)}
            </p>
            <p className="mt-3 text-xs text-slate-500">Match ID {fixture.fixture?.id}</p>
          </div>
          <TeamScore team={away} goals={fixture.goals?.away} align="right" />
        </div>
      </section>

      <div className="grid gap-7 xl:grid-cols-[0.86fr_1.14fr]">
        <section className="surface rounded-2xl p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Live commentary</h2>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{data.events.length} events</span>
          </div>
          {data.events.length ? (
            <ol className="scrollbar-thin max-h-[560px] space-y-1 overflow-y-auto pr-2">
              {data.events.map((event, index) => (
                <li key={event.time?.elapsed + "-" + event.player?.id + "-" + index} className="grid grid-cols-[42px_1fr] gap-3 border-b border-slate-800 py-3 last:border-0">
                  <span className="text-sm font-black text-teal-300">{event.time?.elapsed || "–"}'</span>
                  <div>
                    <p className="font-semibold text-slate-100">{event.detail || event.type}</p>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {event.team?.name || "Match event"}{event.player?.name ? " · " + event.player.name : ""}{event.assist?.name ? " (assist: " + event.assist.name + ")" : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="No event commentary yet" detail="Events will appear here when the provider publishes them." />
          )}
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="section-title">Team statistics</h2>
          <p className="mt-1 text-sm text-slate-400">{home?.name} in teal · {away?.name} in indigo</p>
          {statPairs.length ? (
            <div className="mt-4 divide-y divide-slate-800">
              {statPairs.map((stat) => <StatBar key={stat.label} {...stat} />)}
            </div>
          ) : (
            <div className="mt-4"><EmptyState title="Statistics are not available yet" detail="They are commonly published after the match starts." /></div>
          )}
        </section>
      </div>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="section-title">Stat comparison chart</h2>
          <p className="mt-1 text-sm text-slate-400">A quick visual comparison of key match metrics.</p>
        </div>
        {chartData.length ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 48 }}>
                <CartesianGrid vertical={false} stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} />
                <Legend />
                <Bar dataKey="Home" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Away" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="Chart waiting for statistics" detail="It will populate once statistic data is available." />
        )}
      </section>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <h2 className="section-title">Player statistics</h2>
        <p className="mt-1 text-sm text-slate-400">Match-by-match player output supplied by API-Football.</p>
        {data.players.length ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {data.players.map((group) => (
              <div key={group.team?.id} className="overflow-hidden rounded-xl border border-slate-700/55">
                <div className="flex items-center gap-2 border-b border-slate-700/55 bg-slate-900/60 p-3 font-bold text-slate-100">
                  {group.team?.logo && <img className="h-5 w-5 object-contain" src={group.team.logo} alt="" />}
                  {group.team?.name}
                </div>
                <div className="scrollbar-thin max-h-96 overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                      <tr><th className="p-3">Player</th><th className="p-3">Pos</th><th className="p-3">Rating</th><th className="p-3">G/A</th></tr>
                    </thead>
                    <tbody>
                      {group.players?.map((entry) => {
                        const stats = entry.statistics?.[0] || {};
                        return (
                          <tr key={entry.player?.id} className="border-t border-slate-800 text-slate-300">
                            <td className="p-3 font-medium text-slate-100">{entry.player?.name}</td>
                            <td className="p-3">{stats.games?.position || "–"}</td>
                            <td className="p-3">{displayStat(stats.games?.rating)}</td>
                            <td className="p-3">{stats.goals?.total || 0}/{stats.goals?.assists || 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4"><EmptyState title="Player data is not available yet" detail="The provider adds player match statistics as they become available." /></div>
        )}
      </section>
    </div>
  );
}

