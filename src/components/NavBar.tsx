import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import type { UserRole } from '../api/types';

const NAV_LINKS_BY_ROLE: Record<UserRole, { to: string; label: string }[]> = {
  user: [{ to: '/vote', label: 'Vote' }],
  admin: [
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/results', label: 'Results' },
  ],
};

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <nav className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex gap-4 text-sm">
        {NAV_LINKS_BY_ROLE[user.role].map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'font-semibold underline' : 'text-gray-600 hover:underline')}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-500">{user.username}</span>
        <button onClick={() => void handleLogout()} className="underline">
          Log out
        </button>
      </div>
    </nav>
  );
}
