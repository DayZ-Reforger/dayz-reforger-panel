import { Link } from "react-router-dom";
import logo from "../../assets/logo_combined_sidebar.png";
import { getDiscordLoginUrl } from "../../lib/api";

const featureItems = [
  {
    title: "Discord guild and Nitrado service linking",
    body: "Sign in with Discord, load the guilds you own, connect your Nitrado account, and link one DayZ server service to the right community.",
  },
  {
    title: "Killfeed, logs, and welcome routing",
    body: "Assign killfeed, connection logs, base build logs, active player updates, and welcome messages to the channels that make sense for your server.",
  },
  {
    title: "Role-based server access",
    body: "Set member roles, linked gamertag roles, bot admin roles, and excluded roles without managing everything through commands alone.",
  },
  {
    title: "Structured server configuration",
    body: "Update gameplay, community, and economy-related settings through a cleaner interface built around the actual config your server uses.",
  },
  {
    title: "Guild Economy and features",
    body: "Have an entire economy within your guild to allow for shops, trade, and purchasing features such as UAVs, EMPs, etc.",
  },
  {
    title: "Parser state control",
    body: "Start or stop parsing directly from the panel and keep visibility over the current state of the linked DayZ service.",
  },
];

const practicalItems = [
  {
    title: "Built for DayZ communities on Nitrado",
    body: "DayZ Reforger is focused on console DayZ communities looking for essential free to use features, while maintaining a simple configuration interface.",
  },
  {
    title: "Easy Setup",
    body: "The DayZ Reforger Service can be setup in less than 2 minutes, sign-in with Discord, Link Nitrado, configure a few essential channels, and start seeing feeds and insights.",
  },
  {
    title: "Made for real server operations",
    body: "Practically manage, monitor and maintain your DayZ console community by learning more about your player base with server analytics.",
  },
];

const quickFlow = [
  {
    number: "01",
    title: "Sign in with Discord",
    body: "Authenticate and load the Discord guilds you own.",
  },
  {
    number: "02",
    title: "Link your Nitrado account",
    body: "Connect your hosted DayZ services so they can be selected.",
  },
  {
    number: "03",
    title: "Configure channels, roles, and parser state",
    body: "Link the service, review readiness, then save and activate when ready.",
  },
];

export function LandingPage() {
  return (
    <div className="landing-page">
      <header className="marketing-header">
        <div className="marketing-header__inner">
          <Link
            to="/"
            className="marketing-header__brand"
            aria-label="DayZ Reforger home"
          >
            <img
              src={logo}
              alt="DayZ Reforger"
              className="marketing-header__logo"
            />
          </Link>

          <nav
            className="marketing-header__nav"
            aria-label="Primary navigation"
          >
            <a href="#features" className="marketing-header__nav-link">
              Features
            </a>
            <a href="#practical" className="marketing-header__nav-link">
              Why it helps
            </a>
            <a href="#dashboard" className="marketing-header__nav-link">
              Dashboard
            </a>
          </nav>

          <div className="marketing-header__actions">
            <Link
              to={getDiscordLoginUrl()}
              className="button-link button-link--primary"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="landing-shell">
        <section className="hero-section">
          <div className="hero-section__content">
            <div className="eyebrow">DAYZ SERVER ADMINISTRATION</div>

            <h1 className="hero-section__title">
              Killfeed Alarms Economy & admin tools
            </h1>

            <p className="hero-section__body">
              DayZ Reforger is an advanced DayZ log parsing service for Nitrado
              services. With a simple modern admin panel to control
              configurations, features, and gain valuable analytical insights
              into your DayZ server.
            </p>

            <div className="hero-section__actions">
              <Link
                to="/dashboard"
                className="button-link button-link--primary"
              >
                Sign in with Discord
              </Link>

              <a
                href="#features"
                className="button-link button-link--secondary"
              >
                View features
              </a>
            </div>

            <div className="hero-section__meta">
              <span className="hero-chip">Discord sign-in</span>
              <span className="hero-chip">Nitrado OAuth</span>
              <span className="hero-chip">Easy configuration</span>
              <span className="hero-chip">Killfeeds</span>
              <span className="hero-chip">Alarms + UAVs</span>
              <span className="hero-chip">Combat Log detection</span>
              <span className="hero-chip">Admin logs</span>
              <span className="hero-chip">Server Analytics</span>
            </div>
          </div>

          <div className="hero-section__panel-wrap" id="dashboard">
            <div className="preview-panel">
              <div className="preview-panel__top">
                <div className="preview-panel__brand-row">
                  <img
                    src={logo}
                    alt="DayZ Reforger"
                    className="preview-panel__logo"
                  />

                  <div className="preview-panel__status-group">
                    <span className="preview-badge">Discord connected</span>
                    <span className="preview-badge">Nitrado linked</span>
                  </div>
                </div>

                <div className="preview-panel__heading">
                  <div className="preview-panel__eyebrow">
                    CORE CAPABILITIES
                  </div>
                  <h2 className="preview-panel__title">
                    Quick setup for essential DayZ community features
                  </h2>
                </div>
              </div>

              <div className="preview-panel__grid">
                <div className="preview-card">
                  <div className="preview-card__label">SERVER LINKING</div>
                  <div className="preview-card__title">
                    Guild to Nitrado service mapping
                  </div>
                  <p className="preview-card__body">
                    Connect your Discord guild to a hosted DayZ service.
                  </p>
                </div>

                <div className="preview-card">
                  <div className="preview-card__label">
                    LOG PARSING: KILLFEED, ALARMS, PLAYER STATS
                  </div>
                  <div className="preview-card__title">
                    Free killfeed, alarms, and player stats
                  </div>
                  <p className="preview-card__body">
                    Essential log parsing features give you access to killfeeds,
                    area alarms and UAVs, admin alerts and more.
                  </p>
                </div>

                <div className="preview-card">
                  <div className="preview-card__label">ANALYTICS</div>
                  <div className="preview-card__title">
                    Upgrade for in depth server analytics
                  </div>
                  <p className="preview-card__body">
                    Gain access to essential and informative analytics on
                    players, retention, playtime, and more.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-section" id="features">
          <div className="section-heading">
            <div className="eyebrow">FEATURES</div>
            <h2 className="section-heading__title">
              What you can manage with DayZ Reforger.
            </h2>
            <p className="section-heading__body">
              This service brings you killfeeds, alarms, player statistics,
              admin logs and alerts with ease of configuratoin.
            </p>
          </div>

          <div className="feature-grid">
            {featureItems.map((feature) => (
              <article key={feature.title} className="feature-card">
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__body">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="marketing-section" id="practical">
          <div className="section-heading">
            <div className="eyebrow">WHY IT HELPS</div>
            <h2 className="section-heading__title">
              Built around practical server management.
            </h2>
            <p className="section-heading__body">
              DayZ Reforger is meant to reduce the messy parts of server setup
              and give admins a more direct way to manage the core pieces of the
              service.
            </p>
          </div>

          <div className="feature-grid">
            {practicalItems.map((item) => (
              <article key={item.title} className="feature-card">
                <h3 className="feature-card__title">{item.title}</h3>
                <p className="feature-card__body">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="marketing-section">
          <div className="section-heading">
            <div className="eyebrow">QUICK START</div>
            <h2 className="section-heading__title">
              Get from sign-in to a linked server quickly.
            </h2>
          </div>

          <div className="setup-grid">
            {quickFlow.map((step) => (
              <article key={step.number} className="setup-card">
                <div className="setup-card__number">{step.number}</div>
                <h3 className="setup-card__title">{step.title}</h3>
                <p className="setup-card__body">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="marketing-section marketing-section--cta">
          <div className="cta-panel">
            <div className="cta-panel__content">
              <div className="eyebrow">READY TO START?</div>
              <h2 className="cta-panel__title">
                Link your Discord guild, connect your Nitrado service, and
                manage it from one panel.
              </h2>
            </div>

            <div className="cta-panel__actions">
              <Link
                to={getDiscordLoginUrl()}
                className="button-link button-link--primary"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
