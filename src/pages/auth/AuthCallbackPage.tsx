import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenStore } from '../../lib/tokenStore';
import { useAuth } from '../../app/providers/AuthProvider';

export function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('Processing the API callback and loading your account.');

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      const token = params.get('token');
      if (!token) {
        navigate('/', { replace: true });
        return;
      }

      tokenStore.set(token);
      setStatus('Token received. Loading your dashboard session...');

      try {
        await refreshUser();
        if (!cancelled) {
          navigate('/dashboard', { replace: true });
        }
      } catch {
        tokenStore.clear();
        if (!cancelled) {
          setStatus('Sign-in failed. Returning to the landing page...');
          navigate('/', { replace: true });
        }
      }
    }

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [navigate, params, refreshUser]);

  return (
    <div className="fullscreen-state">
      <div className="fullscreen-state__card">
        <div className="eyebrow">Authentication</div>
        <h1>Signing you in...</h1>
        <p>{status}</p>
      </div>
    </div>
  );
}
