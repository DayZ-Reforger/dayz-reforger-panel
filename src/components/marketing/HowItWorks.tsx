const steps = [
  {
    step: '01',
    title: 'Sign in with Discord',
    body: 'Authenticate through the API and load your owned guilds into the dashboard.'
  },
  {
    step: '02',
    title: 'Link Nitrado',
    body: 'Connect your Nitrado account through the OAuth flow so services can be selected.'
  },
  {
    step: '03',
    title: 'Attach a guild to a service',
    body: 'Choose one Discord guild you own and link it to one DayZ server service.'
  },
  {
    step: '04',
    title: 'Configure and activate',
    body: 'Map channels, review readiness, adjust config values, and start the parser when ready.'
  }
];

export function HowItWorks() {
  return (
    <div className="steps-grid">
      {steps.map((item) => (
        <article key={item.step} className="step-card">
          <span className="step-card__index">{item.step}</span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  );
}
