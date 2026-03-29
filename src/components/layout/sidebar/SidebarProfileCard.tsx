import "../../..//styles/layout/sidebar-profile-card.css";

type SidebarProfileCardProps = {
  username: string;
  email: string;
  avatarUrl?: string;
  planName: string;
  usedInstances: number;
  maxInstances: number;
  onLogout: () => void;
};

function PlanIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="sidebar-profile-card__icon"
    >
      <rect
        x="4.5"
        y="6.5"
        width="15"
        height="11"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M8 12h8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InstancesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="sidebar-profile-card__icon"
    >
      <rect
        x="5"
        y="6"
        width="12"
        height="4.5"
        rx="1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <rect
        x="7"
        y="13.5"
        width="12"
        height="4.5"
        rx="1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="sidebar-profile-card__logout-icon"
    >
      <path
        d="M10 17H6.5A2.5 2.5 0 0 1 4 14.5v-5A2.5 2.5 0 0 1 6.5 7H10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 15.5 17 12l-4-3.5M17 12H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SidebarProfileCard({
  username,
  email,
  avatarUrl,
  planName,
  usedInstances,
  maxInstances,
  onLogout,
}: SidebarProfileCardProps) {
  return (
    <section className="sidebar-profile-card">
      <div className="sidebar-profile-card__identity">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="sidebar-profile-card__avatar"
          />
        ) : (
          <div className="sidebar-profile-card__avatar sidebar-profile-card__avatar--fallback">
            {username.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="sidebar-profile-card__identity-copy">
          <div className="sidebar-profile-card__name">{username}</div>

          <div className="sidebar-profile-card__email">
            <span>{email}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-profile-card__meta">
        <div className="sidebar-profile-card__row">
          <div className="sidebar-profile-card__label">
            <PlanIcon />
            <span>Plan</span>
          </div>

          <div className="sidebar-profile-card__pill">{planName}</div>
        </div>

        <div className="sidebar-profile-card__row">
          <div className="sidebar-profile-card__label">
            <InstancesIcon />
            <span>Instances</span>
          </div>

          <div className="sidebar-profile-card__value pad__value">
            {usedInstances}/{maxInstances}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="sidebar-profile-card__logout"
        onClick={onLogout}
      >
        <LogoutIcon />
        <span>Sign out</span>
      </button>
    </section>
  );
}
