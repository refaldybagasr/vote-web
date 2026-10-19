import { useEffect, useState, type FormEvent } from 'react';
import { getResults } from '../api/results';
import { createCandidate } from '../api/votes';
import { getErrorMessage } from '../api/error-message';
import type { ResultsResponse } from '../api/types';

const POLL_INTERVAL_MS = 5000;

export default function AdminResultsPage() {
  const [data, setData] = useState<ResultsResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCandidateName, setNewCandidateName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

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

  async function handleAddCandidate(event: FormEvent) {
    event.preventDefault();
    setAddError(null);
    setAdding(true);
    try {
      await createCandidate(newCandidateName);
      setNewCandidateName('');
      const result = await getResults();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setAddError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-semibold">Admin · Results</h1>

      <form onSubmit={(event) => void handleAddCandidate(event)} className="mt-4 flex items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Add candidate
          <input
            value={newCandidateName}
            onChange={(event) => setNewCandidateName(event.target.value)}
            placeholder="Candidate name"
            className="rounded border px-3 py-2"
            required
          />
        </label>
        <button
          type="submit"
          disabled={adding}
          className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {adding ? 'Adding…' : 'Add'}
        </button>
      </form>
      {addError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {addError}
        </p>
      )}

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
