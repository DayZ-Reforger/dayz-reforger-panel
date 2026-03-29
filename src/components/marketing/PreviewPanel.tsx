import { StatusBadge } from '../ui/StatusBadge';

export function PreviewPanel() {
  return (
    <aside className="preview-panel">
      <div className="preview-panel__header">
        <div>
          <div className="preview-panel__kicker">Workspace preview</div>
          <h3>Operations at a glance</h3>
        </div>
        <StatusBadge tone="success">Ready</StatusBadge>
      </div>

      <div className="preview-panel__stats">
        <div className="stat-tile">
          <span className="stat-tile__label">Guilds</span>
          <strong>4</strong>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__label">Linked services</span>
          <strong>2</strong>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__label">Parser state</span>
          <strong>Active</strong>
        </div>
      </div>

      <div className="preview-panel__block">
        <div className="row-between">
          <span>Discord</span>
          <StatusBadge tone="neutral">Connected</StatusBadge>
        </div>
        <div className="row-between">
          <span>Nitrado</span>
          <StatusBadge tone="warning">Pending link</StatusBadge>
        </div>
        <div className="row-between">
          <span>Channels</span>
          <StatusBadge tone="success">Configured</StatusBadge>
        </div>
      </div>

      <div className="preview-panel__list">
        <div className="preview-list-row">
          <span># killfeed</span>
          <span>Assigned</span>
        </div>
        <div className="preview-list-row">
          <span># connection-logs</span>
          <span>Assigned</span>
        </div>
        <div className="preview-list-row">
          <span># admin-commands</span>
          <span>2 allowed</span>
        </div>
      </div>
    </aside>
  );
}
