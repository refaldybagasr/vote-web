import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { LANDING_PATH_BY_ROLE } from '../auth/RequireRole';
import { getErrorMessage } from '../api/error-message';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={LANDING_PATH_BY_ROLE[user.role]} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const loggedInUser = await login(username, password);
      navigate(LANDING_PATH_BY_ROLE[loggedInUser.role], { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-24 flex max-w-sm flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Log in</h1>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        Username
        <input
          className="rounded border px-3 py-2"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          type="password"
          className="rounded border px-3 py-2"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
      >
        {submitting ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}
