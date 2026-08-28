export function isLiveFixture(fixture) {
  const status = fixture?.fixture?.status?.short || "";
  return ["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"].includes(status);
}

export function fixtureStatus(fixture) {
  const status = fixture?.fixture?.status || {};
  if (isLiveFixture(fixture)) {
    return status.elapsed ? status.elapsed + "'" : status.short;
  }
  if (status.short === "FT" || status.short === "AET" || status.short === "PEN") {
    return "Full time";
  }
  if (status.short === "NS" || status.short === "TBD") return "Upcoming";
  return status.long || status.short || "Scheduled";
}

export function fixtureDate(fixture, withDate = true) {
  const dateValue = fixture?.fixture?.date;
  if (!dateValue) return "Time TBC";
  return new Intl.DateTimeFormat(undefined, {
    weekday: withDate ? "short" : undefined,
    month: withDate ? "short" : undefined,
    day: withDate ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateValue));
}

export function score(value) {
  return value === null || value === undefined ? "–" : value;
}

export function displayStat(value) {
  if (value === null || value === undefined) return "–";
  return String(value);
}

export function statNumber(value) {
  const parsed = Number.parseFloat(String(value ?? "0").replace("%", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function fantasyPoints(statistics = {}) {
  const goals = statistics.goals?.total || 0;
  const assists = statistics.goals?.assists || 0;
  const saves = statistics.goals?.saves || 0;
  const cards = statistics.cards || {};
  const games = statistics.games || {};
  return (
    goals * 6 +
    assists * 3 +
    Math.floor(saves / 3) +
    (games.rating ? Math.max(0, Math.round((Number(games.rating) - 6) * 2)) : 0) -
    (cards.yellow || 0) -
    (cards.red || 0) * 3
  );
}

