import { Navigate, Route, Routes } from 'react-router';
import { RequireRole } from './auth/RequireRole';
import AdminResultsPage from './pages/AdminResultsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import LoginPage from './pages/LoginPage';
import VotePage from './pages/VotePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireRole role="user" />}>
        <Route path="/vote" element={<VotePage />} />
      </Route>
      <Route element={<RequireRole role="admin" />}>
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/results" element={<AdminResultsPage />} />
      </Route>
    </Routes>
  );
}
