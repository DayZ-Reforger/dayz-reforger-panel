const features = [
  {
    title: 'Killfeed & activity',
    description: 'Route killfeed and player activity into the right channels with cleaner visibility for admins.'
  },
  {
    title: 'Bounties & economy',
    description: 'Configure starting balance, income roles, UAV pricing, EMP pricing, and community economy rules.'
  },
  {
    title: 'Alarms & UAV controls',
    description: 'Keep operational features structured and ready for future advanced controls without cluttering the core setup.'
  },
  {
    title: 'Admin controls',
    description: 'Manage bot admin roles, excluded roles, web admin IDs, and workspace-level access cleanly.'
  },
  {
    title: 'Faction tracking',
    description: 'Configure faction armbands and supporting gameplay data in a way that feels operational, not messy.'
  },
  {
    title: 'Readiness & parser state',
    description: 'Understand what is missing before activation, then start or stop parsing with stronger status cues.'
  }
];

export function FeatureGrid() {
  return (
    <div className="feature-grid">
      {features.map((feature) => (
        <article key={feature.title} className="feature-card">
          <div className="feature-card__bar" />
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </article>
      ))}
    </div>
  );
}
