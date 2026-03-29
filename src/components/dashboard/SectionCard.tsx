import { PropsWithChildren } from 'react';

export function SectionCard({ children, title, description }: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <section className="section-card">
      <header className="section-card__header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}
