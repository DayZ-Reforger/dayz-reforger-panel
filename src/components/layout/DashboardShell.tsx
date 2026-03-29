import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { getApiBaseUrl } from "../../lib/api";
import { SidebarNav } from "./sidebar/SidebarNav";

const PAGE_META: Record<string, { eyebrow: string; title: string }> = {
  "/dashboard": { eyebrow: "Admin dashboard", title: "Overview" },
  "/dashboard/guilds": { eyebrow: "Owned Discord guilds", title: "Guilds" },
  "/dashboard/integrations": {
    eyebrow: "Service connections",
    title: "Integrations",
  },
};

export function DashboardShell() {
  const location = useLocation();
  const { user } = useAuth();
  const pageMeta = PAGE_META[location.pathname] ?? {
    eyebrow: "Guild workspace",
    title: "Server configuration",
  };

  const nitradoConnected = Boolean(user?.nitrado);
  const usage = user
    ? `${user.used_instances} / ${user.instance_addons.instance_limit}`
    : "—";

  return (
    <div className="app-shell">
      <SidebarNav />
      <div className="app-shell__main">
        <header className="topbar">
          <div>
            <div className="eyebrow">{pageMeta.eyebrow}</div>
            <h1>{pageMeta.title}</h1>
          </div>
          <div className="topbar__meta">
            <span className="topbar__pill">Discord connected</span>
            <span
              className={`topbar__pill${nitradoConnected ? " topbar__pill--accent" : ""}`}
            >
              {nitradoConnected ? "Nitrado linked" : "Nitrado not linked"}
            </span>
            <span className="topbar__pill">Usage {usage}</span>
          </div>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
