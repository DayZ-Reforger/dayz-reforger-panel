import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo_combined_sidebar.png";
import { useAuth } from "../../../app/providers/AuthProvider";
import { getDiscordAvatarUrl } from "../../../lib/format";
import SidebarProfileCard from "./SidebarProfileCard";

const navItems = [
  { to: "/dashboard", label: "Overview" },
  { to: "/dashboard/guilds", label: "Guilds" },
  { to: "/dashboard/integrations", label: "Integrations" },
];

function formatPlan(plan?: string) {
  if (!plan) {
    return "Free";
  }

  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

export function SidebarNav() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const avatarUrl = getDiscordAvatarUrl(user?.discord_id, user?.avatar);

  const instanceUsage = user
    ? `${user.used_instances} / ${user.instance_addons.instance_limit} instances`
    : "No account loaded";

  const plan = formatPlan(
    user?.subscription?.tier_override || user?.subscription?.plan,
  );

  function handleSignOut() {
    signOut();
    navigate("/", { replace: true });
  }

  if (!user) {
    return null;
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Link to="/" className="sidebar__brand" aria-label="Go to landing page">
          <img src={logo} alt="DayZ Reforger" className="sidebar__brand-logo" />
        </Link>
      </div>

      <nav className="sidebar__nav" aria-label="Dashboard navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              `sidebar__link${isActive ? " is-active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <SidebarProfileCard
          username={user.username}
          email={user.email}
          avatarUrl={getDiscordAvatarUrl(user.discord_id, user.avatar)}
          planName={user.subscription.tier_override ?? user.subscription.plan}
          usedInstances={user.used_instances}
          maxInstances={user.instance_addons.instance_limit}
          onLogout={handleSignOut}
        />
      </div>
    </aside>
  );
}
