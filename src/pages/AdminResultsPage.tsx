import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { getResults } from '../api/results';
import { getErrorMessage } from '../api/error-message';
import type { ResultsResponse } from '../api/types';

const POLL_INTERVAL_MS = 5000;

export default function AdminResultsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<ResultsResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;

    async function fetchResults() {
      try {
        const result = await getResults();
        if (cancelled) return;
        setData(result);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function startPolling() {
      if (intervalId !== undefined) return;
      intervalId = window.setInterval(() => {
        void fetchResults();
      }, POLL_INTERVAL_MS);
    }

    function stopPolling() {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void fetchResults();
        startPolling();
      } else {
        stopPolling();
      }
    }

    void fetchResults();
    if (document.visibilityState === 'visible') {
      startPolling();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin · Results</h1>
        <button onClick={() => void handleLogout()} className="text-sm underline">
          Log out ({user?.username})
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6">Loading…</p>
      ) : (
        data && (
          <div className="mt-6">
            <p className="text-sm text-gray-600">Total votes: {data.totalVotes}</p>
            {lastUpdated && (
              <p className="text-xs text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</p>
            )}

            <div className="mt-4 flex flex-col gap-4">
              {data.results.map((result) => (
                <div key={result.candidateId}>
                  <div className="flex justify-between text-sm">
                    <span>{result.name}</span>
                    <span>
                      {result.votes} votes ({result.percentage}%)
                    </span>
                  </div>
                  <div className="mt-1 h-4 w-full rounded bg-gray-200">
                    <div
                      className="h-4 rounded bg-slate-900"
                      style={{ width: `${result.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
