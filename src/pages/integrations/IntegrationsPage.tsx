import { useEffect, useState } from 'react';
import { api, getDiscordLoginUrl, getNitradoLoginUrl } from '../../lib/api';
import type { NitradoServiceSummary } from '../../lib/types';
import { useAuth } from '../../app/providers/AuthProvider';
import { SectionCard } from '../../components/dashboard/SectionCard';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { tokenStore } from '../../lib/tokenStore';

export function IntegrationsPage() {
  const { user, refreshUser } = useAuth();
  const [services, setServices] = useState<NitradoServiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unlinking, setUnlinking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const response = await api.getNitradoServers();
        if (!cancelled) {
          setServices(response.services);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load integrations');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleUnlinkNitrado() {
    setUnlinking(true);
    setMessage('');
    setError('');

    try {
      const response = await api.unlinkNitrado();
      setMessage(response.message ?? 'Nitrado disconnected');
      await refreshUser();
      const servicesResponse = await api.getNitradoServers();
      setServices(servicesResponse.services);
    } catch (unlinkError) {
      setError(unlinkError instanceof Error ? unlinkError.message : 'Failed to unlink Nitrado');
    } finally {
      setUnlinking(false);
    }
  }

  const token = tokenStore.get();

  return (
    <div className="page-grid">
      <SectionCard title="Integrations" description="Keep Discord and Nitrado connection state visible in one place.">
        <div className="integration-grid">
          <div className="integration-card">
            <div className="eyebrow">Discord</div>
            <h3>Authenticated through OAuth</h3>
            <p>Use the API login endpoint as the primary entry point for the panel.</p>
            <div className="stack-inline">
              <StatusBadge tone="success">Connected</StatusBadge>
              <ButtonLink href={getDiscordLoginUrl()}>Re-authenticate</ButtonLink>
            </div>
          </div>

          <div className="integration-card">
            <div className="eyebrow">Nitrado</div>
            <h3>{user?.nitrado ? 'Nitrado linked' : 'Link service account'}</h3>
            <p>
              {user?.nitrado
                ? 'Your Nitrado account is linked. You can disconnect it only after every linked guild has been unlinked.'
                : 'Kick off the Nitrado OAuth flow using the stored JWT from the Discord sign-in step.'}
            </p>
            <div className="stack-inline">
              {user?.nitrado ? <StatusBadge tone="success">Connected</StatusBadge> : null}
              {token ? (
                <ButtonLink href={getNitradoLoginUrl(token)}>
                  {user?.nitrado ? 'Relink Nitrado' : 'Link Nitrado'}
                </ButtonLink>
              ) : null}
              {user?.nitrado ? (
                <button className="button button--secondary" onClick={handleUnlinkNitrado} disabled={unlinking}>
                  {unlinking ? 'Disconnecting...' : 'Disconnect'}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {message ? <p className="feedback feedback--success">{message}</p> : null}
        {error ? <p className="feedback feedback--danger">{error}</p> : null}
      </SectionCard>

      <SectionCard title="Nitrado services" description="Service inventory returned directly from the API.">
        {loading ? (
          <p className="muted-text">Loading services...</p>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <p>No Nitrado services found yet.</p>
          </div>
        ) : (
          <div className="stack-list">
            {services.map((service) => (
              <div key={service.id} className="list-row">
                <div>
                  <strong>{service.display_name}</strong>
                  <div className="muted-text">
                    {service.mission || 'Mission unavailable'} · {service.nitrado_status || 'Status unavailable'}
                  </div>
                </div>
                <div className="list-row__actions">
                  <StatusBadge tone={service.linked_guild_id ? 'success' : 'neutral'}>
                    {service.linked_guild_id ? 'Linked' : 'Available'}
                  </StatusBadge>
                  {service.linked_guild_name ? <span className="muted-text">{service.linked_guild_name}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
