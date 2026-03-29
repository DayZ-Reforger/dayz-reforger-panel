import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { DashboardShell } from "../components/layout/DashboardShell";
import { AuthCallbackPage } from "../pages/auth/AuthCallbackPage";
import { DashboardOverviewPage } from "../pages/dashboard/DashboardOverviewPage";
import { GuildWorkspacePage } from "../pages/guilds/GuildWorkspacePage";
import { GuildsPage } from "../pages/guilds/GuildsPage";
import { IntegrationsPage } from "../pages/integrations/IntegrationsPage";
import { LandingPage } from "../pages/marketing/LandingPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverviewPage />} />
        <Route path="guilds" element={<GuildsPage />} />
        <Route path="guilds/:guildId" element={<GuildWorkspacePage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
      </Route>
    </Routes>
  );
}
