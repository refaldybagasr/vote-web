import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { createUser, deleteUser, listUsers, updateUser } from '../api/users';
import { getErrorMessage } from '../api/error-message';
import type { AdminUser, UserRole } from '../api/types';

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({ username: '', password: '', role: 'user' as UserRole });
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function refresh() {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await listUsers(page, PAGE_SIZE);
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const result = await listUsers(page, PAGE_SIZE);
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
      } catch (err) {
        if (!cancelled) setLoadError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      await createUser(createForm);
      setCreateForm({ username: '', password: '', role: 'user' });
      if (page === 1) {
        await refresh();
      } else {
        setPage(1);
      }
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold">Admin · Users</h1>

      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap items-end gap-3 rounded border p-4">
        <label className="flex flex-col gap-1 text-sm">
          Username
          <input
            className="rounded border px-2 py-1"
            value={createForm.username}
            onChange={(event) => setCreateForm((form) => ({ ...form, username: event.target.value }))}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            className="rounded border px-2 py-1"
            value={createForm.password}
            onChange={(event) => setCreateForm((form) => ({ ...form, password: event.target.value }))}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Role
          <select
            className="rounded border px-2 py-1"
            value={createForm.role}
            onChange={(event) => setCreateForm((form) => ({ ...form, role: event.target.value as UserRole }))}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={creating}
          className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {creating ? 'Creating…' : 'Create user'}
        </button>
        {createError && (
          <p role="alert" className="w-full text-sm text-red-600">
            {createError}
          </p>
        )}
      </form>

      {loadError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="mt-6">Loading…</p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Username</th>
              <th>Role</th>
              <th>Active</th>
              <th>Has voted</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <UserRow
                key={item.id}
                item={item}
                isSelf={item.id === currentUser?.id}
                onChanged={() => void refresh()}
              />
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 flex items-center gap-3 text-sm">
        <button
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page <= 1}
          className="rounded border px-2 py-1 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page >= totalPages}
          className="rounded border px-2 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function UserRow({ item, isSelf, onChanged }: { item: AdminUser; isSelf: boolean; onChanged: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function runUpdate(changes: Partial<{ role: UserRole; isActive: boolean; password: string }>) {
    setError(null);
    setBusy(true);
    try {
      await updateUser(item.id, { version: item.version, ...changes });
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRoleChange(event: ChangeEvent<HTMLSelectElement>) {
    await runUpdate({ role: event.target.value as UserRole });
  }

  async function handleToggleActive() {
    await runUpdate({ isActive: !item.isActive });
  }

  async function handleResetPassword(event: FormEvent) {
    event.preventDefault();
    await runUpdate({ password: newPassword });
    setNewPassword('');
    setResettingPassword(false);
  }

  async function handleDelete() {
    setError(null);
    setBusy(true);
    try {
      await deleteUser(item.id);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
      setConfirmingDelete(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <tr className="border-b">
        <td className="py-2">
          {item.username}
          {isSelf ? ' (you)' : ''}
        </td>
        <td>
          <select
            value={item.role}
            disabled={busy}
            onChange={(event) => void handleRoleChange(event)}
            aria-label={`Role for ${item.username}`}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </td>
        <td>
          <button onClick={() => void handleToggleActive()} disabled={busy} className="underline">
            {item.isActive ? 'Disable' : 'Enable'}
          </button>
        </td>
        <td>{item.hasVoted ? 'Yes' : 'No'}</td>
        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
        <td className="flex gap-2">
          <button onClick={() => setResettingPassword((value) => !value)} disabled={busy} className="underline">
            Reset password
          </button>
          {!confirmingDelete ? (
            <button onClick={() => setConfirmingDelete(true)} disabled={busy} className="text-red-600 underline">
              Delete
            </button>
          ) : (
            <span className="flex gap-2">
              <button onClick={() => void handleDelete()} disabled={busy} className="text-red-600 underline">
                Confirm delete
              </button>
              <button onClick={() => setConfirmingDelete(false)} disabled={busy} className="underline">
                Cancel
              </button>
            </span>
          )}
        </td>
      </tr>
      {resettingPassword && (
        <tr>
          <td colSpan={6}>
            <form onSubmit={(event) => void handleResetPassword(event)} className="flex items-center gap-2 py-2">
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="New password"
                aria-label={`New password for ${item.username}`}
                className="rounded border px-2 py-1 text-sm"
                required
              />
              <button type="submit" disabled={busy} className="rounded bg-slate-900 px-2 py-1 text-sm text-white">
                Save
              </button>
              <button type="button" onClick={() => setResettingPassword(false)} className="text-sm underline">
                Cancel
              </button>
            </form>
          </td>
        </tr>
      )}
      {error && (
        <tr>
          <td colSpan={6}>
            <p role="alert" className="py-1 text-sm text-red-600">
              {error}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}
