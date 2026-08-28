import { useMemo, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function decimalOdds(probability) {
  const probabilityFraction = Math.max(probability / 100, 0.01);
  return (0.92 / probabilityFraction).toFixed(2);
}

export function OddsPage() {
  const [homeStrength, setHomeStrength] = useState(68);
  const [awayStrength, setAwayStrength] = useState(54);
  const [drawTendency, setDrawTendency] = useState(25);

  const model = useMemo(() => {
    const homeWeight = homeStrength * 1.12;
    const awayWeight = awayStrength;
    const drawWeight = drawTendency * 1.65;
    const total = homeWeight + awayWeight + drawWeight;
    const home = Math.round((homeWeight / total) * 100);
    const draw = Math.round((drawWeight / total) * 100);
    const away = 100 - home - draw;
    return [
      { outcome: "Home win", probability: home, decimal: decimalOdds(home), color: "#2dd4bf" },
      { outcome: "Draw", probability: draw, decimal: decimalOdds(draw), color: "#fbbf24" },
      { outcome: "Away win", probability: away, decimal: decimalOdds(away), color: "#818cf8" }
    ];
  }, [homeStrength, awayStrength, drawTendency]);

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">Learning lab</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Explore simulated match probabilities</h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-300">
          This is an educational probability sandbox. It does not use betting markets, does not
          accept wagers, and does not offer financial advice. Move the inputs to see how a simple
          illustrative model changes possible outcomes.
        </p>
      </section>

      <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="section-title">Model inputs</h2>
          <p className="mt-1 text-sm text-slate-400">These values are deliberately user-set, not predictions.</p>
          <div className="mt-7 space-y-7">
            <label className="block">
              <span className="flex justify-between text-sm font-semibold text-slate-200"><span>Home-team strength</span><span className="text-teal-300">{homeStrength}/100</span></span>
              <input className="mt-3 w-full accent-teal-400" type="range" min="1" max="100" value={homeStrength} onChange={(event) => setHomeStrength(Number(event.target.value))} />
            </label>
            <label className="block">
              <span className="flex justify-between text-sm font-semibold text-slate-200"><span>Away-team strength</span><span className="text-indigo-300">{awayStrength}/100</span></span>
              <input className="mt-3 w-full accent-indigo-400" type="range" min="1" max="100" value={awayStrength} onChange={(event) => setAwayStrength(Number(event.target.value))} />
            </label>
            <label className="block">
              <span className="flex justify-between text-sm font-semibold text-slate-200"><span>Draw tendency</span><span className="text-amber-300">{drawTendency}/100</span></span>
              <input className="mt-3 w-full accent-amber-400" type="range" min="1" max="100" value={drawTendency} onChange={(event) => setDrawTendency(Number(event.target.value))} />
            </label>
          </div>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="section-title">Illustrative outcome model</h2><p className="mt-1 text-sm text-slate-400">The values always total 100%.</p></div>
            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200">Simulation only</span>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={model} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}>
                <XAxis dataKey="outcome" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <YAxis unit="%" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip formatter={(value) => value + "%"} contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} />
                <Bar dataKey="probability" radius={[7, 7, 0, 0]}>
                  {model.map((entry) => <Cell key={entry.outcome} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {model.map((entry) => (
              <div key={entry.outcome} className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4">
                <p className="text-sm font-bold text-slate-200">{entry.outcome}</p>
                <p className="mt-2 text-2xl font-black" style={{ color: entry.color }}>{entry.probability}%</p>
                <p className="mt-1 text-xs text-slate-400">Illustrative decimal: {entry.decimal}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-sky-300/15 bg-sky-400/7 p-5 text-sm leading-6 text-slate-300">
        <p className="font-bold text-sky-200">How this example works</p>
        <p className="mt-1">
          The model weights the two strength sliders and a draw factor, converts their relative
          weights into percentages, then displays a 92% payout-adjusted decimal example for
          teaching purposes. It cannot forecast a real match and should never be treated as a
          betting recommendation.
        </p>
      </section>
    </div>
  );
}

