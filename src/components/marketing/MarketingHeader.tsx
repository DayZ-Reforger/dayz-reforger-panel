import logo from "../../assets/logo_combined_sidebar.png";
import { ButtonLink } from "../ui/ButtonLink";

export function MarketingHeader() {
  return (
    <header className="marketing-header">
      <div className="container marketing-header__inner">
        <a href="/" className="brand">
          <img src={logo} alt="DayZ Reforger" />
        </a>

        <nav className="marketing-nav" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/dashboard/integrations">Integrations</a>
        </nav>

        <ButtonLink
          href={`${import.meta.env.VITE_API_BASE_URL ?? ""}/auth/discord/login`}
          size="sm"
        >
          Sign in
        </ButtonLink>
      </div>
    </header>
  );
}
