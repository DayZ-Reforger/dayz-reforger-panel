export function BetaBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`beta-badge${compact ? " beta-badge--compact" : ""}`}>
      Beta
    </span>
  );
}
