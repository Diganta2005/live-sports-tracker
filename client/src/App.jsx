import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { FantasyPage } from "./pages/FantasyPage.jsx";
import { MatchDetailsPage } from "./pages/MatchDetailsPage.jsx";
import { OddsPage } from "./pages/OddsPage.jsx";
import { SchedulePage } from "./pages/SchedulePage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="match/:fixtureId" element={<MatchDetailsPage />} />
        <Route path="fantasy" element={<FantasyPage />} />
        <Route path="odds" element={<OddsPage />} />
      </Route>
    </Routes>
  );
}

