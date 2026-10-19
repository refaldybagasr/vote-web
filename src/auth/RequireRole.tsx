import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthProvider';
import type { UserRole } from '../api/types';

export const LANDING_PATH_BY_ROLE: Record<UserRole, string> = {
  admin: '/admin/results',
  user: '/vote',
};

export function RequireRole({ role }: { role: UserRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== role) {
    return <Navigate to={LANDING_PATH_BY_ROLE[user.role]} replace />;
  }
  return <Outlet />;
}
