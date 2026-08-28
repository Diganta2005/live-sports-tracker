import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/", label: "Live centre", end: true },
  { to: "/schedule", label: "Schedule" },
  { to: "/fantasy", label: "Fantasy" },
  { to: "/odds", label: "Learning lab" }
];

export function AppLayout() {
  return (
    <div className="min-h-screen pb-12">
      <header className="border-b border-slate-700/55 bg-slate-950/65 backdrop-blur">
        <div className="page-shell flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-400 text-lg font-black text-slate-950">
              P
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight text-slate-50">PitchPulse</span>
              <span className="block text-xs text-slate-400">Live football intelligence</span>
            </span>
          </NavLink>
          <nav className="flex flex-wrap gap-1">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  "rounded-lg px-3 py-2 text-sm font-semibold transition " +
                  (isActive
                    ? "bg-teal-400 text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="page-shell pt-8">
        <Outlet />
      </main>
    </div>
  );
}

