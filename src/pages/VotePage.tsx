import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { castVote, getMyVoteStatus, listCandidates } from '../api/votes';
import { getErrorMessage } from '../api/error-message';
import type { Candidate, Vote } from '../api/types';

const MAX_NAME_LENGTH = 50;

type Selection = { kind: 'candidate'; id: string } | { kind: 'other' } | null;

function PageHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="mx-auto flex max-w-sm items-center justify-between px-6 pt-6">
      <span className="text-sm text-gray-500">{user?.username}</span>
      <button onClick={handleLogout} className="text-sm underline">
        Log out
      </button>
    </div>
  );
}

export default function VotePage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [vote, setVote] = useState<Vote | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selection, setSelection] = useState<Selection>(null);
  const [otherName, setOtherName] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [status, candidateList] = await Promise.all([getMyVoteStatus(), listCandidates()]);
        if (cancelled) return;
        setVote(status.vote);
        setCandidates(candidateList);
      } catch (err) {
        if (!cancelled) setLoadError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    if (!selection) {
      setSubmitError('Please choose a candidate or enter a name.');
      return;
    }

    const trimmedName = otherName.trim();
    if (selection.kind === 'other') {
      if (trimmedName.length === 0) {
        setSubmitError('Please enter a name.');
        return;
      }
      if (trimmedName.length > MAX_NAME_LENGTH) {
        setSubmitError(`Name must be at most ${MAX_NAME_LENGTH} characters.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const result = await castVote(
        selection.kind === 'candidate' ? { candidateId: selection.id } : { name: trimmedName },
      );
      setVote(result);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader />
        <div className="p-8">Loading…</div>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <PageHeader />
        <div className="p-8">
          <p role="alert" className="text-sm text-red-600">
            {loadError}
          </p>
        </div>
      </>
    );
  }

  if (vote) {
    return (
      <>
        <PageHeader />
        <div className="mx-auto mt-16 max-w-sm p-6">
          <h1 className="text-xl font-semibold">Thanks for voting!</h1>
          <p className="mt-2 text-gray-700">
            You voted for <span className="font-medium">{vote.candidateName}</span>.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader />
      <form onSubmit={handleSubmit} className="mx-auto mt-16 flex max-w-sm flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold">Cast your vote</h1>
        {submitError && (
          <p role="alert" className="text-sm text-red-600">
            {submitError}
          </p>
        )}

        <fieldset className="flex flex-col gap-2">
          {candidates.map((candidate) => (
            <label key={candidate.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="candidate"
                checked={selection?.kind === 'candidate' && selection.id === candidate.id}
                onChange={() => setSelection({ kind: 'candidate', id: candidate.id })}
              />
              {candidate.name}
            </label>
          ))}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="candidate"
              checked={selection?.kind === 'other'}
              onChange={() => setSelection({ kind: 'other' })}
            />
            Other name
          </label>
          {selection?.kind === 'other' && (
            <input
              type="text"
              value={otherName}
              onChange={(event) => setOtherName(event.target.value)}
              maxLength={MAX_NAME_LENGTH}
              placeholder="Candidate name"
              className="rounded border px-3 py-2"
              autoFocus
            />
          )}
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit vote'}
        </button>
      </form>
    </>
  );
}
