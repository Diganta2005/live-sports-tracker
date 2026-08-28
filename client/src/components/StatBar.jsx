import { displayStat, statNumber } from "../lib/formatters.js";

export function StatBar({ label, home, away }) {
  const homeNumber = statNumber(home);
  const awayNumber = statNumber(away);
  const total = homeNumber + awayNumber;
  const homeWidth = total ? Math.round((homeNumber / total) * 100) : 50;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="w-14 text-left font-bold text-slate-100">{displayStat(home)}</span>
        <span className="flex-1 text-center text-xs font-medium text-slate-400">{label}</span>
        <span className="w-14 text-right font-bold text-slate-100">{displayStat(away)}</span>
      </div>
      <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-slate-700">
        <span className="bg-teal-400" style={{ width: homeWidth + "%" }} />
        <span className="bg-indigo-400" style={{ width: 100 - homeWidth + "%" }} />
      </div>
    </div>
  );
}

