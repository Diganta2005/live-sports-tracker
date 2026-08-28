import { Link } from "react-router-dom";
import { fixtureDate, fixtureStatus, isLiveFixture, score } from "../lib/formatters.js";

export function FixtureCard({ fixture }) {
  const home = fixture?.teams?.home || {};
  const away = fixture?.teams?.away || {};
  const live = isLiveFixture(fixture);
  const fixtureId = fixture?.fixture?.id;

  return (
    <Link
      to={"/match/" + fixtureId}
      className="surface block rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-teal-300/50 hover:bg-slate-800/80"
    >
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="truncate text-slate-400">
          {fixture?.league?.name || "Football"} · {fixture?.league?.country || "International"}
        </span>
        <span
          className={
            "shrink-0 rounded-full px-2.5 py-1 font-bold " +
            (live ? "bg-red-500/15 text-red-300" : "bg-slate-700/60 text-slate-300")
          }
        >
          {live ? "LIVE " : ""}
          {fixtureStatus(fixture)}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3">
        <div className="flex items-center gap-2.5 font-semibold text-slate-100">
          {home.logo && <img className="h-6 w-6 object-contain" src={home.logo} alt="" />}
          <span className="truncate">{home.name || "Home team"}</span>
        </div>
        <strong className="text-lg text-slate-50">{score(fixture?.goals?.home)}</strong>
        <div className="flex items-center gap-2.5 font-semibold text-slate-100">
          {away.logo && <img className="h-6 w-6 object-contain" src={away.logo} alt="" />}
          <span className="truncate">{away.name || "Away team"}</span>
        </div>
        <strong className="text-lg text-slate-50">{score(fixture?.goals?.away)}</strong>
      </div>
      <div className="mt-4 border-t border-slate-700/55 pt-3 text-xs text-slate-400">
        {fixtureDate(fixture)}
      </div>
    </Link>
  );
}

