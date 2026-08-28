export function LoadingState({ label = "Loading data…" }) {
  return (
    <div className="surface grid min-h-40 place-items-center rounded-2xl p-6 text-sm text-slate-400">
      <span className="animate-pulse">{label}</span>
    </div>
  );
}

export function ErrorState({ message, action }) {
  return (
    <div className="surface rounded-2xl border-amber-400/25 bg-amber-950/20 p-5">
      <p className="font-semibold text-amber-200">Data is unavailable</p>
      <p className="mt-1 text-sm leading-6 text-amber-100/75">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function EmptyState({ title, detail }) {
  return (
    <div className="surface rounded-2xl p-6 text-center">
      <p className="font-semibold text-slate-200">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

