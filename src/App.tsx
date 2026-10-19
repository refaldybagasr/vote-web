import { Navigate, Route, Routes, useNavigate } from 'react-router';
import { useAuth } from './auth/AuthProvider';
import { RequireRole } from './auth/RequireRole';
import LoginPage from './pages/LoginPage';

function Placeholder({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex items-center justify-between p-8">
      <h1 className="text-xl font-semibold">{title}</h1>
      <button onClick={handleLogout} className="text-sm underline">
        Log out{user ? ` (${user.username})` : ''}
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireRole role="user" />}>
        <Route path="/vote" element={<Placeholder title="Vote" />} />
      </Route>
      <Route element={<RequireRole role="admin" />}>
        <Route path="/admin/users" element={<Placeholder title="Admin · Users" />} />
        <Route path="/admin/results" element={<Placeholder title="Admin · Results" />} />
      </Route>
    </Routes>
  );
}
